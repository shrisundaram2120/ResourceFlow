window.RESOURCEFLOW_FIREBASE_CONFIG = {
  enabled: true,
  apiKey: "AIzaSyAVO6glsnbppeIoCZOG1muBpbAw4MX_D9o",
  authDomain: "resourceflow-8cd9f.firebaseapp.com",
  projectId: "resourceflow-8cd9f",
  storageBucket: "resourceflow-8cd9f.firebasestorage.app",
  messagingSenderId: "331886592261",
  appId: "1:331886592261:web:80c0e2512051c20fa0376c",
  measurementId: "G-4ZPLMJNMBN",
  collectionId: "resourceflow",
  workspaceId: "resourceflow-demo",
  functionsRegion: "us-central1",
  secureBackendEnabled: false,
  lifecycleBackendEnabled: true,
  // Shared portal features now use Firebase Auth + Firestore instead of browser-only storage.
  forceLocalWorkspace: false,
  noCostGuard: {
    enabled: true,
    limits: {
      reads: 50000,
      writes: 20000,
      deletes: 20000,
      firestoreStorageMb: 1024,
      hostingStorageMb: 10240,
      hostingDownloadsMbPerDay: 360,
      bandwidthMbPerMonth: 10240
    },
    warnRatio: 0.6,
    blockRatio: 0.85,
    cacheTtlsMs: {
      userProfile: 21600000,
      volunteers: 300000,
      ownDonations: 180000,
      adminDonations: 180000
    },
    queryLimits: {
      volunteers: 20,
      ownDonations: 12,
      adminDonations: 20,
      users: 5
    },
    refreshIntervalMs: 600000
  },
  googleMapsApiKey: "",
  geminiApiKey: "AIzaSyC2TwO2FAyccXfG0mBFOy1NHaS_MpJIZpw",
  geminiModel: "gemini-2.5-flash",
  enableAuth: true,
  enableAppCheck: false,
  appCheckSiteKey: "",
  // Real privileged access comes from Firebase custom claims issued by Cloud Functions.
  // These email lists only help the UI explain which users should request elevated roles.
  adminEmails: ["acshrisundaram@gmail.com"],
  coordinatorEmails: []
};

(function () {
  const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
  const guardConfig = Object.assign({
    enabled: true,
    limits: {},
    warnRatio: 0.7,
    blockRatio: 0.9,
    cacheTtlsMs: {},
    queryLimits: {},
    refreshIntervalMs: 300000
  }, config.noCostGuard || {});
  const USAGE_PREFIX = "resourceflow-firebase-usage-v1:";
  const CACHE_PREFIX = "resourceflow-firebase-cache-v1:";
  const MONTH_KEYS = ["hostingDownloadsMbPerDay", "bandwidthMbPerMonth"];

  function currentDayKey() {
    const now = new Date();
    return [
      now.getFullYear(),
      pad2(now.getMonth() + 1),
      pad2(now.getDate())
    ].join("-");
  }

  function currentMonthKey() {
    const now = new Date();
    return [now.getFullYear(), pad2(now.getMonth() + 1)].join("-");
  }

  function pad2(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function usageKey(metric) {
    return USAGE_PREFIX + metric + ":" + (MONTH_KEYS.indexOf(metric) >= 0 ? currentMonthKey() : currentDayKey());
  }

  function readStoredNumber(key) {
    try {
      const raw = localStorage.getItem(key);
      const value = raw ? Number(raw) : 0;
      return Number.isFinite(value) ? value : 0;
    } catch (error) {
      return 0;
    }
  }

  function writeStoredNumber(key, value) {
    try {
      localStorage.setItem(key, String(Math.max(0, Number(value) || 0)));
    } catch (error) {
      // Ignore localStorage failures so the app can keep running.
    }
  }

  function preview(metric, amount) {
    const increment = Math.max(0, Number(amount) || 0);
    const limit = Number(guardConfig.limits && guardConfig.limits[metric]) || 0;
    if (!guardConfig.enabled || !limit) {
      return buildUsageResult(metric, increment, limit, 0, true, "ok");
    }
    const current = readStoredNumber(usageKey(metric));
    const projected = current + increment;
    const warnAt = limit * clampRatio(guardConfig.warnRatio, 0.5, 0.95);
    const blockAt = limit * clampRatio(guardConfig.blockRatio, 0.75, 0.99);
    if (projected >= blockAt) {
      return buildUsageResult(metric, projected, limit, current, false, "blocked");
    }
    if (projected >= warnAt) {
      return buildUsageResult(metric, projected, limit, current, true, "warning");
    }
    return buildUsageResult(metric, projected, limit, current, true, "ok");
  }

  function record(metric, amount) {
    const increment = Math.max(0, Number(amount) || 0);
    const result = preview(metric, increment);
    writeStoredNumber(usageKey(metric), result.projected);
    return result;
  }

  function buildUsageResult(metric, projected, limit, current, allowed, state) {
    return {
      metric: metric,
      current: current,
      projected: projected,
      limit: limit,
      allowed: allowed,
      state: state,
      ratio: limit ? projected / limit : 0,
      remaining: limit ? Math.max(0, limit - projected) : Infinity,
      message: buildMessage(metric, projected, limit, state)
    };
  }

  function buildMessage(metric, projected, limit, state) {
    const label = metricLabel(metric);
    if (state === "blocked") {
      return "ResourceFlow is pausing new " + label + " calls to stay inside the Firebase no-cost guard. Cached data will be shown where possible.";
    }
    if (state === "warning") {
      return "ResourceFlow is nearing the Firebase no-cost limit for " + label + ". The app may slow refreshes to protect the quota.";
    }
    return "";
  }

  function metricLabel(metric) {
    const labels = {
      reads: "Firestore reads",
      writes: "Firestore writes",
      deletes: "Firestore deletes",
      hostingDownloadsMbPerDay: "hosting downloads",
      bandwidthMbPerMonth: "monthly bandwidth"
    };
    return labels[metric] || metric;
  }

  function clampRatio(value, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return min;
    }
    return Math.min(max, Math.max(min, numeric));
  }

  function readCache(key, maxAgeMs) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      const age = Date.now() - Number(parsed.savedAt || 0);
      if (Number.isFinite(maxAgeMs) && maxAgeMs > 0 && age > maxAgeMs) {
        return null;
      }
      return parsed.value;
    } catch (error) {
      return null;
    }
  }

  function writeCache(key, value) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        savedAt: Date.now(),
        value: value
      }));
    } catch (error) {
      // Ignore cache failures and keep the live app running.
    }
    return value;
  }

  function clearCache(key) {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      // Ignore localStorage failures.
    }
  }

  function clearByPrefix(prefix) {
    try {
      const targetPrefix = CACHE_PREFIX + prefix;
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf(targetPrefix) === 0) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Ignore localStorage failures.
    }
  }

  function noteDownload(bytes) {
    const mb = Math.max(0, Number(bytes) || 0) / (1024 * 1024);
    if (!mb) {
      return null;
    }
    return record("hostingDownloadsMbPerDay", mb);
  }

  function noteBandwidth(bytes) {
    const mb = Math.max(0, Number(bytes) || 0) / (1024 * 1024);
    if (!mb) {
      return null;
    }
    return record("bandwidthMbPerMonth", mb);
  }

  window.ResourceFlowUsageGuard = {
    config: guardConfig,
    preview: preview,
    record: record,
    readCache: readCache,
    writeCache: writeCache,
    clearCache: clearCache,
    clearByPrefix: clearByPrefix,
    noteDownload: noteDownload,
    noteBandwidth: noteBandwidth,
    explain: function (metric) {
      return preview(metric, 0).message;
    }
  };
})();
