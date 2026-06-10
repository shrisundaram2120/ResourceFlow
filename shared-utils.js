/**
 * ResourceFlow shared utilities.
 *
 * Every function and constant that was duplicated across app.js,
 * portal.js, auth-entry.js, resourceflow-shared.js, and tests.js
 * now lives here once and is exposed via window.ResourceFlowUtils.
 *
 * Load this script before the other application scripts.
 */
(function () {
  "use strict";

  /* ===== Storage key constants (were duplicated in app / portal / auth-entry) ===== */

  var PORTAL_SELECTION_KEY  = "resourceflow-portal-selection-v2";
  var PORTAL_PROFILE_KEY    = "resourceflow-portal-profile-v2";
  var PORTAL_HANDOFF_KEY    = "resourceflow-portal-handoff-v1";
  var ENTRY_PROFILE_KEY     = "resourceflow-entry-profile-v1";
  var DEMO_AUTH_KEY          = "resourceflow-demo-auth-v1";
  var FIREBASE_SDK_VERSION   = "10.12.5";

  /* ===== Text utilities ===== */

  function safeText(value, limit) {
    var sanitized = (value == null ? "" : String(value)).replace(/\s+/g, " ").trim();
    return typeof limit === "number" && limit > 0 ? sanitized.slice(0, limit) : sanitized;
  }

  function escapeHtml(value) {
    return safeText(value).replace(/[&<>"']/g, function (match) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[match];
    });
  }

  function titleCase(value) {
    return String(value || "").replace(/\b\w/g, function (character) {
      return character.toUpperCase();
    });
  }

  /* ===== Numeric / date utilities ===== */

  function safeInteger(value, min, max, fallback) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return typeof fallback === "number" ? fallback : 0;
    }
    if (typeof min === "number" && typeof max === "number") {
      return Math.min(max, Math.max(min, Math.round(numeric)));
    }
    return Math.max(0, Math.round(numeric));
  }

  function safeIso(value) {
    var date = new Date(value || new Date().toISOString());
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function safeOptionalIso(value) {
    if (!value) {
      return "";
    }
    return safeIso(value);
  }

  function formatTimestamp(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "n/a";
    }
    return date.toLocaleString();
  }

  function uid() {
    return "rf-" + Math.random().toString(36).slice(2, 10);
  }

  function isoMinutesAgo(minutes) {
    return new Date(Date.now() - minutes * 60000).toISOString();
  }

  /* ===== Script loader (was in portal / auth-entry / resourceflow-shared) ===== */

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-rfutils-src="' + url + '"]');
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", function () { resolve(); }, { once: true });
        existing.addEventListener("error", function () { reject(new Error("Could not load " + url)); }, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.dataset.rfutilsSrc = url;
      script.onload = function () {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Could not load " + url));
      };
      document.head.appendChild(script);
    });
  }

  /* ===== localStorage JSON helpers (were in portal.js) ===== */

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn("Could not load JSON from localStorage.", error);
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn("Could not save JSON to localStorage.", error);
    }
  }

  /* ===== Portal normalization (was in portal / auth-entry) ===== */

  function normalizePortal(value) {
    var portal = safeText(value, 40).toLowerCase();
    if (portal === "community" || portal === "user") return "user";
    if (portal === "volunteer") return "volunteer";
    if (portal === "government" || portal === "ngo" || portal === "employee") return "government";
    if (portal === "admin") return "admin";
    return "";
  }

  /* ===== File download helper (was in app.js) ===== */

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /* ===== Expose public API ===== */

  window.ResourceFlowUtils = {
    // constants
    PORTAL_SELECTION_KEY: PORTAL_SELECTION_KEY,
    PORTAL_PROFILE_KEY: PORTAL_PROFILE_KEY,
    PORTAL_HANDOFF_KEY: PORTAL_HANDOFF_KEY,
    ENTRY_PROFILE_KEY: ENTRY_PROFILE_KEY,
    DEMO_AUTH_KEY: DEMO_AUTH_KEY,
    FIREBASE_SDK_VERSION: FIREBASE_SDK_VERSION,
    // text
    safeText: safeText,
    escapeHtml: escapeHtml,
    titleCase: titleCase,
    // numeric / date
    safeInteger: safeInteger,
    safeIso: safeIso,
    safeOptionalIso: safeOptionalIso,
    formatTimestamp: formatTimestamp,
    uid: uid,
    isoMinutesAgo: isoMinutesAgo,
    // script loader
    loadScript: loadScript,
    // localStorage
    loadJson: loadJson,
    saveJson: saveJson,
    // portal
    normalizePortal: normalizePortal,
    // file
    downloadBlob: downloadBlob
  };
})();
