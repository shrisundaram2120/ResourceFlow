// ============================================================
// RESOURCEFLOW BUG FIX - criteria_fixed.js
// ============================================================
// This file contains all critical fixes for criteria.js
//
// CHANGES MADE:
// 1. Fixed safe() function - proper HTML entity escaping
// 2. Added missing < character regex pattern
// 3. Fixed writeStoredNumber() - added error handling for localStorage quota
// 4. Fixed writeCache() - added error handling for localStorage quota
// 5. Added error handling to clone() function
// 6. Added normalizeText() function (was missing)
//
// INSTRUCTIONS:
// 1. Download this file
// 2. Rename it to "criteria.js"
// 3. Replace the existing criteria.js in your repo
// 4. Commit and push
//
// ============================================================

// Fixed criteria.js - ResourceFlow helper functions

function safe(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function writeStoredNumber(key, value) {
  try {
    localStorage.setItem(key, String(Math.max(0, Number(value) || 0)));
  } catch (e) {
    console.warn("ResourceFlow: localStorage write failed", e);
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("ResourceFlow: localStorage cache write failed", e);
  }
}

function readStoredNumber(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function readCache(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function clone(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    console.warn("ResourceFlow: clone failed", e);
    return value;
  }
}

function uid() {
  return "rf-" + Math.random().toString(36).slice(2, 10);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function titleCase(value) {
  return String(value)
    .split(" ")
    .map(function (item) {
      return item.charAt(0).toUpperCase() + item.slice(1);
    })
    .join(" ");
}

function safeText(value, limit) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit || 180);
}

function safeIso(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

function safeInteger(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeZone(value) {
  const ALLOWED_ZONES = ["North", "South", "East", "West", "Central"];
  const candidate = safeText(value, 20);
  return ALLOWED_ZONES.indexOf(candidate) >= 0 ? candidate : "Central";
}

function normalizeApprovalStatus(value) {
  const REQUEST_APPROVAL_STATES = ["pending", "approved", "rejected"];
  const candidate = String(value || "").trim().toLowerCase();
  return REQUEST_APPROVAL_STATES.indexOf(candidate) >= 0 ? candidate : "pending";
}

function normalizeWorkflowStatus(value) {
  const WORKFLOW_SEQUENCE = ["pending", "assigned", "in-progress", "delivered", "closed"];
  const candidate = String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
  return WORKFLOW_SEQUENCE.indexOf(candidate) >= 0 ? candidate : "pending";
}

function normalizeScenario(value) {
  const SCENARIO_OPTIONS = ["mixed", "flood", "cyclone", "medical", "shelter", "food"];
  const candidate = String(value || "").trim().toLowerCase();
  return SCENARIO_OPTIONS.indexOf(candidate) >= 0 ? candidate : "mixed";
}

function normalizeShiftLabel(value) {
  const text = safeText(value || "", 40);
  return text || "Today - Afternoon";
}

function normalizeRouteCluster(value) {
  return safeText(value || "Core route", 40) || "Core route";
}

function normalizeSkills(input) {
  const source = Array.isArray(input) ? input : String(input || "").split(",");
  const unique = {};
  source.forEach(function (item) {
    const normalized = safeText(item, 40).toLowerCase();
    if (normalized) {
      unique[normalized] = true;
    }
  });
  return Object.keys(unique).slice(0, 8);
}

function normalizeLanguages(input) {
  const source = Array.isArray(input) ? input : String(input || "").split(",");
  const unique = {};
  source.forEach(function (item) {
    const normalized = safeText(item, 30);
    if (normalized) {
      unique[normalized] = true;
    }
  });
  const values = Object.keys(unique).slice(0, 3);
  return values.length ? values : ["English"];
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "n/a";
  }
  return date.toLocaleString();
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (size >= 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  }
  if (size >= 1024) {
    return Math.round(size / 1024) + " KB";
  }
  return size + " B";
}

function formatTime(value) {
  const timestamp = new Date(safeIso(value)).getTime();
  const diff = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (diff < 60) {
    return diff + " min ago";
  }
  const hours = Math.round(diff / 60);
  if (hours < 24) {
    return hours + " hr ago";
  }
  return Math.round(hours / 24) + " day ago";
}

function workflowLabel(status) {
  return titleCase(String(status || "pending").replace(/-/g, " "));
}

function urgencyLabel(level) {
  return {
    5: "Critical",
    4: "High",
    3: "Moderate",
    2: "Low",
    1: "Routine"
  }[Number(level)] || "Routine";
}

function districtText(value) {
  const district = String(value || "").trim();
  return district ? district + " District" : "District not set";
}

function renderChip(text) {
  return '<span class="chip">' + escapeHtml(text) + "</span>";
}

function renderUrgencyChip(level) {
  const label = urgencyLabel(level);
  const tone = {
    "Critical": "critical",
    "High": "high",
    "Moderate": "moderate",
    "Low": "low",
    "Routine": ""
  }[label];
  return '<span class="chip ' + tone + '">' + label + "</span>";
}

function getZoneDistance(fromZone, toZone) {
  const ZONE_DISTANCE = {
    North: { North: 0, Central: 1, East: 2, West: 2, South: 3 },
    South: { South: 0, Central: 1, East: 2, West: 2, North: 3 },
    East: { East: 0, Central: 1, North: 2, South: 2, West: 2 },
    West: { West: 0, Central: 1, North: 2, South: 2, East: 2 },
    Central: { Central: 0, North: 1, South: 1, East: 1, West: 1 }
  };
  const from = normalizeZone(fromZone);
  const to = normalizeZone(toZone);
  return ZONE_DISTANCE[from] && typeof ZONE_DISTANCE[from][to] === "number"
    ? ZONE_DISTANCE[from][to]
    : 2;
}

function estimateEtaMinutes(volunteerZone, requestZone) {
  return 12 + (getZoneDistance(volunteerZone, requestZone) * 8);
}

function routeClusterForZone(zone) {
  return {
    North: "Northern arc",
    South: "River corridor",
    East: "Shelter cluster east",
    West: "Community kitchens west",
    Central: "Central civic corridor"
  }[normalizeZone(zone)] || "Core route";
}

function inferShiftLabel(createdAt, urgency) {
  const date = new Date(safeIso(createdAt));
  const offset = Number(urgency || 0) >= 5 ? 0 : (Number(urgency || 0) >= 3 ? 1 : 2);
  date.setDate(date.getDate() + Math.min(offset, 1));
  const day = offset === 0 ? "Today" : (offset === 1 ? "Tomorrow" : "Next Window");
  const hour = date.getHours();
  const part = hour < 12 ? "Morning" : (hour < 17 ? "Afternoon" : "Evening");
  return day + " - " + part;
}

function inferVolunteerShift(availability) {
  const value = String(availability || "").toLowerCase();
  if (value.indexOf("evening") >= 0) {
    return "Today - Evening";
  }
  if (value.indexOf("weekend") >= 0) {
    return "Tomorrow - Morning";
  }
  if (value.indexOf("half") >= 0) {
    return "Today - Afternoon";
  }
  return "Today - Morning";
}

function inferScenario(category, title, notes) {
  const normalized = [category, title, notes].join(" ").toLowerCase();
  if (normalized.indexOf("cyclone") >= 0 || normalized.indexOf("storm surge") >= 0 || normalized.indexOf("landfall") >= 0) {
    return "cyclone";
  }
  if (normalized.indexOf("flood") >= 0 || normalized.indexOf("storm") >= 0 || normalized.indexOf("boat") >= 0 || normalized.indexOf("water") >= 0) {
    return "flood";
  }
  if (normalized.indexOf("medical") >= 0 || normalized.indexOf("health") >= 0 || normalized.indexOf("triage") >= 0) {
    return "medical";
  }
  if (normalized.indexOf("shelter") >= 0 || normalized.indexOf("bedding") >= 0 || normalized.indexOf("intake") >= 0) {
    return "shelter";
  }
  if (normalized.indexOf("food") >= 0 || normalized.indexOf("meal") >= 0 || normalized.indexOf("ration") >= 0) {
    return "food";
  }
  return "mixed";
}

function scenarioTitle(value) {
  return {
    mixed: "Mixed Response",
    flood: "Flood Response",
    cyclone: "Cyclone Response",
    medical: "Medical Camp",
    shelter: "Shelter Support",
    food: "Food Distribution"
  }[normalizeScenario(value)] || "Mixed Response";
}

function availabilityWeight(value) {
  return {
    "Full Day": 16,
    "Half Day": 10,
    "Weekend": 8,
    "Evening": 6
  }[value] || 0;
}

function experienceWeight(value) {
  return {
    "Advanced": 14,
    "Intermediate": 9,
    "Beginner": 5
  }[value] || 0;
}

function computeReadinessScore(input) {
  const requestLoad = input.requests ? Math.min((input.volunteers / Math.max(input.requests, 1)) * 24, 24) : 24;
  const assignmentLift = input.requests ? Math.min((input.assignments / Math.max(input.requests, 1)) * 12, 12) : 12;
  const score = (input.coverage * 0.38) + (input.criticalFill * 0.38) + requestLoad + assignmentLift;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function safeFileName(value) {
  return String(value || "upload")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 120);
}

function isAllowedArtifactFile(file) {
  const type = String(file && file.type ? file.type : "").toLowerCase();
  return type.indexOf("image/") === 0 || type === "application/pdf" || type === "text/plain";
}

function csvEscape(value) {
  const text = String(value == null ? "" : value);
  return '"' + text.replace(/"/g, '""') + '"';
}

function slugifyText(value) {
  return String(value || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(name, text) {
  const blob = new Blob([String(text || "")], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, safeFileName(name || "resourceflow-export.txt"));
}
