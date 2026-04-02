(function () {
  const STORAGE_KEY = "resourceflow-state-v4";
  const DEMO_AUTH_KEY = "resourceflow-demo-auth-v1";
  const PORTAL_SELECTION_KEY = "resourceflow-portal-selection-v1";
  const PORTAL_PROFILE_KEY = "resourceflow-portal-profile-v1";
  const REQUEST_DRAFT_KEY = "resourceflow-request-draft-v1";
  const VOLUNTEER_DRAFT_KEY = "resourceflow-volunteer-draft-v1";
  const ONBOARDING_KEY = "resourceflow-onboarding-v1";
  const DEMO_SCENARIO_KEY = "resourceflow-demo-scenario-v1";
  const UI_LANGUAGE_KEY = "resourceflow-ui-language-v1";
  const UI_PREFERENCES_KEY = "resourceflow-ui-preferences-v1";
  const OPS_NOTES_KEY = "resourceflow-ops-notes-v1";
  const MAX_ACTIVITY_LOG = 48;
  const MAX_HISTORY_SNAPSHOTS = 30;
  const MAX_TEXT_FIELD = 180;
  const MAX_NOTES_FIELD = 420;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_ZONES = ["North", "South", "East", "West", "Central"];
  const REQUEST_APPROVAL_STATES = ["pending", "approved", "rejected"];
  const WORKFLOW_SEQUENCE = ["pending", "assigned", "in-progress", "delivered", "closed"];
  const SCENARIO_OPTIONS = ["mixed", "flood", "medical", "shelter", "food"];
  const UI_LANGUAGE_OPTIONS = ["English", "Hinglish", "HindiRoman"];
  const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
  const ZONE_DISTANCE = {
    North: { North: 0, Central: 1, East: 2, West: 2, South: 3 },
    South: { South: 0, Central: 1, East: 2, West: 2, North: 3 },
    East: { East: 0, Central: 1, North: 2, South: 2, West: 2 },
    West: { West: 0, Central: 1, North: 2, South: 2, East: 2 },
    Central: { Central: 0, North: 1, South: 1, East: 1, West: 1 }
  };
  const SAMPLE_REQUESTS = [
    {
      id: uid(),
      organization: "Seva Relief Collective",
      title: "Flood relief meal distribution in East Zone",
      category: "Food Distribution",
      urgency: 5,
      peopleNeeded: 4,
      zone: "East",
      location: "Kolkata East community hub",
      beneficiaries: 180,
      skills: ["coordination", "food handling", "driving"],
      notes: "Rising water has disrupted kitchens in nearby wards. Pre-position meal kits before the evening delivery window.",
      createdAt: isoMinutesAgo(18)
    },
    {
      id: uid(),
      organization: "Health on Wheels",
      title: "Cyclone relief medical triage desk",
      category: "Medical Support",
      urgency: 4,
      peopleNeeded: 3,
      zone: "Central",
      location: "Kolkata Medical College area",
      beneficiaries: 95,
      skills: ["first aid", "registration", "translation"],
      notes: "Need patient queue support, form assistance, and one first-aid trained volunteer for post-storm triage.",
      createdAt: isoMinutesAgo(42)
    },
    {
      id: uid(),
      organization: "Night Shelter Network",
      title: "Displacement shelter kit sorting and intake setup",
      category: "Shelter Support",
      urgency: 3,
      peopleNeeded: 2,
      zone: "North",
      location: "North Kolkata shelter support hub",
      beneficiaries: 60,
      skills: ["logistics", "inventory"],
      notes: "Prepare intake tables before evening arrivals and sort blanket, water, and hygiene kits.",
      createdAt: isoMinutesAgo(86)
    },
    {
      id: uid(),
      organization: "Rapid River Response",
      title: "Boat dispatch and relief stock transfer",
      category: "Logistics",
      urgency: 5,
      peopleNeeded: 3,
      zone: "South",
      location: "Garden Reach flood response point",
      beneficiaries: 130,
      skills: ["logistics", "driving", "crowd support"],
      notes: "Track high-water route access and move verified supply batches toward temporary shelters.",
      createdAt: isoMinutesAgo(57)
    }
  ];

  const SAMPLE_VOLUNTEERS = [
    {
      id: uid(),
      name: "Aarav Mehta",
      zone: "East",
      location: "Salt Lake Sector V, Kolkata",
      availability: "Full Day",
      skills: ["coordination", "food handling", "driving"],
      transport: "Yes",
      experience: "Advanced",
      createdAt: isoMinutesAgo(15)
    },
    {
      id: uid(),
      name: "Diya Raman",
      zone: "Central",
      location: "Esplanade, Kolkata",
      availability: "Half Day",
      skills: ["registration", "translation", "teaching"],
      transport: "No",
      experience: "Intermediate",
      createdAt: isoMinutesAgo(34)
    },
    {
      id: uid(),
      name: "Kabir Joshi",
      zone: "Central",
      location: "Sealdah, Kolkata",
      availability: "Full Day",
      skills: ["first aid", "registration", "crowd support"],
      transport: "Yes",
      experience: "Advanced",
      createdAt: isoMinutesAgo(39)
    },
    {
      id: uid(),
      name: "Sana Patel",
      zone: "North",
      location: "Shyambazar, Kolkata",
      availability: "Weekend",
      skills: ["logistics", "inventory", "coordination"],
      transport: "Yes",
      experience: "Intermediate",
      createdAt: isoMinutesAgo(63)
    },
    {
      id: uid(),
      name: "Ishaan Verma",
      zone: "East",
      location: "Park Circus, Kolkata",
      availability: "Evening",
      skills: ["driving", "food handling", "logistics"],
      transport: "Yes",
      experience: "Beginner",
      createdAt: isoMinutesAgo(72)
    }
  ];

  const REQUEST_SAMPLES = [
    {
      organization: "Hope Kitchens",
      title: "Flood shelter lunch delivery support",
      category: "Food Distribution",
      urgency: 4,
      peopleNeeded: 3,
      zone: "West",
      location: "Behala community kitchen, Kolkata",
      beneficiaries: 80,
      skills: "food handling, elder care, coordination",
      notes: "Need one coordinator and two delivery volunteers to support a temporary relief shelter."
    },
    {
      organization: "Campus Care Hub",
      title: "Relief camp registration and family support desk",
      category: "Medical Support",
      urgency: 3,
      peopleNeeded: 4,
      zone: "South",
      location: "Jadavpur outreach center, Kolkata",
      beneficiaries: 65,
      skills: "registration, translation, coordination",
      notes: "Need intake support, family coordination, and field updates for a live camp."
    }
  ];

  const VOLUNTEER_SAMPLES = [
    {
      name: "Riya Shah",
      zone: "West",
      location: "Tollygunge, Kolkata",
      availability: "Weekend",
      skills: "elder care, food handling, coordination",
      transport: "No",
      experience: "Intermediate"
    },
    {
      name: "Aditya Kumar",
      zone: "South",
      location: "Garia, Kolkata",
      availability: "Half Day",
      skills: "teaching, translation, registration",
      transport: "Yes",
      experience: "Beginner"
    }
  ];

  const DEMO_ROLE_PROFILES = {
    user: {
      role: "user",
      title: "Community User",
      displayName: "Aditi Das",
      email: "user@resourceflow.demo",
      summary: "Check trusted updates, browse public impact, and view response progress in your area.",
      bullets: ["Citizen access", "Read-only updates", "Impact and help desk views"]
    },
    volunteer: {
      role: "volunteer",
      title: "Volunteer Responder",
      displayName: "Sana Patel",
      email: "volunteer@resourceflow.demo",
      summary: "Register availability, discover high-impact tasks, and join field response safely.",
      bullets: ["Volunteer Portal access", "Opportunity guidance", "Training and outreach tools"]
    },
    government: {
      role: "government",
      title: "Government Officer",
      displayName: "Ravi Sen",
      email: "gov@resourceflow.demo",
      summary: "Manage requests, run matching, review forecasts, and coordinate ground operations.",
      bullets: ["Operations dashboard", "Matching controls", "AidFlow forecast and dispatch"]
    },
    admin: {
      role: "admin",
      title: "Platform Admin",
      displayName: "Shri Sundaram",
      email: "acshrisundaram@gmail.com",
      summary: "Review governance, change roles, inspect audit signals, and oversee the full workspace.",
      bullets: ["Admin console", "Role controls", "Audit and notification oversight"]
    }
  };

  const DEMO_PORTAL_ROUTES = {
    user: "./overview.html",
    volunteer: "./volunteer.html",
    government: "./operations.html",
    coordinator: "./operations.html",
    admin: "./admin.html"
  };

  const ROLE_PAGE_ACCESS = {
    guest: [],
    user: ["home", "impact"],
    volunteer: ["home", "volunteer", "insights", "impact"],
    government: ["home", "operations", "insights", "impact"],
    coordinator: ["home", "operations", "insights", "impact"],
    admin: ["home", "operations", "volunteer", "insights", "admin", "judge", "impact"]
  };

  const state = {
    data: createEmptyState(),
    adapter: null,
    functions: null,
    storageMode: "local",
    clientId: "Coordinator-" + uid().slice(3, 7).toUpperCase(),
    syncStatus: "Starting",
    syncDetail: "Preparing workspace connection.",
    lastSyncAt: null,
    unsubscribeRemote: null,
    user: null,
    demoSession: null,
    pendingDemoRole: "",
    pendingRequestedRole: "",
    pendingPortalRole: "",
    selectedPortalRole: "",
    portalProfiles: {},
    authResolved: false,
    pendingSignupLocation: "",
    pendingAuthMode: "signin",
    role: "guest",
    userProfile: null,
    analytics: null,
    adminSnapshot: null,
    adminLoading: false,
    adminError: "",
    localErrors: [],
    localNotifications: [],
    pendingUndo: null,
    requestEditId: "",
    volunteerEditId: "",
    routeMap: null,
    routeRenderer: null,
    routeService: null,
    routeCache: {},
    geminiBusy: false,
    selectedAidToken: "",
    lastVerifiedToken: "",
    onboardingSeen: false,
    onboardingStep: 0,
    uiLanguage: "English",
    uiPreferences: {
      highContrast: false,
      reducedMotion: false,
      fontScale: "default",
      notificationsEnabled: false
    },
    opsNotes: {
      briefing: "",
      handoff: "",
      incident: ""
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.__RESOURCEFLOW_TEST_MODE__) {
      bootstrap();
    }
  });

  async function bootstrap() {
    highlightActiveNav();
    ensureAuthShell();
    ensureDemoAuthModal();
    ensureEmailAuthModal();
    ensureTourDialog();
    loadDemoSession();
    loadSelectedPortal();
    loadPortalProfiles();
    loadOnboardingState();
    loadUiLanguage();
    loadUiPreferences();
    loadOpsNotes();
    applyUiPreferences();
    renderAuthUi();
    bindGlobalActions();
    bindEntityActions();
    bindCrossTabSync();
    bindGlobalErrorMonitoring();
    updateSyncStatus("Connecting", "Checking storage adapter and workspace access.");
    state.adapter = await createAdapter();
    state.storageMode = state.adapter.mode;
    await initializeFirebaseRuntime();

    try {
      const loaded = await state.adapter.load();
      state.data = sanitizeState(loaded || createEmptyState());
      updateSyncStatus(
        state.storageMode === "firebase" ? "Cloud Connected" : "Offline Ready",
        state.storageMode === "firebase"
          ? "Cloud workspace connected. Realtime updates are active."
          : "Local mode active. Data is kept in your browser for offline use."
      );
    } catch (error) {
      console.warn("Primary storage unavailable, switching to local mode.", error);
      state.adapter = createLocalAdapter();
      state.storageMode = state.adapter.mode;
      const fallbackData = await state.adapter.load();
      state.data = sanitizeState(fallbackData || createEmptyState());
      updateSyncStatus("Offline Fallback", "Cloud access failed. Running safely in local mode.");
    }

    startRealtimeSync();
    enforcePortalAccess();
    renderAll();
    bindPageHandlers();
    maybeLaunchOnboarding();
  }

  function createEmptyState() {
    const now = new Date().toISOString();
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
        updatedAt: now
      },
      lastUpdated: now
    };
  }

  function createDemoState() {
    return createScenarioDemoState(loadDemoScenario());
  }

  function createScenarioDemoState(mode) {
    const now = new Date().toISOString();
    const preset = buildScenarioPreset(mode || "mixed");
    const next = {
      requests: clone(preset.requests),
      volunteers: clone(preset.volunteers),
      assignments: [],
      artifacts: [],
      activityLog: [],
      history: [],
      meta: {
        revision: 1,
        updatedBy: state.clientId,
        updatedAt: now
      },
      lastUpdated: now
    };
    next.assignments = generateAssignments(next);
    next.activityLog = [
      {
        id: uid(),
        type: "system",
        actor: state.clientId,
        at: now,
        message: "Demo workspace was loaded in " + scenarioTitle(mode || "mixed") + " mode with sample requests and volunteers."
      }
    ];
    return next;
  }

  function buildScenarioPreset(mode) {
    const scenario = normalizeScenario(mode);
    if (scenario === "flood") {
      return {
        requests: [
          sanitizeRequestRecord({
            id: uid(),
            organization: "Rapid River Response",
            title: "Flood shelter meal dispatch",
            category: "Food Distribution",
            urgency: 5,
            peopleNeeded: 4,
            zone: "East",
            location: "Salt Lake shelter cluster, Kolkata",
            beneficiaries: 210,
            skills: ["coordination", "food handling", "driving"],
            notes: "Water levels are rising across nearby shelter clusters and families need pre-positioned meal kits before evening.",
            scenario: "flood",
            approvalStatus: "approved",
            workflowStatus: "assigned",
            shiftLabel: "Today - Evening"
          }),
          sanitizeRequestRecord({
            id: uid(),
            organization: "Seva Relief Collective",
            title: "Boat dispatch support and stock transfer",
            category: "Logistics",
            urgency: 5,
            peopleNeeded: 3,
            zone: "South",
            location: "Garden Reach flood point",
            beneficiaries: 140,
            skills: ["logistics", "driving", "crowd support"],
            notes: "Need fast dispatch support as relief batches move through flooded roads and temporary landing points.",
            scenario: "flood",
            approvalStatus: "pending",
            workflowStatus: "pending",
            shiftLabel: "Tomorrow - Morning"
          })
        ],
        volunteers: [
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Aarav Mehta",
            zone: "East",
            location: "Salt Lake Sector V, Kolkata",
            availability: "Full Day",
            skills: ["coordination", "food handling", "driving"],
            transport: "Yes",
            experience: "Advanced",
            shiftPreference: "Today - Evening"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Sana Patel",
            zone: "South",
            location: "Behala, Kolkata",
            availability: "Half Day",
            skills: ["logistics", "inventory", "crowd support"],
            transport: "Yes",
            experience: "Intermediate",
            shiftPreference: "Tomorrow - Morning"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Kabir Joshi",
            zone: "Central",
            location: "Sealdah, Kolkata",
            availability: "Full Day",
            skills: ["first aid", "registration", "crowd support"],
            transport: "Yes",
            experience: "Advanced",
            shiftPreference: "Today - Afternoon"
          })
        ]
      };
    }
    if (scenario === "medical") {
      return {
        requests: [
          sanitizeRequestRecord({
            id: uid(),
            organization: "Health on Wheels",
            title: "Mobile health camp registration desk",
            category: "Medical Support",
            urgency: 4,
            peopleNeeded: 3,
            zone: "Central",
            location: "Esplanade outreach point",
            beneficiaries: 95,
            skills: ["registration", "first aid", "translation"],
            notes: "Support patient triage, form filling, and family direction for a high-volume mobile health camp.",
            scenario: "medical",
            approvalStatus: "approved",
            workflowStatus: "in-progress",
            shiftLabel: "Today - Afternoon"
          }),
          sanitizeRequestRecord({
            id: uid(),
            organization: "Campus Care Hub",
            title: "Medicine desk inventory and family counselling",
            category: "Medical Support",
            urgency: 3,
            peopleNeeded: 2,
            zone: "North",
            location: "Shyambazar clinic support hub",
            beneficiaries: 58,
            skills: ["inventory", "registration", "elder care"],
            notes: "Need calm volunteers for medicine handoff, registration support, and elder-friendly assistance.",
            scenario: "medical",
            approvalStatus: "approved",
            workflowStatus: "assigned",
            shiftLabel: "Tomorrow - Morning"
          })
        ],
        volunteers: [
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Diya Raman",
            zone: "Central",
            location: "Esplanade, Kolkata",
            availability: "Half Day",
            skills: ["registration", "translation", "teaching"],
            transport: "No",
            experience: "Intermediate",
            shiftPreference: "Today - Afternoon"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Kabir Joshi",
            zone: "Central",
            location: "Sealdah, Kolkata",
            availability: "Full Day",
            skills: ["first aid", "registration", "crowd support"],
            transport: "Yes",
            experience: "Advanced",
            shiftPreference: "Today - Afternoon"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Riya Shah",
            zone: "North",
            location: "Shyambazar, Kolkata",
            availability: "Weekend",
            skills: ["elder care", "registration", "inventory"],
            transport: "No",
            experience: "Intermediate",
            shiftPreference: "Tomorrow - Morning"
          })
        ]
      };
    }
    if (scenario === "shelter") {
      return {
        requests: [
          sanitizeRequestRecord({
            id: uid(),
            organization: "Night Shelter Network",
            title: "Displacement shelter intake and bedding setup",
            category: "Shelter Support",
            urgency: 4,
            peopleNeeded: 4,
            zone: "North",
            location: "North Kolkata shelter hub",
            beneficiaries: 110,
            skills: ["inventory", "coordination", "elder care"],
            notes: "Prepare intake desks, bedding, and family support packs before the next shelter intake window.",
            scenario: "shelter",
            approvalStatus: "pending",
            workflowStatus: "pending",
            shiftLabel: "Today - Evening"
          }),
          sanitizeRequestRecord({
            id: uid(),
            organization: "Relief Housing Alliance",
            title: "Child-safe quiet corner and registration support",
            category: "Shelter Support",
            urgency: 3,
            peopleNeeded: 2,
            zone: "West",
            location: "Behala community shelter",
            beneficiaries: 45,
            skills: ["teaching", "registration", "coordination"],
            notes: "Need volunteers to support families, safe child space setup, and intake support.",
            scenario: "shelter",
            approvalStatus: "approved",
            workflowStatus: "assigned",
            shiftLabel: "Tomorrow - Afternoon"
          })
        ],
        volunteers: [
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Sana Patel",
            zone: "North",
            location: "Shyambazar, Kolkata",
            availability: "Weekend",
            skills: ["logistics", "inventory", "coordination"],
            transport: "Yes",
            experience: "Intermediate",
            shiftPreference: "Today - Evening"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Aditya Kumar",
            zone: "West",
            location: "Tollygunge, Kolkata",
            availability: "Half Day",
            skills: ["teaching", "translation", "registration"],
            transport: "Yes",
            experience: "Beginner",
            shiftPreference: "Tomorrow - Afternoon"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Maya Sen",
            zone: "North",
            location: "Dum Dum, Kolkata",
            availability: "Full Day",
            skills: ["elder care", "inventory", "crowd support"],
            transport: "No",
            experience: "Intermediate",
            shiftPreference: "Today - Evening"
          })
        ]
      };
    }
    if (scenario === "food") {
      return {
        requests: [
          sanitizeRequestRecord({
            id: uid(),
            organization: "Hope Kitchens",
            title: "Community meal distribution at ward shelter",
            category: "Food Distribution",
            urgency: 4,
            peopleNeeded: 3,
            zone: "West",
            location: "Behala ward support point",
            beneficiaries: 160,
            skills: ["food handling", "coordination", "driving"],
            notes: "Need safe meal packing, dispatch, and queue support for a large evening distribution.",
            scenario: "food",
            approvalStatus: "approved",
            workflowStatus: "assigned",
            shiftLabel: "Today - Evening"
          }),
          sanitizeRequestRecord({
            id: uid(),
            organization: "Seva Relief Collective",
            title: "Breakfast kit sorting for migrant support line",
            category: "Food Distribution",
            urgency: 3,
            peopleNeeded: 2,
            zone: "Central",
            location: "Sealdah family support desk",
            beneficiaries: 70,
            skills: ["inventory", "food handling"],
            notes: "Need volunteers to sort dry ration and breakfast kits before morning issue.",
            scenario: "food",
            approvalStatus: "pending",
            workflowStatus: "pending",
            shiftLabel: "Tomorrow - Morning"
          })
        ],
        volunteers: [
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Ishaan Verma",
            zone: "West",
            location: "Park Circus, Kolkata",
            availability: "Evening",
            skills: ["driving", "food handling", "logistics"],
            transport: "Yes",
            experience: "Beginner",
            shiftPreference: "Today - Evening"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Aarav Mehta",
            zone: "West",
            location: "Behala, Kolkata",
            availability: "Full Day",
            skills: ["coordination", "food handling", "driving"],
            transport: "Yes",
            experience: "Advanced",
            shiftPreference: "Today - Evening"
          }),
          sanitizeVolunteerRecord({
            id: uid(),
            name: "Neha Das",
            zone: "Central",
            location: "Sealdah, Kolkata",
            availability: "Half Day",
            skills: ["inventory", "food handling", "registration"],
            transport: "No",
            experience: "Intermediate",
            shiftPreference: "Tomorrow - Morning"
          })
        ]
      };
    }
    return {
      requests: clone(SAMPLE_REQUESTS).map(function (item) {
        return sanitizeRequestRecord(item);
      }),
      volunteers: clone(SAMPLE_VOLUNTEERS).map(function (item) {
        return sanitizeVolunteerRecord(item);
      })
    };
  }

  function sanitizeState(input) {
    const next = input && typeof input === "object" ? input : {};
    const requests = Array.isArray(next.requests)
      ? next.requests.map(sanitizeRequestRecord).filter(Boolean)
      : [];
    const volunteers = Array.isArray(next.volunteers)
      ? next.volunteers.map(sanitizeVolunteerRecord).filter(Boolean)
      : [];
    const assignments = Array.isArray(next.assignments)
      ? next.assignments.map(sanitizeAssignmentRecord).filter(Boolean)
      : [];
    const artifacts = Array.isArray(next.artifacts)
      ? next.artifacts.map(sanitizeArtifactRecord).filter(Boolean)
      : [];
    const activityLog = Array.isArray(next.activityLog)
      ? next.activityLog.map(sanitizeActivityRecord).filter(Boolean).slice(0, MAX_ACTIVITY_LOG)
      : [];
    const history = Array.isArray(next.history)
      ? next.history.map(sanitizeHistoryRecord).filter(Boolean).slice(0, MAX_HISTORY_SNAPSHOTS)
      : [];
    const meta = sanitizeMeta(next.meta);
    const lastUpdated = safeIso(next.lastUpdated || meta.updatedAt || new Date().toISOString());
    return {
      requests: requests,
      volunteers: volunteers,
      assignments: assignments,
      artifacts: artifacts,
      activityLog: activityLog,
      history: history,
      meta: meta,
      lastUpdated: lastUpdated
    };
  }

  async function createAdapter() {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    const canUseFirebase = Boolean(config.enabled && config.apiKey && !String(config.apiKey).startsWith("YOUR_"));

    if (!canUseFirebase) {
      return createLocalAdapter();
    }

    try {
      await ensureFirebaseScripts();
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }

      const db = window.firebase.firestore();
      const collectionId = config.collectionId || "resourceflow";
      const workspaceId = config.workspaceId || "resourceflow-demo";
      const docRef = db.collection(collectionId).doc(workspaceId);

      // Probe Firestore once so missing database or denied access falls back safely.
      await docRef.get();

      return {
        mode: "firebase",
        async load() {
          const snap = await docRef.get();
          if (snap.exists && snap.data() && snap.data().state) {
            const remoteState = sanitizeState(snap.data().state);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
            return remoteState;
          }

          const demo = createDemoState();
          await docRef.set(
            {
              state: demo,
              updatedAt: demo.lastUpdated,
              updatedBy: state.clientId,
              revision: demo.meta.revision
            },
            { merge: true }
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
          return demo;
        },
        async save(next) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          await docRef.set(
            {
              state: next,
              updatedAt: next.lastUpdated,
              updatedBy: state.clientId,
              revision: next.meta && next.meta.revision ? next.meta.revision : 0
            },
            { merge: true }
          );
        },
        subscribe(onData, onError) {
          return docRef.onSnapshot(function (snap) {
            if (!snap.exists || !snap.data() || !snap.data().state) {
              return;
            }
            const remoteState = sanitizeState(snap.data().state);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
            onData(remoteState, {
              updatedAt: snap.data().updatedAt,
              updatedBy: snap.data().updatedBy,
              revision: snap.data().revision
            });
          }, function (error) {
            if (typeof onError === "function") {
              onError(error);
            }
          });
        }
      };
    } catch (error) {
      console.warn("Firebase unavailable, falling back to local mode.", error);
      return createLocalAdapter();
    }
  }

  function createLocalAdapter() {
    return {
      mode: "local",
      async load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const seeded = createDemoState();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
          return seeded;
        }
        try {
          const parsed = sanitizeState(JSON.parse(raw));
          if (isBlankWorkspace(parsed)) {
            const seeded = createDemoState();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
            return seeded;
          }
          return parsed;
        } catch (error) {
          const seeded = createDemoState();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
          return seeded;
        }
      },
      async save(next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      },
      subscribe(onData) {
        const handler = function (event) {
          if (event.key !== STORAGE_KEY || !event.newValue) {
            return;
          }
          try {
            const payload = sanitizeState(JSON.parse(event.newValue));
            onData(payload, {
              updatedAt: payload.lastUpdated,
              updatedBy: payload.meta ? payload.meta.updatedBy : "local-tab",
              revision: payload.meta ? payload.meta.revision : 0
            });
          } catch (error) {
            console.warn("Could not parse cross-tab update payload.", error);
          }
        };
        window.addEventListener("storage", handler);
        return function () {
          window.removeEventListener("storage", handler);
        };
      }
    };
  }

  async function initializeFirebaseRuntime() {
    const config = getFirebaseConfig();
    if (!config.enabled) {
      if (state.demoSession) {
        applyDemoSessionState();
      } else {
        state.role = "guest";
        state.userProfile = null;
      }
      renderAuthUi();
      return;
    }

    try {
      await ensureFirebaseScripts();
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      state.functions = getFunctionsClient();
      initializeAppCheck();
      initializeAnalytics();
      initializeAuth();
    } catch (error) {
      console.warn("Firebase runtime initialization failed.", error);
      state.authResolved = true;
      renderAuthUi();
    }
  }

  function loadDemoSession() {
    try {
      const raw = localStorage.getItem(DEMO_AUTH_KEY);
      if (!raw) {
        state.demoSession = null;
        if (!state.user) {
          state.role = "guest";
          state.userProfile = null;
        }
        return;
      }
      const parsed = JSON.parse(raw);
      const role = normalizeRole(parsed && parsed.role);
      if (!DEMO_ROLE_PROFILES[role]) {
        state.demoSession = null;
        if (!state.user) {
          state.role = "guest";
          state.userProfile = null;
        }
        localStorage.removeItem(DEMO_AUTH_KEY);
        return;
      }
      state.demoSession = createDemoSession(role, parsed);
      if (!state.user) {
        applyDemoSessionState();
      }
    } catch (error) {
      console.warn("Could not restore demo session.", error);
      state.demoSession = null;
      if (!state.user) {
        state.role = "guest";
        state.userProfile = null;
      }
    }
  }

  function loadSelectedPortal() {
    try {
      const stored = localStorage.getItem(PORTAL_SELECTION_KEY);
      state.selectedPortalRole = normalizeRole(stored);
      if (state.selectedPortalRole === "guest") {
        state.selectedPortalRole = "";
      }
    } catch (error) {
      state.selectedPortalRole = "";
    }
  }

  function loadPortalProfiles() {
    try {
      const raw = localStorage.getItem(PORTAL_PROFILE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      state.portalProfiles = parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      state.portalProfiles = {};
    }
  }

  function activeAccessRole() {
    return normalizeRole(state.selectedPortalRole || state.role || "guest");
  }

  function activePortalProfile() {
    const role = activeAccessRole();
    return state.portalProfiles && state.portalProfiles[role] && typeof state.portalProfiles[role] === "object"
      ? state.portalProfiles[role]
      : {};
  }

  function activePortalSummary(fallback) {
    const profile = activePortalProfile();
    return safeText(profile.primarySummary || profile.secondarySummary || fallback || "", 180);
  }

  function persistSelectedPortal() {
    try {
      if (state.selectedPortalRole) {
        localStorage.setItem(PORTAL_SELECTION_KEY, state.selectedPortalRole);
      } else {
        localStorage.removeItem(PORTAL_SELECTION_KEY);
      }
    } catch (error) {
      console.warn("Could not persist portal selection.", error);
    }
  }

  function createDemoSession(role, overrides) {
    const profile = DEMO_ROLE_PROFILES[normalizeRole(role)] || DEMO_ROLE_PROFILES.volunteer;
    const next = overrides && typeof overrides === "object" ? overrides : {};
    return {
      uid: safeText(next.uid || ("demo-" + profile.role), 40),
      role: profile.role,
      title: profile.title,
      displayName: safeText(next.displayName || profile.displayName, 80),
      email: safeText(next.email || profile.email, 140),
      summary: profile.summary,
      createdAt: safeIso(next.createdAt || new Date().toISOString())
    };
  }

  function applyDemoSessionState() {
    if (!state.demoSession) {
      state.role = "guest";
      state.userProfile = null;
      return;
    }
    state.role = normalizeRole(state.demoSession.role);
    state.userProfile = {
      uid: state.demoSession.uid,
      email: state.demoSession.email,
      displayName: state.demoSession.displayName,
      role: state.role,
      requestedRole: state.pendingRequestedRole || state.role
    };
  }

  function persistDemoSession() {
    if (state.demoSession) {
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(state.demoSession));
      return;
    }
    localStorage.removeItem(DEMO_AUTH_KEY);
  }

  function initializeAnalytics() {
    const config = getFirebaseConfig();
    if (!config.measurementId || !window.firebase.analytics || !/^https?:$/i.test(window.location.protocol)) {
      return;
    }
    try {
      state.analytics = state.analytics || window.firebase.analytics();
    } catch (error) {
      console.warn("Analytics initialization skipped.", error);
    }
  }

  function initializeAppCheck() {
    const config = getFirebaseConfig();
    if (
      !config.enableAppCheck
      || !config.appCheckSiteKey
      || !window.firebase.appCheck
      || !/^https?:$/i.test(window.location.protocol)
      || window.__resourceFlowAppCheckBound === true
    ) {
      return;
    }
    try {
      window.__resourceFlowAppCheckBound = true;
      window.firebase.appCheck().activate(config.appCheckSiteKey, true);
    } catch (error) {
      console.warn("App Check initialization skipped.", error);
    }
  }

  function initializeAuth() {
    const config = getFirebaseConfig();
    if (!config.enableAuth || !window.firebase.auth) {
      state.authResolved = true;
      renderAuthUi();
      return;
    }
    if (window.__resourceFlowAuthBound === true) {
      renderAuthUi();
      return;
    }

    window.__resourceFlowAuthBound = true;
    window.firebase.auth().onAuthStateChanged(async function (user) {
      state.authResolved = true;
      const previousUid = state.user && state.user.uid ? state.user.uid : "";
      state.user = user || null;
      if (user) {
      if (!previousUid || previousUid !== user.uid) {
        state.selectedPortalRole = "";
        persistSelectedPortal();
      }
        state.demoSession = null;
        persistDemoSession();
        state.role = normalizeRole(state.selectedPortalRole || state.role || "user");
        await syncUserProfile(user);
        trackEvent("resourceflow_sign_in", {
          role: state.role
        });
      } else {
        if (state.demoSession) {
          applyDemoSessionState();
        } else {
          state.role = "guest";
          state.userProfile = null;
          state.selectedPortalRole = "";
          persistSelectedPortal();
        }
      }
      renderAuthUi();
      renderAll();
      maybeHandlePostAuthRouting();
    });
    renderAuthUi();
  }

  async function syncUserProfile(user) {
    try {
      const db = getFirestoreDb();
      if (!db || !user) {
        return;
      }
      const profileRef = db.collection("resourceflowUsers").doc(user.uid);
      const snapshot = await profileRef.get();
      const existing = snapshot.exists && snapshot.data() ? snapshot.data() : {};
      const capabilityRole = resolveRoleForEmail(user.email || "");
      const preferredRole = normalizeRole(state.selectedPortalRole || state.pendingRequestedRole || existing.role || "user");
      const requestedRole = normalizeRole(state.pendingRequestedRole || existing.requestedRole || preferredRole || "user");
      const claimedRole = await resolveRoleFromClaims(user);
      const baseRole = preferredRole === "admin" && capabilityRole !== "admin"
        ? normalizeRole(existing.role || "user")
        : preferredRole;
      const currentRole = hasSecureBackend()
        ? (claimedRole !== "guest" ? claimedRole : baseRole)
        : baseRole;
      const profile = {
        uid: user.uid,
        email: safeText(user.email || "", 140),
        displayName: safeText(user.displayName || deriveNameFromEmail(user.email || "ResourceFlow User"), 80),
        photoURL: safeText(user.photoURL || "", 300),
        location: safeText(existing.location || state.pendingSignupLocation || "", 120),
        role: currentRole,
        requestedRole: requestedRole,
        updatedAt: new Date().toISOString(),
        updatedBy: currentActor()
      };
      await profileRef.set(profile, { merge: true });
      state.userProfile = profile;
      state.role = currentRole;
      state.pendingRequestedRole = "";
      state.pendingSignupLocation = "";
      if (state.storageMode === "local" && getFirebaseConfig().enabled) {
        state.adapter = await createAdapter();
        state.storageMode = state.adapter.mode;
        startRealtimeSync();
      }
    } catch (error) {
      console.warn("User profile sync failed.", error);
    }
  }

  function ensureAuthShell() {
    if (document.getElementById("authPanel")) {
      return;
    }
    const headerActions = document.querySelector(".header-actions");
    if (!headerActions) {
      return;
    }
    const authPanel = document.createElement("div");
    authPanel.id = "authPanel";
    authPanel.className = "auth-panel";
    authPanel.innerHTML = [
      '<div class="auth-copy">',
      '<strong id="authUserLabel">Secure access available</strong>',
      '<small id="authRoleLabel">Sign in or create your account to enter the workspace.</small>',
      "</div>",
      '<label class="inline-select auth-language-select" aria-label="Workspace language">',
      '<span>Workspace Language</span>',
      '<select id="uiLanguageSelect">',
      UI_LANGUAGE_OPTIONS.map(function (option) {
        var label = option === "HindiRoman" ? "Hindi (Romanized)" : option;
        return '<option value="' + escapeHtml(option) + '">' + escapeHtml(label) + "</option>";
      }).join(""),
      "</select>",
      "</label>",
      '<div class="auth-actions">',
      '<button class="ghost-button" id="signInButton" type="button">Sign In</button>',
      '<button class="ghost-button" id="tourButton" type="button">Quick Tour</button>',
      '<button class="ghost-button" id="switchRoleButton" type="button" hidden>Switch Portal</button>',
      '<button class="ghost-button" id="signOutButton" type="button" hidden>Sign Out</button>',
      "</div>"
    ].join("");
    headerActions.prepend(authPanel);
  }

  function ensureScreenLockOverlay() {
    var overlay = document.getElementById("screenLockOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "screenLockOverlay";
      overlay.className = "screen-lock-overlay";
      overlay.innerHTML = [
        '<div class="screen-lock-card auth-surface" role="dialog" aria-modal="true" aria-labelledby="screenLockTitle">',
        '<section class="screen-lock-form-panel">',
        '<div class="screen-lock-brand-row">',
        '<div class="screen-lock-brand"><span class="brand-mark">RF</span><div><strong>ResourceFlow</strong><small>Human-centered response platform</small></div></div>',
        '<button class="screen-lock-close" id="screenLockClose" type="button" aria-label="Close lock screen">×</button>',
        '</div>',
        '<p class="eyebrow">Secure Access</p>',
        '<h1 id="screenLockTitle">Enter your workspace</h1>',
        '<p id="screenLockText" class="card-meta">Sign in with your email/password or Google account before entering the live coordination interface.</p>',
        '<div class="screen-lock-mode-tabs">',
        '<button class="ghost-button is-active" type="button" data-lock-auth-mode="signin">Sign In</button>',
        '<button class="ghost-button" type="button" data-lock-auth-mode="signup">Create Account</button>',
        '<button class="ghost-button" type="button" data-lock-auth-mode="reset">Reset</button>',
        '</div>',
        '<p id="screenLockStatus" class="screen-lock-status" role="status" aria-live="polite">Sign in with your existing account to continue.</p>',
        '<form id="screenLockForm" class="screen-lock-form" aria-label="Workspace sign in form">',
        '<label class="screen-lock-signup-only">Full name<input id="screenLockNameInput" name="displayName" type="text" placeholder="Shri Sundaram"></label>',
        '<label class="screen-lock-signup-only">Location<input id="screenLockLocationInput" name="location" type="text" placeholder="Kolkata, West Bengal"></label>',
        '<label>Email<input id="screenLockEmailInput" name="email" type="email" placeholder="you@example.com" required></label>',
        '<label class="screen-lock-password-wrap">Password<input id="screenLockPasswordInput" name="password" type="password" placeholder="Enter your password" required></label>',
        '<button class="primary-button screen-lock-submit" id="screenLockSubmit" type="submit">Sign In</button>',
        '</form>',
        '<div class="screen-lock-secondary-actions">',
        '<button class="ghost-button" id="screenLockGoogle" type="button">Continue with Google</button>',
        '<button class="ghost-button" id="screenLockDemo" type="button">Preview Demo Access</button>',
        '</div>',
        '<p id="screenLockFootnote" class="card-meta screen-lock-footnote">Use your email and password to enter the shared workspace. New accounts begin as community users until they choose a working portal.</p>',
        '</section>',
        '<aside class="screen-lock-visual-panel" aria-hidden="true">',
        '<div class="screen-lock-visual-backdrop"></div>',
        '<div class="screen-lock-hero-card">',
        '<div class="screen-lock-floating screen-lock-floating-top"><strong>Task review with field team</strong><span>09:30 AM - 10:00 AM</span></div>',
        '<div class="screen-lock-visual-copy">',
        '<p class="eyebrow">Live coordination</p>',
        '<h2>Move from scattered requests to calm, visible response operations.</h2>',
        '<p>ResourceFlow brings approvals, assignments, volunteer readiness, and impact proof into one clean system for communities, volunteers, agencies, and admins.</p>',
        '</div>',
        '<div class="screen-lock-mini-calendar">',
        '<span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>',
        '<strong>22</strong><strong>23</strong><strong>24</strong><strong>25</strong><strong>26</strong><strong>27</strong><strong>28</strong>',
        '</div>',
        '<div class="screen-lock-floating screen-lock-floating-bottom"><strong>Daily briefing</strong><span>Three priority zones, two mobile units, one delayed supply route.</span></div>',
        '</div>',
        '</aside>',
        '</div>'
      ].join("");
      document.body.appendChild(overlay);
    }
    if (overlay.dataset.bound === "true") {
      return;
    }
    overlay.dataset.bound = "true";
    overlay.addEventListener("click", function (event) {
      var modeButton = event.target.closest("[data-lock-auth-mode]");
      if (modeButton) {
        setScreenLockAuthMode(modeButton.dataset.lockAuthMode || "signin");
        return;
      }
      if (event.target.closest("#screenLockGoogle")) {
        signInWithGoogle();
        return;
      }
      if (event.target.closest("#screenLockDemo")) {
        openDemoRoleDialog();
        return;
      }
      if (event.target.closest("#screenLockClose")) {
        openDemoRoleDialog();
      }
    });

    const form = document.getElementById("screenLockForm");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitScreenLockForm(form);
      });
    }
  }

  function renderScreenLock() {
    ensureScreenLockOverlay();
    const overlay = document.getElementById("screenLockOverlay");
    if (!overlay) {
      return;
    }
    const locked = !hasActiveSession();
    document.body.classList.toggle("site-locked", locked);
    overlay.hidden = !locked;
    setText("#screenLockText", getFirebaseConfig().enableAuth
      ? "Sign in with email/password or Google before entering the live coordination interface."
      : "Choose a demo role and password to unlock the prototype workspace.");
    setScreenLockAuthMode(currentEmailAuthMode());
  }

  function ensurePortalSelectionOverlay() {
    if (document.getElementById("portalSelectionOverlay")) {
      return;
    }
    const overlay = document.createElement("div");
    overlay.id = "portalSelectionOverlay";
    overlay.className = "portal-selection-overlay";
    overlay.hidden = true;
    overlay.innerHTML = [
      '<div class="portal-selection-card" role="dialog" aria-modal="true" aria-labelledby="portalSelectionTitle">',
      '<div class="portal-selection-header">',
      '<div>',
      '<p class="eyebrow">Choose Portal</p>',
      '<h2 id="portalSelectionTitle">Select how you want to enter ResourceFlow</h2>',
      '<p class="card-meta">Pick the portal that matches your work today. You can switch later after signing in.</p>',
      '</div>',
      '<button class="ghost-button" id="portalSelectionSignOut" type="button">Sign Out</button>',
      '</div>',
      '<div class="portal-selection-grid">',
      renderPortalOptionCard("user", "Community User", "Read trusted updates, impact summaries, and public response information.", ["Read-only access", "Public impact", "Safe community view"], "citizen"),
      renderPortalOptionCard("volunteer", "Volunteer", "Register availability, track assignments, and support active response work.", ["Volunteer portal", "Opportunities", "Readiness tools"], "volunteer"),
      renderPortalOptionCard("government", "Government", "Coordinate requests, run matching, and monitor zone-level operations.", ["Operations center", "Analytics", "Dispatch tools"], "government"),
      renderPortalOptionCard("admin", "Admin", "Review approvals, users, governance, and full workspace control.", ["Admin console", "Role review", "Audit oversight"], "admin"),
      '</div>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);
    overlay.querySelectorAll("[data-portal-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        completePortalSelection(button.dataset.portalChoice || "user");
      });
    });
    const signOutButton = document.getElementById("portalSelectionSignOut");
    if (signOutButton) {
      signOutButton.addEventListener("click", function () {
        signOutSession();
      });
    }
  }

  function renderPortalOptionCard(role, title, summary, bullets, tone) {
    return [
      '<article class="portal-selection-option portal-selection-option-' + escapeHtml(tone || role) + '">',
      '<p class="eyebrow">' + escapeHtml(title) + '</p>',
      '<h3>' + escapeHtml(title) + '</h3>',
      '<p>' + escapeHtml(summary) + '</p>',
      '<ul>',
      bullets.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join(""),
      '</ul>',
      '<button class="primary-button" type="button" data-portal-choice="' + escapeHtml(role) + '">Open ' + escapeHtml(title) + '</button>',
      '</article>'
    ].join("");
  }

  function shouldShowPortalSelection() {
    return hasActiveSession() && !state.selectedPortalRole && currentPageName() !== "tests";
  }

  function renderPortalSelection() {
    ensurePortalSelectionOverlay();
    const overlay = document.getElementById("portalSelectionOverlay");
    if (!overlay) {
      return;
    }
    const visible = shouldShowPortalSelection();
    overlay.hidden = !visible;
    document.body.classList.toggle("portal-selection-open", visible);
  }

  function completePortalSelection(role) {
    const normalized = normalizeRole(role);
    state.selectedPortalRole = normalized;
    state.pendingPortalRole = normalized;
    persistSelectedPortal();
    renderPortalSelection();
    redirectToPortal(normalized);
  }

  function setScreenLockAuthMode(mode) {
    const normalized = ["signin", "signup", "reset"].indexOf(String(mode || "").toLowerCase()) >= 0
      ? String(mode || "").toLowerCase()
      : "signin";
    state.pendingAuthMode = normalized;
    const submitButton = document.getElementById("screenLockSubmit");
    const footnoteNode = document.getElementById("screenLockFootnote");
    const statusNode = document.getElementById("screenLockStatus");
    const passwordWrap = document.querySelector(".screen-lock-password-wrap");
    const passwordInput = document.getElementById("screenLockPasswordInput");
    document.querySelectorAll("[data-lock-auth-mode]").forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.lockAuthMode === normalized);
    });
    document.querySelectorAll(".screen-lock-signup-only").forEach(function (node) {
      node.hidden = normalized !== "signup";
    });
    if (passwordWrap) {
      passwordWrap.hidden = normalized === "reset";
    }
    if (passwordInput) {
      passwordInput.required = normalized !== "reset";
      passwordInput.placeholder = normalized === "signup" ? "Create a password" : "Enter your password";
    }
    if (submitButton) {
      submitButton.textContent = normalized === "signup"
        ? "Create Account"
        : (normalized === "reset" ? "Send Reset Link" : "Sign In");
    }
    if (footnoteNode) {
      footnoteNode.textContent = normalized === "signup"
        ? "New users begin as volunteers. Coordinator and admin requests appear in the admin review flow until approved."
        : (normalized === "reset"
          ? "Reset links are sent through Firebase Authentication if the provider is enabled in your project."
          : "Use your email and password to enter the shared workspace. New accounts begin as volunteers unless an admin approves a higher role.");
    }
    if (statusNode) {
      statusNode.textContent = normalized === "signup"
        ? "Create your account first, then choose your portal after login."
        : (normalized === "reset"
          ? "Enter your email to send a password reset link."
          : "Sign in with your existing account to continue.");
      statusNode.classList.remove("is-error", "is-success");
    }
  }

  async function submitScreenLockForm(form) {
    if (!getFirebaseConfig().enableAuth) {
      openDemoRoleDialog();
      return;
    }
    if (!await ensureAuthReady()) {
      announceScreenLockStatus("Authentication could not start right now. Please wait a moment and try again.", "error");
      return;
    }
    const mode = currentEmailAuthMode();
    const formData = new FormData(form);
    const email = textValue(formData, "email");
    const password = textValue(formData, "password");
    const displayName = textValue(formData, "displayName") || deriveNameFromEmail(email);
    const location = textValue(formData, "location");
    state.pendingSignupLocation = location;
    state.pendingRequestedRole = "user";
    try {
      if (mode === "signup") {
        if (!email || !password) {
          announceScreenLockStatus("Enter an email and password to create your account.", "error");
          announceNotice("Enter an email and password to create your account.");
          return;
        }
        const credential = await window.firebase.auth().createUserWithEmailAndPassword(email, password);
        if (credential && credential.user && typeof credential.user.updateProfile === "function") {
          await credential.user.updateProfile({ displayName: displayName });
        }
        announceScreenLockStatus("Account created. Signing you in now.", "success");
        announceNotice("Account created. ResourceFlow is signing you in now.");
      } else if (mode === "reset") {
        if (!email) {
          announceScreenLockStatus("Enter the email address that should receive the reset link.", "error");
          announceNotice("Enter the email address that should receive the reset link.");
          return;
        }
        await window.firebase.auth().sendPasswordResetEmail(email);
        form.reset();
        announceScreenLockStatus("Password reset email sent.", "success");
        announceNotice("Password reset email sent.");
        return;
      } else {
        if (!email || !password) {
          announceScreenLockStatus("Enter your email and password to sign in.", "error");
          announceNotice("Enter your email and password to sign in.");
          return;
        }
        await window.firebase.auth().signInWithEmailAndPassword(email, password);
        announceScreenLockStatus("Signed in successfully.", "success");
        announceNotice("Signed in successfully.");
      }
      form.reset();
    } catch (error) {
      console.warn("Screen lock auth failed.", error);
      announceScreenLockStatus(authErrorMessage(error), "error");
      announceNotice(authErrorMessage(error));
    }
  }

  function announceScreenLockStatus(message, tone) {
    const node = document.getElementById("screenLockStatus");
    if (!node) {
      return;
    }
    node.textContent = safeText(message || "", 220);
    node.classList.remove("is-error", "is-success");
    if (tone === "error") {
      node.classList.add("is-error");
    } else if (tone === "success") {
      node.classList.add("is-success");
    }
  }

  function ensureDemoAuthModal() {
    if (document.getElementById("demoAuthOverlay")) {
      return;
    }
    const overlay = document.createElement("div");
    overlay.id = "demoAuthOverlay";
    overlay.className = "demo-auth-overlay";
    overlay.innerHTML = [
      '<div class="demo-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="demoAuthTitle">',
      '<div class="demo-auth-header">',
      '<div>',
      '<p class="eyebrow">Demo Access</p>',
      '<h2 id="demoAuthTitle">Sign in to your ResourceFlow portal</h2>',
      '<p class="card-meta">Choose a role, enter demo credentials, and continue to the correct workspace like a real product login.</p>',
      '</div>',
      '<button class="ghost-button" id="demoAuthCloseButton" type="button">Close</button>',
      '</div>',
      '<div class="demo-auth-grid">',
      '<div class="demo-role-grid">',
      renderDemoRoleCard("volunteer"),
      renderDemoRoleCard("coordinator"),
      renderDemoRoleCard("admin"),
      '</div>',
      '<aside class="demo-login-card">',
      '<p class="eyebrow">Workspace Login</p>',
      '<h3 id="demoLoginTitle">Choose a role first</h3>',
      '<p id="demoLoginHint" class="card-meta">Select Volunteer, Coordinator, or Admin to load the correct portal sign-in.</p>',
      '<div class="demo-login-stats">',
      '<div><span>Environment</span><strong>Prototype Demo</strong></div>',
      '<div><span>Destination</span><strong id="demoDestinationLabel">Portal pending</strong></div>',
      '</div>',
      '<form id="demoAuthForm" class="form-grid demo-login-form" aria-label="Demo login form">',
      '<label>Email<input id="demoEmailInput" name="email" type="email" placeholder="name@resourceflow.demo" required></label>',
      '<label>Password<input id="demoPasswordInput" name="password" type="password" placeholder="Enter demo password" required></label>',
      '<div class="button-row"><button class="primary-button" id="demoAuthSubmit" type="submit">Continue</button></div>',
      '</form>',
      '<p class="card-meta">Any password works in demo mode. The selected role controls which portal page opens.</p>',
      '</aside>',
      '</div>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeDemoRoleDialog();
      }
    });

    const closeButton = document.getElementById("demoAuthCloseButton");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        closeDemoRoleDialog();
      });
    }

    overlay.querySelectorAll("[data-demo-role]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectDemoRole(button.dataset.demoRole);
      });
    });

    const form = document.getElementById("demoAuthForm");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitDemoLogin(form);
      });
    }
  }

  function ensureEmailAuthModal() {
    if (document.getElementById("emailAuthOverlay")) {
      return;
    }
    const overlay = document.createElement("div");
    overlay.id = "emailAuthOverlay";
    overlay.className = "demo-auth-overlay";
    overlay.innerHTML = [
      '<div class="demo-auth-dialog auth-dialog" role="dialog" aria-modal="true" aria-labelledby="emailAuthTitle">',
      '<div class="demo-auth-header">',
      '<div>',
      '<p class="eyebrow">Account Access</p>',
      '<h2 id="emailAuthTitle">Sign in or create your ResourceFlow account</h2>',
      '<p id="emailAuthHint" class="card-meta">Use Firebase email/password auth for a real free account, or switch to demo mode for quick walkthroughs.</p>',
      '</div>',
      '<button class="ghost-button" id="emailAuthCloseButton" type="button">Close</button>',
      '</div>',
      '<div class="auth-mode-tabs">',
      '<button class="ghost-button is-active" type="button" data-auth-mode="signin">Sign In</button>',
      '<button class="ghost-button" type="button" data-auth-mode="signup">Create Account</button>',
      '<button class="ghost-button" type="button" data-auth-mode="reset">Reset Password</button>',
      '</div>',
      '<form id="emailAuthForm" class="form-grid demo-login-form" aria-label="Email authentication form">',
      '<label class="auth-signup-only">Full Name<input id="authDisplayNameInput" name="displayName" type="text" placeholder="Shri Sundaram"></label>',
      '<label>Email<input id="authEmailInput" name="email" type="email" placeholder="you@example.com" required></label>',
      '<label class="auth-password-wrap">Password<input id="authPasswordInput" name="password" type="password" placeholder="Enter your password" required></label>',
      '<label class="auth-signup-only">Requested Role<select id="authRoleRequestInput" name="requestedRole"><option value="volunteer">Volunteer</option><option value="coordinator">Coordinator</option><option value="admin">Admin</option></select></label>',
      '<div class="demo-login-stats auth-signup-only">',
      '<div><span>Approval model</span><strong>Volunteer starts instantly</strong></div>',
      '<div><span>Elevated roles</span><strong>Admin reviews requests</strong></div>',
      '</div>',
      '<div class="button-row auth-primary-actions">',
      '<button class="primary-button" id="emailAuthSubmit" type="submit">Continue</button>',
      '<button class="ghost-button" id="emailAuthGoogleButton" type="button">Google Sign In</button>',
      '<button class="ghost-button" id="emailAuthDemoButton" type="button">Use Demo Mode</button>',
      '</div>',
      '</form>',
      '<p class="card-meta" id="authModeFootnote">Use your email and password to enter the cloud workspace. New accounts start as volunteers unless an admin approves a higher role.</p>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeEmailAuthDialog();
      }
    });

    const closeButton = document.getElementById("emailAuthCloseButton");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        closeEmailAuthDialog();
      });
    }

    overlay.querySelectorAll("[data-auth-mode]").forEach(function (button) {
      button.addEventListener("click", function () {
        setEmailAuthMode(button.dataset.authMode || "signin");
      });
    });

    const form = document.getElementById("emailAuthForm");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        submitEmailAuthForm(form);
      });
    }

    const googleButton = document.getElementById("emailAuthGoogleButton");
    if (googleButton) {
      googleButton.addEventListener("click", function () {
        signInWithGoogle();
      });
    }

    const demoButton = document.getElementById("emailAuthDemoButton");
    if (demoButton) {
      demoButton.addEventListener("click", function () {
        closeEmailAuthDialog();
        openDemoRoleDialog();
        if (state.pendingPortalRole) {
          selectDemoRole(state.pendingPortalRole);
        }
      });
    }
  }

  function currentEmailAuthMode() {
    return state.pendingAuthMode || "signin";
  }

  function openEmailAuthDialog(role, mode) {
    ensureEmailAuthModal();
    state.pendingPortalRole = normalizeRole(role || state.pendingPortalRole || "volunteer");
    state.pendingRequestedRole = normalizeRole(state.pendingRequestedRole || state.pendingPortalRole || "volunteer");
    const overlay = document.getElementById("emailAuthOverlay");
    if (!overlay) {
      return;
    }
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    setEmailAuthMode(mode || currentEmailAuthMode() || "signin");
    const emailInput = document.getElementById("authEmailInput");
    if (emailInput) {
      emailInput.focus();
    }
  }

  function closeEmailAuthDialog() {
    const overlay = document.getElementById("emailAuthOverlay");
    if (!overlay) {
      return;
    }
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (!hasActiveSession()) {
      state.pendingPortalRole = "";
    }
  }

  function setEmailAuthMode(mode) {
    const normalized = ["signin", "signup", "reset"].indexOf(String(mode || "").toLowerCase()) >= 0
      ? String(mode || "").toLowerCase()
      : "signin";
    state.pendingAuthMode = normalized;
    const submitButton = document.getElementById("emailAuthSubmit");
    const hintNode = document.getElementById("emailAuthHint");
    const footnoteNode = document.getElementById("authModeFootnote");
    const passwordWrap = document.querySelector(".auth-password-wrap");
    const passwordInput = document.getElementById("authPasswordInput");
    const roleSelect = document.getElementById("authRoleRequestInput");
    document.querySelectorAll("[data-auth-mode]").forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.authMode === normalized);
    });
    document.querySelectorAll(".auth-signup-only").forEach(function (node) {
      node.hidden = normalized !== "signup";
    });
    if (passwordWrap) {
      passwordWrap.hidden = normalized === "reset";
    }
    if (passwordInput) {
      passwordInput.required = normalized !== "reset";
      passwordInput.placeholder = normalized === "signup" ? "Create a password" : "Enter your password";
    }
    if (roleSelect) {
      roleSelect.value = state.pendingRequestedRole || state.pendingPortalRole || "volunteer";
    }
    if (submitButton) {
      submitButton.textContent = normalized === "signup"
        ? "Create Account"
        : (normalized === "reset" ? "Send Reset Link" : "Sign In");
    }
    if (hintNode) {
      hintNode.textContent = normalized === "signup"
        ? "Create a free Firebase account and request the portal role you need."
        : (normalized === "reset"
          ? "Enter your email and ResourceFlow will send a password reset link."
          : "Sign in with your email and password to enter the shared workspace.");
    }
    if (footnoteNode) {
      footnoteNode.textContent = normalized === "signup"
        ? "New users begin as volunteers. Coordinator and admin requests appear in the admin review flow until approved."
        : (normalized === "reset"
          ? "Reset links are sent through Firebase Authentication if the email provider is enabled in your project."
          : "If you already have an account, sign in normally. Use Google sign-in only if you prefer it over email/password.");
    }
  }

  async function submitEmailAuthForm(form) {
    if (!window.firebase || !window.firebase.auth) {
      announceNotice("Firebase Auth is not available in this environment yet.");
      return;
    }
    const mode = currentEmailAuthMode();
    const formData = new FormData(form);
    const email = textValue(formData, "email");
    const password = textValue(formData, "password");
    const displayName = textValue(formData, "displayName") || deriveNameFromEmail(email);
    const requestedRole = normalizeRole(textValue(formData, "requestedRole") || state.pendingRequestedRole || state.pendingPortalRole || "volunteer");
    state.pendingRequestedRole = requestedRole;
    try {
      if (mode === "signup") {
        if (!email || !password) {
          announceNotice("Enter an email and password to create your account.");
          return;
        }
        const credential = await window.firebase.auth().createUserWithEmailAndPassword(email, password);
        if (credential && credential.user && typeof credential.user.updateProfile === "function") {
          await credential.user.updateProfile({
            displayName: displayName
          });
        }
        announceNotice("Account created. ResourceFlow is signing you in now.");
      } else if (mode === "reset") {
        if (!email) {
          announceNotice("Enter the email address that should receive the reset link.");
          return;
        }
        await window.firebase.auth().sendPasswordResetEmail(email);
        closeEmailAuthDialog();
        form.reset();
        announceNotice("Password reset email sent.");
        return;
      } else {
        if (!email || !password) {
          announceNotice("Enter your email and password to sign in.");
          return;
        }
        await window.firebase.auth().signInWithEmailAndPassword(email, password);
        announceNotice("Signed in successfully.");
      }
      closeEmailAuthDialog();
      form.reset();
    } catch (error) {
      console.warn("Email auth failed.", error);
      announceNotice(authErrorMessage(error));
    }
  }

  function authErrorMessage(error) {
    const code = String(error && error.code ? error.code : "").toLowerCase();
    if (code === "auth/email-already-in-use") {
      return "That email already has a ResourceFlow account. Try signing in instead.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
      return "That email or password does not match an existing ResourceFlow account.";
    }
    if (code === "auth/weak-password") {
      return "Choose a stronger password with at least six characters.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many sign-in attempts were made. Please wait a moment and try again.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Google sign-in was closed before it finished.";
    }
    if (code === "auth/popup-blocked") {
      return "Your browser blocked the Google sign-in popup. Allow popups and try again.";
    }
    if (code === "auth/operation-not-allowed") {
      return "This sign-in method is not enabled in Firebase Authentication yet.";
    }
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized for Firebase sign-in yet. Add the live site domain in Firebase Authentication settings.";
    }
    return error && error.message
      ? safeText(error.message, 220)
      : "Authentication could not be completed right now.";
  }

  function renderDemoRoleCard(role) {
    const profile = DEMO_ROLE_PROFILES[role];
    return [
      '<article class="demo-role-card' + (role === "coordinator" ? " featured" : "") + '">',
      '<p class="eyebrow">' + escapeHtml(profile.title) + '</p>',
      '<h3>' + escapeHtml(titleCase(role)) + '</h3>',
      '<p>' + escapeHtml(profile.summary) + '</p>',
      '<ul class="demo-role-list">',
      profile.bullets.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join(""),
      '</ul>',
      '<button class="primary-button" type="button" data-demo-role="' + escapeHtml(role) + '">Continue as ' + escapeHtml(titleCase(role)) + '</button>',
      '</article>'
    ].join("");
  }

  function selectDemoRole(role) {
    const normalized = normalizeRole(role);
    const profile = DEMO_ROLE_PROFILES[normalized];
    if (!profile) {
      return;
    }
    state.pendingDemoRole = normalized;
    const titleNode = document.getElementById("demoLoginTitle");
    const hintNode = document.getElementById("demoLoginHint");
    const destinationNode = document.getElementById("demoDestinationLabel");
    const emailInput = document.getElementById("demoEmailInput");
    const passwordInput = document.getElementById("demoPasswordInput");
    if (titleNode) {
      titleNode.textContent = profile.title + " Login";
    }
    if (hintNode) {
      hintNode.textContent = "Enter credentials to continue into the " + titleCase(normalized) + " portal.";
    }
    if (destinationNode) {
      destinationNode.textContent = portalLabelForRole(normalized);
    }
    if (emailInput) {
      emailInput.value = profile.email;
      emailInput.focus();
      emailInput.select();
    }
    if (passwordInput) {
      passwordInput.value = "";
    }
    document.querySelectorAll(".demo-role-card").forEach(function (card) {
      const active = card.querySelector("[data-demo-role]") && card.querySelector("[data-demo-role]").dataset.demoRole === normalized;
      card.classList.toggle("is-selected", active);
    });
  }

  function renderAuthUi() {
    ensureAuthShell();
    renderScreenLock();
    renderPortalSelection();
    const userLabel = document.getElementById("authUserLabel");
    const roleLabel = document.getElementById("authRoleLabel");
    const signInButton = document.getElementById("signInButton");
    const tourButton = document.getElementById("tourButton");
    const switchRoleButton = document.getElementById("switchRoleButton");
    const signOutButton = document.getElementById("signOutButton");
    const uiLanguageSelect = document.getElementById("uiLanguageSelect");
    if (!userLabel || !roleLabel || !signInButton || !tourButton || !switchRoleButton || !signOutButton || !uiLanguageSelect) {
      return;
    }
    const accessRole = activeAccessRole();
    const profileSummary = activePortalProfile();

    if (state.user) {
      const requestedRole = normalizeRole(state.userProfile && state.userProfile.requestedRole);
      userLabel.textContent = safeText(state.user.displayName || state.user.email || "Signed in", 60);
      roleLabel.textContent = requestedRole && requestedRole !== accessRole && requestedRole !== "user"
        ? titleCase(accessRole) + " access - " + titleCase(requestedRole) + " portal request is waiting for approval"
        : titleCase(accessRole) + " access" + (profileSummary && profileSummary.primarySummary
          ? " - " + profileSummary.primarySummary
          : (canManageWorkspace() ? " - workspace tools enabled" : " - limited role view"));
      signInButton.hidden = true;
      switchRoleButton.hidden = false;
      signOutButton.hidden = false;
    } else if (state.demoSession) {
      userLabel.textContent = safeText(state.demoSession.displayName, 60);
      roleLabel.textContent = titleCase(state.role) + " demo session" + (canManageWorkspace() ? " - manager tools enabled" : " - volunteer workspace enabled") + (getFirebaseConfig().enableAuth ? " - use Cloud Sign In for saved access" : "");
      signInButton.textContent = getFirebaseConfig().enableAuth ? "Cloud Sign In" : "Portal Login";
      signInButton.hidden = !getFirebaseConfig().enableAuth;
      switchRoleButton.hidden = false;
      signOutButton.hidden = false;
    } else {
      userLabel.textContent = getFirebaseConfig().enableAuth ? "Guest mode" : "Demo access required";
      roleLabel.textContent = getFirebaseConfig().enableAuth
        ? "Sign in with email/password or Google to unlock the shared workspace."
        : "Choose Volunteer, Coordinator, or Admin to enter the prototype workspace.";
      signInButton.textContent = "Portal Login";
      signInButton.hidden = false;
      switchRoleButton.hidden = true;
      signOutButton.hidden = true;
    }

    if (signInButton.dataset.bound !== "true") {
      signInButton.dataset.bound = "true";
      signInButton.addEventListener("click", function () {
        handlePrimarySignIn();
      });
    }
    if (tourButton.dataset.bound !== "true") {
      tourButton.dataset.bound = "true";
      tourButton.addEventListener("click", function () {
        openTourDialog(0);
      });
    }
    if (switchRoleButton.dataset.bound !== "true") {
      switchRoleButton.dataset.bound = "true";
      switchRoleButton.addEventListener("click", function () {
        if (state.demoSession) {
          openDemoRoleDialog();
          selectDemoRole(state.role || "coordinator");
          return;
        }
        if (getFirebaseConfig().enableAuth) {
          window.location.assign("./index.html");
        }
      });
    }
    if (signOutButton.dataset.bound !== "true") {
      signOutButton.dataset.bound = "true";
      signOutButton.addEventListener("click", function () { signOutSession(); });
    }
    if (uiLanguageSelect.dataset.bound !== "true") {
      uiLanguageSelect.dataset.bound = "true";
      uiLanguageSelect.addEventListener("change", function () {
        state.uiLanguage = UI_LANGUAGE_OPTIONS.indexOf(uiLanguageSelect.value) >= 0 ? uiLanguageSelect.value : "English";
        try {
          localStorage.setItem(UI_LANGUAGE_KEY, state.uiLanguage);
        } catch (error) {
          console.warn("Could not persist UI language.", error);
        }
        renderAll(true);
      });
    }
    uiLanguageSelect.value = UI_LANGUAGE_OPTIONS.indexOf(state.uiLanguage) >= 0 ? state.uiLanguage : "English";

    syncPermissionUi();
  }

  function handlePrimarySignIn() {
    if (state.user) {
      return;
    }
    const targetRole = normalizeRole(state.pendingPortalRole || state.role || pageRoleForPortal(currentPageName()));
    if (state.demoSession && getFirebaseConfig().enableAuth) {
      openEmailAuthDialog(targetRole, "signin");
      return;
    }
    openPortalChooser(targetRole);
  }

  async function signInWithGoogle() {
    if (!getFirebaseConfig().enableAuth) {
      openDemoRoleDialog();
      return;
    }
    if (!await ensureAuthReady()) {
      announceScreenLockStatus("Google sign-in is not ready yet. Please wait a moment and try again.", "error");
      return;
    }
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await window.firebase.auth().signInWithPopup(provider);
      announceScreenLockStatus("Google sign-in completed. Opening portal selection.", "success");
      closeEmailAuthDialog();
    } catch (error) {
      console.warn("Sign in failed.", error);
      announceScreenLockStatus(authErrorMessage(error), "error");
      announceNotice(authErrorMessage(error));
    }
  }

  async function signOutSession() {
    if (!getFirebaseConfig().enableAuth) {
      state.pendingDemoRole = "";
      state.demoSession = null;
      state.user = null;
      state.role = "guest";
      state.userProfile = null;
      state.selectedPortalRole = "";
      persistSelectedPortal();
      persistDemoSession();
      renderAuthUi();
      renderAll();
      announceNotice("Signed out of demo session.");
      return;
    }
    if (!state.user && state.demoSession) {
      state.pendingDemoRole = "";
      state.demoSession = null;
      state.role = "guest";
      state.userProfile = null;
      state.selectedPortalRole = "";
      persistSelectedPortal();
      persistDemoSession();
      renderAuthUi();
      renderAll();
      maybeHandlePostAuthRouting();
      announceNotice("Signed out of demo session.");
      return;
    }
    if (!window.firebase || !window.firebase.auth) {
      return;
    }
    await window.firebase.auth().signOut();
    trackEvent("resourceflow_sign_out");
  }

  function openDemoRoleDialog() {
    ensureDemoAuthModal();
    const overlay = document.getElementById("demoAuthOverlay");
    if (!overlay) {
      return;
    }
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    selectDemoRole(state.demoSession ? state.role : (state.pendingPortalRole || state.pendingDemoRole || "coordinator"));
  }

  function closeDemoRoleDialog() {
    const overlay = document.getElementById("demoAuthOverlay");
    if (!overlay) {
      return;
    }
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (!hasActiveSession()) {
      state.pendingPortalRole = "";
    }
  }

  function submitDemoLogin(form) {
    const normalized = normalizeRole(state.pendingDemoRole || "government");
    const emailInput = form.elements.namedItem("email");
    const passwordInput = form.elements.namedItem("password");
    const email = safeText(emailInput ? emailInput.value : "", 140);
    const password = safeText(passwordInput ? passwordInput.value : "", 80);
    if (!email || !password) {
      announceNotice("Enter both email and password to continue.");
      return;
    }
    startDemoSession(normalized, {
      email: email,
      displayName: deriveNameFromEmail(email)
    });
  }

  function startDemoSession(role, overrides) {
    const normalized = normalizeRole(role);
    if (!DEMO_ROLE_PROFILES[normalized]) {
      return;
    }
    state.user = null;
    state.demoSession = createDemoSession(normalized, overrides);
    state.role = normalized;
    state.selectedPortalRole = "";
    persistSelectedPortal();
    state.userProfile = {
      uid: state.demoSession.uid,
      email: state.demoSession.email,
      displayName: state.demoSession.displayName,
      role: normalized,
      requestedRole: normalized
    };
    persistDemoSession();
    closeDemoRoleDialog();
    renderAuthUi();
    renderAll();
    announceNotice("Signed in as " + titleCase(normalized) + " for the demo workspace.");
  }

  function redirectToPortal(role) {
    const nextPath = DEMO_PORTAL_ROUTES[normalizeRole(role)] || "./overview.html";
    const currentPage = currentPageName();
    if (nextPath === "./overview.html" || currentPage === portalPageForRole(role)) {
      return;
    }
    if (window.location && typeof window.location.assign === "function") {
      window.location.assign(nextPath);
    }
  }

  function portalPageForRole(role) {
    return {
      user: "home",
      volunteer: "volunteer",
      government: "operations",
      coordinator: "operations",
      admin: "admin"
    }[normalizeRole(role)] || "home";
  }

  function pageRoleForPortal(page) {
    return {
      volunteer: "volunteer",
      insights: "volunteer",
      operations: "coordinator",
      judge: "coordinator",
      admin: "admin"
    }[String(page || "").toLowerCase()] || "volunteer";
  }

  function portalLabelForRole(role) {
    return {
      user: "Community Portal",
      volunteer: "Volunteer Portal",
      government: "Government Operations",
      coordinator: "Operations Center",
      admin: "Admin Console"
    }[normalizeRole(role)] || "Overview";
  }

  function currentPageName() {
    return document.body && document.body.dataset ? document.body.dataset.page || "home" : "home";
  }

  function roleCanAccessPage(role, page) {
    const allowed = ROLE_PAGE_ACCESS[normalizeRole(role)] || ROLE_PAGE_ACCESS.guest;
    return allowed.indexOf(page) >= 0;
  }

  function enforcePortalAccess() {
    const page = currentPageName();
    if (page === "tests") {
      return false;
    }
    if (!getFirebaseConfig().enableAuth) {
      return false;
    }
    if (!state.authResolved) {
      return false;
    }
    if (!hasActiveSession()) {
      if (window.location && typeof window.location.assign === "function") {
        window.location.assign("./index.html");
      }
      return true;
    }
    if (!state.selectedPortalRole) {
      state.selectedPortalRole = normalizeRole((state.userProfile && state.userProfile.role) || state.role || "user");
      persistSelectedPortal();
    }
    if (!roleCanAccessPage(activeAccessRole(), page)) {
      redirectToPortal(activeAccessRole());
      return true;
    }
    return false;
  }

  function maybeHandlePostAuthRouting() {
    const page = currentPageName();
    if (page === "tests") {
      state.pendingPortalRole = "";
      return;
    }
    if (!hasActiveSession()) {
      state.pendingPortalRole = "";
      return;
    }
    const preferredRole = normalizeRole(state.pendingPortalRole || state.selectedPortalRole || state.pendingRequestedRole || "");
    state.pendingRequestedRole = "";
    if (!preferredRole || preferredRole === "guest" || !state.selectedPortalRole) {
      state.pendingPortalRole = "";
      return;
    }
    state.pendingPortalRole = "";
    if (!roleCanAccessPage(preferredRole, page)) {
      redirectToPortal(preferredRole);
    }
  }

  function buildOnboardingSteps() {
    return [
      {
        eyebrow: "Step 1",
        title: "Enter the right portal",
        text: "ResourceFlow now starts like a real product. Users sign in with email and password, Google, or demo mode, then land in the correct workspace automatically.",
        bullets: [
          "Volunteer accounts open the Volunteer Portal.",
          "Coordinator accounts open Operations.",
          "Admin accounts open the Admin Console."
        ]
      },
      {
        eyebrow: "Step 2",
        title: "Run the field workflow",
        text: "Operations is the control room for request intake, matching, route planning, and impact tracking. Coordinators can move from new request to assignment in one screen.",
        bullets: [
          "Capture urgent requests with structured metadata.",
          "Match the right volunteers using skills, urgency, and zone.",
          "Export reports, QR tokens, and printable summaries."
        ]
      },
      {
        eyebrow: "Step 3",
        title: "Guide volunteers clearly",
        text: "The Volunteer Portal focuses on onboarding, opportunity discovery, accessibility, outreach, and training so responders know where they can help fastest.",
        bullets: [
          "Filter by zone, skill, and availability.",
          "Generate multilingual outreach drafts.",
          "Surface training gaps and trust signals."
        ]
      },
      {
        eyebrow: "Step 4",
        title: "Tell the impact story",
        text: "AI Insights and Judge Mode translate live workspace data into a clear demo narrative for reviewers, teammates, and community partners.",
        bullets: [
          "Explain readiness, risk, and fairness clearly.",
          "Show how the app supports the problem statement.",
          "Use the tour any time from the header."
        ]
      }
    ];
  }

  function ensureTourDialog() {
    if (document.getElementById("tourOverlay")) {
      return;
    }
    const overlay = document.createElement("div");
    overlay.id = "tourOverlay";
    overlay.className = "demo-auth-overlay tour-overlay";
    overlay.innerHTML = [
      '<div class="demo-auth-dialog tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tourTitle">',
      '<div class="demo-auth-header">',
      '<div>',
      '<p id="tourEyebrow" class="eyebrow">Quick Tour</p>',
      '<h2 id="tourTitle">ResourceFlow walkthrough</h2>',
      '<p id="tourText" class="card-meta">This short tour explains how the free version works across roles and pages.</p>',
      '</div>',
      '<button class="ghost-button" id="tourCloseButton" type="button">Close</button>',
      '</div>',
      '<div class="tour-progress"><span id="tourStepCount">1 / 4</span><div class="tour-progress-bar"><span id="tourProgressFill"></span></div></div>',
      '<div id="tourBulletList" class="stack-list"></div>',
      '<div class="button-row tour-actions">',
      '<button class="ghost-button" id="tourBackButton" type="button">Back</button>',
      '<button class="ghost-button" id="tourNextButton" type="button">Next</button>',
      '<button class="primary-button" id="tourDoneButton" type="button">Finish Tour</button>',
      '</div>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeTourDialog(true);
      }
    });

    var closeButton = document.getElementById("tourCloseButton");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        closeTourDialog(true);
      });
    }

    var backButton = document.getElementById("tourBackButton");
    if (backButton) {
      backButton.addEventListener("click", function () {
        updateTourStep(-1);
      });
    }

    var nextButton = document.getElementById("tourNextButton");
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        updateTourStep(1);
      });
    }

    var doneButton = document.getElementById("tourDoneButton");
    if (doneButton) {
      doneButton.addEventListener("click", function () {
        closeTourDialog(true);
      });
    }
  }

  function loadOnboardingState() {
    try {
      const raw = localStorage.getItem(ONBOARDING_KEY);
      if (!raw) {
        state.onboardingSeen = false;
        state.onboardingStep = 0;
        return;
      }
      const parsed = JSON.parse(raw);
      state.onboardingSeen = Boolean(parsed && parsed.seen);
      state.onboardingStep = safeInteger(parsed && parsed.step, 0, buildOnboardingSteps().length - 1, 0);
    } catch (error) {
      console.warn("Could not restore onboarding state.", error);
      state.onboardingSeen = false;
      state.onboardingStep = 0;
    }
  }

  function loadUiLanguage() {
    try {
      const raw = localStorage.getItem(UI_LANGUAGE_KEY);
      state.uiLanguage = UI_LANGUAGE_OPTIONS.indexOf(raw) >= 0 ? raw : "English";
    } catch (error) {
      console.warn("Could not restore UI language.", error);
      state.uiLanguage = "English";
    }
  }

  function loadOpsNotes() {
    try {
      const raw = localStorage.getItem(OPS_NOTES_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      state.opsNotes = Object.assign({ briefing: "", handoff: "", incident: "" }, parsed || {});
    } catch (error) {
      console.warn("Could not restore operator notes.", error);
      state.opsNotes = { briefing: "", handoff: "", incident: "" };
    }
  }

  function persistOpsNotes() {
    try {
      localStorage.setItem(OPS_NOTES_KEY, JSON.stringify(state.opsNotes || {}));
    } catch (error) {
      console.warn("Could not persist operator notes.", error);
    }
  }

  function persistOnboardingState() {
    try {
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify({
        seen: Boolean(state.onboardingSeen),
        step: safeInteger(state.onboardingStep, 0, buildOnboardingSteps().length - 1, 0),
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.warn("Could not persist onboarding state.", error);
    }
  }

  function renderTourStep() {
    const steps = buildOnboardingSteps();
    const index = safeInteger(state.onboardingStep, 0, steps.length - 1, 0);
    const step = steps[index];
    setText("#tourEyebrow", step.eyebrow);
    setText("#tourTitle", step.title);
    setText("#tourText", step.text);
    setText("#tourStepCount", String(index + 1) + " / " + String(steps.length));
    const bulletList = document.getElementById("tourBulletList");
    if (bulletList) {
      bulletList.innerHTML = step.bullets.map(function (item) {
        return '<div class="stack-card tour-card"><strong>' + escapeHtml(item) + '</strong></div>';
      }).join("");
    }
    const fill = document.getElementById("tourProgressFill");
    if (fill) {
      fill.style.width = (((index + 1) / steps.length) * 100) + "%";
    }
    const backButton = document.getElementById("tourBackButton");
    const nextButton = document.getElementById("tourNextButton");
    const doneButton = document.getElementById("tourDoneButton");
    if (backButton) {
      backButton.disabled = index === 0;
    }
    if (nextButton) {
      nextButton.hidden = index >= steps.length - 1;
    }
    if (doneButton) {
      doneButton.textContent = index >= steps.length - 1 ? "Enter ResourceFlow" : "Finish Later";
    }
  }

  function openTourDialog(step) {
    ensureTourDialog();
    const overlay = document.getElementById("tourOverlay");
    if (!overlay) {
      return;
    }
    state.onboardingStep = safeInteger(step, 0, buildOnboardingSteps().length - 1, state.onboardingStep || 0);
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    renderTourStep();
  }

  function closeTourDialog(markSeen) {
    const overlay = document.getElementById("tourOverlay");
    if (!overlay) {
      return;
    }
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (markSeen) {
      state.onboardingSeen = true;
      persistOnboardingState();
    }
  }

  function updateTourStep(delta) {
    const steps = buildOnboardingSteps();
    state.onboardingStep = safeInteger((state.onboardingStep || 0) + safeInteger(delta, -1, 1, 0), 0, steps.length - 1, 0);
    persistOnboardingState();
    renderTourStep();
  }

  function maybeLaunchOnboarding() {
    if (state.onboardingSeen || currentPageName() !== "home") {
      return;
    }
    openTourDialog(0);
  }

  function defaultUiPreferences() {
    return {
      highContrast: false,
      reducedMotion: false,
      fontScale: "default",
      notificationsEnabled: false
    };
  }

  function loadUiPreferences() {
    try {
      const raw = localStorage.getItem(UI_PREFERENCES_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      state.uiPreferences = Object.assign(defaultUiPreferences(), parsed || {});
      state.uiPreferences.notificationsEnabled = Boolean(state.uiPreferences.notificationsEnabled);
    } catch (error) {
      console.warn("Could not restore UI preferences.", error);
      state.uiPreferences = defaultUiPreferences();
    }
  }

  function persistUiPreferences() {
    try {
      localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(state.uiPreferences));
    } catch (error) {
      console.warn("Could not persist UI preferences.", error);
    }
  }

  function applyUiPreferences() {
    const root = document.documentElement;
    const prefs = state.uiPreferences || defaultUiPreferences();
    root.classList.toggle("rf-high-contrast", Boolean(prefs.highContrast));
    root.classList.toggle("rf-reduced-motion", Boolean(prefs.reducedMotion));
    root.classList.toggle("rf-font-lg", prefs.fontScale === "large");
    root.classList.toggle("rf-font-xl", prefs.fontScale === "xlarge");
  }

  function setUiPreference(key, value) {
    state.uiPreferences = Object.assign(defaultUiPreferences(), state.uiPreferences || {});
    state.uiPreferences[key] = value;
    persistUiPreferences();
    applyUiPreferences();
    renderAll(true);
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      announceNotice("Browser notifications are not supported in this browser.");
      return;
    }
    if (Notification.permission === "granted") {
      setUiPreference("notificationsEnabled", true);
      announceNotice("Browser notifications are already enabled.");
      return;
    }
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    setUiPreference("notificationsEnabled", enabled);
    announceNotice(enabled ? "Browser notifications enabled." : "Notification permission was not granted.");
  }

  function sendBrowserNotification(title, body) {
    if (!state.uiPreferences || !state.uiPreferences.notificationsEnabled) {
      return;
    }
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    try {
      new Notification(title, {
        body: body,
        icon: "./icon.svg"
      });
    } catch (error) {
      console.warn("Could not show browser notification.", error);
    }
  }

  function buildDraftRecoveryItems() {
    const items = [];
    [REQUEST_DRAFT_KEY, VOLUNTEER_DRAFT_KEY].forEach(function (key) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          return;
        }
        const parsed = JSON.parse(raw);
        const fieldCount = parsed && parsed.fields ? Object.keys(parsed.fields).filter(function (field) {
          return safeText(parsed.fields[field], 200).trim().length;
        }).length : 0;
        items.push({
          title: key === REQUEST_DRAFT_KEY ? "Request draft saved" : "Volunteer draft saved",
          text: fieldCount ? String(fieldCount) + " field(s) can be restored after refresh or connection loss." : "A saved draft is available in local storage."
        });
      } catch (error) {
        console.warn("Could not inspect draft state.", error);
      }
    });
    if (!items.length) {
      items.push({
        title: "No unsaved drafts right now",
        text: "As you type in forms, ResourceFlow keeps local recovery snapshots so operators do not lose work."
      });
    }
    return items;
  }

  function buildCleanupWarnings(data) {
    const warnings = [];
    const requests = Array.isArray(data.requests) ? data.requests : [];
    const volunteers = Array.isArray(data.volunteers) ? data.volunteers : [];

    requests.forEach(function (request, index) {
      requests.slice(index + 1).forEach(function (candidate) {
        if (normalizeText(request.title) === normalizeText(candidate.title) && normalizeText(request.zone) === normalizeText(candidate.zone)) {
          warnings.push({
            title: "Possible duplicate request",
            text: request.title + " appears more than once in " + request.zone + " zone. Merge or archive one copy for cleaner reporting."
          });
        }
      });
      if (!safeText(request.location, 120).trim() || !(request.skills || []).length) {
        warnings.push({
          title: "Incomplete request details",
          text: request.title + " is missing either a precise location or skill tags, which can reduce matching quality."
        });
      }
    });

    volunteers.forEach(function (volunteer, index) {
      volunteers.slice(index + 1).forEach(function (candidate) {
        if (normalizeText(volunteer.name) === normalizeText(candidate.name) && normalizeText(volunteer.zone) === normalizeText(candidate.zone)) {
          warnings.push({
            title: "Possible duplicate volunteer",
            text: volunteer.name + " appears more than once in " + volunteer.zone + " zone. Review before outreach or assignment."
          });
        }
      });
      if (!(volunteer.skills || []).length || !safeText(volunteer.location, 120).trim()) {
        warnings.push({
          title: "Incomplete volunteer profile",
          text: volunteer.name + " should include both location and skills to improve assignment recommendations."
        });
      }
    });

    return warnings.slice(0, 8);
  }

  function buildAccessibilityCards() {
    const prefs = state.uiPreferences || defaultUiPreferences();
    return [
      {
        title: "High contrast " + (prefs.highContrast ? "on" : "off"),
        text: "Improves separation between cards, inputs, and action buttons for bright screens and projectors."
      },
      {
        title: "Reduced motion " + (prefs.reducedMotion ? "on" : "off"),
        text: "Removes extra movement for users who prefer calmer transitions during demos or long sessions."
      },
      {
        title: "Readable scaling: " + titleCase(prefs.fontScale === "default" ? "default" : prefs.fontScale),
        text: "Makes dense coordination screens easier to scan on both laptops and mobile devices."
      },
      {
        title: "Keyboard-ready layout",
        text: "Skip links, focus states, labeled controls, and large hit targets help operators move quickly without losing context."
      }
    ];
  }

  function buildAccessibilityControlMarkup() {
    const prefs = state.uiPreferences || defaultUiPreferences();
    return [
      '<div class="stack-card"><strong>Display comfort</strong><div class="chip-row">' +
        renderChip(prefs.highContrast ? "High contrast on" : "High contrast off") +
        renderChip(prefs.reducedMotion ? "Reduced motion on" : "Reduced motion off") +
        renderChip("Font: " + (prefs.fontScale === "default" ? "default" : prefs.fontScale)) +
      '</div></div>',
      '<div class="button-row compact-controls">',
      '<button class="ghost-button" type="button" data-action="toggle-high-contrast">Toggle Contrast</button>',
      '<button class="ghost-button" type="button" data-action="toggle-reduced-motion">Toggle Motion</button>',
      '<button class="ghost-button" type="button" data-action="cycle-font-scale">Font Size</button>',
      '<button class="ghost-button" type="button" data-action="enable-browser-notifications">Browser Alerts</button>',
      '</div>'
    ].join("");
  }

  function uiText(english, hinglish, hindiRoman) {
    const value = state.uiLanguage || "English";
    if (value === "Hinglish") {
      return hinglish || english;
    }
    if (value === "HindiRoman") {
      return hindiRoman || hinglish || english;
    }
    return english;
  }

  function bindAccessibilityControls() {
    document.querySelectorAll('[data-action="toggle-high-contrast"]').forEach(function (button) {
      if (button.dataset.bound === "true") {
        return;
      }
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        setUiPreference("highContrast", !state.uiPreferences.highContrast);
      });
    });
    document.querySelectorAll('[data-action="toggle-reduced-motion"]').forEach(function (button) {
      if (button.dataset.bound === "true") {
        return;
      }
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        setUiPreference("reducedMotion", !state.uiPreferences.reducedMotion);
      });
    });
    document.querySelectorAll('[data-action="cycle-font-scale"]').forEach(function (button) {
      if (button.dataset.bound === "true") {
        return;
      }
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        const order = ["default", "large", "xlarge"];
        const currentIndex = order.indexOf(state.uiPreferences.fontScale || "default");
        const next = order[(currentIndex + 1) % order.length];
        setUiPreference("fontScale", next);
      });
    });
    document.querySelectorAll('[data-action="enable-browser-notifications"]').forEach(function (button) {
      if (button.dataset.bound === "true") {
        return;
      }
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        enableBrowserNotifications();
      });
    });
  }

  function deriveNameFromEmail(email) {
    const target = String(email || "").split("@")[0].replace(/[._-]+/g, " ").trim();
    if (!target) {
      return "ResourceFlow User";
    }
    return target.split(" ").map(function (item) {
      return item.charAt(0).toUpperCase() + item.slice(1);
    }).join(" ");
  }

  function resolveRoleForEmail(email) {
    const config = getFirebaseConfig();
    const target = String(email || "").trim().toLowerCase();
    const admins = (config.adminEmails || []).map(function (item) { return String(item).trim().toLowerCase(); });
    const coordinators = (config.coordinatorEmails || []).map(function (item) { return String(item).trim().toLowerCase(); });
    if (target && admins.indexOf(target) >= 0) {
      return "admin";
    }
    if (target && coordinators.indexOf(target) >= 0) {
      return "government";
    }
    return target ? "user" : "guest";
  }

  function normalizeRole(value) {
    const target = String(value || "").trim().toLowerCase();
    if (target === "admin" || target === "coordinator" || target === "volunteer" || target === "user" || target === "government") {
      return target;
    }
    if (target === "citizen" || target === "normal" || target === "normal user") {
      return "user";
    }
    if (target === "gov" || target === "government employee" || target === "employee") {
      return "government";
    }
    return target ? "volunteer" : "guest";
  }

  function inferScenario(category, title, notes) {
    const normalized = [category, title, notes].join(" ").toLowerCase();
    if (normalized.indexOf("flood") >= 0 || normalized.indexOf("storm") >= 0 || normalized.indexOf("cyclone") >= 0 || normalized.indexOf("boat") >= 0) {
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
      medical: "Medical Camp",
      shelter: "Shelter Support",
      food: "Food Distribution"
    }[normalizeScenario(value)] || "Mixed Response";
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

  function routeClusterForZone(zone) {
    return {
      North: "Northern arc",
      South: "River corridor",
      East: "Shelter cluster east",
      West: "Community kitchens west",
      Central: "Central civic corridor"
    }[normalizeZone(zone)] || "Core route";
  }

  function estimateEtaMinutes(volunteerZone, requestZone) {
    return 12 + (getZoneDistance(volunteerZone, requestZone) * 8);
  }

  function loadDemoScenario() {
    try {
      return normalizeScenario(localStorage.getItem(DEMO_SCENARIO_KEY) || "mixed");
    } catch (error) {
      return "mixed";
    }
  }

  function persistDemoScenario(value) {
    try {
      localStorage.setItem(DEMO_SCENARIO_KEY, normalizeScenario(value));
    } catch (error) {
      console.warn("Could not save demo scenario.", error);
    }
  }

  function getZoneDistance(fromZone, toZone) {
    const from = normalizeZone(fromZone);
    const to = normalizeZone(toZone);
    return ZONE_DISTANCE[from] && typeof ZONE_DISTANCE[from][to] === "number"
      ? ZONE_DISTANCE[from][to]
      : 2;
  }

  function canManageWorkspace() {
    const config = getFirebaseConfig();
    if (!config.enableAuth) {
      return Boolean(state.demoSession && (state.role === "admin" || state.role === "coordinator" || state.role === "government"));
    }
    return activeAccessRole() === "admin" || activeAccessRole() === "coordinator" || activeAccessRole() === "government";
  }

  function hasActiveSession() {
    return Boolean(state.user || state.demoSession);
  }

  function currentActor() {
    return safeText(
      state.user && state.user.email
        ? state.user.email
        : (state.demoSession && state.demoSession.email
          ? state.demoSession.email
          : (state.userProfile && state.userProfile.displayName
            ? state.userProfile.displayName
            : state.clientId)),
      140
    );
  }

  function getFirebaseConfig() {
    return window.RESOURCEFLOW_FIREBASE_CONFIG || {};
  }

  async function ensureAuthReady() {
    const config = getFirebaseConfig();
    if (!config.enabled || !config.enableAuth) {
      return false;
    }
    try {
      await ensureFirebaseScripts();
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      state.functions = getFunctionsClient();
      initializeAppCheck();
      initializeAnalytics();
      if (window.__resourceFlowAuthBound !== true) {
        initializeAuth();
      }
      return Boolean(window.firebase && window.firebase.auth);
    } catch (error) {
      console.warn("Auth readiness failed.", error);
      return false;
    }
  }

  function getFirestoreDb() {
    return window.firebase && window.firebase.firestore ? window.firebase.firestore() : null;
  }

  function getStorageBucket() {
    return window.firebase && window.firebase.storage ? window.firebase.storage() : null;
  }

  function getFunctionsClient() {
    if (!window.firebase || !window.firebase.app || !window.firebase.functions) {
      return null;
    }
    const region = getFirebaseConfig().functionsRegion || "us-central1";
    try {
      return window.firebase.app().functions(region);
    } catch (error) {
      console.warn("Functions client unavailable.", error);
      return null;
    }
  }

  async function resolveRoleFromClaims(user) {
    if (!hasSecureBackend()) {
      return "guest";
    }
    if (!user || typeof user.getIdTokenResult !== "function") {
      return "guest";
    }
    try {
      const token = await user.getIdTokenResult();
      return normalizeRole(token && token.claims ? token.claims.role : "");
    } catch (error) {
      console.warn("Could not resolve role from claims.", error);
      return "volunteer";
    }
  }

  async function refreshClaims() {
    if (!state.user || typeof state.user.getIdToken !== "function") {
      return;
    }
    if (!hasSecureBackend()) {
      await syncUserProfile(state.user);
      renderAll();
      return;
    }
    await state.user.getIdToken(true);
    state.role = await resolveRoleFromClaims(state.user);
    renderAll();
  }

  function currentAdminCapability() {
    return resolveRoleForEmail(state.user && state.user.email ? state.user.email : "") === "admin"
      || state.role === "admin";
  }

  function ensureWorkspaceAccess(message) {
    if (!hasActiveSession()) {
      if (getFirebaseConfig().enableAuth) {
        state.pendingPortalRole = "coordinator";
        openEmailAuthDialog("coordinator", "signin");
      } else {
        openDemoRoleDialog();
        selectDemoRole("coordinator");
      }
      announceNotice(getFirebaseConfig().enableAuth ? "Please sign in before using manager tools." : "Please sign in with a demo coordinator or admin role first.");
      return false;
    }
    if (!canManageWorkspace()) {
      announceNotice(message || "This action needs coordinator or admin access.");
      return false;
    }
    return true;
  }

  function syncPermissionUi() {
    const authEnabled = getFirebaseConfig().enableAuth;
    const requestLocked = !canManageWorkspace();
    const uploadLocked = !canManageWorkspace();
    const volunteerLocked = !(hasActiveSession() && (activeAccessRole() === "volunteer" || canManageWorkspace()));
    const operationsAccessNote = document.getElementById("operationsAccessNote");
    const volunteerAccessNote = document.getElementById("volunteerAccessNote");

    toggleFormDisabled(document.getElementById("requestForm"), requestLocked);
    toggleFormDisabled(document.getElementById("artifactForm"), uploadLocked);
    toggleFormDisabled(document.getElementById("volunteerForm"), volunteerLocked);

    document.querySelectorAll('[data-action="run-matching"], [data-action="reset-all"]').forEach(function (button) {
      button.disabled = requestLocked;
      button.classList.toggle("is-disabled", requestLocked);
    });

    document.querySelectorAll('[data-action="sample-request"]').forEach(function (button) {
      button.disabled = requestLocked;
      button.classList.toggle("is-disabled", requestLocked);
    });

    document.querySelectorAll('[data-action="sample-volunteer"]').forEach(function (button) {
      button.disabled = volunteerLocked;
      button.classList.toggle("is-disabled", volunteerLocked);
    });

    document.querySelectorAll('[data-action="seed-demo"]').forEach(function (button) {
      button.disabled = requestLocked;
      button.classList.toggle("is-disabled", requestLocked);
    });

    if (operationsAccessNote) {
      operationsAccessNote.textContent = requestLocked
        ? (authEnabled
          ? "Coordinator or admin access is required for request intake, matching, resets, and cloud evidence uploads."
          : "Sign in as a demo coordinator or admin to use request intake, matching, reset tools, and evidence workflows.")
        : "Manager tools are active for this signed-in session.";
    }

    if (volunteerAccessNote) {
      volunteerAccessNote.textContent = volunteerLocked
        ? (authEnabled
          ? "Volunteer registration is limited to volunteer, government, coordinator, or admin sessions."
          : "Choose a volunteer or manager demo role to register volunteers and explore the portal.")
        : (authEnabled
          ? "Volunteer registration is connected to the shared Firebase workspace."
          : "Volunteer registration is active for the current demo session.");
    }
  }

  function toggleFormDisabled(form, disabled) {
    if (!form) {
      return;
    }
    form.classList.toggle("is-disabled", disabled);
    form.querySelectorAll("input, select, textarea, button").forEach(function (field) {
      if (disabled) {
        field.setAttribute("disabled", "disabled");
      } else {
        field.removeAttribute("disabled");
      }
    });
  }

  function prefillVolunteerFormFromPortalProfile() {
    const form = document.getElementById("volunteerForm");
    const profile = state.portalProfiles && state.portalProfiles.volunteer ? state.portalProfiles.volunteer : null;
    if (!form || !profile || state.volunteerEditId || activeAccessRole() !== "volunteer") {
      return;
    }
    setFieldValue(form.elements.name, profile.displayName || profile.name || "");
    setFieldValue(form.elements.zone, profile.zone || "");
    setFieldValue(form.elements.location, profile.location || "");
    setFieldValue(form.elements.availability, profile.availability || "");
    setFieldValue(form.elements.skills, profile.skills || "");
    setFieldValue(form.elements.languages, profile.languages || "");
    setFieldValue(form.elements.transport, profile.transport || "");
    setFieldValue(form.elements.experience, profile.experience || "");
  }

  function setFieldValue(field, value) {
    if (!field || !value || safeText(field.value || "", 120).trim()) {
      return;
    }
    field.value = value;
  }

  function hasSecureBackend() {
    return Boolean(getFirebaseConfig().secureBackendEnabled && state.functions);
  }

  async function callBackend(name, payload) {
    if (!hasSecureBackend()) {
      throw new Error("Secure backend functions are not available.");
    }
    const callable = state.functions.httpsCallable(name);
    const result = await callable(payload || {});
    return result && result.data ? result.data : {};
  }

  function trackEvent(name, params) {
    if (!state.analytics || typeof state.analytics.logEvent !== "function") {
      return;
    }
    try {
      state.analytics.logEvent(name, params || {});
    } catch (error) {
      console.warn("Analytics event skipped.", error);
    }
  }

  function bindGlobalErrorMonitoring() {
    if (window.__resourceFlowErrorHandlersBound === true) {
      return;
    }
    window.__resourceFlowErrorHandlersBound = true;
    window.addEventListener("error", function (event) {
      reportClientError({
        page: window.location.pathname,
        message: event && event.message ? event.message : "Unhandled window error",
        stack: event && event.error && event.error.stack ? event.error.stack : "",
        severity: "error"
      });
    });
    window.addEventListener("unhandledrejection", function (event) {
      const reason = event && event.reason ? event.reason : {};
      reportClientError({
        page: window.location.pathname,
        message: reason && reason.message ? reason.message : "Unhandled promise rejection",
        stack: reason && reason.stack ? reason.stack : "",
        severity: "error"
      });
    });
  }

  function reportClientError(payload) {
    const localPayload = {
      id: uid(),
      page: safeText(payload && payload.page ? payload.page : window.location.pathname, 120),
      message: safeText(payload && payload.message ? payload.message : "Unknown client error", 240),
      stack: safeText(payload && payload.stack ? payload.stack : "", 1200),
      severity: safeText(payload && payload.severity ? payload.severity : "error", 24),
      actor: currentActor(),
      createdAt: new Date().toISOString()
    };
    state.localErrors = [localPayload].concat(state.localErrors).slice(0, 20);
    if (!hasSecureBackend()) {
      return;
    }
    callBackend("logClientError", payload).catch(function (error) {
      console.warn("Client error reporting failed.", error);
    });
  }

  function startRealtimeSync() {
    if (state.storageMode !== "firebase" || !state.adapter || typeof state.adapter.subscribe !== "function") {
      return;
    }

    if (typeof state.unsubscribeRemote === "function") {
      state.unsubscribeRemote();
    }

    state.unsubscribeRemote = state.adapter.subscribe(function (remoteState, meta) {
      if (!remoteState) {
        return;
      }
      applyRemoteState(remoteState, meta);
    }, function () {
      updateSyncStatus("Listener Warning", "Realtime updates paused. Manual saves still work.");
      renderAll();
    });
  }

  function bindCrossTabSync() {
    window.addEventListener("storage", function (event) {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }
      try {
        const incoming = sanitizeState(JSON.parse(event.newValue));
        if (stateSignature(incoming) === stateSignature(state.data)) {
          return;
        }
        state.data = incoming;
        state.lastSyncAt = incoming.lastUpdated;
        updateSyncStatus("Live Update", "Workspace refreshed from another open tab.");
        renderAll();
      } catch (error) {
        console.warn("Cross-tab sync parse failed.", error);
      }
    });
  }

  function applyRemoteState(remoteState, meta) {
    const localSignature = stateSignature(state.data);
    const incomingSignature = stateSignature(remoteState);
    if (incomingSignature === localSignature) {
      return;
    }

    state.data = sanitizeState(remoteState);
    state.lastSyncAt = meta && meta.updatedAt ? safeIso(meta.updatedAt) : state.data.lastUpdated;
    if (state.storageMode === "firebase") {
      updateSyncStatus(
        "Live Sync",
        "Cloud workspace updated by " + (meta && meta.updatedBy ? meta.updatedBy : "another teammate") + "."
      );
    }
    renderAll();
  }

  function stateSignature(data) {
    const next = sanitizeState(data);
    return JSON.stringify({
      lastUpdated: next.lastUpdated,
      revision: next.meta ? next.meta.revision : 0,
      requests: next.requests.length,
      volunteers: next.volunteers.length,
      assignments: next.assignments.length,
      artifacts: next.artifacts.length,
      activity: next.activityLog.length
    });
  }

  function updateSyncStatus(status, detail) {
    state.syncStatus = status;
    state.syncDetail = detail;
    state.lastSyncAt = new Date().toISOString();
  }

  async function ensureFirebaseScripts() {
    if (window.firebase && window.firebase.firestore && window.firebase.auth && window.firebase.storage && window.firebase.functions) {
      return;
    }
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-functions-compat.js");
    if (getFirebaseConfig().enableAppCheck && getFirebaseConfig().appCheckSiteKey) {
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-check-compat.js");
    }
    if (getFirebaseConfig().measurementId) {
      await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics-compat.js");
    }
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-src="' + url + '"]');
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.dataset.src = url;
      script.onload = function () {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  function bindGlobalActions() {
    document.querySelectorAll('[data-action="seed-demo"]').forEach(function (button) {
      button.addEventListener("click", function () { seedDemo(); });
    });
    const scenarioSelect = document.getElementById("demoScenarioSelect");
    if (scenarioSelect && scenarioSelect.dataset.bound !== "true") {
      scenarioSelect.dataset.bound = "true";
      scenarioSelect.value = loadDemoScenario();
      scenarioSelect.addEventListener("change", function () {
        persistDemoScenario(scenarioSelect.value);
      });
    }
    document.querySelectorAll('[data-action="open-portal-login"]').forEach(function (button) {
      button.addEventListener("click", function () { openPortalChooser(""); });
    });
    document.querySelectorAll("[data-demo-role]").forEach(function (button) {
      if (button.dataset.bound === "true") {
        return;
      }
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        openPortalChooser(button.dataset.demoRole || "");
      });
    });
    document.querySelectorAll('[data-action="run-matching"]').forEach(function (button) {
      button.addEventListener("click", function () { recomputeAssignments(); });
    });
    document.querySelectorAll('[data-action="reset-all"]').forEach(function (button) {
      button.addEventListener("click", function () { resetAll(); });
    });
    document.querySelectorAll('[data-action="export-json"]').forEach(function (button) {
      button.addEventListener("click", function () { exportJson(); });
    });
    document.querySelectorAll('[data-action="export-csv"]').forEach(function (button) {
      button.addEventListener("click", function () { exportCsv(); });
    });
    document.querySelectorAll('[data-action="print-report"]').forEach(function (button) {
      button.addEventListener("click", function () { printSituationReport(); });
    });
    document.querySelectorAll('[data-action="print-field-sheet"]').forEach(function (button) {
      button.addEventListener("click", function () { printFieldSheet(); });
    });
    document.querySelectorAll('[data-action="print-judge-report"]').forEach(function (button) {
      button.addEventListener("click", function () { printJudgeSubmissionReport(); });
    });
    document.querySelectorAll('[data-action="download-brief"]').forEach(function (button) {
      button.addEventListener("click", function () { downloadBrief(); });
    });
    document.querySelectorAll('[data-action="download-analysis"]').forEach(function (button) {
      button.addEventListener("click", function () { downloadAnalysisPack(); });
    });
    document.querySelectorAll('[data-action="export-governance"]').forEach(function (button) {
      button.addEventListener("click", function () { exportGovernanceReport(); });
    });
    document.querySelectorAll('[data-action="run-gemini-live"]').forEach(function (button) {
      button.addEventListener("click", function () { runGeminiLiveAnalysis(); });
    });
    document.querySelectorAll('[data-action="refresh-route"]').forEach(function (button) {
      button.addEventListener("click", function () { refreshLiveRoutePlanner(true); });
    });
    document.querySelectorAll('[data-action="undo-archive"]').forEach(function (button) {
      button.addEventListener("click", function () { undoLastArchive(); });
    });
    document.querySelectorAll('[data-action="judge-demo-mode"]').forEach(function (button) {
      button.addEventListener("click", function () {
        launchJudgeDemoMode();
      });
    });
  }

  function openPortalChooser(role) {
    const normalized = normalizeRole(role);
    if (!getFirebaseConfig().enableAuth) {
      if (state.demoSession) {
        state.selectedPortalRole = "";
        renderPortalSelection();
      } else {
        openDemoRoleDialog();
        if (normalized) {
          selectDemoRole(normalized);
        }
      }
      return;
    }
    if (hasActiveSession()) {
      state.selectedPortalRole = "";
      state.pendingPortalRole = normalized || "";
      renderPortalSelection();
      return;
    }
    openEmailAuthDialog(normalized || pageRoleForPortal(currentPageName()), "signin");
  }

  function bindEntityActions() {
    if (window.__resourceFlowEntityActionsBound === true) {
      return;
    }
    window.__resourceFlowEntityActionsBound = true;
    document.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-entity-action]");
      if (!trigger) {
        return;
      }
      const action = trigger.dataset.entityAction;
      const id = trigger.dataset.entityId || "";
      if (action === "edit-request") {
        beginRequestEdit(id);
      } else if (action === "delete-request") {
        deleteRequest(id);
      } else if (action === "approve-request") {
        setRequestApproval(id, "approved");
      } else if (action === "reject-request") {
        setRequestApproval(id, "rejected");
      } else if (action === "advance-request-status") {
        advanceRequestStatus(id);
      } else if (action === "cancel-request-edit") {
        cancelRequestEdit();
      } else if (action === "edit-volunteer") {
        beginVolunteerEdit(id);
      } else if (action === "delete-volunteer") {
        deleteVolunteer(id);
      } else if (action === "restore-request") {
        restoreArchivedRecord("request", id);
      } else if (action === "restore-volunteer") {
        restoreArchivedRecord("volunteer", id);
      } else if (action === "advance-assignment-status") {
        advanceAssignmentStatus(id);
      } else if (action === "cancel-volunteer-edit") {
        cancelVolunteerEdit();
      } else if (action === "delete-artifact") {
        deleteArtifact(id);
      } else if (action === "refresh-admin") {
        loadAdminSnapshot(true);
      } else if (action === "preview-token") {
        previewAidToken(trigger.dataset.token || "");
      } else if (action === "draft-review-notification") {
        draftReviewNotification(id);
      }
    });
  }

  function bindPageHandlers() {
    const requestForm = document.getElementById("requestForm");
    if (requestForm) {
      restoreFormDraft(requestForm, REQUEST_DRAFT_KEY);
      bindDraftForm(requestForm, REQUEST_DRAFT_KEY);
      requestForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const added = await addRequest(formToRequest(requestForm));
        if (added) {
          requestForm.reset();
          clearFormDraft(REQUEST_DRAFT_KEY);
        }
      });
    }

    const volunteerForm = document.getElementById("volunteerForm");
    if (volunteerForm) {
      restoreFormDraft(volunteerForm, VOLUNTEER_DRAFT_KEY);
      bindDraftForm(volunteerForm, VOLUNTEER_DRAFT_KEY);
      volunteerForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const added = await addVolunteer(formToVolunteer(volunteerForm));
        if (added) {
          volunteerForm.reset();
          clearFormDraft(VOLUNTEER_DRAFT_KEY);
        }
      });
    }

    document.querySelectorAll('[data-action="sample-request"]').forEach(function (button) {
      button.addEventListener("click", function () {
        applySampleToForm(document.getElementById("requestForm"), REQUEST_SAMPLES);
        persistCurrentDraft(REQUEST_DRAFT_KEY, document.getElementById("requestForm"));
      });
    });

    document.querySelectorAll('[data-action="sample-volunteer"]').forEach(function (button) {
      button.addEventListener("click", function () {
        applySampleToForm(document.getElementById("volunteerForm"), VOLUNTEER_SAMPLES);
        persistCurrentDraft(VOLUNTEER_DRAFT_KEY, document.getElementById("volunteerForm"));
      });
    });

    const artifactForm = document.getElementById("artifactForm");
    if (artifactForm && artifactForm.dataset.bound !== "true") {
      artifactForm.dataset.bound = "true";
      artifactForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        await uploadArtifactFromForm(artifactForm);
      });
    }

    const bootstrapForm = document.getElementById("bootstrapAdminForm");
    if (bootstrapForm && bootstrapForm.dataset.bound !== "true") {
      bootstrapForm.dataset.bound = "true";
      bootstrapForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        await bootstrapAdminFromForm(bootstrapForm);
      });
    }

    const notificationForm = document.getElementById("notificationForm");
    if (notificationForm && notificationForm.dataset.bound !== "true") {
      notificationForm.dataset.bound = "true";
      notificationForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        await queueNotificationFromForm(notificationForm);
      });
    }

    const opsNotesForm = document.getElementById("opsNotesForm");
    if (opsNotesForm && opsNotesForm.dataset.bound !== "true") {
      opsNotesForm.dataset.bound = "true";
      if (opsNotesForm.elements.briefing) {
        opsNotesForm.elements.briefing.value = state.opsNotes.briefing || "";
      }
      if (opsNotesForm.elements.handoff) {
        opsNotesForm.elements.handoff.value = state.opsNotes.handoff || "";
      }
      if (opsNotesForm.elements.incident) {
        opsNotesForm.elements.incident.value = state.opsNotes.incident || "";
      }
      opsNotesForm.addEventListener("submit", function (event) {
        event.preventDefault();
        state.opsNotes = {
          briefing: textValue(new FormData(opsNotesForm), "briefing"),
          handoff: textValue(new FormData(opsNotesForm), "handoff"),
          incident: textValue(new FormData(opsNotesForm), "incident")
        };
        persistOpsNotes();
        announceNotice("Operator notes were saved for the current browser.");
        renderAll(true);
      });
    }

    if (document.getElementById("adminSummary")) {
      loadAdminSnapshot(false);
    }

    bindRenderInputs([
      "#operationsSearch",
      "#operationsZoneFilter",
      "#operationsCategoryFilter",
      "#operationsUrgencyFilter",
      "#operationsApprovalFilter",
      "#operationsStatusFilter",
      "#operationsSort",
      "#volunteerSearch",
      "#volunteerZoneFilter",
      "#volunteerSkillFilter",
      "#homeGlobalSearch",
      "#volunteerLanguage",
      "#volunteerTone"
    ]);

    const qrVerifyForm = document.getElementById("qrVerifyForm");
    if (qrVerifyForm && qrVerifyForm.dataset.bound !== "true") {
      qrVerifyForm.dataset.bound = "true";
      qrVerifyForm.addEventListener("submit", function (event) {
        event.preventDefault();
        verifyQrTokenFromForm(qrVerifyForm);
      });
    }
  }

  function bindRenderInputs(selectors) {
    selectors.forEach(function (selector) {
      const node = document.querySelector(selector);
      if (!node || node.dataset.bound === "true") {
        return;
      }
      node.dataset.bound = "true";
      node.addEventListener("input", function () { renderAll(); });
      node.addEventListener("change", function () { renderAll(); });
    });
  }

  function bindDraftForm(form, storageKey) {
    if (!form || form.dataset.draftBound === "true") {
      return;
    }
    form.dataset.draftBound = "true";
    form.addEventListener("input", function () {
      persistCurrentDraft(storageKey, form);
    });
    form.addEventListener("change", function () {
      persistCurrentDraft(storageKey, form);
    });
  }

  function persistCurrentDraft(storageKey, form) {
    if (!form) {
      return;
    }
    const payload = {};
    Array.from(form.elements).forEach(function (field) {
      if (!field.name || field.type === "file" || field.type === "button" || field.type === "submit") {
        return;
      }
      payload[field.name] = field.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  function restoreFormDraft(form, storageKey) {
    if (!form) {
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      const payload = JSON.parse(raw);
      Object.keys(payload).forEach(function (key) {
        if (form.elements.namedItem(key)) {
          form.elements.namedItem(key).value = payload[key];
        }
      });
    } catch (error) {
      console.warn("Could not restore form draft.", error);
    }
  }

  function clearFormDraft(storageKey) {
    localStorage.removeItem(storageKey);
  }

  async function seedDemo() {
    if (!ensureWorkspaceAccess("Only coordinators or admins can load demo data into the shared workspace.")) {
      return;
    }
    const scenario = readDemoScenarioControl();
    state.data = createScenarioDemoState(scenario);
    persistDemoScenario(scenario);
    updateSyncStatus("Demo Loaded", scenarioTitle(scenario) + " sample records and assignments are ready for walkthrough.");
    sendBrowserNotification("ResourceFlow demo ready", scenarioTitle(scenario) + " mode is loaded and ready for walkthrough.");
    trackEvent("resourceflow_seed_demo", { scenario: scenario });
    state.data = registerActivity(state.data, "system", "Loaded demo workspace data for walkthrough in " + scenarioTitle(scenario) + " mode.", currentActor());
    await persist();
    renderAll();
  }

  async function launchJudgeDemoMode() {
    if (canManageWorkspace()) {
      if (!state.data.requests.length) {
        await seedDemo();
      }
    } else if (!state.data.requests.length) {
      state.data = createScenarioDemoState(loadDemoScenario());
      renderAll();
    }
    announceNotice("Judge demo mode: show Overview, Operations matching, AI Insights, then Judge Mode proof cards.");
    sendBrowserNotification("Judge demo mode", "Walk through Overview, Operations, AI Insights, and Judge Mode in that order.");
  }

  async function resetAll() {
    if (!ensureWorkspaceAccess("Only coordinators or admins can reset the shared workspace.")) {
      return;
    }
    state.data = createEmptyState();
    state.data = registerActivity(state.data, "system", "Workspace reset to an empty state.", currentActor());
    trackEvent("resourceflow_reset_workspace", { role: state.role });
    await persist();
    renderAll();
  }

  async function addRequest(request) {
    if (!ensureWorkspaceAccess("Please sign in as a coordinator or admin to create operational requests.")) {
      return false;
    }
    const nextRequest = sanitizeRequestRecord(request);
    const requestIssue = validateRequest(nextRequest);
    if (requestIssue) {
      announceNotice(requestIssue);
      return false;
    }
    if (!state.requestEditId && isDuplicateRequest(state.data, nextRequest)) {
      announceNotice("A similar request already exists. Update the existing request instead of creating a duplicate.");
      return false;
    }

    if (state.requestEditId) {
      const existingRequest = state.data.requests.find(function (item) { return item.id === state.requestEditId; });
      nextRequest.id = state.requestEditId;
      nextRequest.createdAt = existingRequest ? existingRequest.createdAt : nextRequest.createdAt;
      nextRequest.approvalStatus = existingRequest ? existingRequest.approvalStatus : "pending";
      nextRequest.workflowStatus = existingRequest ? existingRequest.workflowStatus : "pending";
      nextRequest.shiftLabel = nextRequest.shiftLabel || (existingRequest ? existingRequest.shiftLabel : inferShiftLabel(nextRequest.createdAt, nextRequest.urgency));
      nextRequest.responseDay = nextRequest.shiftLabel.split(" - ")[0];
      nextRequest.scenario = normalizeScenario(nextRequest.scenario || (existingRequest ? existingRequest.scenario : inferScenario(nextRequest.category, nextRequest.title, nextRequest.notes)));
      nextRequest.routeCluster = normalizeRouteCluster(nextRequest.routeCluster || (existingRequest ? existingRequest.routeCluster : routeClusterForZone(nextRequest.zone)));
      nextRequest.archived = existingRequest ? Boolean(existingRequest.archived) : false;
      nextRequest.approvedAt = existingRequest ? existingRequest.approvedAt : "";
      nextRequest.approvedBy = existingRequest ? existingRequest.approvedBy : "";
      nextRequest.requestedBy = existingRequest ? existingRequest.requestedBy : currentActor();
      nextRequest.rejectionReason = existingRequest ? existingRequest.rejectionReason : "";
      state.data.requests = state.data.requests.map(function (item) {
        return item.id === state.requestEditId ? nextRequest : item;
      });
    } else {
      nextRequest.approvalStatus = currentAdminCapability() ? "approved" : "pending";
      nextRequest.workflowStatus = "pending";
      nextRequest.requestedBy = currentActor();
      nextRequest.shiftLabel = nextRequest.shiftLabel || inferShiftLabel(nextRequest.createdAt, nextRequest.urgency);
      nextRequest.responseDay = nextRequest.shiftLabel.split(" - ")[0];
      nextRequest.scenario = normalizeScenario(nextRequest.scenario || inferScenario(nextRequest.category, nextRequest.title, nextRequest.notes));
      nextRequest.routeCluster = normalizeRouteCluster(nextRequest.routeCluster || routeClusterForZone(nextRequest.zone));
      nextRequest.archived = false;
      if (nextRequest.approvalStatus === "approved") {
        nextRequest.approvedAt = new Date().toISOString();
        nextRequest.approvedBy = currentActor();
      }
      state.data.requests.unshift(nextRequest);
    }
    state.data.assignments = generateAssignments(state.data);
    syncRequestStatusesFromAssignments();
    state.data = registerActivity(
      state.data,
      "request",
      (state.requestEditId ? "Updated request: " : "Added request: ") + nextRequest.title + " (" + nextRequest.zone + " zone, " + titleCase(nextRequest.approvalStatus) + ").",
      currentActor()
    );
    trackEvent("resourceflow_add_request", {
      zone: nextRequest.zone,
      category: nextRequest.category
    });
    await persist();
    cancelRequestEdit(false);
    renderAll();
    return true;
  }

  async function addVolunteer(volunteer) {
    if (!hasActiveSession()) {
      announceNotice(getFirebaseConfig().enableAuth
        ? "Please sign in before registering a volunteer in the shared workspace."
        : "Please choose a demo role before registering a volunteer.");
      return false;
    }
    const nextVolunteer = sanitizeVolunteerRecord(volunteer);
    const volunteerIssue = validateVolunteer(nextVolunteer);
    if (volunteerIssue) {
      announceNotice(volunteerIssue);
      return false;
    }
    if (!state.volunteerEditId && isDuplicateVolunteer(state.data, nextVolunteer)) {
      announceNotice("A volunteer with the same name and zone is already registered.");
      return false;
    }

    if (!canManageWorkspace() && hasSecureBackend()) {
      await callBackend("submitVolunteerRegistration", {
        volunteer: nextVolunteer
      });
      updateSyncStatus("Volunteer Saved", "Volunteer registration was submitted through the secure backend.");
      try {
        const refreshed = await state.adapter.load();
        state.data = sanitizeState(refreshed || state.data);
      } catch (error) {
        console.warn("Could not refresh workspace after volunteer submission.", error);
      }
      renderAll();
      return true;
    }

    if (state.volunteerEditId) {
      const existingVolunteer = state.data.volunteers.find(function (item) { return item.id === state.volunteerEditId; });
      nextVolunteer.id = state.volunteerEditId;
      nextVolunteer.ownerUid = existingVolunteer ? existingVolunteer.ownerUid : "";
      nextVolunteer.ownerEmail = existingVolunteer ? existingVolunteer.ownerEmail : "";
      nextVolunteer.archived = existingVolunteer ? Boolean(existingVolunteer.archived) : false;
      nextVolunteer.shiftPreference = nextVolunteer.shiftPreference || (existingVolunteer ? existingVolunteer.shiftPreference : inferVolunteerShift(nextVolunteer.availability));
      state.data.volunteers = state.data.volunteers.map(function (item) {
        return item.id === state.volunteerEditId ? nextVolunteer : item;
      });
    } else {
      nextVolunteer.archived = false;
      nextVolunteer.shiftPreference = nextVolunteer.shiftPreference || inferVolunteerShift(nextVolunteer.availability);
      state.data.volunteers.unshift(nextVolunteer);
    }
    state.data.assignments = generateAssignments(state.data);
    syncRequestStatusesFromAssignments();
    state.data = registerActivity(
      state.data,
      "volunteer",
      (state.volunteerEditId ? "Updated volunteer: " : "Registered volunteer: ") + nextVolunteer.name + " (" + nextVolunteer.zone + " zone).",
      currentActor()
    );
    trackEvent("resourceflow_add_volunteer", {
      zone: nextVolunteer.zone,
      role: state.role
    });
    await persist();
    cancelVolunteerEdit(false);
    renderAll();
    return true;
  }

  async function recomputeAssignments() {
    if (!ensureWorkspaceAccess("Only coordinators or admins can run live matching.")) {
      return;
    }
    state.data.assignments = generateAssignments(state.data);
    syncRequestStatusesFromAssignments();
    state.data = registerActivity(
      state.data,
      "matching",
      "Matching engine recomputed assignments with latest fairness and skill scoring.",
      currentActor()
    );
    trackEvent("resourceflow_run_matching", { role: state.role });
    await persist();
    renderAll();
  }

  async function persist() {
    const now = new Date().toISOString();
    state.data = sanitizeState(state.data);
    state.data.lastUpdated = now;
    state.data.meta.revision = Number(state.data.meta.revision || 0) + 1;
    state.data.meta.updatedBy = currentActor();
    state.data.meta.updatedAt = now;
    state.data.history = appendHistorySnapshot(state.data.history, state.data);

    try {
      await state.adapter.save(state.data);
      updateSyncStatus(
        state.storageMode === "firebase" ? "Cloud Saved" : "Offline Saved",
        state.storageMode === "firebase"
          ? "Revision " + state.data.meta.revision + " synced to Firebase."
          : "Latest revision saved in this browser."
      );
    } catch (error) {
      console.warn("Cloud save failed, storing locally instead.", error);
      if (typeof state.unsubscribeRemote === "function") {
        state.unsubscribeRemote();
        state.unsubscribeRemote = null;
      }
      state.adapter = createLocalAdapter();
      state.storageMode = state.adapter.mode;
      await state.adapter.save(state.data);
      updateSyncStatus("Offline Fallback", "Cloud save failed. Workspace was saved locally.");
    }
  }

  function beginRequestEdit(id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can edit requests.")) {
      return;
    }
    const request = state.data.requests.find(function (item) { return item.id === id; });
    const form = document.getElementById("requestForm");
    if (!request || !form) {
      return;
    }
    state.requestEditId = id;
    form.elements.organization.value = request.organization || "";
    form.elements.title.value = request.title || "";
    form.elements.category.value = request.category || "";
    form.elements.urgency.value = String(request.urgency || 3);
    form.elements.peopleNeeded.value = String(request.peopleNeeded || 1);
    form.elements.zone.value = request.zone || "Central";
    form.elements.location.value = request.location || "";
    form.elements.beneficiaries.value = String(request.beneficiaries || 1);
    form.elements.skills.value = Array.isArray(request.skills) ? request.skills.join(", ") : "";
    form.elements.notes.value = request.notes || "";
    if (form.elements.shiftLabel) {
      form.elements.shiftLabel.value = request.shiftLabel || "Today - Afternoon";
    }
    if (form.elements.scenario) {
      form.elements.scenario.value = request.scenario || "mixed";
    }
    updateRequestEditorUi();
  }

  function cancelRequestEdit(shouldRender) {
    state.requestEditId = "";
    const form = document.getElementById("requestForm");
    if (form) {
      form.reset();
    }
    updateRequestEditorUi();
    if (shouldRender !== false) {
      renderAll();
    }
  }

  async function deleteRequest(id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can archive requests.")) {
      return;
    }
    if (typeof window.confirm === "function" && !window.confirm("Archive this request from the workspace?")) {
      return;
    }
    const request = state.data.requests.find(function (item) { return item.id === id; });
    if (!request) {
      return;
    }
    state.pendingUndo = { type: "request", id: id };
    state.data.requests = state.data.requests.map(function (item) {
      return item.id === id ? Object.assign({}, item, { archived: true }) : item;
    });
    state.data.assignments = generateAssignments(state.data);
    syncRequestStatusesFromAssignments();
    state.data = registerActivity(state.data, "request", "Archived request " + request.title + ".", currentActor());
    if (state.requestEditId === id) {
      cancelRequestEdit(false);
    }
    await persist();
    renderAll();
  }

  function beginVolunteerEdit(id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can edit volunteers.")) {
      return;
    }
    const volunteer = state.data.volunteers.find(function (item) { return item.id === id; });
    const form = document.getElementById("volunteerForm");
    if (!volunteer || !form) {
      return;
    }
    state.volunteerEditId = id;
    form.elements.name.value = volunteer.name || "";
    form.elements.zone.value = volunteer.zone || "Central";
    form.elements.location.value = volunteer.location || "";
    form.elements.availability.value = volunteer.availability || "Half Day";
    form.elements.skills.value = Array.isArray(volunteer.skills) ? volunteer.skills.join(", ") : "";
    form.elements.transport.value = volunteer.transport || "No";
    form.elements.experience.value = volunteer.experience || "Intermediate";
    if (form.elements.languages) {
      form.elements.languages.value = Array.isArray(volunteer.languages) ? volunteer.languages.join(", ") : "English";
    }
    if (form.elements.shiftPreference) {
      form.elements.shiftPreference.value = volunteer.shiftPreference || inferVolunteerShift(volunteer.availability);
    }
    updateVolunteerEditorUi();
  }

  function cancelVolunteerEdit(shouldRender) {
    state.volunteerEditId = "";
    const form = document.getElementById("volunteerForm");
    if (form) {
      form.reset();
    }
    updateVolunteerEditorUi();
    if (shouldRender !== false) {
      renderAll();
    }
  }

  async function deleteVolunteer(id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can archive volunteers.")) {
      return;
    }
    if (typeof window.confirm === "function" && !window.confirm("Archive this volunteer from the workspace?")) {
      return;
    }
    const volunteer = state.data.volunteers.find(function (item) { return item.id === id; });
    if (!volunteer) {
      return;
    }
    state.pendingUndo = { type: "volunteer", id: id };
    state.data.volunteers = state.data.volunteers.map(function (item) {
      return item.id === id ? Object.assign({}, item, { archived: true }) : item;
    });
    state.data.assignments = generateAssignments(state.data);
    syncRequestStatusesFromAssignments();
    state.data = registerActivity(state.data, "volunteer", "Archived volunteer " + volunteer.name + ".", currentActor());
    if (state.volunteerEditId === id) {
      cancelVolunteerEdit(false);
    }
    await persist();
    renderAll();
  }

  async function deleteArtifact(id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can delete uploaded artifacts.")) {
      return;
    }
    if (typeof window.confirm === "function" && !window.confirm("Delete this artifact record from the workspace?")) {
      return;
    }
    const artifact = state.data.artifacts.find(function (item) { return item.id === id; });
    if (artifact && artifact.path && getStorageBucket()) {
      try {
        await getStorageBucket().ref().child(artifact.path).delete();
      } catch (error) {
        console.warn("Could not delete artifact file from storage.", error);
      }
    }
    state.data.artifacts = state.data.artifacts.filter(function (item) { return item.id !== id; });
    state.data = registerActivity(state.data, "upload", "Removed an artifact record from the workspace.", currentActor());
    await persist();
    renderAll();
  }

  function syncRequestStatusesFromAssignments() {
    const assignmentGroups = {};
    getVisibleAssignments(state.data).forEach(function (item) {
      assignmentGroups[item.requestId] = (assignmentGroups[item.requestId] || 0) + 1;
    });
    state.data.requests = state.data.requests.map(function (request) {
      if (request.archived) {
        return request;
      }
      const assigned = assignmentGroups[request.id] || 0;
      const approvalStatus = normalizeApprovalStatus(request.approvalStatus);
      let workflowStatus = normalizeWorkflowStatus(request.workflowStatus);
      if (approvalStatus !== "approved") {
        workflowStatus = "pending";
      } else if ((workflowStatus === "pending" || workflowStatus === "assigned") && assigned > 0) {
        workflowStatus = "assigned";
      } else if (workflowStatus === "pending" && assigned === 0) {
        workflowStatus = "pending";
      }
      return Object.assign({}, request, {
        workflowStatus: workflowStatus
      });
    });
  }

  function nextWorkflowStatus(status) {
    const current = normalizeWorkflowStatus(status);
    const index = WORKFLOW_SEQUENCE.indexOf(current);
    return WORKFLOW_SEQUENCE[Math.min(index + 1, WORKFLOW_SEQUENCE.length - 1)] || "closed";
  }

  async function setRequestApproval(id, status) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can review request approvals.")) {
      return;
    }
    const request = state.data.requests.find(function (item) { return item.id === id; });
    if (!request) {
      return;
    }
    const nextStatus = normalizeApprovalStatus(status);
    state.data.requests = state.data.requests.map(function (item) {
      if (item.id !== id) {
        return item;
      }
      return Object.assign({}, item, {
        approvalStatus: nextStatus,
        approvedAt: nextStatus === "approved" ? new Date().toISOString() : "",
        approvedBy: nextStatus === "approved" ? currentActor() : "",
        rejectionReason: nextStatus === "rejected" ? "Held for coordinator review" : "",
        workflowStatus: nextStatus === "approved" ? normalizeWorkflowStatus(item.workflowStatus || "pending") : "pending"
      });
    });
    state.data.assignments = generateAssignments(state.data);
    syncRequestStatusesFromAssignments();
    state.data = registerActivity(
      state.data,
      "approval",
      titleCase(nextStatus) + " request " + request.title + ".",
      currentActor()
    );
    if (nextStatus === "approved") {
      state.localNotifications.unshift({
        id: uid(),
        subject: "Request approved",
        message: request.title + " is ready for matching and dispatch.",
        channels: ["in-app"],
        status: "ready",
        createdAt: new Date().toISOString()
      });
    }
    sendBrowserNotification("Approval update", request.title + " is now " + titleCase(nextStatus) + ".");
    await persist();
    renderAll();
  }

  async function advanceRequestStatus(id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can change request status.")) {
      return;
    }
    const request = state.data.requests.find(function (item) { return item.id === id; });
    if (!request || normalizeApprovalStatus(request.approvalStatus) !== "approved") {
      announceNotice("Approve the request before moving it through the delivery pipeline.");
      return;
    }
    const nextStatus = nextWorkflowStatus(request.workflowStatus);
    state.data.requests = state.data.requests.map(function (item) {
      return item.id === id ? Object.assign({}, item, { workflowStatus: nextStatus }) : item;
    });
    state.data = registerActivity(state.data, "workflow", "Moved request " + request.title + " to " + titleCase(nextStatus.replace(/-/g, " ")) + ".", currentActor());
    state.localNotifications.unshift({
      id: uid(),
      subject: "Request status updated",
      message: request.title + " is now " + titleCase(nextStatus.replace(/-/g, " ")) + ".",
      channels: ["in-app"],
      status: "tracked",
      createdAt: new Date().toISOString()
    });
    sendBrowserNotification("Workflow update", request.title + " moved to " + titleCase(nextStatus.replace(/-/g, " ")) + ".");
    await persist();
    renderAll();
  }

  async function advanceAssignmentStatus(id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can change assignment status.")) {
      return;
    }
    const assignment = state.data.assignments.find(function (item) { return item.id === id; });
    if (!assignment) {
      return;
    }
    const nextStatus = nextWorkflowStatus(assignment.status);
    state.data.assignments = state.data.assignments.map(function (item) {
      return item.id === id ? Object.assign({}, item, { status: nextStatus }) : item;
    });
    state.data = registerActivity(state.data, "dispatch", "Updated assignment for " + assignment.volunteerName + " to " + titleCase(nextStatus.replace(/-/g, " ")) + ".", currentActor());
    await persist();
    renderAll();
  }

  async function restoreArchivedRecord(type, id) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can restore archived records.")) {
      return;
    }
    if (type === "request") {
      state.data.requests = state.data.requests.map(function (item) {
        return item.id === id ? Object.assign({}, item, { archived: false }) : item;
      });
      state.data = registerActivity(state.data, "archive", "Restored archived request.", currentActor());
    } else if (type === "volunteer") {
      state.data.volunteers = state.data.volunteers.map(function (item) {
        return item.id === id ? Object.assign({}, item, { archived: false }) : item;
      });
      state.data = registerActivity(state.data, "archive", "Restored archived volunteer.", currentActor());
    }
    state.data.assignments = generateAssignments(state.data);
    syncRequestStatusesFromAssignments();
    await persist();
    renderAll();
  }

  async function undoLastArchive() {
    if (!state.pendingUndo) {
      announceNotice("There is no archived action to undo right now.");
      return;
    }
    const pending = Object.assign({}, state.pendingUndo);
    state.pendingUndo = null;
    await restoreArchivedRecord(pending.type, pending.id);
  }

  function updateRequestEditorUi() {
    const submit = document.getElementById("requestSubmitButton");
    const cancel = document.getElementById("requestCancelButton");
    const heading = document.getElementById("requestEditorStatus");
    if (submit) {
      submit.textContent = state.requestEditId ? "Update Request" : "Save Request";
    }
    if (cancel) {
      cancel.hidden = !state.requestEditId;
    }
    if (heading) {
      heading.textContent = state.requestEditId ? "Editing existing request" : "Create a new request";
    }
  }

  function updateVolunteerEditorUi() {
    const submit = document.getElementById("volunteerSubmitButton");
    const cancel = document.getElementById("volunteerCancelButton");
    const heading = document.getElementById("volunteerEditorStatus");
    if (submit) {
      submit.textContent = state.volunteerEditId ? "Update Volunteer" : "Register Volunteer";
    }
    if (cancel) {
      cancel.hidden = !state.volunteerEditId;
    }
    if (heading) {
      heading.textContent = state.volunteerEditId ? "Editing volunteer record" : "Register a new volunteer";
    }
  }

  function formToRequest(form) {
    const formData = new FormData(form);
    return {
      id: uid(),
      organization: textValue(formData, "organization"),
      title: textValue(formData, "title"),
      category: textValue(formData, "category"),
      urgency: Number(formData.get("urgency")),
      peopleNeeded: Number(formData.get("peopleNeeded")),
      zone: textValue(formData, "zone"),
      location: textValue(formData, "location"),
      beneficiaries: Number(formData.get("beneficiaries")),
      skills: parseSkills(formData.get("skills")),
      notes: textValue(formData, "notes"),
      shiftLabel: textValue(formData, "shiftLabel"),
      scenario: textValue(formData, "scenario"),
      createdAt: new Date().toISOString()
    };
  }

  function formToVolunteer(form) {
    const formData = new FormData(form);
    return {
      id: uid(),
      name: textValue(formData, "name"),
      zone: textValue(formData, "zone"),
      location: textValue(formData, "location"),
      availability: textValue(formData, "availability"),
      skills: parseSkills(formData.get("skills")),
      transport: textValue(formData, "transport"),
      experience: textValue(formData, "experience"),
      languages: parseLanguages(formData.get("languages")),
      shiftPreference: textValue(formData, "shiftPreference"),
      createdAt: new Date().toISOString()
    };
  }

  function textValue(formData, key) {
    return String(formData.get(key) || "").trim();
  }

  function parseSkills(raw) {
    return normalizeSkills(raw);
  }

  function parseLanguages(raw) {
    return normalizeLanguages(raw);
  }

  function readDemoScenarioControl() {
    const control = document.getElementById("demoScenarioSelect");
    return control ? normalizeScenario(control.value) : loadDemoScenario();
  }

  function applySampleToForm(form, samples) {
    if (!form) {
      return;
    }
    const sample = samples[Math.floor(Math.random() * samples.length)];
    Object.keys(sample).forEach(function (key) {
      if (form.elements.namedItem(key)) {
        form.elements.namedItem(key).value = sample[key];
      }
    });
  }

  function generateAssignments(data) {
    const next = sanitizeState(data);
    const requests = getActionableRequests(next);
    const volunteers = getVisibleVolunteers(next);
    const previousAssignments = {};
    getVisibleAssignments(next).forEach(function (item) {
      previousAssignments[item.requestId + "|" + item.volunteerId] = item;
    });
    const available = new Set(volunteers.map(function (item) { return item.id; }));
    const assignments = [];
    const demandByZone = buildZoneDemandIndex(requests);
    const supplyByZone = buildZoneSupplyIndex(volunteers);
    const sortedRequests = clone(requests).sort(function (left, right) {
      if (Number(right.urgency) !== Number(left.urgency)) {
        return Number(right.urgency) - Number(left.urgency);
      }
      return Number(right.beneficiaries || 0) - Number(left.beneficiaries || 0);
    });

    sortedRequests.forEach(function (request) {
      const zonePressure = computeZonePressure(request.zone, demandByZone, supplyByZone);
      const candidates = volunteers
        .filter(function (volunteer) { return available.has(volunteer.id); })
        .map(function (volunteer) {
          const scored = scoreVolunteer(volunteer, request, {
            zonePressure: zonePressure
          });
          return {
            volunteer: volunteer,
            score: scored.score,
            reason: scored.reason
          };
        })
        .filter(function (item) { return item.score > 0; })
        .sort(function (left, right) { return right.score - left.score; })
        .slice(0, Number(request.peopleNeeded || 0));

      candidates.forEach(function (entry) {
        const previous = previousAssignments[request.id + "|" + entry.volunteer.id];
        assignments.push({
          id: previous ? previous.id : uid(),
          requestId: request.id,
          requestTitle: request.title,
          organization: request.organization,
          volunteerId: entry.volunteer.id,
          volunteerName: entry.volunteer.name,
          category: request.category,
          zone: request.zone,
          urgency: request.urgency,
          score: entry.score,
          reason: entry.reason,
          status: previous ? previous.status : "assigned",
          shiftLabel: request.shiftLabel,
          responseDay: request.responseDay,
          routeCluster: request.routeCluster,
          etaMinutes: previous ? previous.etaMinutes : estimateEtaMinutes(entry.volunteer.zone, request.zone),
          deliveryReceiptId: previous ? previous.deliveryReceiptId : ("RCPT-" + String(request.id).slice(-4).toUpperCase() + "-" + String(entry.volunteer.id).slice(-3).toUpperCase())
        });
        available.delete(entry.volunteer.id);
        demandByZone[request.zone] = Math.max(Number(demandByZone[request.zone] || 0) - 1, 0);
      });
    });

    return assignments.map(sanitizeAssignmentRecord).filter(Boolean);
  }

  function scoreVolunteer(volunteer, request, context) {
    const requestSkills = Array.isArray(request.skills) ? request.skills : [];
    const volunteerSkills = Array.isArray(volunteer.skills) ? volunteer.skills : [];
    const matchedSkills = volunteerSkills.filter(function (skill) {
      return requestSkills.indexOf(skill) >= 0;
    });
    const distance = zoneDistance(volunteer.zone, request.zone);
    const zonePressure = context && context.zonePressure ? context.zonePressure : 1;

    let score = 0;
    score += matchedSkills.length * 30;
    score += Math.max(0, 14 - distance * 5);
    score += Math.round((zonePressure - 1) * 8);
    score += volunteer.transport === "Yes" ? 10 : 0;
    score += availabilityWeight(volunteer.availability);
    score += experienceWeight(volunteer.experience);
    score += Number(request.urgency || 0) * 4;

    if (distance >= 2 && volunteer.transport !== "Yes") {
      score -= 18;
    }
    if (!matchedSkills.length && distance >= 2) {
      score -= 14;
    }

    return {
      score: Math.max(Math.round(score), 0),
      reason: explainMatch(volunteer, request, {
        overlap: matchedSkills,
        distance: distance,
        zonePressure: zonePressure
      })
    };
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

  function explainMatch(volunteer, request, context) {
    const reasons = [];
    const overlap = context && Array.isArray(context.overlap)
      ? context.overlap
      : (volunteer.skills || []).filter(function (skill) {
          return (request.skills || []).indexOf(skill) >= 0;
        });
    if (overlap.length) {
      reasons.push("skills: " + overlap.join(", "));
    }
    if (context && context.distance === 0) {
      reasons.push("same zone");
    } else if (context && context.distance === 1) {
      reasons.push("adjacent zone");
    }
    if (volunteer.transport === "Yes") {
      reasons.push("independent transport");
    }
    if (context && context.zonePressure > 1.15) {
      reasons.push("high-demand zone priority");
    }
    reasons.push(String(volunteer.experience || "Intermediate").toLowerCase() + " experience");
    return reasons.join(" | ");
  }

  function buildZoneDemandIndex(requests) {
    const demand = {};
    (requests || []).forEach(function (request) {
      const zone = normalizeZone(request.zone);
      const slots = Number(request.peopleNeeded || 0);
      const urgencyWeight = Math.max(Number(request.urgency || 1), 1);
      demand[zone] = Number(demand[zone] || 0) + (slots * urgencyWeight);
    });
    return demand;
  }

  function buildZoneSupplyIndex(volunteers) {
    const supply = {};
    (volunteers || []).forEach(function (volunteer) {
      const zone = normalizeZone(volunteer.zone);
      supply[zone] = Number(supply[zone] || 0) + 1;
    });
    return supply;
  }

  function computeZonePressure(zone, demandByZone, supplyByZone) {
    const safeZone = normalizeZone(zone);
    const demand = Number(demandByZone[safeZone] || 0);
    const supply = Math.max(1, Number(supplyByZone[safeZone] || 0));
    return Math.max(0.8, Math.min(2.2, demand / supply));
  }

  function zoneDistance(fromZone, toZone) {
    const from = normalizeZone(fromZone);
    const to = normalizeZone(toZone);
    if (ZONE_DISTANCE[from] && typeof ZONE_DISTANCE[from][to] === "number") {
      return ZONE_DISTANCE[from][to];
    }
    return from === to ? 0 : 2;
  }

  function validateRequest(request) {
    if (!request.organization || !request.title || !request.category) {
      return "Please fill organization, title, and category before saving the request.";
    }
    if (!request.zone || ALLOWED_ZONES.indexOf(request.zone) < 0) {
      return "Please choose a valid zone for the request.";
    }
    if (!request.skills.length) {
      return "Please add at least one required skill for this request.";
    }
    return "";
  }

  function validateVolunteer(volunteer) {
    if (!volunteer.name) {
      return "Volunteer name is required.";
    }
    if (!volunteer.zone || ALLOWED_ZONES.indexOf(volunteer.zone) < 0) {
      return "Please choose a valid zone for volunteer registration.";
    }
    if (!volunteer.skills.length) {
      return "Please add at least one skill for the volunteer.";
    }
    return "";
  }

  function isDuplicateRequest(data, candidate) {
    const key = [candidate.organization, candidate.title, candidate.zone]
      .join("|")
      .toLowerCase();
    return (data.requests || []).some(function (item) {
      return [item.organization, item.title, item.zone].join("|").toLowerCase() === key;
    });
  }

  function isDuplicateVolunteer(data, candidate) {
    const key = [candidate.name, candidate.zone].join("|").toLowerCase();
    return (data.volunteers || []).some(function (item) {
      return [item.name, item.zone].join("|").toLowerCase() === key;
    });
  }

  function announceNotice(message) {
    updateSyncStatus("Validation Check", message);
    const announceNode = document.getElementById("announce");
    if (announceNode) {
      announceNode.textContent = message;
    }
    renderAll();
  }

  function registerActivity(data, type, message, actor) {
    const next = sanitizeState(data);
    const entry = {
      id: uid(),
      type: String(type || "system"),
      actor: safeText(actor || "system", 42),
      at: new Date().toISOString(),
      message: safeText(message, 240)
    };
    next.activityLog = [entry].concat(next.activityLog || []).slice(0, MAX_ACTIVITY_LOG);
    return next;
  }

  function appendHistorySnapshot(history, data) {
    const nextHistory = Array.isArray(history)
      ? history.map(sanitizeHistoryRecord).filter(Boolean)
      : [];
    const metricsData = computeMetrics(data);
    const metrics = {
      coverage: metricsData.coverage,
      criticalFill: metricsData.criticalFill
    };
    const snapshot = sanitizeHistoryRecord({
      id: uid(),
      at: data.lastUpdated || new Date().toISOString(),
      revision: data.meta ? data.meta.revision : 0,
      requests: metricsData.requests,
      volunteers: metricsData.volunteers,
      assignments: metricsData.assignments,
      coverage: metrics.coverage,
      criticalFill: metrics.criticalFill
    });
    const latest = nextHistory[0];
    if (latest && latest.revision === snapshot.revision) {
      return nextHistory.slice(0, MAX_HISTORY_SNAPSHOTS);
    }
    return [snapshot].concat(nextHistory).slice(0, MAX_HISTORY_SNAPSHOTS);
  }

  function buildRiskRadar(data) {
    const requests = getActionableRequests(data);
    const assignments = getVisibleAssignments(data);
    return clone(requests)
      .map(function (request) {
        const assigned = assignments.filter(function (item) { return item.requestId === request.id; }).length;
        const deficit = Math.max(Number(request.peopleNeeded || 0) - assigned, 0);
        const severity = (Number(request.urgency || 0) * 20) + (deficit * 18) + Math.min(Number(request.beneficiaries || 0) / 10, 20);
        return {
          id: request.id,
          title: request.title,
          zone: request.zone,
          organization: request.organization,
          urgency: Number(request.urgency || 0),
          assigned: assigned,
          peopleNeeded: Number(request.peopleNeeded || 0),
          deficit: deficit,
          severity: Math.round(severity)
        };
      })
      .filter(function (item) { return item.deficit > 0; })
      .sort(function (left, right) { return right.severity - left.severity; });
  }

  function computeReadinessScore(input) {
    const requestLoad = input.requests ? Math.min((input.volunteers / Math.max(input.requests, 1)) * 24, 24) : 24;
    const assignmentLift = input.requests ? Math.min((input.assignments / Math.max(input.requests, 1)) * 12, 12) : 12;
    const score = (input.coverage * 0.38) + (input.criticalFill * 0.38) + requestLoad + assignmentLift;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function buildHistorySummary(history) {
    const items = Array.isArray(history) ? history.map(sanitizeHistoryRecord).filter(Boolean) : [];
    if (items.length < 2) {
      return {
        latestCoverage: items[0] ? items[0].coverage : 0,
        latestCriticalFill: items[0] ? items[0].criticalFill : 0,
        coverageDelta: 0,
        criticalDelta: 0
      };
    }
    return {
      latestCoverage: items[0].coverage,
      latestCriticalFill: items[0].criticalFill,
      coverageDelta: items[0].coverage - items[1].coverage,
      criticalDelta: items[0].criticalFill - items[1].criticalFill
    };
  }
  function renderAll() {
    if (enforcePortalAccess()) {
      return;
    }
    renderAuthUi();
    syncNavigationAccess();
    renderCommon();
    renderHome();
    renderOperations();
    renderVolunteer();
    renderInsights();
    renderAdmin();
    renderImpact();
  }

  function renderCommon() {
    const metrics = computeMetrics(state.data);
    setText("#metricRequests", String(metrics.requests));
    setText("#metricVolunteers", String(metrics.volunteers));
    setText("#metricAssignments", String(metrics.assignments));
    setText("#metricBeneficiaries", String(metrics.beneficiaries));
    setText("#metricCoverage", metrics.coverage + "%");
    setText("#metricCriticalFill", metrics.criticalFill + "%");

    document.querySelectorAll("[data-storage-mode]").forEach(function (node) {
      node.textContent = state.storageMode === "firebase" ? "Firebase Live Sync" : "Local Mode";
    });

    document.querySelectorAll("[data-sync-note]").forEach(function (node) {
      const revision = state.data.meta ? state.data.meta.revision : 0;
      node.textContent = state.syncStatus + " - Rev " + revision + " - " + state.syncDetail;
    });
  }

  function syncNavigationAccess() {
    const role = getFirebaseConfig().enableAuth
      ? activeAccessRole()
      : (state.demoSession ? normalizeRole(state.role) : "guest");
    document.querySelectorAll("[data-nav]").forEach(function (node) {
      const allowed = roleCanAccessPage(role, node.dataset.nav || "home");
      node.hidden = !allowed;
    });
  }

  function renderHome() {
    const activityNode = document.getElementById("homeActivity");
    const homeAccessibilityPanel = document.getElementById("homeAccessibilityPanel");
    const homePwaPanel = document.getElementById("homePwaPanel");
    const globalSearchResults = document.getElementById("globalSearchResults");
    const guidedDemoPanel = document.getElementById("guidedDemoPanel");
    const primaryAction = document.querySelector("body[data-page='home'] .button-row .primary-link");
    const secondaryAction = document.querySelector("body[data-page='home'] .button-row .ghost-link");
    if (!activityNode) {
      return;
    }

    const insights = buildInsights(state.data);
    setText("#homeInsightTitle", insights.nextActionTitle);
    setText("#homeInsightText", insights.nextActionText);
    setText(".hero-card .eyebrow", uiText("Smart Resource Allocation", "Smart Resource Allocation", "Smart Resource Allocation"));
    setText(".hero-card h1", uiText(
      "Move from chaotic coordination to predictive, confident disaster response.",
      "Chaotic coordination se predictive aur confident disaster response ki taraf badho.",
      "Bikhri hui samanvay prakriya se bhavishyadrashti aur vishwaspoorn disaster response tak badhiye."
    ));
    setText(".hero-card .lead", uiText(
      "ResourceFlow helps NGOs, relief teams, shelters, and community organizers capture requests, onboard volunteers, forecast shortages, prioritize urgency, and coordinate verified aid delivery through one web platform.",
      "ResourceFlow NGOs, relief teams, shelters aur community organizers ko requests capture karne, volunteers onboard karne, shortages forecast karne, urgency prioritize karne aur verified aid delivery ko ek hi platform par coordinate karne me madad karta hai.",
      "ResourceFlow NGOs, relief teams, shelters aur samudayik sangathanon ko requests capture karne, volunteers onboard karne, shortage ka anuman lagane, urgency ko prioritize karne aur verified aid delivery ko ek hi platform par coordinate karne me madad karta hai."
    ));
    if (primaryAction) {
      const nextRoute = {
        user: "./impact.html",
        volunteer: "./volunteer.html",
        government: "./operations.html",
        coordinator: "./operations.html",
        admin: "./admin.html"
      }[activeAccessRole()] || "./overview.html";
      const nextLabel = {
        user: "View Public Impact",
        volunteer: "Open Volunteer Portal",
        government: "Open Operations",
        coordinator: "Open Operations",
        admin: "Open Admin Console"
      }[activeAccessRole()] || "Open Workspace";
      primaryAction.setAttribute("href", nextRoute);
      primaryAction.textContent = nextLabel;
    }
    if (secondaryAction) {
      secondaryAction.setAttribute("href", activeAccessRole() === "admin" ? "./judge.html" : "./insights.html");
      secondaryAction.textContent = activeAccessRole() === "admin" ? "Open Judge Mode" : "See Insights";
    }

    const activity = buildActivityFeed(state.data);
    activityNode.innerHTML = activity.length
      ? activity.map(renderActivityCard).join("")
      : '<div class="empty-box">No activity yet. Load demo data to populate the workspace.</div>';

    if (homeAccessibilityPanel) {
      homeAccessibilityPanel.innerHTML = buildAccessibilityCards().map(function (item) {
        return '<div class="stack-card"><strong>' + escapeHtml(item.title) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p></div>';
      }).join("");
    }

    if (homePwaPanel) {
      homePwaPanel.innerHTML = [
        '<div class="stack-card"><strong>' + escapeHtml(pwaStatus.label) + '</strong><p class="card-meta">' + escapeHtml(pwaStatus.description) + '</p></div>',
        '<div class="stack-card"><strong>Offline draft recovery</strong><p class="card-meta">Request and volunteer forms save browser drafts automatically so operators can recover after refresh or poor connectivity.</p></div>',
        '<div class="stack-card"><strong>Install-ready shell</strong><p class="card-meta">Manifest, app icon, standalone display, and theme metadata are configured for a more app-like experience.</p></div>'
      ].join("");
    }

    if (globalSearchResults) {
      const matches = buildGlobalSearchResults(state.data, inputControlValue("#homeGlobalSearch", ""));
      globalSearchResults.innerHTML = matches.length
        ? matches.map(function (item) {
            return '<div class="stack-card"><strong>' + escapeHtml(item.type + ": " + item.title) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p></div>';
          }).join("")
        : '<div class="empty-box">Search requests, volunteers, assignments, or alerts from here.</div>';
    }

    if (guidedDemoPanel) {
      guidedDemoPanel.innerHTML = [
        '<div class="stack-card"><strong>1. Overview</strong><p class="card-meta">Explain the problem, load demo data, and show the role-based product framing.</p></div>',
        '<div class="stack-card"><strong>2. Operations</strong><p class="card-meta">Show request intake, approval, kanban workflow, response calendar, and matching.</p></div>',
        '<div class="stack-card"><strong>3. AI Insights</strong><p class="card-meta">Show readiness, risk radar, outreach, and what-if simulation.</p></div>',
        '<div class="stack-card"><strong>4. Judge + Impact</strong><p class="card-meta">Finish with the proof cards, SDG mapping, and public impact story.</p></div>'
      ].join("");
    }
  }

  function inputControlValue(selector, fallback) {
    const node = document.querySelector(selector);
    return node ? String(node.value || "") : String(fallback || "");
  }

  function getVisibleRequests(data) {
    return clone((data && data.requests) || []).filter(function (item) {
      return !item.archived;
    });
  }

  function getActionableRequests(data) {
    return getVisibleRequests(data).filter(function (item) {
      return normalizeApprovalStatus(item.approvalStatus) === "approved";
    });
  }

  function getVisibleVolunteers(data) {
    return clone((data && data.volunteers) || []).filter(function (item) {
      return !item.archived;
    });
  }

  function getVisibleAssignments(data) {
    const requestIds = new Set(getVisibleRequests(data).map(function (item) { return item.id; }));
    const volunteerIds = new Set(getVisibleVolunteers(data).map(function (item) { return item.id; }));
    return clone((data && data.assignments) || []).filter(function (item) {
      return requestIds.has(item.requestId) && volunteerIds.has(item.volunteerId);
    });
  }

  function getArchivedRecords(data, type) {
    const list = Array.isArray(data && data[type]) ? data[type] : [];
    return clone(list).filter(function (item) { return item.archived; });
  }

  function getOperationsFilterState() {
    return {
      search: inputControlValue("#operationsSearch", "").trim().toLowerCase(),
      zone: inputControlValue("#operationsZoneFilter", "").trim(),
      category: inputControlValue("#operationsCategoryFilter", "").trim(),
      minUrgency: Number(inputControlValue("#operationsUrgencyFilter", "0")) || 0,
      approval: inputControlValue("#operationsApprovalFilter", "").trim(),
      workflow: inputControlValue("#operationsStatusFilter", "").trim(),
      sort: inputControlValue("#operationsSort", "urgency").trim() || "urgency"
    };
  }

  function getVolunteerFilterState() {
    return {
      search: inputControlValue("#volunteerSearch", "").trim().toLowerCase(),
      zone: inputControlValue("#volunteerZoneFilter", "").trim(),
      skill: inputControlValue("#volunteerSkillFilter", "").trim().toLowerCase(),
      language: inputControlValue("#volunteerLanguage", "English").trim() || "English",
      tone: inputControlValue("#volunteerTone", "Warm").trim() || "Warm"
    };
  }

  function filterRequests(requests, filters) {
    return clone(requests).filter(function (request) {
      if (request.archived) {
        return false;
      }
      const haystack = [
        request.organization,
        request.title,
        request.category,
        request.zone,
        request.location,
        (request.skills || []).join(" "),
        request.notes,
        request.scenario,
        request.approvalStatus,
        request.workflowStatus,
        request.shiftLabel
      ].join(" ").toLowerCase();
      if (filters.search && haystack.indexOf(filters.search) < 0) {
        return false;
      }
      if (filters.zone && request.zone !== filters.zone) {
        return false;
      }
      if (filters.category && request.category !== filters.category) {
        return false;
      }
      if (filters.approval && normalizeApprovalStatus(request.approvalStatus) !== normalizeApprovalStatus(filters.approval)) {
        return false;
      }
      if (filters.workflow && normalizeWorkflowStatus(request.workflowStatus) !== normalizeWorkflowStatus(filters.workflow)) {
        return false;
      }
      if (Number(request.urgency || 0) < Number(filters.minUrgency || 0)) {
        return false;
      }
      return true;
    });
  }

  function sortRequests(requests, sortKey) {
    return clone(requests).sort(function (left, right) {
      if (sortKey === "beneficiaries") {
        return Number(right.beneficiaries || 0) - Number(left.beneficiaries || 0);
      }
      if (sortKey === "zone") {
        return String(left.zone || "").localeCompare(String(right.zone || ""));
      }
      if (sortKey === "recent") {
        return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
      }
      if (Number(right.urgency || 0) !== Number(left.urgency || 0)) {
        return Number(right.urgency || 0) - Number(left.urgency || 0);
      }
      return Number(right.beneficiaries || 0) - Number(left.beneficiaries || 0);
    });
  }

  function filterVolunteers(volunteers, filters) {
    return clone(volunteers).filter(function (volunteer) {
      if (volunteer.archived) {
        return false;
      }
      const haystack = [
        volunteer.name,
        volunteer.zone,
        volunteer.location,
        volunteer.availability,
        volunteer.experience,
        volunteer.transport,
        (volunteer.skills || []).join(" "),
        (volunteer.languages || []).join(" "),
        volunteer.shiftPreference
      ].join(" ").toLowerCase();
      if (filters.search && haystack.indexOf(filters.search) < 0) {
        return false;
      }
      if (filters.zone && volunteer.zone !== filters.zone) {
        return false;
      }
      if (filters.skill && (volunteer.skills || []).join(" ").toLowerCase().indexOf(filters.skill) < 0) {
        return false;
      }
      return true;
    });
  }

  function buildSkillGapPressure(data) {
    const requests = getActionableRequests(data);
    const assignments = getVisibleAssignments(data);
    const pressure = {};
    clone(requests).forEach(function (request) {
      const assigned = assignments.filter(function (item) {
        return item.requestId === request.id;
      }).length;
      const deficit = Math.max(Number(request.peopleNeeded || 0) - assigned, 0);
      if (deficit === 0) {
        return;
      }
      (request.skills || []).forEach(function (skill) {
        pressure[skill] = (pressure[skill] || 0) + deficit;
      });
    });
    return Object.keys(pressure).map(function (skill) {
      return { skill: skill, value: pressure[skill] };
    }).sort(function (left, right) {
      return right.value - left.value;
    });
  }

  function buildVolunteerTrainingPriorities(data) {
    const gaps = buildSkillGapPressure(data).slice(0, 4);
    if (!gaps.length) {
      return [
        {
          title: "Cross-train responders",
          text: "Coverage is healthy right now. Use this window to practice multi-skill training, transport readiness, and shift handoff drills."
        },
        {
          title: "Strengthen onboarding",
          text: "Prepare quick-start safety, documentation, and communication packs so new volunteers can join without friction."
        }
      ];
    }
    return gaps.map(function (item) {
      return {
        title: "Train more " + titleCase(item.skill),
        text: "Current demand indicates at least " + item.value + " open skill-gap signal(s) for " + item.skill + ". Add orientation content and practice scenarios for this skill."
      };
    });
  }

  function buildVolunteerAccessibilityItems() {
    return [
      {
        title: "Accessible form flow",
        text: "Volunteer registration uses labeled controls, large targets, keyboard-accessible actions, and status messaging."
      },
      {
        title: "Low-friction participation",
        text: "Spark-safe local drafts preserve progress when a user refreshes the page or loses connection."
      },
      {
        title: "Human-readable actions",
        text: "Opportunity cards, outreach copy, and request summaries use plain language instead of operator-only jargon."
      },
      {
        title: "Multi-language outreach",
        text: "Volunteer recruitment drafts can be tuned for English, Hinglish, and Hindi Romanized communication."
      }
    ];
  }

  function buildVolunteerOutreachMessage(data, language, tone) {
    const topRequest = clone(getActionableRequests(data)).sort(function (left, right) {
      return Number(right.urgency || 0) - Number(left.urgency || 0);
    })[0];
    const topGap = buildSkillGapPressure(data)[0];
    const skill = topGap ? topGap.skill : "community support";
    if (!topRequest) {
      return "Load demo data or add a request to generate a targeted volunteer outreach draft.";
    }
    const templates = {
      English: {
        Warm: "We are looking for volunteers to support " + topRequest.title + " in " + topRequest.zone + " zone. If you can help with " + skill + ", your support can make an immediate difference for local families.",
        Urgent: "Urgent volunteer call: " + topRequest.title + " needs extra support in " + topRequest.zone + " zone. If you have " + skill + " skills, please join the response effort today.",
        Formal: "Volunteer support is requested for " + topRequest.title + " in " + topRequest.zone + " zone. Individuals with experience in " + skill + " are encouraged to register through ResourceFlow."
      },
      Hinglish: {
        Warm: "Hum " + topRequest.zone + " zone me " + topRequest.title + " ke liye volunteers dhundh rahe hain. Agar aap " + skill + " me help kar sakte ho to aapka support bahut useful hoga.",
        Urgent: "Urgent volunteer call: " + topRequest.zone + " zone me " + topRequest.title + " ke liye turant support chahiye. Agar aapke paas " + skill + " skill hai to abhi join kijiye.",
        Formal: topRequest.title + " ke liye " + topRequest.zone + " zone me volunteer support invite kiya ja raha hai. " + skill + " skill wale log ResourceFlow par register kar sakte hain."
      },
      HindiRoman: {
        Warm: topRequest.zone + " kshetra me " + topRequest.title + " ke liye dayalu volunteers ki avashyakta hai. Yadi aap " + skill + " me sahayata kar sakte hain to aapka yogdan turant prabhav dalega.",
        Urgent: "Tatkal volunteer sahayata ki avashyakta hai: " + topRequest.zone + " kshetra me " + topRequest.title + " ke liye " + skill + " kaushal wale log turant judein.",
        Formal: topRequest.title + " ke liye " + topRequest.zone + " kshetra me volunteer sahayata amantrit hai. " + skill + " kaushal wale log ResourceFlow par panjikaran kar sakte hain."
      }
    };
    return templates[language] && templates[language][tone]
      ? templates[language][tone]
      : templates.English.Warm;
  }

  function workflowLabel(status) {
    return titleCase(String(status || "pending").replace(/-/g, " "));
  }

  function buildApprovalQueue(data) {
    return clone(getVisibleRequests(data))
      .filter(function (request) {
        return normalizeApprovalStatus(request.approvalStatus) !== "approved";
      })
      .sort(function (left, right) {
        if (Number(right.urgency || 0) !== Number(left.urgency || 0)) {
          return Number(right.urgency || 0) - Number(left.urgency || 0);
        }
        return Number(right.beneficiaries || 0) - Number(left.beneficiaries || 0);
      })
      .slice(0, 6);
  }

  function buildShiftPlan(data) {
    const assignments = getVisibleAssignments(data);
    const groups = {};
    getVisibleRequests(data).forEach(function (request) {
      const key = request.shiftLabel || "Today - Afternoon";
      if (!groups[key]) {
        groups[key] = {
          id: key,
          title: key,
          requests: 0,
          openSlots: 0,
          covered: 0,
          chips: []
        };
      }
      const assigned = assignments.filter(function (item) { return item.requestId === request.id; }).length;
      groups[key].requests += 1;
      groups[key].covered += assigned;
      groups[key].openSlots += Math.max(Number(request.peopleNeeded || 0) - assigned, 0);
      groups[key].chips.push(request.title);
    });
    return Object.keys(groups).map(function (key) {
      return groups[key];
    }).sort(function (left, right) {
      return left.title.localeCompare(right.title);
    });
  }

  function buildRouteClusters(data) {
    const groups = {};
    getActionableRequests(data).forEach(function (request) {
      const key = request.routeCluster || routeClusterForZone(request.zone);
      if (!groups[key]) {
        groups[key] = {
          id: key,
          title: key,
          zone: request.zone,
          requests: [],
          mapsLink: "https://www.google.com/maps/search/" + encodeURIComponent(request.zone + " " + key + " relief route")
        };
      }
      groups[key].requests.push(request);
    });
    return Object.keys(groups).map(function (key) {
      return groups[key];
    }).sort(function (left, right) {
      return right.requests.length - left.requests.length;
    });
  }

  function buildNotificationCenter(data) {
    const items = [];
    buildApprovalQueue(data).slice(0, 2).forEach(function (request) {
      items.push({
        title: "Approval needed",
        text: request.title + " is waiting for review in " + request.zone + " zone.",
        tone: "pending"
      });
    });
    computeMetrics(data).riskRadar.slice(0, 2).forEach(function (risk) {
      items.push({
        title: "Risk alert",
        text: risk.title + " still has a deficit of " + risk.deficit + " volunteer(s).",
        tone: "high"
      });
    });
    (state.localNotifications || []).slice(0, 2).forEach(function (item) {
      items.push({
        title: item.subject || "Notification",
        text: item.message || "Workspace update ready.",
        tone: item.status || "tracked"
      });
    });
    return items.slice(0, 6);
  }

  function buildWorkflowChartItems(data) {
    const counts = {};
    getVisibleRequests(data).forEach(function (request) {
      const key = workflowLabel(request.workflowStatus || "pending");
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).map(function (label) {
      return { label: label, value: counts[label] };
    });
  }

  function buildWorkflowKanbanColumns(data) {
    return WORKFLOW_SEQUENCE.map(function (status) {
      const items = getVisibleRequests(data).filter(function (request) {
        return normalizeWorkflowStatus(request.workflowStatus || "pending") === status;
      }).slice(0, 6);
      return {
        id: status,
        title: workflowLabel(status),
        items: items
      };
    });
  }

  function buildResponseCalendarItems(data) {
    const buckets = {};
    ["Today", "Tomorrow"].forEach(function (day) {
      ["Morning", "Afternoon", "Evening"].forEach(function (slot) {
        const key = day + " - " + slot;
        buckets[key] = { label: key, requests: 0, assigned: 0, beneficiaries: 0 };
      });
    });
    getVisibleRequests(data).forEach(function (request) {
      const key = normalizeShiftLabel(request.shiftLabel || inferShiftLabel(request.createdAt || new Date().toISOString(), request.urgency));
      if (!buckets[key]) {
        buckets[key] = { label: key, requests: 0, assigned: 0, beneficiaries: 0 };
      }
      buckets[key].requests += 1;
      buckets[key].beneficiaries += Number(request.beneficiaries || 0);
      buckets[key].assigned += getVisibleAssignments(data).filter(function (item) {
        return item.requestId === request.id;
      }).length;
    });
    return Object.keys(buckets).map(function (key) {
      return buckets[key];
    });
  }

  function buildGlobalSearchResults(data, query) {
    const term = safeText(query, 120).trim().toLowerCase();
    if (!term) {
      return [];
    }
    const results = [];

    getVisibleRequests(data).forEach(function (request) {
      const haystack = [
        request.title,
        request.organization,
        request.zone,
        request.category,
        (request.skills || []).join(" "),
        request.location
      ].join(" ").toLowerCase();
      if (haystack.indexOf(term) >= 0) {
        results.push({
          type: "Request",
          title: request.title,
          text: request.organization + " | " + request.zone + " zone | " + request.category
        });
      }
    });

    getVisibleVolunteers(data).forEach(function (volunteer) {
      const haystack = [
        volunteer.name,
        volunteer.zone,
        volunteer.location,
        (volunteer.skills || []).join(" "),
        (volunteer.languages || []).join(" ")
      ].join(" ").toLowerCase();
      if (haystack.indexOf(term) >= 0) {
        results.push({
          type: "Volunteer",
          title: volunteer.name,
          text: volunteer.zone + " zone | " + volunteer.experience + " | " + (volunteer.skills || []).join(", ")
        });
      }
    });

    getVisibleAssignments(data).forEach(function (assignment) {
      const haystack = [
        assignment.requestTitle,
        assignment.volunteerName,
        assignment.zone,
        assignment.reason
      ].join(" ").toLowerCase();
      if (haystack.indexOf(term) >= 0) {
        results.push({
          type: "Assignment",
          title: assignment.requestTitle,
          text: assignment.volunteerName + " | " + assignment.zone + " zone | " + workflowLabel(assignment.status || "assigned")
        });
      }
    });

    buildNotificationCenter(data).forEach(function (item) {
      const haystack = [item.title, item.text].join(" ").toLowerCase();
      if (haystack.indexOf(term) >= 0) {
        results.push({
          type: "Alert",
          title: item.title,
          text: item.text
        });
      }
    });

    return results.slice(0, 10);
  }

  function buildVolunteerRankingItems(data) {
    const highestPriorityRequests = getVisibleRequests(data).slice().sort(function (left, right) {
      return Number(right.urgency || 0) - Number(left.urgency || 0);
    }).slice(0, 2);
    const items = [];
    highestPriorityRequests.forEach(function (request) {
      getVisibleVolunteers(data).map(function (volunteer) {
        return {
          volunteer: volunteer,
          request: request,
          score: scoreVolunteer(volunteer, request, data)
        };
      }).sort(function (left, right) {
        return right.score - left.score;
      }).slice(0, 3).forEach(function (entry) {
        items.push({
          volunteerName: entry.volunteer.name,
          requestTitle: entry.request.title,
          zone: entry.volunteer.zone,
          score: entry.score,
          text: entry.volunteer.experience + " | " + (entry.volunteer.skills || []).slice(0, 3).join(", ")
        });
      });
    });
    return items.slice(0, 6);
  }

  function buildScenarioChartItems(data) {
    const counts = {};
    getVisibleRequests(data).forEach(function (request) {
      const key = scenarioTitle(request.scenario || "mixed");
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).map(function (label) {
      return { label: label, value: counts[label] };
    });
  }

  function buildVolunteerUtilizationItems(data) {
    const assignments = getVisibleAssignments(data);
    const counts = {};
    getVisibleVolunteers(data).forEach(function (volunteer) {
      const key = volunteer.shiftPreference || "Today - Afternoon";
      counts[key] = counts[key] || { label: key, value: 0 };
    });
    assignments.forEach(function (assignment) {
      const key = assignment.shiftLabel || "Today - Afternoon";
      counts[key] = counts[key] || { label: key, value: 0 };
      counts[key].value += 1;
    });
    return Object.keys(counts).map(function (key) { return counts[key]; }).sort(function (left, right) {
      return right.value - left.value;
    });
  }

  function buildArchivedOverview(data) {
    return getArchivedRecords(data, "requests").map(function (item) {
      return {
        type: "request",
        id: item.id,
        title: item.title,
        meta: item.organization + " | " + item.zone + " zone"
      };
    }).concat(getArchivedRecords(data, "volunteers").map(function (item) {
      return {
        type: "volunteer",
        id: item.id,
        title: item.name,
        meta: item.zone + " zone volunteer"
      };
    })).slice(0, 8);
  }

  function renderBarChart(title, items) {
    const max = Math.max.apply(null, items.map(function (item) {
      return Number(item.value || 0);
    }).concat([1]));
    return [
      '<div class="chart-card">',
      '<strong>' + escapeHtml(title) + '</strong>',
      '<div class="chart-list">',
      items.map(function (item) {
        const width = Math.max(8, Math.round((Number(item.value || 0) / max) * 100));
        return [
          '<div class="chart-row">',
          '<span class="chart-label">' + escapeHtml(item.label) + '</span>',
          '<div class="chart-track"><div class="chart-bar" style="width:' + width + '%"></div></div>',
          '<span class="chart-value">' + escapeHtml(String(item.value) + (item.suffix || "")) + '</span>',
          '</div>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function buildAdminReviewQueue(data) {
    const forecastsById = {};
    buildAidFlowSignals(data).forecasts.forEach(function (item) {
      forecastsById[item.id] = item;
    });
    return buildRiskRadar(data).slice(0, 6).map(function (risk) {
      const request = data.requests.find(function (item) { return item.id === risk.id; });
      const forecast = forecastsById[risk.id];
      const priority = risk.severity >= 150 ? "Critical" : (risk.severity >= 110 ? "High" : "Moderate");
      const matchingVolunteers = data.volunteers.filter(function (volunteer) {
        const inZone = volunteer.zone === risk.zone;
        const skillFit = request
          ? (volunteer.skills || []).some(function (skill) {
              return (request.skills || []).indexOf(skill) >= 0;
            })
          : false;
        return inZone || skillFit;
      }).slice(0, 4);
      const recipients = matchingVolunteers.length
        ? matchingVolunteers.map(function (volunteer) {
            return volunteer.name + " | " + slugifyText(volunteer.name) + "@resourceflow.demo |";
          }).join("\n")
        : "Field Coordinator | coordinator@resourceflow.demo |\nAdmin Review Desk | admin@resourceflow.demo |";
      return {
        id: risk.id,
        title: risk.title,
        zone: risk.zone,
        severity: risk.severity,
        priority: priority,
        deficit: risk.deficit,
        subject: priority + " staffing gap: " + risk.title,
        message: [
          "Request: " + risk.title,
          "Zone: " + risk.zone,
          "Current deficit: " + risk.deficit + " responder(s)",
          request ? "Required skills: " + (request.skills || []).join(", ") : "",
          forecast ? "AidFlow note: " + forecast.summary : "Review matching, transport access, and volunteer outreach for this request."
        ].filter(Boolean).join("\n"),
        recipients: recipients,
        summary: forecast
          ? forecast.summary
          : "This request is still understaffed and should be reviewed for recruitment, reassignment, or manual escalation.",
        chips: [
          priority + " priority",
          risk.zone + " zone",
          "deficit " + risk.deficit,
          "severity " + risk.severity
        ]
      };
    });
  }

  function buildSituationReportModel(data) {
    const metrics = computeMetrics(data);
    const insights = buildInsights(data);
    const aidSignals = buildAidFlowSignals(data);
    const topRisk = metrics.riskRadar[0];
    const weakestZone = coverageByZone(data).sort(function (left, right) {
      return left.coverage - right.coverage;
    })[0];
    return {
      generatedAt: new Date().toISOString(),
      highlights: [
        { title: "Open requests", value: String(data.requests.length), text: "Active community needs currently being tracked." },
        { title: "Assignments", value: String(data.assignments.length), text: "Responder-task matches generated by the fairness-aware engine." },
        { title: "Coverage", value: metrics.coverage + "%", text: "Share of requests that currently have at least one volunteer assigned." },
        { title: "Readiness", value: metrics.readinessScore + "/100", text: "Operational readiness score based on staffing and critical fill coverage." }
      ],
      bullets: [
        "Top action: " + insights.nextActionText,
        topRisk
          ? "Highest risk gap: " + topRisk.title + " in " + topRisk.zone + " zone with a deficit of " + topRisk.deficit + "."
          : "No uncovered requests currently appear in the risk radar.",
        weakestZone
          ? "Lowest zone coverage: " + weakestZone.zone + " at " + weakestZone.coverage + "%."
          : "Zone coverage is currently balanced.",
        "AidFlow forecast: " + aidSignals.forecastText
      ]
    };
  }

  function renderOperations() {
    const requestsBoard = document.getElementById("requestsBoard");
    const assignmentsBoard = document.getElementById("assignmentsBoard");
    const operationsAlert = document.getElementById("operationsAlert");
    const operationsSummary = document.getElementById("operationsSummary");
    const forecastBoard = document.getElementById("forecastBoard");
    const verificationBoard = document.getElementById("verificationBoard");
    const qrPreviewPanel = document.getElementById("qrPreviewPanel");
    const qrScanResult = document.getElementById("qrScanResult");
    const printReportSummary = document.getElementById("printReportSummary");
    const zoneCoverageList = document.getElementById("zoneCoverageList");
    const mapsDispatchList = document.getElementById("mapsDispatchList");
    const opsCategoryChart = document.getElementById("opsCategoryChart");
    const opsUrgencyChart = document.getElementById("opsUrgencyChart");
    const approvalQueue = document.getElementById("approvalQueue");
    const shiftPlanner = document.getElementById("shiftPlanner");
    const responseCalendar = document.getElementById("responseCalendar");
    const workflowChart = document.getElementById("workflowChart");
    const workflowKanban = document.getElementById("workflowKanban");
    const scenarioChart = document.getElementById("scenarioChart");
    const volunteerUtilizationChart = document.getElementById("volunteerUtilizationChart");
    const notificationCenter = document.getElementById("notificationCenter");
    const dailyBriefingPanel = document.getElementById("dailyBriefingPanel");
    const handoffNotesPanel = document.getElementById("handoffNotesPanel");
    const incidentLogPanel = document.getElementById("incidentLogPanel");
    const syncHealth = document.getElementById("syncHealth");
    const collabTimeline = document.getElementById("collabTimeline");
    const artifactUploadStatus = document.getElementById("artifactUploadStatus");
    const artifactList = document.getElementById("artifactList");
    const routeClusterList = document.getElementById("routeClusterList");
    const archivedOverview = document.getElementById("archivedOverview");
    const operationsAccessNote = document.getElementById("operationsAccessNote");

    if (!requestsBoard || !assignmentsBoard || !operationsAlert || !operationsSummary) {
      return;
    }
    setText("body[data-page='operations'] .page-intro .eyebrow", uiText("Coordinator Command Center", "Coordinator Command Center", "Coordinator Command Center"));
    setText("body[data-page='operations'] .page-intro h1", uiText(
      "Capture needs, run matching, forecast shortages, and manage field response.",
      "Needs capture karo, matching chalao, shortages forecast karo, aur field response manage karo.",
      "Aavashyaktaein capture kijiye, matching chalaiye, shortage ka anuman lagaiye aur field response manage kijiye."
    ));

    const insights = buildInsights(state.data);
    const metrics = computeMetrics(state.data);
    const aidSignals = buildAidFlowSignals(state.data);
    const operatorSummary = activePortalSummary("");
    const filters = getOperationsFilterState();
    const filteredRequests = sortRequests(filterRequests(state.data.requests, filters), filters.sort);
    const allowedRequestIds = new Set(filteredRequests.map(function (item) { return item.id; }));
    const filteredAssignmentsRaw = state.data.assignments.filter(function (item) {
      return allowedRequestIds.has(item.requestId);
    });
    const filteredAssignmentGroups = groupAssignments(filteredAssignmentsRaw);
    const filteredForecasts = aidSignals.forecasts.filter(function (item) {
      return allowedRequestIds.has(item.id);
    });
    const filteredVerifications = aidSignals.verifications.filter(function (item) {
      return allowedRequestIds.has(item.id);
    });
    const selectedVerification = filteredVerifications.find(function (item) {
      return item.token === state.selectedAidToken;
    }) || filteredVerifications[0] || null;

    operationsAlert.textContent = insights.nextActionText;
    if (operationsAccessNote && operatorSummary && canManageWorkspace()) {
      operationsAccessNote.textContent = "Operator profile: " + operatorSummary + ". Shared manager tools are enabled for this session.";
    }
    operationsSummary.innerHTML = insights.actionList.length
      ? insights.actionList.map(renderSummaryCard).join("")
      : '<div class="empty-box">Assignments will appear here after matching runs.</div>';

    if (opsCategoryChart) {
      const categoryCounts = {};
      filteredRequests.forEach(function (request) {
        categoryCounts[request.category] = (categoryCounts[request.category] || 0) + 1;
      });
      const items = Object.keys(categoryCounts).map(function (label) {
        return { label: label, value: categoryCounts[label] };
      }).sort(function (left, right) {
        return right.value - left.value;
      });
      opsCategoryChart.innerHTML = items.length
        ? renderBarChart("Category demand", items)
        : '<div class="empty-box">No requests match the current filters.</div>';
    }

    if (opsUrgencyChart) {
      const urgencyCounts = {};
      filteredRequests.forEach(function (request) {
        const label = urgencyLabel(request.urgency);
        urgencyCounts[label] = (urgencyCounts[label] || 0) + 1;
      });
      const items = Object.keys(urgencyCounts).map(function (label) {
        return { label: label, value: urgencyCounts[label] };
      }).sort(function (left, right) {
        return Number(right.value) - Number(left.value);
      });
      opsUrgencyChart.innerHTML = items.length
        ? renderBarChart("Urgency pressure", items)
        : '<div class="empty-box">Urgency pressure chart will appear here.</div>';
    }

    if (approvalQueue) {
      const queue = buildApprovalQueue(state.data);
      approvalQueue.innerHTML = queue.length
        ? queue.map(renderApprovalCard).join("")
        : '<div class="empty-box">No requests are waiting for approval.</div>';
    }

    if (shiftPlanner) {
      const shifts = buildShiftPlan(state.data);
      shiftPlanner.innerHTML = shifts.length
        ? shifts.map(renderShiftPlanCard).join("")
        : '<div class="empty-box">Shift slots will appear here after requests and assignments are loaded.</div>';
    }

    if (responseCalendar) {
      const calendarItems = buildResponseCalendarItems(state.data);
      responseCalendar.innerHTML = [
        '<div class="calendar-grid">',
        calendarItems.map(function (item) {
          return [
            '<div class="calendar-card">',
            '<strong>' + escapeHtml(item.label) + '</strong>',
            '<p class="card-meta">' + escapeHtml(String(item.requests)) + ' request(s)</p>',
            '<div class="chip-row">',
            renderChip(item.assigned + " assigned"),
            renderChip(item.beneficiaries + " people"),
            '</div>',
            '</div>'
          ].join("");
        }).join(""),
        '</div>'
      ].join("");
    }

    if (workflowChart) {
      const items = buildWorkflowChartItems(state.data);
      workflowChart.innerHTML = items.length
        ? renderBarChart("Workflow status", items)
        : '<div class="empty-box">Workflow distribution will appear here.</div>';
    }

    if (workflowKanban) {
      const columns = buildWorkflowKanbanColumns(state.data);
      workflowKanban.innerHTML = columns.map(function (column) {
        return [
          '<article class="kanban-column">',
          '<div class="kanban-column-head">',
          '<strong>' + escapeHtml(column.title) + '</strong>',
          '<span>' + escapeHtml(String(column.items.length)) + '</span>',
          '</div>',
          '<div class="kanban-column-body">',
          column.items.length
            ? column.items.map(function (request) {
                return '<div class="kanban-ticket"><strong>' + escapeHtml(request.title) + '</strong><p class="card-meta">' + escapeHtml(request.zone + " zone | " + request.category) + '</p></div>';
              }).join("")
            : '<div class="empty-box">No items</div>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");
    }

    if (scenarioChart) {
      const items = buildScenarioChartItems(state.data);
      scenarioChart.innerHTML = items.length
        ? renderBarChart("Scenario mix", items)
        : '<div class="empty-box">Scenario mix will appear here.</div>';
    }

    if (volunteerUtilizationChart) {
      const items = buildVolunteerUtilizationItems(state.data);
      volunteerUtilizationChart.innerHTML = items.length
        ? renderBarChart("Assignments by shift", items)
        : '<div class="empty-box">Volunteer utilization analytics will appear here.</div>';
    }

    if (notificationCenter) {
      const items = buildNotificationCenter(state.data);
      notificationCenter.innerHTML = items.length
        ? items.map(renderNotificationCard).join("")
        : '<div class="empty-box">Assignments, reminders, and alerts will appear here.</div>';
    }

    if (dailyBriefingPanel) {
      const topRisk = metrics.riskRadar[0];
      dailyBriefingPanel.innerHTML = [
        '<div class="stack-card"><strong>Morning briefing</strong><p class="card-meta">' + escapeHtml((state.opsNotes && state.opsNotes.briefing) || insights.nextActionText) + '</p></div>',
        '<div class="stack-card"><strong>Scenario focus</strong><p class="card-meta">Current demo mode: ' + escapeHtml(scenarioTitle(loadDemoScenario())) + '. Coverage sits at ' + escapeHtml(String(metrics.coverage)) + '% with readiness ' + escapeHtml(String(metrics.readinessScore)) + '/100.</p></div>',
        '<div class="stack-card"><strong>Highest risk gap</strong><p class="card-meta">' + escapeHtml(topRisk ? topRisk.title + " in " + topRisk.zone + " zone needs " + topRisk.deficit + " more responder(s)." : "No uncovered critical requests are visible right now.") + '</p></div>'
      ].join("");
    }

    if (handoffNotesPanel) {
      const handoffItems = [];
      if (state.opsNotes && state.opsNotes.handoff) {
        handoffItems.push('<div class="stack-card"><strong>Saved handoff</strong><p class="card-meta">' + escapeHtml(state.opsNotes.handoff) + '</p></div>');
      }
      handoffNotesPanel.innerHTML = handoffItems.join("") + (state.data.activityLog || []).slice(0, 3).map(function (event) {
        return '<div class="stack-card"><strong>' + escapeHtml(titleCase(event.type || "Update")) + '</strong><p class="card-meta">' + escapeHtml(event.message || "Workspace handoff update.") + '</p></div>';
      }).join("") || '<div class="empty-box">Operator handoff notes will appear here.</div>';
    }

    if (incidentLogPanel) {
      const incidentItems = [];
      if (state.opsNotes && state.opsNotes.incident) {
        incidentItems.push('<div class="stack-card soft-warning"><strong>Saved incident note</strong><p class="card-meta">' + escapeHtml(state.opsNotes.incident) + '</p></div>');
      }
      incidentLogPanel.innerHTML = incidentItems.join("") + (metrics.riskRadar.length
        ? metrics.riskRadar.slice(0, 3).map(function (risk) {
            return '<div class="stack-card soft-warning"><strong>' + escapeHtml(risk.title) + '</strong><p class="card-meta">' + escapeHtml("Deficit " + risk.deficit + " | severity " + risk.severity + " | zone " + risk.zone) + '</p></div>';
          }).join("")
        : '<div class="empty-box">Incident log entries will appear here.</div>');
    }

    if (forecastBoard) {
      forecastBoard.innerHTML = filteredForecasts.length
        ? filteredForecasts.map(renderForecastCard).join("")
        : '<div class="empty-box">Forecasted shortages and pre-positioning suggestions will appear here.</div>';
    }

    if (verificationBoard) {
      verificationBoard.innerHTML = filteredVerifications.length
        ? filteredVerifications.map(renderVerificationCard).join("")
        : '<div class="empty-box">Delivery tokens and verification trail will appear here.</div>';
    }

    if (qrPreviewPanel) {
      qrPreviewPanel.innerHTML = selectedVerification
        ? renderQrPreviewCard(selectedVerification)
        : '<div class="empty-box">Select a token to preview its QR code.</div>';
    }

    if (qrScanResult) {
      const matchedVerification = aidSignals.verifications.find(function (item) {
        return item.token === state.lastVerifiedToken;
      });
      qrScanResult.innerHTML = state.lastVerifiedToken
        ? (matchedVerification
          ? [
              '<div class="stack-card">',
              '<strong>Verified token: ' + escapeHtml(state.lastVerifiedToken) + '</strong>',
              '<p class="card-meta">' + escapeHtml(matchedVerification.title + " | " + matchedVerification.zone + " zone") + '</p>',
              '<div class="chip-row">',
              renderChip(matchedVerification.status),
              renderChip(matchedVerification.packages + " packs"),
              '</div>',
              '<p class="card-meta">' + escapeHtml(matchedVerification.nextStep) + '</p>',
              '</div>'
            ].join("")
          : '<div class="stack-card"><strong>Token not found</strong><p class="card-meta">The scanned code did not match any current AidFlow verification token. Try a live token from the verification board or enter it manually.</p></div>')
        : "Scan result will appear here.";
    }

    requestsBoard.innerHTML = filteredRequests.length
      ? filteredRequests.map(renderRequestCard).join("")
      : '<div class="empty-box">No requests match the current filters.</div>';

    assignmentsBoard.innerHTML = filteredAssignmentGroups.length
      ? filteredAssignmentGroups.map(renderAssignmentCard).join("")
      : '<div class="empty-box">Assignments will appear after matching.</div>';

    if (zoneCoverageList) {
      const zoneItems = coverageByZone({
        requests: filteredRequests,
        assignments: filteredAssignmentsRaw
      }).map(function (item) {
        return {
          label: item.zone,
          value: item.coverage,
          suffix: "%"
        };
      }).sort(function (left, right) {
        return right.value - left.value;
      });
      zoneCoverageList.innerHTML = zoneItems.length
        ? renderBarChart("Zone coverage", zoneItems)
        : '<div class="empty-box">Zone coverage evidence will appear here.</div>';
    }

    if (mapsDispatchList) {
      const requestLookup = {};
      const volunteerLookup = {};
      state.data.requests.forEach(function (item) {
        requestLookup[item.id] = item;
      });
      state.data.volunteers.forEach(function (item) {
        volunteerLookup[item.id] = item;
      });
      const dispatchCards = filteredAssignmentsRaw.slice(0, 4).map(function (assignment) {
        const request = requestLookup[assignment.requestId];
        const volunteer = volunteerLookup[assignment.volunteerId];
        const origin = volunteer && volunteer.location ? volunteer.location : (volunteer ? volunteer.zone + " volunteer hub" : "Volunteer origin");
        const destination = request && request.location ? request.location : (request ? request.title + " " + request.zone + " zone" : "Response destination");
        const mapsLink = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(origin) + "&destination=" + encodeURIComponent(destination) + "&travelmode=driving";
        return [
          '<div class="stack-card">',
          '<strong>' + escapeHtml(assignment.requestTitle) + '</strong>',
          '<p class="card-meta">' + escapeHtml(assignment.volunteerName + " -> " + destination) + '</p>',
          '<div class="chip-row">',
          renderChip(assignment.zone + " zone"),
          renderChip(aidTokenForRequest(request || { zone: assignment.zone, id: assignment.requestId })),
          '</div>',
          '<p><a class="primary-link" href="' + escapeHtml(mapsLink) + '" target="_blank" rel="noreferrer">Open Dispatch Route</a></p>',
          '</div>'
        ].join("");
      });
      mapsDispatchList.innerHTML = dispatchCards.length
        ? dispatchCards.join("")
        : '<div class="empty-box">Google Maps dispatch links will appear here.</div>';
    }

    if (routeClusterList) {
      const clusters = buildRouteClusters(state.data);
      routeClusterList.innerHTML = clusters.length
        ? clusters.map(renderRouteClusterCard).join("")
        : '<div class="empty-box">Route clusters will appear here.</div>';
    }

    if (printReportSummary) {
      const report = buildSituationReportModel(state.data);
      printReportSummary.innerHTML = report.highlights.map(function (item) {
        return [
          '<div class="stack-card">',
          '<strong>' + escapeHtml(item.title + ": " + item.value) + '</strong>',
          '<p class="card-meta">' + escapeHtml(item.text) + '</p>',
          '</div>'
        ].join("");
      }).concat(report.bullets.map(function (text) {
        return '<div class="stack-card"><p class="card-meta">' + escapeHtml(text) + "</p></div>";
      })).join("");
    }

    if (syncHealth) {
      const meta = state.data.meta || {};
      syncHealth.innerHTML = [
        renderSystemChip("Sync Status", state.syncStatus),
        renderSystemChip("Mode", state.storageMode === "firebase" ? "Cloud Workspace" : "Offline Local"),
        renderSystemChip("Revision", String(meta.revision || 0)),
        renderSystemChip("Last Editor", meta.updatedBy || "n/a"),
        renderSystemChip("Last Update", formatTimestamp(meta.updatedAt || state.data.lastUpdated || new Date().toISOString()))
      ].join("");
    }

    if (collabTimeline) {
      const events = (state.data.activityLog || []).slice(0, 10);
      collabTimeline.innerHTML = events.length
        ? events.map(renderTimelineEvent).join("")
        : '<div class="empty-box">Collaboration events appear here after actions are performed.</div>';
    }

    if (artifactUploadStatus) {
      artifactUploadStatus.textContent = !state.user
        ? "Sign in to add evidence records and optional cloud uploads."
        : (canManageWorkspace()
          ? "Signed in as " + titleCase(state.role) + ". If Storage is unavailable, ResourceFlow falls back to local evidence records."
          : "Signed in as Volunteer. Ask a coordinator or admin to promote your role for shared evidence workflows.");
    }

    if (artifactList) {
      artifactList.innerHTML = state.data.artifacts.length
        ? state.data.artifacts.map(renderArtifactCard).join("")
        : '<div class="empty-box">Uploaded artifacts will appear here.</div>';
    }

    if (archivedOverview) {
      const archived = buildArchivedOverview(state.data);
      archivedOverview.innerHTML = archived.length
        ? archived.map(renderArchivedCard).join("")
        : '<div class="empty-box">Archived records will appear here instead of being permanently deleted.</div>';
    }

    setText("#impactHours", String(state.data.assignments.length * 3) + " hrs");
    setText("#impactResponseTime", String(Math.max(0, Math.round(metrics.coverage * 1.8))) + " min");
    setText("#impactFairness", insights.fairnessTitle.replace("Lowest coverage in ", ""));
    setText("#impactCauseFit", state.data.requests.length
      ? "Strong alignment with smart community response"
      : "Add live requests to demonstrate alignment");

    updateRequestEditorUi();
    refreshLiveRoutePlanner(false);
  }

  function renderVolunteer() {
    const roster = document.getElementById("volunteerRoster");
    const list = document.getElementById("volunteerOpportunityList");
    if (!roster || !list) {
      return;
    }
    prefillVolunteerFormFromPortalProfile();
    setText("body[data-page='volunteer'] .page-intro .eyebrow", uiText("Volunteer Experience", "Volunteer Experience", "Volunteer Experience"));
    setText("body[data-page='volunteer'] .page-intro h1", uiText(
      "Register responders with the right skills, availability, and location fit.",
      "Sahi skills, availability aur location fit ke saath responders register karo.",
      "Sahi kaushal, availability aur sthaan-anukoolta ke saath responders register kijiye."
    ));

    const filters = getVolunteerFilterState();
    const filteredVolunteers = filterVolunteers(state.data.volunteers, filters);
    const accessibilityChecklist = document.getElementById("accessibilityChecklist");
    const trainingList = document.getElementById("volunteerTrainingList");
    const communityMessage = document.getElementById("volunteerCommunityMessage");
    const shiftPlanNode = document.getElementById("volunteerShiftPlan");
    const utilizationNode = document.getElementById("volunteerUtilizationSummary");
    const rankingNode = document.getElementById("volunteerRankingPanel");
    const profileSignalsNode = document.getElementById("volunteerProfileSignals");
    const draftCenterNode = document.getElementById("volunteerDraftCenter");
    const accessibilityControlPanel = document.getElementById("accessibilityControlPanel");
    const topGap = buildSkillGapPressure(state.data)[0];
    const topRequest = clone(state.data.requests).sort(function (left, right) {
      return Number(right.urgency || 0) - Number(left.urgency || 0);
    })[0];

    roster.innerHTML = filteredVolunteers.length
      ? filteredVolunteers.map(renderVolunteerCard).join("")
      : '<div class="empty-box">No volunteers registered yet.</div>';

    const opportunities = topOpportunities(state.data);
    setText("#volunteerOpportunityHeadline", opportunities.headline);
    setText("#volunteerOpportunityText", opportunities.summary);
    list.innerHTML = opportunities.items.length
      ? opportunities.items.map(renderOpportunityCard).join("")
      : '<div class="empty-box">The app will recommend the best open opportunities here.</div>';

    if (accessibilityChecklist) {
      accessibilityChecklist.innerHTML = buildVolunteerAccessibilityItems().map(function (item) {
        return '<div class="stack-card"><strong>' + escapeHtml(item.title) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p></div>';
      }).join("");
    }

    if (trainingList) {
      trainingList.innerHTML = buildVolunteerTrainingPriorities(state.data).map(function (item) {
        return '<div class="stack-card"><strong>' + escapeHtml(item.title) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p></div>';
      }).join("");
    }

    if (communityMessage) {
      communityMessage.textContent = buildVolunteerOutreachMessage(state.data, filters.language, filters.tone);
    }

    if (shiftPlanNode) {
      const items = buildShiftPlan(state.data);
      shiftPlanNode.innerHTML = items.length
        ? items.map(renderShiftPlanCard).join("")
        : '<div class="empty-box">Volunteer shift slots will appear here.</div>';
    }

    if (utilizationNode) {
      const utilization = buildVolunteerUtilizationItems(state.data);
      utilizationNode.innerHTML = utilization.length
        ? renderBarChart("Volunteer demand by shift", utilization)
        : '<div class="empty-box">Volunteer utilization metrics will appear here.</div>';
    }

    if (rankingNode) {
      const ranking = buildVolunteerRankingItems(state.data);
      rankingNode.innerHTML = ranking.length
        ? ranking.map(function (item) {
            return '<div class="stack-card"><strong>' + escapeHtml(item.volunteerName + " -> " + item.requestTitle) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p><div class="chip-row">' + renderChip(item.zone + " zone") + renderChip("score " + item.score) + '</div></div>';
          }).join("")
        : '<div class="empty-box">Volunteer ranking insights will appear here.</div>';
    }

    if (profileSignalsNode) {
      const readiness = computeReadinessScore({
        coverage: computeMetrics(state.data).coverage,
        criticalFill: computeMetrics(state.data).criticalFill,
        requests: state.data.requests.length,
        volunteers: state.data.volunteers.length,
        assignments: state.data.assignments.length
      });
      profileSignalsNode.innerHTML = [
        '<div class="stack-card"><strong>Readiness score</strong><p class="card-meta">' + escapeHtml(String(readiness)) + '/100 reflects how ready the volunteer network is for the current workload.</p></div>',
        '<div class="stack-card"><strong>Trust status</strong><p class="card-meta">' + escapeHtml(hasActiveSession() ? "Signed-in profile can participate in guided volunteer flows." : "Guest mode can explore the portal before committing to sign in.") + '</p></div>',
        '<div class="stack-card"><strong>Language coverage</strong><p class="card-meta">' + escapeHtml((state.data.volunteers || []).some(function (item) { return (item.languages || []).length; }) ? "Multilingual volunteer profiles are available for outreach and field coordination." : "Add language tags to volunteers to improve community-specific outreach.") + '</p></div>',
        '<div class="stack-card"><strong>Skill badge focus</strong><p class="card-meta">' + escapeHtml(topGap ? titleCase(topGap.skill) + " is the strongest current volunteer badge priority." : "No major skill gap is visible right now.") + '</p></div>'
      ].join("");
    }

    if (draftCenterNode) {
      draftCenterNode.innerHTML = buildDraftRecoveryItems().map(function (item) {
        return '<div class="stack-card"><strong>' + escapeHtml(item.title) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p></div>';
      }).join("");
    }

    if (accessibilityControlPanel) {
      accessibilityControlPanel.innerHTML = buildAccessibilityControlMarkup();
      bindAccessibilityControls();
    }

    setText("#volunteerStatCount", String(filteredVolunteers.length));
    setText("#volunteerStatCountText", filteredVolunteers.length === state.data.volunteers.length
      ? "Responders visible in the current workspace."
      : String(filteredVolunteers.length) + " responders match the active filters.");
    setText("#volunteerStatFocus", topGap ? titleCase(topGap.skill) : "Balanced");
    setText("#volunteerStatFocusText", topGap
      ? "Highest current skill gap signal in the response network."
      : "No major volunteer skill gaps are visible right now.");
    setText("#volunteerStatZone", topRequest ? (topRequest.zone + " Zone") : "No Zone Yet");
    setText("#volunteerStatZoneText", topRequest
      ? "Highest-urgency request is currently concentrated here."
      : "Load demo data or add requests to reveal zone demand.");
    setText("#volunteerStatReadiness", hasActiveSession() ? titleCase(activeAccessRole()) : "Guest");
    setText("#volunteerStatReadinessText", hasActiveSession()
      ? activePortalSummary("You are signed in and can use the volunteer workflow.")
      : "Sign in to save volunteers into the shared workspace.");

    updateVolunteerEditorUi();
  }

  function renderInsights() {
    const executive = document.getElementById("executiveBrief");
    if (!executive) {
      return;
    }
    setText("body[data-page='insights'] .page-intro .eyebrow", uiText("AI Copilot", "AI Copilot", "AI Copilot"));
    setText("body[data-page='insights'] .page-intro h1", uiText(
      "Turn live operations data into decisions, summaries, and submission-ready narratives.",
      "Live operations data ko decisions, summaries aur submission-ready narratives me badlo.",
      "Live operations data ko decisions, summaries aur submission-ready narratives mein badaliye."
    ));

    const insights = buildInsights(state.data);
    const aidSignals = buildAidFlowSignals(state.data);
    setText("#insightNextActionTitle", insights.nextActionTitle);
    setText("#insightNextActionText", insights.nextActionText);
    setText("#insightRecruitmentTitle", insights.recruitmentTitle);
    setText("#insightRecruitmentText", insights.recruitmentText);
    setText("#insightFairnessTitle", insights.fairnessTitle);
    setText("#insightFairnessText", insights.fairnessText);
    setText("#executiveBrief", insights.executiveBrief);
    setText("#judgeBrief", insights.judgeBrief);
    setText("#geminiPrompt", insights.geminiPrompt);
    setText("#scaleStrategy", insights.scaleStrategy);
    setText("#disasterForecastTitle", aidSignals.forecastTitle);
    setText("#disasterForecastText", aidSignals.forecastText);
    setText("#satellitePrompt", aidSignals.satellitePrompt);
    setText("#geminiLiveStatus", hasSecureBackend()
      ? (state.geminiBusy ? "Secure Gemini backend is analyzing the current workspace..." : "Secure Gemini backend is connected and ready.")
      : (getFirebaseConfig().geminiApiKey
        ? (state.geminiBusy ? "Gemini is analyzing the current workspace..." : "Client Gemini mode is configured.")
        : "Spark-safe local strategy engine is ready. It uses built-in analytics when no Gemini key is configured."));

    const verificationTrail = document.getElementById("verificationTrail");
    if (verificationTrail) {
      verificationTrail.innerHTML = aidSignals.verifications.length
        ? aidSignals.verifications.map(renderVerificationCard).join("")
        : '<div class="empty-box">Delivery token and verification insights will appear here.</div>';
    }
  }

  function renderAdmin() {
    const summaryNode = document.getElementById("adminSummary");
    if (!summaryNode) {
      return;
    }
    const roleNode = document.getElementById("adminRoleStatus");
    const usersNode = document.getElementById("adminUserList");
    const notificationsNode = document.getElementById("adminNotificationList");
    const errorsNode = document.getElementById("adminErrorList");
    const auditsNode = document.getElementById("adminAuditList");
    const statusNode = document.getElementById("adminBackendStatus");
    const reviewNode = document.getElementById("adminReviewList");
    const archiveNode = document.getElementById("adminArchiveList");
    const cleanupNode = document.getElementById("adminCleanupList");
    const controlNode = document.getElementById("adminControlCenter");
    const snapshot = state.adminSnapshot;
    const reviewItems = buildAdminReviewQueue(state.data);
    const snapshotUsers = snapshot && snapshot.users ? snapshot.users : [];
    const pendingRoleRequests = snapshotUsers.filter(function (user) {
      return normalizeRole(user.requestedRole) !== normalizeRole(user.role);
    }).length;
    const adminSummary = activePortalSummary("");

    if (roleNode) {
      roleNode.textContent = titleCase(activeAccessRole()) + " access";
    }
    if (statusNode) {
      statusNode.textContent = adminSummary
        ? adminSummary
        : (hasSecureBackend()
        ? "Secure backend functions are configured."
        : "Spark-safe mode is active. Admin tools use Firestore and local fallbacks instead of Cloud Functions.");
    }

    setText("#adminStatUsers", String(snapshotUsers.length || Object.keys(DEMO_ROLE_PROFILES).length));
    setText("#adminStatUsersText", "Profiles tracked across the workspace.");
    setText("#adminStatReviews", String(pendingRoleRequests || reviewItems.length));
    setText("#adminStatReviewsText", pendingRoleRequests
      ? "Requested role changes are waiting for review."
      : "Operational review items are ready for triage.");
    setText("#adminStatDrafts", String(snapshot && snapshot.notifications ? snapshot.notifications.length : state.localNotifications.length));
    setText("#adminStatDraftsText", "Queued or drafted outreach messages.");
    setText("#adminStatAudits", String(snapshot && snapshot.audits ? snapshot.audits.length : (state.data.activityLog || []).length));
    setText("#adminStatAuditsText", "Recent governance and workspace audit signals.");

    if (!canManageWorkspace()) {
      summaryNode.textContent = "Admin console is available to coordinator and admin profiles after sign-in.";
      if (usersNode) {
        usersNode.innerHTML = '<div class="empty-box">Sign in with a coordinator or admin account to review users and workspace governance.</div>';
      }
      if (notificationsNode) {
        notificationsNode.innerHTML = '<div class="empty-box">Manual outreach drafts become visible for manager roles.</div>';
      }
      if (errorsNode) {
        errorsNode.innerHTML = '<div class="empty-box">Recent client-side issues appear here for managers.</div>';
      }
      if (auditsNode) {
        auditsNode.innerHTML = '<div class="empty-box">Audit trail becomes visible for manager roles.</div>';
      }
      if (reviewNode) {
        reviewNode.innerHTML = '<div class="empty-box">High-risk and uncovered requests appear here once a coordinator or admin session is active.</div>';
      }
      if (archiveNode) {
        archiveNode.innerHTML = '<div class="empty-box">Archived requests and volunteers become visible for manager roles.</div>';
      }
      if (cleanupNode) {
        cleanupNode.innerHTML = '<div class="empty-box">Data cleanup warnings appear for coordinator or admin sessions.</div>';
      }
      if (controlNode) {
        controlNode.innerHTML = buildAccessibilityControlMarkup();
        bindAccessibilityControls();
      }
      return;
    }
    summaryNode.textContent = state.adminLoading
      ? "Refreshing backend snapshot..."
      : (snapshot
        ? "Workspace revision " + (snapshot.workspace ? snapshot.workspace.revision : 0) + " - " + (snapshot.users ? snapshot.users.length : 0) + " users tracked with " + (snapshot.audits ? snapshot.audits.length : 0) + " recent audit events."
        : (state.adminError || "Load the admin snapshot to inspect roles, outreach drafts, errors, and audit activity."));

    if (usersNode) {
      usersNode.innerHTML = snapshot && snapshot.users && snapshot.users.length
        ? snapshot.users.map(renderAdminUserCard).join("")
        : '<div class="empty-box">No admin snapshot loaded yet.</div>';
    }
    if (notificationsNode) {
      notificationsNode.innerHTML = snapshot && snapshot.notifications && snapshot.notifications.length
        ? snapshot.notifications.map(renderAdminNotificationCard).join("")
        : '<div class="empty-box">No queued notifications yet.</div>';
    }
    if (errorsNode) {
      errorsNode.innerHTML = snapshot && snapshot.errors && snapshot.errors.length
        ? snapshot.errors.map(renderAdminErrorCard).join("")
        : '<div class="empty-box">No recent client errors were reported.</div>';
    }
    if (auditsNode) {
      auditsNode.innerHTML = snapshot && snapshot.audits && snapshot.audits.length
        ? snapshot.audits.map(renderAdminAuditCard).join("")
        : '<div class="empty-box">No recent audit events were recorded.</div>';
    }
    if (reviewNode) {
      reviewNode.innerHTML = reviewItems.length
        ? reviewItems.map(renderReviewCard).join("")
        : '<div class="empty-box">No uncovered requests currently need admin review.</div>';
    }
    if (archiveNode) {
      const archived = buildArchivedOverview(state.data);
      archiveNode.innerHTML = archived.length
        ? archived.map(renderArchivedCard).join("")
        : '<div class="empty-box">No archived records are waiting for restore.</div>';
    }
    if (cleanupNode) {
      const warnings = buildCleanupWarnings(state.data);
      cleanupNode.innerHTML = warnings.length
        ? warnings.map(function (item) {
            return '<div class="stack-card soft-warning"><strong>' + escapeHtml(item.title) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p></div>';
          }).join("")
        : '<div class="empty-box">No duplicate or incomplete-record warnings are active.</div>';
    }
    if (controlNode) {
      controlNode.innerHTML = buildAccessibilityControlMarkup();
      bindAccessibilityControls();
    }
    bindAdminRoleForms();
  }

  function renderImpact() {
    const summaryNode = document.getElementById("impactPublicSummary");
    if (!summaryNode) {
      return;
    }
    const metrics = computeMetrics(state.data);
    const insights = buildInsights(state.data);
    const report = buildSituationReportModel(state.data);
    const zoneNode = document.getElementById("impactZoneCoverage");
    const workflowNode = document.getElementById("impactWorkflowChart");
    const scenarioNode = document.getElementById("impactScenarioChart");
    const highlightsNode = document.getElementById("impactHighlights");
    const storyNode = document.getElementById("impactStoryPanel");
    const snapshotNode = document.getElementById("impactSnapshotPanel");
    const trustNode = document.getElementById("impactTrustPanel");
    setText("body[data-page='impact'] .page-intro .eyebrow", uiText("Read-only NGO View", "Read-only NGO View", "Read-only NGO View"));
    setText("body[data-page='impact'] .page-intro h1", uiText(
      "Share impact, coverage, and response readiness with judges and partners.",
      "Impact, coverage aur response readiness ko judges aur partners ke saath share karo.",
      "Impact, coverage aur response readiness ko judges aur partners ke saath share kijiye."
    ));

    setText("#impactMetricRequests", String(metrics.totalRequests));
    setText("#impactMetricAssignments", String(metrics.totalAssignments));
    setText("#impactMetricCoverage", metrics.coverage + "%");
    setText("#impactMetricBeneficiaries", String(metrics.beneficiaries));
    setText("#impactPublicReadiness", "Readiness " + metrics.readinessScore + "/100");
    setText("#impactPublicSummary", insights.nextActionText);

    if (zoneNode) {
      const zoneItems = coverageByZone(state.data).map(function (item) {
        return { label: item.zone, value: item.coverage, suffix: "%" };
      });
      zoneNode.innerHTML = zoneItems.length
        ? renderBarChart("Coverage by zone", zoneItems)
        : '<div class="empty-box">Zone coverage analytics will appear here.</div>';
    }
    if (workflowNode) {
      const items = buildWorkflowChartItems(state.data);
      workflowNode.innerHTML = items.length
        ? renderBarChart("Workflow progress", items)
        : '<div class="empty-box">Workflow status chart will appear here.</div>';
    }
    if (scenarioNode) {
      const items = buildScenarioChartItems(state.data);
      scenarioNode.innerHTML = items.length
        ? renderBarChart("Scenario mix", items)
        : '<div class="empty-box">Scenario mix will appear here.</div>';
    }
    if (highlightsNode) {
      highlightsNode.innerHTML = report.highlights.map(function (item) {
        return '<div class="stack-card"><strong>' + escapeHtml(item.title + ": " + item.value) + '</strong><p class="card-meta">' + escapeHtml(item.text) + '</p></div>';
      }).join("");
    }
    if (storyNode) {
      storyNode.innerHTML = [
        '<div class="stack-card"><strong>From fragmented intake to one workspace</strong><p class="card-meta">ResourceFlow replaces scattered calls, sheets, and chats with one readable flow for requests, volunteers, assignments, and verification.</p></div>',
        '<div class="stack-card"><strong>Visible community reach</strong><p class="card-meta">' + escapeHtml(metrics.totalRequests ? "The current scenario projects support for about " + metrics.beneficiaries + " people across " + metrics.communitiesServed + " zones." : "Load demo data to show projected reach, zone coverage, and staffed requests.") + '</p></div>',
        '<div class="stack-card"><strong>Operational story</strong><p class="card-meta">' + escapeHtml(insights.nextActionText) + '</p></div>'
      ].join("");
    }
    if (snapshotNode) {
      snapshotNode.innerHTML = report.bullets.map(function (item) {
        return '<div class="stack-card"><p class="card-meta">' + escapeHtml(item) + '</p></div>';
      }).join("") + '<div class="stack-card"><strong>Share-ready note</strong><p class="card-meta">Use Export CSV or Judge Report from the header to generate a partner-safe snapshot.</p></div>';
    }
    if (trustNode) {
      trustNode.innerHTML = [
        '<div class="stack-card"><strong>Archive-safe records</strong><p class="card-meta">Requests and volunteers can be archived and restored instead of disappearing permanently.</p></div>',
        '<div class="stack-card"><strong>Revision + audit trail</strong><p class="card-meta">Revision ' + escapeHtml(String(metrics.revision)) + ' with ' + escapeHtml(String(metrics.activityEvents)) + ' tracked activity event(s) supports submission-safe review.</p></div>',
        '<div class="stack-card"><strong>Open sharing</strong><p class="card-meta">This public page is read-only, making it easier to show judges or NGO partners the story without exposing editing tools.</p></div>'
      ].join("");
    }
  }

  async function loadAdminSnapshot(forceRefresh) {
    if (!canManageWorkspace()) {
      return;
    }
    if (state.adminLoading) {
      return;
    }
    if (state.adminSnapshot && !forceRefresh) {
      renderAdmin();
      return;
    }
    state.adminLoading = true;
    state.adminError = "";
    renderAdmin();
    try {
      state.adminSnapshot = hasSecureBackend()
        ? await callBackend("getAdminSnapshot")
        : await buildLocalAdminSnapshot();
    } catch (error) {
      console.warn("Could not load admin snapshot.", error);
      state.adminError = error && error.message ? error.message : "Admin snapshot failed.";
    } finally {
      state.adminLoading = false;
      renderAdmin();
    }
  }

  async function buildLocalAdminSnapshot() {
    const db = getFirestoreDb();
    let users = [];
    if (db) {
      const usersSnap = await db.collection("resourceflowUsers").limit(50).get();
      users = usersSnap.docs.map(function (doc) {
        const data = doc.data() || {};
        return {
          uid: doc.id,
          email: safeText(data.email || "", 140),
          displayName: safeText(data.displayName || "ResourceFlow User", 80),
          role: normalizeRole(data.role || "volunteer"),
          requestedRole: normalizeRole(data.requestedRole || "volunteer"),
          updatedAt: safeIso(data.updatedAt || new Date().toISOString())
        };
      });
    }
    if (!users.length) {
      users = Object.keys(DEMO_ROLE_PROFILES).map(function (key) {
        const profile = DEMO_ROLE_PROFILES[key];
        const isActive = state.demoSession && normalizeRole(state.demoSession.role) === profile.role;
        return {
          uid: isActive && state.demoSession ? state.demoSession.uid : "demo-" + profile.role,
          email: isActive && state.demoSession ? state.demoSession.email : profile.email,
          displayName: isActive && state.demoSession ? state.demoSession.displayName : profile.displayName,
          role: profile.role,
          requestedRole: profile.role,
          updatedAt: new Date().toISOString()
        };
      });
    }
    return {
      ok: true,
      mode: "spark",
      workspace: {
        requests: state.data.requests.length,
        volunteers: state.data.volunteers.length,
        assignments: state.data.assignments.length,
        revision: state.data.meta.revision,
        updatedBy: state.data.meta.updatedBy
      },
      users: users,
      notifications: state.localNotifications.slice(0, 20),
      errors: state.localErrors.slice(0, 20),
      audits: (state.data.activityLog || []).slice(0, 20).map(function (item) {
        return {
          id: item.id,
          type: item.type || "workspace-event",
          actor: item.actor || "system",
          createdAt: item.at || new Date().toISOString(),
          summary: item.message || "Workspace event recorded.",
          status: "tracked"
        };
      })
    };
  }

  async function updateUserRoleDirect(uid, email, role) {
    if (!currentAdminCapability()) {
      throw new Error("Only the configured admin email can change roles in Spark mode.");
    }
    const db = getFirestoreDb();
    if (!db) {
      throw new Error("Firestore is not connected.");
    }
    await db.collection("resourceflowUsers").doc(uid).set({
      uid: uid,
      email: safeText(email || "", 140),
      role: normalizeRole(role),
      requestedRole: normalizeRole(role),
      updatedAt: new Date().toISOString(),
      updatedBy: currentActor()
    }, { merge: true });
    state.data = registerActivity(
      state.data,
      "admin",
      "Role updated for " + (email || uid) + " to " + normalizeRole(role) + ".",
      currentActor()
    );
    await persist();
  }

  function bindAdminRoleForms() {
    document.querySelectorAll(".admin-role-form").forEach(function (form) {
      if (form.dataset.bound === "true") {
        return;
      }
      form.dataset.bound = "true";
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const select = form.querySelector('select[name="role"]');
        const uid = form.dataset.uid || "";
        const email = form.dataset.email || "";
        if (!select || !uid) {
          return;
        }
        try {
          if (hasSecureBackend()) {
            await callBackend("setUserRole", {
              uid: uid,
              email: email,
              role: select.value
            });
          } else {
            await updateUserRoleDirect(uid, email, select.value);
          }
          await loadAdminSnapshot(true);
          if (state.user && state.user.uid === uid) {
            await refreshClaims();
          }
          announceNotice("User role updated through secure backend claims.");
        } catch (error) {
          console.warn("Role update failed.", error);
          announceNotice("Role update failed. Check admin claims and backend deployment.");
        }
      });
    });
  }

  async function bootstrapAdminFromForm(form) {
    if (!hasSecureBackend()) {
      form.reset();
      if (currentAdminCapability()) {
        await syncUserProfile(state.user);
        await loadAdminSnapshot(true);
        announceNotice("Spark mode uses the configured admin email list. Your admin profile is already active.");
      } else {
        announceNotice("Spark mode does not use bootstrap codes. Sign in with the configured admin email to manage roles.");
      }
      return;
    }
    const accessCode = textValue(new FormData(form), "accessCode");
    if (!accessCode) {
      announceNotice("Enter the bootstrap access code before requesting admin claims.");
      return;
    }
    try {
      await callBackend("bootstrapAdmin", {
        accessCode: accessCode
      });
      await refreshClaims();
      await loadAdminSnapshot(true);
      form.reset();
      announceNotice("Admin bootstrap complete. Your claims were refreshed.");
    } catch (error) {
      console.warn("Admin bootstrap failed.", error);
      announceNotice("Admin bootstrap failed. Check the configured bootstrap email and access code.");
    }
  }

  async function queueNotificationFromForm(form) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can queue notifications.")) {
      return;
    }
    const formData = new FormData(form);
    const rawRecipients = textValue(formData, "recipients")
      .split("\n")
      .map(function (line) { return line.trim(); })
      .filter(Boolean)
      .map(function (line) {
        const parts = line.split("|").map(function (item) { return item.trim(); });
        return {
          name: parts[0] || "",
          email: parts[1] || "",
          phone: parts[2] || ""
        };
      });
    try {
      const payload = {
        id: uid(),
        subject: textValue(formData, "subject"),
        message: textValue(formData, "message"),
        channels: Array.from(form.querySelectorAll('input[name="channels"]:checked')).map(function (node) {
          return node.value;
        }),
        recipients: rawRecipients,
        createdAt: new Date().toISOString(),
        status: hasSecureBackend() ? "queued" : "manual-share"
      };
      if (hasSecureBackend()) {
        await callBackend("queueNotification", payload);
      } else {
        state.localNotifications = [payload].concat(state.localNotifications).slice(0, 20);
        downloadTextFile("resourceflow-notification-" + payload.id + ".txt", buildManualNotificationBrief(payload));
      }
      form.reset();
      await loadAdminSnapshot(true);
      announceNotice(hasSecureBackend()
        ? "Notification queued for backend delivery."
        : "Spark mode generated a share-ready notification brief. Send it manually by email or WhatsApp.");
    } catch (error) {
      console.warn("Notification queue failed.", error);
      announceNotice(hasSecureBackend()
        ? "Notification queue failed. Check backend deployment and provider credentials."
        : "Manual notification export failed.");
    }
  }

  async function uploadArtifactFromForm(form) {
    if (!ensureWorkspaceAccess("Only coordinators or admins can upload cloud evidence artifacts.")) {
      return;
    }

    const formData = new FormData(form);
    const file = formData.get("artifactFile");
    if (!(file instanceof File) || !file.name) {
      announceNotice("Please choose a file to upload.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      announceNotice("Please upload a file smaller than 10 MB.");
      return;
    }
    if (!isAllowedArtifactFile(file)) {
      announceNotice("Please upload a PNG, JPG, PDF, or TXT file.");
      return;
    }

    const artifact = sanitizeArtifactRecord({
      id: uid(),
      type: textValue(formData, "artifactType"),
      relatedTo: textValue(formData, "relatedTo"),
      notes: textValue(formData, "artifactNotes"),
      name: file.name,
      size: file.size,
      contentType: file.type,
      uploadedBy: safeText(state.user.email || state.clientId, 140),
      createdAt: new Date().toISOString(),
      path: "",
      url: ""
    });
    const storage = getStorageBucket();
    const artifactPath = [
      "resourceflow",
      getFirebaseConfig().workspaceId || "resourceflow-demo",
      "artifacts",
      artifact.id + "-" + safeFileName(file.name)
    ].join("/");

    try {
      if (storage) {
        updateSyncStatus("Uploading", "Sending artifact to Cloud Storage.");
        const storageRef = storage.ref().child(artifactPath);
        await storageRef.put(file, {
          contentType: file.type || "application/octet-stream"
        });
        artifact.path = artifactPath;
        artifact.url = await storageRef.getDownloadURL();
      } else {
        updateSyncStatus("Logged Locally", "Cloud Storage is unavailable, so the artifact was saved as a local record.");
        artifact.notes = safeText((artifact.notes ? artifact.notes + " " : "") + "Local-only evidence reference.", 420);
      }
      state.data.artifacts.unshift(artifact);
      state.data = registerActivity(
        state.data,
        "upload",
        (storage ? "Uploaded artifact: " : "Logged local artifact reference: ") + artifact.name + " (" + artifact.type + ").",
        currentActor()
      );
      trackEvent("resourceflow_upload_artifact", {
        artifact_type: artifact.type
      });
      await persist();
      form.reset();
      renderAll();
    } catch (error) {
      console.warn("Artifact upload failed.", error);
      artifact.notes = safeText((artifact.notes ? artifact.notes + " " : "") + "Cloud upload unavailable. Stored as local evidence reference.", 420);
      state.data.artifacts.unshift(artifact);
      state.data = registerActivity(
        state.data,
        "upload",
        "Logged local artifact reference after cloud upload fallback: " + artifact.name + ".",
        currentActor()
      );
      await persist();
      form.reset();
      renderAll();
      announceNotice("Cloud upload was unavailable, so ResourceFlow saved a local evidence reference instead.");
    }
  }

  async function refreshLiveRoutePlanner(forceRefresh) {
    const summaryNode = document.getElementById("routeSummary");
    const mapNode = document.getElementById("routeMap");
    if (!summaryNode || !mapNode) {
      return;
    }

    const assignment = state.data.assignments[0];
    if (!assignment) {
      summaryNode.textContent = "Create assignments first to compute a live route.";
      return;
    }

    const volunteer = state.data.volunteers.find(function (item) { return item.id === assignment.volunteerId; });
    const request = state.data.requests.find(function (item) { return item.id === assignment.requestId; });
    const origin = volunteer && volunteer.location ? volunteer.location : (volunteer ? volunteer.zone + " response hub" : "");
    const destination = request && request.location ? request.location : (request ? request.zone + " response hub" : "");
    if (!origin || !destination) {
      summaryNode.textContent = "Add volunteer and request locations to compute live routing.";
      return;
    }

    const config = getFirebaseConfig();
    try {
      const cacheKey = origin + "->" + destination;
      if (!forceRefresh && state.routeCache[cacheKey]) {
        if (state.routeCache[cacheKey].distanceText) {
          applySecureRouteResult(state.routeCache[cacheKey], volunteer, request);
        } else {
          applyRouteResult(state.routeCache[cacheKey], volunteer, request);
        }
        return;
      }

      if (hasSecureBackend()) {
        const secureRoute = await callBackend("computeSecureRoute", {
          origin: origin,
          destination: destination
        });
        state.routeCache[cacheKey] = secureRoute;
        applySecureRouteResult(secureRoute, volunteer, request);
        trackEvent("resourceflow_compute_route", {
          origin_zone: volunteer ? volunteer.zone : "unknown",
          destination_zone: request ? request.zone : "unknown",
          backend: "functions"
        });
        return;
      }

      if (!config.googleMapsApiKey) {
        renderManualRoutePreview(origin, destination, volunteer, request);
        return;
      }

      await ensureMapsScript();
      if (!state.routeMap) {
        state.routeMap = new window.google.maps.Map(mapNode, {
          center: { lat: 22.5726, lng: 88.3639 },
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false
        });
        state.routeRenderer = new window.google.maps.DirectionsRenderer({
          map: state.routeMap,
          suppressMarkers: false
        });
        state.routeService = new window.google.maps.DirectionsService();
      }

      state.routeService.route({
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, function (result, status) {
        if (status !== "OK" || !result.routes.length) {
          summaryNode.textContent = "Google Maps could not compute a route for the current assignment.";
          return;
        }
        state.routeCache[cacheKey] = result;
        applyRouteResult(result, volunteer, request);
        trackEvent("resourceflow_compute_route", {
          origin_zone: volunteer ? volunteer.zone : "unknown",
          destination_zone: request ? request.zone : "unknown",
          backend: "client"
        });
      });
    } catch (error) {
      console.warn("Route planner failed.", error);
      renderManualRoutePreview(origin, destination, volunteer, request);
    }
  }

  function applyRouteResult(result, volunteer, request) {
    const summaryNode = document.getElementById("routeSummary");
    const firstLeg = result.routes[0] && result.routes[0].legs[0];
    if (!summaryNode || !firstLeg) {
      return;
    }
    if (state.routeRenderer) {
      state.routeRenderer.setDirections(result);
    }
    summaryNode.textContent = volunteer.name + " -> " + request.title + " | " + firstLeg.distance.text + " | ETA " + firstLeg.duration.text;
  }

  function applySecureRouteResult(result, volunteer, request) {
    const summaryNode = document.getElementById("routeSummary");
    const mapNode = document.getElementById("routeMap");
    if (!summaryNode || !mapNode) {
      return;
    }
    summaryNode.textContent = volunteer.name + " -> " + request.title + " | " + (result.distanceText || "n/a") + " | ETA " + (result.durationText || "n/a");
    mapNode.innerHTML = renderRoutePreview(result);
  }

  async function ensureMapsScript() {
    if (window.google && window.google.maps) {
      return;
    }
    const key = getFirebaseConfig().googleMapsApiKey;
    if (!key) {
      throw new Error("Missing Google Maps API key.");
    }
    await loadScript("https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key));
  }

  async function runGeminiLiveAnalysis() {
    const outputNode = document.getElementById("geminiLiveResponse");
    const config = getFirebaseConfig();
    if (!outputNode) {
      return;
    }

    const prompt = buildLiveGeminiPrompt();
    state.geminiBusy = true;
    renderInsights();
    try {
      let text = "";
      if (hasSecureBackend()) {
        const result = await callBackend("generateWorkspaceAnalysis", {
          prompt: prompt
        });
        text = result.text || "";
      } else if (config.geminiApiKey) {
        const response = await fetch(
          GEMINI_API_BASE + encodeURIComponent(config.geminiModel || "gemini-2.5-flash") + ":generateContent?key=" + encodeURIComponent(config.geminiApiKey),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }]
                }
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 900
              }
            })
          }
        );
        if (!response.ok) {
          throw new Error("Gemini request failed with status " + response.status);
        }
        const payload = await response.json();
        text = extractGeminiText(payload);
      } else {
        text = buildLocalAnalysisText();
      }
      outputNode.textContent = text || "Gemini returned no text for this request.";
      trackEvent("resourceflow_gemini_analysis", {
        model: config.geminiModel || "local-strategy-engine",
        backend: hasSecureBackend() ? "functions" : (config.geminiApiKey ? "client" : "local")
      });
    } catch (error) {
      console.warn("Gemini request failed.", error);
      outputNode.textContent = buildLocalAnalysisText();
    } finally {
      state.geminiBusy = false;
      renderInsights();
    }
  }

  function buildLiveGeminiPrompt() {
    const insights = buildInsights(state.data);
    const metrics = computeMetrics(state.data);
    return [
      "You are an operations strategist for ResourceFlow.",
      "Review the current workspace and return:",
      "1. Top 3 immediate actions",
      "2. Staffing risks",
      "3. Community impact summary",
      "4. Product improvement suggestions",
      "",
      "Requests: " + state.data.requests.length,
      "Volunteers: " + state.data.volunteers.length,
      "Assignments: " + state.data.assignments.length,
      "Coverage: " + metrics.coverage + "%",
      "Critical fill rate: " + metrics.criticalFill + "%",
      "Readiness score: " + metrics.readinessScore + "/100",
      "",
      "Executive brief:",
      insights.executiveBrief
    ].join("\n");
  }

  function extractGeminiText(payload) {
    if (!payload || !Array.isArray(payload.candidates) || !payload.candidates.length) {
      return "";
    }
    const candidate = payload.candidates[0];
    if (!candidate.content || !Array.isArray(candidate.content.parts)) {
      return "";
    }
    return candidate.content.parts.map(function (part) {
      return part.text || "";
    }).join("\n").trim();
  }

  function buildLocalAnalysisText() {
    const insights = buildInsights(state.data);
    const metrics = computeMetrics(state.data);
    const risks = metrics.riskRadar.slice(0, 3).map(function (item, index) {
      return (index + 1) + ". " + item.title + " in " + item.zone + " remains uncovered.";
    });
    const nextActions = [
      "Prioritize coordinator follow-up for the highest urgency uncovered requests.",
      "Expand volunteer outreach in zones with weak coverage or transport gaps.",
      "Refresh assignments after each new volunteer signup to improve fairness and fill rate."
    ];
    return [
      "ResourceFlow Local Strategy Engine",
      "",
      "Readiness score: " + metrics.readinessScore + "/100",
      "Coverage: " + metrics.coverage + "%",
      "Critical fill rate: " + metrics.criticalFill + "%",
      "",
      "Top actions:",
      nextActions.join("\n"),
      "",
      "Main risks:",
      risks.length ? risks.join("\n") : "1. No critical uncovered requests detected in the current workspace.",
      "",
      "Executive brief:",
      insights.executiveBrief
    ].join("\n");
  }

  function buildManualNotificationBrief(payload) {
    return [
      "ResourceFlow Manual Outreach Brief",
      "",
      "Subject: " + safeText(payload.subject || "ResourceFlow notification", 120),
      "Channels: " + (Array.isArray(payload.channels) ? payload.channels.join(", ") : "manual-share"),
      "Created: " + formatTime(payload.createdAt || new Date().toISOString()),
      "",
      "Message:",
      safeText(payload.message || "", 420),
      "",
      "Recipients:",
      (payload.recipients || []).map(function (item, index) {
        return (index + 1) + ". " + [item.name || "Contact", item.email || "", item.phone || ""].filter(Boolean).join(" | ");
      }).join("\n") || "No recipients listed."
    ].join("\n");
  }

  function downloadTextFile(name, text) {
    const blob = new Blob([String(text || "")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFileName(name || "resourceflow-export.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function renderManualRoutePreview(origin, destination, volunteer, request) {
    const summaryNode = document.getElementById("routeSummary");
    const mapNode = document.getElementById("routeMap");
    if (!summaryNode || !mapNode) {
      return;
    }
    const volunteerLabel = volunteer && volunteer.name ? volunteer.name : "Volunteer";
    const requestLabel = request && request.title ? request.title : "Request";
    const zoneDistance = volunteer && request ? getZoneDistance(volunteer.zone, request.zone) : 2;
    const distanceKm = Math.max(3, zoneDistance * 4 + 2);
    const etaMinutes = Math.max(12, zoneDistance * 12 + 10);
    const mapsLink = "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(origin) + "&destination=" + encodeURIComponent(destination) + "&travelmode=driving";
    summaryNode.textContent = volunteerLabel + " -> " + requestLabel + " | Estimated " + distanceKm + " km | ETA " + etaMinutes + " min";
    mapNode.innerHTML = [
      '<div class="route-preview">',
      '<div class="chip-row">',
      renderChip(origin),
      renderChip(destination),
      renderChip("Estimated route"),
      '</div>',
      '<p class="card-meta">Spark mode uses location estimates when paid Google Maps routing is not enabled.</p>',
      '<p><a class="primary-link" href="' + escapeHtml(mapsLink) + '" target="_blank" rel="noreferrer">Open Route In Google Maps</a></p>',
      '</div>'
    ].join("");
  }

  function renderRoutePreview(route) {
    const points = decodePolyline(route.polyline || "");
    const path = points.length ? buildSvgPath(points) : "";
    return [
      '<div class="route-preview">',
      '<div class="chip-row">',
      renderChip(route.origin || "Origin"),
      renderChip(route.destination || "Destination"),
      route.distanceText ? renderChip(route.distanceText) : "",
      route.durationText ? renderChip(route.durationText) : "",
      "</div>",
      path
        ? '<svg class="route-svg" viewBox="0 0 320 180" aria-label="Route preview"><path d="' + path + '" /></svg>'
        : '<div class="empty-box">Route preview is unavailable, but secure distance and ETA were computed.</div>',
      route.steps && route.steps.length
        ? '<div class="stack-list">' + route.steps.slice(0, 4).map(function (step) {
            return '<div class="stack-card"><p class="card-meta">' + escapeHtml(stripHtml(step)) + "</p></div>";
          }).join("") + "</div>"
        : "",
      "</div>"
    ].join("");
  }

  function decodePolyline(encoded) {
    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    while (index < String(encoded || "").length) {
      let shift = 0;
      let result = 0;
      let byte = null;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += deltaLng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }
    return points;
  }

  function buildSvgPath(points) {
    if (!points.length) {
      return "";
    }
    const lats = points.map(function (item) { return item.lat; });
    const lngs = points.map(function (item) { return item.lng; });
    const minLat = Math.min.apply(null, lats);
    const maxLat = Math.max.apply(null, lats);
    const minLng = Math.min.apply(null, lngs);
    const maxLng = Math.max.apply(null, lngs);
    const width = Math.max(maxLng - minLng, 0.0001);
    const height = Math.max(maxLat - minLat, 0.0001);
    return points.map(function (point, index) {
      const x = 20 + ((point.lng - minLng) / width) * 280;
      const y = 160 - ((point.lat - minLat) / height) * 140;
      return (index === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    }).join(" ");
  }

  function stripHtml(value) {
    return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function computeMetrics(data) {
    const requests = getVisibleRequests(data);
    const approvedRequests = getActionableRequests(data);
    const volunteers = getVisibleVolunteers(data);
    const assignments = getVisibleAssignments(data);
    const beneficiaries = requests.reduce(function (sum, item) {
      return sum + Number(item.beneficiaries || 0);
    }, 0);

    const coveredIds = new Set(assignments.map(function (item) { return item.requestId; }));
    const coverage = approvedRequests.length ? Math.round((coveredIds.size / approvedRequests.length) * 100) : 0;

    const critical = approvedRequests.filter(function (item) { return item.urgency >= 4; });
    const filledCritical = critical.filter(function (request) {
      const assignedCount = assignments.filter(function (item) { return item.requestId === request.id; }).length;
      return assignedCount >= request.peopleNeeded;
    }).length;
    const criticalFill = critical.length ? Math.round((filledCritical / critical.length) * 100) : 0;
    const revision = data.meta ? Number(data.meta.revision || 0) : 0;
    const activityEvents = Array.isArray(data.activityLog) ? data.activityLog.length : 0;
    const riskRadar = buildRiskRadar(data);
    const readinessScore = computeReadinessScore({
      coverage: coverage,
      criticalFill: criticalFill,
      requests: approvedRequests.length,
      volunteers: volunteers.length,
      assignments: assignments.length
    });
    const historySummary = buildHistorySummary(data.history);
    const pendingApprovals = requests.filter(function (item) {
      return normalizeApprovalStatus(item.approvalStatus) === "pending";
    }).length;
    const archivedCount = getArchivedRecords(data, "requests").length + getArchivedRecords(data, "volunteers").length;
    const utilized = new Set(assignments.map(function (item) { return item.volunteerId; })).size;
    const utilization = volunteers.length ? Math.round((utilized / volunteers.length) * 100) : 0;

    return {
      beneficiaries: beneficiaries,
      requests: requests.length,
      volunteers: volunteers.length,
      assignments: assignments.length,
      coverage: coverage,
      criticalFill: criticalFill,
      revision: revision,
      activityEvents: activityEvents,
      riskRadar: riskRadar,
      readinessScore: readinessScore,
      historySummary: historySummary,
      pendingApprovals: pendingApprovals,
      archivedCount: archivedCount,
      utilization: utilization
    };
  }

  function buildAidFlowSignals(data) {
    const requests = getActionableRequests(data);
    const assignments = getVisibleAssignments(data);
    const groupedAssignments = groupAssignments(assignments);
    const coverageMap = {};
    coverageByZone({
      requests: requests,
      assignments: assignments,
      volunteers: getVisibleVolunteers(data)
    }).forEach(function (item) {
      coverageMap[item.zone] = item.coverage;
    });

    const forecasts = requests.map(function (request) {
      const group = groupedAssignments.find(function (item) { return item.request.id === request.id; });
      const assigned = group ? group.volunteers.length : 0;
      const deficit = Math.max(Number(request.peopleNeeded || 0) - assigned, 0);
      const coverage = Number(coverageMap[request.zone] || 0);
      const hazard = detectHazard(request);
      const resourceType = inferResourceType(request);
      const predictedPackages = estimateReliefPackages(request, deficit);
      const severityScore = Number(request.urgency || 0) * 18 + deficit * 12 + Math.round((100 - coverage) * 0.35);

      return {
        id: request.id,
        title: request.title,
        organization: request.organization,
        zone: request.zone,
        hazard: hazard,
        resourceType: resourceType,
        predictedPackages: predictedPackages,
        forecastWindow: forecastWindowForUrgency(request.urgency),
        severity: severityLabel(severityScore),
        deficit: deficit,
        assigned: assigned,
        coverage: coverage,
        beneficiaries: Number(request.beneficiaries || 0),
        token: aidTokenForRequest(request),
        summary: "Pre-position " + predictedPackages + " " + resourceType.toLowerCase() + " for " + request.zone + " zone before the next " + forecastWindowForUrgency(request.urgency).toLowerCase() + "."
      };
    }).sort(function (left, right) {
      if (severityRank(right.severity) !== severityRank(left.severity)) {
        return severityRank(right.severity) - severityRank(left.severity);
      }
      if (right.deficit !== left.deficit) {
        return right.deficit - left.deficit;
      }
      return left.coverage - right.coverage;
    }).slice(0, 4);

    const verifications = forecasts.map(function (item) {
      const fullyStaffed = item.assigned >= (item.assigned + item.deficit) && item.deficit === 0;
      return {
        id: item.id,
        title: item.title,
        zone: item.zone,
        token: item.token,
        resourceType: item.resourceType,
        status: fullyStaffed
          ? "Verified Ready"
          : item.assigned > 0
            ? "Partial Dispatch"
            : "Token Issued",
        nextStep: fullyStaffed
          ? "Field team can scan and confirm delivery."
          : item.assigned > 0
            ? "Dispatch remaining support and scan on handoff."
            : "Assign responders, then scan this token at pickup and delivery.",
        packages: item.predictedPackages
      };
    });

    if (!forecasts.length) {
      return {
        forecastTitle: "No predictive signal yet",
        forecastText: "Shortage forecasting activates when requests and volunteers are available.",
        satellitePrompt: "Add requests and zone activity to generate an Earth Engine and Gemini-ready disaster intelligence prompt.",
        forecasts: [],
        verifications: []
      };
    }

    const top = forecasts[0];
    return {
      forecastTitle: "Highest projected shortage: " + top.zone + " zone",
      forecastText: top.summary + " Current risk type: " + top.hazard + ".",
      satellitePrompt: [
        "Earth Engine / Gemini-ready prompt",
        "",
        "Analyze satellite, rainfall, waterlogging, and road access signals for " + top.zone + " zone.",
        "Prioritize " + top.hazard.toLowerCase() + " risk patterns and estimate whether " + top.predictedPackages + " " + top.resourceType.toLowerCase() + " will be needed within " + top.forecastWindow.toLowerCase() + ".",
        "Return the likely hotspot clusters, supply routes, and recommended pre-positioning plan."
      ].join("\n"),
      forecasts: forecasts,
      verifications: verifications
    };
  }

  function detectHazard(request) {
    const text = ((request && request.title) || "") + " " + ((request && request.notes) || "");
    const normalized = text.toLowerCase();
    if (normalized.indexOf("flood") >= 0 || normalized.indexOf("water") >= 0) {
      return "Flood";
    }
    if (normalized.indexOf("cyclone") >= 0 || normalized.indexOf("storm") >= 0) {
      return "Cyclone";
    }
    if (normalized.indexOf("quake") >= 0 || normalized.indexOf("earthquake") >= 0) {
      return "Earthquake";
    }
    if (normalized.indexOf("heat") >= 0) {
      return "Heatwave";
    }
    return "Local emergency";
  }

  function inferResourceType(request) {
    return {
      "Food Distribution": "Meal kits",
      "Medical Support": "Medical kits",
      "Shelter Support": "Shelter kits",
      "Logistics": "Supply batches",
      "Education Outreach": "Family support packs",
      "Elder Care": "Care packs"
    }[request.category] || "Relief packs";
  }

  function estimateReliefPackages(request, deficit) {
    const divisor = {
      "Food Distribution": 5,
      "Medical Support": 8,
      "Shelter Support": 4,
      "Logistics": 10,
      "Education Outreach": 12,
      "Elder Care": 6
    }[request.category] || 7;
    return Math.max(1, Math.ceil(Number(request.beneficiaries || 0) / divisor) + Number(deficit || 0));
  }

  function forecastWindowForUrgency(level) {
    const urgency = Number(level || 0);
    if (urgency >= 5) {
      return "Next 6 Hours";
    }
    if (urgency >= 4) {
      return "Next 12 Hours";
    }
    if (urgency >= 3) {
      return "Next 24 Hours";
    }
    return "Next 48 Hours";
  }

  function aidTokenForRequest(request) {
    const zone = String(request && request.zone ? request.zone : "GEN").slice(0, 3).toUpperCase();
    const id = String(request && request.id ? request.id : uid()).slice(-4).toUpperCase();
    return "RF-" + zone + "-" + id;
  }

  function severityLabel(score) {
    if (score >= 120) {
      return "Extreme";
    }
    if (score >= 90) {
      return "High";
    }
    if (score >= 60) {
      return "Elevated";
    }
    return "Watch";
  }

  function severityRank(label) {
    return {
      Extreme: 4,
      High: 3,
      Elevated: 2,
      Watch: 1
    }[label] || 0;
  }

  function buildInsights(data) {
    const metrics = computeMetrics(data);
    const aidSignals = buildAidFlowSignals(data);
    const requestCoverage = coverageByZone(data);
    const weakestZone = requestCoverage.sort(function (left, right) {
      return left.coverage - right.coverage;
    })[0];
    const openRequests = clone(getVisibleRequests(data)).sort(function (left, right) {
      return right.urgency - left.urgency;
    });
    const topRequest = openRequests[0];
    const skillGap = dominantUnfilledSkill(data);

    if (!topRequest) {
      return {
        nextActionTitle: "Seed the workspace",
        nextActionText: "Load demo data or add your first request to start generating coordination guidance.",
        recruitmentTitle: "No recruitment gap yet",
        recruitmentText: "Volunteer recommendations will appear once requests exist.",
        fairnessTitle: "No fairness signal yet",
        fairnessText: "Zone coverage analysis needs live requests.",
        executiveBrief: "No operational data yet. Start by loading demo data or adding a real request to generate predictive disaster allocation signals.",
        judgeBrief: "This workspace is ready for a live demo, but it needs request and volunteer data to tell a stronger impact story about proactive disaster response.",
        geminiPrompt: "Summarize ResourceFlow after I add request and volunteer data. Highlight urgency, staffing gaps, predicted shortages, impact, and recommended next actions.",
        scaleStrategy: "Begin with one NGO or campus club, validate the workflow, then add Firebase sync, route intelligence, Earth Engine signals, and QR-based field verification for wider deployments.",
        actionList: []
      };
    }

    const groupedAssignments = groupAssignments(data.assignments);
    const highestRisk = openRequests.find(function (request) {
      const item = groupedAssignments.find(function (group) { return group.request.id === request.id; });
      const assigned = item ? item.volunteers.length : 0;
      return assigned < request.peopleNeeded;
    }) || topRequest;

    const nextActionTitle = highestRisk.title;
    const nextActionText = "Prioritize " + highestRisk.zone + " zone support for " + highestRisk.organization + ". It needs " + highestRisk.peopleNeeded + " volunteers and currently has the highest urgency or staffing risk.";
    const recruitmentTitle = skillGap.title;
    const recruitmentText = skillGap.text;
    const fairnessTitle = weakestZone ? "Lowest coverage in " + weakestZone.zone : "Coverage is balanced";
    const fairnessText = weakestZone
      ? weakestZone.coverage + "% of " + weakestZone.zone + " requests currently have assignments."
      : "Every active zone currently has matching coverage.";

    const actionList = [
      "Run a targeted volunteer outreach for " + highestRisk.zone + " zone responders.",
      "Recruit more volunteers with " + skillGap.skillLabel + ".",
      "Show judges the live matching board and the AI-generated operational summary."
    ];

    const executiveBrief = [
      "ResourceFlow operational brief",
      "",
      "Requests tracked: " + data.requests.length,
      "Volunteers available: " + data.volunteers.length,
      "Assignments generated: " + data.assignments.length,
      "Coverage: " + metrics.coverage + "%",
      "Critical fill rate: " + metrics.criticalFill + "%",
      "Operational readiness score: " + metrics.readinessScore + "/100",
      "Workspace revision: " + metrics.revision,
      "Collaboration events logged: " + metrics.activityEvents,
      "Sync status: " + state.syncStatus,
      "",
      "Top action:",
      nextActionText,
      "",
      "Recruitment gap:",
      recruitmentText,
      "",
      "Fairness watch:",
      fairnessText,
      "",
      "AidFlow forecast:",
      aidSignals.forecastText,
      "",
      "Risk radar:",
      metrics.riskRadar.length
        ? metrics.riskRadar.slice(0, 3).map(function (item) {
            return item.title + " | deficit " + item.deficit + " | severity " + item.severity;
          }).join("\n")
        : "No current high-risk request gaps."
    ].join("\n");

    const judgeBrief = [
      "ResourceFlow addresses a real coordination gap for NGOs and community response teams.",
      "Instead of spreadsheets and chat messages, it creates one workflow for requests, volunteers, assignments, and impact metrics.",
      "The current workspace shows " + data.requests.length + " active requests serving about " + metrics.beneficiaries + " beneficiaries.",
      "The matching engine uses urgency, zone, skills, transport, and experience to allocate limited volunteers faster.",
      "The AidFlow layer adds predictive shortage forecasting, relief pack estimates, and QR-ready delivery tokens for transparent field operations.",
      "The collaboration layer tracks revisions, editor history, and live sync status for transparent team operations.",
      "A readiness score and risk radar help teams explain why operational decisions are being prioritized.",
      "This directly supports SDG 11, SDG 3, and SDG 17 by improving community coordination and service delivery."
    ].join("\n\n");

    const geminiPrompt = [
      "You are helping improve a Google Solution Challenge project called ResourceFlow.",
      "Summarize the following workspace and propose the next three product improvements.",
      "",
      "Requests: " + data.requests.length,
      "Volunteers: " + data.volunteers.length,
      "Assignments: " + data.assignments.length,
      "Coverage: " + metrics.coverage + "%",
      "Critical fill rate: " + metrics.criticalFill + "%",
      "",
      "Top action: " + nextActionText,
      "Recruitment gap: " + recruitmentText,
      "Fairness watch: " + fairnessText,
      "AidFlow forecast: " + aidSignals.forecastText
    ].join("\n");

    const scaleStrategy = [
      "Scale roadmap",
      "",
      "1. Deploy with one NGO chapter or campus volunteer group.",
      "2. Enable Firebase sync for shared coordinator access across devices.",
      "3. Add Google Maps distance scoring, route-aware assignments, and QR scan checkpoints.",
      "4. Add Gemini summaries plus Earth Engine, weather, or flood-risk inputs for better forecasting.",
      "5. Expand into district or city-wide disaster volunteer coordination."
    ].join("\n");

    return {
      nextActionTitle: nextActionTitle,
      nextActionText: nextActionText,
      recruitmentTitle: recruitmentTitle,
      recruitmentText: recruitmentText,
      fairnessTitle: fairnessTitle,
      fairnessText: fairnessText,
      executiveBrief: executiveBrief,
      judgeBrief: judgeBrief,
      geminiPrompt: geminiPrompt,
      scaleStrategy: scaleStrategy,
      actionList: actionList
    };
  }
  function coverageByZone(data) {
    const requests = getVisibleRequests(data);
    const assignments = getVisibleAssignments(data);
    const map = {};
    requests.forEach(function (request) {
      if (!map[request.zone]) {
        map[request.zone] = { zone: request.zone, requests: 0, covered: 0, coverage: 0 };
      }
      map[request.zone].requests += 1;
    });

    assignments.forEach(function (assignment) {
      if (!map[assignment.zone]) {
        map[assignment.zone] = { zone: assignment.zone, requests: 0, covered: 0, coverage: 0 };
      }
    });

    Object.keys(map).forEach(function (zone) {
      const coveredIds = new Set(
        assignments
          .filter(function (assignment) { return assignment.zone === zone; })
          .map(function (assignment) { return assignment.requestId; })
      );
      map[zone].covered = coveredIds.size;
      map[zone].coverage = map[zone].requests ? Math.round((coveredIds.size / map[zone].requests) * 100) : 100;
    });

    return Object.keys(map).map(function (key) { return map[key]; });
  }

  function dominantUnfilledSkill(data) {
    const requests = getActionableRequests(data);
    const grouped = groupAssignments(getVisibleAssignments(data));
    const score = {};

    requests.forEach(function (request) {
      const found = grouped.find(function (item) { return item.request.id === request.id; });
      const assigned = found ? found.volunteers.length : 0;
      if (assigned < request.peopleNeeded) {
        request.skills.forEach(function (skill) {
          score[skill] = (score[skill] || 0) + (request.peopleNeeded - assigned);
        });
      }
    });

    const entries = Object.keys(score);
    if (!entries.length) {
      return {
        title: "Coverage looks healthy",
        text: "Current staffing covers the known workload. Focus next on adding more organizations and scaling reach.",
        skillLabel: "multi-skill volunteers"
      };
    }

    const best = entries.sort(function (left, right) { return score[right] - score[left]; })[0];
    return {
      title: "Recruit more " + titleCase(best),
      text: "The strongest current gap is for volunteers with " + best + " skills. Recruiting in that area will improve the highest number of open requests.",
      skillLabel: best
    };
  }

  function topOpportunities(data) {
    const requests = clone(getActionableRequests(data)).sort(function (left, right) {
      return right.urgency - left.urgency;
    });
    if (!requests.length) {
      return {
        headline: "No active request yet",
        summary: "Load demo data or add requests so volunteers can be guided toward high-impact needs.",
        items: []
      };
    }

    const top = requests[0];
    const items = requests.slice(0, 3).map(function (request) {
      return {
        title: request.title,
        meta: request.organization + " | " + request.zone + " zone",
        chips: [urgencyLabel(request.urgency), request.category, request.peopleNeeded + " volunteers needed"]
      };
    });

    return {
      headline: "Highest priority opportunity: " + top.title,
      summary: "Volunteers who can support " + top.zone + " zone and bring " + top.skills.join(", ") + " skills will create the biggest immediate impact.",
      items: items
    };
  }

  function buildActivityFeed(data) {
    const activity = [];
    (data.activityLog || []).slice(0, 3).forEach(function (event) {
      activity.push({
        title: titleCase(event.type || "update"),
        meta: event.message || "Workspace event recorded.",
        chips: [event.actor || "system", formatTime(event.at || new Date().toISOString())]
      });
    });

    getVisibleRequests(data).slice(0, 2).forEach(function (request) {
      activity.push({
        title: request.title,
        meta: request.organization + " added a " + urgencyLabel(request.urgency) + " request in " + request.zone,
        chips: [request.category, request.peopleNeeded + " needed", formatTime(request.createdAt)]
      });
    });
    getVisibleVolunteers(data).slice(0, 2).forEach(function (volunteer) {
      activity.push({
        title: volunteer.name,
        meta: volunteer.zone + " zone volunteer joined with " + volunteer.experience.toLowerCase() + " experience",
        chips: [volunteer.availability, volunteer.transport === "Yes" ? "transport" : "no transport", formatTime(volunteer.createdAt)]
      });
    });
    return activity.slice(0, 6);
  }

  function groupAssignments(assignments) {
    const groups = {};
    assignments.forEach(function (assignment) {
      if (!groups[assignment.requestId]) {
        groups[assignment.requestId] = {
          request: {
            id: assignment.requestId,
            title: assignment.requestTitle,
            organization: assignment.organization,
            category: assignment.category,
            zone: assignment.zone,
            urgency: assignment.urgency,
            workflowStatus: assignment.status || "assigned"
          },
          volunteers: []
        };
      }
      groups[assignment.requestId].volunteers.push({
        id: assignment.id,
        name: assignment.volunteerName,
        score: assignment.score,
        reason: assignment.reason,
        status: assignment.status || "assigned"
      });
    });
    return Object.keys(groups).map(function (key) { return groups[key]; });
  }

  function renderActivityCard(item) {
    return [
      '<div class="stack-card">',
      "<strong>" + escapeHtml(item.title) + "</strong>",
      '<p class="card-meta">' + escapeHtml(item.meta) + "</p>",
      '<div class="chip-row">' + item.chips.map(renderChip).join("") + "</div>",
      "</div>"
    ].join("");
  }

  function renderSummaryCard(text) {
    return [
      '<div class="stack-card">',
      "<strong>Action</strong>",
      '<p class="card-meta">' + escapeHtml(text) + "</p>",
      "</div>"
    ].join("");
  }

  function renderRequestCard(request) {
    const hazard = detectHazard(request);
    const resourceType = inferResourceType(request);
    return [
      '<div class="stack-card">',
      "<strong>" + escapeHtml(request.title) + "</strong>",
      '<p class="card-meta">' + escapeHtml(request.organization + " | " + request.zone + " zone") + "</p>",
      '<div class="chip-row">',
      renderUrgencyChip(request.urgency),
      renderChip(request.category),
      renderChip(hazard),
      renderChip(resourceType),
      renderChip(workflowLabel(request.workflowStatus)),
      renderChip(titleCase(normalizeApprovalStatus(request.approvalStatus))),
      renderChip(request.shiftLabel || "Shift pending"),
      renderChip(request.peopleNeeded + " needed"),
      renderChip(aidTokenForRequest(request)),
      renderChip(request.skills.join(", ")),
      request.location ? renderChip(request.location) : "",
      "</div>",
      '<p class="card-meta">' + escapeHtml(request.notes || "No notes provided.") + "</p>",
      canManageWorkspace()
        ? '<div class="button-row compact-controls"><button class="ghost-button" type="button" data-entity-action="edit-request" data-entity-id="' + escapeHtml(request.id) + '">Edit</button><button class="ghost-button" type="button" data-entity-action="advance-request-status" data-entity-id="' + escapeHtml(request.id) + '">Advance Status</button><button class="ghost-button" type="button" data-entity-action="delete-request" data-entity-id="' + escapeHtml(request.id) + '">Archive</button></div>'
        : "",
      "</div>"
    ].join("");
  }

  function renderAssignmentCard(group) {
    const aidToken = aidTokenForRequest(group.request);
    const statuses = group.volunteers.map(function (item) {
      return item.name + " - " + workflowLabel(item.status || "assigned");
    }).join(" | ");
    return [
      '<div class="stack-card">',
      "<strong>" + escapeHtml(group.request.title) + "</strong>",
      '<p class="card-meta">' + escapeHtml(group.request.organization + " | " + group.request.zone + " zone") + "</p>",
      '<div class="chip-row">',
      renderUrgencyChip(group.request.urgency),
      renderChip(group.request.category),
      renderChip(aidToken),
      renderChip(workflowLabel(group.request.workflowStatus || "assigned")),
      group.volunteers.map(function (item) { return renderChip(item.name); }).join(""),
      "</div>",
      '<p class="card-meta">' + escapeHtml(group.volunteers.map(function (item) { return item.name + ": " + item.reason; }).join(" || ")) + "</p>",
      statuses ? '<p class="card-meta">' + escapeHtml(statuses) + '</p>' : "",
      canManageWorkspace() && group.volunteers.length
        ? '<div class="button-row compact-controls"><button class="ghost-button" type="button" data-entity-action="advance-assignment-status" data-entity-id="' + escapeHtml(group.volunteers[0].id || "") + '">Advance Assignment</button></div>'
        : "",
      "</div>"
    ].join("");
  }

  function renderVolunteerCard(volunteer) {
    return [
      '<div class="stack-card">',
      "<strong>" + escapeHtml(volunteer.name) + "</strong>",
      '<p class="card-meta">' + escapeHtml(volunteer.zone + " zone | " + volunteer.experience) + "</p>",
      '<div class="chip-row">',
      renderChip(volunteer.availability),
      renderChip(volunteer.shiftPreference || "Shift flexible"),
      renderChip(volunteer.transport === "Yes" ? "transport" : "local only"),
      renderChip(volunteer.skills.join(", ")),
      (volunteer.languages || []).length ? renderChip((volunteer.languages || []).join(", ")) : "",
      volunteer.location ? renderChip(volunteer.location) : "",
      "</div>",
      canManageWorkspace()
        ? '<div class="button-row compact-controls"><button class="ghost-button" type="button" data-entity-action="edit-volunteer" data-entity-id="' + escapeHtml(volunteer.id) + '">Edit</button><button class="ghost-button" type="button" data-entity-action="delete-volunteer" data-entity-id="' + escapeHtml(volunteer.id) + '">Archive</button></div>'
        : "",
      "</div>"
    ].join("");
  }

  function renderApprovalCard(request) {
    return [
      '<div class="stack-card soft-warning">',
      '<strong>' + escapeHtml(request.title) + '</strong>',
      '<p class="card-meta">' + escapeHtml(request.organization + " | " + request.zone + " zone") + '</p>',
      '<div class="chip-row">',
      renderUrgencyChip(request.urgency),
      renderChip(titleCase(normalizeApprovalStatus(request.approvalStatus))),
      renderChip(request.shiftLabel || "Shift pending"),
      '</div>',
      '<p class="card-meta">' + escapeHtml(request.notes || "Awaiting coordinator review.") + '</p>',
      canManageWorkspace()
        ? '<div class="button-row compact-controls"><button class="primary-button" type="button" data-entity-action="approve-request" data-entity-id="' + escapeHtml(request.id) + '">Approve</button><button class="ghost-button" type="button" data-entity-action="reject-request" data-entity-id="' + escapeHtml(request.id) + '">Reject</button></div>'
        : "",
      '</div>'
    ].join("");
  }

  function renderShiftPlanCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<div class="chip-row">',
      renderChip(item.requests + " request(s)"),
      renderChip(item.covered + " assigned"),
      renderChip(item.openSlots + " open slot(s)"),
      '</div>',
      item.chips.length ? '<p class="card-meta">' + escapeHtml(item.chips.slice(0, 4).join(" | ")) + '</p>' : "",
      '</div>'
    ].join("");
  }

  function renderNotificationCard(item) {
    const toneClass = item.tone === "high"
      ? "soft-danger"
      : (item.tone === "pending" ? "soft-warning" : "soft-success");
    return [
      '<div class="stack-card ' + toneClass + '">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p class="card-meta">' + escapeHtml(item.text) + '</p>',
      '</div>'
    ].join("");
  }

  function renderRouteClusterCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p class="card-meta">' + escapeHtml(item.requests.length + " approved request(s) grouped for " + item.zone + " zone dispatch.") + '</p>',
      '<div class="chip-row">',
      renderChip(item.zone + " zone"),
      renderChip(item.requests.length + " stops"),
      '</div>',
      '<p><a class="primary-link" href="' + escapeHtml(item.mapsLink) + '" target="_blank" rel="noreferrer">Open Cluster In Google Maps</a></p>',
      '</div>'
    ].join("");
  }

  function renderArchivedCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p class="card-meta">' + escapeHtml(item.meta) + '</p>',
      '<div class="chip-row">' + renderChip(titleCase(item.type)) + '</div>',
      canManageWorkspace()
        ? '<div class="button-row compact-controls"><button class="ghost-button" type="button" data-entity-action="restore-' + escapeHtml(item.type) + '" data-entity-id="' + escapeHtml(item.id) + '">Restore</button></div>'
        : '',
      '</div>'
    ].join("");
  }

  function renderOpportunityCard(item) {
    return [
      '<div class="stack-card">',
      "<strong>" + escapeHtml(item.title) + "</strong>",
      '<p class="card-meta">' + escapeHtml(item.meta) + "</p>",
      '<div class="chip-row">' + item.chips.map(renderChip).join("") + "</div>",
      "</div>"
    ].join("");
  }

  function renderForecastCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p class="card-meta">' + escapeHtml(item.organization + " | " + item.zone + " zone | " + item.hazard) + '</p>',
      '<div class="chip-row">',
      renderChip(item.severity + " risk"),
      renderChip(item.resourceType),
      renderChip(item.predictedPackages + " forecasted"),
      renderChip(item.forecastWindow),
      '</div>',
      '<p class="card-meta">' + escapeHtml(item.summary) + '</p>',
      '</div>'
    ].join("");
  }

  function renderVerificationCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p class="card-meta">' + escapeHtml(item.zone + " zone | " + item.resourceType) + '</p>',
      '<div class="chip-row">',
      renderChip(item.status),
      renderChip(item.packages + " packs"),
      renderChip(item.token),
      '</div>',
      '<p class="card-meta">' + escapeHtml(item.nextStep) + '</p>',
      '<div class="button-row compact-controls"><button class="ghost-button" type="button" data-entity-action="preview-token" data-token="' + escapeHtml(item.token) + '">Preview QR</button></div>',
      '</div>'
    ].join("");
  }

  function renderQrPreviewCard(item) {
    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(item.token);
    return [
      '<div class="stack-card qr-preview-card">',
      '<strong>' + escapeHtml(item.token) + '</strong>',
      '<p class="card-meta">' + escapeHtml(item.title + " | " + item.zone + " zone") + '</p>',
      '<div class="chip-row">',
      renderChip(item.status),
      renderChip(item.packages + " packs"),
      '</div>',
      '<img class="qr-preview-image" src="' + escapeHtml(qrUrl) + '" alt="QR preview for ' + escapeHtml(item.token) + '">',
      '<p class="card-meta">' + escapeHtml(item.nextStep) + '</p>',
      '</div>'
    ].join("");
  }

  function renderReviewCard(item) {
    return [
      '<div class="stack-card review-card">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<p class="card-meta">' + escapeHtml(item.summary) + '</p>',
      '<div class="chip-row">' + item.chips.map(renderChip).join("") + '</div>',
      '<div class="button-row compact-controls"><button class="primary-button" type="button" data-entity-action="draft-review-notification" data-entity-id="' + escapeHtml(item.id) + '">Draft Outreach</button></div>',
      '</div>'
    ].join("");
  }

  function renderSystemChip(label, value) {
    return [
      '<div class="sys-chip">',
      '<span class="sys-label">' + escapeHtml(label) + "</span>",
      '<strong class="sys-value">' + escapeHtml(value) + "</strong>",
      "</div>"
    ].join("");
  }

  function renderTimelineEvent(event) {
    return [
      '<div class="timeline-item">',
      '<strong>' + escapeHtml(titleCase(event.type || "update")) + "</strong>",
      '<p class="card-meta">' + escapeHtml(event.message || "Workspace event recorded.") + "</p>",
      '<div class="chip-row">' + renderChip((event.actor || "system") + " - " + formatTime(event.at || new Date().toISOString())) + "</div>",
      "</div>"
    ].join("");
  }

  function renderArtifactCard(artifact) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(artifact.name) + "</strong>",
      '<p class="card-meta">' + escapeHtml(titleCase(artifact.type) + " | " + artifact.relatedTo) + "</p>",
      '<div class="chip-row">',
      renderChip(formatFileSize(artifact.size)),
      renderChip(artifact.uploadedBy),
      renderChip(formatTime(artifact.createdAt)),
      "</div>",
      artifact.url ? '<a class="text-link" href="' + escapeHtml(artifact.url) + '" target="_blank" rel="noreferrer">Open file</a>' : "",
      canManageWorkspace()
        ? '<div class="button-row compact-controls"><button class="ghost-button" type="button" data-entity-action="delete-artifact" data-entity-id="' + escapeHtml(artifact.id) + '">Delete</button></div>'
        : "",
      "</div>"
    ].join("");
  }

  function renderAdminUserCard(user) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(user.displayName || user.email || "Workspace user") + "</strong>",
      '<p class="card-meta">' + escapeHtml(user.email || user.uid) + "</p>",
      '<div class="chip-row">',
      renderChip("role: " + titleCase(user.role || "volunteer")),
      renderChip("requested: " + titleCase(user.requestedRole || "volunteer")),
      renderChip(formatTime(user.updatedAt)),
      "</div>",
      '<form class="admin-role-form button-row" data-uid="' + escapeHtml(user.uid) + '" data-email="' + escapeHtml(user.email || "") + '">',
      '<select name="role"><option' + (user.role === "volunteer" ? " selected" : "") + '>volunteer</option><option' + (user.role === "coordinator" ? " selected" : "") + '>coordinator</option><option' + (user.role === "admin" ? " selected" : "") + '>admin</option></select>',
      '<button class="primary-button" type="submit">Update Role</button>',
      '</form>',
      "</div>"
    ].join("");
  }

  function renderAdminNotificationCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(item.subject || "Notification") + "</strong>",
      '<p class="card-meta">' + escapeHtml(item.message || "") + "</p>",
      '<div class="chip-row">',
      renderChip(item.status || "queued"),
      renderChip(Array.isArray(item.channels) ? item.channels.join(", ") : ""),
      renderChip(formatTime(item.createdAt || new Date().toISOString())),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderAdminErrorCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(item.page || "Client error") + "</strong>",
      '<p class="card-meta">' + escapeHtml(item.message || "Unknown error") + "</p>",
      '<div class="chip-row">',
      renderChip(item.actor || "anonymous"),
      renderChip(item.severity || "error"),
      renderChip(formatTime(item.createdAt || new Date().toISOString())),
      "</div>",
      item.stack ? '<p class="card-meta">' + escapeHtml(item.stack) + "</p>" : "",
      "</div>"
    ].join("");
  }

  function renderAdminAuditCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>' + escapeHtml(titleCase(item.type || "audit event")) + "</strong>",
      '<p class="card-meta">' + escapeHtml(item.summary || item.role || item.status || "Operational event recorded.") + "</p>",
      '<div class="chip-row">',
      renderChip(item.actor || "system"),
      renderChip(item.role || item.status || item.severity || "tracked"),
      renderChip(formatTime(item.createdAt || new Date().toISOString())),
      "</div>",
      item.targetUid ? '<p class="card-meta">Target user: ' + escapeHtml(item.targetUid) + "</p>" : "",
      item.targetId ? '<p class="card-meta">Target id: ' + escapeHtml(item.targetId) + "</p>" : "",
      item.page ? '<p class="card-meta">Page: ' + escapeHtml(item.page) + "</p>" : "",
      "</div>"
    ].join("");
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

  function urgencyLabel(level) {
    return {
      5: "Critical",
      4: "High",
      3: "Moderate",
      2: "Low",
      1: "Routine"
    }[Number(level)] || "Routine";
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    downloadBlob(blob, "resourceflow-workspace.json");
  }

  function exportCsv() {
    const rows = [["recordType", "id", "title", "name", "organization", "zone", "category", "status", "details", "createdAt"]];

    state.data.requests.forEach(function (request) {
      rows.push([
        "request",
        request.id,
        request.title,
        "",
        request.organization,
        request.zone,
        request.category,
        workflowLabel(request.workflowStatus || urgencyLabel(request.urgency)),
        [titleCase(normalizeApprovalStatus(request.approvalStatus)), request.shiftLabel || "", scenarioTitle(request.scenario || "mixed"), (request.skills || []).join(" / ")].filter(Boolean).join(" | "),
        request.createdAt
      ]);
    });

    state.data.volunteers.forEach(function (volunteer) {
      rows.push([
        "volunteer",
        volunteer.id,
        "",
        volunteer.name,
        "",
        volunteer.zone,
        volunteer.experience,
        volunteer.availability,
        [volunteer.shiftPreference || "", (volunteer.languages || []).join(" / "), (volunteer.skills || []).join(" / ")].filter(Boolean).join(" | "),
        volunteer.createdAt
      ]);
    });

    state.data.assignments.forEach(function (assignment) {
      rows.push([
        "assignment",
        assignment.id,
        assignment.requestTitle,
        assignment.volunteerName,
        assignment.organization,
        assignment.zone,
        assignment.category,
        workflowLabel(assignment.status || "assigned"),
        [String(assignment.score), assignment.reason, assignment.shiftLabel || ""].filter(Boolean).join(" | "),
        new Date().toISOString()
      ]);
    });

    state.data.artifacts.forEach(function (artifact) {
      rows.push([
        "artifact",
        artifact.id,
        artifact.relatedTo,
        artifact.name,
        artifact.uploadedBy,
        "",
        artifact.type,
        artifact.contentType,
        artifact.notes,
        artifact.createdAt
      ]);
    });

    const csv = rows.map(function (row) {
      return row.map(csvEscape).join(",");
    }).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv" }), "resourceflow-workspace.csv");
  }

  function printSituationReport() {
    const report = buildSituationReportModel(state.data);
    const popup = window.open("", "_blank", "width=980,height=760");
    if (!popup) {
      announceNotice("Pop-up blocked. Allow pop-ups to print the situation report.");
      return;
    }
    popup.document.write([
      "<!DOCTYPE html>",
      "<html><head><title>ResourceFlow Situation Report</title>",
      "<style>",
      "body{font-family:Segoe UI,Aptos,sans-serif;padding:32px;color:#13212b;background:#f5f7fb;}",
      "h1,h2{margin:0 0 12px;}",
      ".grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:20px 0;}",
      ".card{background:#fff;border:1px solid #d7e0ea;border-radius:18px;padding:18px;box-shadow:0 10px 28px rgba(18,32,48,.08);}",
      "ul{padding-left:20px;line-height:1.6;}",
      "small{color:#55626f;}",
      "@media print{body{background:#fff;padding:18px}.card{box-shadow:none}}",
      "</style></head><body>",
      "<h1>ResourceFlow Situation Report</h1>",
      "<small>Generated " + escapeHtml(formatTimestamp(report.generatedAt)) + "</small>",
      '<div class="grid">',
      report.highlights.map(function (item) {
        return '<div class="card"><strong>' + escapeHtml(item.title + ": " + item.value) + '</strong><p>' + escapeHtml(item.text) + '</p></div>';
      }).join(""),
      "</div>",
      '<div class="card"><h2>Operational Summary</h2><ul>',
      report.bullets.map(function (item) {
        return "<li>" + escapeHtml(item) + "</li>";
      }).join(""),
      "</ul></div>",
      "</body></html>"
    ].join(""));
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function printFieldSheet() {
    const assignments = getVisibleAssignments(state.data).slice(0, 8);
    const popup = window.open("", "_blank", "width=980,height=760");
    if (!popup) {
      announceNotice("Pop-up blocked. Allow pop-ups to print the field sheet.");
      return;
    }
    popup.document.write([
      "<!DOCTYPE html>",
      "<html><head><title>ResourceFlow Field Sheet</title>",
      "<style>",
      "body{font-family:Segoe UI,Aptos,sans-serif;padding:28px;color:#13212b;background:#f6f8fb;}",
      "h1,h2{margin:0 0 12px;} .card{background:#fff;border:1px solid #d7e0ea;border-radius:18px;padding:16px;margin:0 0 14px;}",
      "small{color:#55626f;} @media print{body{background:#fff;padding:16px}}",
      "</style></head><body>",
      "<h1>ResourceFlow Field Sheet</h1>",
      "<small>Generated " + escapeHtml(formatTimestamp(new Date().toISOString())) + "</small>",
      assignments.length ? assignments.map(function (assignment) {
        return '<div class="card"><h2>' + escapeHtml(assignment.requestTitle) + '</h2><p><strong>Volunteer:</strong> ' + escapeHtml(assignment.volunteerName) + '</p><p><strong>Zone:</strong> ' + escapeHtml(assignment.zone) + '</p><p><strong>Shift:</strong> ' + escapeHtml(assignment.shiftLabel || "Unscheduled") + '</p><p><strong>Status:</strong> ' + escapeHtml(workflowLabel(assignment.status || "assigned")) + '</p><p><strong>Dispatch note:</strong> ' + escapeHtml(assignment.reason || "Standard dispatch") + '</p><p><strong>Receipt:</strong> ' + escapeHtml(assignment.deliveryReceiptId || aidTokenForRequest({ zone: assignment.zone, id: assignment.requestId })) + '</p></div>';
      }).join("") : '<div class="card"><p>No assignments are available yet. Load demo data or run matching first.</p></div>',
      "</body></html>"
    ].join(""));
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function printJudgeSubmissionReport() {
    const report = buildSituationReportModel(state.data);
    const metrics = computeMetrics(state.data);
    const popup = window.open("", "_blank", "width=980,height=760");
    if (!popup) {
      announceNotice("Pop-up blocked. Allow pop-ups to print the judge report.");
      return;
    }
    popup.document.write([
      "<!DOCTYPE html>",
      "<html><head><title>ResourceFlow Judge Report</title>",
      "<style>",
      "body{font-family:Segoe UI,Aptos,sans-serif;padding:28px;color:#13212b;background:#f6f8fb;line-height:1.6;}",
      "h1,h2{margin:0 0 12px;} .card{background:#fff;border:1px solid #d7e0ea;border-radius:18px;padding:18px;margin:0 0 16px;}",
      "ul{padding-left:20px;} @media print{body{background:#fff;padding:16px}}",
      "</style></head><body>",
      "<h1>ResourceFlow Judge Submission Report</h1>",
      "<p>Generated " + escapeHtml(formatTimestamp(report.generatedAt)) + "</p>",
      '<div class="card"><h2>Technical Merit</h2><p>ResourceFlow delivers request intake, fairness-aware matching, workflow tracking, archive safety, printable reports, multilingual outreach, and public impact storytelling in a free Spark-safe web app.</p></div>',
      '<div class="card"><h2>User Experience</h2><p>The app provides role-based portals, guided onboarding, mobile-responsive forms, readable analytics, and printable operational outputs for volunteers, coordinators, and judges.</p></div>',
      '<div class="card"><h2>Alignment With Cause</h2><p>Current workspace metrics: ' + escapeHtml(metrics.requests + ' requests, ' + metrics.assignments + ' assignments, ' + metrics.coverage + '% coverage, ' + metrics.beneficiaries + ' estimated beneficiaries.') + '</p></div>',
      '<div class="card"><h2>Innovation And Creativity</h2><ul>' + report.bullets.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul></div>",
      "</body></html>"
    ].join(""));
    popup.document.close();
    popup.focus();
    popup.print();
  }

  async function exportGovernanceReport() {
    if (!canManageWorkspace()) {
      announceNotice("Coordinator or admin access is required to export governance data.");
      return;
    }
    const snapshot = state.adminSnapshot || await buildLocalAdminSnapshot();
    const reviewItems = buildAdminReviewQueue(state.data);
    const roleCounts = (snapshot.users || []).reduce(function (accumulator, user) {
      const role = normalizeRole(user.role || "volunteer");
      accumulator[role] = (accumulator[role] || 0) + 1;
      return accumulator;
    }, {});
    const content = [
      "# ResourceFlow Governance Report",
      "",
      "Generated: " + formatTimestamp(new Date().toISOString()),
      "Storage mode: " + state.storageMode,
      "Workspace revision: " + (snapshot.workspace ? snapshot.workspace.revision : 0),
      "",
      "## Role Summary",
      ""
    ].concat(
      Object.keys(roleCounts).length
        ? Object.keys(roleCounts).map(function (role) {
            return "- " + titleCase(role) + ": " + roleCounts[role];
          })
        : ["- No tracked users yet."]
    ).concat([
      "",
      "## Review Queue",
      ""
    ]).concat(
      reviewItems.length
        ? reviewItems.map(function (item) {
            return "- " + item.title + " | " + item.priority + " | deficit " + item.deficit + " | " + item.zone + " zone";
          })
        : ["- No uncovered requests currently require review."]
    ).concat([
      "",
      "## Notification Drafts",
      ""
    ]).concat(
      snapshot.notifications && snapshot.notifications.length
        ? snapshot.notifications.map(function (item) {
            return "- " + (item.subject || "Notification") + " | " + (item.status || "queued") + " | " + formatTimestamp(item.createdAt || new Date().toISOString());
          })
        : ["- No notification drafts available."]
    ).concat([
      "",
      "## Error Monitor",
      ""
    ]).concat(
      snapshot.errors && snapshot.errors.length
        ? snapshot.errors.map(function (item) {
            return "- " + (item.page || "client") + " | " + (item.message || "Unknown error") + " | " + formatTimestamp(item.createdAt || new Date().toISOString());
          })
        : ["- No client errors logged."]
    ).concat([
      "",
      "## Audit Trail",
      ""
    ]).concat(
      snapshot.audits && snapshot.audits.length
        ? snapshot.audits.slice(0, 10).map(function (item) {
            return "- " + titleCase(item.type || "audit") + " | " + (item.summary || item.status || "Tracked event") + " | " + formatTimestamp(item.createdAt || new Date().toISOString());
          })
        : ["- No audit entries available."]
    ).join("\n");
    downloadBlob(new Blob([content], { type: "text/markdown" }), "resourceflow-governance-report.md");
  }

  function previewAidToken(token) {
    if (!token) {
      return;
    }
    state.selectedAidToken = safeText(token, 40).toUpperCase();
    renderAll();
  }

  function draftReviewNotification(id) {
    const form = document.getElementById("notificationForm");
    if (!form) {
      announceNotice("Open the Admin page to draft review outreach.");
      return;
    }
    const item = buildAdminReviewQueue(state.data).find(function (entry) {
      return entry.id === id;
    });
    if (!item) {
      announceNotice("Review item was not found.");
      return;
    }
    form.elements.subject.value = item.subject;
    form.elements.message.value = item.message;
    form.elements.recipients.value = item.recipients;
    form.querySelectorAll('input[name="channels"]').forEach(function (node) {
      node.checked = node.value === "email";
    });
    form.scrollIntoView({ behavior: "smooth", block: "center" });
    announceNotice("Review outreach draft loaded into the outreach center.");
  }

  async function verifyQrTokenFromForm(form) {
    const resultNode = document.getElementById("qrScanResult");
    const manualToken = safeText(form.querySelector("#qrManualToken") ? form.querySelector("#qrManualToken").value : "", 40).toUpperCase();
    const fileInput = form.querySelector("#qrScanFile");
    let token = manualToken;

    if (!token && fileInput && fileInput.files && fileInput.files[0]) {
      if (resultNode) {
        resultNode.textContent = "Scanning QR image...";
      }
      token = await readQrTokenFromFile(fileInput.files[0]);
    }

    if (!token) {
      state.lastVerifiedToken = "";
      announceNotice("Enter a token manually or upload a QR image in a browser that supports native QR scanning.");
      return;
    }

    state.selectedAidToken = token;
    state.lastVerifiedToken = token;
    const found = buildAidFlowSignals(state.data).verifications.find(function (item) {
      return item.token === token;
    });
    if (found) {
      state.data = registerActivity(
        state.data,
        "verification",
        "Verified AidFlow delivery token " + token + " for " + found.title + ".",
        currentActor()
      );
      await persist();
    }
    form.reset();
    renderAll();
  }

  async function readQrTokenFromFile(file) {
    try {
      if (!window.BarcodeDetector || typeof createImageBitmap !== "function") {
        return "";
      }
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      return codes && codes[0] && codes[0].rawValue
        ? safeText(codes[0].rawValue, 40).toUpperCase()
        : "";
    } catch (error) {
      console.warn("QR scan failed.", error);
      return "";
    }
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

  function downloadBrief() {
    const insights = buildInsights(state.data);
    const content = [
      "# ResourceFlow Generated Brief",
      "",
      "## Executive Brief",
      "",
      insights.executiveBrief,
      "",
      "## Judge Brief",
      "",
      insights.judgeBrief,
      "",
      "## Scale Strategy",
      "",
      insights.scaleStrategy
    ].join("\n");
    const blob = new Blob([content], { type: "text/markdown" });
    downloadBlob(blob, "resourceflow-generated-brief.md");
  }

  function downloadAnalysisPack() {
    const insights = buildInsights(state.data);
    const aidSignals = buildAidFlowSignals(state.data);
    const metrics = computeMetrics(state.data);
    const history = (state.data.history || []).slice(0, 8);
    const riskItems = metrics.riskRadar.slice(0, 6);
    const content = [
      "# ResourceFlow Analysis Pack",
      "",
      "## Workspace Snapshot",
      "",
      "- Revision: " + metrics.revision,
      "- Sync Status: " + state.syncStatus,
      "- Requests: " + state.data.requests.length,
      "- Volunteers: " + state.data.volunteers.length,
      "- Assignments: " + state.data.assignments.length,
      "- Coverage: " + metrics.coverage + "%",
      "- Critical Fill: " + metrics.criticalFill + "%",
      "- Readiness Score: " + metrics.readinessScore + "/100",
      "",
      "## Top Risks",
      ""
    ].concat(
      riskItems.length
        ? riskItems.map(function (item) {
            return "- " + item.title + " | " + item.zone + " | deficit " + item.deficit + " | severity " + item.severity;
          })
        : ["- No high-risk gaps currently detected."]
    ).concat([
      "",
      "## AidFlow Forecast",
      "",
      "- " + aidSignals.forecastText
    ]).concat(
      aidSignals.verifications.length
        ? aidSignals.verifications.map(function (item) {
            return "- " + item.title + " | " + item.zone + " | " + item.status + " | " + item.token;
          })
        : ["- No delivery verification items generated yet."]
    ).concat([
      "",
      "## Trend History",
      ""
    ]).concat(
      history.length
        ? history.map(function (item) {
            return "- Rev " + item.revision + " | coverage " + item.coverage + "% | critical fill " + item.criticalFill + "% | " + formatTimestamp(item.at);
          })
        : ["- Not enough history yet."]
    ).concat([
      "",
      "## Executive Brief",
      "",
      insights.executiveBrief,
      "",
      "## Judge Brief",
      "",
      insights.judgeBrief
    ]).join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    downloadBlob(blob, "resourceflow-analysis-pack.md");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function highlightActiveNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach(function (node) {
      node.classList.toggle("active", node.dataset.nav === page);
    });
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.textContent = value;
    }
  }

  function sanitizeRequestRecord(request) {
    const next = request && typeof request === "object" ? request : {};
    const createdAt = safeIso(next.createdAt || new Date().toISOString());
    const shiftLabel = normalizeShiftLabel(next.shiftLabel || inferShiftLabel(createdAt, next.urgency));
    return {
      id: safeText(next.id || uid(), 32),
      organization: safeText(next.organization, MAX_TEXT_FIELD),
      title: safeText(next.title, MAX_TEXT_FIELD),
      category: safeText(next.category, 80),
      urgency: safeInteger(next.urgency, 1, 5, 3),
      peopleNeeded: safeInteger(next.peopleNeeded, 1, 20, 1),
      zone: normalizeZone(next.zone),
      location: safeText(next.location || (normalizeZone(next.zone) + " response hub"), 140),
      beneficiaries: safeInteger(next.beneficiaries, 1, 100000, 10),
      skills: normalizeSkills(next.skills),
      notes: safeText(next.notes, MAX_NOTES_FIELD),
      approvalStatus: normalizeApprovalStatus(next.approvalStatus || "approved"),
      workflowStatus: normalizeWorkflowStatus(next.workflowStatus || "pending"),
      shiftLabel: shiftLabel,
      responseDay: shiftLabel.split(" - ")[0],
      scenario: normalizeScenario(next.scenario || inferScenario(next.category, next.title, next.notes)),
      routeCluster: normalizeRouteCluster(next.routeCluster || routeClusterForZone(next.zone)),
      archived: Boolean(next.archived),
      approvedAt: safeOptionalIso(next.approvedAt),
      approvedBy: safeText(next.approvedBy || "", 140),
      rejectionReason: safeText(next.rejectionReason || "", 140),
      requestedBy: safeText(next.requestedBy || "", 140),
      createdAt: createdAt
    };
  }

  function sanitizeVolunteerRecord(volunteer) {
    const next = volunteer && typeof volunteer === "object" ? volunteer : {};
    const shiftPreference = normalizeShiftLabel(next.shiftPreference || inferVolunteerShift(next.availability));
    return {
      id: safeText(next.id || uid(), 32),
      ownerUid: safeText(next.ownerUid || "", 80),
      ownerEmail: safeText(next.ownerEmail || "", 140),
      name: safeText(next.name, MAX_TEXT_FIELD),
      zone: normalizeZone(next.zone),
      location: safeText(next.location || (normalizeZone(next.zone) + " volunteer hub"), 140),
      availability: safeText(next.availability || "Half Day", 30),
      skills: normalizeSkills(next.skills),
      transport: String(next.transport) === "Yes" ? "Yes" : "No",
      experience: safeText(next.experience || "Intermediate", 20),
      languages: normalizeLanguages(next.languages || ["English"]),
      shiftPreference: shiftPreference,
      archived: Boolean(next.archived),
      createdAt: safeIso(next.createdAt || new Date().toISOString())
    };
  }

  function sanitizeAssignmentRecord(assignment) {
    const next = assignment && typeof assignment === "object" ? assignment : {};
    if (!next.requestId || !next.volunteerId) {
      return null;
    }
    return {
      id: safeText(next.id || uid(), 32),
      requestId: safeText(next.requestId, 40),
      requestTitle: safeText(next.requestTitle, MAX_TEXT_FIELD),
      organization: safeText(next.organization, MAX_TEXT_FIELD),
      volunteerId: safeText(next.volunteerId, 40),
      volunteerName: safeText(next.volunteerName, MAX_TEXT_FIELD),
      category: safeText(next.category, 80),
      zone: normalizeZone(next.zone),
      urgency: safeInteger(next.urgency, 1, 5, 3),
      score: safeInteger(next.score, 0, 999, 0),
      reason: safeText(next.reason, MAX_NOTES_FIELD),
      status: normalizeWorkflowStatus(next.status || "assigned"),
      shiftLabel: normalizeShiftLabel(next.shiftLabel || inferShiftLabel(next.createdAt || new Date().toISOString(), next.urgency)),
      responseDay: safeText(next.responseDay || normalizeShiftLabel(next.shiftLabel || inferShiftLabel(next.createdAt || new Date().toISOString(), next.urgency)).split(" - ")[0], 30),
      routeCluster: normalizeRouteCluster(next.routeCluster || routeClusterForZone(next.zone)),
      etaMinutes: safeInteger(next.etaMinutes, 5, 240, estimateEtaMinutes(next.zone, next.zone)),
      deliveryReceiptId: safeText(next.deliveryReceiptId || ("RCPT-" + safeText(next.requestId, 8).toUpperCase()), 40)
    };
  }

  function sanitizeActivityRecord(entry) {
    const next = entry && typeof entry === "object" ? entry : {};
    if (!next.message) {
      return null;
    }
    return {
      id: safeText(next.id || uid(), 32),
      type: safeText(next.type || "system", 24),
      actor: safeText(next.actor || "system", 42),
      at: safeIso(next.at || new Date().toISOString()),
      message: safeText(next.message, 240)
    };
  }

  function sanitizeArtifactRecord(entry) {
    const next = entry && typeof entry === "object" ? entry : {};
    if (!next.name) {
      return null;
    }
    return {
      id: safeText(next.id || uid(), 32),
      type: safeText(next.type || "field-photo", 40),
      relatedTo: safeText(next.relatedTo || "workspace", 120),
      notes: safeText(next.notes, 200),
      name: safeText(next.name, 140),
      size: safeInteger(next.size, 0, MAX_FILE_SIZE, 0),
      contentType: safeText(next.contentType || "application/octet-stream", 80),
      uploadedBy: safeText(next.uploadedBy || "unknown", 140),
      createdAt: safeIso(next.createdAt || new Date().toISOString()),
      path: safeText(next.path || "", 240),
      url: safeText(next.url || "", 500)
    };
  }

  function sanitizeHistoryRecord(entry) {
    const next = entry && typeof entry === "object" ? entry : {};
    if (!next.at) {
      return null;
    }
    return {
      id: safeText(next.id || uid(), 32),
      at: safeIso(next.at),
      revision: safeInteger(next.revision, 0, 1000000, 0),
      requests: safeInteger(next.requests, 0, 100000, 0),
      volunteers: safeInteger(next.volunteers, 0, 100000, 0),
      assignments: safeInteger(next.assignments, 0, 100000, 0),
      coverage: safeInteger(next.coverage, 0, 100, 0),
      criticalFill: safeInteger(next.criticalFill, 0, 100, 0)
    };
  }

  function sanitizeMeta(meta) {
    const next = meta && typeof meta === "object" ? meta : {};
    return {
      revision: safeInteger(next.revision, 0, 1000000, 0),
      updatedBy: safeText(next.updatedBy || "system", 42),
      updatedAt: safeIso(next.updatedAt || new Date().toISOString())
    };
  }

  function normalizeSkills(input) {
    const source = Array.isArray(input)
      ? input
      : String(input || "").split(",");
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
    const source = Array.isArray(input)
      ? input
      : String(input || "").split(",");
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

  function normalizeZone(value) {
    const candidate = safeText(value, 20);
    return ALLOWED_ZONES.indexOf(candidate) >= 0 ? candidate : "Central";
  }

  function normalizeApprovalStatus(value) {
    const candidate = String(value || "").trim().toLowerCase();
    return REQUEST_APPROVAL_STATES.indexOf(candidate) >= 0 ? candidate : "pending";
  }

  function normalizeWorkflowStatus(value) {
    const candidate = String(value || "").trim().toLowerCase().replace(/\s+/g, "-");
    return WORKFLOW_SEQUENCE.indexOf(candidate) >= 0 ? candidate : "pending";
  }

  function normalizeScenario(value) {
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

  function safeOptionalIso(value) {
    if (!value) {
      return "";
    }
    return safeIso(value);
  }

  function safeText(value, limit) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit || MAX_TEXT_FIELD);
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

  function safeFileName(value) {
    return String(value || "upload")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(0, 120);
  }

  function isAllowedArtifactFile(file) {
    const type = String(file && file.type ? file.type : "").toLowerCase();
    return type.indexOf("image/") === 0 || type === "application/pdf" || type === "text/plain";
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isBlankWorkspace(data) {
    const next = data && typeof data === "object" ? data : {};
    return (!Array.isArray(next.requests) || next.requests.length === 0)
      && (!Array.isArray(next.volunteers) || next.volunteers.length === 0)
      && (!Array.isArray(next.assignments) || next.assignments.length === 0)
      && (!Array.isArray(next.artifacts) || next.artifacts.length === 0)
      && (!Array.isArray(next.activityLog) || next.activityLog.length === 0)
      && (!Array.isArray(next.history) || next.history.length === 0);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
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

  function uid() {
    return "rf-" + Math.random().toString(36).slice(2, 10);
  }

  function isoMinutesAgo(minutes) {
    return new Date(Date.now() - minutes * 60000).toISOString();
  }

  window.ResourceFlowTestAPI = {
    sanitizeState: sanitizeState,
    sanitizeRequestRecord: sanitizeRequestRecord,
    sanitizeVolunteerRecord: sanitizeVolunteerRecord,
    sanitizeArtifactRecord: sanitizeArtifactRecord,
    generateAssignments: generateAssignments,
    buildAidFlowSignals: buildAidFlowSignals,
    buildAdminReviewQueue: buildAdminReviewQueue,
    buildApprovalQueue: buildApprovalQueue,
    buildShiftPlan: buildShiftPlan,
    buildArchivedOverview: buildArchivedOverview,
    buildVolunteerOutreachMessage: buildVolunteerOutreachMessage,
    buildLocalAnalysisText: buildLocalAnalysisText,
    buildManualNotificationBrief: buildManualNotificationBrief,
    resolveRoleForEmail: resolveRoleForEmail,
    normalizeRole: normalizeRole,
    validateRequest: validateRequest,
    validateVolunteer: validateVolunteer
  };
})();

