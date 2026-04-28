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
const DEMO_REFRESH_MS = 10 * 60 * 1000;

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

exports.processWorkspaceLifecycle = onCall({ region: region }, async (request) => {
  ensureSignedIn(request);
  const actor = safeText(request.auth.token.email || request.auth.uid, 140);
  const incoming = normalizeWorkspaceState(request.data && (request.data.workspace || request.data.state));
  const base = incoming.requests.length || incoming.assignments.length || incoming.volunteers.length || incoming.donations.length
    ? incoming
    : await loadWorkspaceState();
  const result = processWorkspaceLifecycleState(base, {
    actor: actor,
    reason: safeText(request.data && request.data.reason, 80)
  });
  await saveWorkspaceState(result.state, actor);
  return {
    ok: true,
    changed: result.changed,
    state: result.state
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
      scenario: "none",
      label: "No demo loaded",
      summary: "Load demo data to see requests, assignments, donations, and AI matching in action.",
      requests: [],
      volunteers: [],
      assignments: [],
      donations: [],
      artifacts: [],
      activityLog: [],
      audit: [],
      outreach: [],
      systemNotice: "Choose a scenario to populate the workspace.",
      generatedAt: new Date().toISOString(),
      lastRefreshedAt: new Date().toISOString(),
      lastAutomationAt: "",
      demoCycleId: "",
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
    scenario: safeText(next.scenario || "none", 40).toLowerCase(),
    label: safeText(next.label || "No demo loaded", 120),
    summary: safeText(next.summary || "Load demo data to see requests, assignments, donations, and AI matching in action.", 280),
    requests: Array.isArray(next.requests) ? next.requests : [],
    volunteers: Array.isArray(next.volunteers) ? next.volunteers : [],
    assignments: Array.isArray(next.assignments) ? next.assignments : [],
    donations: Array.isArray(next.donations) ? next.donations : [],
    artifacts: Array.isArray(next.artifacts) ? next.artifacts : [],
    activityLog: Array.isArray(next.activityLog) ? next.activityLog.slice(0, 60) : [],
    audit: Array.isArray(next.audit) ? next.audit.slice(0, 120) : [],
    outreach: Array.isArray(next.outreach) ? next.outreach.slice(0, 40) : [],
    systemNotice: safeText(next.systemNotice || "Choose a scenario to populate the workspace.", 280),
    generatedAt: safeIso(next.generatedAt || new Date().toISOString()),
    lastRefreshedAt: safeIso(next.lastRefreshedAt || next.generatedAt || new Date().toISOString()),
    lastAutomationAt: safeText(next.lastAutomationAt || "", 80),
    demoCycleId: safeText(next.demoCycleId || "", 80),
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

function processWorkspaceLifecycleState(state, options) {
  const workspace = normalizeLifecycleWorkspace(state);
  const actor = safeText(options && options.actor || "system", 140);
  let changed = false;

  if (maybeRefreshDemoCycle(workspace, actor)) {
    changed = true;
  }
  if (applyLifecycleRequestAutomation(workspace, actor)) {
    changed = true;
  }
  if (applyLifecycleAssignmentAutomation(workspace, actor)) {
    changed = true;
  }
  if (recalculateLifecycleVolunteerProfiles(workspace)) {
    changed = true;
  }
  if (changed) {
    workspace.requests = sortLifecycleRequests(workspace.requests);
    workspace.assignments = sortLifecycleAssignments(workspace.assignments);
    workspace.donations = sortLifecycleDonations(workspace.donations);
    workspace.lastAutomationAt = new Date().toISOString();
  }
  return {
    changed: changed,
    state: workspace
  };
}

function normalizeLifecycleWorkspace(state) {
  const workspace = normalizeWorkspaceState(state);
  workspace.requests = (workspace.requests || []).map(function (item, index) {
    const source = safeText(item.source || item.origin || (workspace.scenario !== "none" ? "disaster-demo" : "live"), 40).toLowerCase();
    const priority = safeText(item.priority || "Medium", 40);
    const createdAt = safeIso(item.createdAt || item.requestedAt || new Date().toISOString());
    return Object.assign({}, item, {
      id: safeText(item.id || ("REQ-" + (index + 100)), 80),
      title: safeText(item.title || "Support request", 180),
      district: safeText(item.district || item.zone || "Unknown district", 80),
      location: safeText(item.location || item.address || item.district || "Response hub", 180),
      priority: priority,
      status: normalizeLifecycleRequestStatus(item.status || "Pending"),
      source: source === "demo" ? "disaster-demo" : source,
      origin: safeText(item.origin || (source === "live" ? "live" : "demo"), 20).toLowerCase() || "demo",
      requester: safeText(item.requester || "Community Network", 140),
      beneficiaries: Number(item.beneficiaries || 0),
      complexity: inferLifecycleComplexity(priority),
      estimatedDurationMinutes: Number(item.estimatedDurationMinutes || estimateLifecycleDuration(priority, source)),
      createdAt: createdAt,
      requestedAt: safeIso(item.requestedAt || createdAt),
      updatedAt: safeIso(item.updatedAt || createdAt),
      broadcastTo: Array.isArray(item.broadcastTo) && item.broadcastTo.length ? item.broadcastTo.slice(0, 4) : ["admin", "government"]
    });
  });
  workspace.volunteers = (workspace.volunteers || []).map(function (item, index) {
    return Object.assign({}, item, {
      id: safeText(item.id || ("VOL-" + (index + 1)), 80),
      name: safeText(item.name || "Volunteer", 140),
      district: safeText(item.district || item.zone || item.location || "Unknown district", 80),
      location: safeText(item.location || item.district || "Response hub", 180),
      skills: normalizeLifecycleSkills(item.skills),
      availability: safeText(item.availability || item.activityStatus || "Available", 40),
      activityStatus: safeText(item.activityStatus || item.availability || "available", 40),
      ngo: safeText(item.ngo || item.ngoGroup || "Relief Network", 120),
      contact: safeText(item.contact || item.email || item.phone || "", 180),
      origin: safeText(item.origin || "demo", 20).toLowerCase() || "demo",
      pointsEarned: Number(item.pointsEarned || 0),
      completedTasks: Number(item.completedTasks || 0),
      reliability: Number(item.reliability || 72),
      attendanceDays: Number(item.attendanceDays || 0)
    });
  });
  workspace.assignments = (workspace.assignments || []).map(function (item, index) {
    const createdAt = safeIso(item.createdAt || item.assignedAt || new Date().toISOString());
    return Object.assign({}, item, {
      id: safeText(item.id || ("ASG-" + (index + 300)), 80),
      requestId: safeText(item.requestId, 80),
      title: safeText(item.title || "Assignment", 180),
      volunteer: safeText(item.volunteer, 140),
      district: safeText(item.district || "Unknown district", 80),
      location: safeText(item.location || item.district || "Response hub", 180),
      status: normalizeLifecycleAssignmentStatus(item.status || "Accepted"),
      createdAt: createdAt,
      updatedAt: safeIso(item.updatedAt || createdAt),
      acceptedAt: safeText(item.acceptedAt || createdAt, 80),
      startedAt: safeText(item.startedAt || "", 80),
      completedAt: safeText(item.completedAt || "", 80),
      estimatedDurationMinutes: Number(item.estimatedDurationMinutes || 15),
      shiftCount: Number(item.shiftCount || 0),
      shifted: Boolean(item.shifted),
      autoManaged: Boolean(item.autoManaged),
      points: Number(item.points || 0),
      pointsAwarded: Boolean(item.pointsAwarded),
      origin: safeText(item.origin || "demo", 20).toLowerCase() || "demo",
      volunteerOrigin: safeText(item.volunteerOrigin || "demo", 20).toLowerCase() || "demo"
    });
  });
  workspace.donations = (workspace.donations || []).map(function (item, index) {
    return Object.assign({}, item, {
      id: safeText(item.id || ("DON-" + (index + 1)), 80),
      donor: safeText(item.donor || item.name || "Donation source", 140),
      kind: safeText(item.kind || item.itemType || "money", 40),
      status: safeText(item.status || "Submitted", 40),
      createdAt: safeIso(item.createdAt || new Date().toISOString()),
      updatedAt: safeIso(item.updatedAt || item.createdAt || new Date().toISOString()),
      origin: safeText(item.origin || (workspace.scenario !== "none" ? "demo" : "live"), 20).toLowerCase() || "demo"
    });
  });
  workspace.audit = Array.isArray(workspace.audit) ? workspace.audit.slice(0, 120).map(function (item) { return safeText(item, 240); }) : [];
  workspace.systemNotice = safeText(workspace.systemNotice || "Choose a scenario to populate the workspace.", 280);
  return workspace;
}

function maybeRefreshDemoCycle(workspace, actor) {
  if (safeText(workspace.scenario, 40).toLowerCase() === "none") {
    return false;
  }
  const generatedAt = Date.parse(workspace.generatedAt || workspace.lastRefreshedAt || 0);
  if (!generatedAt || (Date.now() - generatedAt) < DEMO_REFRESH_MS) {
    return false;
  }
  const cycleStamp = new Date().toISOString();
  workspace.demoCycleId = "demo-" + Date.now();
  workspace.generatedAt = cycleStamp;
  workspace.lastRefreshedAt = cycleStamp;
  workspace.requests = workspace.requests
    .filter(function (item) { return safeText(item.origin, 20).toLowerCase() !== "demo"; })
    .concat(randomizeDemoRequests(workspace.scenario, workspace.demoCycleId));
  workspace.assignments = workspace.assignments.filter(function (item) {
    return safeText(item.origin, 20).toLowerCase() !== "demo" && safeText(item.origin, 20).toLowerCase() !== "live-support";
  });
  workspace.donations = workspace.donations
    .filter(function (item) { return safeText(item.origin, 20).toLowerCase() !== "demo"; })
    .concat(randomizeDemoDonations(workspace.scenario, workspace.demoCycleId));
  workspace.systemNotice = safeText(workspace.label || "Demo workspace", 120) + " auto-refreshed with a new 10-minute demo cycle.";
  workspace.audit.unshift("AI refreshed the demo workspace for " + safeText(workspace.label || workspace.scenario, 120) + ".");
  workspace.activityLog = buildNextActivity(workspace.activityLog, "automation", "AI refreshed the demo workspace with new randomized entries.", actor);
  return true;
}

function applyLifecycleRequestAutomation(workspace, actor) {
  let changed = false;
  workspace.requests = sortLifecycleRequests(workspace.requests || []);
  workspace.requests.forEach(function (request) {
    if (!request.broadcastedAt && (request.source === "live" || request.source === "disaster-demo")) {
      request.status = "Pending";
      request.broadcastedAt = new Date().toISOString();
      request.updatedAt = request.broadcastedAt;
      workspace.audit.unshift("AI logged " + request.title + " and broadcasted a Pending status to Admin and Government.");
      workspace.activityLog = buildNextActivity(workspace.activityLog, "request", request.title + " broadcasted as Pending to Admin and Government.", actor);
      workspace.systemNotice = request.title + " is Pending and visible in Admin and Government review queues.";
      changed = true;
    }
    const hasActiveAssignment = workspace.assignments.some(function (assignment) {
      return assignment.requestId === request.id && isLifecycleAssignmentActive(assignment.status);
    });
    if ((request.status === "Pending" || request.status === "Reviewed") && !hasActiveAssignment) {
      const createdAssignments = createLifecycleAssignments(request, workspace);
      if (createdAssignments.length) {
        workspace.assignments = createdAssignments.concat(workspace.assignments);
        request.status = "Assigned";
        request.updatedAt = new Date().toISOString();
        workspace.audit.unshift("AI matched " + createdAssignments.map(function (item) { return item.volunteer; }).join(", ") + " to " + request.title + ".");
        workspace.activityLog = buildNextActivity(workspace.activityLog, "assignment", "AI assigned " + request.title + " to " + createdAssignments.map(function (item) { return item.volunteer; }).join(", ") + ".", actor);
        workspace.systemNotice = request.title + " was assigned through the AI operations queue.";
        changed = true;
      }
    }
  });
  return changed;
}

function applyLifecycleAssignmentAutomation(workspace, actor) {
  let changed = false;
  (workspace.assignments || []).forEach(function (assignment) {
    const request = (workspace.requests || []).find(function (item) { return item.id === assignment.requestId; }) || null;
    const elapsed = elapsedLifecycleMinutes(assignment.startedAt || assignment.acceptedAt || assignment.createdAt);
    const duration = Math.max(6, Number(assignment.estimatedDurationMinutes || (request && request.estimatedDurationMinutes) || 15));
    const autoManaged = Boolean(assignment.autoManaged || assignment.volunteerOrigin === "demo");

    if (autoManaged && assignment.status === "Accepted" && elapsed >= Math.max(1, duration * 0.2)) {
      assignment.status = "In Progress";
      assignment.startedAt = assignment.startedAt || new Date().toISOString();
      assignment.updatedAt = new Date().toISOString();
      if (request) {
        request.status = "In Progress";
        request.updatedAt = assignment.updatedAt;
      }
      workspace.audit.unshift(buildLifecycleVolunteerStatusLine(assignment, "In Progress"));
      workspace.activityLog = buildNextActivity(workspace.activityLog, "volunteer", buildLifecycleVolunteerStatusLine(assignment, "In Progress"), actor);
      workspace.systemNotice = buildLifecycleVolunteerStatusLine(assignment, "In Progress");
      changed = true;
    }

    if (!assignment.shifted && !isLifecycleAssignmentComplete(assignment.status) && elapsed >= duration * 0.5) {
      if (shiftLifecycleAssignment(assignment, request, workspace, actor)) {
        changed = true;
      }
    }

    if (autoManaged && !isLifecycleAssignmentComplete(assignment.status) && elapsed >= duration * 0.85) {
      finishLifecycleAssignment(assignment, request, workspace, actor, "AI auto-completed the demo volunteer task after route progress was confirmed.");
      changed = true;
    }
  });
  return changed;
}

function recalculateLifecycleVolunteerProfiles(workspace) {
  let changed = false;
  (workspace.volunteers || []).forEach(function (volunteer) {
    const related = (workspace.assignments || []).filter(function (assignment) {
      return normalizeLifecycleSearch(assignment.volunteer) === normalizeLifecycleSearch(volunteer.name);
    });
    const completed = related.filter(function (assignment) {
      return isLifecycleAssignmentComplete(assignment.status);
    }).length;
    const points = related.reduce(function (sum, assignment) {
      return sum + Number(assignment.points || 0);
    }, 0);
    const reliability = computeLifecycleReliability(volunteer, workspace.assignments || []);
    if (
      volunteer.completedTasks !== completed ||
      volunteer.pointsEarned !== points ||
      volunteer.reliability !== reliability
    ) {
      volunteer.completedTasks = completed;
      volunteer.pointsEarned = points;
      volunteer.reliability = reliability;
      volunteer.attendanceDays = Math.max(Number(volunteer.attendanceDays || 0), completed);
      changed = true;
    }
  });
  return changed;
}

function createLifecycleAssignments(request, workspace) {
  const assignments = [];
  const realVolunteer = pickLifecycleVolunteer(request, workspace, { origin: "real" });
  const demoVolunteer = pickLifecycleVolunteer(request, workspace, {
    origin: "demo",
    excludeVolunteerNames: realVolunteer ? [realVolunteer.name] : []
  });
  if (request.source === "live") {
    if (realVolunteer) {
      assignments.push(buildLifecycleAssignment(request, realVolunteer, {
        origin: "live",
        volunteerOrigin: "real",
        status: "Accepted",
        autoManaged: false
      }));
    }
    if (demoVolunteer) {
      assignments.push(buildLifecycleAssignment(request, demoVolunteer, {
        origin: "live-support",
        volunteerOrigin: "demo",
        status: "Accepted",
        autoManaged: true,
        supportLane: true
      }));
    }
  } else {
    const nearest = demoVolunteer || realVolunteer || pickLifecycleVolunteer(request, workspace, {});
    if (nearest) {
      assignments.push(buildLifecycleAssignment(request, nearest, {
        origin: "demo",
        volunteerOrigin: safeText(nearest.origin || "demo", 20).toLowerCase() || "demo",
        status: "Accepted",
        autoManaged: safeText(nearest.origin || "demo", 20).toLowerCase() === "demo"
      }));
    }
  }
  return assignments;
}

function pickLifecycleVolunteer(request, workspace, options) {
  const filters = options && typeof options === "object" ? options : {};
  const excluded = Array.isArray(filters.excludeVolunteerNames) ? filters.excludeVolunteerNames.map(normalizeLifecycleSearch) : [];
  const targetOrigin = safeText(filters.origin || "", 20).toLowerCase();
  const requestDistrict = normalizeLifecycleSearch(request && (request.district || request.zone || request.location));
  const requestSkills = normalizeLifecycleSkills(request && request.category).concat(normalizeLifecycleSkills(request && request.title));
  const candidates = (workspace.volunteers || []).filter(function (volunteer) {
    if (!volunteer || !volunteer.name) {
      return false;
    }
    if (targetOrigin && safeText(volunteer.origin, 20).toLowerCase() !== targetOrigin) {
      return false;
    }
    if (excluded.indexOf(normalizeLifecycleSearch(volunteer.name)) >= 0) {
      return false;
    }
    return isLifecycleVolunteerAvailable(volunteer);
  }).map(function (volunteer) {
    const volunteerDistrict = normalizeLifecycleSearch(volunteer.district || volunteer.location);
    const districtMatch = requestDistrict && volunteerDistrict && requestDistrict.indexOf(volunteerDistrict) >= 0 || volunteerDistrict.indexOf(requestDistrict) >= 0;
    const skillOverlap = normalizeLifecycleSkills(volunteer.skills).filter(function (skill) {
      return requestSkills.indexOf(skill) >= 0;
    }).length;
    return {
      volunteer: volunteer,
      score: (districtMatch ? 150 : 0) + (skillOverlap * 40) + Number(volunteer.reliability || 72),
      nearestKm: districtMatch ? 2 : 8
    };
  }).sort(function (left, right) {
    return right.score - left.score || left.nearestKm - right.nearestKm;
  });
  return candidates.length ? candidates[0].volunteer : null;
}

function buildLifecycleAssignment(request, volunteer, options) {
  const settings = options && typeof options === "object" ? options : {};
  const createdAt = new Date().toISOString();
  return {
    id: "ASG-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    requestId: request.id,
    title: safeText(request.title || "Assignment", 180),
    volunteer: safeText(volunteer && volunteer.name || "Volunteer pending", 140),
    district: safeText(request.district || volunteer && volunteer.district || "Unknown district", 80),
    location: safeText(request.location || volunteer && volunteer.location || "Response hub", 180),
    status: normalizeLifecycleAssignmentStatus(settings.status || "Accepted"),
    createdAt: createdAt,
    updatedAt: createdAt,
    acceptedAt: createdAt,
    startedAt: "",
    completedAt: "",
    estimatedDurationMinutes: Number(request.estimatedDurationMinutes || estimateLifecycleDuration(request.priority, request.source)),
    shiftCount: 0,
    shifted: false,
    autoManaged: Boolean(settings.autoManaged),
    points: computeLifecycleTaskPoints(request.priority || "Medium", 0),
    pointsAwarded: false,
    origin: safeText(settings.origin || request.origin || "demo", 20).toLowerCase() || "demo",
    volunteerOrigin: safeText(settings.volunteerOrigin || volunteer && volunteer.origin || "demo", 20).toLowerCase() || "demo"
  };
}

function shiftLifecycleAssignment(assignment, request, workspace, actor) {
  const nextVolunteer = pickLifecycleVolunteer(request || assignment, workspace, {
    excludeVolunteerNames: [assignment.volunteer]
  });
  if (!nextVolunteer) {
    return false;
  }
  assignment.shiftCount = Number(assignment.shiftCount || 0) + 1;
  assignment.shifted = true;
  assignment.volunteer = nextVolunteer.name;
  assignment.volunteerOrigin = safeText(nextVolunteer.origin || "demo", 20).toLowerCase() || "demo";
  assignment.autoManaged = assignment.volunteerOrigin === "demo";
  assignment.status = "Accepted";
  assignment.acceptedAt = new Date().toISOString();
  assignment.startedAt = "";
  assignment.updatedAt = assignment.acceptedAt;
  assignment.points = computeLifecycleTaskPoints(request && request.priority || "Medium", assignment.shiftCount);
  if (request) {
    request.status = "Assigned";
    request.updatedAt = assignment.updatedAt;
  }
  workspace.audit.unshift(buildLifecycleShiftLine(assignment, nextVolunteer, request || { title: assignment.title }));
  workspace.activityLog = buildNextActivity(workspace.activityLog, "assignment", buildLifecycleShiftLine(assignment, nextVolunteer, request || { title: assignment.title }), actor);
  workspace.systemNotice = buildLifecycleVolunteerStatusLine(assignment, "Accepted");
  return true;
}

function finishLifecycleAssignment(assignment, request, workspace, actor, reason) {
  assignment.status = "Completed";
  assignment.completedAt = new Date().toISOString();
  assignment.updatedAt = assignment.completedAt;
  assignment.points = computeLifecycleTaskPoints(request && request.priority || "Medium", assignment.shiftCount);
  awardLifecyclePoints(workspace, assignment);
  if (request) {
    request.status = "Delivered";
    request.updatedAt = assignment.completedAt;
  }
  workspace.audit.unshift(buildLifecycleVolunteerStatusLine(assignment, "Completed"));
  workspace.audit.unshift(safeText(reason || ("Volunteer " + assignment.volunteer + " completed " + assignment.title + "."), 240));
  workspace.activityLog = buildNextActivity(workspace.activityLog, "volunteer", buildLifecycleVolunteerStatusLine(assignment, "Completed"), actor);
  workspace.systemNotice = buildLifecycleVolunteerStatusLine(assignment, "Completed");
}

function awardLifecyclePoints(workspace, assignment) {
  if (assignment.pointsAwarded) {
    return;
  }
  const volunteer = (workspace.volunteers || []).find(function (item) {
    return normalizeLifecycleSearch(item.name) === normalizeLifecycleSearch(assignment.volunteer);
  });
  if (volunteer) {
    volunteer.pointsEarned = Number(volunteer.pointsEarned || 0) + Number(assignment.points || 0);
    volunteer.completedTasks = Number(volunteer.completedTasks || 0) + 1;
    volunteer.lastStatus = "Completed";
    volunteer.attendanceDays = Math.max(Number(volunteer.attendanceDays || 0), Number(volunteer.completedTasks || 0));
  }
  assignment.pointsAwarded = true;
}

function normalizeLifecycleRequestStatus(status) {
  const normalized = safeText(status, 40).toLowerCase();
  if (!normalized || normalized === "tracked" || normalized === "submitted" || normalized === "queued" || normalized === "requested") return "Pending";
  if (normalized.indexOf("pending") !== -1) return "Pending";
  if (normalized.indexOf("review") !== -1) return "Reviewed";
  if (normalized.indexOf("assigned") !== -1) return "Assigned";
  if (normalized.indexOf("progress") !== -1 || normalized.indexOf("active") !== -1) return "In Progress";
  if (normalized.indexOf("deliver") !== -1 || normalized.indexOf("complete") !== -1) return "Delivered";
  if (normalized.indexOf("closed") !== -1 || normalized.indexOf("archive") !== -1) return "Closed";
  return "Pending";
}

function normalizeLifecycleAssignmentStatus(status) {
  const normalized = safeText(status, 40).toLowerCase();
  if (!normalized) return "Accepted";
  if (normalized.indexOf("complete") !== -1 || normalized.indexOf("deliver") !== -1 || normalized.indexOf("closed") !== -1) return "Completed";
  if (normalized.indexOf("progress") !== -1 || normalized.indexOf("active") !== -1) return "In Progress";
  return "Accepted";
}

function isLifecycleAssignmentComplete(status) {
  return normalizeLifecycleAssignmentStatus(status) === "Completed";
}

function isLifecycleAssignmentActive(status) {
  const normalized = normalizeLifecycleAssignmentStatus(status);
  return normalized === "Accepted" || normalized === "In Progress";
}

function normalizeLifecycleSkills(input) {
  const values = Array.isArray(input) ? input : String(input || "").split(",");
  return values.map(function (item) {
    return safeText(item, 48).toLowerCase();
  }).filter(Boolean).slice(0, 12);
}

function normalizeLifecycleAvailability(value) {
  const availability = safeText(value, 40).toLowerCase();
  if (!availability) return "available";
  if (availability.indexOf("inactive") !== -1) return "inactive";
  if (availability.indexOf("weekend") !== -1) return "weekend";
  if (availability.indexOf("evening") !== -1) return "evening";
  if (availability.indexOf("half") !== -1) return "half day";
  if (availability.indexOf("full") !== -1) return "full day";
  if (availability.indexOf("active") !== -1) return "active";
  if (availability.indexOf("call") !== -1) return "on call";
  return "available";
}

function isLifecycleVolunteerAvailable(volunteer) {
  return /available|active|on call|full day|half day|evening|weekend/.test(normalizeLifecycleAvailability(volunteer && (volunteer.availability || volunteer.activityStatus)));
}

function inferLifecycleComplexity(priority) {
  const normalized = safeText(priority, 40).toLowerCase();
  if (normalized.indexOf("critical") !== -1 || normalized.indexOf("high") !== -1) return "High";
  if (normalized.indexOf("medium") !== -1) return "Medium";
  return "Low";
}

function estimateLifecycleDuration(priority, source) {
  const complexity = inferLifecycleComplexity(priority);
  const normalizedSource = safeText(source, 40).toLowerCase();
  if (complexity === "High") return normalizedSource === "live" ? 16 : 12;
  if (complexity === "Medium") return normalizedSource === "live" ? 20 : 15;
  return normalizedSource === "live" ? 24 : 18;
}

function computeLifecycleTaskPoints(priority, shiftCount) {
  const complexity = inferLifecycleComplexity(priority);
  const base = complexity === "High" ? 32 : complexity === "Medium" ? 22 : 14;
  return Math.max(8, base - Math.min(8, Number(shiftCount || 0) * 2));
}

function lifecycleRequestPriorityRank(request) {
  const source = safeText(request && request.source, 40).toLowerCase();
  const base = source === "live" ? 180 : source === "disaster-demo" ? 240 : 90;
  return base + Math.round(priorityScoreServer(request && request.priority) * 100) + Math.min(40, Number(request && request.beneficiaries || 0) / 10);
}

function sortLifecycleRequests(items) {
  return (Array.isArray(items) ? items.slice() : []).sort(function (left, right) {
    return lifecycleRequestPriorityRank(right) - lifecycleRequestPriorityRank(left)
      || Date.parse(right.createdAt || right.requestedAt || 0) - Date.parse(left.createdAt || left.requestedAt || 0)
      || priorityScoreServer(right.priority) - priorityScoreServer(left.priority);
  });
}

function sortLifecycleAssignments(items) {
  return (Array.isArray(items) ? items.slice() : []).sort(function (left, right) {
    const leftActive = isLifecycleAssignmentActive(left.status) ? 1 : 0;
    const rightActive = isLifecycleAssignmentActive(right.status) ? 1 : 0;
    return rightActive - leftActive
      || Date.parse(right.updatedAt || right.startedAt || right.acceptedAt || 0) - Date.parse(left.updatedAt || left.startedAt || left.acceptedAt || 0)
      || Number(right.points || 0) - Number(left.points || 0);
  });
}

function sortLifecycleDonations(items) {
  return (Array.isArray(items) ? items.slice() : []).sort(function (left, right) {
    return Date.parse(right.createdAt || right.updatedAt || 0) - Date.parse(left.createdAt || left.updatedAt || 0);
  });
}

function priorityScoreServer(priority) {
  const normalized = safeText(priority, 40).toLowerCase();
  if (normalized.indexOf("critical") !== -1) return 1;
  if (normalized.indexOf("high") !== -1) return 0.85;
  if (normalized.indexOf("medium") !== -1) return 0.55;
  return 0.25;
}

function elapsedLifecycleMinutes(value) {
  const parsed = Date.parse(safeText(value, 80));
  if (!parsed) {
    return 0;
  }
  return (Date.now() - parsed) / 60000;
}

function normalizeLifecycleSearch(value) {
  return safeText(value, 240).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function computeLifecycleReliability(volunteer, assignments) {
  const related = (assignments || []).filter(function (item) {
    return normalizeLifecycleSearch(item.volunteer) === normalizeLifecycleSearch(volunteer && volunteer.name);
  });
  if (!related.length) {
    return Number(volunteer && volunteer.reliability || 72) || 72;
  }
  const delivered = related.filter(function (item) {
    return normalizeLifecycleAssignmentStatus(item.status) === "Completed";
  }).length;
  return Math.max(68, Math.min(98, 70 + delivered * 9 + Math.max(0, related.length - delivered) * 3));
}

function buildLifecycleVolunteerStatusLine(assignment, status) {
  return "Volunteer " + safeText(assignment && assignment.volunteer || "Assigned volunteer", 140) + " is currently " + safeText(status || assignment && assignment.status || "Accepted", 60) + " on " + safeText(assignment && assignment.title || "the active task", 180) + ".";
}

function buildLifecycleShiftLine(assignment, nextVolunteer, request) {
  return "AI shifted " + safeText(assignment && assignment.title, 180) + " to " + safeText(nextVolunteer && nextVolunteer.name, 140) + " because " + safeText(request && request.title, 180) + " crossed 50% of its estimated duration without completion.";
}

function randomizeDemoRequests(scenario, cycleId) {
  const districts = scenario === "cyclone" ? ["Nagapattinam", "Cuddalore"] : scenario === "medical" ? ["Chennai", "Kolkata"] : ["Chennai", "Nagapattinam"];
  const categories = scenario === "cyclone"
    ? ["Shelter", "Community Alert", "Medical"]
    : scenario === "medical"
      ? ["Medical", "Food", "Transport"]
      : ["Food", "Shelter", "Medical"];
  const titles = scenario === "cyclone"
    ? ["Pre-position shelter kits", "Move shelter mattresses", "Harbor warning support"]
    : scenario === "medical"
      ? ["Triage desk support", "Medicine staging support", "Transport patient supplies"]
      : ["Emergency food kits", "Harbor warning outreach", "Medicine staging support"];
  return titles.map(function (title, index) {
    const district = districts[index % districts.length];
    const priority = index === 0 ? "High" : index === 1 ? "Medium" : "Critical";
    const createdAt = new Date(Date.now() - (index + 1) * 4 * 60000).toISOString();
    return {
      id: "REQ-" + safeText(scenario, 24) + "-" + (index + 1) + "-" + cycleId.slice(-4),
      title: title,
      category: categories[index % categories.length],
      district: district,
      location: district + " response point",
      beneficiaries: 80 + (index * 40),
      priority: priority,
      status: "Pending",
      summary: title + " auto-generated for the new demo cycle.",
      source: "disaster-demo",
      origin: "demo",
      priorityLane: "disaster-demo",
      requester: "Disaster Demo",
      complexity: inferLifecycleComplexity(priority),
      estimatedDurationMinutes: estimateLifecycleDuration(priority, "disaster-demo"),
      createdAt: createdAt,
      requestedAt: createdAt,
      updatedAt: createdAt,
      broadcastTo: ["admin", "government"]
    };
  });
}

function randomizeDemoDonations(scenario, cycleId) {
  const donors = ["Harbor Traders Forum", "Relief Supplies Hub", "CareLink Trust"];
  return donors.map(function (donor, index) {
    const createdAt = new Date(Date.now() - (index + 1) * 6 * 60000).toISOString();
    return {
      id: "DON-" + safeText(scenario, 24) + "-" + (index + 1) + "-" + cycleId.slice(-4),
      donor: donor,
      kind: index === 0 ? "money" : "item",
      status: "Submitted",
      createdAt: createdAt,
      updatedAt: createdAt,
      origin: "demo"
    };
  });
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
