const { safeText, safeIso } = require("./shared");

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

function wantsCopilotAction(message) {
  return /(assign|reassign|shift|move|update|change|set|advance|mark|complete|start|draft|write|generate outreach|send outreach|route|use donation|recommend donation|manage|operate|handle|take action|approve|review)/i.test(safeText(message, 2000));
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

function parseJsonLikeResponse(text) {
  const raw = safeText(text, 12000).trim();
  if (!raw) {
    return null;
  }
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end <= start) {
      return null;
    }
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch (nestedError) {
      return null;
    }
  }
}

function normalizeCopilotActionType(value) {
  const type = safeText(value, 80).toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  if (type === "assign" || type === "assign_request" || type === "assign_volunteer" || type === "match_volunteer" || type === "dispatch_task") return "assign_task";
  if (type === "update_request" || type === "advance_request" || type === "review_request") return "update_request_status";
  if (type === "update_assignment" || type === "advance_assignment" || type === "volunteer_status") return "update_assignment_status";
  if (type === "recommend_donation" || type === "use_donation" || type === "map_donation") return "recommend_donation_use";
  if (type === "draft_outreach" || type === "generate_outreach" || type === "send_outreach" || type === "message_outreach") return "generate_outreach_draft";
  return ["assign_task", "update_request_status", "update_assignment_status", "recommend_donation_use", "generate_outreach_draft"].indexOf(type) >= 0
    ? type
    : "";
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

module.exports = {
  normalizeWorkspaceState,
  normalizeLifecycleRequestStatus,
  normalizeLifecycleAssignmentStatus,
  isLifecycleAssignmentComplete,
  isLifecycleAssignmentActive,
  normalizeLifecycleSkills,
  normalizeLifecycleAvailability,
  isLifecycleVolunteerAvailable,
  inferLifecycleComplexity,
  estimateLifecycleDuration,
  computeLifecycleTaskPoints,
  priorityScoreServer,
  elapsedLifecycleMinutes,
  normalizeLifecycleSearch,
  computeLifecycleReliability,
  buildNextActivity,
  wantsCopilotAction,
  extractGeminiText,
  parseJsonLikeResponse,
  normalizeCopilotActionType,
  normalizeWhatsAppNumber
};
