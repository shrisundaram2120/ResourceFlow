const MAX_TEXT = 180;
const MAX_NOTES = 420;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_ZONES = ["North", "South", "East", "West", "Central"];

function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  if (role === "admin" || role === "coordinator" || role === "volunteer") {
    return role;
  }
  return "volunteer";
}

function safeText(value, limit) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit || MAX_TEXT);
}

function safeInteger(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function safeIso(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function normalizeZone(value) {
  return ALLOWED_ZONES.indexOf(String(value || "").trim()) >= 0 ? String(value || "").trim() : "Central";
}

function normalizeSkills(input) {
  const values = Array.isArray(input)
    ? input
    : String(input || "").split(",");
  const unique = [];
  values.forEach(function (item) {
    const skill = safeText(item, 48).toLowerCase();
    if (skill && unique.indexOf(skill) < 0) {
      unique.push(skill);
    }
  });
  return unique.slice(0, 10);
}

function uid() {
  return "rf-" + Math.random().toString(36).slice(2, 10);
}

function sanitizeVolunteerRecord(input, owner) {
  const next = input && typeof input === "object" ? input : {};
  return {
    id: safeText(next.id || uid(), 32),
    ownerUid: owner && owner.uid ? safeText(owner.uid, 80) : safeText(next.ownerUid, 80),
    ownerEmail: owner && owner.email ? safeText(owner.email, 140) : safeText(next.ownerEmail, 140),
    name: safeText(next.name, MAX_TEXT),
    zone: normalizeZone(next.zone),
    location: safeText(next.location || (normalizeZone(next.zone) + " response hub"), 140),
    availability: safeText(next.availability || "Half Day", 32),
    skills: normalizeSkills(next.skills),
    transport: safeText(next.transport || "No", 12) === "Yes" ? "Yes" : "No",
    experience: safeText(next.experience || "Beginner", 32),
    createdAt: safeIso(next.createdAt || new Date().toISOString())
  };
}

function sanitizeNotificationPayload(input) {
  const next = input && typeof input === "object" ? input : {};
  const channels = Array.isArray(next.channels)
    ? next.channels
    : [next.channel];
  return {
    id: safeText(next.id || uid(), 32),
    subject: safeText(next.subject || "ResourceFlow notification", 120),
    message: safeText(next.message, MAX_NOTES),
    channels: channels
      .map(function (item) { return safeText(item, 24).toLowerCase(); })
      .filter(function (item, index, list) {
        return ["email", "whatsapp"].indexOf(item) >= 0 && list.indexOf(item) === index;
      }),
    recipients: Array.isArray(next.recipients)
      ? next.recipients.map(function (item) {
          return {
            name: safeText(item && item.name, 80),
            email: safeText(item && item.email, 140),
            phone: safeText(item && item.phone, 32)
          };
        }).filter(function (item) { return item.email || item.phone; }).slice(0, 50)
      : [],
    createdAt: safeIso(next.createdAt || new Date().toISOString()),
    status: safeText(next.status || "queued", 24),
    createdBy: safeText(next.createdBy || "system", 140)
  };
}

function sanitizeClientError(input, actor) {
  const next = input && typeof input === "object" ? input : {};
  return {
    id: safeText(next.id || uid(), 32),
    page: safeText(next.page || "unknown", 120),
    message: safeText(next.message || "Unknown client error", 240),
    stack: safeText(next.stack || "", 2000),
    severity: safeText(next.severity || "error", 24),
    actor: safeText(actor || "anonymous", 140),
    createdAt: safeIso(next.createdAt || new Date().toISOString())
  };
}

function assertManager(auth) {
  const role = normalizeRole(auth && auth.token ? auth.token.role : "");
  return role === "admin" || role === "coordinator";
}

function assertAdmin(auth) {
  return normalizeRole(auth && auth.token ? auth.token.role : "") === "admin";
}

function decodeRoleClaim(auth) {
  return normalizeRole(auth && auth.token ? auth.token.role : "");
}

module.exports = {
  ALLOWED_ZONES,
  MAX_FILE_SIZE,
  assertAdmin,
  assertManager,
  decodeRoleClaim,
  normalizeRole,
  normalizeSkills,
  normalizeZone,
  safeInteger,
  safeIso,
  safeText,
  sanitizeClientError,
  sanitizeNotificationPayload,
  sanitizeVolunteerRecord
};
