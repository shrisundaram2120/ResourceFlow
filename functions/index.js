const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const { Resend } = require("resend");
const twilio = require("twilio");
const {
  assertAdmin,
  assertManager,
  decodeRoleClaim,
  normalizeRole,
  safeIso,
  safeText,
  sanitizeClientError,
  sanitizeNotificationPayload,
  sanitizeVolunteerRecord
} = require("./src/shared");

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();
const region = process.env.FUNCTIONS_REGION || "us-central1";
const workspaceCollection = process.env.DEFAULT_WORKSPACE_COLLECTION || "resourceflow";
const workspaceId = process.env.DEFAULT_WORKSPACE_ID || "resourceflow-demo";

exports.bootstrapAdmin = onCall({ region: region }, async (request) => {
  ensureSignedIn(request);
  const email = safeText(request.auth.token.email || "", 140).toLowerCase();
  const targetEmail = safeText(process.env.BOOTSTRAP_ADMIN_EMAIL || "", 140).toLowerCase();
  const accessCode = safeText(request.data && request.data.accessCode, 120);
  if (!targetEmail || !process.env.BOOTSTRAP_ACCESS_CODE) {
    throw new HttpsError("failed-precondition", "Bootstrap admin configuration is missing on the server.");
  }
  if (email !== targetEmail) {
    throw new HttpsError("permission-denied", "This account is not allowed to self-bootstrap as admin.");
  }
  if (accessCode !== process.env.BOOTSTRAP_ACCESS_CODE) {
    throw new HttpsError("permission-denied", "Invalid bootstrap access code.");
  }

  await assignUserRole(request.auth.uid, "admin", email);
  return {
    ok: true,
    role: "admin",
    message: "Admin claims were assigned. Refresh your session in the app."
  };
});

exports.syncMyClaims = onCall({ region: region }, async (request) => {
  ensureSignedIn(request);
  const profileRef = db.collection("resourceflowUsers").doc(request.auth.uid);
  const profileSnap = await profileRef.get();
  const profile = profileSnap.exists && profileSnap.data() ? profileSnap.data() : {};
  const existingClaim = decodeRoleClaim(request.auth);
  const profileRole = normalizeRole(profile.role || "volunteer");

  if (existingClaim !== profileRole && profileRole === "volunteer") {
    await auth.setCustomUserClaims(request.auth.uid, { role: profileRole });
  }

  return {
    ok: true,
    role: profileRole,
    claimedRole: profileRole
  };
});

exports.setUserRole = onCall({ region: region }, async (request) => {
  ensureAdmin(request);
  const requestedRole = normalizeRole(request.data && request.data.role);
  const uid = safeText(request.data && request.data.uid, 128);
  const email = safeText(request.data && request.data.email, 140);
  const targetRecord = uid
    ? await auth.getUser(uid)
    : await auth.getUserByEmail(email);

  await assignUserRole(targetRecord.uid, requestedRole, safeText(request.auth.token.email || request.auth.uid, 140));
  return {
    ok: true,
    uid: targetRecord.uid,
    email: targetRecord.email || "",
    role: requestedRole
  };
});

exports.submitVolunteerRegistration = onCall({ region: region }, async (request) => {
  ensureSignedIn(request);
  const volunteer = sanitizeVolunteerRecord(request.data && request.data.volunteer, {
    uid: request.auth.uid,
    email: request.auth.token.email || ""
  });
  if (!volunteer.name || !volunteer.skills.length) {
    throw new HttpsError("invalid-argument", "Volunteer registration requires a name and at least one skill.");
  }

  const workspace = await loadWorkspaceState();
  const withoutOwner = (workspace.volunteers || []).filter(function (item) {
    return item.ownerUid !== request.auth.uid && item.id !== volunteer.id;
  });
  workspace.volunteers = [volunteer].concat(withoutOwner);
  workspace.activityLog = buildNextActivity(
    workspace.activityLog,
    "volunteer",
    "Volunteer registration submitted by " + (volunteer.name || "a team member") + ".",
    safeText(request.auth.token.email || request.auth.uid, 140)
  );
  await saveWorkspaceState(workspace, safeText(request.auth.token.email || request.auth.uid, 140));
  return {
    ok: true,
    volunteer: volunteer
  };
});

exports.saveWorkspaceState = onCall({ region: region }, async (request) => {
  ensureManager(request);
  const next = normalizeWorkspaceState(request.data && request.data.state);
  await saveWorkspaceState(next, safeText(request.auth.token.email || request.auth.uid, 140));
  return {
    ok: true,
    revision: next.meta.revision
  };
});

exports.generateWorkspaceAnalysis = onCall({ region: region }, async (request) => {
  ensureManager(request);
  if (!process.env.GEMINI_API_KEY) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not configured on the server.");
  }

  const workspace = await loadWorkspaceState();
  const prompt = buildWorkspacePrompt(workspace, request.data && request.data.prompt);
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(process.env.GEMINI_MODEL || "gemini-2.5-flash") +
      ":generateContent?key=" +
      encodeURIComponent(process.env.GEMINI_API_KEY),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 900
        }
      })
    }
  );

  if (!response.ok) {
    const failure = await response.text();
    logger.error("Gemini proxy failed.", { status: response.status, failure: failure });
    throw new HttpsError("internal", "Gemini proxy request failed.");
  }

  const payload = await response.json();
  const text = extractGeminiText(payload);
  return {
    ok: true,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    text: text
  };
});

exports.chatResourceFlowCopilot = onCall({ region: region }, async (request) => {
  ensureSignedIn(request);
  if (!process.env.GEMINI_API_KEY) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not configured on the server.");
  }

  const message = safeText(request.data && request.data.message, 2000);
  if (!message) {
    throw new HttpsError("invalid-argument", "A chat message is required.");
  }

  const workspace = normalizeWorkspaceState(request.data && request.data.workspace);
  const portalRole = safeText(request.data && request.data.portalRole, 40);
  const history = Array.isArray(request.data && request.data.history)
    ? request.data.history.slice(-8).map(function (entry) {
        return {
          speaker: safeText(entry && entry.speaker, 20),
          text: safeText(entry && entry.text, 1000)
        };
      })
    : [];

  const prompt = buildCopilotPrompt(workspace, portalRole, message, history);
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(process.env.GEMINI_MODEL || "gemini-2.5-flash") +
      ":generateContent?key=" +
      encodeURIComponent(process.env.GEMINI_API_KEY),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 700
        }
      })
    }
  );

  if (!response.ok) {
    const failure = await response.text();
    logger.error("Gemini copilot failed.", { status: response.status, failure: failure });
    throw new HttpsError("internal", "Gemini copilot request failed.");
  }

  const payload = await response.json();
  const text = extractGeminiText(payload);
  return {
    ok: true,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    text: text
  };
});

exports.computeSecureRoute = onCall({ region: region }, async (request) => {
  ensureManager(request);
  if (!process.env.MAPS_API_KEY) {
    throw new HttpsError("failed-precondition", "MAPS_API_KEY is not configured on the server.");
  }
  const origin = safeText(request.data && request.data.origin, 180);
  const destination = safeText(request.data && request.data.destination, 180);
  if (!origin || !destination) {
    throw new HttpsError("invalid-argument", "Route requests need both origin and destination.");
  }

  const response = await fetch(
    "https://maps.googleapis.com/maps/api/directions/json?origin=" +
      encodeURIComponent(origin) +
      "&destination=" +
      encodeURIComponent(destination) +
      "&mode=driving&key=" +
      encodeURIComponent(process.env.MAPS_API_KEY)
  );
  if (!response.ok) {
    throw new HttpsError("internal", "Google Maps route request failed.");
  }
  const payload = await response.json();
  if (!payload.routes || !payload.routes.length || !payload.routes[0].legs || !payload.routes[0].legs.length) {
    throw new HttpsError("not-found", "No route could be generated for the provided locations.");
  }
  const firstRoute = payload.routes[0];
  const firstLeg = firstRoute.legs[0];
  return {
    ok: true,
    origin: firstLeg.start_address,
    destination: firstLeg.end_address,
    distanceText: firstLeg.distance ? firstLeg.distance.text : "",
    durationText: firstLeg.duration ? firstLeg.duration.text : "",
    polyline: firstRoute.overview_polyline ? firstRoute.overview_polyline.points : "",
    steps: firstLeg.steps
      ? firstLeg.steps.slice(0, 6).map(function (step) {
          return safeText(step.html_instructions || "", 220);
        })
      : []
  };
});

exports.queueNotification = onCall({ region: region }, async (request) => {
  ensureManager(request);
  const payload = sanitizeNotificationPayload({
    subject: request.data && request.data.subject,
    message: request.data && request.data.message,
    channels: request.data && request.data.channels,
    recipients: request.data && request.data.recipients,
    createdBy: safeText(request.auth.token.email || request.auth.uid, 140)
  });

  if (!payload.message || !payload.channels.length || !payload.recipients.length) {
    throw new HttpsError("invalid-argument", "Notification payload requires message, channels, and recipients.");
  }

  await db.collection("resourceflowNotifications").doc(payload.id).set(payload);
  return {
    ok: true,
    id: payload.id,
    status: payload.status
  };
});

exports.processNotificationQueue = onDocumentCreated(
  {
    region: region,
    document: "resourceflowNotifications/{notificationId}"
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      return;
    }
    const payload = sanitizeNotificationPayload(snapshot.data());
    const results = [];
    let status = "skipped";

    try {
      if (payload.channels.indexOf("email") >= 0) {
        results.push.apply(results, await sendEmails(payload));
      }
      if (payload.channels.indexOf("whatsapp") >= 0) {
        results.push.apply(results, await sendWhatsApp(payload));
      }

      if (results.some(function (item) { return item.status === "sent"; })) {
        status = results.some(function (item) { return item.status === "failed"; }) ? "partial" : "sent";
      } else if (results.some(function (item) { return item.status === "failed"; })) {
        status = "failed";
      }
    } catch (error) {
      logger.error("Notification pipeline failed.", error);
      status = "failed";
      results.push({
        channel: "system",
        status: "failed",
        reason: error && error.message ? error.message : "Unknown notification error"
      });
    }

    await snapshot.ref.set(
      {
        status: status,
        processedAt: new Date().toISOString(),
        results: results
      },
      { merge: true }
    );
    await writeAudit("notification-processed", {
      actor: safeText(payload.createdBy || "system", 140),
      targetId: snapshot.id,
      status: status,
      channels: payload.channels,
      summary: safeText((payload.subject || "Notification") + " -> " + status, 200)
    });
  }
);

exports.auditWorkspaceState = onDocumentWritten(
  {
    region: region,
    document: workspaceCollection + "/{workspaceDocId}"
  },
  async (event) => {
    const after = event.data && event.data.after ? event.data.after.data() : null;
    if (!after || !after.state) {
      return;
    }
    const workspace = normalizeWorkspaceState(after.state);
    const actor = workspace.meta && workspace.meta.updatedBy ? workspace.meta.updatedBy : "system";
    await writeAudit("workspace-sync", {
      actor: actor,
      targetId: event.params.workspaceDocId,
      revision: workspace.meta.revision,
      summary: safeText(
        "Revision " + workspace.meta.revision +
        " | requests " + workspace.requests.length +
        " | volunteers " + workspace.volunteers.length +
        " | assignments " + workspace.assignments.length,
        220
      )
    });
  }
);

exports.getAdminSnapshot = onCall({ region: region }, async (request) => {
  ensureManager(request);
  const workspaceSnap = await getWorkspaceRef().get();
  const workspace = workspaceSnap.exists && workspaceSnap.data() && workspaceSnap.data().state
    ? workspaceSnap.data().state
    : {};
  const usersSnap = await db.collection("resourceflowUsers").limit(50).get();
  const errorsSnap = await db.collection("resourceflowErrorLogs").orderBy("createdAt", "desc").limit(20).get();
  const notificationsSnap = await db.collection("resourceflowNotifications").orderBy("createdAt", "desc").limit(20).get();
  const auditsSnap = await db.collection("resourceflowAudit").orderBy("createdAt", "desc").limit(20).get();

  return {
    ok: true,
    workspace: {
      requests: Array.isArray(workspace.requests) ? workspace.requests.length : 0,
      volunteers: Array.isArray(workspace.volunteers) ? workspace.volunteers.length : 0,
      assignments: Array.isArray(workspace.assignments) ? workspace.assignments.length : 0,
      revision: workspace.meta && workspace.meta.revision ? workspace.meta.revision : 0,
      updatedBy: workspace.meta && workspace.meta.updatedBy ? workspace.meta.updatedBy : "system"
    },
    users: usersSnap.docs.map(function (doc) {
      const data = doc.data() || {};
      return {
        uid: doc.id,
        email: safeText(data.email, 140),
        displayName: safeText(data.displayName, 80),
        role: normalizeRole(data.role || "volunteer"),
        requestedRole: normalizeRole(data.requestedRole || "volunteer"),
        updatedAt: safeIso(data.updatedAt || new Date().toISOString())
      };
    }),
    errors: errorsSnap.docs.map(function (doc) {
      return Object.assign({ id: doc.id }, doc.data() || {});
    }),
    notifications: notificationsSnap.docs.map(function (doc) {
      return Object.assign({ id: doc.id }, doc.data() || {});
    }),
    audits: auditsSnap.docs.map(function (doc) {
      return Object.assign({ id: doc.id }, doc.data() || {});
    })
  };
});

exports.logClientError = onCall({ region: region }, async (request) => {
  const actor = request.auth && request.auth.token && request.auth.token.email
    ? request.auth.token.email
    : (request.auth ? request.auth.uid : "anonymous");
  const payload = sanitizeClientError(request.data, actor);
  await db.collection("resourceflowErrorLogs").doc(payload.id).set(payload);
  await writeAudit("client-error", {
    actor: actor,
    targetId: payload.id,
    severity: payload.severity,
    page: payload.page,
    summary: safeText(payload.message || "Client error", 200)
  });
  return {
    ok: true,
    id: payload.id
  };
});

function ensureSignedIn(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in to continue.");
  }
}

function ensureManager(request) {
  ensureSignedIn(request);
  if (!assertManager(request.auth)) {
    throw new HttpsError("permission-denied", "Coordinator or admin access is required.");
  }
}

function ensureAdmin(request) {
  ensureSignedIn(request);
  if (!assertAdmin(request.auth)) {
    throw new HttpsError("permission-denied", "Admin access is required.");
  }
}

async function assignUserRole(uid, role, updatedBy) {
  const normalized = normalizeRole(role);
  const userRecord = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { role: normalized });
  await db.collection("resourceflowUsers").doc(uid).set(
    {
      uid: uid,
      email: safeText(userRecord.email || "", 140),
      displayName: safeText(userRecord.displayName || "ResourceFlow User", 80),
      photoURL: safeText(userRecord.photoURL || "", 300),
      role: normalized,
      requestedRole: normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: safeText(updatedBy, 140)
    },
    { merge: true }
  );
  await writeAudit("role-change", {
    actor: safeText(updatedBy, 140),
    targetUid: uid,
    role: normalized,
    summary: safeText("Role updated to " + normalized + " for " + (userRecord.email || uid), 200)
  });
}

function getWorkspaceRef() {
  return db.collection(workspaceCollection).doc(workspaceId);
}

async function loadWorkspaceState() {
  const snapshot = await getWorkspaceRef().get();
  if (!snapshot.exists || !snapshot.data() || !snapshot.data().state) {
    return {
      requests: [],
      volunteers: [],
      assignments: [],
      artifacts: [],
      activityLog: [],
      history: [],
      meta: {
        revision: 0,
        updatedBy: "system",
        updatedAt: new Date().toISOString()
      },
      lastUpdated: new Date().toISOString()
    };
  }
  return normalizeWorkspaceState(snapshot.data().state);
}

function normalizeWorkspaceState(input) {
  const next = input && typeof input === "object" ? input : {};
  return {
    requests: Array.isArray(next.requests) ? next.requests : [],
    volunteers: Array.isArray(next.volunteers) ? next.volunteers : [],
    assignments: Array.isArray(next.assignments) ? next.assignments : [],
    donations: Array.isArray(next.donations) ? next.donations : [],
    artifacts: Array.isArray(next.artifacts) ? next.artifacts : [],
    activityLog: Array.isArray(next.activityLog) ? next.activityLog.slice(0, 60) : [],
    history: Array.isArray(next.history) ? next.history.slice(0, 30) : [],
    meta: next.meta && typeof next.meta === "object"
      ? {
          revision: Number(next.meta.revision || 0),
          updatedBy: safeText(next.meta.updatedBy || "system", 140),
          updatedAt: safeIso(next.meta.updatedAt || new Date().toISOString())
        }
      : {
          revision: 0,
          updatedBy: "system",
          updatedAt: new Date().toISOString()
        },
    lastUpdated: safeIso(next.lastUpdated || new Date().toISOString())
  };
}

async function saveWorkspaceState(state, actor) {
  const next = normalizeWorkspaceState(state);
  const now = new Date().toISOString();
  next.meta.revision = Number(next.meta.revision || 0) + 1;
  next.meta.updatedBy = safeText(actor, 140);
  next.meta.updatedAt = now;
  next.lastUpdated = now;
  next.history = [
    {
      id: "hist-" + next.meta.revision,
      at: now,
      revision: next.meta.revision,
      requests: next.requests.length,
      volunteers: next.volunteers.length,
      assignments: next.assignments.length,
      coverage: next.requests.length ? Math.round((new Set(next.assignments.map(function (item) { return item.requestId; })).size / next.requests.length) * 100) : 0,
      criticalFill: 0
    }
  ].concat(next.history || []).slice(0, 30);

  await getWorkspaceRef().set(
    {
      state: next,
      updatedAt: now
    },
    { merge: true }
  );
}

function buildNextActivity(items, type, message, actor) {
  const current = Array.isArray(items) ? items.slice(0, 59) : [];
  return [
    {
      id: "act-" + Date.now(),
      type: safeText(type, 24),
      actor: safeText(actor, 140),
      at: new Date().toISOString(),
      message: safeText(message, 240)
    }
  ].concat(current);
}

function buildWorkspacePrompt(workspace, requestedPrompt) {
  if (requestedPrompt) {
    return safeText(requestedPrompt, 4000);
  }
  return [
    "You are an operations strategist for ResourceFlow.",
    "Return: top actions, risks, impact summary, and admin recommendations.",
    "",
    "Requests: " + (workspace.requests || []).length,
    "Volunteers: " + (workspace.volunteers || []).length,
    "Assignments: " + (workspace.assignments || []).length,
    "Artifacts: " + (workspace.artifacts || []).length,
    "",
    "Recent requests:",
    (workspace.requests || []).slice(0, 5).map(function (item) {
      return "- " + safeText(item.title, 120) + " | " + safeText(item.zone, 40) + " | urgency " + Number(item.urgency || 0);
    }).join("\n"),
    "",
    "Recent volunteers:",
    (workspace.volunteers || []).slice(0, 5).map(function (item) {
      return "- " + safeText(item.name, 80) + " | " + safeText(item.zone, 40) + " | skills " + (Array.isArray(item.skills) ? item.skills.join(", ") : "");
    }).join("\n")
  ].join("\n");
}

function buildCopilotPrompt(workspace, portalRole, message, history) {
  const safeHistory = Array.isArray(history) ? history : [];
  return [
    "You are ResourceFlow Copilot, an NGO disaster-response chatbot inside a coordination platform.",
    "Answer briefly, clearly, and operationally.",
    "Use only the workspace data provided. If data is missing, say so directly.",
    "Tailor the response for the active portal role: " + safeText(portalRole || "user", 40) + ".",
    safeHistory.length
      ? "Recent conversation:\n" + safeHistory.map(function (entry) {
          return (entry.speaker === "assistant" ? "Assistant" : "User") + ": " + safeText(entry.text, 1000);
        }).join("\n")
      : "",
    "Workspace snapshot:\n" + JSON.stringify({
      requests: (workspace.requests || []).slice(0, 6),
      volunteers: (workspace.volunteers || []).slice(0, 6),
      assignments: (workspace.assignments || []).slice(0, 6),
      donations: (workspace.donations || []).slice(0, 6),
      artifacts: (workspace.artifacts || []).slice(0, 6),
      history: (workspace.history || []).slice(0, 6),
      meta: workspace.meta || {}
    }, null, 2),
    "User question: " + safeText(message, 2000),
    "Answer in this structure:\n1. Recommendation\n2. Why it matters now\n3. Next action"
  ].filter(Boolean).join("\n\n");
}

function extractGeminiText(payload) {
  if (!payload || !Array.isArray(payload.candidates) || !payload.candidates.length) {
    return "";
  }
  const candidate = payload.candidates[0] || {};
  const parts = candidate.content && Array.isArray(candidate.content.parts) ? candidate.content.parts : [];
  return parts.map(function (item) {
    return item && item.text ? item.text : "";
  }).join("\n").trim();
}

async function writeAudit(type, detail) {
  const safeDetail = detail && typeof detail === "object" ? detail : {};
  await db.collection("resourceflowAudit").add(
    Object.assign(
      {
        type: safeText(type, 40),
        actor: safeText(safeDetail.actor || "system", 140),
        createdAt: new Date().toISOString()
      },
      safeDetail
    )
  );
}

async function sendEmails(payload) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return payload.recipients
      .filter(function (item) { return item.email; })
      .map(function (item) {
        return {
          channel: "email",
          recipient: item.email,
          status: "skipped",
          reason: "Resend provider is not configured."
        };
      });
  }
  const client = new Resend(process.env.RESEND_API_KEY);
  const results = [];
  for (const recipient of payload.recipients.filter(function (item) { return item.email; })) {
    try {
      await client.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: recipient.email,
        subject: payload.subject,
        text: payload.message
      });
      results.push({
        channel: "email",
        recipient: recipient.email,
        status: "sent"
      });
    } catch (error) {
      results.push({
        channel: "email",
        recipient: recipient.email,
        status: "failed",
        reason: error && error.message ? error.message : "Email send failed"
      });
    }
  }
  return results;
}

async function sendWhatsApp(payload) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM) {
    return payload.recipients
      .filter(function (item) { return item.phone; })
      .map(function (item) {
        return {
          channel: "whatsapp",
          recipient: item.phone,
          status: "skipped",
          reason: "Twilio WhatsApp provider is not configured."
        };
      });
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const results = [];
  for (const recipient of payload.recipients.filter(function (item) { return item.phone; })) {
    try {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: normalizeWhatsAppNumber(recipient.phone),
        body: payload.subject + "\n\n" + payload.message
      });
      results.push({
        channel: "whatsapp",
        recipient: recipient.phone,
        status: "sent"
      });
    } catch (error) {
      results.push({
        channel: "whatsapp",
        recipient: recipient.phone,
        status: "failed",
        reason: error && error.message ? error.message : "WhatsApp send failed"
      });
    }
  }
  return results;
}

function normalizeWhatsAppNumber(value) {
  let digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) {
    return "whatsapp:+";
  }
  if (digits.charAt(0) !== "+") {
    digits = "+" + digits;
  }
  return "whatsapp:" + digits;
}
