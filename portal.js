(function () {
  const PORTAL_SELECTION_KEY = "resourceflow-portal-selection-v2";
  const PORTAL_PROFILE_KEY = "resourceflow-portal-profile-v2";
  const PORTAL_HANDOFF_KEY = "resourceflow-portal-handoff-v1";
  const ENTRY_PROFILE_KEY = "resourceflow-entry-profile-v1";
  const DEMO_AUTH_KEY = "resourceflow-demo-auth-v1";
  const THEME_KEY = "resourceflow-theme-mode-v2";
  const LANGUAGE_KEY = "resourceflow-language-v1";
  const WORKSPACE_KEY = "resourceflow-demo-workspace-v2";
  const CACHE_RESET_KEY = "resourceflow-portal-cache-reset-v1";
  const AI_CHAT_HISTORY_KEY = "resourceflow-ai-chat-v1";
  const DISMISSED_ALERTS_KEY = "resourceflow-dismissed-alerts-v1";
  const COMMUNITY_DRAFT_KEY = "resourceflow-community-draft-v1";
  const DONATION_DRAFT_KEY = "resourceflow-donation-draft-v1";
  const RECENT_SEARCHES_KEY = "resourceflow-recent-searches-v1";
  const OFFLINE_QUEUE_KEY = "resourceflow-offline-queue-v1";
  const REQUEST_TRACK_KEY = "resourceflow-request-tracking-v1";
  const NOTIFICATION_STATE_KEY = "resourceflow-notification-state-v1";
  const SYNC_STATUS_KEY = "resourceflow-sync-status-v1";
  const TOAST_STATE_KEY = "resourceflow-toast-state-v1";
  const REQUEST_LOOKUP_KEY = "resourceflow-request-lookup-v1";
  const ADMIN_MODERATION_FILTER_KEY = "resourceflow-admin-moderation-filter-v1";
  const FIREBASE_SDK_VERSION = "10.12.5";
  const LANGUAGE_OPTIONS = [
    { value: "en", label: "English" },
    { value: "hinglish", label: "Hinglish" },
    { value: "hi-roman", label: "Hindi Roman" }
  ];
  const TRANSLATIONS = {
    "hinglish": {
      searchPlaceholder: "Requests, volunteers, donations search karo...",
      switchPortal: "Portal Change Karo",
      signOut: "Sign Out",
      themeLight: "Light Mode",
      themeDark: "Dark Mode",
      currentAccess: "Current Access",
      navigation: "Navigation",
      profile: "Profile",
      quickActions: "Quick Actions",
      loadDemo: "Demo Load Karo",
      exportJson: "JSON Export",
      exportCsv: "CSV Export",
      printReport: "Report Print",
      notifications: "Notifications",
      scenarioSwitcher: "Scenario Switcher",
      activeScenario: "Active Scenario",
      loadScenario: "Scenario Load Karo",
      clearDemo: "Demo Clear Karo",
      aiPrediction: "AI Prediction",
      donationPortal: "Donation Portal",
      communityPortal: "Community Portal",
      volunteerPortal: "Volunteer Portal",
      governmentOps: "Government Ops",
      adminDashboard: "Admin Dashboard"
    },
    "hi-roman": {
      searchPlaceholder: "Requests, volunteers, donations khojiye...",
      switchPortal: "Portal badaliye",
      signOut: "Sign out",
      themeLight: "Light mode",
      themeDark: "Dark mode",
      currentAccess: "Vartaman access",
      navigation: "Navigation",
      profile: "Profile",
      quickActions: "Quick actions",
      loadDemo: "Demo load kariye",
      exportJson: "JSON export",
      exportCsv: "CSV export",
      printReport: "Report print",
      notifications: "Notifications",
      scenarioSwitcher: "Scenario switcher",
      activeScenario: "Active scenario",
      loadScenario: "Scenario load kariye",
      clearDemo: "Demo clear kariye",
      aiPrediction: "AI prediction",
      donationPortal: "Donation portal",
      communityPortal: "Community portal",
      volunteerPortal: "Volunteer portal",
      governmentOps: "Government operations",
      adminDashboard: "Admin dashboard"
    }
  };
  const AI_QUICK_PROMPTS = [
    "Which district is at the highest risk right now?",
    "Why did the system match these volunteers to the top request?",
    "What donations are missing for the active scenario?",
    "Give me a short response plan for the next 2 hours."
  ];
  const CATEGORY_SKILLS = {
    food: ["food", "ration", "kitchen", "distribution", "logistics"],
    medical: ["medical", "medicine", "nurse", "first aid", "health", "clinic"],
    shelter: ["shelter", "registration", "coordination", "logistics", "support"],
    education: ["education", "teacher", "books", "child", "speaker"],
    logistics: ["logistics", "driving", "operations", "routing", "supply"],
    "community alert": ["outreach", "coordination", "bilingual", "speaker", "alert"]
  };
  const CATEGORY_DONATIONS = {
    food: ["food", "money"],
    medical: ["money", "other useful items", "food"],
    shelter: ["clothes", "other useful items", "money"],
    education: ["books", "money"],
    logistics: ["money", "other useful items"],
    "community alert": ["money", "other useful items"]
  };
  const AI_RUNTIME = {
    busy: false,
    status: "AI copilot is ready. Ask about districts, volunteers, donors, or the current scenario.",
    tone: "",
    engine: "local-boosted",
    drawerOpen: false
  };
  const DEMO_RUNTIME = {
    drawerOpen: false
  };
  const SEARCH_RUNTIME = {
    query: "",
    searched: false,
    focused: false
  };
  const TOAST_RUNTIME = {
    items: []
  };
  const LAUNCHER_NAV_ORDER = ["insights", "volunteer", "donations", "operations", "admin"];

  const PAGE_TITLES = {
    community: "Community Portal",
    overview: "Community Portal",
    volunteer: "Volunteer Portal",
    directory: "Volunteer Directory",
    donations: "Donation Portal",
    operations: "Government Operations",
    insights: "AI Insights",
    admin: "Admin Dashboard",
    impact: "Public Impact",
    judge: "Judge Mode"
  };

  const ROLE_CONFIG = {
    user: {
      label: "Community User",
      description: "Submit help requests, donate, track the visible request lifecycle, and follow AI-supported community updates.",
      pages: ["community", "donations", "insights"],
      chips: ["Community tracker", "Donation access", "AI prediction"]
    },
    volunteer: {
      label: "Volunteer",
      description: "Track assignments, contribution history, badges, reliability, and the shared volunteer directory with AI guidance.",
      pages: ["volunteer", "directory", "insights"],
      chips: ["Assignments", "Badges and score", "AI prediction"]
    },
    government: {
      label: "Government Employee",
      description: "Coordinate district operations, approvals, blocked cases, live deployments, and the AI dispatch story.",
      pages: ["operations", "insights"],
      chips: ["Control board", "District pressure", "AI dispatch"]
    },
    admin: {
      label: "Admin",
      description: "Moderate volunteer and donation records, review activity, export reports, and oversee public impact.",
      pages: ["community", "volunteer", "directory", "donations", "operations", "insights", "admin", "impact", "judge"],
      chips: ["Full access", "Audit trail", "Moderation controls"]
    }
  };

  const SIDEBAR_ITEMS = [
    { key: "community", label: "Community Portal", shortLabel: "Community", href: "./community.html", icon: "home", caption: "Public view and requests", roles: ["user", "admin"] },
    { key: "volunteer", label: "Volunteer Hub", shortLabel: "Volunteer", href: "./volunteer.html", icon: "volunteer_activism", caption: "Assignments and impact", roles: ["volunteer", "admin"] },
    { key: "directory", label: "Volunteer Directory", shortLabel: "Directory", href: "./directory.html", icon: "groups", caption: "Shared responder profiles", roles: ["volunteer", "admin"] },
    { key: "donations", label: "Donation Center", shortLabel: "Donations", href: "./donations.html", icon: "redeem", caption: "Money and item support", roles: ["user", "admin"] },
    { key: "operations", label: "Government Ops", shortLabel: "Operations", href: "./operations.html", icon: "shield_person", caption: "District coordination board", roles: ["government", "admin"] },
    { key: "insights", label: "AI Prediction", shortLabel: "AI", href: "./insights.html", icon: "monitoring", caption: "Forecasts and risk analysis", roles: ["user", "volunteer", "government", "admin"] },
    { key: "admin", label: "Admin Dashboard", shortLabel: "Admin", href: "./admin.html", icon: "admin_panel_settings", caption: "Governance and control", roles: ["admin"] }
  ];
  const PORTAL_MENU_ITEMS = [
    { role: "user", label: "Community User Portal", shortLabel: "Community", icon: "home", caption: "Requests, donations, and public updates", href: "./community.html" },
    { role: "volunteer", label: "Volunteer Portal", shortLabel: "Volunteer", icon: "volunteer_activism", caption: "Assignments, impact, and shared directory", href: "./volunteer.html" },
    { role: "government", label: "Government Portal", shortLabel: "Government", icon: "shield_person", caption: "District operations and active approvals", href: "./operations.html" },
    { role: "admin", label: "Admin Portal", shortLabel: "Admin", icon: "admin_panel_settings", caption: "Governance, moderation, and exports", href: "./admin.html" }
  ];

  const SCENARIO_PRESETS = {
    flood: {
      key: "flood",
      label: "Flood Response",
      summary: "A flood warning has escalated into active street-level response across low-lying neighborhoods.",
      requests: [
        { id: "REQ-104", title: "Dry ration kits for low-lying streets", category: "Food", district: "Chennai", location: "Velachery, Chennai", lat: 12.9815, lng: 80.218, beneficiaries: 180, priority: "Critical", status: "Assigned", summary: "Families displaced by overnight flooding need ready-to-cook meal kits and drinking water.", ai: "AI matched food handlers and two-wheeler responders because they are within 4 km and available this evening." },
        { id: "REQ-105", title: "Temporary shelter support at school hall", category: "Shelter", district: "Chennai", location: "Saidapet Government School, Chennai", lat: 13.023, lng: 80.223, beneficiaries: 140, priority: "High", status: "In Progress", summary: "Mats, blankets, and volunteer registration support are needed for the emergency shelter.", ai: "AI prioritized bilingual volunteers with registration support skills for faster intake at the shelter." },
        { id: "REQ-106", title: "Medical support for senior citizens", category: "Medical", district: "Chennai", location: "Adyar Community Clinic, Chennai", lat: 13.0067, lng: 80.2573, beneficiaries: 65, priority: "Critical", status: "Queued", summary: "Medicine pickup and blood pressure checks are required for seniors isolated by waterlogging.", ai: "AI flagged the request because medicine lead time is short and the available nurse volunteer is nearby." },
        { id: "REQ-107", title: "School book recovery and child-safe space", category: "Education", district: "Chennai", location: "Perungudi Relief Camp, Chennai", lat: 12.96, lng: 80.241, beneficiaries: 150, priority: "Medium", status: "Submitted", summary: "Children at the relief camp need book kits, mats, and supervised activity support.", ai: "AI recommended education volunteers and book donations to combine relief and child engagement in one trip." }
      ],
      assignments: [
        { id: "ASG-301", title: "Deliver 60 ration kits", volunteer: "Thenmozhi P", district: "Chennai", location: "Velachery, Chennai", status: "Completed", date: "Today 09:20", points: 30 },
        { id: "ASG-302", title: "Register shelter arrivals", volunteer: "Sana Patel", district: "Chennai", location: "Saidapet Government School, Chennai", status: "In Progress", date: "Today 10:10", points: 22 },
        { id: "ASG-303", title: "Medicine pickup and escort", volunteer: "Aarav Mehta", district: "Chennai", location: "Adyar Community Clinic, Chennai", status: "Assigned", date: "Today 10:40", points: 26 },
        { id: "ASG-304", title: "Book kit sorting", volunteer: "Diya Raman", district: "Chennai", location: "Perungudi Relief Camp, Chennai", status: "Assigned", date: "Today 11:20", points: 18 },
        { id: "ASG-305", title: "Water distribution coordination", volunteer: "Ravi Sen", district: "Chennai", location: "Velachery, Chennai", status: "Completed", date: "Today 12:05", points: 28 }
      ],
      volunteers: [
        { name: "Thenmozhi P", ngo: "Care Bridge", skills: ["first aid", "food distribution"], location: "Velachery, Chennai", availability: "Available", contact: "thenmozhi@example.com" },
        { name: "Sana Patel", ngo: "Seva Relief Collective", skills: ["registration", "coordination"], location: "Saidapet, Chennai", availability: "On Call", contact: "sana@example.com" },
        { name: "Aarav Mehta", ngo: "Health on Wheels", skills: ["medical support", "driving"], location: "Adyar, Chennai", availability: "Available", contact: "aarav@example.com" },
        { name: "Diya Raman", ngo: "Book Aid Network", skills: ["child support", "education"], location: "Perungudi, Chennai", availability: "Available", contact: "diya@example.com" },
        { name: "Ravi Sen", ngo: "District Relief Cell", skills: ["operations", "water logistics"], location: "Velachery, Chennai", availability: "Active", contact: "ravi@example.com" }
      ],
      donations: [
        { donor: "Shri Sundaram", kind: "money", amount: 1000, paymentMethod: "UPI", note: "Rapid flood response", status: "Submitted" },
        { donor: "Lakshmi Stores", kind: "item", itemType: "Food", quantity: 60, description: "Dry ration family packs", status: "Scheduled" },
        { donor: "School Book Trust", kind: "item", itemType: "Books", quantity: 120, description: "Children reading kits", status: "Reviewing" }
      ],
      audit: [
        "3 new community requests were routed into the review queue in the last 15 minutes.",
        "AI matched 5 assignments using proximity, district coverage, and volunteer readiness.",
        "Donation tracking linked 3 donor records to active flood-response needs."
      ],
      outreach: [
        "SMS draft ready for Velachery volunteers to confirm evening availability.",
        "Community notice drafted for shelter intake timings at Saidapet Government School.",
        "Donation thank-you message queued for Shri Sundaram and Lakshmi Stores."
      ]
    },
    cyclone: {
      key: "cyclone",
      label: "Cyclone Preparedness",
      summary: "A cyclone warning is driving pre-positioning of volunteers, shelter supplies, and district control-room updates.",
      requests: [
        { id: "REQ-210", title: "Pre-position shelter kits", category: "Shelter", district: "Nagapattinam", location: "Nagapattinam Collectorate", lat: 10.7672, lng: 79.8428, beneficiaries: 220, priority: "Critical", status: "Assigned", summary: "Before landfall, the district needs shelter kits moved to two evacuation centers.", ai: "AI prioritized logistics volunteers with vehicle access because the movement window closes by evening." },
        { id: "REQ-211", title: "Fishing harbor warning support", category: "Community Alert", district: "Nagapattinam", location: "Akkaraipettai Harbor", lat: 10.7656, lng: 79.8565, beneficiaries: 90, priority: "High", status: "In Progress", summary: "Field teams are needed to spread evacuation and safe-return notices in person.", ai: "AI suggested bilingual volunteers because the harbor team needs Tamil and Telugu outreach support." },
        { id: "REQ-212", title: "Emergency medicine staging", category: "Medical", district: "Cuddalore", location: "Cuddalore District Hospital", lat: 11.7444, lng: 79.7684, beneficiaries: 130, priority: "High", status: "Queued", summary: "Medicine packs and glucose supplies need staging ahead of expected outages.", ai: "AI flagged a high-value medicine window and recommended fast deployment before road closures." }
      ],
      assignments: [
        { id: "ASG-401", title: "Move shelter mattresses", volunteer: "Thenmozhi P", district: "Nagapattinam", location: "Nagapattinam Collectorate", status: "Completed", date: "Today 08:15", points: 24 },
        { id: "ASG-402", title: "Harbor warning outreach", volunteer: "Sana Patel", district: "Nagapattinam", location: "Akkaraipettai Harbor", status: "Assigned", date: "Today 09:45", points: 18 },
        { id: "ASG-403", title: "Medicine staging support", volunteer: "Aarav Mehta", district: "Cuddalore", location: "Cuddalore District Hospital", status: "In Progress", date: "Today 10:20", points: 21 }
      ],
      volunteers: [
        { name: "Thenmozhi P", ngo: "Care Bridge", skills: ["logistics", "first aid"], location: "Nagapattinam", availability: "Available", contact: "thenmozhi@example.com" },
        { name: "Sana Patel", ngo: "Seva Relief Collective", skills: ["outreach", "coordination"], location: "Nagapattinam", availability: "On Call", contact: "sana@example.com" },
        { name: "Aarav Mehta", ngo: "Health on Wheels", skills: ["medical support", "driving"], location: "Cuddalore", availability: "Available", contact: "aarav@example.com" }
      ],
      donations: [
        { donor: "Harbor Traders Forum", kind: "money", amount: 5000, paymentMethod: "Bank Transfer", note: "Cyclone preparedness fund", status: "Submitted" },
        { donor: "Relief Supplies Hub", kind: "item", itemType: "Clothes", quantity: 200, description: "Raincoats and blankets", status: "Scheduled" }
      ],
      audit: [
        "Cyclone watch level increased from amber to red in 2 coastal districts.",
        "Shelter stocking is 64% complete against tonight's evacuation plan.",
        "Volunteer mobility has been constrained by one projected road closure zone."
      ],
      outreach: [
        "Cyclone alert draft sent to 3 harbor communities for confirmation.",
        "Shelter coordinator reminder prepared for Nagapattinam and Cuddalore teams."
      ]
    },
    medical: {
      key: "medical",
      label: "Mobile Medical Camp",
      summary: "A mobile health camp is coordinating registrations, medicine supply, and volunteer triage support.",
      requests: [
        { id: "REQ-310", title: "Registration desk support", category: "Medical", district: "Kolkata", location: "Tangra Community Hall, Kolkata", lat: 22.5492, lng: 88.4049, beneficiaries: 160, priority: "High", status: "Assigned", summary: "Volunteers are needed to manage patient tokens, intake forms, and crowd flow.", ai: "AI matched volunteers with coordination and bilingual skills to reduce intake delays." },
        { id: "REQ-311", title: "Medicine desk coordination", category: "Medical", district: "Kolkata", location: "Tangra Community Hall, Kolkata", lat: 22.5492, lng: 88.4049, beneficiaries: 160, priority: "High", status: "In Progress", summary: "Doctors need one runner and one record-keeper for medicine dispensation.", ai: "AI paired one logistics volunteer and one data-entry volunteer because both are already on-site." },
        { id: "REQ-312", title: "Health awareness booklets", category: "Education", district: "Kolkata", location: "Tangra Community Hall, Kolkata", lat: 22.5492, lng: 88.4049, beneficiaries: 160, priority: "Medium", status: "Submitted", summary: "Printed materials and volunteer speakers are required for follow-up awareness sessions.", ai: "AI suggested clubbing booklets with the donation run to avoid a separate last-mile trip." }
      ],
      assignments: [
        { id: "ASG-510", title: "Patient token intake", volunteer: "Thenmozhi P", district: "Kolkata", location: "Tangra Community Hall, Kolkata", status: "In Progress", date: "Today 09:00", points: 19 },
        { id: "ASG-511", title: "Medicine counter runner", volunteer: "Sana Patel", district: "Kolkata", location: "Tangra Community Hall, Kolkata", status: "Completed", date: "Today 10:40", points: 25 },
        { id: "ASG-512", title: "Booklet distribution prep", volunteer: "Diya Raman", district: "Kolkata", location: "Tangra Community Hall, Kolkata", status: "Assigned", date: "Today 11:10", points: 16 }
      ],
      volunteers: [
        { name: "Thenmozhi P", ngo: "Care Bridge", skills: ["coordination", "registration"], location: "Tangra, Kolkata", availability: "Active", contact: "thenmozhi@example.com" },
        { name: "Sana Patel", ngo: "Seva Relief Collective", skills: ["medicine desk", "runner"], location: "Tangra, Kolkata", availability: "Available", contact: "sana@example.com" },
        { name: "Diya Raman", ngo: "Book Aid Network", skills: ["education", "public speaking"], location: "Kolkata", availability: "On Call", contact: "diya@example.com" }
      ],
      donations: [
        { donor: "Shri Sundaram", kind: "money", amount: 2000, paymentMethod: "UPI", note: "Medical camp supplies", status: "Submitted" },
        { donor: "HealthCare Partners", kind: "item", itemType: "Food", quantity: 40, description: "Nutrition packs for patients", status: "Reviewing" }
      ],
      audit: [
        "Medical camp throughput is holding steady at 22 registrations per hour.",
        "The AI matching engine identified one understaffed desk and rerouted a volunteer in 30 seconds."
      ],
      outreach: [
        "Medicine counter volunteer reminder drafted for the afternoon shift.",
        "Awareness session invite prepared for community WhatsApp groups."
      ]
    }
  };

  const EMPTY_WORKSPACE = {
    scenario: "none",
    label: "No demo loaded",
    summary: "Load demo data to see requests, assignments, donations, and AI matching in action.",
    requests: [],
    assignments: [],
    volunteers: [],
    donations: [],
    audit: [],
    outreach: [],
    systemNotice: "Choose a scenario to populate the workspace."
  };

  const REQUEST_STAGES = ["Pending", "Reviewed", "Assigned", "In Progress", "Delivered", "Closed"];
  const DONATION_STAGES = ["Submitted", "Verified", "Packed", "Dispatched", "Delivered"];
  const ASSIGNMENT_STAGES = ["Accepted", "In Progress", "Completed"];
  const DEMO_REFRESH_MS = 10 * 60 * 1000;
  const AUTOMATION_TICK_MS = 20 * 1000;
  const LIVE_PRIORITY_RANK = 180;
  const DISASTER_PRIORITY_RANK = 240;
  const STANDARD_PRIORITY_RANK = 90;
  const DEMO_VOLUNTEER_NAMES = ["Arjun Das", "Meera Joseph", "Kavin Raj", "Nila Bose", "Farhan Ali", "Sowmya Devi", "Pranav Sen", "Ishita Paul"];
  const DEMO_DONOR_NAMES = ["Harbor Traders Forum", "Relief Supplies Hub", "CareLink Trust", "Rapid Aid Circle", "District Women Collective", "Health Basket Network"];
  const DEMO_LOCATION_HINTS = {
    Chennai: ["Velachery", "Saidapet", "Adyar", "Perungudi", "Tambaram"],
    Nagapattinam: ["Nagapattinam Collectorate", "Akkaraipettai Harbor", "Nagore", "Keelaiyur"],
    Cuddalore: ["Cuddalore District Hospital", "Panruti", "Kurinjipadi"],
    Kolkata: ["Tangra Community Hall", "Salt Lake", "Park Circus", "Beliaghata"],
    Default: ["Town Hall", "Community School", "Primary Health Center", "Ward Relief Point"]
  };
  const WORKSPACE_AUTOMATION_RUNTIME = {
    intervalId: 0,
    storageBound: false
  };
  const WORKSPACE_SYNC_RUNTIME = {
    timerId: 0,
    inflight: false,
    pendingSerialized: "",
    lastSyncedSerialized: "",
    reason: ""
  };

  function init() {
    const root = document.getElementById("portalApp");
    if (!root) {
      return;
    }
    clearLegacyCachesOnce();
    applyTheme(loadTheme());
    bindWorkspaceAutomation(root);
    renderApp(root);
    observeInteractiveTestIds();
  }

  function bindWorkspaceAutomation(root) {
    if (!WORKSPACE_AUTOMATION_RUNTIME.storageBound) {
      window.addEventListener("storage", function (event) {
        if (!event || [WORKSPACE_KEY, THEME_KEY, LANGUAGE_KEY, DISMISSED_ALERTS_KEY].indexOf(event.key) === -1) {
          return;
        }
        if (event.key === THEME_KEY) {
          applyTheme(loadTheme());
        }
        renderApp(root);
      });
      window.addEventListener("resourceflow:workspace-synced", function () {
        renderApp(root);
      });
      WORKSPACE_AUTOMATION_RUNTIME.storageBound = true;
    }
    if (!WORKSPACE_AUTOMATION_RUNTIME.intervalId) {
      WORKSPACE_AUTOMATION_RUNTIME.intervalId = window.setInterval(function () {
        const result = runWorkspaceAutomation({ reason: "interval" });
        if (result.changed) {
          renderApp(root);
        }
      }, AUTOMATION_TICK_MS);
    }
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function nowMs() {
    return Date.now();
  }

  function parseTimestamp(value) {
    const stamp = safeText(value, 80);
    if (!stamp) {
      return 0;
    }
    const parsed = Date.parse(stamp);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function elapsedMinutes(since) {
    const start = parseTimestamp(since);
    if (!start) {
      return 0;
    }
    return (nowMs() - start) / 60000;
  }

  function randomFrom(list) {
    return Array.isArray(list) && list.length
      ? list[Math.floor(Math.random() * list.length)]
      : "";
  }

  function slugify(value) {
    return safeText(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function capitalizeWord(value) {
    const text = safeText(value, 120);
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }

  function clearLegacyCachesOnce() {
    try {
      if (window.sessionStorage && window.sessionStorage.getItem(CACHE_RESET_KEY) === "done") {
        return;
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          registrations.forEach(function (registration) {
            registration.unregister();
          });
        }).catch(function () {});
      }
      if (window.caches && typeof window.caches.keys === "function") {
        window.caches.keys().then(function (keys) {
          return Promise.all(keys.map(function (key) {
            return window.caches.delete(key);
          }));
        }).catch(function () {});
      }
      if (window.sessionStorage) {
        window.sessionStorage.setItem(CACHE_RESET_KEY, "done");
      }
    } catch (error) {
      // Ignore storage/cache cleanup failures and continue rendering.
    }
  }

  function renderApp(root) {
    const page = normalizePage((document.body && document.body.dataset.page) || "overview");
    const session = getSession();
    if (!session.hasSession) {
      window.location.replace("./index.html");
      return;
    }
    const workspace = getManagedWorkspace({ reason: "render" });
    const allowed = isPageAllowed(session.role, page);
    let pageMarkup = "";
    let headerMarkup = "";
    let railMarkup = "";
    let demoMarkup = "";
    let aiMarkup = "";
    let mobileMarkup = "";

    try {
      pageMarkup = allowed ? renderPage(page, session, workspace) : renderAccessRestricted(page, session);
    } catch (error) {
      console.error("ResourceFlow render error on page:", page, error);
      try {
        pageMarkup = (page === "overview" || page === "community")
          ? renderOverviewFallback(workspace)
          : renderPageFailure(page);
      } catch (fallbackError) {
        console.error("ResourceFlow fallback render failed on page:", page, fallbackError);
        pageMarkup = renderMinimalRecoveryPage(page, workspace);
      }
    }

    try {
      headerMarkup = renderHeader(page, session, workspace);
    } catch (error) {
      console.error("Header render failed:", error);
    }

    try {
      railMarkup = renderRail(page, session, workspace);
    } catch (error) {
      console.error("Right rail render failed:", error);
    }

    try {
      demoMarkup = renderDemoAssistantShell(workspace);
    } catch (error) {
      console.error("Demo shell render failed:", error);
    }

    try {
      aiMarkup = renderAiAssistantShell(session, workspace);
    } catch (error) {
      console.error("AI shell render failed:", error);
    }

    try {
      mobileMarkup = renderMobileDock(page, session);
    } catch (error) {
      console.error("Mobile dock render failed:", error);
    }

    root.innerHTML = [
      headerMarkup,
      renderSyncBanner(),
      '<div class="rf-layout">',
      '<main id="portalMain" class="main-stack" tabindex="-1">',
      pageMarkup,
      "</main>",
      railMarkup,
      "</div>",
      demoMarkup,
      aiMarkup,
      mobileMarkup,
      renderToastStack()
    ].join("");

    document.body.classList.remove("rf-sidebar-open");
    document.body.classList.toggle("rf-ai-open", !!AI_RUNTIME.drawerOpen || !!DEMO_RUNTIME.drawerOpen);
    bindEvents(root, page, session);
    syncPendingSearchAnchor();
    ensureInteractiveTestIds(document);
  }

  function renderSyncBanner() {
    const sync = getSyncStatus();
    if (!sync || !sync.message) {
      return "";
    }
    const state = safeText(sync.state || "idle", 20).toLowerCase();
    const queuedItems = loadOfflineQueue();
    if (state === "queued" && navigator.onLine && !queuedItems.length) {
      return "";
    }
    if ((state === "synced" || state === "local") && !queuedItems.length) {
      return "";
    }
    const message = state === "queued" && queuedItems.length
      ? "Workspace changes are queued for sync (" + String(queuedItems.length) + ")."
      : sync.message;
    return '<div class="rf-sync-banner rf-sync-banner-' + escapeHtml(state || "idle") + '" data-testid="sync-status-banner"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(state === "error" ? "error" : state === "queued" ? "schedule" : state === "syncing" ? "sync" : "cloud_done") + '</span><span>' + escapeHtml(message) + "</span></div>";
  }

  function renderToastStack() {
    const items = loadToasts();
    TOAST_RUNTIME.items = items;
    if (!items.length) {
      return "";
    }
    return '<div class="rf-toast-stack" data-testid="toast-stack">' + items.map(function (item) {
      return '<article class="rf-toast rf-toast-' + escapeHtml(item.type || "info") + '"><div class="rf-toast-copy"><strong>' + escapeHtml(item.title || "ResourceFlow") + '</strong><p>' + escapeHtml(item.message || "") + '</p></div><button class="rf-toast-close" type="button" data-action="dismiss-toast" data-toast-id="' + escapeHtml(item.id) + '" aria-label="Dismiss notification">×</button></article>';
    }).join("") + "</div>";
  }

  function loadLanguage() {
    const current = safeText(localStorage.getItem(LANGUAGE_KEY) || "en", 20).toLowerCase();
    return LANGUAGE_OPTIONS.some(function (item) { return item.value === current; }) ? current : "en";
  }

  function saveLanguage(value) {
    localStorage.setItem(LANGUAGE_KEY, safeText(value || "en", 20).toLowerCase());
  }

  function copy(key, fallback) {
    const lang = loadLanguage();
    if (lang === "en") {
      return fallback;
    }
    const table = TRANSLATIONS[lang] || {};
    return safeText(table[key] || fallback, 240);
  }

  function renderLanguageSelect() {
    const current = loadLanguage();
    return [
      '<label class="language-select-shell">',
      '<span class="language-select-label">Language</span>',
      '<select class="text-select language-select" data-action="change-language" data-testid="change-language">',
      LANGUAGE_OPTIONS.map(function (option) {
        return '<option value="' + escapeHtml(option.value) + '"' + (option.value === current ? " selected" : "") + '>' + escapeHtml(option.label) + "</option>";
      }).join(""),
      "</select>",
      "</label>"
    ].join("");
  }

  function cloneScenarioItems(items) {
    return Array.isArray(items) ? items.map(function (item) {
      return Object.assign({}, item);
    }) : [];
  }

  function requestPriorityRank(request) {
    const source = safeText(request && request.source, 40).toLowerCase();
    const base = source === "live"
      ? LIVE_PRIORITY_RANK
      : source === "disaster-demo"
        ? DISASTER_PRIORITY_RANK
        : STANDARD_PRIORITY_RANK;
    return base + Math.round(priorityScore(request && request.priority) * 100) + Math.min(40, Number(request && request.beneficiaries || 0) / 10);
  }

  function sortRequestsForLifecycle(items) {
    return items.slice().sort(function (left, right) {
      return requestPriorityRank(right) - requestPriorityRank(left)
        || parseTimestamp(right.createdAt || right.requestedAt) - parseTimestamp(left.createdAt || left.requestedAt)
        || priorityScore(right.priority) - priorityScore(left.priority);
    });
  }

  function sortAssignmentsForLifecycle(items) {
    return items.slice().sort(function (left, right) {
      const leftActive = isAssignmentActiveStage(left.status) ? 1 : 0;
      const rightActive = isAssignmentActiveStage(right.status) ? 1 : 0;
      return rightActive - leftActive
        || parseTimestamp(right.updatedAt || right.startedAt || right.acceptedAt) - parseTimestamp(left.updatedAt || left.startedAt || left.acceptedAt)
        || Number(right.points || 0) - Number(left.points || 0);
    });
  }

  function sortDonationsForLifecycle(items) {
    return items.slice().sort(function (left, right) {
      return parseTimestamp(right.createdAt || right.updatedAt) - parseTimestamp(left.createdAt || left.updatedAt);
    });
  }

  function isRequestCompleteStage(stage) {
    const normalized = normalizeRequestStatus(stage);
    return normalized === "Delivered" || normalized === "Closed";
  }

  function isRequestPendingStage(stage) {
    const normalized = normalizeRequestStatus(stage);
    return normalized === "Pending" || normalized === "Reviewed";
  }

  function isAssignmentCompleteStage(stage) {
    return normalizeAssignmentStatus(stage) === "Completed";
  }

  function isAssignmentActiveStage(stage) {
    const normalized = normalizeAssignmentStatus(stage);
    return normalized === "Accepted" || normalized === "In Progress";
  }

  function normalizedAvailability(value) {
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

  function isVolunteerAvailable(volunteer) {
    return /available|active|on call|full day|half day|evening|weekend/.test(normalizedAvailability(volunteer && volunteer.availability));
  }

  function inferTaskComplexity(priority) {
    const normalized = safeText(priority, 40).toLowerCase();
    if (normalized.indexOf("critical") !== -1 || normalized.indexOf("high") !== -1) return "High";
    if (normalized.indexOf("medium") !== -1) return "Medium";
    return "Low";
  }

  function estimatedDurationMinutes(priority, source) {
    const complexity = inferTaskComplexity(priority);
    if (complexity === "High") {
      return safeText(source, 40).toLowerCase() === "live" ? 16 : 12;
    }
    if (complexity === "Medium") {
      return safeText(source, 40).toLowerCase() === "live" ? 20 : 15;
    }
    return safeText(source, 40).toLowerCase() === "live" ? 24 : 18;
  }

  function computeTaskPoints(priority, shiftCount) {
    const complexity = inferTaskComplexity(priority);
    const base = complexity === "High" ? 32 : complexity === "Medium" ? 22 : 14;
    return Math.max(8, base - Math.min(8, Number(shiftCount || 0) * 2));
  }

  function demoCycleId() {
    return "demo-" + String(nowMs());
  }

  function randomizeLocationLabel(district, fallbackLocation) {
    const options = DEMO_LOCATION_HINTS[safeText(district, 80)] || DEMO_LOCATION_HINTS.Default;
    const label = randomFrom(options) || fallbackLocation || district || "Relief Point";
    return district && label.toLowerCase().indexOf(String(district).toLowerCase()) === -1
      ? label + ", " + district
      : label;
  }

  function buildShiftAuditLine(assignment, nextVolunteer, request) {
    return "AI shifted " + assignment.title + " to " + nextVolunteer.name + " because " + request.title + " crossed 50% of its estimated duration without completion.";
  }

  function buildVolunteerStatusLine(assignment, status) {
    return "Volunteer " + safeText(assignment && assignment.volunteer || "Assigned volunteer", 140) + " is currently " + safeText(status || normalizeAssignmentStatus(assignment && assignment.status), 60) + " on " + safeText(assignment && assignment.title || "the active task", 180) + ".";
  }

  function enrichWorkspace(workspace) {
    const next = workspace && typeof workspace === "object" ? workspace : {};
    const requests = cloneScenarioItems(next.requests || []).map(function (item, index) {
      const source = safeText(item.source || item.origin || (next.scenario && next.scenario !== "none" ? "disaster-demo" : "live"), 40).toLowerCase();
      const status = normalizeRequestStatus(item.status || item.priority || "Pending");
      const createdAt = safeText(item.createdAt || item.requestedAt || item.date || nowIso(), 80);
      return Object.assign({}, item, {
        id: safeText(item.id || ("REQ-" + String(index + 100)), 80),
        status: status,
        priority: safeText(item.priority || "Medium", 40),
        requestedAt: safeText(item.requestedAt || createdAt, 80),
        createdAt: createdAt,
        updatedAt: safeText(item.updatedAt || createdAt, 80),
        requester: safeText(item.requester || "Community Network", 120),
        blocked: Boolean(item.blocked),
        source: source === "demo" ? "disaster-demo" : source,
        origin: safeText(item.origin || (source === "live" ? "live" : "demo"), 20).toLowerCase() || "demo",
        priorityLane: safeText(item.priorityLane || (source === "live" ? "Live" : source === "disaster-demo" ? "Disaster Demo" : "Standard"), 40),
        broadcastTo: Array.isArray(item.broadcastTo) && item.broadcastTo.length ? item.broadcastTo.slice() : ["admin", "government"],
        complexity: inferTaskComplexity(item.priority || "Medium"),
        estimatedDurationMinutes: Number(item.estimatedDurationMinutes || estimatedDurationMinutes(item.priority || "Medium", source))
      });
    });
    const assignments = cloneScenarioItems(next.assignments || []).map(function (item, index) {
      const inferredRequest = requests.find(function (request) {
        return safeText(request.location, 140).toLowerCase() === safeText(item.location, 140).toLowerCase()
          || (safeText(request.district, 80).toLowerCase() === safeText(item.district, 80).toLowerCase()
            && safeText(request.title, 140).toLowerCase().indexOf(safeText(item.title, 140).toLowerCase().slice(0, 12)) >= 0);
      });
      const createdAt = safeText(item.createdAt || item.assignedAt || item.updatedAt || nowIso(), 80);
      const normalizedStatus = normalizeAssignmentStatus(item.status || "Accepted");
      return Object.assign({}, item, {
        id: safeText(item.id || ("ASG-" + String(index + 300)), 80),
        requestId: safeText(item.requestId || (inferredRequest && inferredRequest.id) || "", 80),
        status: normalizedStatus,
        createdAt: createdAt,
        updatedAt: safeText(item.updatedAt || createdAt, 80),
        acceptedAt: safeText(item.acceptedAt || createdAt, 80),
        startedAt: safeText(item.startedAt || (normalizedStatus === "In Progress" || normalizedStatus === "Completed" ? createdAt : ""), 80),
        completedAt: safeText(item.completedAt || (normalizedStatus === "Completed" ? createdAt : ""), 80),
        origin: safeText(item.origin || (inferredRequest && inferredRequest.origin) || "demo", 20).toLowerCase() || "demo",
        volunteerOrigin: safeText(item.volunteerOrigin || "demo", 20).toLowerCase() || "demo",
        estimatedDurationMinutes: Number(item.estimatedDurationMinutes || ((inferredRequest && inferredRequest.estimatedDurationMinutes) || estimatedDurationMinutes(inferredRequest && inferredRequest.priority, inferredRequest && inferredRequest.source))),
        shiftCount: Number(item.shiftCount || 0),
        shifted: Boolean(item.shifted),
        pointsAwarded: Boolean(item.pointsAwarded || normalizedStatus === "Completed")
      });
    });
    const volunteers = cloneScenarioItems(next.volunteers || []).map(function (item, index) {
      const completedTasks = Number(item.completedTasks || 0);
      const pointsEarned = Number(item.pointsEarned || 0);
      return Object.assign({}, item, {
        id: safeText(item.id || ("VOL-" + String(index + 1)), 80),
        ngo: safeText(item.ngo || item.ngoGroup || "Relief Network", 120),
        reliability: Number(item.reliability || computeVolunteerReliability(item, assignments)),
        completedTasks: completedTasks,
        pointsEarned: pointsEarned,
        attendanceDays: Number(item.attendanceDays || completedTasks || 0),
        origin: safeText(item.origin || "demo", 20).toLowerCase() || "demo",
        activityStatus: safeText(item.activityStatus || normalizedAvailability(item.availability || "available"), 40),
        availability: safeText(item.availability || capitalizeWord(normalizedAvailability(item.activityStatus || "available")), 40)
      });
    });
    const donations = cloneScenarioItems(next.donations || []).map(function (item, index) {
      return Object.assign({}, item, {
        id: safeText(item.id || ("DON-" + String(index + 1)), 80),
        status: normalizeDonationLifecycle(item.status || "Submitted"),
        createdAt: safeText(item.createdAt || item.updatedAt || nowIso(), 80),
        updatedAt: safeText(item.updatedAt || item.createdAt || nowIso(), 80),
        origin: safeText(item.origin || (next.scenario && next.scenario !== "none" ? "demo" : "live"), 20).toLowerCase() || "demo"
      });
    });
    return {
      scenario: safeText(next.scenario || "none", 40).toLowerCase(),
      label: safeText(next.label || EMPTY_WORKSPACE.label, 120),
      summary: safeText(next.summary || EMPTY_WORKSPACE.summary, 280),
      requests: sortRequestsForLifecycle(requests),
      assignments: sortAssignmentsForLifecycle(assignments),
      volunteers: volunteers,
      donations: sortDonationsForLifecycle(donations),
      audit: cloneScenarioItems(next.audit || []),
      outreach: cloneScenarioItems(next.outreach || []),
      systemNotice: safeText(next.systemNotice || EMPTY_WORKSPACE.systemNotice, 280),
      generatedAt: safeText(next.generatedAt || nowIso(), 80),
      lastRefreshedAt: safeText(next.lastRefreshedAt || next.generatedAt || nowIso(), 80),
      lastAutomationAt: safeText(next.lastAutomationAt || "", 80),
      demoCycleId: safeText(next.demoCycleId || "", 80)
    };
  }

  function normalizeAssignmentStatus(status) {
    const normalized = safeText(status, 40).toLowerCase();
    if (!normalized) return "Accepted";
    if (normalized.indexOf("complete") !== -1 || normalized.indexOf("deliver") !== -1 || normalized.indexOf("closed") !== -1) return "Completed";
    if (normalized.indexOf("progress") !== -1 || normalized.indexOf("active") !== -1) return "In Progress";
    if (normalized.indexOf("accept") !== -1 || normalized.indexOf("assign") !== -1 || normalized.indexOf("queue") !== -1) return "Accepted";
    return "Accepted";
  }

  function normalizeDonationLifecycle(status) {
    const normalized = safeText(status, 40).toLowerCase();
    if (!normalized) return "Submitted";
    if (normalized.indexOf("deliver") !== -1 || normalized.indexOf("complete") !== -1) return "Delivered";
    if (normalized.indexOf("dispatch") !== -1 || normalized.indexOf("schedule") !== -1) return "Dispatched";
    if (normalized.indexOf("pack") !== -1 || normalized.indexOf("receive") !== -1) return "Packed";
    if (normalized.indexOf("review") !== -1 || normalized.indexOf("verif") !== -1) return "Verified";
    return "Submitted";
  }

  function computeVolunteerReliability(volunteer, assignments) {
    const name = safeText(volunteer && volunteer.name, 120).toLowerCase();
    const related = assignments.filter(function (item) {
      return safeText(item.volunteer, 120).toLowerCase() === name;
    });
    if (!related.length) {
      return 72;
    }
    const delivered = related.filter(function (item) {
      return normalizeAssignmentStatus(item.status) === "Completed";
    }).length;
    return Math.max(68, Math.min(98, 70 + delivered * 9 + Math.max(0, related.length - delivered) * 3));
  }

  function normalizeRequestStatus(status) {
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

  function renderHeader(page, session, workspace) {
    const roleData = ROLE_CONFIG[session.role] || ROLE_CONFIG.user;
    const searchQuery = safeText(SEARCH_RUNTIME.query, 160);
    const searchResults = (SEARCH_RUNTIME.searched || SEARCH_RUNTIME.focused) && searchQuery
      ? buildWorkspaceSearchResults(searchQuery, session, workspace)
      : [];
    return [
      '<header class="rf-header">',
      '<div class="rf-header-main">',
      '<a class="rf-brand" href="./index.html" data-testid="brand-home">',
      '<span class="rf-brand-mark">RF</span>',
      '<span class="rf-brand-copy"><strong>ResourceFlow</strong><small>Management Console</small></span>',
      "</a>",
      renderPortalLauncher(session, page),
      "</div>",
      '<div class="rf-header-actions">',
      '<div class="rf-search-stack">',
      '<form class="rf-search-shell" data-search-form role="search" autocomplete="off">',
      '<span class="rf-symbol" aria-hidden="true">search</span>',
      '<input class="rf-search-input" type="search" name="search" value="' + escapeHtml(searchQuery) + '" placeholder="' + escapeHtml(copy("searchPlaceholder", "Search requests, volunteers, donations...")) + '" aria-label="Search workspace" data-testid="header-search">',
      (searchQuery
        ? '<button class="search-clear-button" type="button" data-action="clear-search" data-testid="clear-header-search" aria-label="Clear search"><span class="rf-symbol" aria-hidden="true">close</span></button>'
        : ""),
      "</form>",
      renderHeaderSearchResults(searchQuery, searchResults),
      "</div>",
      '<div class="rf-header-toolset">',
      '<div class="rf-header-chip">' + escapeHtml(roleData.label) + '</div>',
      renderLanguageSelect(),
      '<button class="ghost-button theme-toggle header-theme-button" type="button" data-action="toggle-theme" data-testid="toggle-theme"><span class="button-full-label">' + escapeHtml(themeToggleLabel()) + '</span><span class="button-short-label">Theme</span></button>',
      '<button class="ghost-button header-switch-button" type="button" data-action="switch-portal" data-testid="switch-portal">' + escapeHtml(copy("switchPortal", "Switch Portal")) + '</button>',
      '<button class="primary-button header-signout-button" type="button" data-action="signout" data-testid="sign-out">' + escapeHtml(copy("signOut", "Sign Out")) + '</button>',
      "</div>",
      "</div>",
      "</header>"
    ].join("");
  }

  function renderHeaderSearchResults(query, results) {
    const recentSearches = loadRecentSearches();
    const showingSuggestions = SEARCH_RUNTIME.focused && !SEARCH_RUNTIME.searched;
    if (!query && !SEARCH_RUNTIME.focused) {
      return "";
    }
    if (!query && recentSearches.length) {
      return [
        '<div class="rf-search-results" data-testid="header-search-results">',
        '<div class="rf-search-results-copy">',
        '<p class="section-label">Recent searches</p>',
        '<p class="section-copy">Pick up where you left off.</p>',
        "</div>",
        '<div class="rf-search-recent-list">',
        recentSearches.map(function (item, index) {
          return '<button class="rf-search-recent" type="button" data-action="recent-search" data-query="' + escapeHtml(item) + '" data-testid="header-recent-search-' + escapeHtml(String(index)) + '">' + escapeHtml(item) + "</button>";
        }).join(""),
        "</div>",
        "</div>"
      ].join("");
    }
    if (!results.length && (SEARCH_RUNTIME.searched || showingSuggestions)) {
      return [
        '<div class="rf-search-results is-empty" data-testid="header-search-results">',
        '<p class="section-label">' + escapeHtml(SEARCH_RUNTIME.searched ? "Search Results" : "Suggestions") + '</p>',
        '<div class="rf-search-empty-state">',
        '<strong>Not found</strong>',
        '<p>No matches for "' + escapeHtml(query) + '". Try a volunteer name, request title, donor, district, or category.</p>',
        "</div>",
        "</div>"
      ].join("");
    }
    if (!results.length) {
      return "";
    }
    return [
      '<div class="rf-search-results" data-testid="header-search-results">',
      '<div class="rf-search-results-copy">',
      '<p class="section-label">' + escapeHtml(SEARCH_RUNTIME.searched ? "Search Results" : "Suggestions") + '</p>',
      '<p class="section-copy">' + (SEARCH_RUNTIME.searched
        ? ('Showing ' + escapeHtml(String(results.length)) + ' match(es) for "' + escapeHtml(query) + '".')
        : ('Top matches for "' + escapeHtml(query) + '". Press Enter to search or choose one result.')) + "</p>",
      "</div>",
      '<div class="rf-search-results-list">',
      results.map(function (result, index) {
        return [
          '<a class="rf-search-result" href="' + escapeHtml(result.href) + '" data-testid="header-search-result-' + escapeHtml(String(index)) + '" data-search-page="' + escapeHtml(result.pageKey || "") + '" data-search-anchor="' + escapeHtml(result.anchor || "") + '" data-search-exact="' + escapeHtml(result.exact ? "true" : "false") + '">',
          '<span class="chip">' + escapeHtml(result.kind) + "</span>",
          '<strong>' + escapeHtml(result.title) + "</strong>",
          result.meta ? '<small>' + escapeHtml(result.meta) + "</small>" : "",
          result.summary ? '<span class="rf-search-result-summary">' + escapeHtml(result.summary) + "</span>" : "",
          '<span class="rf-search-result-action">' + escapeHtml(result.actionLabel) + "</span>",
          "</a>"
        ].join("");
      }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function loadRecentSearches() {
    const saved = loadJson(RECENT_SEARCHES_KEY, []);
    return Array.isArray(saved) ? saved.filter(Boolean).slice(0, 6) : [];
  }

  function saveRecentSearch(query) {
    const text = safeText(query, 160);
    if (!text) {
      return;
    }
    const next = [text].concat(loadRecentSearches().filter(function (item) {
      return normalizeSearchQuery(item) !== normalizeSearchQuery(text);
    })).slice(0, 6);
    saveJson(RECENT_SEARCHES_KEY, next);
  }

  function buildWorkspaceSearchResults(query, session, workspace) {
    const normalizedQuery = normalizeSearchQuery(query);
    const results = [];
    if (!normalizedQuery) {
      return results;
    }

    const profiles = loadJson(PORTAL_PROFILE_KEY, {});
    const portalProfile = profiles && typeof profiles === "object" ? profiles : {};

    function pushResult(result, fields) {
      const score = scoreSearchFields(normalizedQuery, fields);
      if (!score) {
        return;
      }
      results.push(Object.assign({ score: score }, result));
    }

    pushResult({
      kind: "Profile",
      title: session.name || "Signed-in user",
      meta: session.email || (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label,
      summary: "Open your current portal workspace.",
      actionLabel: "Open current portal",
      href: homeRouteForRole(session.role)
    }, [
      session.name,
      session.email,
      session.profile && session.profile.fullName,
      session.profile && session.profile.displayName,
      session.profile && session.profile.primarySummary,
      session.profile && session.profile.ngoGroup
    ]);

    Object.keys(portalProfile).forEach(function (roleKey) {
      const profile = portalProfile[roleKey];
      if (!profile || typeof profile !== "object") {
        return;
      }
      const anchor = buildAnchorId("volunteer", profile.id || profile.fullName || profile.displayName || roleKey);
      pushResult({
        kind: "Volunteer",
        title: safeText(profile.fullName || profile.displayName || "Volunteer profile", 120),
        meta: safeText(profile.ngoGroup || profile.location || ROLE_CONFIG[roleKey] && ROLE_CONFIG[roleKey].label || "Profile", 160),
        summary: safeText(joinSkills(profile.skills) || profile.email || profile.phone || "Shared volunteer profile", 220),
        actionLabel: "Open Volunteer Directory",
        href: pageHref("directory", anchor),
        pageKey: "directory",
        anchor: anchor,
        exact: scoreSearchFields(normalizedQuery, [profile.fullName, profile.displayName]) >= 140
      }, [
        profile.fullName,
        profile.displayName,
        profile.ngoGroup,
        joinSkills(profile.skills),
        profile.location,
        profile.email,
        profile.phone
      ]);
    });

    workspace.volunteers.forEach(function (volunteer) {
      const anchor = buildAnchorId("volunteer", volunteer.id || volunteer.name);
      pushResult({
        kind: "Volunteer",
        title: safeText(volunteer.name, 120),
        meta: safeText([volunteer.ngo, volunteer.location].filter(Boolean).join(" · "), 160),
        summary: safeText(joinSkills(volunteer.skills) + (volunteer.contact ? " · " + volunteer.contact : ""), 220),
        actionLabel: "Open Volunteer Directory",
        href: pageHref("directory", anchor),
        pageKey: "directory",
        anchor: anchor,
        exact: scoreSearchFields(normalizedQuery, [volunteer.name, volunteer.ngo, volunteer.contact]) >= 140
      }, [
        volunteer.name,
        volunteer.ngo,
        joinSkills(volunteer.skills),
        volunteer.location,
        volunteer.contact,
        volunteer.availability
      ]);
    });

    workspace.requests.forEach(function (request) {
      const anchor = buildAnchorId("request", request.id || request.title);
      pushResult({
        kind: "Request",
        title: safeText(request.title, 140),
        meta: safeText([request.category, request.district, normalizeRequestStatus(request.status)].filter(Boolean).join(" · "), 180),
        summary: safeText(request.summary || request.location || "Open the request tracker", 220),
        actionLabel: "Open Community Portal",
        href: pageHref("community", anchor),
        pageKey: "community",
        anchor: anchor,
        exact: scoreSearchFields(normalizedQuery, [request.title, request.id, request.requester]) >= 140
      }, [
        request.title,
        request.category,
        request.district,
        request.location,
        request.summary,
        request.requester,
        request.priority,
        request.status
      ]);
    });

    workspace.assignments.forEach(function (assignment) {
      const anchor = buildAnchorId("assignment", assignment.id || assignment.title);
      pushResult({
        kind: "Assignment",
        title: safeText(assignment.title, 140),
        meta: safeText([assignment.volunteer, assignment.district, normalizeAssignmentStatus(assignment.status)].filter(Boolean).join(" · "), 180),
        summary: safeText(assignment.location || assignment.date || "Open the assignment board", 220),
        actionLabel: "Open Volunteer Portal",
        href: pageHref("volunteer", anchor),
        pageKey: "volunteer",
        anchor: anchor,
        exact: scoreSearchFields(normalizedQuery, [assignment.title, assignment.id, assignment.volunteer]) >= 140
      }, [
        assignment.title,
        assignment.volunteer,
        assignment.district,
        assignment.location,
        assignment.status,
        assignment.date
      ]);
    });

    workspace.donations.forEach(function (donation) {
      const anchor = buildAnchorId("donation", donation.id || donation.donor || donation.donorName);
      pushResult({
        kind: "Donation",
        title: safeText(donation.donor || "Donation record", 120),
        meta: safeText([donation.kind === "money" ? "Money" : donation.itemType || "Item", formatDonationLine(donation), normalizeDonationLifecycle(donation.status)].filter(Boolean).join(" · "), 180),
        summary: safeText(donation.note || donation.description || donation.contactDetails || "Open the donation portal", 220),
        actionLabel: "Open Donation Portal",
        href: pageHref("donations", anchor),
        pageKey: "donations",
        anchor: anchor,
        exact: scoreSearchFields(normalizedQuery, [donation.donor, donation.donorName, donation.id, donation.contactDetails]) >= 140
      }, [
        donation.donor,
        donation.kind,
        donation.itemType,
        donation.paymentMethod,
        donation.description,
        donation.note,
        donation.contactDetails,
        donation.status
      ]);
    });

    SIDEBAR_ITEMS.forEach(function (item) {
      pushResult({
        kind: "Portal",
        title: item.label,
        meta: item.caption,
        summary: "Open the " + item.shortLabel + " workspace.",
        actionLabel: "Open portal",
        href: item.href,
        pageKey: item.key,
        exact: scoreSearchFields(normalizedQuery, [item.label, item.shortLabel, item.key]) >= 140
      }, [
        item.label,
        item.shortLabel,
        item.caption,
        item.key
      ]);
    });

    return results
      .sort(function (left, right) {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return safeText(left.title, 160).localeCompare(safeText(right.title, 160));
      })
      .filter(function (result, index, list) {
        return list.findIndex(function (item) {
          return item.kind === result.kind && item.title === result.title && item.href === result.href;
        }) === index;
      })
      .slice(0, 8);
  }

  function normalizeSearchQuery(value) {
    return safeText(value, 160).toLowerCase().replace(/\s+/g, " ").trim();
  }

  function scoreSearchFields(query, fields) {
    const terms = query.split(" ").filter(Boolean);
    let bestScore = 0;
    (fields || []).forEach(function (field, index) {
      const text = normalizeSearchQuery(field);
      if (!text) {
        return;
      }
      if (text === query) {
        bestScore = Math.max(bestScore, 140 - index);
      } else if (text.indexOf(query) === 0) {
        bestScore = Math.max(bestScore, 112 - index);
      } else if (text.indexOf(query) !== -1) {
        bestScore = Math.max(bestScore, 92 - index);
      }
      const matchedTerms = terms.filter(function (term) {
        return text.indexOf(term) !== -1;
      }).length;
      if (matchedTerms === terms.length) {
        bestScore = Math.max(bestScore, 72 + matchedTerms * 4 - index);
      }
    });
    return bestScore;
  }

  function slugifyToken(value) {
    return safeText(value, 160)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "item";
  }

  function buildAnchorId(prefix, value) {
    return "rf-" + slugifyToken(prefix) + "-" + slugifyToken(value);
  }

  function pageHref(pageKey, anchor) {
    const item = SIDEBAR_ITEMS.find(function (entry) {
      return entry.key === pageKey;
    });
    const base = item ? item.href : "./community.html";
    return anchor ? base + "#" + encodeURIComponent(anchor) : base;
  }

  function currentPageHref(pageKey, anchor) {
    const activePath = safeText(window.location.pathname || "", 240).toLowerCase();
    const target = pageHref(pageKey, anchor);
    const targetPath = safeText(target.split("#")[0] || "", 240).toLowerCase();
    return activePath.endsWith(targetPath.replace("./", "/"));
  }

  function flashSearchTarget(target) {
    if (!target) {
      return;
    }
    target.classList.add("is-search-hit");
    window.clearTimeout(target.__rfSearchTimeout);
    target.__rfSearchTimeout = window.setTimeout(function () {
      target.classList.remove("is-search-hit");
    }, 1800);
  }

  function jumpToAnchor(anchor, options) {
    const targetId = safeText(anchor, 120);
    if (!targetId) {
      return false;
    }
    const target = document.getElementById(targetId);
    if (!target) {
      return false;
    }
    target.scrollIntoView({
      behavior: options && options.instant ? "auto" : "smooth",
      block: "start"
    });
    flashSearchTarget(target);
    try {
      window.history.replaceState(null, "", "#" + encodeURIComponent(targetId));
    } catch (error) {
      window.location.hash = targetId;
    }
    return true;
  }

  function syncPendingSearchAnchor() {
    const rawHash = safeText(window.location.hash || "", 180).replace(/^#/, "");
    if (!rawHash) {
      return;
    }
    const targetId = decodeURIComponent(rawHash);
    window.setTimeout(function () {
      jumpToAnchor(targetId, { instant: true });
    }, 90);
  }

  function buildLauncherNavigationItems(session, page) {
    return LAUNCHER_NAV_ORDER.map(function (key) {
      return SIDEBAR_ITEMS.find(function (item) { return item.key === key; }) || null;
    }).filter(Boolean).map(function (item) {
      const allowed = item.roles.indexOf(session.role) !== -1;
      const active = item.key === page;
      return [
        '<a class="portal-launcher-shortcut',
        active ? " is-active" : "",
        allowed ? "" : " is-locked",
        '" href="' + escapeHtml(allowed ? item.href : "#") + '"',
        allowed ? "" : ' data-locked="true"',
        ' data-testid="portal-shortcut-' + escapeHtml(item.key) + '">',
        '<span class="portal-launcher-shortcut-icon"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(item.icon) + "</span></span>",
        '<span class="portal-launcher-shortcut-copy"><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(item.caption) + "</small></span>",
        '<span class="portal-launcher-state">' + escapeHtml(active ? "Open" : (allowed ? "Go" : "Locked")) + "</span>",
        "</a>"
      ].join("");
    }).join("");
  }

  function buildCompactLauncherNavigationItems(session, page) {
    return LAUNCHER_NAV_ORDER.map(function (key) {
      return SIDEBAR_ITEMS.find(function (item) { return item.key === key; }) || null;
    }).filter(Boolean).map(function (item) {
      const allowed = item.roles.indexOf(session.role) !== -1;
      const active = item.key === page;
      return [
        '<a class="portal-launcher-mini',
        active ? " is-active" : "",
        allowed ? "" : " is-locked",
        '" href="' + escapeHtml(allowed ? item.href : "#") + '"',
        allowed ? "" : ' data-locked="true"',
        ' data-testid="portal-mini-' + escapeHtml(item.key) + '">',
        '<span class="portal-launcher-mini-icon"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(item.icon) + "</span></span>",
        '<span class="portal-launcher-mini-copy"><strong>' + escapeHtml(item.shortLabel || item.label) + '</strong><small>' + escapeHtml(active ? "Open" : (allowed ? "Go" : "Locked")) + "</small></span>",
        "</a>"
      ].join("");
    }).join("");
  }

  function buildUsageGuardCards() {
    const guard = window.ResourceFlowUsageGuard;
    if (!guard || typeof guard.preview !== "function") {
      return '<div class="empty-box">Usage guard is not available in this workspace.</div>';
    }
    const metrics = [
      { key: "reads", label: "Reads", suffix: "/day" },
      { key: "writes", label: "Writes", suffix: "/day" },
      { key: "deletes", label: "Deletes", suffix: "/day" },
      { key: "hostingDownloadsMbPerDay", label: "Downloads", suffix: " MB/day" },
      { key: "bandwidthMbPerMonth", label: "Bandwidth", suffix: " MB/month" }
    ];
    return metrics.map(function (metric) {
      const preview = guard.preview(metric.key, 0);
      const value = metric.key.indexOf("Mb") !== -1
        ? (Math.round(Number(preview.current || 0) * 10) / 10) + metric.suffix
        : String(preview.current || 0) + metric.suffix;
      const limit = metric.key.indexOf("Mb") !== -1
        ? (Math.round(Number(preview.limit || 0) * 10) / 10) + metric.suffix
        : String(preview.limit || 0) + metric.suffix;
      return '<article class="feed-card usage-guard-card"><div class="feed-card-head"><div><strong>' + escapeHtml(metric.label) + '</strong><p class="feed-meta">' + escapeHtml(value) + " of " + escapeHtml(limit) + '</p></div>' + renderStatus(preview.state === "blocked" ? "Paused" : (preview.state === "warning" ? "Warning" : "Safe")) + '</div><p class="card-copy">' + escapeHtml(preview.message || "Usage is inside the Firebase no-cost guard.") + '</p></article>';
    }).join("");
  }

  function buildAiActionHistory(workspace) {
    return (workspace.audit || []).filter(function (entry) {
      const line = safeText(entry, 240);
      return /^ai\b/i.test(line) || /gemini/i.test(line) || /recommended next move/i.test(line);
    }).slice(0, 6).map(function (entry) {
      return {
        title: "AI action",
        meta: "Workspace audit",
        status: "Active",
        copy: safeText(entry, 260)
      };
    });
  }

  function buildRequestTimelineCards(workspace) {
    return (workspace.requests || []).slice(0, 4).map(function (request) {
      const linkedAssignments = (workspace.assignments || []).filter(function (assignment) {
        return assignment.requestId === request.id;
      });
      const latestAssignment = linkedAssignments[0] || null;
      return {
        id: buildAnchorId("timeline", request.id),
        title: request.title,
        meta: request.district + " · " + normalizeRequestStatus(request.status),
        status: normalizeRequestStatus(request.status),
        assignment: latestAssignment ? (latestAssignment.volunteer + " · " + normalizeAssignmentStatus(latestAssignment.status)) : "No volunteer linked yet",
        copy: request.summary || "Timeline details are visible once the request enters the lifecycle."
      };
    });
  }

  function renderRequestTimelineCards(workspace) {
    const cards = buildRequestTimelineCards(workspace);
    if (!cards.length) {
      return '<div class="empty-box">Request timelines appear after requests enter the active workspace.</div>';
    }
    return cards.map(function (item) {
      return '<article id="' + escapeHtml(item.id) + '" class="feed-card timeline-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div>' + renderStatus(item.status) + '</div>' + renderStepper(item.status) + '<p class="card-copy"><strong>Assignment:</strong> ' + escapeHtml(item.assignment) + '</p><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("");
  }

  function buildNextVolunteerSuggestion(session, workspace) {
    const topRequest = (workspace.requests || []).slice().sort(function (left, right) {
      return priorityScore(right.priority) - priorityScore(left.priority);
    })[0];
    if (!topRequest) {
      return {
        title: "No live request yet",
        meta: "AI volunteer suggestion",
        status: "Waiting",
        copy: "Load a scenario or submit a request so the copilot can suggest the best next volunteer."
      };
    }
    const volunteerPool = (workspace.volunteers || []).filter(function (item) {
      return normalizeSearchQuery(item.activityStatus || item.availability || "available").indexOf("inactive") === -1;
    });
    const topSkill = normalizeSearchQuery(topRequest.category || topRequest.title || "");
    const match = volunteerPool.slice().sort(function (left, right) {
      const leftScore = (normalizeSearchQuery((left.skills || []).join(" ")).indexOf(topSkill) !== -1 ? 3 : 0) + Number(left.reliability || 0) / 100;
      const rightScore = (normalizeSearchQuery((right.skills || []).join(" ")).indexOf(topSkill) !== -1 ? 3 : 0) + Number(right.reliability || 0) / 100;
      return rightScore - leftScore;
    })[0];
    if (!match) {
      return {
        title: "No available volunteer found",
        meta: topRequest.district + " · " + topRequest.title,
        status: "Pending",
        copy: "The copilot can see the top request, but there is no available volunteer in the visible pool right now."
      };
    }
    return {
      title: match.name + " is the next best volunteer",
      meta: topRequest.district + " · " + topRequest.title,
      status: "Recommended",
      copy: "This volunteer is being suggested because the visible skill set, reliability score, and current availability are the closest fit for the top request."
    };
  }

  function buildNextDistrictMove(workspace) {
    const summary = buildDistrictSummary(workspace)[0];
    if (!summary) {
      return {
        title: "No district pressure yet",
        meta: "District move suggestion",
        status: "Waiting",
        copy: "Load a scenario to surface the next district the operations board should move toward."
      };
    }
    return {
      title: summary.district + " should be moved first",
      meta: String(summary.requests) + " requests · " + String(summary.beneficiaries) + " beneficiaries",
      status: summary.status,
      copy: "The copilot is surfacing this district first because it combines the strongest visible request pressure, assignment demand, and beneficiary impact in the current story."
    };
  }

  function renderAiSuggestionCards(session, workspace) {
    return '<div class="feed-list">' + [
      buildNextVolunteerSuggestion(session, workspace),
      buildNextDistrictMove(workspace)
    ].map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div>' + renderStatus(item.status) + '</div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("") + '</div>';
  }

  function buildVolunteerRouteBundles(session, workspace) {
    const snapshot = buildVolunteerSnapshot(session, workspace);
    const items = (snapshot.activeTasks || []).slice();
    if (!items.length) {
      return [];
    }
    const grouped = {};
    items.forEach(function (assignment) {
      const key = safeText(assignment.district || "Unknown", 80);
      grouped[key] = grouped[key] || { district: key, tasks: [], locations: [] };
      grouped[key].tasks.push(assignment);
      if (assignment.location && grouped[key].locations.indexOf(assignment.location) < 0) {
        grouped[key].locations.push(assignment.location);
      }
    });
    return Object.keys(grouped).map(function (key) {
      const group = grouped[key];
      return {
        title: group.district,
        meta: String(group.tasks.length) + " nearby task(s)",
        status: group.tasks.some(function (task) { return normalizeAssignmentStatus(task.status) === "In Progress"; }) ? "In Progress" : "Accepted",
        copy: "These assignments are clustered so the volunteer lane can move through one district without extra routing delay.",
        locations: group.locations.slice(0, 4)
      };
    }).sort(function (left, right) {
      return right.locations.length - left.locations.length;
    });
  }

  function renderVolunteerRouteBundleCards(session, workspace) {
    const bundles = buildVolunteerRouteBundles(session, workspace);
    if (!bundles.length) {
      return '<div class="empty-box">Route bundles appear when the volunteer lane has nearby active assignments.</div>';
    }
    return bundles.map(function (bundle) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(bundle.title) + '</strong><p class="feed-meta">' + escapeHtml(bundle.meta) + '</p></div>' + renderStatus(bundle.status) + '</div><p class="card-copy">' + escapeHtml(bundle.copy) + '</p><div class="feed-chip-row">' + bundle.locations.map(function (location) { return '<span class="feed-chip">' + escapeHtml(location) + "</span>"; }).join("") + '</div></article>';
    }).join("");
  }

  function loadDraft(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveDraft(key, payload) {
    try {
      localStorage.setItem(key, JSON.stringify(payload || {}));
    } catch (error) {
      // Ignore local storage failures.
    }
  }

  function clearDraft(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Ignore local storage failures.
    }
  }

  function renderPortalLauncher(session, page) {
    const activeRole = normalizePortal(session.role) || "user";
    const activeItem = PORTAL_MENU_ITEMS.find(function (item) {
      return item.role === activeRole;
    }) || PORTAL_MENU_ITEMS[0];
    const navigationMarkup = buildCompactLauncherNavigationItems(session, page);
    return [
      '<details class="portal-launcher" data-testid="portal-launcher">',
      '<summary class="ghost-button portal-launcher-toggle" data-testid="portal-launcher-toggle" aria-label="Open portal switching menu">',
      '<span class="rf-symbol" aria-hidden="true">apps</span>',
      '<span class="portal-launcher-copy"><strong>' + escapeHtml(activeItem.label) + '</strong><small>Switch portal workspace</small></span>',
      '<span class="rf-symbol portal-launcher-caret" aria-hidden="true">expand_more</span>',
      "</summary>",
      '<button class="portal-launcher-backdrop" type="button" data-action="close-portal-launcher" aria-label="Close portal switching menu" tabindex="-1"></button>',
      '<div class="portal-launcher-menu" role="menu" aria-label="Portal switcher">',
      '<section class="portal-launcher-section">',
      '<p class="section-label">Switch Portal</p>',
      '<div class="portal-launcher-stack">',
      PORTAL_MENU_ITEMS.map(function (item) {
        const isActive = item.role === activeRole;
        return [
          '<button class="portal-launcher-item',
          isActive ? " is-active" : "",
          '" type="button"',
          ' data-action="switch-role"',
          ' data-role="' + escapeHtml(item.role) + '"',
          ' data-href="' + escapeHtml(item.href) + '"',
          ' data-testid="portal-menu-' + escapeHtml(item.role) + '"',
          ' role="menuitem">',
          '<span class="portal-launcher-icon"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(item.icon) + "</span></span>",
          '<span class="portal-launcher-meta"><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(item.caption) + "</small></span>",
          '<span class="portal-launcher-state">' + escapeHtml(isActive ? "Open" : "Go") + "</span>",
          "</button>"
        ].join("");
      }).join(""),
      "</div>",
      "</section>",
      navigationMarkup ? '<section class="portal-launcher-section"><p class="section-label">Navigation</p><div class="portal-launcher-grid">' + navigationMarkup + "</div></section>" : "",
      "</div>",
      "</details>"
    ].join("");
  }

  function renderHeaderNav(page, session) {
    return SIDEBAR_ITEMS.filter(function (item) {
      return item.roles.indexOf(session.role) !== -1;
    }).slice(0, 5).map(function (item) {
      const active = item.key === page;
      return '<a class="rf-top-link' + (active ? ' is-active' : '') + '" href="' + escapeHtml(item.href) + '" data-testid="top-nav-' + escapeHtml(item.key) + '">' + escapeHtml(item.shortLabel || item.label) + "</a>";
    }).join("");
  }

  function renderSidebar(page, session) {
    const roleData = ROLE_CONFIG[session.role] || ROLE_CONFIG.user;
    const nav = SIDEBAR_ITEMS.map(function (item) {
      const allowed = item.roles.indexOf(session.role) !== -1;
      const active = item.key === page;
      return [
        '<a class="tab-link',
        active ? " is-active" : "",
        allowed ? "" : " is-locked",
        '" href="' + (allowed ? escapeHtml(item.href) : "#") + '"',
        allowed ? "" : ' data-locked="true"',
        ' data-nav-target="' + escapeHtml(item.key) + '"',
        ' data-testid="nav-' + escapeHtml(item.key) + '">',
        '<span class="tab-icon"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(item.icon) + '</span></span>',
        '<span class="tab-copy"><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(item.caption) + '</small></span>',
        '<span class="tab-state">' + (allowed ? (active ? "Open" : "Go") : "Locked") + "</span>",
        "</a>"
      ].join("");
    }).join("");

    return [
      '<aside class="rf-sidebar">',
      '<section class="surface-card sidebar-brand-card">',
      '<p class="section-label">Portal View</p>',
      '<h2 class="session-name">ResourceFlow Control</h2>',
      '<p class="section-copy">A shared operating shell for community, volunteer, government, and admin response lanes.</p>',
      "</section>",
      '<section class="surface-card session-card">',
      '<p class="section-label">' + escapeHtml(copy("currentAccess", "Current Access")) + '</p>',
      '<h3 class="section-title">' + escapeHtml(roleData.label) + "</h3>",
      '<p class="section-copy">' + escapeHtml(session.summary) + "</p>",
      '<div class="chip-row">' + roleData.chips.map(function (chip) { return '<span class="chip">' + escapeHtml(chip) + "</span>"; }).join("") + "</div>",
      "</section>",
      '<section class="surface-card">',
      '<p class="section-label">' + escapeHtml(copy("navigation", "Navigation")) + '</p>',
      '<div class="space-nav">' + nav + "</div>",
      "</section>",
      '<section class="surface-card sidebar-profile-card">',
      '<p class="section-label">' + escapeHtml(copy("profile", "Profile")) + '</p>',
      '<h3 class="section-title">' + escapeHtml(session.name) + "</h3>",
      '<p class="section-copy">' + escapeHtml(session.email || "Signed-in workspace session") + "</p>",
      '<div class="chip-row">',
      '<span class="chip">' + escapeHtml(roleData.label) + "</span>",
      session.profile.primarySummary ? '<span class="chip">' + escapeHtml(session.profile.primarySummary) + "</span>" : "",
      "</div>",
      '<button class="ghost-button sidebar-footer-action" type="button" data-action="seed-demo" data-scenario="flood" data-testid="sidebar-load-demo">' + escapeHtml(copy("loadDemo", "Load Flood Demo")) + '</button>',
      "</section>",
      "</aside>"
    ].join("");
  }

  function renderRail(page, session, workspace) {
    const insightItems = buildInsightItems(workspace);
    const donations = workspace.donations.slice(0, 3);
    const topPrediction = buildBoostedPredictionRows(workspace)[0] || null;
    const notifications = buildNotifications(workspace, session);
    return [
      '<aside class="rf-rail right-stack">',
      '<section class="surface-card">',
      '<p class="section-label">' + escapeHtml(copy("quickActions", "Quick Actions")) + '</p>',
      '<h3 class="section-title">Fast workspace moves</h3>',
      '<div class="quick-actions">',
      '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="load-demo">' + escapeHtml(copy("loadDemo", "Load Demo")) + '</button>',
      '<button class="ghost-button" type="button" data-action="seed-demo" data-scenario="cyclone" data-testid="load-cyclone">Cyclone Demo</button>',
      '<button class="ghost-button" type="button" data-action="seed-demo" data-scenario="medical" data-testid="load-medical">Medical Demo</button>',
      '<a class="ghost-button" href="./donations.html" data-testid="open-donations">' + escapeHtml(copy("donationPortal", "Donation Portal")) + '</a>',
      '<button class="ghost-button" type="button" data-action="export-json" data-testid="export-json">' + escapeHtml(copy("exportJson", "Export JSON")) + '</button>',
      '<button class="ghost-button" type="button" data-action="export-csv" data-testid="export-csv">' + escapeHtml(copy("exportCsv", "Export CSV")) + '</button>',
      '<button class="ghost-button" type="button" data-action="print-report" data-testid="print-report">' + escapeHtml(copy("printReport", "Print Report")) + '</button>',
      "</div>",
      '<div class="notice-box" style="margin-top:12px;">' + escapeHtml(workspace.systemNotice || "Use the Demo drawer or quick actions to load a response story.") + "</div>",
      "</section>",
      '<section class="surface-card">',
      '<p class="section-label">' + escapeHtml(copy("notifications", "Notifications")) + '</p>',
      '<h3 class="section-title">Live updates across requests, donations, and assignments</h3>',
      '<div class="stack-list">' + renderNotificationCards(notifications) + '</div>',
      '</section>',
      '<section class="surface-card">',
      '<p class="section-label">AI Insights</p>',
      '<h3 class="section-title">Why the system is recommending this next step</h3>',
      '<div class="stack-list">',
      insightItems.map(function (item) {
        return '<div class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div></div><p class="card-copy">' + escapeHtml(item.copy) + "</p></div>";
      }).join(""),
      "</div>",
      "</section>",
      '<section class="surface-card">',
      '<p class="section-label">XGBoost Signal</p>',
      '<h3 class="section-title">What the model would move first</h3>',
      topPrediction ? renderBoostedSignal(topPrediction) : '<div class="empty-box">Load demo data to activate the boosted triage engine.</div>',
      '<div class="action-stack" style="margin-top:14px;">',
      '<a class="ghost-button" href="./insights.html" data-testid="open-ai-copilot">Open AI Copilot</a>',
      "</div>",
      "</section>",
      '<section class="surface-card">',
      '<p class="section-label">Satellite Intelligence</p>',
      '<h3 class="section-title">Open the active zone in satellite imagery</h3>',
      renderSatellitePanel(workspace),
      "</section>",
      '<section class="surface-card">',
      '<p class="section-label">Donation Records</p>',
      '<h3 class="section-title">Live widget</h3>',
      '<div class="stack-list">',
      donations.length ? donations.map(function (item) {
        return '<div class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.donor) + '</strong><p class="feed-meta">' + escapeHtml(formatDonationLine(item)) + '</p></div>' + renderStatus(item.status || "tracked") + "</div></div>";
      }).join("") : '<div class="empty-box">Load demo data to see the donation activity widget.</div>',
      "</div>",
      "</section>",
      "</aside>"
    ].join("");
  }

  function renderAiAssistantShell(session, workspace) {
    return [
      '<section class="ai-shell' + (AI_RUNTIME.drawerOpen ? ' is-open' : '') + '">',
      '<div class="ai-drawer-backdrop" data-action="close-ai-drawer"></div>',
      '<button class="ai-fab" type="button" data-action="toggle-ai-drawer" data-testid="toggle-ai-drawer" aria-label="Open AI copilot" aria-expanded="' + (AI_RUNTIME.drawerOpen ? "true" : "false") + '">',
      '<span class="rf-symbol" aria-hidden="true">auto_awesome</span>',
      '<span class="ai-fab-label">AI</span>',
      "</button>",
      '<aside class="ai-drawer" aria-label="AI copilot panel">',
      '<div class="ai-drawer-header">',
      '<div><p class="section-label">AI Copilot</p><h2 class="section-title">Gemini-style assistant</h2><p class="section-copy">Open this side chamber from any portal to ask about requests, volunteers, donors, districts, or the active scenario.</p></div>',
      '<div class="ai-drawer-actions"><span class="chip">Engine: ' + escapeHtml(aiEngineLabel()) + '</span><button class="ghost-button ai-close-button" type="button" data-action="close-ai-drawer" data-testid="close-ai-drawer">Close</button></div>',
      "</div>",
      '<div class="ai-drawer-body">',
      renderAiCopilotPanel(session, workspace, "drawer"),
      "</div>",
      "</aside>",
      "</section>"
    ].join("");
  }

  function renderDemoAssistantShell(workspace) {
    return [
      '<section class="demo-shell' + (DEMO_RUNTIME.drawerOpen ? ' is-open' : '') + '">',
      '<div class="demo-drawer-backdrop" data-action="close-demo-drawer"></div>',
      '<button class="demo-fab" type="button" data-action="toggle-demo-drawer" data-testid="toggle-demo-drawer" aria-label="Open demo command center" aria-expanded="' + (DEMO_RUNTIME.drawerOpen ? "true" : "false") + '">',
      '<span class="rf-symbol" aria-hidden="true">deployed_code</span>',
      '<span class="demo-fab-label">Demo</span>',
      "</button>",
      '<aside class="demo-drawer" aria-label="Load demo command center">',
      '<div class="demo-drawer-header">',
      '<div><p class="section-label">Demo Command</p><h2 class="section-title">Load a response story from any portal</h2><p class="section-copy">Use this side chamber to switch between flood, cyclone, and medical demos without leaving the current page.</p></div>',
      '<div class="demo-drawer-actions"><span class="chip">Active: ' + escapeHtml(workspace.label || "No demo selected") + '</span><button class="ghost-button demo-close-button" type="button" data-action="close-demo-drawer" data-testid="close-demo-drawer">Close</button></div>',
      "</div>",
      '<div class="demo-drawer-body">',
      '<section class="surface-card demo-drawer-card"><p class="section-label">' + escapeHtml(copy("scenarioSwitcher", "Scenario Switcher")) + '</p><h3 class="section-title">Choose the live response story</h3><form class="form-grid compact-form" data-demo-scenario-form="drawer" data-testid="demo-drawer-form"><label><span>' + escapeHtml(copy("activeScenario", "Active Scenario")) + '</span><select class="text-select" name="scenario" data-testid="demo-drawer-select">' + renderScenarioOptions(workspace.scenario) + '</select></label><div class="action-stack"><button class="primary-button" type="submit" data-testid="demo-drawer-load-selected">' + escapeHtml(copy("loadScenario", "Load Scenario")) + '</button><button class="ghost-button" type="button" data-action="reset-workspace" data-testid="demo-drawer-clear">' + escapeHtml(copy("clearDemo", "Clear Demo")) + "</button></div></form><div class=\"notice-box\">" + escapeHtml(workspace.systemNotice || "Choose a scenario to populate the workspace.") + "</div></section>",
      '<section class="surface-card demo-drawer-card"><p class="section-label">' + escapeHtml(copy("quickActions", "Quick Actions")) + '</p><h3 class="section-title">One-tap demo shortcuts</h3><div class="quick-actions"><button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="demo-drawer-flood">Load Flood Demo</button><button class="ghost-button" type="button" data-action="seed-demo" data-scenario="cyclone" data-testid="demo-drawer-cyclone">Load Cyclone Demo</button><button class="ghost-button" type="button" data-action="seed-demo" data-scenario="medical" data-testid="demo-drawer-medical">Load Medical Demo</button></div></section>',
      '<section class="surface-card demo-drawer-card"><p class="section-label">Live Summary</p><h3 class="section-title">' + escapeHtml(workspace.label || "No demo selected") + '</h3><div class="feed-list"><article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(String(workspace.requests.length)) + ' requests</strong><p class="feed-meta">Visible request cards in the current story</p></div>' + renderStatus(workspace.requests.length ? "Active" : "Waiting") + '</div></article><article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(String(workspace.assignments.length)) + ' assignments</strong><p class="feed-meta">Responder matches loaded in the workspace</p></div>' + renderStatus(workspace.assignments.length ? "Assigned" : "Queued") + '</div></article><article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(String(workspace.donations.length)) + ' donations</strong><p class="feed-meta">Money and item records attached to the story</p></div>' + renderStatus(workspace.donations.length ? "Submitted" : "Waiting") + '</div></article></div></section>',
      "</div>",
      "</aside>",
      "</section>"
    ].join("");
  }

  function renderMobileDock(page, session) {
    const items = SIDEBAR_ITEMS.filter(function (item) {
      return item.roles.indexOf(session.role) !== -1;
    }).slice(0, 2);
    const actionItems = [
      { key: "insights-action", label: "AI", icon: "auto_awesome", href: "./insights.html", active: page === "insights", action: true },
      { key: "demo-action", label: "Demo", icon: "deployed_code", href: "#demo", active: false, action: true }
    ];
    const navItems = items.concat(actionItems);
    return '<nav class="rf-mobile-dock">' + navItems.map(function (item) {
      const active = item.key === page;
      return '<a class="rf-mobile-link' + (active ? ' is-active' : '') + (item.action ? ' is-action' : '') + '" href="' + escapeHtml(item.href) + '" data-mobile-action="' + escapeHtml(item.key) + '" data-testid="mobile-nav-' + escapeHtml(item.key) + '"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(item.icon) + '</span><span>' + escapeHtml(item.shortLabel || item.label) + '</span></a>';
    }).join("") + "</nav>";
  }

  function renderPage(page, session, workspace) {
    switch (page) {
      case "community":
      case "overview":
        return renderCommunityPage(workspace);
      case "volunteer":
        return renderVolunteerPage(session, workspace);
      case "directory":
        return renderDirectoryPage();
      case "donations":
        return renderDonationsPage(workspace);
      case "operations":
        return renderOperationsPage(workspace);
      case "insights":
        return renderInsightsPage(session, workspace);
      case "admin":
        return renderAdminPage(workspace);
      case "impact":
        return renderImpactPage(workspace);
      case "judge":
        return renderJudgePage(workspace);
      default:
        return renderCommunityPage(workspace);
    }
  }

  function renderCommunityPage(workspace) {
    const lifecycleSection = '<article class="surface-card"><p class="section-label">Live Lifecycle</p><h2 class="section-title">Requests moving from intake to closure</h2>' + renderStatusBoard(workspace.requests) + '</article>';
    const districtSection = '<article class="surface-card"><p class="section-label">District Comparison</p><h2 class="section-title">Where the visible pressure is building</h2><div class="feed-list">' + renderDistrictComparisonCards(workspace) + '</div></article>';
    const mapSection = renderMapStage(workspace, {
      eyebrow: "Live Impact Map",
      title: "Visible pressure zones and mapped requests",
      meta: workspace.label || "No demo loaded",
      location: firstMapLocation(workspace),
      summary: "Every card in the feed links back to a mappable location so teams can move from overview to action quickly."
    });
    const trackerSection = '<article id="communityTrackerSection" class="surface-card"><p class="section-label">Community Request Tracker</p><h2 class="section-title">Requests currently visible to the network</h2><div class="feed-list">' + renderCommunityTracker(workspace.requests) + '</div></article>';
    const activeNeedsSection = '<article class="surface-card"><div class="section-head"><div><p class="section-label">Active Needs</p><h2 class="section-title">Latest community requests</h2></div></div><div class="feed-list">' + renderRequestCards(workspace.requests) + '</div></article>';
    const aiMatchingSection = '<article class="surface-card"><p class="section-label">AI Matching Story</p><h2 class="section-title">How ResourceFlow explains the next step</h2><div class="feed-list">' + renderWorkflowCards(buildMatchingSteps(workspace)) + '</div><div class="shared-divider"></div><p class="section-label">Copilot Suggestions</p>' + renderAiSuggestionCards(session, workspace) + '</article>';
    const routeGroupsSection = '<article class="surface-card"><p class="section-label">Route Groups</p><h2 class="section-title">Map-linked response clusters</h2><div class="feed-list">' + renderRouteGroups(workspace) + '</div></article>';
    const notificationsSection = renderNotificationInbox(buildNotifications(workspace, getSession()), "Community");
    const requestFormSection = '<article class="surface-card"><p class="section-label">Community Request Form</p><h2 class="section-title">Raise a support request</h2><form id="communityRequestForm" class="form-grid" data-testid="community-request-form"><label><span>Request title</span><input class="text-input" name="title" type="text" placeholder="Emergency food kits for affected streets" required></label><div class="grid-2"><label><span>Category</span><select class="text-select" name="category" required><option value="">Choose category</option><option>Food</option><option>Medical</option><option>Shelter</option><option>Education</option><option>Logistics</option></select></label><label><span>District</span><input class="text-input" name="district" type="text" placeholder="Chennai" required></label></div><div class="grid-2"><label><span>Location address</span><input class="text-input" name="location" type="text" placeholder="Velachery, Chennai" required></label><label><span>Estimated people affected</span><input class="text-input" name="beneficiaries" type="number" min="1" step="1" placeholder="40" required></label></div><div class="grid-2"><label><span>Urgency</span><select class="text-select" name="priority" required><option value="Critical">Critical</option><option value="High">High</option><option value="Medium" selected>Medium</option><option value="Low">Low</option></select></label><label><span>Need summary</span><input class="text-input" name="shortSummary" type="text" placeholder="Families need food, blankets, and safe shelter." required></label></div><label><span>Detailed context</span><textarea class="text-area" name="summary" placeholder="Describe the situation, road access, vulnerable groups, and immediate needs." required></textarea></label><button class="primary-button" type="submit" data-testid="submit-community-request">Submit Request</button></form><div id="communityRequestStatus" class="notice-box">Submitted requests are added to the tracker below and become part of the visible feed immediately.</div></article>';
    const responseStorySection = '<article class="surface-card"><p class="section-label">Response Story</p><h2 class="section-title">What changes after a request is entered</h2><div class="feed-list">' + renderListCards(["The request enters the lifecycle as Pending and appears in the community tracker immediately.", "Operations can review the mapped location, urgency, district, and people affected.", "The AI story updates as volunteers, donations, and assignments are attached.", "Admins can later use the same request in reports, exports, and public impact summaries."]) + '</div></article>';
    const donationBreakdownSection = '<article class="surface-card"><p class="section-label">Donation Breakdown</p><h2 class="section-title">What support is already visible</h2><div class="feed-list">' + renderDonationBreakdownCards(workspace) + '</div></article>';
    const completionTrendSection = '<article class="surface-card"><p class="section-label">Completion Trend</p><h2 class="section-title">Progress across the active request lifecycle</h2><div class="feed-list">' + renderAnalyticsCards(buildLifecycleAnalytics(workspace)) + '</div></article>';
    return [
      renderHero({
        eyebrow: "Community Portal",
        title: "A public-facing response board that stays calm and readable.",
        copy: workspace.summary,
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="overview-load-demo">Load Flood Demo</button>',
        secondary: '<a class="ghost-button" href="./donations.html" data-testid="overview-donate">Donation Portal</a>',
        sideCards: [
          miniCard("Workspace", workspace.label || "No demo loaded", "A single community lane that shows urgent needs, support, and progress."),
          miniCard("Visible Spaces", "Community, Donations, AI Prediction", "Each portal stays visually separate while sharing one response story.")
        ]
      }),
      renderActionTiles([
        { label: "I Need Help", copy: "Raise an urgent community request", href: "#communityRequestForm", tone: "brand" },
        { label: "I Want to Donate", copy: "Open money and item support", href: "./donations.html", tone: "outline" },
        { label: "Track Requests", copy: "See live request movement", href: "#communityTrackerSection", tone: "muted" },
        { label: "AI Prediction", copy: "Open the forecasting and matching view", href: "./insights.html", tone: "outline", testId: "overview-open-ai" }
      ]),
      renderMetrics(workspaceMetrics(workspace)),
      renderWeightedColumns([
        { weight: 2, markup: lifecycleSection },
        { weight: 2, markup: districtSection },
        { weight: 4, markup: mapSection },
        { weight: 4, markup: trackerSection },
        { weight: 4, markup: activeNeedsSection },
        { weight: 3, markup: aiMatchingSection },
        { weight: 2, markup: routeGroupsSection },
        { weight: 2, markup: notificationsSection },
        { weight: 5, markup: requestFormSection },
        { weight: 2, markup: responseStorySection },
        { weight: 2, markup: donationBreakdownSection },
        { weight: 2, markup: completionTrendSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderOverviewPage(workspace) {
    return renderCommunityPage(workspace);
  }

  function renderOverviewFallback(workspace) {
    const requests = (workspace.requests || []).slice(0, 4).map(function (item) {
      return [
        '<article class="feed-card">',
        '<div class="feed-card-head"><div><strong>' + escapeHtml(item.title || "Community request") + '</strong><p class="feed-meta">' + escapeHtml(item.district || "District") + ' - ' + escapeHtml(item.location || "Location") + '</p></div>' + renderStatus(normalizeRequestStatus(item.status || "Pending")) + '</div>',
        '<p class="card-copy">' + escapeHtml(item.summary || "Visible request details will appear here.") + '</p>',
        '<div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.category || "General") + '</span><span class="feed-chip">' + escapeHtml(String(item.beneficiaries || 0)) + ' people</span><span class="feed-chip">' + escapeHtml(item.priority || "Medium") + '</span></div>',
        '<div class="action-stack" style="margin-top:14px;"><button class="ghost-button" type="button" data-map-location="' + escapeHtml(item.location || item.district || "India") + '" data-testid="overview-fallback-map-' + escapeHtml((item.id || "request").toLowerCase()) + '">View on Map</button></div>',
        '</article>'
      ].join("");
    }).join("");

    return [
      renderHero({
        eyebrow: "Community Portal",
        title: "Community response board",
        copy: workspace.summary || "Community requests, donations, and lifecycle updates are visible here.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="overview-fallback-load-demo">Load Flood Demo</button>',
        secondary: '<a class="ghost-button" href="./donations.html" data-testid="overview-fallback-donations">Donation Portal</a>',
        sideCards: [
          miniCard("Workspace", workspace.label || "No demo loaded", "A simpler safe layout is showing while the full board refreshes."),
          miniCard("Visible Spaces", "Community, Donations, AI Prediction", "You can still submit requests, view needs, and move to other portals.")
        ]
      }),
      renderActionTiles([
        { label: "I Need Help", copy: "Raise an urgent community request", href: "#communityRequestForm", tone: "brand", testId: "overview-fallback-need-help" },
        { label: "I Want to Donate", copy: "Open money and item support", href: "./donations.html", tone: "outline", testId: "overview-fallback-donate" },
        { label: "AI Prediction", copy: "Open the forecasting and matching view", href: "./insights.html", tone: "outline", testId: "overview-fallback-ai" }
      ]),
      renderMetrics(workspaceMetrics(workspace)),
      '<section class="surface-card"><p class="section-label">Latest Community Requests</p><h2 class="section-title">Visible needs and map-linked follow-up</h2><div class="feed-list">' + (requests || '<div class="empty-box">Load demo data to populate the community feed.</div>') + '</div></section>',
      '<section class="two-col"><article class="surface-card"><p class="section-label">Community Request Tracker</p><h2 class="section-title">Requests currently visible to the network</h2><div class="feed-list">' + renderCommunityTracker(workspace.requests || []) + '</div></article><article class="surface-card"><p class="section-label">Donation Breakdown</p><h2 class="section-title">Visible support in the current story</h2><div class="feed-list">' + renderDonationBreakdownCards(workspace) + '</div></article></section>',
      '<section class="surface-card"><p class="section-label">Community Request Form</p><h2 class="section-title">Raise a support request</h2><form id="communityRequestForm" class="form-grid" data-testid="community-request-form"><label><span>Request title</span><input class="text-input" name="title" type="text" placeholder="Emergency food kits for affected streets" required></label><div class="grid-2"><label><span>Category</span><select class="text-select" name="category" required><option value="">Choose category</option><option>Food</option><option>Medical</option><option>Shelter</option><option>Education</option><option>Logistics</option></select></label><label><span>District</span><input class="text-input" name="district" type="text" placeholder="Chennai" required></label></div><div class="grid-2"><label><span>Location address</span><input class="text-input" name="location" type="text" placeholder="Velachery, Chennai" required></label><label><span>Estimated people affected</span><input class="text-input" name="beneficiaries" type="number" min="1" step="1" placeholder="40" required></label></div><div class="grid-2"><label><span>Urgency</span><select class="text-select" name="priority" required><option value="Critical">Critical</option><option value="High">High</option><option value="Medium" selected>Medium</option><option value="Low">Low</option></select></label><label><span>Need summary</span><input class="text-input" name="shortSummary" type="text" placeholder="Families need food, blankets, and safe shelter." required></label></div><label><span>Detailed context</span><textarea class="text-area" name="summary" placeholder="Describe the situation, road access, vulnerable groups, and immediate needs." required></textarea></label><button class="primary-button" type="submit" data-testid="submit-community-request-fallback">Submit Request</button></form><div id="communityRequestStatus" class="notice-box">Submitted requests are added to the tracker immediately.</div></section>'
    ].join("");
  }

  function renderMinimalRecoveryPage(page, workspace) {
    const topRequests = (workspace.requests || []).slice(0, 3).map(function (item) {
      return '<div class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title || "Community request") + '</strong><p class="feed-meta">' + escapeHtml(item.district || "District") + ' - ' + escapeHtml(item.location || "Location") + '</p></div>' + renderStatus(normalizeRequestStatus(item.status || "Pending")) + '</div><p class="card-copy">' + escapeHtml(item.summary || "Visible request details will appear here once the full page refreshes.") + '</p></div>';
    }).join("");
    return [
      '<section class="surface-card access-restricted">',
      '<p class="section-label">Recovery Mode</p>',
      '<h1>' + escapeHtml(PAGE_TITLES[page] || "Community Portal") + '</h1>',
      '<p class="section-copy">The full page is refreshing. A safe community board is shown so you can keep working.</p>',
      '<div class="action-stack">',
      '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="recovery-load-demo">Load Flood Demo</button>',
      '<a class="ghost-button" href="./donations.html" data-testid="recovery-open-donations">Donation Portal</a>',
      '</div>',
      '</section>',
      '<section class="surface-card"><p class="section-label">Visible Requests</p><h2 class="section-title">Community feed</h2><div class="feed-list">' + (topRequests || '<div class="empty-box">Load demo data or submit a request to populate this space.</div>') + '</div></section>'
    ].join("");
  }

  function renderPageFailure(page) {
    return '<section class="surface-card access-restricted"><p class="section-label">Page refresh needed</p><h1>' + escapeHtml(PAGE_TITLES[page] || "Portal") + ' is reloading.</h1><p class="section-copy">A page-specific rendering issue was caught, so ResourceFlow stopped the crash and kept the portal shell alive. Please refresh once and try again.</p><div class="action-stack"><button class="primary-button" type="button" data-action="reset-workspace" data-testid="page-failure-reset">Reset Workspace</button><a class="ghost-button" href="./index.html" data-testid="page-failure-home">Back To Sign In</a></div></section>';
  }

  function renderVolunteerPage(session, workspace) {
    const personal = buildVolunteerSnapshot(session, workspace);
    const mapSection = renderMapStage(workspace, {
      eyebrow: "Live Sentinel Monitoring",
      title: "A visual map for the volunteer task queue",
      meta: topDistrict(workspace) || "No district selected",
      location: firstMapLocation(workspace),
      summary: "Volunteers can inspect the zone context, then jump out to Google Maps from each assignment card."
    });
    const currentImpactSection = '<article class="surface-card"><p class="section-label">Current Impact</p><h2 class="section-title">' + escapeHtml(String(personal.points)) + ' points earned</h2><div class="chip-row">' + personal.badges.map(function (badge) { return '<span class="chip">' + escapeHtml(badge) + '</span>'; }).join("") + '</div><p class="section-copy">Attendance, completed tasks, and active assignments are shown below so every volunteer can see their contribution clearly.</p></article>';
    const prioritySection = '<article class="surface-card"><p class="section-label">AI Task Priority</p><h2 class="section-title">Optimized for ' + escapeHtml(firstName(session.name)) + '</h2><div class="stack-list">' + renderPriorityQueue(personal.activeTasks.length ? personal.activeTasks : workspace.requests.slice(0, 3)) + '</div><div class="shared-divider"></div><p class="section-label">Copilot Suggestions</p>' + renderAiSuggestionCards(session, workspace) + '</article>';
    const growthSection = '<article class="surface-card"><p class="section-label">Volunteer Growth</p><h2 class="section-title">Badges, streak, NGO, and reliability</h2><div class="feed-list">' + renderVolunteerGrowthCards(personal) + '</div></article>';
    const directoryPreviewSection = '<article class="surface-card"><p class="section-label">Volunteer Directory Preview</p><h2 class="section-title">See other registered volunteers</h2><div class="record-grid">' + renderVolunteerPreviewCards(workspace.volunteers) + '</div></article>';
    const routeBundlesSection = '<article class="surface-card"><p class="section-label">Route Bundles</p><h2 class="section-title">Nearby task groups for this volunteer</h2><div class="feed-list">' + renderVolunteerRouteBundleCards(session, workspace) + '</div></article>';
    const notificationsSection = renderNotificationInbox(buildNotifications(workspace, session), "Volunteer");
    const tasksSection = '<article class="surface-card"><p class="section-label">My Tasks</p><h2 class="section-title">Assignments for this volunteer session</h2><div class="feed-list">' + renderAssignmentCards(personal.activeTasks) + '</div></article>';
    const archiveSection = '<article class="surface-card"><p class="section-label">Volunteer Activity Archive</p><h2 class="section-title">Completed work visible to the team</h2><div class="feed-list">' + renderArchiveCards(personal.archive) + '</div></article>';
    const leaderboardSection = '<article class="surface-card"><p class="section-label">Volunteer Leaderboard</p><h2 class="section-title">Visible contribution momentum</h2><div class="record-grid">' + renderLeaderboardCards(workspace) + '</div></article>';
    return [
      renderHero({
        eyebrow: "Volunteer Portal",
        title: safeText(session.name || "Volunteer", 80) + "'s response board",
        copy: personal.summary,
        primary: '<a class="primary-button" href="./directory.html" data-testid="open-directory">Open Volunteer Directory</a>',
        secondary: '<button class="ghost-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="volunteer-load-demo">Load Demo</button>',
        sideCards: [
          miniCard("Current District", personal.district, "The top district is derived from the active requests in the current scenario."),
          miniCard("Reliability Score", String(personal.reliability) + "%", "Reliability grows with delivered work, attendance, and sustained activity.")
        ]
      }),
      renderAlertBanner("volunteer", workspace, "Flash flood warning", "The volunteer lane should make one next action obvious, even on small screens."),
      renderActionTiles([
        { label: "AI Prediction", copy: "See why the system is prioritizing these tasks", href: "./insights.html", tone: "outline", testId: "volunteer-open-ai" },
        { label: "Volunteer Directory", copy: "Open shared volunteer profiles", href: "./directory.html", tone: "muted", testId: "volunteer-open-directory-tile" },
        { label: "Load Demo", copy: "Refresh the active volunteer story", action: "seed-demo", scenario: "flood", tone: "brand", testId: "volunteer-load-demo-tile" }
      ]),
      renderMetrics([
        metric("Points", String(personal.points), "Response points earned from completed assignments."),
        metric("Completed Tasks", String(personal.completed), "Closed assignments tied to your volunteer profile."),
        metric("Attendance Days", String(personal.attendance), "Engagement days tracked in the current demo story."),
        metric("Active Tasks", String(personal.activeTasks.length), "Assignments still open for your role."),
        metric("Reliability", String(personal.reliability) + "%", "Volunteer reliability score derived from visible completion history.")
      ]),
      renderWeightedColumns([
        { weight: 4, markup: mapSection },
        { weight: 2, markup: currentImpactSection },
        { weight: 3, markup: prioritySection },
        { weight: 3, markup: growthSection },
        { weight: 3, markup: directoryPreviewSection },
        { weight: 2, markup: routeBundlesSection },
        { weight: 2, markup: notificationsSection },
        { weight: 4, markup: tasksSection },
        { weight: 2, markup: archiveSection },
        { weight: 3, markup: leaderboardSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderDirectoryPage() {
    const registrationSection = '<article class="surface-card"><p class="section-label">Volunteer Registration</p><h2 class="section-title">Create or update a shared profile</h2><div id="sharedVolunteerStatus" class="notice-box">Sign in to create your volunteer profile and see the shared directory from Firestore.</div><form id="sharedVolunteerForm" class="form-grid" data-testid="shared-volunteer-form"><label><span>Full Name</span><input class="text-input" name="fullName" type="text" placeholder="Thenmozhi P" required></label><label><span>NGO Group Name</span><input class="text-input" name="ngoGroup" type="text" placeholder="Care Bridge" required></label><label><span>Skills</span><input class="text-input" name="skills" type="text" placeholder="first aid, food distribution, registration" required></label><div class="grid-2"><label><span>Phone</span><input class="text-input" name="phone" type="text" placeholder="+91 98765 43210" required></label><label><span>Email</span><input class="text-input" name="email" type="email" placeholder="volunteer@example.com" required></label></div><div class="grid-2"><label><span>Availability</span><select class="text-select" name="availability" required><option value="">Choose availability</option><option>Full Day</option><option>Half Day</option><option>Evening</option><option>Weekend</option><option>On Call</option></select></label><label><span>Activity Status</span><select class="text-select" name="activityStatus" required><option value="available">Available</option><option value="on call">On Call</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div><label><span>Location (Optional)</span><input class="text-input" name="location" type="text" placeholder="Salt Lake, Kolkata"></label><button class="primary-button" type="submit" data-testid="save-volunteer-profile">Save Shared Volunteer Profile</button></form></article>';
    const filtersSection = '<article class="surface-card"><p class="section-label">Filters</p><h2 class="section-title">Search by skill, NGO, or location</h2><div class="form-grid"><label><span>Search</span><input id="sharedVolunteerSearch" class="text-input" type="text" placeholder="Search by name, skill, NGO, or contact" data-testid="shared-volunteer-search"></label><div class="grid-2"><label><span>Skills</span><input id="sharedVolunteerSkillFilter" class="text-input" type="text" placeholder="first aid, logistics" data-testid="shared-volunteer-skill-filter"></label><label><span>NGO Group</span><input id="sharedVolunteerNgoFilter" class="text-input" type="text" placeholder="Care Bridge" data-testid="shared-volunteer-ngo-filter"></label></div><label><span>Location</span><input id="sharedVolunteerLocationFilter" class="text-input" type="text" placeholder="Kolkata, Chennai, Salt Lake" data-testid="shared-volunteer-location-filter"></label></div><div id="sharedVolunteerDirectoryStats" class="shared-metric-grid"><div class="empty-box">Directory metrics will appear here after sign-in.</div></div></article>';
    const recordsSection = '<section class="surface-card"><p class="section-label">Volunteer Directory Records</p><h2 class="section-title">Shared volunteer profiles</h2><div id="sharedVolunteerDirectoryList" class="record-grid"><div class="empty-box">Volunteer cards will appear here after sign-in.</div></div></section>';
    return [
      renderHero({
        eyebrow: "Volunteer Directory",
        title: "Shared volunteer visibility with one searchable directory.",
        copy: "This page uses the real Firestore backend. New volunteer profiles are stored permanently and become visible to every signed-in volunteer.",
        primary: '<a class="primary-button" href="./volunteer.html" data-testid="back-to-volunteer">Volunteer Portal</a>',
        secondary: '<button class="ghost-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="directory-load-demo">Load Demo</button>',
        sideCards: [
          miniCard("Shared Visibility", "Backend connected", "Profiles saved here are shared across all signed-in volunteers."),
          miniCard("Filters", "Skills, NGO, location", "Use the filters to narrow the directory quickly.")
        ]
      }),
      renderActionTiles([
        { label: "AI Prediction", copy: "Open volunteer-fit forecasting", href: "./insights.html", tone: "outline", testId: "directory-open-ai" }
      ]),
      '<section class="two-col">' + registrationSection + filtersSection + '</section>',
      recordsSection
    ].join("");
  }

  function renderDonationsPage(workspace) {
    const requestHint = safeText(((workspace.requests || [])[0] && ((workspace.requests || [])[0].title + " · " + ((workspace.requests || [])[0].id || ""))) || "", 180);
    const donationFormSection = '<section class="surface-card"><p class="section-label">Donation Records</p><h2 class="section-title">Submit a money or item donation</h2><div id="donationPortalStatus" class="notice-box">Sign in to store donation records in Firestore and track their status.' + (requestHint ? ' Suggested request link: ' + escapeHtml(requestHint) + '.' : '') + '</div><div class="two-col donation-panels"><article class="surface-card nested-card" data-donation-panel="money"><p class="section-label">Money Donation</p><form id="moneyDonationForm" class="form-grid" data-testid="money-donation-form"><label><span>Donor Name</span><input class="text-input" name="donorName" type="text" placeholder="Shri Sundaram" required></label><div class="grid-2"><label><span>Amount</span><input class="text-input" name="amount" type="number" min="1" step="1" placeholder="1000" required></label><label><span>Payment Method</span><select class="text-select" name="paymentMethod" required><option value="">Choose method</option><option>UPI</option><option>Bank Transfer</option><option>Card</option><option>Cash</option><option>Cheque</option></select></label></div><div class="grid-2"><label><span>Linked Request ID</span><input class="text-input" name="linkedRequestId" type="text" placeholder="RF-REQ-001"></label><label><span>Linked Request Title</span><input class="text-input" name="linkedRequestTitle" type="text" placeholder="Emergency food kits for affected streets"></label></div><label><span>Delivery Proof / Reference</span><input class="text-input" name="deliveryProof" type="text" placeholder="Photo receipt, UPI ref, courier proof"></label><label><span>Message / Note</span><textarea class="text-area" name="message" placeholder="Add a note for the receiving team."></textarea></label><button class="primary-button" type="submit" data-testid="save-money-donation">Save Money Donation</button></form></article><article class="surface-card nested-card" data-donation-panel="item" hidden><p class="section-label">Item Donation</p><form id="itemDonationForm" class="form-grid" data-testid="item-donation-form"><label><span>Donor Name</span><input class="text-input" name="donorName" type="text" placeholder="Diya Raman" required></label><div class="grid-2"><label><span>Item Type</span><select class="text-select" name="itemType" required><option value="">Choose item type</option><option>Clothes</option><option>Food</option><option>Books</option><option>Other Useful Items</option></select></label><label><span>Quantity</span><input class="text-input" name="quantity" type="number" min="1" step="1" placeholder="12" required></label></div><label><span>Description</span><textarea class="text-area" name="description" placeholder="Describe the items being donated." required></textarea></label><label><span>Contact Details</span><input class="text-input" name="contactDetails" type="text" placeholder="+91 98765 43210 | donor@example.com" required></label><div class="grid-2"><label><span>Linked Request ID</span><input class="text-input" name="linkedRequestId" type="text" placeholder="RF-REQ-001"></label><label><span>Linked Request Title</span><input class="text-input" name="linkedRequestTitle" type="text" placeholder="Shelter support for low-lying families"></label></div><label><span>Delivery Proof / Reference</span><input class="text-input" name="deliveryProof" type="text" placeholder="Dispatch slip, receipt photo, transporter ID"></label><button class="primary-button" type="submit" data-testid="save-item-donation">Save Item Donation</button></form></article></div></section>';
    const snapshotSection = '<article class="surface-card"><p class="section-label">Live Snapshot</p><div id="donationSummaryGrid" class="shared-metric-grid"><div class="empty-box">Your shared donation summary will appear here after sign-in.</div></div></article>';
    const recordsSection = '<article class="surface-card"><p class="section-label">Donation Records</p><div id="donationHistoryList" class="record-grid"><div class="empty-box">Recent donation records from your account will appear here.</div></div></article>';
    const workflowSection = '<article class="surface-card"><p class="section-label">Donation Tracking</p><h2 class="section-title">Submitted to delivered workflow</h2>' + renderDonationWorkflowBoard(workspace.donations) + '</article>';
    const breakdownSection = '<article class="surface-card"><p class="section-label">Donation Breakdown</p><h2 class="section-title">Funding and item mix</h2><div class="feed-list">' + renderDonationBreakdownCards(workspace) + '</div></article>';
    const linkingSection = '<article class="surface-card"><p class="section-label">Donation Linking</p><h2 class="section-title">Connect support directly to visible requests</h2><div class="feed-list">' + renderDonationLinkingCards(workspace) + '</div></article>';
    return [
      renderHero({
        eyebrow: "Donation Portal",
        title: "Track money and useful item support in one donation center.",
        copy: "Money and useful item donations are stored in Firestore, then surfaced to admin for review and coordination.",
        primary: '<button class="primary-button" type="button" data-action="show-donation-tab" data-tab="money" data-testid="show-money-donation">Money Donation</button>',
        secondary: '<button class="ghost-button" type="button" data-action="show-donation-tab" data-tab="item" data-testid="show-item-donation">Item Donation</button>',
        sideCards: [
          miniCard("Donation Types", "Money, clothes, food, books", "The shared backend tracks every donation record and its status."),
          miniCard("Admin Visibility", "Live records", "Admins can review every donation submission inside the dashboard.")
        ]
      }),
      renderActionTiles([
        { label: "AI Prediction", copy: "See the top donation gaps and funding forecast", href: "./insights.html", tone: "outline", testId: "donations-open-ai" },
        { label: "Print Report", copy: "Create a printable donation summary", action: "print-report", tone: "muted", testId: "donations-print-report" }
      ]),
      donationFormSection,
      renderWeightedColumns([
        { weight: 2, markup: snapshotSection },
        { weight: 7, markup: recordsSection },
        { weight: 3, markup: workflowSection },
        { weight: 2, markup: breakdownSection },
        { weight: 3, markup: linkingSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderOperationsPage(workspace) {
    const notificationsSection = renderNotificationInbox(buildNotifications(workspace, getSession()), "Government");
    const mapSection = renderMapStage(workspace, {
      eyebrow: "Live Deployment Map",
      title: "District movement and resource view",
      meta: topDistrict(workspace) || "No district yet",
      location: firstMapLocation(workspace),
      summary: "Use the mapped location to pivot from the oversight board into Google Maps routing."
    });
    const urgentSection = '<section class="surface-card"><p class="section-label">Urgent Requests</p><h2 class="section-title">What needs action first</h2><div class="stack-list">' + renderRequestCards(workspace.requests.slice(0, 3)) + '</div></section>';
    const aiDispatchSection = '<section class="surface-card"><p class="section-label">AI Dispatch Story</p><h2 class="section-title">Why this district is being prioritized</h2><div class="feed-list">' + renderWorkflowCards(buildMatchingSteps(workspace)) + '</div><div class="shared-divider"></div><p class="section-label">Next Move</p>' + renderAiSuggestionCards(getSession(), workspace) + '</section>';
    const approvalsSection = '<section class="surface-card"><p class="section-label">Pending Approvals</p><h2 class="section-title">Items waiting for operator review</h2><div class="feed-list">' + renderApprovalCards(buildPendingApprovals(workspace)) + '</div></section>';
    const districtPressureSection = '<article class="surface-card"><p class="section-label">District Pressure Board</p><h2 class="section-title">Where teams should move next</h2><div class="feed-list">' + renderDistrictSummaryCards(workspace) + '</div></article>';
    const activeDispatchSection = '<article class="surface-card"><p class="section-label">Active Dispatch</p><h2 class="section-title">Assignments currently being coordinated</h2><div class="feed-list">' + renderAssignmentCards(workspace.assignments) + '</div></article>';
    const blockedSection = '<article class="surface-card"><p class="section-label">Blocked Cases</p><h2 class="section-title">Requests that need escalation</h2><div class="feed-list">' + renderApprovalCards(buildBlockedCases(workspace)) + '</div></article>';
    const routeGroupsSection = '<article class="surface-card"><p class="section-label">Route Groups</p><h2 class="section-title">Grouped movements by district</h2><div class="feed-list">' + renderRouteGroups(workspace) + '</div></article>';
    const timelineSection = '<article class="surface-card"><p class="section-label">Assignment Timeline</p><h2 class="section-title">Per-request progression and handoff</h2><div class="feed-list">' + renderRequestTimelineCards(workspace) + '</div></article>';
    const workflowSection = '<section class="surface-card"><p class="section-label">Request Workflow</p><h2 class="section-title">Status pipeline across the active scenario</h2>' + renderStatusBoard(workspace.requests) + '</section>';
    return [
      renderHero({
        eyebrow: "Government Operations",
        title: "National emergency response monitoring with one clear operations board.",
        copy: workspace.summary,
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="operations-load-demo">Load Demo</button>',
        secondary: '<a class="ghost-button" href="./insights.html" data-testid="operations-open-insights">Open AI Insights</a>',
        sideCards: [
          miniCard("District Summary", topDistrict(workspace) || "No district yet", "The operations board surfaces the district with the highest pressure first."),
          miniCard("Response Status", String(workspace.assignments.length) + " live assignments", "Assignments update in the vertical feed below.")
        ]
      }),
      renderMetrics([
        metric("Active Zones", String(buildDistrictSummary(workspace).length), "Districts with visible pressure in the current scenario."),
        metric("Aid Requests", String(workspace.requests.length), "Requests waiting for review, assignment, or delivery."),
        metric("Active Deployments", String(buildActiveDeployments(workspace).length), "Assignments still moving through field execution."),
        metric("Blocked Cases", String(buildBlockedCases(workspace).length), "Cases that need escalation because they are stuck or high-risk."),
        metric("Beneficiaries", String(totalBeneficiaries(workspace)), "People projected to be supported across the board.")
      ]),
      renderWeightedColumns([
        { weight: 4, markup: mapSection },
        { weight: 4, markup: urgentSection },
        { weight: 3, markup: aiDispatchSection },
        { weight: 2, markup: approvalsSection },
        { weight: 2, markup: notificationsSection },
        { weight: 3, markup: districtPressureSection },
        { weight: 3, markup: activeDispatchSection },
        { weight: 2, markup: blockedSection },
        { weight: 2, markup: routeGroupsSection },
        { weight: 2, markup: timelineSection },
        { weight: 3, markup: workflowSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderInsightsPage(session, workspace) {
    const items = buildInsightItems(workspace);
    const predictions = buildBoostedPredictionRows(workspace);
    const mapSection = renderMapStage(workspace, {
      eyebrow: "AI Heatmap",
      title: "Predicted shortage and district risk view",
      meta: workspace.label || "No demo loaded",
      location: firstMapLocation(workspace),
      summary: "The prediction view surfaces where resources may run short before the next response step begins."
    });
    const fundingSection = '<section class="surface-card"><p class="section-label">Predicted Funding</p><h2 class="section-title">' + escapeHtml(formatCurrency(totalBeneficiaries(workspace) * 420)) + '</h2><p class="section-copy">A simple estimate based on the visible requests, beneficiaries, and the currently loaded scenario.</p></section>';
    const resourceGapsSection = '<section class="surface-card"><p class="section-label">Resource Gaps</p><div class="feed-list">' + renderProjectionCards(workspace.requests) + '</div></section>';
    const projectionsSection = '<article class="surface-card"><p class="section-label">Requirement Projections</p><h2 class="section-title">Category-level demand forecast</h2><div class="feed-list">' + renderProjectionCards(workspace.requests, true) + '</div></article>';
    const logSection = '<article class="surface-card"><p class="section-label">Coordination Log</p><h2 class="section-title">AI explanation and analyst notes</h2><div class="feed-list">' + items.map(function (item) { return '<div class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div></div><p class="card-copy">' + escapeHtml(item.copy) + "</p></div>"; }).join("") + '</div></article>';
    const comparisonSection = '<article class="surface-card"><p class="section-label">District Comparison</p><h2 class="section-title">Completion and pressure trend</h2><div class="feed-list">' + renderDistrictComparisonCards(workspace) + '</div></article>';
    const donationSection = '<article class="surface-card"><p class="section-label">Donation Breakdown</p><h2 class="section-title">What the forecast says is still missing</h2><div class="feed-list">' + renderDonationBreakdownCards(workspace) + '</div></article>';
    const chatbotSection = '<article class="surface-card"><p class="section-label">AI Copilot Chatbot</p><h2 class="section-title">Ask a real assistant about the active workspace</h2>' + renderAiCopilotPanel(session, workspace, "insights") + '</article>';
    const boostedSection = '<article class="surface-card"><p class="section-label">XGBoost Triage Engine</p><h2 class="section-title">XGBoost-style request scoring</h2><div class="stack-list">' + renderBoostedPredictionCards(predictions) + '</div></article>';
    return [
      renderHero({
        eyebrow: "AI Insights",
        title: "AI prediction and resource forecasting in one explainable view.",
        copy: "Use the insight feed to explain district pressure, volunteer fit, and how the current scenario is unfolding.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="medical" data-testid="insights-load-demo">Load Medical Demo</button>',
        secondary: '<a class="ghost-button" href="./operations.html" data-testid="insights-back-operations">Back To Operations</a>',
        sideCards: [
          miniCard("Scenario", workspace.label || "No demo loaded", "Insight cards become richer once requests, assignments, and donations exist."),
          miniCard("AI Copilot", aiEngineLabel(), "A real chatbot uses Gemini when configured and falls back to the local XGBoost-style engine when not.")
        ]
      }),
      renderWeightedColumns([
        { weight: 4, markup: mapSection },
        { weight: 2, markup: fundingSection },
        { weight: 3, markup: resourceGapsSection },
        { weight: 3, markup: projectionsSection },
        { weight: 3, markup: logSection },
        { weight: 3, markup: comparisonSection },
        { weight: 2, markup: donationSection },
        { weight: 6, markup: chatbotSection },
        { weight: 5, markup: boostedSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderAdminPage(workspace) {
    const notificationsSection = renderNotificationInbox(buildNotifications(workspace, getSession()), "Admin");
    const governanceSection = '<article class="surface-card"><p class="section-label">Governance Pulse</p><h2 class="section-title">Audit events, review queue, and outreach drafts</h2><div class="feed-list">' + renderListCards(workspace.audit) + '</div><div id="adminVolunteerStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Volunteer activity status cards will appear here.</div></div><div id="adminDonationStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Donation workflow status cards will appear here.</div></div></article>';
    const snapshotSection = '<article class="surface-card"><p class="section-label">Live Snapshot</p><h2 class="section-title">Shared backend summary</h2><div id="sharedAdminStatus" class="notice-box">Admin dashboard is checking the shared backend.</div><div id="adminSharedSummary" class="shared-metric-grid"><div class="empty-box">Admin metrics will appear here after sign-in.</div></div></article>';
    const volunteerRecordsSection = '<article class="surface-card"><p class="section-label">Volunteer Directory Records</p><h2 class="section-title">Shared volunteer visibility</h2><div id="adminVolunteerRecords" class="record-grid"><div class="empty-box">Shared volunteer management is loading.</div></div></article>';
    const donationRecordsSection = '<article class="surface-card"><p class="section-label">Donation Records</p><h2 class="section-title">Money and item support from the backend</h2><div id="adminDonationRecords" class="record-grid"><div class="empty-box">Shared donation management is loading.</div></div></article>';
    const moderationSection = '<article class="surface-card"><p class="section-label">Moderation Center</p><h2 class="section-title">Verification, approvals, and blocked work</h2><div class="feed-list">' + renderApprovalCards(buildModerationQueue(workspace)) + '</div></article>';
    const analyticsSection = '<article class="surface-card"><p class="section-label">Analytics Upgrade</p><h2 class="section-title">District comparison, donation mix, and completion trend</h2><div class="feed-list">' + renderAnalyticsCards(buildAdminAnalytics(workspace)) + '</div></article>';
    const usageGuardSection = '<article class="surface-card"><p class="section-label">Firebase Usage Guard</p><h2 class="section-title">Safe usage inside the no-cost tier</h2><div class="feed-list">' + buildUsageGuardCards() + '</div></article>';
    const aiActionSection = '<article class="surface-card"><p class="section-label">AI Action History</p><h2 class="section-title">What the copilot changed and why</h2><div class="feed-list">' + renderNotificationCards(buildAiActionHistory(workspace)) + '</div></article>';
    const outreachSection = '<article class="surface-card"><p class="section-label">Outreach Center</p><form id="adminOutreachForm" class="form-grid" data-testid="outreach-center-form"><label><span>Subject</span><input class="text-input" name="subject" type="text" placeholder="Volunteer briefing for evening flood response"></label><label><span>Message</span><textarea class="text-area" name="message" placeholder="Share timing, district, safety notes, and reporting instructions."></textarea></label><label><span>Recipients</span><input class="text-input" name="recipients" type="text" placeholder="Community, Volunteer, Donation portal"></label><button class="primary-button" type="button" data-action="save-outreach" data-testid="save-outreach-draft">Save Draft</button></form></article>';
    const draftsSection = '<article class="surface-card"><p class="section-label">Outreach Drafts</p><div id="adminOutreachDrafts" class="feed-list">' + renderListCards(workspace.outreach) + '</div></article>';
    const timelineSection = '<article class="surface-card"><p class="section-label">Assignment Timeline</p><h2 class="section-title">Per-request lifecycle and handoff</h2><div class="feed-list">' + renderRequestTimelineCards(workspace) + '</div></article>';
    const roleManagementSection = '<section class="surface-card"><p class="section-label">User Role Management</p><h2 class="section-title">Who can access which portal right now</h2><div class="table-shell"><table><thead><tr><th>Name</th><th>Role</th><th>Current Access</th><th>Status</th></tr></thead><tbody>' + renderRoleRows() + '</tbody></table></div></section>';
    return [
      renderHero({
        eyebrow: "Admin Dashboard",
        title: "Governance, live snapshot, and outreach in one admin control room.",
        copy: "The admin lane combines local demo intelligence with shared Firestore-backed volunteer and donation management.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="admin-load-demo">Load Demo</button>',
        secondary: '<a class="ghost-button" href="./impact.html" data-testid="admin-open-impact">Public Impact</a>',
        sideCards: [
          miniCard("Governance Pulse", "Audit events, review queue, outreach drafts", "These cards stay high-contrast in light and dark mode."),
          miniCard("Visible Spaces", "Community, Volunteer, Donations, AI Prediction", "The portal menu keeps navigation compact while the live feed and widgets stay visible.")
        ]
      }),
      renderActionTiles([
        { label: "AI Prediction", copy: "Open the explainable forecasting workspace", href: "./insights.html", tone: "outline", testId: "admin-open-ai" },
        { label: "Public Impact", copy: "Switch to the NGO and judge story view", href: "./impact.html", tone: "muted", testId: "admin-open-impact-tile" },
        { label: "Print Report", copy: "Generate a printable admin summary", action: "print-report", tone: "outline", testId: "admin-print-report" }
      ]),
      renderMetrics([
        metric("Live Snapshot", String(workspace.requests.length), "Requests currently visible in the workspace feed."),
        metric("Assignments", String(workspace.assignments.length), "Assignment stats linked to the active scenario."),
        metric("Completion Rate", String(buildCompletionRate(workspace)) + "%", "Closed or delivered request progress in the active scenario."),
        metric("Donation Records", String(workspace.donations.length), "Local scenario donation records plus shared backend entries below."),
        metric("Beneficiaries", String(totalBeneficiaries(workspace)), "Projected people supported by the loaded scenario.")
      ]),
      renderWeightedColumns([
        { weight: 5, markup: governanceSection },
        { weight: 3, markup: snapshotSection },
        { weight: 6, markup: volunteerRecordsSection },
        { weight: 8, markup: donationRecordsSection },
        { weight: 3, markup: moderationSection },
        { weight: 2, markup: analyticsSection },
        { weight: 2, markup: usageGuardSection },
        { weight: 2, markup: aiActionSection },
        { weight: 3, markup: outreachSection },
        { weight: 2, markup: draftsSection },
        { weight: 2, markup: timelineSection },
        { weight: 3, markup: roleManagementSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderImpactPage(workspace) {
    const walkthroughSection = '<section class="surface-card"><p class="section-label">Demo Walkthrough</p><h2 class="section-title">One-click story for judges and partners</h2><div class="feed-list">' + renderDemoWalkthroughCards(workspace) + '</div></section>';
    const beforeAfterSection = '<section class="surface-card"><p class="section-label">Before / After</p><h2 class="section-title">How visibility changes after ResourceFlow</h2><div class="feed-list">' + renderBeforeAfterCards(workspace) + '</div></section>';
    return [
      renderHero({
        eyebrow: "Public Impact",
        title: "A public story of requests, assignments, and measurable outcomes.",
        copy: "This page translates the live workspace into a simple story: who needed help, how the AI matched support, and what changed on the ground.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="impact-load-demo">Load Demo</button>',
        secondary: '<a class="ghost-button" href="./judge.html" data-testid="impact-open-judge">Judge Mode</a>',
        sideCards: [
          miniCard("Impact Story", workspace.label || "No demo loaded", "Use this page during reviews, live demos, and partner meetings."),
          miniCard("Public View", String(totalBeneficiaries(workspace)) + " beneficiaries", "Numbers change instantly when the demo scenario changes.")
        ]
      }),
      renderMetrics(workspaceMetrics(workspace)),
      '<section class="page-columns"><div class="page-columns-main"><section class="surface-card"><p class="section-label">Impact Feed</p><h2 class="section-title">Visible progress for judges, partners, and NGOs</h2><div class="feed-list">' + renderImpactCards(workspace) + '</div></section>' + walkthroughSection + beforeAfterSection + '</div><div class="page-columns-side"><section class="surface-card"><p class="section-label">Snapshot</p><h2 class="section-title">' + escapeHtml(String(totalBeneficiaries(workspace))) + ' people supported</h2><p class="section-copy">This page is designed as a clean, presentation-friendly summary of the live response workspace.</p></section></div></section>'
    ].join("");
  }

  function renderJudgePage(workspace) {
    const walkthroughSection = '<section class="surface-card"><p class="section-label">Judge Walkthrough</p><h2 class="section-title">One-click pitch flow from problem to proof</h2><div class="feed-list">' + renderDemoWalkthroughCards(workspace) + '</div></section>';
    const beforeAfterSection = '<section class="surface-card"><p class="section-label">Impact Shift</p><h2 class="section-title">Before and after the platform becomes visible</h2><div class="feed-list">' + renderBeforeAfterCards(workspace) + '</div></section>';
    return [
      renderHero({
        eyebrow: "Judge Mode",
        title: "A simplified pitch view for problem, AI logic, and proof.",
        copy: "Judge Mode keeps the story focused on disaster coordination, volunteer assignment, donation flow, and public visibility.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="cyclone" data-testid="judge-load-demo">Load Cyclone Demo</button>',
        secondary: '<a class="ghost-button" href="./impact.html" data-testid="judge-open-impact">Impact Page</a>',
        sideCards: [
          miniCard("Problem", "Scattered requests and invisible coordination", "ResourceFlow centralizes requests, volunteers, donors, and admins in one response workspace."),
          miniCard("Solution", "Shared visibility + AI matching", "The feed below shows request intake, matching reasons, and quick map links.")
        ]
      }),
      renderMetrics([
        metric("Innovation", "AI matching", "Matches use district, skills, status, and urgency."),
        metric("Reach", String(totalBeneficiaries(workspace)), "Projected people supported in the current demo scenario."),
        metric("Operations", String(workspace.assignments.length), "Assignments connected to requests and volunteers."),
        metric("Evidence", String(workspace.donations.length), "Donation records and activity proof available for review.")
      ]),
      '<section class="surface-card"><p class="section-label">Submission Flow</p><h2 class="section-title">How the product works end to end</h2><div class="feed-list">' + renderListCards(["Community users raise requests or view progress in a clean portal.", "Volunteers see assignments, points, attendance, and completed work.", "Government operations monitor requests and AI dispatch from a district-focused board.", "Admins manage donation records, volunteer records, outreach, and governance in one place."]) + "</div></section>" + walkthroughSection + beforeAfterSection
    ].join("");
  }

  function renderAccessRestricted(page, session) {
    return '<section class="surface-card access-restricted"><p class="section-label">Access Restricted</p><h1>You cannot open ' + escapeHtml(PAGE_TITLES[page] || "this page") + ' with the current portal.</h1><p class="section-copy">Your current role is ' + escapeHtml((ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label) + '. Use Switch Portal or the top-left portal menu to move to an allowed space.</p><div class="action-stack"><button class="primary-button" type="button" data-action="switch-portal" data-testid="restricted-switch-portal">Switch Portal</button><a class="ghost-button" href="' + escapeHtml(homeRouteForRole(session.role)) + '" data-testid="restricted-go-home">Go To Allowed Space</a></div></section>';
  }

  function renderHero(config) {
    return '<section class="hero-card"><div class="hero-grid"><div class="hero-copy"><p class="section-label">' + escapeHtml(config.eyebrow) + '</p><h1>' + escapeHtml(config.title) + '</h1><p class="section-copy">' + escapeHtml(config.copy) + '</p><div class="action-stack hero-actions">' + config.primary + config.secondary + '</div></div><div class="hero-side">' + (config.sideCards || []).join("") + "</div></div></section>";
  }

  function miniCard(label, title, copy) {
    return '<article class="mini-card"><span class="section-label">' + escapeHtml(label) + '</span><strong>' + escapeHtml(title) + '</strong><p class="card-copy">' + escapeHtml(copy) + "</p></article>";
  }

  function renderBalancedColumns(columns, extraClass) {
    return [
      '<section class="balanced-columns' + (extraClass ? " " + extraClass : "") + '">',
      (columns || []).map(function (items) {
        return '<div class="balanced-stack">' + (items || []).join("") + "</div>";
      }).join(""),
      "</section>"
    ].join("");
  }

  function renderWeightedColumns(items, extraClass, columnCount) {
    const count = Math.max(1, Number(columnCount) || 2);
    const columns = Array.from({ length: count }, function () {
      return { weight: 0, items: [] };
    });
    (items || []).forEach(function (item) {
      const entry = typeof item === "string" ? { markup: item, weight: 1 } : item;
      const weight = Number(entry.weight) > 0 ? Number(entry.weight) : 1;
      let targetIndex = 0;
      for (let index = 1; index < columns.length; index += 1) {
        if (columns[index].weight < columns[targetIndex].weight) {
          targetIndex = index;
        }
      }
      columns[targetIndex].items.push(entry.markup || "");
      columns[targetIndex].weight += weight;
    });
    return renderBalancedColumns(columns.map(function (column) { return column.items; }), extraClass);
  }

  function renderActionTiles(items) {
    if (!items || !items.length) {
      return "";
    }
    return '<section class="action-tile-grid">' + items.map(function (item) {
      const element = item.href ? "a" : "button";
      const attrs = item.href ? ' href="' + escapeHtml(item.href) + '"' : ' type="button"';
      const dataAttrs = [
        item.testId ? ' data-testid="' + escapeHtml(item.testId) + '"' : "",
        item.action ? ' data-action="' + escapeHtml(item.action) + '"' : "",
        item.scenario ? ' data-scenario="' + escapeHtml(item.scenario) + '"' : ""
      ].join("");
      return '<' + element + ' class="action-tile action-tile-' + escapeHtml(item.tone || "brand") + '"' + attrs + dataAttrs + '><strong>' + escapeHtml(item.label) + '</strong><span>' + escapeHtml(item.copy) + '</span></' + element + ">";
    }).join("") + "</section>";
  }

  function renderAlertBanner(page, workspace, title, copy) {
    if (!workspace.requests.length) {
      return "";
    }
    const alertKey = buildAlertKey(page, workspace, title);
    if (isAlertDismissed(alertKey)) {
      return "";
    }
    return '<section class="alert-banner"><span class="alert-icon">!</span><div><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(copy) + '</p></div><button class="primary-button alert-button" type="button" data-action="dismiss-alert" data-alert-key="' + escapeHtml(alertKey) + '" data-testid="dismiss-alert-banner">Acknowledge</button></section>';
  }

  function renderMapStage(workspace, config) {
    const location = safeText(config.location || firstMapLocation(workspace) || "India", 180);
    const scenarioClass = "scenario-" + escapeHtml(workspace.scenario || "none");
    return '<section class="surface-card map-stage ' + scenarioClass + '"><div class="section-head"><div><p class="section-label">' + escapeHtml(config.eyebrow) + '</p><h2 class="section-title">' + escapeHtml(config.title) + '</h2></div><div class="map-stage-meta">' + escapeHtml(config.meta || workspace.label || "Workspace") + '</div></div><div class="map-canvas"><div class="map-grid-lines"></div><div class="map-gradient"></div><div class="map-stage-pill">Live data</div><div class="map-focus-card"><strong>' + escapeHtml(location) + '</strong><p>' + escapeHtml(config.summary || "Open the location in Google Maps to inspect the route and surrounding context.") + '</p></div><div class="map-legend"><span><i class="legend-dot critical"></i>Critical</span><span><i class="legend-dot rising"></i>Rising</span><span><i class="legend-dot stable"></i>Stable</span></div><button class="ghost-button map-link-button" type="button" data-map-location="' + escapeHtml(location) + '" data-testid="map-stage-open">View on Map</button></div></section>';
  }
  function firstMapLocation(workspace) {
    return safeText((workspace.requests[0] && workspace.requests[0].location) || (workspace.assignments[0] && workspace.assignments[0].location) || (workspace.volunteers[0] && workspace.volunteers[0].location) || "", 180);
  }

  function firstName(name) {
    return safeText(String(name || "").split(/\s+/)[0] || "Volunteer", 40);
  }

  function renderPriorityQueue(items) {
    if (!items || !items.length) {
      return '<div class="empty-box">Load a scenario to populate the AI task priority list.</div>';
    }
    return items.slice(0, 3).map(function (item, index) {
      const title = safeText(item.title || item.summary || "Priority task", 140);
      const meta = safeText(item.location || item.district || item.date || "Route available", 120);
      const status = item.status || (index === 0 ? "High" : index === 1 ? "Medium" : "Low");
      return '<article class="priority-card"><div class="priority-card-head"><span class="priority-index">0' + String(index + 1) + '</span>' + renderStatus(status) + '</div><strong>' + escapeHtml(title) + '</strong><p class="feed-meta">' + escapeHtml(meta) + '</p></article>';
    }).join("");
  }

  function renderAiCopilotPanel(session, workspace, panelId) {
    const contextId = safeText(panelId || "default", 40) || "default";
    const history = getAiChatHistory(session.role);
    const statusClass = AI_RUNTIME.tone === "error" ? " is-error" : AI_RUNTIME.tone === "success" ? " is-success" : "";
    return [
      '<div class="notice-box' + statusClass + '">' + escapeHtml(AI_RUNTIME.status || "AI copilot is ready.") + "</div>",
      '<div class="chat-toolbar">',
      '<div class="chip-row">',
      '<span class="chip">Engine: ' + escapeHtml(aiEngineLabel()) + "</span>",
      '<span class="chip">Role: ' + escapeHtml((ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label) + "</span>",
      '<span class="chip">Scenario: ' + escapeHtml(workspace.label || "No demo") + "</span>",
      "</div>",
      '<button class="ghost-button" type="button" data-action="clear-ai-chat" data-ai-context="' + escapeHtml(contextId) + '" data-testid="clear-ai-chat-' + escapeHtml(contextId) + '">Clear Chat</button>',
      "</div>",
      '<div class="ai-quick-prompts">',
      AI_QUICK_PROMPTS.map(function (prompt, index) {
        return '<button class="inline-button ai-prompt-chip" type="button" data-action="ask-ai-prompt" data-ai-target="' + escapeHtml(contextId) + '" data-ai-prompt="' + escapeHtml(prompt) + '" data-testid="ai-prompt-' + escapeHtml(contextId) + '-' + String(index + 1) + '">' + escapeHtml(prompt) + "</button>";
      }).join(""),
      "</div>",
      '<div id="aiCopilotThread-' + escapeHtml(contextId) + '" class="chat-thread" data-testid="ai-copilot-thread-' + escapeHtml(contextId) + '">' + renderAiChatHistory(history) + "</div>",
      '<form id="aiCopilotForm-' + escapeHtml(contextId) + '" class="form-grid copilot-form" data-ai-copilot-form="' + escapeHtml(contextId) + '" data-testid="ai-copilot-form-' + escapeHtml(contextId) + '">',
      '<label><span>Ask the chatbot</span><textarea class="text-area" name="message" placeholder="Example: Which district should we prioritize in the next 2 hours?" required></textarea></label>',
      '<div class="action-stack">',
      '<button class="primary-button" type="submit" data-testid="submit-ai-copilot-' + escapeHtml(contextId) + '">' + escapeHtml(AI_RUNTIME.busy ? "Thinking..." : "Ask AI Copilot") + "</button>",
      '<a class="ghost-button" href="./operations.html" data-testid="ai-open-operations-' + escapeHtml(contextId) + '">Open Operations Board</a>',
      "</div>",
      "</form>"
    ].join("");
  }

  function renderSatellitePanel(workspace) {
    const target = getSatelliteTarget(workspace);
    if (!target) {
      return '<div class="empty-box">Load demo data to activate satellite review for the highest-priority location.</div>';
    }
    return [
      '<article class="feed-card">',
      '<div class="feed-card-head"><div><strong>' + escapeHtml(target.title) + '</strong><p class="feed-meta">' + escapeHtml(target.location) + '</p></div>' + renderStatus("Live") + "</div>",
      '<p class="card-copy">Use the free satellite links below to inspect flood spread, road access, or surface conditions around the active response point.</p>',
      '<div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(target.district) + '</span><span class="feed-chip">Lat ' + escapeHtml(target.lat.toFixed(4)) + '</span><span class="feed-chip">Lng ' + escapeHtml(target.lng.toFixed(4)) + "</span></div>",
      '<div class="action-stack satellite-actions">',
      '<button class="ghost-button" type="button" data-satellite-view="worldview" data-satellite-lat="' + escapeHtml(String(target.lat)) + '" data-satellite-lng="' + escapeHtml(String(target.lng)) + '" data-map-location="' + escapeHtml(target.location) + '" data-testid="open-satellite-worldview">Open Satellite View</button>',
      '<button class="ghost-button" type="button" data-satellite-view="google" data-satellite-lat="' + escapeHtml(String(target.lat)) + '" data-satellite-lng="' + escapeHtml(String(target.lng)) + '" data-map-location="' + escapeHtml(target.location) + '" data-testid="open-google-satellite">Google Satellite</button>',
      "</div>",
      '<p class="card-copy satellite-note"><strong>Landsat-ready workflow:</strong> Use the satellite view for quick terrain review, then move into the response board and XGBoost risk ranking for action.</p>',
      "</article>"
    ].join("");
  }

  function renderAiChatHistory(history) {
    if (!history.length) {
      return '<div class="empty-box">Ask the chatbot about high-risk districts, volunteer fit, donation gaps, or the next response move.</div>';
    }
    return history.map(function (entry) {
      const who = entry.speaker === "assistant" ? "AI Copilot" : "You";
      const meta = entry.source ? who + " - " + entry.source : who;
      return '<article class="chat-bubble chat-bubble-' + escapeHtml(entry.speaker || "assistant") + '"><div class="chat-bubble-meta"><strong>' + escapeHtml(meta) + '</strong><span>' + escapeHtml(formatChatTime(entry.timestamp)) + '</span></div><p>' + escapeHtml(entry.text) + "</p></article>";
    }).join("");
  }

  function renderBoostedSignal(prediction) {
    if (!prediction) {
      return '<div class="empty-box">Load demo data to surface the current highest-risk request.</div>';
    }
    return [
      '<article class="feed-card">',
      '<div class="feed-card-head"><div><strong>' + escapeHtml(prediction.request.title) + '</strong><p class="feed-meta">' + escapeHtml(prediction.request.district) + " - " + escapeHtml(prediction.request.location) + '</p></div>' + renderRiskBadge(prediction) + "</div>",
      '<p class="card-copy">' + escapeHtml(prediction.explanation) + "</p>",
      '<div class="prediction-meter"><span style="width:' + escapeHtml(String(prediction.score)) + '%"></span></div>',
      '<div class="action-stack" style="margin-top:14px;"><button class="ghost-button" type="button" data-map-location="' + escapeHtml(prediction.request.location) + '" data-testid="top-risk-view-map">View on Map</button></div>',
      "</article>"
    ].join("");
  }

  function renderBoostedPredictionCards(predictions) {
    if (!predictions.length) {
      return '<div class="empty-box">Load demo data to calculate boosted request scores.</div>';
    }
    return predictions.slice(0, 5).map(function (prediction) {
      return [
        '<article class="feed-card boosted-card">',
        '<div class="feed-card-head"><div><strong>' + escapeHtml(prediction.request.title) + '</strong><p class="feed-meta">' + escapeHtml(prediction.request.category) + " - " + escapeHtml(prediction.request.district) + '</p></div>' + renderRiskBadge(prediction) + "</div>",
        '<div class="feed-chip-row">',
        '<span class="feed-chip feed-chip-risk feed-chip-risk-' + escapeHtml(prediction.tone) + '">Risk ' + escapeHtml(String(prediction.score)) + "</span>",
        '<span class="feed-chip">' + escapeHtml(String(prediction.matchedVolunteerCount)) + " volunteer match(es)</span>",
        '<span class="feed-chip">' + escapeHtml(String(prediction.donationCoverage)) + "% donation cover</span>",
        '<span class="feed-chip">' + escapeHtml(normalizeRequestStatus(prediction.request.status)) + "</span>",
        "</div>",
        '<p class="card-copy"><strong>Boosted explanation:</strong> ' + escapeHtml(prediction.explanation) + "</p>",
        '<div class="prediction-meter"><span style="width:' + escapeHtml(String(prediction.score)) + '%"></span></div>',
        '<ul class="prediction-factor-list">' + prediction.factors.map(function (factor) { return "<li>" + escapeHtml(factor) + "</li>"; }).join("") + "</ul>",
        '<p class="card-copy"><strong>Recommended next move:</strong> ' + escapeHtml(prediction.recommendation) + "</p>",
        '<div class="action-stack" style="margin-top:14px;"><button class="ghost-button" type="button" data-map-location="' + escapeHtml(prediction.request.location) + '" data-testid="prediction-map-' + escapeHtml(prediction.request.id.toLowerCase()) + '">View on Map</button></div>',
        "</article>"
      ].join("");
    }).join("");
  }

  function renderProjectionCards(items, detailed) {
    if (!items || !items.length) {
      return '<div class="empty-box">Load a scenario to see projected resource gaps.</div>';
    }
    const grouped = {};
    items.forEach(function (item) {
      const key = safeText(item.category || "Other", 40);
      if (!grouped[key]) {
        grouped[key] = { category: key, beneficiaries: 0, requests: 0 };
      }
      grouped[key].beneficiaries += Number(item.beneficiaries || 0);
      grouped[key].requests += 1;
    });
    return Object.keys(grouped).slice(0, detailed ? 4 : 3).map(function (key) {
      const item = grouped[key];
      const estimate = Math.max(item.beneficiaries * (key.toLowerCase() === "medical" ? 12 : 7), item.requests * 20);
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.category) + '</strong><p class="feed-meta">' + escapeHtml(String(item.requests)) + ' request(s)</p></div><span class="metric-inline">' + escapeHtml(String(estimate)) + '</span></div><p class="card-copy">Predicted need based on visible people affected and the current district mix.</p></article>';
    }).join("");
  }

  function renderMetrics(items) {
    return '<section class="metrics-grid">' + items.map(function (item) {
      return '<article class="metric-card"><span class="metric-label">' + escapeHtml(item.label) + '</span><strong>' + escapeHtml(item.value) + '</strong><span class="metric-meta">' + escapeHtml(item.meta) + "</span></article>";
    }).join("") + "</section>";
  }

  function metric(label, value, meta) {
    return { label: label, value: value, meta: meta };
  }

  function renderRoleRows() {
    const rows = [
      { name: "Community User", role: "Community", access: "Community Portal, Donations, AI Prediction", status: "Visible" },
      { name: "Volunteer", role: "Volunteer", access: "Volunteer Portal, Directory, AI Prediction", status: "Available" },
      { name: "Government Employee", role: "Government", access: "Operations and AI Prediction", status: "Active" },
      { name: "Admin", role: "Admin", access: "All portals and AI Prediction", status: "Submitted" }
    ];
    return rows.map(function (row) {
      return "<tr><td>" + escapeHtml(row.name) + "</td><td>" + escapeHtml(row.role) + "</td><td>" + escapeHtml(row.access) + "</td><td>" + renderStatus(row.status) + "</td></tr>";
    }).join("");
  }

  function renderRequestCards(items) {
    if (!items.length) {
      return '<div class="empty-box">No active requests yet. Use Load Demo to bring in a fake disaster scenario.</div>';
    }
    const workspace = getWorkspace();
    const session = getSession();
    const canManage = session.role === "government" || session.role === "admin";
    return items.map(function (item) {
      const stage = normalizeRequestStatus(item.status);
      const prediction = predictRequestRisk(item, workspace);
      const actionButtons = [
        '<button class="ghost-button" type="button" data-map-location="' + escapeHtml(item.location) + '" data-testid="view-map-' + escapeHtml(item.id.toLowerCase()) + '">View on Map</button>'
      ];
      if (canManage && !isRequestCompleteStage(stage)) {
        actionButtons.push('<button class="ghost-button" type="button" data-action="advance-request-status" data-request-id="' + escapeHtml(item.id) + '" data-testid="advance-request-' + escapeHtml(item.id.toLowerCase()) + '">Advance Status</button>');
      }
      if (canManage && !isRequestCompleteStage(stage)) {
        actionButtons.push('<button class="ghost-button" type="button" data-action="close-request" data-request-id="' + escapeHtml(item.id) + '" data-testid="close-request-' + escapeHtml(item.id.toLowerCase()) + '">Close Request</button>');
      }
      return '<article id="' + escapeHtml(buildAnchorId("request", item.id || item.title)) + '" class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.summary) + '</p></div>' + renderStatus(stage) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.category) + '</span><span class="feed-chip">' + escapeHtml(item.district) + '</span><span class="feed-chip">' + escapeHtml(String(item.beneficiaries)) + ' beneficiaries</span><span class="feed-chip">' + escapeHtml(item.priority) + '</span><span class="feed-chip feed-chip-risk feed-chip-risk-' + escapeHtml(prediction.tone) + '">Risk ' + escapeHtml(String(prediction.score)) + '</span></div>' + renderStepper(stage) + '<p class="card-copy"><strong>Boosted triage:</strong> ' + escapeHtml(prediction.explanation) + '</p><p class="card-copy"><strong>AI match:</strong> ' + escapeHtml(item.ai) + '</p><div class="action-stack" style="margin-top:14px;">' + actionButtons.join("") + '</div></article>';
    }).join("");
  }
  function renderAssignmentCards(items) {
    if (!items.length) {
      return '<div class="empty-box">No assignments are visible yet. Load a demo scenario to populate assignments.</div>';
    }
    const session = getSession();
    return items.map(function (item) {
      const normalizedStatus = normalizeAssignmentStatus(item.status);
      const actions = ['<button class="ghost-button" type="button" data-map-location="' + escapeHtml(item.location) + '" data-testid="assignment-map-' + escapeHtml(item.id.toLowerCase()) + '">View on Map</button>'];
      if (!isAssignmentCompleteStage(normalizedStatus)) {
        actions.push('<button class="ghost-button" type="button" data-action="advance-assignment-status" data-assignment-id="' + escapeHtml(item.id) + '" data-testid="advance-assignment-' + escapeHtml(item.id.toLowerCase()) + '">' + escapeHtml(session.role === "volunteer" ? "Update Progress" : "Advance Assignment") + '</button>');
      }
      return '<article id="' + escapeHtml(buildAnchorId("assignment", item.id || item.title)) + '" class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.volunteer) + ' - ' + escapeHtml(item.date) + '</p></div>' + renderStatus(normalizedStatus) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.district) + '</span><span class="feed-chip">' + escapeHtml(item.location) + '</span><span class="feed-chip">' + escapeHtml(String(item.points)) + ' pts</span></div><div class="action-stack" style="margin-top:14px;">' + actions.join("") + '</div></article>';
    }).join("");
  }
  function renderArchiveCards(items) {
    if (!items.length) {
      return '<div class="empty-box">Completed volunteer work will appear here once assignments are finished.</div>';
    }
    return items.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.volunteer) + ' - ' + escapeHtml(item.date) + '</p></div>' + renderStatus(item.status) + '</div><p class="card-copy">' + escapeHtml(item.location) + ' - ' + escapeHtml(item.district) + '</p></article>';
    }).join("");
  }
  function renderVolunteerPreviewCards(items) {
    if (!items.length) {
      return '<div class="empty-box">Load demo data to preview the volunteer network.</div>';
    }
    return items.slice(0, 3).map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.name) + '</strong><p class="feed-meta">' + escapeHtml(item.ngo) + '</p></div>' + renderStatus(item.availability) + '</div><p class="card-copy">' + escapeHtml(item.skills.join(", ")) + ' - ' + escapeHtml(item.location) + '</p><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(String(item.reliability || 72)) + '% reliable</span></div></article>';
    }).join("");
  }
  function renderStatusBoard(items) {
    const counts = buildRequestStageCounts(items);
    return '<div class="status-board">' + REQUEST_STAGES.map(function (stage) {
      return '<article class="status-card"><span class="status-card-label">' + escapeHtml(stage) + '</span><strong>' + escapeHtml(String(counts[stage] || 0)) + '</strong><span class="status-card-meta">' + escapeHtml(statusMetaCopy(stage)) + "</span></article>";
    }).join("") + "</div>";
  }

  function renderCommunityTracker(items) {
    if (!items.length) {
      return '<div class="empty-box">Submit a request or load a demo scenario to populate the community tracker.</div>';
    }
    return items.slice(0, 5).map(function (item) {
      const stage = normalizeRequestStatus(item.status);
      return '<article id="' + escapeHtml(buildAnchorId("request", item.id || item.title)) + '" class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.district) + ' - ' + escapeHtml(item.location) + '</p></div>' + renderStatus(stage) + '</div>' + renderStepper(stage) + '<div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.category) + '</span><span class="feed-chip">' + escapeHtml(String(item.beneficiaries)) + ' people</span><span class="feed-chip">' + escapeHtml(item.priority) + '</span></div></article>';
    }).join("");
  }

  function renderWorkflowCards(items) {
    if (!items.length) {
      return '<div class="empty-box">Load a scenario to see how requests move through AI triage, matching, and field delivery.</div>';
    }
    return items.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div></div><p class="card-copy">' + escapeHtml(item.copy) + "</p></article>";
    }).join("");
  }

  function renderDistrictSummaryCards(workspace) {
    const summaries = buildDistrictSummary(workspace);
    if (!summaries.length) {
      return '<div class="empty-box">District pressure will appear after you load a scenario.</div>';
    }
    return summaries.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.district) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div>' + renderStatus(item.status) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(String(item.requests)) + ' requests</span><span class="feed-chip">' + escapeHtml(String(item.assignments)) + ' assignments</span><span class="feed-chip">' + escapeHtml(String(item.beneficiaries)) + ' beneficiaries</span></div><p class="card-copy">' + escapeHtml(item.copy) + "</p></article>";
    }).join("");
  }

  function renderStepper(stage) {
    const currentIndex = REQUEST_STAGES.indexOf(normalizeRequestStatus(stage));
    return '<div class="status-stepper">' + REQUEST_STAGES.map(function (label, index) {
      const className = index < currentIndex ? "status-step is-complete" : index === currentIndex ? "status-step is-current" : "status-step";
      return '<span class="' + className + '">' + escapeHtml(label) + "</span>";
    }).join("") + "</div>";
  }

  function renderScenarioOptions(selectedScenario) {
    const current = safeText(selectedScenario, 30).toLowerCase();
    return ['<option value="none"' + (current === "none" ? " selected" : "") + '>No demo selected</option>'].concat(Object.keys(SCENARIO_PRESETS).map(function (key) {
      const preset = SCENARIO_PRESETS[key];
      return '<option value="' + escapeHtml(key) + '"' + (current === key ? " selected" : "") + '>' + escapeHtml(preset.label) + "</option>";
    })).join("");
  }

  function renderImpactCards(workspace) {
    if (!workspace.requests.length) {
      return '<div class="empty-box">Load demo data to turn the impact page into a real story.</div>';
    }
    return ["Requests entered through the community portal and became visible in the live feed.", "The AI matched volunteers based on skills, district, and current availability.", "Assignments were routed with quick map links so field teams could move immediately.", "Donation records gave admins a clear view of money and item support."].map(function (line) {
      return '<article class="feed-card"><p class="card-copy">' + escapeHtml(line) + "</p></article>";
    }).join("");
  }

  function renderListCards(items) {
    if (!items.length) {
      return '<div class="empty-box">No records to show yet.</div>';
    }
    return items.map(function (item) {
      return '<article class="feed-card"><p class="card-copy">' + escapeHtml(item) + "</p></article>";
    }).join("");
  }

  function renderNotificationCards(items) {
    if (!items.length) {
      return '<div class="empty-box">No new notifications yet.</div>';
    }
    return items.map(function (item) {
      const unread = item.unread !== false;
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + (unread ? '<span class="feed-unread-dot" aria-label="Unread notification"></span>' : '') + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div><div class="feed-card-actions">' + renderStatus(item.status) + (item.id ? '<button class="ghost-button compact-button" type="button" data-action="mark-notification-read" data-notification-id="' + escapeHtml(item.id) + '">' + escapeHtml(unread ? "Mark Read" : "Read") + '</button>' : '') + '</div></div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("");
  }

  function renderNotificationInbox(items, roleLabel) {
    if (!items.length) {
      return '<article class="surface-card"><p class="section-label">Notification Inbox</p><h2 class="section-title">No alerts for ' + escapeHtml(roleLabel) + '</h2><div class="empty-box">Load a scenario or continue working to populate the inbox.</div></article>';
    }
    const groups = [
      { key: "Requests", label: "Requests" },
      { key: "Assignments", label: "Assignments" },
      { key: "Donations", label: "Donations" },
      { key: "System", label: "System" }
    ].map(function (group) {
      const matches = items.filter(function (item) {
        const meta = normalizeSearchQuery(item.meta);
        const title = normalizeSearchQuery(item.title);
        if (group.key === "Requests") return meta.indexOf("request") !== -1 || title.indexOf("request") !== -1 || title.indexOf("pending") !== -1;
        if (group.key === "Assignments") return meta.indexOf("assignment") !== -1 || meta.indexOf("volunteer") !== -1 || title.indexOf("assignment") !== -1;
        if (group.key === "Donations") return meta.indexOf("donation") !== -1 || title.indexOf("donation") !== -1;
        return meta.indexOf("request") === -1 && meta.indexOf("assignment") === -1 && meta.indexOf("donation") === -1;
      }).slice(0, 4);
      return {
        key: group.key,
        label: group.label,
        items: matches
      };
    }).filter(function (group) {
      return group.items.length;
    });
    const unreadCount = items.filter(function (item) { return item.unread !== false; }).length;
    return '<article class="surface-card"><div class="section-head"><div><p class="section-label">Notification Inbox</p><h2 class="section-title">' + escapeHtml(roleLabel) + ' alerts and updates</h2></div><div class="feed-card-actions"><span class="feed-chip">' + escapeHtml(String(unreadCount)) + ' unread</span><button class="ghost-button compact-button" type="button" data-action="mark-all-notifications-read" data-testid="mark-all-notifications-read">Mark all read</button></div></div><div class="notification-inbox-groups">' + groups.map(function (group) {
      return '<section class="notification-inbox-group"><div class="feed-card-head"><div><strong>' + escapeHtml(group.label) + '</strong><p class="feed-meta">' + escapeHtml(String(group.items.filter(function (item) { return item.unread !== false; }).length)) + ' unread</p></div></div><div class="feed-list">' + renderNotificationCards(group.items) + '</div></section>';
    }).join("") + '</div></article>';
  }

  function renderRouteGroups(workspace) {
    const groups = buildRouteGroups(workspace);
    if (!groups.length) {
      return '<div class="empty-box">Load a scenario to group route-ready locations.</div>';
    }
    return groups.map(function (group) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(group.title) + '</strong><p class="feed-meta">' + escapeHtml(group.meta) + '</p></div>' + renderStatus(group.status) + '</div><p class="card-copy">' + escapeHtml(group.copy) + '</p><div class="feed-chip-row">' + group.locations.map(function (location) { return '<span class="feed-chip">' + escapeHtml(location) + '</span>'; }).join("") + '</div></article>';
    }).join("");
  }

  function renderDistrictComparisonCards(workspace) {
    const items = buildDistrictComparison(workspace);
    if (!items.length) {
      return '<div class="empty-box">District comparison appears after a scenario is loaded.</div>';
    }
    return items.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.district) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div>' + renderStatus(item.status) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(String(item.pressure)) + '% pressure</span><span class="feed-chip">' + escapeHtml(String(item.completion)) + '% completion</span><span class="feed-chip">' + escapeHtml(String(item.donations)) + ' donations</span></div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("");
  }

  function renderDonationBreakdownCards(workspace) {
    const items = buildDonationBreakdown(workspace);
    if (!items.length) {
      return '<div class="empty-box">Donation breakdown updates when donation data is visible.</div>';
    }
    return items.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.label) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div><span class="metric-inline">' + escapeHtml(item.value) + '</span></div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("");
  }

  function renderDonationWorkflowBoard(items) {
    const counts = buildDonationStageCounts(items);
    return '<div class="status-board">' + DONATION_STAGES.map(function (stage) {
      return '<article class="status-card"><span class="status-card-label">' + escapeHtml(stage) + '</span><strong>' + escapeHtml(String(counts[stage] || 0)) + '</strong><span class="status-card-meta">' + escapeHtml(donationStageMeta(stage)) + '</span></article>';
    }).join("") + '</div>';
  }

  function renderAnalyticsCards(items) {
    if (!items.length) {
      return '<div class="empty-box">Analytics become visible once the workspace has live scenario data.</div>';
    }
    return items.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div><span class="metric-inline">' + escapeHtml(item.value) + '</span></div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("");
  }

  function renderVolunteerGrowthCards(snapshot) {
    return renderAnalyticsCards([
      { title: "NGO Group", meta: "Current affiliation", value: snapshot.ngoGroup, copy: "Your current profile ties this volunteer lane back to the NGO or response group you belong to." },
      { title: "Attendance Streak", meta: "Current volunteer rhythm", value: String(snapshot.streak) + " days", copy: "Streaks rise when you keep active tasks moving and close work consistently." },
      { title: "Reliability Score", meta: "Trust and delivery signal", value: String(snapshot.reliability) + "%", copy: "Reliability combines completed work, current load, and attendance into one readable score." }
    ]);
  }

  function renderDemoWalkthroughCards(workspace) {
    const steps = buildMatchingSteps(workspace);
    if (!steps.length) {
      return '<div class="empty-box">Load a scenario to turn on the walkthrough story for judges and reviewers.</div>';
    }
    return steps.map(function (step, index) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>Step ' + escapeHtml(String(index + 1)) + '</strong><p class="feed-meta">' + escapeHtml(step.meta) + '</p></div>' + renderStatus(index === steps.length - 1 ? "Ready" : "Live") + '</div><p class="card-copy"><strong>' + escapeHtml(step.title) + ':</strong> ' + escapeHtml(step.copy) + '</p></article>';
    }).join("");
  }

  function renderBeforeAfterCards(workspace) {
    const top = buildDistrictSummary(workspace)[0];
    const requests = (workspace.requests || []).length;
    const assignments = (workspace.assignments || []).length;
    const beneficiaries = totalBeneficiaries(workspace);
    return renderAnalyticsCards([
      {
        title: "Before ResourceFlow",
        meta: "Scattered calls and spreadsheets",
        value: requests ? "Low visibility" : "Idle",
        copy: "Requests, donors, and volunteers stay disconnected, so districts with the highest pressure are harder to spot quickly."
      },
      {
        title: "After ResourceFlow",
        meta: top ? top.district : "Shared dashboard",
        value: beneficiaries ? String(beneficiaries) + " visible" : "Live",
        copy: "Requests, assignments, donations, and AI reasoning move into one readable board so teams can act faster with clearer proof."
      },
      {
        title: "Active Improvement",
        meta: "Scenario-driven outcome",
        value: assignments ? String(assignments) + " matched" : "0",
        copy: "The current demo shows how the platform turns visible demand into volunteer matches, donation routing, and measurable progress."
      }
    ]);
  }

  function renderDonationLinkingCards(workspace) {
    const requests = (workspace.requests || []).slice(0, 4);
    if (!requests.length) {
      return '<div class="empty-box">Load or submit requests first to link donations to real needs.</div>';
    }
    return requests.map(function (request) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(request.title) + '</strong><p class="feed-meta">' + escapeHtml(request.district) + ' · ' + escapeHtml(request.category) + '</p></div>' + renderStatus(normalizeRequestStatus(request.status)) + '</div><p class="card-copy">Use this request title or ID when saving a donation so admins can connect support directly to the visible lifecycle.</p><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(String(request.beneficiaries || 0)) + ' people</span><span class="feed-chip">' + escapeHtml(request.id || "Request") + '</span></div></article>';
    }).join("");
  }

  function renderLeaderboardCards(workspace) {
    const board = buildVolunteerLeaderboard(workspace);
    if (!board.length) {
      return '<div class="empty-box">Load a scenario to compare volunteer momentum.</div>';
    }
    return board.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.name) + '</strong><p class="feed-meta">' + escapeHtml(item.ngo) + '</p></div><span class="metric-inline">#' + escapeHtml(String(item.rank)) + '</span></div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(String(item.points)) + ' pts</span><span class="feed-chip">' + escapeHtml(String(item.completed)) + ' closed</span><span class="feed-chip">' + escapeHtml(String(item.reliability)) + '% reliable</span></div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("");
  }

  function renderApprovalCards(items) {
    if (!items.length) {
      return '<div class="empty-box">No approval items are waiting right now.</div>';
    }
    return items.map(function (item) {
      const actions = Array.isArray(item.actions) && item.actions.length
        ? '<div class="feed-card-actions">' + item.actions.map(function (action) {
            return '<button class="' + escapeHtml(action.tone || "ghost-button compact-button") + '" type="button" data-action="' + escapeHtml(action.action || "") + '" data-request-id="' + escapeHtml(action.requestId || "") + '" data-donation-id="' + escapeHtml(action.donationId || "") + '" data-assignment-id="' + escapeHtml(action.assignmentId || "") + '" data-flagged-state="' + escapeHtml(action.flaggedState || "") + '" data-testid="' + escapeHtml(action.testId || "") + '">' + escapeHtml(action.label) + '</button>';
          }).join("") + '</div>'
        : "";
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div>' + renderStatus(item.status) + '</div><p class="card-copy">' + escapeHtml(item.copy) + '</p>' + actions + '</article>';
    }).join("");
  }

  function buildVolunteerSnapshot(session, workspace) {
    const portalProfile = session.profile || {};
    const sharedVolunteer = workspace.volunteers.find(function (item) {
      return safeText(item.name || "", 120).toLowerCase() === safeText(portalProfile.fullName || session.name || "", 120).toLowerCase();
    }) || null;
    const baseName = safeText(portalProfile.fullName || session.name || "", 120).toLowerCase();
    const assignments = workspace.assignments.filter(function (item) {
      return baseName && safeText(item.volunteer, 120).toLowerCase() === baseName;
    });
    const activeTasks = assignments.filter(function (item) { return !isAssignmentCompleteStage(item.status); });
    const archive = assignments.filter(function (item) { return isAssignmentCompleteStage(item.status); });
    const fallbackAssignments = assignments.length ? assignments : workspace.assignments.slice(0, 3);
    const points = fallbackAssignments.reduce(function (sum, item) { return sum + Number(item.points || 0); }, 0);
    const reliability = Math.max(68, Math.min(99, computeVolunteerReliability(sharedVolunteer || { name: session.name }, workspace.assignments) + archive.length * 2));
    return {
      summary: assignments.length ? "You currently have " + activeTasks.length + " active task(s) and " + archive.length + " completed task(s) in the demo workspace." : "No personal assignments are linked yet, so the portal is showing the live volunteer opportunities from the current scenario.",
      district: topDistrict(workspace) || "No district yet",
      personalAssignments: assignments.length,
      points: points,
      completed: archive.length,
      attendance: Math.max(archive.length + (activeTasks.length ? 1 : 0), assignments.length ? 4 : 0),
      streak: Math.max(archive.length, assignments.length ? 3 : 1),
      activeTasks: activeTasks.length ? activeTasks : workspace.assignments.slice(0, 3),
      archive: archive.length ? archive : workspace.assignments.filter(function (item) { return isAssignmentCompleteStage(item.status); }).slice(0, 3),
      badges: buildVolunteerBadges(points, archive.length),
      reliability: reliability,
      ngoGroup: safeText(portalProfile.ngoGroup || (sharedVolunteer && sharedVolunteer.ngo) || "Relief Network", 120)
    };
  }

  function buildVolunteerBadges(points, completed) {
    const badges = [];
    if (completed >= 1) badges.push("First Response");
    if (completed >= 2) badges.push("Steady Support");
    if (points >= 50) badges.push("High Impact");
    if (completed >= 3) badges.push("Reliable Closer");
    return badges.length ? badges : ["Ready To Respond"];
  }

  function buildInsightItems(workspace) {
    if (!workspace.requests.length) {
      return [{ title: "Load demo data", meta: "No active scenario", copy: "Use the quick actions to load a flood, cyclone, or medical demo scenario." }];
    }
    const topRequest = workspace.requests[0];
    const topPrediction = buildBoostedPredictionRows(workspace)[0] || null;
    const volunteerFit = matchVolunteerToRequest(topRequest, workspace);
    const district = topDistrict(workspace) || "No district";
    return [
      { title: "Top pressure district", meta: district, copy: "The system is focusing on " + district + " because that area currently combines the highest need, visible urgency, and the biggest coordination pressure." },
      { title: "Best volunteer fit", meta: volunteerFit ? volunteerFit.name : (workspace.assignments.length + " assignment(s)"), copy: volunteerFit ? (volunteerFit.name + " is the strongest match because their skills, district fit, and availability line up best with the current top request.") : topRequest.ai },
      { title: "Boosted risk signal", meta: topPrediction ? (topPrediction.request.district + " - " + String(topPrediction.score) + "/100") : (workspace.label || "Scenario"), copy: topPrediction ? ("This request is surfacing first because " + safeText(topPrediction.recommendation, 220).replace(/^Prioritize /i, "").replace(/\.$/, "") + ".") : "Load a scenario to activate the boosted ranking engine." }
    ];
  }

  function matchVolunteerToRequest(request, workspace) {
    if (!request || !workspace) {
      return null;
    }
    return pickBestVolunteerForRequest(request, workspace) || null;
  }

  function workspaceMetrics(workspace) {
    return [
      metric("Total Requests", String(workspace.requests.length), "Community needs captured in the active scenario."),
      metric("Volunteers Ready", String(workspace.volunteers.length), "Visible responders in the current scenario."),
      metric("Assignments", String(workspace.assignments.length), "AI-generated or manually confirmed matches."),
      metric("Beneficiaries", String(totalBeneficiaries(workspace)), "Projected people supported by current requests.")
    ];
  }

  function totalBeneficiaries(workspace) {
    return workspace.requests.reduce(function (sum, item) {
      return sum + Number(item.beneficiaries || 0);
    }, 0);
  }

  function topDistrict(workspace) {
    const counts = {};
    workspace.requests.forEach(function (item) {
      const district = safeText(item.district, 80);
      if (district) {
        counts[district] = (counts[district] || 0) + Number(item.beneficiaries || 1);
      }
    });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || "";
  }

  function formatDonationLine(item) {
    if (item.kind === "money") {
      return formatCurrency(item.amount) + " via " + safeText(item.paymentMethod || "money", 40);
    }
    return safeText(item.itemType || "Item", 40) + " - Qty " + safeText(item.quantity || "1", 20);
  }
  function buildRequestStageCounts(items) {
    const counts = {};
    REQUEST_STAGES.forEach(function (stage) {
      counts[stage] = 0;
    });
    items.forEach(function (item) {
      counts[normalizeRequestStatus(item.status)] += 1;
    });
    return counts;
  }

  function statusMetaCopy(stage) {
    if (stage === "Pending") return "Fresh community requests waiting for first review.";
    if (stage === "Reviewed") return "Requests checked and ready for assignment.";
    if (stage === "Assigned") return "A team or volunteer has been attached.";
    if (stage === "In Progress") return "Field work is currently active.";
    if (stage === "Delivered") return "Support delivered and visible in the archive.";
    return "Request closed after delivery, verification, or escalation completion.";
  }

  function buildMatchingSteps(workspace) {
    if (!workspace.requests.length) {
      return [];
    }
    const request = workspace.requests[0];
    const assignment = workspace.assignments[0];
    const volunteer = workspace.volunteers[0];
    const donation = workspace.donations[0];
    return [
      {
        title: "1. Intake and triage",
        meta: workspace.label || "Scenario",
        copy: request.title + " entered from " + request.district + " with " + String(request.beneficiaries) + " people affected."
      },
      {
        title: "2. Skill and district match",
        meta: assignment ? assignment.volunteer : (volunteer ? volunteer.name : "Volunteer fit pending"),
        copy: request.ai || "The AI looks at skills, district fit, and current availability before recommending a responder."
      },
      {
        title: "3. Dispatch and movement",
        meta: assignment ? assignment.location : request.location,
        copy: "The operations team uses the assignment board and View on Map links to move the right team to the right location."
      },
      {
        title: "4. Delivery and proof",
        meta: donation ? formatDonationLine(donation) : "Donation proof pending",
        copy: donation ? ("Donation support from " + donation.donor + " backs the request and gives admins clear proof of movement and support.") : "When donations arrive, admins can connect them to the active request and show end-to-end proof."
      }
    ];
  }

  function buildBoostedPredictionRows(workspace) {
    if (!workspace || !workspace.requests || !workspace.requests.length) {
      return [];
    }
    return workspace.requests.map(function (request) {
      return predictRequestRisk(request, workspace);
    }).sort(function (a, b) {
      return b.score - a.score;
    });
  }

  function predictRequestRisk(request, workspace) {
    const features = buildRequestFeatures(request, workspace);
    const score = scoreBoostedTree(features);
    const tone = score >= 80 ? "critical" : score >= 60 ? "high" : score >= 40 ? "medium" : "low";
    const band = score >= 80 ? "Critical Risk" : score >= 60 ? "High Risk" : score >= 40 ? "Watchlist" : "Stable";
    return {
      request: request,
      score: score,
      tone: tone,
      band: band,
      matchedVolunteerCount: features.matchedVolunteerCount,
      donationCoverage: Math.round(features.donationCoverage * 100),
      explanation: buildPredictionExplanation(request, features, score),
      recommendation: buildPredictionRecommendation(request, features, score),
      factors: buildPredictionFactors(request, features)
    };
  }

  function buildRequestFeatures(request, workspace) {
    const category = safeText(request.category, 60).toLowerCase();
    const district = safeText(request.district, 80).toLowerCase();
    const relevantSkills = CATEGORY_SKILLS[category] || ["coordination", "support", "logistics"];
    const relevantDonations = CATEGORY_DONATIONS[category] || ["money", "other useful items"];
    const districtMax = Math.max.apply(null, buildDistrictSummary(workspace).map(function (item) {
      return Number(item.beneficiaries || 0);
    }).concat([1]));
    const districtLoad = workspace.requests.filter(function (item) {
      return safeText(item.district, 80).toLowerCase() === district;
    }).reduce(function (sum, item) {
      return sum + Number(item.beneficiaries || 0);
    }, 0);
    const matchingVolunteers = workspace.volunteers.filter(function (volunteer) {
      const location = safeText(volunteer.location, 120).toLowerCase();
      const skills = joinSkills(volunteer.skills).toLowerCase();
      const districtMatch = district && location.indexOf(district) !== -1;
      const skillMatch = relevantSkills.some(function (keyword) { return skills.indexOf(keyword) !== -1; });
      return districtMatch || skillMatch;
    });
    const matchingDonations = workspace.donations.filter(function (donation) {
      const kind = safeText(donation.kind, 40).toLowerCase();
      const itemType = safeText(donation.itemType || donation.kind, 80).toLowerCase();
      return relevantDonations.some(function (keyword) {
        return itemType.indexOf(keyword) !== -1 || kind.indexOf(keyword) !== -1 || (keyword === "money" && kind === "money");
      });
    });
    const priorityWeight = priorityScore(request.priority);
    const stage = normalizeRequestStatus(request.status);
    const stageIndex = REQUEST_STAGES.indexOf(stage);
    const assignmentGap = stageIndex <= 0 ? 1 : stageIndex === 1 ? 0.82 : stageIndex === 2 ? 0.54 : stageIndex === 3 ? 0.2 : 0.04;
    const volunteerCoverage = clamp01(matchingVolunteers.length / 3);
    const donationCoverage = clamp01(matchingDonations.length / 2);
    const stagnation = stageIndex <= 1 ? 0.9 : stageIndex === 2 ? 0.48 : stageIndex === 3 ? 0.2 : 0.06;
    return {
      beneficiaryDensity: clamp01(Number(request.beneficiaries || 0) / 220),
      priorityWeight: priorityWeight,
      assignmentGap: assignmentGap,
      volunteerCoverage: volunteerCoverage,
      donationCoverage: donationCoverage,
      districtPressure: clamp01(districtLoad / districtMax),
      stagnation: stagnation,
      medicalRisk: category === "medical" ? 1 : 0,
      shelterRisk: category === "shelter" ? 1 : 0,
      foodRisk: category === "food" ? 1 : 0,
      matchedVolunteerCount: matchingVolunteers.length,
      matchingDonationCount: matchingDonations.length
    };
  }

  function scoreBoostedTree(features) {
    let margin = -0.44;
    margin += features.beneficiaryDensity > 0.72 ? 0.54 : features.beneficiaryDensity > 0.45 ? 0.28 : -0.05;
    margin += features.priorityWeight > 0.84 ? 0.66 : features.priorityWeight > 0.58 ? 0.28 : -0.08;
    margin += features.assignmentGap > 0.78 ? 0.42 : features.assignmentGap > 0.45 ? 0.2 : -0.12;
    margin += features.volunteerCoverage < 0.2 ? 0.52 : features.volunteerCoverage < 0.5 ? 0.24 : -0.14;
    margin += features.donationCoverage < 0.2 ? 0.34 : features.donationCoverage < 0.5 ? 0.14 : -0.08;
    margin += features.districtPressure > 0.7 ? 0.36 : features.districtPressure > 0.45 ? 0.16 : -0.04;
    margin += features.stagnation > 0.7 ? 0.26 : features.stagnation > 0.35 ? 0.08 : -0.04;
    margin += features.medicalRisk && features.volunteerCoverage < 0.5 ? 0.18 : 0;
    margin += features.shelterRisk && features.assignmentGap > 0.45 ? 0.16 : 0;
    margin += features.foodRisk && features.donationCoverage < 0.5 ? 0.12 : 0;
    return Math.max(1, Math.min(99, Math.round((1 / (1 + Math.exp(-margin))) * 100)));
  }

  function buildPredictionExplanation(request, features, score) {
    const parts = [];
    parts.push(request.district + " is showing " + Math.round(features.districtPressure * 100) + "% of the current district pressure.");
    if (features.volunteerCoverage < 0.5) {
      parts.push("Volunteer coverage is limited for this category.");
    }
    if (features.donationCoverage < 0.5) {
      parts.push("Donation support is still thin for this need.");
    }
    if (features.assignmentGap > 0.5) {
      parts.push("The request has not progressed far enough in the response pipeline.");
    }
    if (score >= 80) {
      parts.push("The model would move this to the top of the queue immediately.");
    }
    return parts.join(" ");
  }

  function buildPredictionRecommendation(request, features, score) {
    const moves = [];
    if (features.volunteerCoverage < 0.5) {
      moves.push("pull volunteers with " + joinPredictionSkills(request.category));
    }
    if (features.donationCoverage < 0.5) {
      moves.push("surface matching donations");
    }
    if (features.assignmentGap > 0.5) {
      moves.push("advance the request from review into assignment");
    }
    if (!moves.length) {
      moves.push("keep the assignment active and monitor field completion");
    }
    return (score >= 70 ? "Prioritize now: " : "Monitor closely: ") + moves.join(", ") + ".";
  }

  function buildPredictionFactors(request, features) {
    const items = [
      Math.round(features.priorityWeight * 100) + "% priority weight",
      Math.round(features.beneficiaryDensity * 100) + "% beneficiary pressure",
      Math.round((1 - features.volunteerCoverage) * 100) + "% volunteer gap",
      Math.round((1 - features.donationCoverage) * 100) + "% donation gap"
    ];
    if (safeText(request.category, 60).toLowerCase() === "medical") {
      items.push("Medical category gets extra urgency weighting.");
    }
    return items;
  }

  function renderRiskBadge(prediction) {
    return '<span class="risk-badge risk-badge-' + escapeHtml(prediction.tone) + '">' + escapeHtml(prediction.band) + " - " + escapeHtml(String(prediction.score)) + "</span>";
  }

  function getSatelliteTarget(workspace) {
    const topPrediction = buildBoostedPredictionRows(workspace)[0];
    const request = topPrediction ? topPrediction.request : (workspace.requests && workspace.requests[0]);
    if (!request) {
      return null;
    }
    const lat = Number(request.lat);
    const lng = Number(request.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    return {
      title: request.title,
      district: request.district,
      location: request.location,
      lat: lat,
      lng: lng
    };
  }

  function buildSatelliteWorldviewUrl(lat, lng) {
    const west = (lng - 0.18).toFixed(4);
    const south = (lat - 0.12).toFixed(4);
    const east = (lng + 0.18).toFixed(4);
    const north = (lat + 0.12).toFixed(4);
    const day = new Date().toISOString().slice(0, 10);
    return "https://worldview.earthdata.nasa.gov/?v=" + west + "," + south + "," + east + "," + north + "&t=" + day + "T00%3A00%3A00Z";
  }

  function buildGoogleSatelliteUrl(lat, lng, location) {
    const query = Number.isFinite(lat) && Number.isFinite(lng) ? (String(lat) + "," + String(lng)) : location;
    return "https://www.google.com/maps?q=" + encodeURIComponent(query) + "&t=k";
  }

  function priorityScore(priority) {
    const normalized = safeText(priority, 40).toLowerCase();
    if (normalized.indexOf("critical") !== -1) return 1;
    if (normalized.indexOf("high") !== -1) return 0.82;
    if (normalized.indexOf("medium") !== -1) return 0.56;
    if (normalized.indexOf("low") !== -1) return 0.28;
    return 0.48;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value || 0)));
  }

  function finiteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function distanceKm(fromLat, fromLng, toLat, toLng) {
    const startLat = finiteNumber(fromLat);
    const startLng = finiteNumber(fromLng);
    const endLat = finiteNumber(toLat);
    const endLng = finiteNumber(toLng);
    if (startLat == null || startLng == null || endLat == null || endLng == null) {
      return null;
    }
    const toRad = function (value) {
      return value * Math.PI / 180;
    };
    const earthRadiusKm = 6371;
    const deltaLat = toRad(endLat - startLat);
    const deltaLng = toRad(endLng - startLng);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(toRad(startLat)) * Math.cos(toRad(endLat)) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  function joinPredictionSkills(category) {
    return (CATEGORY_SKILLS[safeText(category, 60).toLowerCase()] || ["coordination", "support"]).slice(0, 3).join(", ");
  }

  function aiEngineLabel() {
    if (AI_RUNTIME.engine === "gemini-secure") return "Gemini secure backend";
    if (AI_RUNTIME.engine === "gemini-direct") return "Gemini direct";
    return "Local boosted engine";
  }

  function buildDistrictSummary(workspace) {
    const bucket = {};
    workspace.requests.forEach(function (request) {
      const key = request.district || "Unknown";
      if (!bucket[key]) {
        bucket[key] = { district: key, requests: 0, assignments: 0, beneficiaries: 0 };
      }
      bucket[key].requests += 1;
      bucket[key].beneficiaries += Number(request.beneficiaries || 0);
    });
    workspace.assignments.forEach(function (assignment) {
      const key = assignment.district || "Unknown";
      if (!bucket[key]) {
        bucket[key] = { district: key, requests: 0, assignments: 0, beneficiaries: 0 };
      }
      bucket[key].assignments += 1;
    });
    return Object.keys(bucket).map(function (key) {
      const item = bucket[key];
      const stage = item.assignments >= item.requests && item.requests > 0 ? "In Progress" : item.requests ? "Reviewed" : "Pending";
      return {
        district: item.district,
        requests: item.requests,
        assignments: item.assignments,
        beneficiaries: item.beneficiaries,
        status: stage,
        meta: "District pressure and response coverage",
        copy: item.requests ? ("This district has " + item.requests + " visible request(s) and " + item.assignments + " assignment(s) linked to them.") : "No active requests yet, but the district remains visible for coordination."
      };
    }).sort(function (a, b) {
      return b.beneficiaries - a.beneficiaries || b.requests - a.requests;
    }).slice(0, 4);
  }

  function buildNotifications(workspace, session) {
    const notices = [];
    const latestRequest = workspace.requests[0];
    const latestAssignment = workspace.assignments[0];
    const latestDonation = workspace.donations[0];
    const volunteerSnapshot = session && session.role === "volunteer" ? buildVolunteerSnapshot(session, workspace) : null;
    (workspace.audit || []).slice(0, 12).forEach(function (entry) {
      const line = safeText(entry, 260);
      const normalized = line.toLowerCase();
      if (!line) {
        return;
      }
      if (normalized.indexOf("shift") !== -1 || normalized.indexOf("reassign") !== -1) {
        notices.push({
          title: "Assignment shifted",
          meta: "Lifecycle automation",
          status: "Shifted",
          copy: line
        });
        return;
      }
      if (normalized.indexOf("completed") !== -1 || normalized.indexOf("delivered") !== -1) {
        notices.push({
          title: "Completion update",
          meta: "Volunteer / delivery progress",
          status: "Completed",
          copy: line
        });
        return;
      }
      if (normalized.indexOf("in progress") !== -1) {
        notices.push({
          title: "Field work in progress",
          meta: "Live assignment update",
          status: "In Progress",
          copy: line
        });
        return;
      }
      if (normalized.indexOf("matched") !== -1 || normalized.indexOf("assigned") !== -1) {
        notices.push({
          title: "Assignment created",
          meta: "AI / operator matching",
          status: "Assigned",
          copy: line
        });
        return;
      }
      if (normalized.indexOf("pending") !== -1 || normalized.indexOf("submitted") !== -1 || normalized.indexOf("broadcast") !== -1) {
        notices.push({
          title: "New pending request",
          meta: "Request intake",
          status: "Pending",
          copy: line
        });
      }
    });

    if (latestRequest) {
      notices.push({
        title: latestRequest.title,
        meta: latestRequest.district + " · " + normalizeRequestStatus(latestRequest.status),
        status: normalizeRequestStatus(latestRequest.status),
        copy: "Latest request now visible in the lifecycle with " + String(latestRequest.beneficiaries || 0) + " people affected."
      });
    }
    if (latestAssignment) {
      notices.push({
        title: latestAssignment.title,
        meta: latestAssignment.volunteer + " · " + latestAssignment.district,
        status: normalizeAssignmentStatus(latestAssignment.status),
        copy: "Assignment created for " + latestAssignment.location + " and ready for route follow-up."
      });
    }
    if (latestDonation) {
      notices.push({
        title: latestDonation.donor + " donation",
        meta: formatDonationLine(latestDonation),
        status: normalizeDonationLifecycle(latestDonation.status),
        copy: "Donation tracking is now connected to the response story and admin review board."
      });
    }
    if (volunteerSnapshot) {
      notices.push({
        title: "Volunteer growth update",
        meta: volunteerSnapshot.ngoGroup + " · " + volunteerSnapshot.reliability + "% reliable",
        status: volunteerSnapshot.activeTasks && volunteerSnapshot.activeTasks[0]
          ? normalizeAssignmentStatus(volunteerSnapshot.activeTasks[0].status)
          : (volunteerSnapshot.completed ? "Completed" : "Accepted"),
        copy: "You have " + volunteerSnapshot.activeTasks.length + " active task(s) and " + volunteerSnapshot.completed + " completed task(s) visible in your lane."
      });
    }
    if (!notices.length) {
      return [{
        title: "No live notifications yet",
        meta: "Load a scenario",
        status: "Pending",
        copy: "Requests, assignments, and donations will appear here once the workspace is active."
      }];
    }
    return notices.filter(function (item, index, list) {
      return list.findIndex(function (candidate) {
        return candidate.title === item.title && candidate.copy === item.copy;
      }) === index;
    }).slice(0, 6);
  }

  function buildRouteGroups(workspace) {
    const grouped = {};
    workspace.requests.forEach(function (request) {
      const key = safeText(request.district || "Unknown", 80);
      grouped[key] = grouped[key] || { district: key, requests: [], assignments: [], locations: [] };
      grouped[key].requests.push(request);
      if (request.location && grouped[key].locations.indexOf(request.location) < 0) {
        grouped[key].locations.push(request.location);
      }
    });
    workspace.assignments.forEach(function (assignment) {
      const key = safeText(assignment.district || "Unknown", 80);
      grouped[key] = grouped[key] || { district: key, requests: [], assignments: [], locations: [] };
      grouped[key].assignments.push(assignment);
      if (assignment.location && grouped[key].locations.indexOf(assignment.location) < 0) {
        grouped[key].locations.push(assignment.location);
      }
    });
    return Object.keys(grouped).map(function (key) {
      const item = grouped[key];
      const criticalCount = item.requests.filter(function (request) {
        return priorityScore(request.priority) >= 0.82;
      }).length;
      const activeAssignments = item.assignments.filter(function (assignment) {
        return isAssignmentActiveStage(assignment.status);
      }).length;
      return {
        title: item.district + " route group",
        meta: item.requests.length + " requests · " + item.assignments.length + " assignments",
        status: criticalCount ? "High Priority" : activeAssignments ? "In Progress" : "Pending",
        copy: criticalCount
          ? "This route group has " + criticalCount + " urgent request(s) waiting on tight movement coordination."
          : "Use this grouped lane to batch volunteers, donations, and field visits in one district.",
        locations: item.locations.slice(0, 4)
      };
    }).sort(function (a, b) {
      return b.locations.length - a.locations.length;
    }).slice(0, 4);
  }

  function buildDistrictComparison(workspace) {
    const summaries = buildDistrictSummary(workspace);
    const maxBeneficiaries = Math.max.apply(null, summaries.map(function (item) {
      return Number(item.beneficiaries || 0);
    }).concat([1]));
    return summaries.map(function (summary) {
      const requestList = workspace.requests.filter(function (request) {
        return safeText(request.district, 80) === summary.district;
      });
      const delivered = requestList.filter(function (request) {
        return isRequestCompleteStage(request.status);
      }).length;
      const completion = requestList.length ? Math.round((delivered / requestList.length) * 100) : 0;
      const donations = requestList.reduce(function (sum, request) {
        const prediction = predictRequestRisk(request, workspace);
        return sum + Math.max(1, prediction.matchingDonationCount || 0);
      }, 0);
      const pressure = Math.round((Number(summary.beneficiaries || 0) / maxBeneficiaries) * 100);
      return {
        district: summary.district,
        meta: summary.requests + " requests · " + summary.assignments + " assignments",
        status: summary.status,
        pressure: pressure,
        completion: completion,
        donations: donations,
        copy: summary.district + " is carrying " + pressure + "% of the current visible load with " + completion + "% lifecycle completion."
      };
    });
  }

  function buildDonationBreakdown(workspace) {
    const donations = workspace.donations || [];
    if (!donations.length) {
      return [];
    }
    const moneyTotal = donations.reduce(function (sum, item) {
      return sum + (item.kind === "money" ? Number(item.amount || 0) : 0);
    }, 0);
    const itemsTotal = donations.reduce(function (sum, item) {
      return sum + (item.kind === "item" ? Number(item.quantity || 0) : 0);
    }, 0);
    const delivered = donations.filter(function (item) {
      return normalizeDonationLifecycle(item.status) === "Delivered";
    }).length;
    const topNeed = workspace.requests.length ? safeText(workspace.requests[0].category || "General support", 80) : "General support";
    return [
      {
        label: "Money pledged",
        meta: "Visible money donation value",
        value: formatCurrency(moneyTotal),
        copy: "This is the visible cash support tied to the active scenario."
      },
      {
        label: "Item support",
        meta: "Visible quantity across item donations",
        value: String(itemsTotal),
        copy: "Item records include clothes, books, food, and other useful supplies."
      },
      {
        label: "Delivered support",
        meta: "Donation records that reached delivery",
        value: String(delivered),
        copy: "Delivered donation records help admins prove the last-mile movement."
      },
      {
        label: "Top need",
        meta: "Category the AI is surfacing first",
        value: topNeed,
        copy: "The current request mix suggests " + topNeed.toLowerCase() + " support should be surfaced first."
      }
    ];
  }

  function buildDonationStageCounts(items) {
    const counts = {};
    DONATION_STAGES.forEach(function (stage) {
      counts[stage] = 0;
    });
    (items || []).forEach(function (item) {
      counts[normalizeDonationLifecycle(item.status)] += 1;
    });
    return counts;
  }

  function donationStageMeta(stage) {
    if (stage === "Submitted") return "Recently added donor records awaiting verification.";
    if (stage === "Verified") return "Checked and approved for movement planning.";
    if (stage === "Packed") return "Support prepared for dispatch or bundling.";
    if (stage === "Dispatched") return "Donations are moving through transport or field handoff.";
    return "Support reached the destination and can be counted in proof of impact.";
  }

  function buildLifecycleAnalytics(workspace) {
    const rate = buildCompletionRate(workspace);
    const active = workspace.requests.filter(function (item) {
      const stage = normalizeRequestStatus(item.status);
      return stage === "Assigned" || stage === "In Progress";
    }).length;
    const critical = workspace.requests.filter(function (item) {
      return priorityScore(item.priority) >= 0.82;
    }).length;
    const districtCount = uniqueCount(workspace.requests.map(function (item) { return item.district; }));
    return [
      {
        title: "Completion rate",
        meta: "Delivered or closed requests",
        value: String(rate) + "%",
        copy: "A higher completion rate means the visible response is closing the loop instead of stalling at review or assignment."
      },
      {
        title: "Active pipeline",
        meta: "Assigned or in-progress requests",
        value: String(active),
        copy: "These requests are already moving in the field and need continued coordination."
      },
      {
        title: "Critical load",
        meta: "Requests still carrying high urgency",
        value: String(critical),
        copy: "Critical requests need closer monitoring so they do not stay too long in early stages."
      },
      {
        title: "District spread",
        meta: "Visible operational footprint",
        value: String(districtCount),
        copy: "The current scenario is touching " + districtCount + " district(s), which affects volunteer fit and movement planning."
      }
    ];
  }

  function buildActiveDeployments(workspace) {
    return (workspace.assignments || []).filter(function (assignment) {
      return isAssignmentActiveStage(assignment.status);
    }).map(function (assignment) {
      return {
        title: assignment.title,
        meta: assignment.volunteer + " · " + assignment.district,
        status: normalizeAssignmentStatus(assignment.status),
        copy: "Deployment is active around " + assignment.location + " with " + String(assignment.points || 0) + " visible impact points."
      };
    }).slice(0, 5);
  }

  function buildBlockedCases(workspace) {
    return (workspace.requests || []).filter(function (request) {
      return request.blocked || (isRequestPendingStage(request.status) && priorityScore(request.priority) >= 0.82);
    }).map(function (request) {
      return {
        title: request.title,
        meta: request.district + " · " + request.priority,
        status: request.blocked ? "Blocked" : normalizeRequestStatus(request.status),
        copy: "This case needs escalation because it is still early in the lifecycle while carrying high urgency."
      };
    }).slice(0, 5);
  }

  function buildPendingApprovals(workspace) {
    return (workspace.requests || []).filter(function (request) {
      return isRequestPendingStage(request.status);
    }).map(function (request) {
      return {
        title: request.title,
        meta: request.district + " · " + String(request.beneficiaries || 0) + " people",
        status: normalizeRequestStatus(request.status),
        copy: "This request is waiting for review, assignment, or final approval into the active field queue."
      };
    }).slice(0, 5);
  }

  function buildCompletionRate(workspace) {
    const total = (workspace.requests || []).length;
    if (!total) {
      return 0;
    }
    const complete = workspace.requests.filter(function (request) {
      return isRequestCompleteStage(request.status);
    }).length;
    return Math.round((complete / total) * 100);
  }

  function buildModerationQueue(workspace) {
    const items = [];
    buildPendingApprovals(workspace).slice(0, 2).forEach(function (item) {
      items.push({
        title: "Request review: " + item.title,
        meta: item.meta,
        status: item.status,
        copy: "This request still needs moderation attention before it can move cleanly through the response pipeline."
      });
    });
    (workspace.donations || []).filter(function (donation) {
      const stage = normalizeDonationLifecycle(donation.status);
      return stage === "Submitted" || stage === "Verified";
    }).slice(0, 2).forEach(function (donation) {
      items.push({
        title: donation.donor + " donation review",
        meta: formatDonationLine(donation),
        status: normalizeDonationLifecycle(donation.status),
        copy: "This donation record is still early in the lifecycle and may need admin verification or routing."
      });
    });
    if (!items.length) {
      items.push({
        title: "Moderation queue is clear",
        meta: "No urgent admin actions",
        status: "Completed",
        copy: "Visible request and donation records are moving without an obvious moderation backlog."
      });
    }
    return items;
  }

  function buildSuspiciousActivityCards(workspace) {
    const cards = [];
    (workspace.requests || []).filter(function (request) {
      return normalizeRequestStatus(request.status) === "Pending" && priorityScore(request.priority) >= 0.82;
    }).slice(0, 2).forEach(function (request) {
      cards.push({
        title: "Critical request waiting",
        meta: request.district + " · " + safeText(request.category, 80),
        status: "Flagged",
        copy: request.title + " is still pending while carrying critical urgency and should be reviewed immediately.",
        actions: [
          { label: "Approve", action: "bulk-approve-request", requestId: request.id, tone: "primary-button compact-button", testId: "moderation-approve-request" },
          { label: "Flag", action: "toggle-suspicious-request", requestId: request.id, flaggedState: request.flagged ? "false" : "true", tone: "ghost-button compact-button", testId: "moderation-flag-request" }
        ]
      });
    });
    (workspace.donations || []).filter(function (donation) {
      const lifecycle = normalizeDonationLifecycle(donation.status);
      return lifecycle === "Submitted" && (!safeText(donation.linkedRequestId || donation.linkedRequestTitle, 160) || Number(donation.amount || 0) >= 5000 || !safeText(donation.contact || donation.donorEmail, 160));
    }).slice(0, 3).forEach(function (donation) {
      cards.push({
        title: safeText(donation.donorName || donation.donor, 120) + " donation check",
        meta: formatDonationLine(donation),
        status: donation.flagged ? "Flagged" : "Submitted",
        copy: donation.flagged
          ? safeText(donation.flagReason || "This donation has been flagged for moderator review.", 220)
          : "This donation should be linked, verified, or flagged before it continues through dispatch.",
        actions: [
          { label: "Verify", action: "bulk-approve-donation", donationId: donation.id, tone: "primary-button compact-button", testId: "moderation-verify-donation" },
          { label: donation.flagged ? "Unflag" : "Flag", action: "toggle-suspicious-donation", donationId: donation.id, flaggedState: donation.flagged ? "false" : "true", tone: "ghost-button compact-button", testId: "moderation-flag-donation" }
        ]
      });
    });
    return cards.slice(0, 5);
  }

  function buildModerationFilters(workspace) {
    const requests = workspace.requests || [];
    const donations = workspace.donations || [];
    const flaggedCount = requests.filter(function (request) { return request.flagged; }).length
      + donations.filter(function (donation) { return donation.flagged; }).length;
    const pendingCount = requests.filter(function (request) { return normalizeRequestStatus(request.status) === "Pending"; }).length
      + donations.filter(function (donation) { return normalizeDonationLifecycle(donation.status) === "Submitted"; }).length;
    return {
      filter: loadModerationFilter(),
      counts: {
        all: pendingCount + flaggedCount,
        pending: pendingCount,
        flagged: flaggedCount,
        requests: requests.filter(function (request) { return normalizeRequestStatus(request.status) === "Pending" || request.flagged; }).length,
        donations: donations.filter(function (donation) { return normalizeDonationLifecycle(donation.status) === "Submitted" || donation.flagged; }).length
      }
    };
  }

  function buildAdminAnalytics(workspace) {
    const deliveredAssignments = workspace.assignments.filter(function (assignment) {
      return isAssignmentCompleteStage(assignment.status);
    }).length;
    const totalMoney = workspace.donations.reduce(function (sum, donation) {
      return sum + (donation.kind === "money" ? Number(donation.amount || 0) : 0);
    }, 0);
    return [
      {
        title: "Completion rate",
        meta: "Request lifecycle completion",
        value: String(buildCompletionRate(workspace)) + "%",
        copy: "This shows how much of the visible request load has reached delivery or closure."
      },
      {
        title: "Completed assignments",
        meta: "Closed volunteer work",
        value: String(deliveredAssignments),
        copy: "Completed assignments help validate attendance, points, and volunteer reliability."
      },
      {
        title: "Money tracked",
        meta: "Visible money donation value",
        value: formatCurrency(totalMoney),
        copy: "This is the visible donation money currently recorded in the active scenario."
      },
      {
        title: "District leader",
        meta: "Highest current pressure",
        value: topDistrict(workspace) || "None",
        copy: "The district leader helps admins focus review and outreach on the area carrying the highest visible load."
      }
    ];
  }

  function buildVolunteerLeaderboard(workspace) {
    return (workspace.volunteers || []).map(function (volunteer) {
      const assignments = workspace.assignments.filter(function (assignment) {
        return safeText(assignment.volunteer, 120).toLowerCase() === safeText(volunteer.name, 120).toLowerCase();
      });
      const delivered = assignments.filter(function (assignment) {
        return isAssignmentCompleteStage(assignment.status);
      }).length;
      const points = assignments.reduce(function (sum, assignment) {
        return sum + Number(assignment.points || 0);
      }, 0);
      return {
        name: volunteer.name,
        ngo: volunteer.ngo,
        points: points,
        completed: delivered,
        reliability: Number(volunteer.reliability || computeVolunteerReliability(volunteer, workspace.assignments)),
        copy: volunteer.name + " is carrying " + assignments.length + " visible assignment(s) with " + delivered + " completed outcome(s)."
      };
    }).sort(function (left, right) {
      return right.points - left.points || right.completed - left.completed || right.reliability - left.reliability;
    }).map(function (item, index) {
      return Object.assign({ rank: index + 1 }, item);
    }).slice(0, 5);
  }

  function renderStatus(status) {
    return '<span class="record-status-pill record-status-pill-' + statusTone(status) + '">' + escapeHtml(status || "Tracked") + "</span>";
  }

  function statusTone(status) {
    const normalized = safeText(status, 40).toLowerCase();
    if (normalized.indexOf("blocked") !== -1 || normalized.indexOf("critical") !== -1) return "muted";
    if (normalized.indexOf("complete") !== -1 || normalized.indexOf("delivered") !== -1 || normalized.indexOf("closed") !== -1 || normalized.indexOf("available") !== -1 || normalized.indexOf("active") !== -1 || normalized.indexOf("visible") !== -1) return "success";
    if (normalized.indexOf("requested") !== -1 || normalized.indexOf("submitted") !== -1 || normalized.indexOf("review") !== -1 || normalized.indexOf("queue") !== -1 || normalized.indexOf("pending") !== -1 || normalized.indexOf("verified") !== -1 || normalized.indexOf("packed") !== -1 || normalized.indexOf("dispatch") !== -1 || normalized.indexOf("scheduled") !== -1 || normalized.indexOf("assigned") !== -1 || normalized.indexOf("progress") !== -1 || normalized.indexOf("shift") !== -1) return "pending";
    return "muted";
  }

  function bindEvents(root, page, session) {
    root.querySelectorAll("[data-nav-target][data-locked='true']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        announce("Access restricted for the current portal.");
      });
    });

    const headerSearchForm = root.querySelector("[data-search-form]");
    if (headerSearchForm) {
      const headerSearchInput = headerSearchForm.querySelector(".rf-search-input");
      if (headerSearchInput) {
        headerSearchInput.addEventListener("focus", function () {
          SEARCH_RUNTIME.focused = true;
          renderApp(document.getElementById("portalApp"));
          const refreshedInput = document.querySelector(".rf-search-input");
          if (refreshedInput) {
            refreshedInput.focus();
            refreshedInput.setSelectionRange(refreshedInput.value.length, refreshedInput.value.length);
          }
        });
        headerSearchInput.addEventListener("blur", function () {
          window.setTimeout(function () {
            SEARCH_RUNTIME.focused = false;
            renderApp(document.getElementById("portalApp"));
          }, 120);
        });
        headerSearchInput.addEventListener("input", function () {
          SEARCH_RUNTIME.query = safeText(headerSearchInput.value, 160);
          SEARCH_RUNTIME.searched = false;
          renderApp(document.getElementById("portalApp"));
          const refreshedInput = document.querySelector(".rf-search-input");
          if (refreshedInput) {
            refreshedInput.focus();
            refreshedInput.setSelectionRange(refreshedInput.value.length, refreshedInput.value.length);
          }
        });
      }
      headerSearchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        SEARCH_RUNTIME.query = safeText(headerSearchInput && headerSearchInput.value, 160);
        if (!SEARCH_RUNTIME.query) {
          SEARCH_RUNTIME.searched = false;
          renderApp(document.getElementById("portalApp"));
          announce("Enter a volunteer name, request title, donor, or district to search.");
          return;
        }
        const results = buildWorkspaceSearchResults(SEARCH_RUNTIME.query, session, getWorkspace());
        const topResult = results[0] || null;
        const exactResult = results.find(function (result) {
          return result.exact || false;
        }) || null;
        const jumpResult = exactResult || (results.length === 1 ? topResult : null);
        SEARCH_RUNTIME.searched = Boolean(SEARCH_RUNTIME.query);
        SEARCH_RUNTIME.focused = false;
        if (results.length) {
          saveRecentSearch(SEARCH_RUNTIME.query);
        }
        announce(results.length ? (String(results.length) + " result(s) found.") : "Not found.");
        if (jumpResult && jumpResult.pageKey === page && jumpResult.anchor) {
          renderApp(document.getElementById("portalApp"));
          jumpToAnchor(jumpResult.anchor, { instant: false });
          return;
        }
        if (jumpResult && jumpResult.href) {
          window.location.assign(jumpResult.href);
          return;
        }
        renderApp(document.getElementById("portalApp"));
      });
    }

    root.querySelectorAll(".rf-search-result[data-search-anchor]").forEach(function (resultLink) {
      resultLink.addEventListener("click", function (event) {
        const targetPage = safeText(resultLink.dataset.searchPage || "", 40);
        const targetAnchor = safeText(resultLink.dataset.searchAnchor || "", 120);
        saveRecentSearch(SEARCH_RUNTIME.query);
        if (!targetPage || !targetAnchor) {
          return;
        }
        if (targetPage === page) {
          event.preventDefault();
          jumpToAnchor(targetAnchor, { instant: false });
        }
      });
    });

    root.querySelectorAll("[data-action='recent-search']").forEach(function (button) {
      button.addEventListener("click", function () {
        SEARCH_RUNTIME.query = safeText(button.dataset.query || "", 160);
        SEARCH_RUNTIME.searched = true;
        SEARCH_RUNTIME.focused = false;
        saveRecentSearch(SEARCH_RUNTIME.query);
        const results = buildWorkspaceSearchResults(SEARCH_RUNTIME.query, session, getWorkspace());
        const topResult = results[0] || null;
        const exactResult = results.find(function (result) {
          return result.exact || false;
        }) || null;
        const jumpResult = exactResult || (results.length === 1 ? topResult : null);
        if (jumpResult && jumpResult.pageKey === page && jumpResult.anchor) {
          renderApp(document.getElementById("portalApp"));
          jumpToAnchor(jumpResult.anchor, { instant: false });
          return;
        }
        if (jumpResult && jumpResult.href) {
          window.location.assign(jumpResult.href);
          return;
        }
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='clear-search']").forEach(function (button) {
      button.addEventListener("click", function () {
        SEARCH_RUNTIME.query = "";
        SEARCH_RUNTIME.searched = false;
        SEARCH_RUNTIME.focused = false;
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='close-portal-launcher']").forEach(function (button) {
      button.addEventListener("click", function () {
        const launcher = button.closest(".portal-launcher");
        if (launcher) {
          launcher.removeAttribute("open");
        }
      });
    });

    root.querySelectorAll("[data-action='toggle-menu']").forEach(function (button) {
      button.addEventListener("click", function () {
        document.body.classList.toggle("rf-sidebar-open");
      });
    });

    root.querySelectorAll("[data-action='close-menu']").forEach(function (backdrop) {
      backdrop.addEventListener("click", function () {
        document.body.classList.remove("rf-sidebar-open");
      });
    });

    root.querySelectorAll("[data-action='toggle-ai-drawer']").forEach(function (button) {
      button.addEventListener("click", function () {
        DEMO_RUNTIME.drawerOpen = false;
        AI_RUNTIME.drawerOpen = !AI_RUNTIME.drawerOpen;
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='close-ai-drawer']").forEach(function (button) {
      button.addEventListener("click", function () {
        AI_RUNTIME.drawerOpen = false;
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='toggle-demo-drawer']").forEach(function (button) {
      button.addEventListener("click", function () {
        AI_RUNTIME.drawerOpen = false;
        DEMO_RUNTIME.drawerOpen = !DEMO_RUNTIME.drawerOpen;
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-mobile-action='demo-action']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        AI_RUNTIME.drawerOpen = false;
        DEMO_RUNTIME.drawerOpen = !DEMO_RUNTIME.drawerOpen;
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='close-demo-drawer']").forEach(function (button) {
      button.addEventListener("click", function () {
        DEMO_RUNTIME.drawerOpen = false;
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='toggle-theme']").forEach(function (button) {
      button.addEventListener("click", function () {
        const next = loadTheme() === "dark" ? "light" : "dark";
        saveTheme(next);
        applyTheme(next);
        updateThemeToggleButtons(root, next);
      });
    });

    root.querySelectorAll("[data-action='change-language']").forEach(function (select) {
      select.addEventListener("change", function () {
        saveLanguage(select.value || "en");
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='switch-portal']").forEach(function (button) {
      button.addEventListener("click", function () {
        localStorage.removeItem(PORTAL_SELECTION_KEY);
        localStorage.removeItem(PORTAL_HANDOFF_KEY);
        window.location.assign("./index.html");
      });
    });

    root.querySelectorAll("[data-action='switch-role']").forEach(function (button) {
      button.addEventListener("click", function () {
        const role = normalizePortal(button.dataset.role || "");
        const href = safeText(button.dataset.href || "", 160) || homeRouteForRole(role);
        if (!role) {
          return;
        }
        localStorage.setItem(PORTAL_SELECTION_KEY, role);
        localStorage.setItem(PORTAL_HANDOFF_KEY, JSON.stringify({ role: role }));
        document.body.classList.remove("rf-sidebar-open");
        window.location.assign(href);
      });
    });

    root.querySelectorAll("[data-action='signout']").forEach(function (button) {
      button.addEventListener("click", function () {
        handleSignOut();
      });
    });

    root.querySelectorAll("[data-action='seed-demo']").forEach(function (button) {
      button.addEventListener("click", function () {
        seedWorkspace(safeText(button.dataset.scenario || "flood", 40).toLowerCase());
        if (button.closest(".demo-drawer")) {
          DEMO_RUNTIME.drawerOpen = false;
        }
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='reset-workspace']").forEach(function (button) {
      button.addEventListener("click", function () {
        resetWorkspace();
        if (button.closest(".demo-drawer")) {
          DEMO_RUNTIME.drawerOpen = false;
        }
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-map-location]").forEach(function (button) {
      button.addEventListener("click", function () {
        const location = button.dataset.mapLocation || "";
        if (location) {
          window.open("https://www.google.com/maps?q=" + encodeURIComponent(location), "_blank", "noopener");
        }
      });
    });

    root.querySelectorAll("[data-action='export-json']").forEach(function (button) {
      button.addEventListener("click", function () {
        exportWorkspaceJson(page, session);
      });
    });

    root.querySelectorAll("[data-action='export-csv']").forEach(function (button) {
      button.addEventListener("click", function () {
        exportWorkspaceCsv(page, session);
      });
    });

    root.querySelectorAll("[data-action='print-report']").forEach(function (button) {
      button.addEventListener("click", function () {
        printWorkspaceReport(page, session);
      });
    });

    root.querySelectorAll("[data-action='dismiss-alert']").forEach(function (button) {
      button.addEventListener("click", function () {
        dismissAlert(safeText(button.dataset.alertKey, 180));
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='advance-request-status']").forEach(function (button) {
      button.addEventListener("click", function () {
        advanceRequestLifecycle(button.dataset.requestId || "");
      });
    });

    root.querySelectorAll("[data-action='close-request']").forEach(function (button) {
      button.addEventListener("click", function () {
        closeRequestLifecycle(button.dataset.requestId || "");
      });
    });

    root.querySelectorAll("[data-action='advance-assignment-status']").forEach(function (button) {
      button.addEventListener("click", function () {
        advanceAssignmentLifecycle(button.dataset.assignmentId || "");
      });
    });

    root.querySelectorAll("[data-satellite-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        const lat = Number(button.dataset.satelliteLat);
        const lng = Number(button.dataset.satelliteLng);
        const location = button.dataset.mapLocation || "";
        const target = safeText(button.dataset.satelliteView, 20).toLowerCase();
        const url = target === "google"
          ? buildGoogleSatelliteUrl(lat, lng, location)
          : buildSatelliteWorldviewUrl(lat, lng);
        window.open(url, "_blank", "noopener");
      });
    });

    root.querySelectorAll("[data-action='show-donation-tab']").forEach(function (button) {
      button.addEventListener("click", function () {
        showDonationTab(button.dataset.tab || "money");
      });
    });

    const communityForm = document.getElementById("communityRequestForm");
    if (communityForm) {
      const draft = loadDraft(COMMUNITY_DRAFT_KEY) || {};
      ["title", "category", "district", "location", "beneficiaries", "priority", "shortSummary", "summary"].forEach(function (fieldName) {
        if (communityForm.elements[fieldName] && draft[fieldName] != null && !communityForm.elements[fieldName].value) {
          communityForm.elements[fieldName].value = draft[fieldName];
        }
      });
      if (communityForm.dataset.draftBound !== "true") {
        communityForm.dataset.draftBound = "true";
        ["input", "change"].forEach(function (eventName) {
          communityForm.addEventListener(eventName, function () {
            saveDraft(COMMUNITY_DRAFT_KEY, {
              title: safeText(communityForm.elements.title && communityForm.elements.title.value, 160),
              category: safeText(communityForm.elements.category && communityForm.elements.category.value, 80),
              district: safeText(communityForm.elements.district && communityForm.elements.district.value, 120),
              location: safeText(communityForm.elements.location && communityForm.elements.location.value, 160),
              beneficiaries: safeText(communityForm.elements.beneficiaries && communityForm.elements.beneficiaries.value, 40),
              priority: safeText(communityForm.elements.priority && communityForm.elements.priority.value, 40),
              shortSummary: safeText(communityForm.elements.shortSummary && communityForm.elements.shortSummary.value, 220),
              summary: safeText(communityForm.elements.summary && communityForm.elements.summary.value, 1200)
            });
          });
        });
      }
      communityForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitCommunityRequest(communityForm);
      });
    }

    const requestLookupForm = document.getElementById("communityRequestLookupForm");
    if (requestLookupForm) {
      requestLookupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const receiptId = safeText(requestLookupForm.elements.receiptId && requestLookupForm.elements.receiptId.value, 80);
        saveRequestLookupState(receiptId, Boolean(receiptId));
        renderApp(document.getElementById("portalApp"));
      });
    }

    root.querySelectorAll("[data-action='clear-request-lookup']").forEach(function (button) {
      button.addEventListener("click", function () {
        saveRequestLookupState("", false);
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='set-moderation-filter']").forEach(function (button) {
      button.addEventListener("click", function () {
        saveModerationFilter(button.dataset.filterKey || "all");
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='bulk-approve-items']").forEach(function (button) {
      button.addEventListener("click", function () {
        applyBulkModeration("approve");
      });
    });

    root.querySelectorAll("[data-action='bulk-flag-items']").forEach(function (button) {
      button.addEventListener("click", function () {
        applyBulkModeration("flag");
      });
    });

    root.querySelectorAll("[data-action='bulk-approve-request']").forEach(function (button) {
      button.addEventListener("click", function () {
        applyModerationRequestAction(button.dataset.requestId || "", "approve");
      });
    });

    root.querySelectorAll("[data-action='toggle-suspicious-request']").forEach(function (button) {
      button.addEventListener("click", function () {
        applyModerationRequestAction(button.dataset.requestId || "", "toggle-flag");
      });
    });

    root.querySelectorAll("[data-action='bulk-approve-donation']").forEach(function (button) {
      button.addEventListener("click", function () {
        applyModerationDonationAction(button.dataset.donationId || "", "approve");
      });
    });

    root.querySelectorAll("[data-action='toggle-suspicious-donation']").forEach(function (button) {
      button.addEventListener("click", function () {
        applyModerationDonationAction(button.dataset.donationId || "", "toggle-flag");
      });
    });

    root.querySelectorAll("[data-demo-scenario-form]").forEach(function (demoForm) {
      demoForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const data = new FormData(demoForm);
        const selectedScenario = safeText(data.get("scenario") || "none", 40).toLowerCase();
        if (selectedScenario === "none") {
          resetWorkspace();
        } else {
          seedWorkspace(selectedScenario);
        }
        DEMO_RUNTIME.drawerOpen = false;
        renderApp(document.getElementById("portalApp"));
      });
    });

    const outreachButton = document.querySelector("[data-action='save-outreach']");
    if (outreachButton) {
      outreachButton.addEventListener("click", function () {
        saveOutreachDraft();
      });
    }

    root.querySelectorAll("[data-action='ask-ai-prompt']").forEach(function (button) {
      button.addEventListener("click", function () {
        const target = safeText(button.dataset.aiTarget, 40) || "insights";
        const form = root.querySelector('[data-ai-copilot-form="' + cssEscape(target) + '"]');
        if (!form || !form.elements.message) {
          return;
        }
        form.elements.message.value = safeText(button.dataset.aiPrompt, 320);
        handleAiCopilotSubmit(form, session);
      });
    });

    root.querySelectorAll("[data-ai-copilot-form]").forEach(function (aiForm) {
      aiForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handleAiCopilotSubmit(aiForm, session);
      });
    });

    root.querySelectorAll("[data-action='clear-ai-chat']").forEach(function (button) {
      button.addEventListener("click", function () {
        clearAiChatHistory(session.role);
        AI_RUNTIME.status = "Chat history cleared. Ask a fresh question about the current workspace.";
        AI_RUNTIME.tone = "";
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='mark-notification-read']").forEach(function (button) {
      button.addEventListener("click", function () {
        markNotificationRead(button.dataset.notificationId || "");
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='mark-all-notifications-read']").forEach(function (button) {
      button.addEventListener("click", function () {
        markAllNotificationsRead(buildNotifications(loadWorkspace(), getSession()));
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='dismiss-toast']").forEach(function (button) {
      button.addEventListener("click", function () {
        dismissToast(button.dataset.toastId || "");
        renderApp(document.getElementById("portalApp"));
      });
    });

    if (window.__resourceflowSyncListenersBound !== true) {
      window.__resourceflowSyncListenersBound = true;
      window.addEventListener("online", function () {
        setSyncStatus("syncing", "Connection restored. Syncing queued changes.");
        flushOfflineQueue();
        flushWorkspaceBackendSync();
        renderApp(document.getElementById("portalApp"));
      });
      window.addEventListener("offline", function () {
        setSyncStatus("queued", "You are offline. Changes will be queued until the connection returns.");
        pushToast("warning", "Offline mode", "ResourceFlow will keep your changes locally and sync them later.");
        renderApp(document.getElementById("portalApp"));
      });
    }

    if (page === "donations") {
      showDonationTab("money");
    }

    document.onkeydown = function (event) {
      if (event && event.key === "Escape") {
        let changed = false;
        if (SEARCH_RUNTIME.searched || SEARCH_RUNTIME.query) {
          SEARCH_RUNTIME.query = "";
          SEARCH_RUNTIME.searched = false;
          changed = true;
        }
        if (document.body.classList.contains("rf-sidebar-open")) {
          document.body.classList.remove("rf-sidebar-open");
          changed = true;
        }
        if (AI_RUNTIME.drawerOpen) {
          AI_RUNTIME.drawerOpen = false;
          changed = true;
        }
        if (DEMO_RUNTIME.drawerOpen) {
          DEMO_RUNTIME.drawerOpen = false;
          changed = true;
        }
        if (changed) {
          renderApp(document.getElementById("portalApp"));
        }
      }
    };
  }

  function updateThemeToggleButtons(root, theme) {
    root.querySelectorAll(".header-theme-button").forEach(function (button) {
      const fullLabel = button.querySelector(".button-full-label");
      if (fullLabel) {
        fullLabel.textContent = themeToggleLabel(theme);
      }
    });
  }

  function showDonationTab(tab) {
    const target = safeText(tab, 20).toLowerCase() === "item" ? "item" : "money";
    document.querySelectorAll("[data-donation-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.donationPanel !== target;
    });
  }

  function exportWorkspaceJson(page, session) {
    const payload = {
      exportedAt: new Date().toISOString(),
      page: page,
      role: session.role,
      workspace: getManagedWorkspace({ reason: "export-json" })
    };
    downloadTextFile("resourceflow-" + page + "-report.json", JSON.stringify(payload, null, 2), "application/json");
    announce("JSON export created for the current workspace.");
  }

  function exportWorkspaceCsv(page, session) {
    const workspace = getManagedWorkspace({ reason: "export-csv" });
    const lines = [
      ["type", "id", "title", "district", "location", "status", "priority", "beneficiaries", "owner"].join(",")
    ];
    workspace.requests.forEach(function (request) {
      lines.push(toCsvRow([
        "request",
        request.id,
        request.title,
        request.district,
        request.location,
        normalizeRequestStatus(request.status),
        request.priority,
        request.beneficiaries,
        request.requester || "Community Network"
      ]));
    });
    workspace.assignments.forEach(function (assignment) {
      lines.push(toCsvRow([
        "assignment",
        assignment.id,
        assignment.title,
        assignment.district,
        assignment.location,
        normalizeAssignmentStatus(assignment.status),
        "",
        "",
        assignment.volunteer
      ]));
    });
    workspace.donations.forEach(function (donation) {
      lines.push(toCsvRow([
        "donation",
        donation.id,
        donation.donor,
        "",
        "",
        normalizeDonationLifecycle(donation.status),
        donation.kind,
        donation.kind === "money" ? donation.amount : donation.quantity,
        donation.itemType || donation.paymentMethod || ""
      ]));
    });
    downloadTextFile("resourceflow-" + page + "-report.csv", lines.join("\n"), "text/csv;charset=utf-8");
    announce("CSV export created for the current workspace.");
  }

  function printWorkspaceReport(page, session) {
    const workspace = getWorkspace();
    const popup = window.open("", "_blank", "noopener,noreferrer,width=980,height=720");
    if (!popup) {
      announce("Printing was blocked by the browser. Allow popups and try again.");
      return;
    }
    const html = [
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>ResourceFlow Report</title><style>",
      "body{font-family:Arial,sans-serif;padding:32px;color:#1c1c19;}h1,h2{margin:0 0 12px;}section{margin:24px 0;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #d8dde4;padding:10px;text-align:left;}small{color:#5b6470;} .pill{display:inline-block;padding:4px 10px;border-radius:999px;background:#eef1f4;font-size:12px;font-weight:700;}",
      "</style></head><body>",
      "<h1>ResourceFlow " + escapeHtml(PAGE_TITLES[page] || "Workspace") + " Report</h1>",
      "<small>Role: " + escapeHtml((ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label) + " · Exported " + escapeHtml(new Date().toLocaleString()) + "</small>",
      "<section><h2>Scenario</h2><p><strong>" + escapeHtml(workspace.label) + "</strong> — " + escapeHtml(workspace.summary) + "</p></section>",
      "<section><h2>Requests</h2>" + renderPrintTable(workspace.requests.map(function (request) {
        return {
          ID: request.id,
          Title: request.title,
          District: request.district,
          Status: normalizeRequestStatus(request.status),
          Priority: request.priority,
          Beneficiaries: String(request.beneficiaries || 0)
        };
      })) + "</section>",
      "<section><h2>Assignments</h2>" + renderPrintTable(workspace.assignments.map(function (assignment) {
        return {
          ID: assignment.id,
          Title: assignment.title,
          Volunteer: assignment.volunteer,
          District: assignment.district,
          Status: normalizeAssignmentStatus(assignment.status)
        };
      })) + "</section>",
      "<section><h2>Donations</h2>" + renderPrintTable(workspace.donations.map(function (donation) {
        return {
          ID: donation.id,
          Donor: donation.donor,
          Type: donation.kind,
          Value: formatDonationLine(donation),
          Status: normalizeDonationLifecycle(donation.status)
        };
      })) + "</section>",
      "</body></html>"
    ].join("");
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function renderPrintTable(rows) {
    if (!rows.length) {
      return "<p>No visible records.</p>";
    }
    const headers = Object.keys(rows[0]);
    return "<table><thead><tr>" + headers.map(function (header) {
      return "<th>" + escapeHtml(header) + "</th>";
    }).join("") + "</tr></thead><tbody>" + rows.map(function (row) {
      return "<tr>" + headers.map(function (header) {
        return "<td>" + escapeHtml(row[header]) + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody></table>";
  }

  function downloadTextFile(filename, content, type) {
    const blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function toCsvRow(values) {
    return values.map(function (value) {
      const text = String(value == null ? "" : value);
      return '"' + text.replace(/"/g, '""') + '"';
    }).join(",");
  }

  function advanceRequestLifecycle(requestId) {
    const workspace = getManagedWorkspace({ reason: "advance-request" });
    const request = workspace.requests.find(function (item) {
      return item.id === requestId;
    });
    if (!request) {
      return;
    }
    const currentStage = normalizeRequestStatus(request.status);
    const currentIndex = REQUEST_STAGES.indexOf(currentStage);
    const nextStage = REQUEST_STAGES[Math.min(currentIndex + 1, REQUEST_STAGES.length - 1)];
    request.status = nextStage;
    request.updatedAt = nowIso();
    if (nextStage === "Assigned" && !workspace.assignments.some(function (item) { return item.requestId === request.id; })) {
      workspace.assignments.unshift(createAssignmentFromRequest(request, workspace));
    }
    syncAssignmentsForRequest(request, workspace);
    workspace.audit.unshift(request.title + " advanced to " + nextStage + ".");
    workspace.systemNotice = request.title + " is now in the " + nextStage + " stage.";
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function closeRequestLifecycle(requestId) {
    const workspace = getManagedWorkspace({ reason: "close-request" });
    const request = workspace.requests.find(function (item) {
      return item.id === requestId;
    });
    if (!request) {
      return;
    }
    request.status = "Closed";
    request.updatedAt = nowIso();
    syncAssignmentsForRequest(request, workspace, "Closed");
    workspace.audit.unshift(request.title + " was closed from the admin or operations lane.");
    workspace.systemNotice = request.title + " is now closed.";
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function advanceAssignmentLifecycle(assignmentId) {
    const workspace = getManagedWorkspace({ reason: "advance-assignment" });
    const assignment = workspace.assignments.find(function (item) {
      return item.id === assignmentId;
    });
    if (!assignment) {
      return;
    }
    const currentStage = normalizeAssignmentStatus(assignment.status);
    const currentIndex = ASSIGNMENT_STAGES.indexOf(currentStage);
    const nextStage = ASSIGNMENT_STAGES[Math.min(currentIndex + 1, ASSIGNMENT_STAGES.length - 1)];
    if (nextStage === "Completed") {
      completeAssignment(assignment, workspace.requests.find(function (item) { return item.id === assignment.requestId; }) || null, workspace);
    } else {
      assignment.status = nextStage;
      assignment.updatedAt = nowIso();
      assignment.acceptedAt = assignment.acceptedAt || nowIso();
      if (nextStage === "In Progress") {
        assignment.startedAt = assignment.startedAt || nowIso();
      }
    }
    if (assignment.requestId) {
      const request = workspace.requests.find(function (item) { return item.id === assignment.requestId; });
      if (request) {
        if (nextStage === "Accepted") {
          request.status = "Assigned";
        } else if (nextStage === "In Progress") {
          request.status = "In Progress";
        }
        request.updatedAt = nowIso();
      }
    }
    if (nextStage !== "Completed") {
      workspace.audit.unshift(buildVolunteerStatusLine(assignment, nextStage));
      workspace.systemNotice = buildVolunteerStatusLine(assignment, nextStage);
    }
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function createAssignmentFromRequest(request, workspace, options) {
    const config = options && typeof options === "object" ? options : {};
    const bestVolunteer = config.volunteer || pickBestVolunteerForRequest(request, workspace) || workspace.volunteers[0] || { name: "Volunteer pending", location: request.location, ngo: "ResourceFlow", origin: "demo" };
    const createdAt = nowIso();
    const stage = normalizeAssignmentStatus(config.status || "Accepted");
    const volunteerOrigin = safeText(config.volunteerOrigin || bestVolunteer.origin || "demo", 20).toLowerCase() || "demo";
    return {
      id: "ASG-" + Math.floor(Math.random() * 900 + 100),
      requestId: request.id,
      title: "Respond to " + request.title,
      volunteer: bestVolunteer.name,
      district: request.district,
      location: request.location,
      status: stage,
      date: "Today " + new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      points: Number(config.points || computeTaskPoints(request && request.priority || "Medium", config.shiftCount || 0)),
      createdAt: createdAt,
      updatedAt: createdAt,
      acceptedAt: stage === "Accepted" || stage === "In Progress" || stage === "Completed" ? createdAt : "",
      startedAt: stage === "In Progress" || stage === "Completed" ? createdAt : "",
      completedAt: stage === "Completed" ? createdAt : "",
      estimatedDurationMinutes: Math.max(6, Number(config.estimatedDurationMinutes || request && request.estimatedDurationMinutes || estimatedDurationMinutes(request && request.priority, request && (request.source || request.origin)))),
      origin: safeText(config.origin || request.origin || request.source || "demo", 30).toLowerCase(),
      volunteerOrigin: volunteerOrigin,
      autoManaged: config.autoManaged == null ? volunteerOrigin === "demo" : Boolean(config.autoManaged),
      supportLane: Boolean(config.supportLane),
      shiftCount: Number(config.shiftCount || 0),
      shifted: Boolean(config.shifted),
      pointsAwarded: Boolean(config.pointsAwarded)
    };
  }

  function pickBestVolunteerForRequest(request, workspace, options) {
    const config = options && typeof options === "object" ? options : {};
    const category = safeText(request.category, 60).toLowerCase();
    const district = safeText(request.district, 80).toLowerCase();
    const keywords = CATEGORY_SKILLS[category] || [];
    const desiredOrigin = safeText(config.origin || "", 20).toLowerCase();
    const excluded = (config.excludeVolunteerNames || []).map(function (item) { return normalizeSearchQuery(item); });
    const requestLat = finiteNumber(request && request.lat);
    const requestLng = finiteNumber(request && request.lng);
    const candidates = workspace.volunteers.filter(function (volunteer) {
      const origin = safeText(volunteer.origin || "demo", 20).toLowerCase();
      if (desiredOrigin && origin !== desiredOrigin) {
        return false;
      }
      if (excluded.indexOf(normalizeSearchQuery(volunteer.name)) !== -1) {
        return false;
      }
      return isVolunteerAvailable(volunteer);
    }).map(function (volunteer) {
      const location = safeText(volunteer.location, 140).toLowerCase();
      const skills = joinSkills(volunteer.skills).toLowerCase();
      const volunteerLat = finiteNumber(volunteer.lat);
      const volunteerLng = finiteNumber(volunteer.lng);
      const nearestKm = distanceKm(requestLat, requestLng, volunteerLat, volunteerLng);
      let score = Number(volunteer.reliability || computeVolunteerReliability(volunteer, workspace.assignments));
      if (district && location.indexOf(district) !== -1) score += 12;
      if (safeText(request.location, 140).toLowerCase() && location.indexOf(safeText(request.location, 140).toLowerCase()) !== -1) score += 14;
      if (keywords.some(function (keyword) { return skills.indexOf(keyword) !== -1; })) score += 14;
      if (normalizedAvailability(volunteer.availability || volunteer.activityStatus) === "available") score += 8;
      if (safeText(volunteer.origin || "", 20).toLowerCase() === "real") score += 4;
      if (nearestKm != null) {
        score += Math.max(0, 24 - Math.round(nearestKm * 2));
      }
      return { volunteer: volunteer, score: score, nearestKm: nearestKm == null ? Number.POSITIVE_INFINITY : nearestKm };
    }).sort(function (left, right) {
      return right.score - left.score || left.nearestKm - right.nearestKm;
    });
    return candidates.length ? candidates[0].volunteer : null;
  }

  function syncAssignmentsForRequest(request, workspace, overrideStatus) {
    const targetStatus = overrideStatus || normalizeRequestStatus(request.status);
    workspace.assignments.forEach(function (assignment) {
      if (assignment.requestId !== request.id) {
        return;
      }
      if (targetStatus === "Pending" || targetStatus === "Reviewed" || targetStatus === "Assigned") {
        assignment.status = "Accepted";
      } else if (targetStatus === "In Progress") {
        assignment.status = "In Progress";
      } else if (targetStatus === "Delivered" || targetStatus === "Closed") {
        assignment.status = "Completed";
      }
      assignment.updatedAt = nowIso();
    });
  }

  function submitCommunityRequest(form) {
    const data = new FormData(form);
    const workspace = getManagedWorkspace({ reason: "submit-request" });
    const session = getSession();
    const request = {
      id: "REQ-" + Math.floor(Math.random() * 900 + 100),
      title: safeText(data.get("title"), 140),
      category: safeText(data.get("category"), 80),
      district: safeText(data.get("district"), 80),
      location: safeText(data.get("location"), 140),
      beneficiaries: Number(data.get("beneficiaries") || 40),
      priority: safeText(data.get("priority"), 40) || "Medium",
      status: "Pending",
      summary: safeText(data.get("shortSummary"), 180) || safeText(data.get("summary"), 280),
      ai: "The AI is broadcasting this request to Admin and Government, then matching the best volunteers and donation gaps.",
      requestedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      requester: safeText(session.name || "Community user", 120),
      blocked: false,
      source: "live",
      origin: "live",
      priorityLane: "live",
      broadcastTo: ["admin", "government"],
      complexity: inferTaskComplexity(safeText(data.get("priority"), 40) || "Medium"),
      estimatedDurationMinutes: estimatedDurationMinutes(safeText(data.get("priority"), 40) || "Medium", "live")
    };
    workspace.requests.unshift(request);
    workspace.systemNotice = "New community request added to the live tracker and broadcasted as Pending.";
    workspace.audit.unshift("A community request was submitted for " + safeText(data.get("district"), 80) + " and routed into the lifecycle board.");
    saveWorkspace(workspace);
    clearDraft(COMMUNITY_DRAFT_KEY);
    runWorkspaceAutomation({ reason: "submit-request" });
    renderApp(document.getElementById("portalApp"));
  }

  function saveOutreachDraft() {
    const form = document.getElementById("adminOutreachForm");
    if (!form) {
      return;
    }
    const data = new FormData(form);
    const subject = safeText(data.get("subject"), 120);
    if (!subject) {
      return;
    }
    const workspace = getManagedWorkspace({ reason: "save-outreach-draft" });
    workspace.outreach.unshift(subject + " - " + safeText(data.get("recipients"), 120));
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  async function handleAiCopilotSubmit(form, session) {
    if (AI_RUNTIME.busy) {
      return;
    }
    const field = form && form.elements ? form.elements.message : null;
    const message = safeText(field && field.value, 900);
    if (!message) {
      AI_RUNTIME.status = "Enter a question for the AI copilot first.";
      AI_RUNTIME.tone = "error";
      renderApp(document.getElementById("portalApp"));
      return;
    }

    appendAiChatMessage(session.role, "user", message, "Workspace user");
    if (field) {
      field.value = "";
    }

    AI_RUNTIME.busy = true;
    AI_RUNTIME.status = "AI chatbot is reviewing the current workspace, requests, donors, and volunteers...";
    AI_RUNTIME.tone = "";
    renderApp(document.getElementById("portalApp"));

    try {
      const workspace = getManagedWorkspace({ reason: "ai-submit" });
      const history = getAiChatHistory(session.role);
      const result = await requestAiCopilot(message, session, workspace, history);
      const execution = executeAiActionPlan(result.actions || [], session, workspace, message);
      if (execution.changed) {
        saveWorkspace(workspace);
        getManagedWorkspace({ reason: "ai-submit-actions" });
      }
      appendAiChatMessage(session.role, "assistant", mergeCopilotReplyWithExecution(result.text, execution), result.sourceLabel);
      AI_RUNTIME.engine = result.engine;
      AI_RUNTIME.status = execution.notice || result.notice;
      AI_RUNTIME.tone = execution.changed ? "success" : (result.engine === "local-boosted" ? "" : "success");
    } catch (error) {
      const fallbackWorkspace = getManagedWorkspace({ reason: "ai-submit-fallback" });
      const fallback = buildLocalCopilotResponse(message, fallbackWorkspace, session, getAiChatHistory(session.role));
      const execution = executeAiActionPlan(fallback.actions || [], session, fallbackWorkspace, message);
      if (execution.changed) {
        saveWorkspace(fallbackWorkspace);
        getManagedWorkspace({ reason: "ai-submit-fallback-actions" });
      }
      appendAiChatMessage(session.role, "assistant", mergeCopilotReplyWithExecution(fallback.text, execution), "Local boosted engine");
      AI_RUNTIME.engine = "local-boosted";
      AI_RUNTIME.status = execution.notice || "Live AI was unavailable, so the local boosted engine answered instead.";
      AI_RUNTIME.tone = execution.changed ? "success" : "error";
    } finally {
      AI_RUNTIME.busy = false;
      renderApp(document.getElementById("portalApp"));
    }
  }

  async function requestAiCopilot(message, session, workspace, history) {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    if (config.secureBackendEnabled) {
      try {
        return await requestSecureCopilotResponse(message, session, workspace, history);
      } catch (error) {
        console.warn("Secure AI backend unavailable, trying direct/local fallback.", error);
      }
    }
    if (safeText(config.geminiApiKey, 240)) {
      try {
        return await requestDirectGeminiResponse(message, session, workspace, history);
      } catch (error) {
        console.warn("Direct Gemini request failed, falling back to local response.", error);
      }
    }
    const localFallback = buildLocalCopilotResponse(message, workspace, session, history);
    return {
      engine: "local-boosted",
      sourceLabel: "Local boosted engine",
      notice: "Gemini is not configured yet, so the local boosted engine is answering from the visible workspace.",
      text: localFallback.text,
      actions: localFallback.actions || []
    };
  }

  async function requestSecureCopilotResponse(message, session, workspace, history) {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    const functions = await ensureFirebaseFunctionsClient(config);
    const callable = functions.httpsCallable("chatResourceFlowCopilot");
    const result = await callable({
      message: message,
      portalRole: session.role,
      history: history.slice(-8).map(function (entry) {
        return {
          speaker: safeText(entry.speaker, 20),
          text: safeText(entry.text, 1200)
        };
      }),
      workspace: workspace
    });
    const text = safeText(result && result.data && result.data.text, 6000);
    if (!text) {
      throw new Error("Secure copilot returned an empty response.");
    }
    return {
      engine: "gemini-secure",
      sourceLabel: "Gemini secure backend",
      notice: "Secure Gemini backend responded with a live coordination recommendation.",
      text: text,
      actions: normalizeAiActionPlan(result && result.data && result.data.actions)
    };
  }

  async function requestDirectGeminiResponse(message, session, workspace, history) {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    const prompt = buildCopilotPrompt(workspace, session, message, history);
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        encodeURIComponent(config.geminiModel || "gemini-2.5-flash") +
        ":generateContent?key=" +
        encodeURIComponent(config.geminiApiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: buildGeminiSystemInstruction(session)
              }
            ]
          },
          contents: buildGeminiConversationContents(history, prompt),
          generationConfig: {
            temperature: 0.88,
            topP: 0.95,
            maxOutputTokens: 1800
          }
        })
      }
    );
    if (!response.ok) {
      throw new Error("Gemini direct request failed.");
    }
    const payload = await response.json();
    const structured = extractGeminiStructuredPayload(payload);
    if (!structured || !structured.text) {
      throw new Error("Gemini returned an empty response.");
    }
    return {
      engine: "gemini-direct",
      sourceLabel: "Gemini",
      notice: "Gemini answered directly from the configured browser key.",
      text: structured.text,
      actions: structured.actions
    };
  }

  function buildGeminiSystemInstruction(session) {
    const roleLabel = (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label;
    return [
      "You are Gemini inside ResourceFlow, a multi-role response coordination platform.",
      "Sound natural, calm, and human.",
      "Do not answer like a rigid rule engine or JSON bot unless the user explicitly asks for structure.",
      "Use clear operational reasoning with simple language.",
      "Respect the current signed-in role: " + roleLabel + ".",
      "If the user asks you to operate the workspace, explain the action briefly first and only then provide action payloads if needed."
    ].join(" ");
  }

  function buildGeminiConversationContents(history, prompt) {
    const conversation = [];
    (Array.isArray(history) ? history.slice(-6) : []).forEach(function (entry) {
      const text = safeText(entry && entry.text, 1600);
      if (!text) {
        return;
      }
      conversation.push({
        role: entry && entry.speaker === "assistant" ? "model" : "user",
        parts: [{ text: text }]
      });
    });
    conversation.push({
      role: "user",
      parts: [{ text: prompt }]
    });
    return conversation;
  }

  function extractGeminiStructuredPayload(payload) {
    const rawText = extractGeminiTextClient(payload);
    if (!rawText) {
      return null;
    }
    const envelope = extractGeminiActionEnvelope(rawText);
    if (envelope) {
      return envelope;
    }
    const parsed = parseJsonLikeResponse(rawText);
    if (!parsed || typeof parsed !== "object") {
      return {
        text: safeText(rawText, 6000),
        actions: []
      };
    }
    return {
      text: formatStructuredCopilotAnswer(parsed.answer || parsed),
      actions: normalizeAiActionPlan(parsed.actions)
    };
  }

  function extractGeminiActionEnvelope(text) {
    const raw = safeText(text, 12000);
    const marker = "ACTIONS_JSON:";
    const markerIndex = raw.lastIndexOf(marker);
    if (markerIndex === -1) {
      return null;
    }
    const answerText = safeText(raw.slice(0, markerIndex).trim(), 6000);
    const actionText = safeText(raw.slice(markerIndex + marker.length).trim(), 4000);
    const parsedActions = parseJsonLikeResponse(actionText);
    return {
      text: answerText || safeText(raw, 6000),
      actions: normalizeAiActionPlan(parsedActions)
    };
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
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
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

  function formatStructuredCopilotAnswer(answer) {
    if (!answer) {
      return "";
    }
    if (typeof answer === "string") {
      return safeText(answer, 6000);
    }
    return formatCopilotSections(
      safeText(answer.recommendation || answer.summary || answer.recommend || "", 1200),
      safeText(answer.whyNow || answer.why_now || answer.context || answer.why || "", 1800),
      safeText(answer.nextAction || answer.next_action || answer.action || "", 1400),
      Array.isArray(answer.visibleSignals || answer.visible_signals) ? (answer.visibleSignals || answer.visible_signals) : []
    ) || safeText(answer.text || "", 6000);
  }

  function normalizeAiActionPlan(actions) {
    const list = Array.isArray(actions) ? actions : actions ? [actions] : [];
    return list.map(normalizeAiAction).filter(function (item) {
      return item && item.type;
    }).slice(0, 6);
  }

  function normalizeAiAction(action) {
    if (!action || typeof action !== "object") {
      return null;
    }
    const type = normalizeAiActionType(action.type || action.action || action.name);
    if (!type) {
      return null;
    }
    return {
      type: type,
      requestId: safeText(action.requestId || action.request_id, 80),
      requestTitle: safeText(action.requestTitle || action.request_title || action.request, 180),
      assignmentId: safeText(action.assignmentId || action.assignment_id, 80),
      assignmentTitle: safeText(action.assignmentTitle || action.assignment_title || action.assignment, 180),
      volunteerName: safeText(action.volunteerName || action.volunteer_name || action.volunteer, 140),
      donationDonor: safeText(action.donationDonor || action.donation_donor || action.donor, 140),
      donationKind: safeText(action.donationKind || action.donation_kind || action.kind, 80),
      district: safeText(action.district, 80),
      targetStatus: safeText(action.targetStatus || action.target_status || action.status, 80),
      recipients: safeText(action.recipients, 180),
      message: safeText(action.message || action.draft || action.note, 600),
      reason: safeText(action.reason || action.why || "", 320)
    };
  }

  function normalizeAiActionType(value) {
    const type = safeText(value, 80).toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_+|_+$/g, "");
    if (!type) {
      return "";
    }
    if (type === "assign" || type === "assign_request" || type === "assign_volunteer" || type === "match_volunteer" || type === "dispatch_task") return "assign_task";
    if (type === "update_request" || type === "advance_request" || type === "review_request") return "update_request_status";
    if (type === "update_assignment" || type === "advance_assignment" || type === "start_assignment" || type === "complete_assignment") return "update_assignment_status";
    if (type === "recommend_donation" || type === "route_donation" || type === "use_donation") return "recommend_donation_use";
    if (type === "draft_outreach" || type === "generate_outreach" || type === "send_outreach" || type === "message_outreach") return "generate_outreach_draft";
    if (["assign_task", "update_request_status", "update_assignment_status", "recommend_donation_use", "generate_outreach_draft"].indexOf(type) !== -1) {
      return type;
    }
    return "";
  }

  function mergeCopilotReplyWithExecution(text, execution) {
    const reply = safeText(text, 7000);
    if (!execution || !execution.summary) {
      return reply;
    }
    return [reply, execution.summary].filter(Boolean).join("\n\n");
  }

  function executeAiActionPlan(actions, session, workspace, message) {
    const plan = normalizeAiActionPlan(actions);
    if (!plan.length) {
      return { changed: false, executedCount: 0, skippedCount: 0, summary: "", notice: "" };
    }
    const results = [];
    const allowed = allowedAiActionTypesForRole(session.role);
    plan.forEach(function (action) {
      if (allowed.indexOf(action.type) === -1) {
        results.push({
          ok: false,
          summary: "Skipped " + describeAiAction(action) + " because " + (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label + " cannot run that action.",
          blocked: true
        });
        return;
      }
      const result = executeAiAction(action, session, workspace, message);
      results.push(result);
    });
    const executed = results.filter(function (item) { return item && item.ok; });
    const skipped = results.filter(function (item) { return !item || !item.ok; });
    return {
      changed: executed.length > 0,
      executedCount: executed.length,
      skippedCount: skipped.length,
      summary: buildAiExecutionSummary(results),
      notice: buildAiExecutionNotice(executed.length, skipped.length)
    };
  }

  function allowedAiActionTypesForRole(role) {
    if (role === "admin") {
      return ["assign_task", "update_request_status", "update_assignment_status", "recommend_donation_use", "generate_outreach_draft"];
    }
    if (role === "government") {
      return ["assign_task", "update_request_status", "update_assignment_status", "recommend_donation_use", "generate_outreach_draft"];
    }
    if (role === "volunteer") {
      return ["update_assignment_status"];
    }
    return [];
  }

  function executeAiAction(action, session, workspace, message) {
    if (action.type === "assign_task") {
      return executeAssignTaskAction(action, session, workspace);
    }
    if (action.type === "update_request_status") {
      return executeUpdateRequestStatusAction(action, session, workspace);
    }
    if (action.type === "update_assignment_status") {
      return executeUpdateAssignmentStatusAction(action, session, workspace);
    }
    if (action.type === "recommend_donation_use") {
      return executeRecommendDonationUseAction(action, session, workspace);
    }
    if (action.type === "generate_outreach_draft") {
      return executeGenerateOutreachDraftAction(action, session, workspace, message);
    }
    return {
      ok: false,
      summary: "Skipped an unsupported AI action."
    };
  }

  function executeAssignTaskAction(action, session, workspace) {
    const request = findRequestForAiAction(action, workspace);
    if (!request) {
      return { ok: false, summary: "Could not find the request to assign." };
    }
    const volunteer = findVolunteerForAiAction(action, workspace, request);
    let assignment = workspace.assignments.find(function (item) {
      return item.requestId === request.id && !isAssignmentCompleteStage(item.status);
    }) || null;
    if (!assignment) {
      assignment = createAssignmentFromRequest(request, workspace, {
        volunteer: volunteer,
        origin: request.source === "live" ? "live" : "demo",
        volunteerOrigin: volunteer && volunteer.origin || "",
        status: action.targetStatus || "Accepted",
        autoManaged: safeText(volunteer && volunteer.origin || "", 20).toLowerCase() === "demo"
      });
      workspace.assignments.unshift(assignment);
    }
    if (volunteer) {
      assignment.volunteer = volunteer.name;
      assignment.volunteerOrigin = safeText(volunteer.origin || "demo", 20).toLowerCase() || "demo";
      assignment.autoManaged = assignment.volunteerOrigin === "demo";
    }
    assignment.district = request.district;
    assignment.location = request.location;
    assignment.status = normalizeAssignmentStatus(action.targetStatus || assignment.status || "Accepted");
    assignment.updatedAt = nowIso();
    assignment.acceptedAt = assignment.acceptedAt || nowIso();
    if (assignment.status === "In Progress") {
      assignment.startedAt = assignment.startedAt || nowIso();
      request.status = "In Progress";
    } else if (isAssignmentCompleteStage(assignment.status)) {
      request.status = "Delivered";
    } else {
      request.status = normalizeRequestStatus(request.status) === "Pending" ? "Assigned" : normalizeRequestStatus(request.status);
    }
    request.updatedAt = nowIso();
    syncAssignmentsForRequest(request, workspace, request.status);
    workspace.audit.unshift("AI assigned " + assignment.title + " to " + assignment.volunteer + ".");
    workspace.audit.unshift(buildVolunteerStatusLine(assignment, assignment.status));
    workspace.systemNotice = buildVolunteerStatusLine(assignment, assignment.status);
    return {
      ok: true,
      summary: "Assigned " + request.title + " to " + assignment.volunteer + " in " + safeText(request.district || "the active district", 120) + "."
    };
  }

  function executeUpdateRequestStatusAction(action, session, workspace) {
    const request = findRequestForAiAction(action, workspace);
    if (!request) {
      return { ok: false, summary: "Could not find the request to update." };
    }
    const current = normalizeRequestStatus(request.status);
    const target = normalizeAiTargetStatus("request", action.targetStatus, current);
    if (current === target) {
      return { ok: false, summary: request.title + " is already in the " + target + " stage." };
    }
    request.status = target;
    request.updatedAt = nowIso();
    if (target === "Assigned" && !workspace.assignments.some(function (item) { return item.requestId === request.id; })) {
      workspace.assignments.unshift(createAssignmentFromRequest(request, workspace));
    }
    syncAssignmentsForRequest(request, workspace, target);
    workspace.audit.unshift("AI moved " + request.title + " to " + target + ".");
    workspace.systemNotice = request.title + " is now in the " + target + " stage.";
    return {
      ok: true,
      summary: "Moved " + request.title + " to " + target + "."
    };
  }

  function executeUpdateAssignmentStatusAction(action, session, workspace) {
    const assignment = findAssignmentForAiAction(action, workspace, session);
    if (!assignment) {
      return { ok: false, summary: "Could not find the assignment to update." };
    }
    if (session.role === "volunteer" && normalizeSearchQuery(assignment.volunteer) !== normalizeSearchQuery(session.name || session.profile && session.profile.fullName || "")) {
      return { ok: false, summary: "Volunteer AI can only update assignments linked to the signed-in volunteer." };
    }
    const current = normalizeAssignmentStatus(assignment.status);
    const target = normalizeAiTargetStatus("assignment", action.targetStatus, current);
    if (current === target) {
      return { ok: false, summary: assignment.title + " is already marked " + target + "." };
    }
    if (target === "Completed") {
      completeAssignment(assignment, workspace.requests.find(function (item) { return item.id === assignment.requestId; }) || null, workspace, "AI completed " + assignment.title + " after field confirmation.");
    } else {
      assignment.status = target;
      assignment.updatedAt = nowIso();
      assignment.acceptedAt = assignment.acceptedAt || nowIso();
      if (target === "In Progress") {
        assignment.startedAt = assignment.startedAt || nowIso();
      }
    }
    if (assignment.requestId) {
      const request = workspace.requests.find(function (item) { return item.id === assignment.requestId; });
      if (request) {
        if (target === "Accepted") request.status = "Assigned";
        if (target === "In Progress") request.status = "In Progress";
        if (target === "Completed") request.status = "Delivered";
        request.updatedAt = nowIso();
      }
    }
    if (target !== "Completed") {
      workspace.audit.unshift(buildVolunteerStatusLine(assignment, target));
      workspace.systemNotice = buildVolunteerStatusLine(assignment, target);
    }
    return {
      ok: true,
      summary: "Updated " + assignment.title + " to " + target + "."
    };
  }

  function executeRecommendDonationUseAction(action, session, workspace) {
    const request = findRequestForAiAction(action, workspace) || (buildBoostedPredictionRows(workspace)[0] || {}).request || null;
    const donation = findDonationForAiAction(action, workspace) || workspace.donations[0] || null;
    if (!request || !donation) {
      return { ok: false, summary: "The AI could not find both a visible donation and a visible request to connect." };
    }
    const recommendation = buildDonationUseRecommendation(request, donation);
    donation.recommendedRequestId = request.id;
    donation.recommendedUse = recommendation;
    donation.lastRecommendedAt = new Date().toISOString();
    workspace.audit.unshift("AI recommended using " + donation.donor + "'s donation for " + request.title + ".");
    workspace.systemNotice = "AI mapped donation support to " + request.title + ".";
    return {
      ok: true,
      summary: "Recommended " + donation.donor + "'s donation for " + request.title + "."
    };
  }

  function executeGenerateOutreachDraftAction(action, session, workspace, message) {
    const request = findRequestForAiAction(action, workspace) || (buildBoostedPredictionRows(workspace)[0] || {}).request || workspace.requests[0] || null;
    const recipients = safeText(action.recipients, 180) || defaultOutreachRecipients(session.role, request);
    const draft = buildOutreachDraftMessage(request, recipients, message);
    workspace.outreach.unshift(draft);
    workspace.audit.unshift("AI drafted outreach for " + recipients + ".");
    workspace.systemNotice = "AI prepared a new outreach draft for " + recipients + ".";
    return {
      ok: true,
      summary: "Created an outreach draft for " + recipients + "."
    };
  }

  function findRequestForAiAction(action, workspace) {
    if (!action) {
      return null;
    }
    if (action.requestId) {
      const byId = workspace.requests.find(function (item) { return item.id === action.requestId; });
      if (byId) {
        return byId;
      }
    }
    const query = normalizeSearchQuery([action.requestTitle, action.district].filter(Boolean).join(" "));
    if (!query) {
      return (buildBoostedPredictionRows(workspace)[0] || {}).request || workspace.requests[0] || null;
    }
    return workspace.requests.slice().sort(function (left, right) {
      return scoreSearchFields(query, [right.title, right.id, right.district, right.location, right.summary]) -
        scoreSearchFields(query, [left.title, left.id, left.district, left.location, left.summary]);
    })[0] || null;
  }

  function findAssignmentForAiAction(action, workspace, session) {
    if (!action) {
      return null;
    }
    if (action.assignmentId) {
      const byId = workspace.assignments.find(function (item) { return item.id === action.assignmentId; });
      if (byId) {
        return byId;
      }
    }
    const query = normalizeSearchQuery([action.assignmentTitle, action.requestTitle, action.volunteerName, action.district].filter(Boolean).join(" "));
    if (query) {
      return workspace.assignments.slice().sort(function (left, right) {
        return scoreSearchFields(query, [right.title, right.id, right.volunteer, right.district, right.location]) -
          scoreSearchFields(query, [left.title, left.id, left.volunteer, left.district, left.location]);
      })[0] || null;
    }
    if (session && session.role === "volunteer") {
      const selfName = normalizeSearchQuery(session.name || session.profile && session.profile.fullName || "");
      return workspace.assignments.find(function (item) {
        return normalizeSearchQuery(item.volunteer) === selfName;
      }) || null;
    }
    return workspace.assignments[0] || null;
  }

  function findVolunteerForAiAction(action, workspace, request) {
    if (action && action.volunteerName) {
      const query = normalizeSearchQuery(action.volunteerName);
      const direct = workspace.volunteers.slice().sort(function (left, right) {
        return scoreSearchFields(query, [right.name, right.ngo, right.location, joinSkills(right.skills)]) -
          scoreSearchFields(query, [left.name, left.ngo, left.location, joinSkills(left.skills)]);
      })[0] || null;
      if (direct) {
        return direct;
      }
    }
    if (request) {
      return pickBestVolunteerForRequest(request, workspace);
    }
    return workspace.volunteers[0] || null;
  }

  function findDonationForAiAction(action, workspace) {
    if (!action) {
      return null;
    }
    const query = normalizeSearchQuery([action.donationDonor, action.donationKind].filter(Boolean).join(" "));
    if (!query) {
      return workspace.donations[0] || null;
    }
    return workspace.donations.slice().sort(function (left, right) {
      return scoreSearchFields(query, [right.donor, right.kind, right.itemType, right.paymentMethod, right.note, right.description]) -
        scoreSearchFields(query, [left.donor, left.kind, left.itemType, left.paymentMethod, left.note, left.description]);
    })[0] || null;
  }

  function normalizeAiTargetStatus(kind, targetStatus, current) {
    const cleaned = safeText(targetStatus, 80);
    if (kind === "request") {
      const normalized = cleaned ? normalizeRequestStatus(cleaned) : "";
      return normalized || REQUEST_STAGES[Math.min(REQUEST_STAGES.indexOf(normalizeRequestStatus(current)) + 1, REQUEST_STAGES.length - 1)];
    }
    if (kind === "assignment") {
      const normalizedAssignment = cleaned ? normalizeAssignmentStatus(cleaned) : "";
      return normalizedAssignment || ASSIGNMENT_STAGES[Math.min(ASSIGNMENT_STAGES.indexOf(normalizeAssignmentStatus(current)) + 1, ASSIGNMENT_STAGES.length - 1)];
    }
    return cleaned;
  }

  function buildDonationUseRecommendation(request, donation) {
    return "Use " + donation.donor + "'s " + formatDonationLine(donation) + " to support " + request.title + " in " + safeText(request.district || "the visible district", 120) + ".";
  }

  function defaultOutreachRecipients(role, request) {
    if (role === "user") {
      return "Community support desk";
    }
    if (role === "volunteer") {
      return "Volunteer response team";
    }
    if (request && normalizeSearchQuery(request.category) === "community alert") {
      return "Community, Volunteer, Government";
    }
    return "Community, Volunteer, Donations";
  }

  function buildOutreachDraftMessage(request, recipients, originalMessage) {
    if (!request) {
      return "AI outreach draft - " + recipients;
    }
    return safeText(
      request.district + " response draft - " + recipients + " - Focus on " + request.title + ". " +
      "Reason: " + safeText(request.summary || request.ai || originalMessage || "Active coordination is needed now.", 240),
      420
    );
  }

  function buildAiExecutionSummary(results) {
    const lines = (results || []).filter(function (item) {
      return item && item.summary;
    }).map(function (item) {
      return "- " + item.summary;
    });
    if (!lines.length) {
      return "";
    }
    return "AI actions:\n" + lines.join("\n");
  }

  function buildAiExecutionNotice(executedCount, skippedCount) {
    if (executedCount && skippedCount) {
      return "AI executed " + String(executedCount) + " action(s) and skipped " + String(skippedCount) + ".";
    }
    if (executedCount) {
      return "AI executed " + String(executedCount) + " workspace action(s).";
    }
    if (skippedCount) {
      return "AI reviewed the workspace, but no safe action could be completed.";
    }
    return "";
  }

  function describeAiAction(action) {
    if (!action || !action.type) {
      return "the requested change";
    }
    if (action.type === "assign_task") return "task assignment";
    if (action.type === "update_request_status") return "request status update";
    if (action.type === "update_assignment_status") return "assignment status update";
    if (action.type === "recommend_donation_use") return "donation recommendation";
    if (action.type === "generate_outreach_draft") return "outreach drafting";
    return action.type;
  }

  function buildLocalCopilotResponse(message, workspace, session, history) {
    const prompt = buildEffectiveCopilotQuery(message, history);
    const topPrediction = buildBoostedPredictionRows(workspace)[0] || null;
    const topAssignment = workspace.assignments[0] || null;
    const topDonation = workspace.donations[0] || null;
    const districtRows = buildDistrictSummary(workspace);
    const volunteerSnapshot = buildVolunteerSnapshot(session, workspace);
    const entityMatch = findLocalCopilotEntityMatch(prompt, workspace);
    const specificTerms = extractCopilotSpecificTerms(prompt);
    const workspaceLoaded = workspace.requests.length || workspace.assignments.length || workspace.volunteers.length || workspace.donations.length;
    const actionPlan = planLocalCopilotActions(prompt, session, workspace, topPrediction, topAssignment, topDonation, volunteerSnapshot, entityMatch);

    function respond(text) {
      return {
        text: text,
        actions: actionPlan
      };
    }

    if (!workspaceLoaded) {
      return respond(formatCopilotSections(
          "Load a scenario first so the assistant can reason from visible requests, volunteers, donations, and assignments.",
          "The current workspace does not have enough live data to rank needs or explain the next move clearly.",
          "Use the demo loader, then ask about a district, a volunteer, a donor, or the next response step."
        ));
    }

    if (entityMatch) {
      return respond(buildLocalEntityResponse(entityMatch, workspace, session, volunteerSnapshot, topPrediction));
    }

    if (!entityMatch && specificTerms.length && matchesAiIntent(prompt, ["find", "show", "lookup", "look up", "who is", "details", "profile"])) {
      return respond(formatCopilotSections(
          'I could not find "' + specificTerms.join(" ") + '" in the visible workspace.',
          "The assistant only answers from the volunteers, districts, requests, assignments, and donations that are currently loaded.",
          "Try the exact volunteer name, donor name, request title, or load a different demo scenario first."
        ));
    }

    if (matchesAiIntent(prompt, ["my task", "my tasks", "my assignment", "my assignments", "my points", "my badge", "my badges", "my reliability", "my attendance", "my profile"])) {
      return respond(buildVolunteerSelfResponse(volunteerSnapshot, workspace, session));
    }

    if (matchesAiIntent(prompt, ["why", "explain", "recommended", "recommend", "reason"])) {
      return respond(buildLocalExplanationResponse(workspace, topPrediction));
    }

    if (matchesAiIntent(prompt, ["donation", "donations", "money", "item", "items", "fund", "funding", "donor"])) {
      return respond(buildLocalDonationGapResponse(workspace, topPrediction, topDonation));
    }

    if (matchesAiIntent(prompt, ["volunteer", "assign", "assignment", "match", "responder", "team"])) {
      return respond(buildLocalVolunteerMatchResponse(workspace, topPrediction));
    }

    if (matchesAiIntent(prompt, ["district", "highest risk", "high risk", "top district", "priority district", "where should", "where do we focus", "where to focus", "location"])) {
      return respond(buildLocalDistrictPriorityResponse(workspace, districtRows, topPrediction));
    }

    if (matchesAiIntent(prompt, ["summary", "status", "overview", "what's happening", "whats happening", "what is happening", "update"])) {
      return respond(buildLocalWorkspaceSummary(workspace, session, topPrediction, topDonation));
    }

    if (actionPlan.length || matchesAiIntent(prompt, ["plan", "next step", "next steps", "next action", "next actions", "next 2 hours", "what should"])) {
      return respond(buildLocalActionPlan(workspace, session, topPrediction, topAssignment, topDonation));
    }

    return respond(buildLocalWorkspaceSummary(workspace, session, topPrediction, topDonation));
  }

  function planLocalCopilotActions(prompt, session, workspace, topPrediction, topAssignment, topDonation, volunteerSnapshot, entityMatch) {
    if (!shouldGenerateAiActions(prompt, session.role)) {
      return [];
    }
    const actions = [];
    const targetRequest = entityMatch && entityMatch.type === "request" ? entityMatch.item : (topPrediction && topPrediction.request) || workspace.requests[0] || null;
    const targetAssignment = entityMatch && entityMatch.type === "assignment" ? entityMatch.item : topAssignment;
    const targetDonation = entityMatch && entityMatch.type === "donation" ? entityMatch.item : topDonation;
    const targetVolunteer = entityMatch && entityMatch.type === "volunteer" ? entityMatch.item : (targetRequest ? pickBestVolunteerForRequest(targetRequest, workspace) : null);

    if (session.role === "volunteer") {
      const ownTask = volunteerSnapshot && volunteerSnapshot.activeTasks && volunteerSnapshot.activeTasks[0] || targetAssignment;
      if (!ownTask) {
        return [];
      }
      actions.push({
        type: "update_assignment_status",
        assignmentId: ownTask.id,
        targetStatus: extractLocalTargetStatus(prompt, "assignment") || "In Progress"
      });
      return actions;
    }

    if (matchesAiIntent(prompt, ["manage", "operate", "run", "control room", "take action", "do it", "start now", "stabilize"])) {
      if (targetRequest && normalizeRequestStatus(targetRequest.status) === "Pending") {
        actions.push({ type: "update_request_status", requestId: targetRequest.id, targetStatus: "Reviewed" });
      }
      if (targetRequest) {
        actions.push({
          type: "assign_task",
          requestId: targetRequest.id,
          volunteerName: targetVolunteer && targetVolunteer.name || ""
        });
      }
      if (targetAssignment && normalizeAssignmentStatus(targetAssignment.status) === "Accepted") {
        actions.push({ type: "update_assignment_status", assignmentId: targetAssignment.id, targetStatus: "In Progress" });
      }
      if (targetDonation && targetRequest) {
        actions.push({ type: "recommend_donation_use", donationDonor: targetDonation.donor, requestId: targetRequest.id });
      }
      if (targetRequest) {
        actions.push({ type: "generate_outreach_draft", requestId: targetRequest.id });
      }
      return normalizeAiActionPlan(actions);
    }

    if (matchesAiIntent(prompt, ["assign", "match", "allocate", "route", "dispatch"])) {
      actions.push({
        type: "assign_task",
        requestId: targetRequest && targetRequest.id || "",
        volunteerName: targetVolunteer && targetVolunteer.name || ""
      });
    }
    if (matchesAiIntent(prompt, ["review", "approve request", "advance request", "move request", "update request", "request status", "close request"])) {
      actions.push({
        type: "update_request_status",
        requestId: targetRequest && targetRequest.id || "",
        targetStatus: extractLocalTargetStatus(prompt, "request")
      });
    }
    if (matchesAiIntent(prompt, ["update assignment", "assignment status", "start task", "mark delivered", "complete task", "close assignment"])) {
      actions.push({
        type: "update_assignment_status",
        assignmentId: targetAssignment && targetAssignment.id || "",
        targetStatus: extractLocalTargetStatus(prompt, "assignment")
      });
    }
    if (matchesAiIntent(prompt, ["donation use", "use donation", "fund this", "recommend donation", "route donation"])) {
      actions.push({
        type: "recommend_donation_use",
        donationDonor: targetDonation && targetDonation.donor || "",
        requestId: targetRequest && targetRequest.id || ""
      });
    }
    if (matchesAiIntent(prompt, ["outreach", "draft", "alert", "message", "notify"])) {
      actions.push({
        type: "generate_outreach_draft",
        requestId: targetRequest && targetRequest.id || ""
      });
    }
    return normalizeAiActionPlan(actions);
  }

  function shouldGenerateAiActions(prompt, role) {
    if (role === "user" || !prompt) {
      return false;
    }
    return /(assign|allocate|dispatch|route|match|update|change|mark|close|deliver|review|approve|manage|operate|run|take action|do it|draft|alert|notify|outreach|fund this|use donation|recommend donation|start task|complete task)/.test(prompt);
  }

  function extractLocalTargetStatus(prompt, kind) {
    if (/close|closed/.test(prompt)) {
      return "Closed";
    }
    if (/deliver|delivered/.test(prompt)) {
      return kind === "assignment" ? "Completed" : "Delivered";
    }
    if (/complete|completed/.test(prompt)) {
      return kind === "assignment" ? "Completed" : "Closed";
    }
    if (/progress|start|started|active/.test(prompt)) {
      return "In Progress";
    }
    if (kind === "request" && /(review|reviewed|approve|approved)/.test(prompt)) {
      return "Reviewed";
    }
    if (/(assign|assigned|dispatch|allocate|match)/.test(prompt)) {
      return kind === "assignment" ? "Accepted" : "Assigned";
    }
    return "";
  }

  function buildEffectiveCopilotQuery(message, history) {
    const prompt = normalizeSearchQuery(message);
    if (!prompt) {
      return "";
    }
    if (!Array.isArray(history) || !history.length) {
      return prompt;
    }
    if (!/^(why|how|then|next|what about|and|also|okay|ok|now what|what next|which one)$/i.test(prompt)) {
      return prompt;
    }
    const lastUserMessage = history.slice().reverse().find(function (entry) {
      return entry && entry.speaker !== "assistant" && safeText(entry.text, 1000);
    });
    return lastUserMessage ? normalizeSearchQuery(lastUserMessage.text + " " + prompt) : prompt;
  }

  function matchesAiIntent(query, phrases) {
    return (phrases || []).some(function (phrase) {
      return query.indexOf(normalizeSearchQuery(phrase)) !== -1;
    });
  }

  function extractCopilotSpecificTerms(query) {
    const stopWords = {
      a: true, about: true, active: true, alert: true, all: true, and: true, are: true, around: true, assignment: true,
      assignments: true, best: true, district: true, districts: true, donation: true, donations: true, donor: true,
      donors: true, explain: true, find: true, for: true, from: true, fund: true, funding: true, give: true,
      help: true, highest: true, how: true, in: true, into: true, is: true, item: true, items: true, latest: true,
      location: true, match: true, me: true, money: true, my: true, next: true, of: true, on: true, plan: true,
      priority: true, request: true, requests: true, responder: true, responders: true, result: true, risk: true,
      search: true, show: true, status: true, summary: true, support: true, tell: true, the: true, there: true,
      today: true, top: true, track: true, update: true, updates: true, volunteer: true, volunteers: true, what: true,
      where: true, which: true, who: true, why: true
    };
    return query.split(" ").map(function (term) {
      return safeText(term, 40).toLowerCase();
    }).filter(function (term) {
      return term && !stopWords[term] && (term.length > 2 || /\d/.test(term));
    });
  }

  function countCopilotTermHits(terms, fields) {
    const blob = normalizeSearchQuery((fields || []).join(" "));
    return terms.filter(function (term) {
      return blob.indexOf(term) !== -1;
    }).length;
  }

  function findLocalCopilotEntityMatch(query, workspace) {
    const specificTerms = extractCopilotSpecificTerms(query);
    const candidates = [];
    if (!specificTerms.length) {
      return null;
    }

    function pushCandidate(type, item, fields) {
      const score = scoreSearchFields(query, fields);
      const hits = countCopilotTermHits(specificTerms, fields);
      if (!score || !hits) {
        return;
      }
      candidates.push({
        type: type,
        item: item,
        score: score + hits * 8,
        hits: hits
      });
    }

    workspace.volunteers.forEach(function (volunteer) {
      pushCandidate("volunteer", volunteer, [
        volunteer.name,
        volunteer.ngo,
        volunteer.location,
        volunteer.contact,
        volunteer.email,
        volunteer.phone,
        joinSkills(volunteer.skills)
      ]);
    });

    workspace.requests.forEach(function (request) {
      pushCandidate("request", request, [
        request.title,
        request.id,
        request.category,
        request.district,
        request.location,
        request.summary,
        request.ai
      ]);
    });

    workspace.assignments.forEach(function (assignment) {
      pushCandidate("assignment", assignment, [
        assignment.title,
        assignment.id,
        assignment.volunteer,
        assignment.district,
        assignment.location,
        assignment.status
      ]);
    });

    workspace.donations.forEach(function (donation) {
      pushCandidate("donation", donation, [
        donation.donor,
        donation.id,
        donation.kind,
        donation.itemType,
        donation.paymentMethod,
        donation.note,
        donation.description
      ]);
    });

    buildDistrictSummary(workspace).forEach(function (district) {
      pushCandidate("district", district, [
        district.district,
        district.status,
        district.meta,
        district.copy
      ]);
    });

    candidates.sort(function (left, right) {
      return right.score - left.score || right.hits - left.hits;
    });
    if (!candidates.length) {
      return null;
    }
    const top = candidates[0];
    if (top.score < 88 && top.hits < Math.min(2, specificTerms.length)) {
      return null;
    }
    return top;
  }

  function buildLocalEntityResponse(match, workspace, session, volunteerSnapshot, topPrediction) {
    if (match.type === "volunteer") {
      return buildLocalVolunteerResponse(match.item, workspace);
    }
    if (match.type === "request") {
      return buildLocalRequestResponse(match.item, workspace);
    }
    if (match.type === "assignment") {
      return buildLocalAssignmentResponse(match.item, workspace);
    }
    if (match.type === "donation") {
      return buildLocalDonationResponse(match.item, workspace, topPrediction);
    }
    if (match.type === "district") {
      return buildLocalDistrictResponse(match.item, workspace, topPrediction);
    }
    return buildLocalWorkspaceSummary(workspace, session, topPrediction, workspace.donations[0] || null, volunteerSnapshot);
  }

  function buildLocalVolunteerResponse(volunteer, workspace) {
    const relatedAssignments = workspace.assignments.filter(function (assignment) {
      return normalizeSearchQuery(assignment.volunteer) === normalizeSearchQuery(volunteer.name);
    });
    const completed = relatedAssignments.filter(function (assignment) {
      return isAssignmentCompleteStage(assignment.status);
    }).length;
    const active = relatedAssignments.length - completed;
    const reliability = Math.max(Number(volunteer.reliability || 0), computeVolunteerReliability(volunteer, workspace.assignments));
    const availability = safeText(volunteer.availability || "Availability not visible", 80);
    const location = safeText(volunteer.location || "Location not visible", 120);
    const skills = joinSkills(volunteer.skills) || "General response support";
    const ngo = safeText(volunteer.ngo || "Independent responder", 120);
    const contact = safeText(volunteer.contact || volunteer.email || volunteer.phone || "Contact not visible", 180);
    return formatCopilotSections(
      volunteer.name + " is visible in the workspace as part of " + ngo + ". Skills: " + skills + ".",
      "Availability is " + availability + ", location is " + location + ", and the reliability signal is " + String(reliability) + "%. There are " + String(active) + " active assignment(s) and " + String(completed) + " completed assignment(s) linked to this volunteer.",
      relatedAssignments.length
        ? "Use the Volunteer Directory or assignment board to route the next task. Contact: " + contact + "."
        : "This volunteer is visible but not yet linked to a current assignment. Review district fit before assigning. Contact: " + contact + "."
    );
  }

  function buildLocalRequestResponse(request, workspace) {
    const prediction = buildBoostedPredictionRows(workspace).find(function (item) {
      return item.request && item.request.id === request.id;
    }) || null;
    const relatedAssignments = workspace.assignments.filter(function (assignment) {
      return normalizeSearchQuery(assignment.district) === normalizeSearchQuery(request.district) ||
        normalizeSearchQuery(assignment.location).indexOf(normalizeSearchQuery(request.location || request.district)) !== -1;
    });
    const recommendation = request.title + " in " + safeText(request.district || "the visible district", 120) + " is currently " + normalizeRequestStatus(request.status) + " with " + String(request.beneficiaries || 0) + " people affected.";
    const whyNow = prediction
      ? prediction.explanation
      : (safeText(request.ai || request.summary || "This visible request still needs coordination support.", 320));
    const nextAction = prediction
      ? prediction.recommendation
      : "Advance this request through review and assignment, then connect matching volunteers and donations.";
    const extras = [
      "Priority: " + safeText(request.priority || "Tracked", 40),
      "Location: " + safeText(request.location || request.district || "Not visible", 160),
      relatedAssignments.length ? (String(relatedAssignments.length) + " visible assignment(s) are nearby or already linked.") : "No clearly linked assignments are visible yet."
    ];
    return formatCopilotSections(recommendation, whyNow, nextAction, extras);
  }

  function buildLocalAssignmentResponse(assignment, workspace) {
    const status = normalizeAssignmentStatus(assignment.status);
    const volunteer = workspace.volunteers.find(function (item) {
      return normalizeSearchQuery(item.name) === normalizeSearchQuery(assignment.volunteer);
    }) || null;
    const volunteerSummary = volunteer
      ? ("Volunteer fit: " + volunteer.name + " from " + safeText(volunteer.ngo || "the visible network", 120) + " with " + (joinSkills(volunteer.skills) || "general response support") + ".")
      : "The volunteer profile is not visible in the shared directory snapshot.";
    return formatCopilotSections(
      assignment.title + " is currently " + status + " for " + safeText(assignment.volunteer || "the assigned volunteer", 140) + " in " + safeText(assignment.district || "the visible district", 120) + ".",
      volunteerSummary + " The task location is " + safeText(assignment.location || "not visible", 180) + " and the visible reward value is " + String(assignment.points || 0) + " point(s).",
      isAssignmentCompleteStage(status)
        ? "Keep the task in the archive and use it as proof for attendance, impact, and reporting."
        : "Advance the assignment status after field confirmation and capture proof once the work is completed."
    );
  }

  function buildLocalDonationResponse(donation, workspace, topPrediction) {
    const stage = normalizeDonationLifecycle(donation.status);
    const donationLine = formatDonationLine(donation);
    const nextNeed = topPrediction
      ? (safeText(topPrediction.request.category || "support", 80).toLowerCase() + " support for " + safeText(topPrediction.request.district || "the active district", 120))
      : "the highest visible request";
    return formatCopilotSections(
      donation.donor + " has a visible donation record for " + donationLine + ". Current stage: " + stage + ".",
      topPrediction
        ? ("The current top gap is " + topPrediction.request.title + " in " + topPrediction.request.district + ", so this donation should be checked against that need if it fits.")
        : "This donation is visible in the shared workspace and can be reviewed, verified, and connected to active needs.",
      stage === "Delivered"
        ? "Keep the record archived and use it as proof in exports and impact reports."
        : "Verify the donation, confirm the queue state, and connect it to " + nextNeed + "."
    );
  }

  function buildLocalDistrictResponse(districtRow, workspace, topPrediction) {
    const topRequest = workspace.requests.find(function (request) {
      return normalizeSearchQuery(request.district) === normalizeSearchQuery(districtRow.district);
    }) || null;
    const recommendation = districtRow.district + " currently shows " + String(districtRow.requests) + " visible request(s), " + String(districtRow.assignments) + " assignment(s), and " + String(districtRow.beneficiaries) + " projected beneficiaries.";
    const whyNow = districtRow.copy + (topPrediction && normalizeSearchQuery(topPrediction.request.district) === normalizeSearchQuery(districtRow.district)
      ? (" The boosted score for " + topPrediction.request.title + " is " + String(topPrediction.score) + "/100.")
      : "");
    const nextAction = topPrediction && normalizeSearchQuery(topPrediction.request.district) === normalizeSearchQuery(districtRow.district)
      ? topPrediction.recommendation
      : "Review the district feed, move waiting requests into assignment, and keep volunteer coverage ahead of demand.";
    const extras = topRequest ? ["Top visible request: " + topRequest.title + " (" + normalizeRequestStatus(topRequest.status) + ")"] : [];
    return formatCopilotSections(recommendation, whyNow, nextAction, extras);
  }

  function buildVolunteerSelfResponse(snapshot, workspace, session) {
    const badgeLine = (snapshot.badges || []).join(", ");
    const currentTask = snapshot.activeTasks && snapshot.activeTasks.length ? snapshot.activeTasks[0] : null;
    return formatCopilotSections(
      snapshot.personalAssignments
        ? ("You currently have " + String(snapshot.activeTasks.length) + " active task(s), " + String(snapshot.completed) + " completed task(s), and " + String(snapshot.points) + " visible point(s).")
        : snapshot.summary,
      "Your reliability is " + String(snapshot.reliability) + "%, your current streak is " + String(snapshot.streak) + " day(s), and your visible badges are " + (badgeLine || "Ready To Respond") + ".",
      currentTask
        ? ("Focus next on " + currentTask.title + " in " + safeText(currentTask.district || currentTask.location || "the visible district", 140) + ".")
        : (session.role === "volunteer"
            ? "Open the Volunteer Directory or load a demo scenario to connect your profile to active assignments."
            : "Use the volunteer lane only when you want personal task, points, and badge details.")
    );
  }

  function buildLocalVolunteerMatchResponse(workspace, topPrediction) {
    const bestVolunteer = topPrediction ? bestVolunteerForRequest(topPrediction.request, workspace) : null;
    const recommendation = topPrediction
      ? ("The current best visible match is " + (bestVolunteer ? bestVolunteer.name : "the volunteer already suggested by the request") + " for " + topPrediction.request.title + ".")
      : "The workspace needs more visible request pressure before it can explain the best volunteer match clearly.";
    const whyNow = topPrediction
      ? (bestVolunteer
          ? (bestVolunteer.name + " fits because of district proximity, relevant skills, and current availability. " + topPrediction.explanation)
          : (topPrediction.request.ai || topPrediction.explanation))
      : "Load or refresh a scenario so the assistant can compare skills, district fit, and assignment pressure.";
    const nextAction = topPrediction
      ? (topPrediction.recommendation + (bestVolunteer ? (" Recommended responder: " + bestVolunteer.name + ".") : ""))
      : "Load demo data, then ask again about the best volunteer fit.";
    return formatCopilotSections(recommendation, whyNow, nextAction);
  }

  function buildLocalDonationGapResponse(workspace, topPrediction, topDonation) {
    const category = topPrediction ? safeText(topPrediction.request.category || "support", 80).toLowerCase() : "support";
    const recommendation = topPrediction
      ? ("Surface more " + category + " support for " + topPrediction.request.district + ".")
      : "Donation guidance becomes more precise once a visible request scenario is loaded.";
    const whyNow = topPrediction
      ? (topPrediction.explanation + (topDonation ? (" The latest visible donation is from " + topDonation.donor + " - " + formatDonationLine(topDonation) + ".") : " No donation records are visible yet."))
      : "The assistant needs a live scenario to identify the biggest donation gap.";
    const nextAction = topPrediction
      ? (topDonation
          ? "Review the latest donation and connect it to " + topPrediction.request.title + " if it matches."
          : "Use the Donation Portal to surface money or item support for the top request first.")
      : "Load a scenario, then ask again about money gaps, item shortages, or donor needs.";
    return formatCopilotSections(recommendation, whyNow, nextAction);
  }

  function buildLocalDistrictPriorityResponse(workspace, districtRows, topPrediction) {
    const topRow = districtRows[0] || null;
    if (!topRow && !topPrediction) {
      return formatCopilotSections(
        "District priority is not visible yet.",
        "The assistant needs request and beneficiary data before it can rank district pressure.",
        "Load a demo scenario or add requests first."
      );
    }
    return buildLocalDistrictResponse(topRow || { district: topPrediction.request.district, requests: 1, assignments: workspace.assignments.length, beneficiaries: topPrediction.request.beneficiaries, copy: topPrediction.explanation }, workspace, topPrediction);
  }

  function buildLocalExplanationResponse(workspace, topPrediction) {
    if (!topPrediction) {
      return formatCopilotSections(
        "The AI explanation becomes stronger once the workspace has an active ranked request.",
        "Right now there is not enough boosted ranking context to explain the next move clearly.",
        "Load a scenario or ask about a specific volunteer, request, district, or donation."
      );
    }
    return formatCopilotSections(
      topPrediction.request.title + " is being prioritized in " + topPrediction.request.district + " with a boosted score of " + String(topPrediction.score) + "/100.",
      topPrediction.explanation,
      topPrediction.recommendation,
      topPrediction.factors.slice(0, 4)
    );
  }

  function buildLocalActionPlan(workspace, session, topPrediction, topAssignment, topDonation) {
    const bestVolunteer = topPrediction ? bestVolunteerForRequest(topPrediction.request, workspace) : null;
    const actions = [];
    if (topPrediction) {
      actions.push("Move " + topPrediction.request.title + " in " + topPrediction.request.district + " first.");
    }
    if (bestVolunteer) {
      actions.push("Confirm " + bestVolunteer.name + " as the visible responder fit.");
    } else if (topAssignment) {
      actions.push("Advance " + topAssignment.title + " after field confirmation.");
    }
    if (topDonation) {
      actions.push("Review " + topDonation.donor + "'s donation and connect it to the highest-pressure need.");
    }
    return formatCopilotSections(
      topPrediction
        ? ("For the next 2 hours, focus on " + topPrediction.request.title + " in " + topPrediction.request.district + ".")
        : "For the next 2 hours, focus on refreshing the active workspace and validating the top visible need.",
      "The workspace currently shows " + String(workspace.requests.length) + " request(s), " + String(workspace.assignments.length) + " assignment(s), " + String(workspace.volunteers.length) + " volunteer profile(s), and " + String(workspace.donations.length) + " donation record(s).",
      actions.length ? actions.join(" ") : "Load a scenario or open the active portal feed to surface the next action clearly."
    );
  }

  function buildLocalWorkspaceSummary(workspace, session, topPrediction, topDonation) {
    const roleLabel = (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label;
    const district = topDistrict(workspace) || "the active district";
    const nextMove = topPrediction ? topPrediction.recommendation : "Load a scenario to activate the boosted ranking engine.";
    return formatCopilotSections(
      roleLabel + " view: " + String(workspace.requests.length) + " request(s), " + String(workspace.assignments.length) + " assignment(s), " + String(workspace.volunteers.length) + " volunteer profile(s), and " + String(workspace.donations.length) + " donation record(s) are visible.",
      topPrediction
        ? ("The current pressure leader is " + district + ". " + topPrediction.explanation)
        : ("The workspace has visible records, but a ranked top request is not active yet for " + district + "."),
      nextMove,
      topDonation ? ["Latest donation: " + topDonation.donor + " - " + formatDonationLine(topDonation)] : []
    );
  }

  function bestVolunteerForRequest(request, workspace) {
    const district = normalizeSearchQuery(request.district);
    const skills = CATEGORY_SKILLS[safeText(request.category, 60).toLowerCase()] || ["coordination", "support"];
    return (workspace.volunteers || []).map(function (volunteer) {
      const location = normalizeSearchQuery(volunteer.location);
      const skillText = normalizeSearchQuery(joinSkills(volunteer.skills));
      let score = 0;
      if (district && location.indexOf(district) !== -1) {
        score += 4;
      }
      skills.forEach(function (skill) {
        if (skillText.indexOf(normalizeSearchQuery(skill)) !== -1) {
          score += 3;
        }
      });
      const availability = normalizeSearchQuery(volunteer.availability);
      if (availability.indexOf("available") !== -1 || availability.indexOf("active") !== -1) {
        score += 2;
      }
      score += Math.round(computeVolunteerReliability(volunteer, workspace.assignments) / 20);
      return {
        volunteer: volunteer,
        score: score
      };
    }).sort(function (left, right) {
      return right.score - left.score;
    }).map(function (item) {
      return item.volunteer;
    })[0] || null;
  }

  function formatCopilotSections(recommendation, whyNow, nextAction, extras) {
    const parts = [];
    if (recommendation) {
      parts.push(safeText(recommendation, 600));
    }
    if (whyNow) {
      parts.push(safeText(whyNow, 900));
    }
    if (nextAction) {
      const actionText = safeText(nextAction, 700);
      parts.push(/^next\b/i.test(actionText) ? actionText : ("A practical next step is to " + actionText.charAt(0).toLowerCase() + actionText.slice(1)));
    }
    const visibleSignals = Array.isArray(extras) ? extras.filter(Boolean).slice(0, 4) : [];
    if (visibleSignals.length) {
      parts.push("Visible signals include " + visibleSignals.map(function (item) {
        return safeText(item, 180);
      }).join(", ") + ".");
    }
    return parts.join("\n\n");
  }

  function shouldCopilotEmitActions(message) {
    const normalized = normalizeSearchQuery(message);
    if (!normalized) {
      return false;
    }
    return /(assign|reassign|shift|move|update|change|set|advance|mark|complete|start|draft|write|generate outreach|send outreach|route|use donation|recommend donation|manage|operate|handle|take action|approve|review)/.test(normalized);
  }

  function buildCopilotPrompt(workspace, session, message, history) {
    const volunteerSnapshot = buildVolunteerSnapshot(session, workspace);
    const districtSummary = buildDistrictSummary(workspace).slice(0, 4).map(function (item) {
      return {
        district: item.district,
        requests: item.requests,
        assignments: item.assignments,
        beneficiaries: item.beneficiaries,
        status: item.status
      };
    });
    const snapshot = {
      scenario: workspace.label,
      summary: workspace.summary,
      role: (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label,
      metrics: {
        requests: workspace.requests.length,
        assignments: workspace.assignments.length,
        volunteers: workspace.volunteers.length,
        donations: workspace.donations.length,
        beneficiaries: totalBeneficiaries(workspace),
        topDistrict: topDistrict(workspace) || ""
      },
      districtSummary: districtSummary,
      topRequests: workspace.requests.slice(0, 5).map(function (item) {
        return {
          id: item.id,
          title: item.title,
          district: item.district,
          location: item.location,
          priority: item.priority,
          status: item.status,
          beneficiaries: item.beneficiaries,
          ai: item.ai
        };
      }),
      assignments: workspace.assignments.slice(0, 5),
      volunteers: workspace.volunteers.slice(0, 5),
      donations: workspace.donations.slice(0, 5),
      insightItems: buildInsightItems(workspace),
      matchingSteps: buildMatchingSteps(workspace),
      volunteerSnapshot: session.role === "volunteer" ? {
        summary: volunteerSnapshot.summary,
        district: volunteerSnapshot.district,
        points: volunteerSnapshot.points,
        completed: volunteerSnapshot.completed,
        reliability: volunteerSnapshot.reliability,
        badges: volunteerSnapshot.badges
      } : null,
      boostedSignals: buildBoostedPredictionRows(workspace).slice(0, 3).map(function (item) {
        return {
          title: item.request.title,
          district: item.request.district,
          score: item.score,
          explanation: item.explanation,
          recommendation: item.recommendation,
          factors: item.factors
        };
      })
    };
    const transcript = history.slice(-6).map(function (item) {
      return (item.speaker === "assistant" ? "Assistant" : "User") + ": " + item.text;
    }).join("\n");
    const wantsActions = shouldCopilotEmitActions(message);
    return [
      "You are ResourceFlow Copilot, a calm operations analyst inside an NGO coordination and disaster-response platform.",
      "Answer like a real Gemini-style operational assistant: specific, grounded, conversational, and decisive without sounding robotic or template-driven.",
      "Use only the workspace data provided. If a person, district, request, assignment, or donation is not visible in the snapshot, say it is not found.",
      "Mention exact names, districts, counts, statuses, and risk scores when relevant.",
      "Do not invent hidden data, unseen volunteers, extra donors, or completed work that is not in the snapshot.",
      "The active portal role is: " + (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label + ". Tailor the answer to that role.",
      "Respond in natural language first, with short clear paragraphs that sound like a thoughtful real assistant.",
      "Avoid rigid labels unless the user explicitly asks for a structured answer. Do not sound like a rules engine or a template.",
      wantsActions ? "Because the user is asking you to operate the workspace, you may add one final line only in this exact format:" : "",
      wantsActions ? 'ACTIONS_JSON: [{"type":"assign_task","requestId":"...","requestTitle":"...","assignmentId":"...","assignmentTitle":"...","volunteerName":"...","donationDonor":"...","targetStatus":"...","recipients":"...","reason":"..."}]' : "",
      wantsActions ? "Allowed action types are: assign_task, update_request_status, update_assignment_status, recommend_donation_use, generate_outreach_draft." : "",
      wantsActions ? "Only include ACTIONS_JSON if you are confident the visible workspace data supports that action." : "",
      "Community User cannot mutate the workspace. Volunteer can only update their own assignments. Government and Admin can use all listed action types.",
      "Keep actions conservative and safe. Never create fake people or fake records. Use only the currently visible scenario.",
      "Keep the answer human, useful, and a little strategic. Short paragraphs are better than rigid headings unless the user asks for a structured plan.",
      transcript ? "Recent conversation:\n" + transcript : "",
      "Workspace snapshot:\n" + JSON.stringify(snapshot, null, 2),
      "User question: " + message
    ].filter(Boolean).join("\n\n");
  }

  function extractGeminiTextClient(payload) {
    const candidates = payload && payload.candidates;
    if (!Array.isArray(candidates) || !candidates.length) {
      return "";
    }
    const parts = candidates[0] && candidates[0].content && candidates[0].content.parts;
    if (!Array.isArray(parts)) {
      return "";
    }
    return parts.map(function (part) {
      return safeText(part && part.text, 4000);
    }).filter(Boolean).join("\n").trim();
  }

  async function ensureFirebaseFunctionsClient(config) {
    await loadScript("https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-auth-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-functions-compat.js");
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(buildFirebaseInitConfig(config));
    }
    return window.firebase.app().functions(config.functionsRegion || "us-central1");
  }

  function buildFirebaseInitConfig(config) {
    return {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
      measurementId: config.measurementId
    };
  }

  function getAiChatHistory(role) {
    return loadJson(buildAiChatKey(role), []).filter(function (item) {
      return item && safeText(item.text, 4000);
    }).slice(-12);
  }

  function appendAiChatMessage(role, speaker, text, source) {
    const history = getAiChatHistory(role);
    history.push({
      speaker: speaker === "user" ? "user" : "assistant",
      text: safeText(text, 4000),
      source: safeText(source, 120),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(buildAiChatKey(role), JSON.stringify(history.slice(-12)));
  }

  function clearAiChatHistory(role) {
    localStorage.removeItem(buildAiChatKey(role));
  }

  function buildAiChatKey(role) {
    return AI_CHAT_HISTORY_KEY + "-" + (normalizePortal(role) || "user");
  }

  function formatChatTime(value) {
    if (!value) {
      return "";
    }
    try {
      return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  }

  async function handleSignOut() {
    clearPortalState();
    try {
      await signOutFirebaseUser();
    } catch (error) {
      console.warn("Firebase sign out fallback failed.", error);
    }
    window.location.assign("./index.html");
  }

  async function signOutFirebaseUser() {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    if (!config.enabled || !config.enableAuth) {
      return;
    }
    if (!window.firebase || !window.firebase.auth) {
      await loadScript("https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-auth-compat.js");
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
          measurementId: config.measurementId
        });
      }
    }
    if (window.firebase && window.firebase.auth) {
      await window.firebase.auth().signOut();
    }
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-portal-src="' + url + '"]');
      if (existing) {
        if (existing.dataset.loaded === "true") {
          resolve();
          return;
        }
        existing.addEventListener("load", function () { resolve(); }, { once: true });
        existing.addEventListener("error", function () { reject(new Error("Could not load " + url)); }, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.dataset.portalSrc = url;
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

  function getSession() {
    const selected = normalizePortal(localStorage.getItem(PORTAL_SELECTION_KEY));
    const handoff = loadJson(PORTAL_HANDOFF_KEY, {});
    const entryProfile = loadJson(ENTRY_PROFILE_KEY, {});
    const demoRole = detectDemoRole();
    const hasSession = Boolean(selected || normalizePortal(handoff.role) || demoRole || safeText(entryProfile.email || "", 160));
    const role = selected || normalizePortal(handoff.role) || detectDemoRole() || "user";
    const profiles = loadJson(PORTAL_PROFILE_KEY, {});
    const portalProfile = profiles[role] && typeof profiles[role] === "object" ? profiles[role] : {};
    return {
      hasSession: hasSession,
      role: role,
      name: safeText(portalProfile.fullName || portalProfile.displayName || entryProfile.displayName || "ResourceFlow User", 120),
      email: safeText(entryProfile.email || loadDemoEmail() || "", 160),
      profile: portalProfile,
      summary: (ROLE_CONFIG[role] || ROLE_CONFIG.user).description
    };
  }

  function detectDemoRole() {
    const demo = loadJson(DEMO_AUTH_KEY, {});
    return normalizePortal(demo.role);
  }

  function loadDemoEmail() {
    const demo = loadJson(DEMO_AUTH_KEY, {});
    return safeText(demo.email || "", 160);
  }

  function getWorkspace() {
    const stored = loadJson(WORKSPACE_KEY, null);
    return enrichWorkspace(stored && stored.requests && stored.assignments && stored.volunteers ? stored : Object.assign({}, EMPTY_WORKSPACE));
  }

  function getManagedWorkspace(options) {
    return runWorkspaceAutomation(options).workspace;
  }

  function seedWorkspace(scenario) {
    const nextWorkspace = buildScenarioWorkspace(scenario, getWorkspace());
    saveWorkspace(nextWorkspace);
  }

  function resetWorkspace() {
    const workspace = getWorkspace();
    const preservedVolunteers = (workspace.volunteers || []).filter(function (item) {
      return safeText(item.origin, 20).toLowerCase() !== "demo";
    });
    saveWorkspace(enrichWorkspace(Object.assign({}, EMPTY_WORKSPACE, {
      volunteers: preservedVolunteers,
      generatedAt: nowIso(),
      lastRefreshedAt: nowIso()
    })));
  }

  function loadDismissedAlerts() {
    const items = loadJson(DISMISSED_ALERTS_KEY, {});
    return items && typeof items === "object" ? items : {};
  }

  function saveDismissedAlerts(items) {
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(items || {}));
  }

  function buildAlertKey(page, workspace, title) {
    return [
      safeText(page, 40).toLowerCase(),
      safeText(workspace && workspace.scenario || "none", 40).toLowerCase(),
      safeText(title, 120).toLowerCase()
    ].join("::");
  }

  function isAlertDismissed(alertKey) {
    const items = loadDismissedAlerts();
    return !!items[safeText(alertKey, 180)];
  }

  function dismissAlert(alertKey) {
    const key = safeText(alertKey, 180);
    if (!key) {
      return;
    }
    const items = loadDismissedAlerts();
    items[key] = true;
    saveDismissedAlerts(items);
  }

  function buildRequestReceiptId(request) {
    const district = safeText(request && request.district, 32).toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 4) || "RFLW";
    const tail = safeText(request && request.id, 40).replace(/[^0-9A-Z]+/gi, "").slice(-4) || String(Math.floor(Math.random() * 9000 + 1000));
    return district + "-" + tail;
  }

  function buildRequestHistoryEntry(type, text, actor) {
    return {
      id: "hist-" + String(nowMs()) + "-" + Math.floor(Math.random() * 900 + 100),
      type: safeText(type || "update", 40).toLowerCase(),
      text: safeText(text || "Workspace update recorded.", 240),
      actor: safeText(actor || "ResourceFlow", 120),
      createdAt: nowIso()
    };
  }

  function appendRequestHistory(request, type, text, actor) {
    if (!request) {
      return;
    }
    request.history = Array.isArray(request.history) ? request.history : [];
    request.history.unshift(buildRequestHistoryEntry(type, text, actor));
    request.history = request.history.slice(0, 10);
    request.updatedAt = nowIso();
  }

  function loadTrackedRequests() {
    const items = loadJson(REQUEST_TRACK_KEY, []);
    return Array.isArray(items) ? items : [];
  }

  function loadRequestLookupState() {
    const state = loadJson(REQUEST_LOOKUP_KEY, {});
    return {
      receiptId: safeText(state && state.receiptId, 80),
      searched: Boolean(state && state.searched)
    };
  }

  function saveRequestLookupState(receiptId, searched) {
    saveJson(REQUEST_LOOKUP_KEY, {
      receiptId: safeText(receiptId, 80),
      searched: Boolean(searched)
    });
  }

  function loadModerationFilter() {
    return safeText(localStorage.getItem(ADMIN_MODERATION_FILTER_KEY) || "all", 40).toLowerCase() || "all";
  }

  function saveModerationFilter(value) {
    localStorage.setItem(ADMIN_MODERATION_FILTER_KEY, safeText(value || "all", 40).toLowerCase());
  }

  function saveTrackedRequests(items) {
    saveJson(REQUEST_TRACK_KEY, Array.isArray(items) ? items.slice(0, 16) : []);
  }

  function trackSubmittedRequest(request, session) {
    if (!request) {
      return;
    }
    const items = loadTrackedRequests().filter(function (item) {
      return safeText(item.id, 80) !== safeText(request.id, 80);
    });
    items.unshift({
      id: safeText(request.id, 80),
      receiptId: safeText(request.receiptId || buildRequestReceiptId(request), 80),
      title: safeText(request.title, 140),
      district: safeText(request.district, 80),
      requester: safeText((session && session.name) || request.requester || "Community user", 120),
      requesterEmail: safeText((session && session.email) || request.requesterEmail || "", 140),
      status: safeText(request.status || "Pending", 40),
      updatedAt: safeText(request.updatedAt || request.createdAt || nowIso(), 40)
    });
    saveTrackedRequests(items);
  }

  function syncTrackedRequestsFromWorkspace(workspace) {
    const tracked = loadTrackedRequests();
    if (!tracked.length || !workspace || !Array.isArray(workspace.requests)) {
      return;
    }
    const byId = {};
    workspace.requests.forEach(function (request) {
      byId[safeText(request.id, 80)] = request;
    });
    saveTrackedRequests(tracked.map(function (item) {
      const match = byId[safeText(item.id, 80)];
      if (!match) {
        return item;
      }
      return Object.assign({}, item, {
        status: safeText(match.status || item.status, 40),
        updatedAt: safeText(match.updatedAt || item.updatedAt || nowIso(), 40),
        receiptId: safeText(match.receiptId || item.receiptId, 80)
      });
    }));
  }

  function findTrackedRequestByReceipt(receiptId, workspace, session) {
    const normalizedReceipt = normalizeSearchQuery(receiptId);
    if (!normalizedReceipt) {
      return null;
    }
    const tracked = loadTrackedRequests().find(function (item) {
      const requesterEmail = normalizeSearchQuery(item.requesterEmail);
      const sessionEmail = normalizeSearchQuery(session && session.email);
      const sameRequester = !sessionEmail || !requesterEmail || requesterEmail === sessionEmail;
      return sameRequester && normalizeSearchQuery(item.receiptId) === normalizedReceipt;
    }) || null;
    if (!tracked) {
      return null;
    }
    const request = (workspace && Array.isArray(workspace.requests) ? workspace.requests : []).find(function (item) {
      return safeText(item.id, 80) === safeText(tracked.id, 80) || normalizeSearchQuery(item.receiptId) === normalizedReceipt;
    }) || null;
    return {
      tracked: tracked,
      request: request,
      history: request && Array.isArray(request.history) && request.history.length ? request.history : []
    };
  }

  function loadNotificationState() {
    const items = loadJson(NOTIFICATION_STATE_KEY, {});
    return items && typeof items === "object" ? items : {};
  }

  function saveNotificationState(items) {
    saveJson(NOTIFICATION_STATE_KEY, items || {});
  }

  function buildNotificationId(item) {
    return safeText([
      item && item.title,
      item && item.meta,
      item && item.status,
      item && item.copy
    ].join("::"), 260).toLowerCase();
  }

  function isNotificationUnread(id) {
    const state = loadNotificationState();
    return state[safeText(id, 260)] !== "read";
  }

  function markNotificationRead(id) {
    const key = safeText(id, 260);
    if (!key) {
      return;
    }
    const state = loadNotificationState();
    state[key] = "read";
    saveNotificationState(state);
  }

  function markAllNotificationsRead(items) {
    const state = loadNotificationState();
    (Array.isArray(items) ? items : []).forEach(function (item) {
      const key = safeText(item && item.id, 260);
      if (key) {
        state[key] = "read";
      }
    });
    saveNotificationState(state);
  }

  function loadToasts() {
    const items = loadJson(TOAST_STATE_KEY, []);
    return Array.isArray(items) ? items.slice(0, 5) : [];
  }

  function saveToasts(items) {
    saveJson(TOAST_STATE_KEY, Array.isArray(items) ? items.slice(0, 5) : []);
  }

  function pushToast(type, title, message) {
    const items = loadToasts();
    items.unshift({
      id: "toast-" + String(nowMs()) + "-" + Math.floor(Math.random() * 900 + 100),
      type: safeText(type || "info", 20).toLowerCase(),
      title: safeText(title || "ResourceFlow", 80),
      message: safeText(message || "", 220)
    });
    saveToasts(items);
  }

  function dismissToast(id) {
    saveToasts(loadToasts().filter(function (item) {
      return safeText(item.id, 80) !== safeText(id, 80);
    }));
  }

  function loadOfflineQueue() {
    const items = loadJson(OFFLINE_QUEUE_KEY, []);
    return Array.isArray(items) ? items : [];
  }

  function saveOfflineQueue(items) {
    saveJson(OFFLINE_QUEUE_KEY, Array.isArray(items) ? items.slice(-20) : []);
  }

  function enqueueOfflineAction(action) {
    const queue = loadOfflineQueue();
    queue.push(Object.assign({ queuedAt: nowIso() }, action || {}));
    saveOfflineQueue(queue);
    setSyncStatus("queued", "Connection is limited. ResourceFlow queued your change and will sync when possible.");
  }

  function flushOfflineQueue() {
    if (!navigator.onLine) {
      return;
    }
    const queue = loadOfflineQueue();
    if (!queue.length) {
      return;
    }
    saveOfflineQueue([]);
    pushToast("info", "Offline queue synced", String(queue.length) + " queued change(s) were folded back into the workspace.");
    setSyncStatus("synced", "Queued changes were synced back into the workspace.");
  }

  function getSyncStatus() {
    const items = loadJson(SYNC_STATUS_KEY, { state: "", message: "" });
    return items && typeof items === "object" ? items : { state: "", message: "" };
  }

  function setSyncStatus(state, message) {
    saveJson(SYNC_STATUS_KEY, {
      state: safeText(state || "", 20).toLowerCase(),
      message: safeText(message || "", 220),
      updatedAt: nowIso()
    });
  }

  function saveWorkspace(workspace, options) {
    const nextWorkspace = enrichWorkspace(workspace);
    const serialized = JSON.stringify(nextWorkspace);
    localStorage.setItem(WORKSPACE_KEY, serialized);
    if (!(options && options.skipBackendSync)) {
      scheduleWorkspaceBackendSync(serialized, options && options.reason);
    }
  }

  function scheduleWorkspaceBackendSync(serialized, reason) {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    if (!config.enabled || config.forceLocalWorkspace || !config.lifecycleBackendEnabled) {
      return;
    }
    WORKSPACE_SYNC_RUNTIME.pendingSerialized = safeText(serialized, 2500000);
    WORKSPACE_SYNC_RUNTIME.reason = safeText(reason || "workspace-save", 80) || "workspace-save";
    if (WORKSPACE_SYNC_RUNTIME.timerId) {
      window.clearTimeout(WORKSPACE_SYNC_RUNTIME.timerId);
    }
    WORKSPACE_SYNC_RUNTIME.timerId = window.setTimeout(function () {
      WORKSPACE_SYNC_RUNTIME.timerId = 0;
      flushWorkspaceBackendSync();
    }, 900);
  }

  async function flushWorkspaceBackendSync() {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    const serialized = WORKSPACE_SYNC_RUNTIME.pendingSerialized;
    if (!config.enabled || config.forceLocalWorkspace || !config.lifecycleBackendEnabled || !serialized) {
      return;
    }
    if (WORKSPACE_SYNC_RUNTIME.inflight) {
      return;
    }
    if (serialized === WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized) {
      return;
    }
    WORKSPACE_SYNC_RUNTIME.inflight = true;
    try {
      const functions = await ensureFirebaseFunctionsClient(config);
      const callable = functions.httpsCallable("processWorkspaceLifecycle");
      const result = await callable({
        workspace: JSON.parse(serialized),
        reason: WORKSPACE_SYNC_RUNTIME.reason || "workspace-save"
      });
      const state = result && result.data && result.data.state ? enrichWorkspace(result.data.state) : null;
      const nextSerialized = state ? JSON.stringify(state) : serialized;
      WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized = nextSerialized;
      WORKSPACE_SYNC_RUNTIME.pendingSerialized = nextSerialized;
      if (state && nextSerialized !== localStorage.getItem(WORKSPACE_KEY)) {
        localStorage.setItem(WORKSPACE_KEY, nextSerialized);
        window.dispatchEvent(new CustomEvent("resourceflow:workspace-synced"));
      }
    } catch (error) {
      console.warn("Workspace backend sync skipped.", error);
      WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized = serialized;
    } finally {
      WORKSPACE_SYNC_RUNTIME.inflight = false;
      if (
        WORKSPACE_SYNC_RUNTIME.pendingSerialized &&
        WORKSPACE_SYNC_RUNTIME.pendingSerialized !== WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized &&
        !WORKSPACE_SYNC_RUNTIME.timerId
      ) {
        WORKSPACE_SYNC_RUNTIME.timerId = window.setTimeout(function () {
          WORKSPACE_SYNC_RUNTIME.timerId = 0;
          flushWorkspaceBackendSync();
        }, 1500);
      }
    }
  }

  function buildScenarioWorkspace(scenario, existingWorkspace) {
    const preset = SCENARIO_PRESETS[scenario] || SCENARIO_PRESETS.flood;
    const cycleId = demoCycleId();
    const generated = generateDemoScenarioState(preset, cycleId);
    const workspace = mergeGeneratedScenarioWithLiveData(generated, existingWorkspace);
    workspace.systemNotice = preset.label + " loaded. Admin and Government queues were refreshed with new pending entries.";
    workspace.audit.unshift("AI refreshed the " + preset.label + " scenario and reprioritized the live queue.");
    return enrichWorkspace(workspace);
  }

  function generateDemoScenarioState(preset, cycleId) {
    const generatedAt = nowIso();
    const requests = cloneScenarioItems(preset.requests || []).map(function (item, index) {
      const district = safeText(item.district || "District", 80);
      const location = randomizeLocationLabel(district, item.location);
      const createdAt = new Date(nowMs() - index * 4 * 60000).toISOString();
      return {
        id: "REQ-" + slugify(preset.key) + "-" + String(index + 1) + "-" + cycleId.slice(-4),
        title: randomizeRequestTitle(item.title, item.category, district),
        category: safeText(item.category || "Logistics", 60),
        district: district,
        location: location,
        lat: Number(item.lat || 0),
        lng: Number(item.lng || 0),
        beneficiaries: Number(item.beneficiaries || 0),
        priority: safeText(item.priority || "Medium", 40),
        status: normalizeRequestStatus(item.status || "Pending"),
        summary: safeText(item.summary || "Visible request generated from the active disaster story.", 280),
        ai: safeText(item.ai || "AI will match skills, district fit, and donation support for this request.", 320),
        requester: "Disaster Demo Engine",
        requestedAt: createdAt,
        createdAt: createdAt,
        updatedAt: createdAt,
        source: "disaster-demo",
        origin: "demo",
        priorityLane: "Disaster Demo",
        broadcastTo: ["admin", "government"],
        complexity: inferTaskComplexity(item.priority || "Medium"),
        estimatedDurationMinutes: estimatedDurationMinutes(item.priority || "Medium", "disaster-demo"),
        demoCycleId: cycleId,
        blocked: Boolean(item.blocked)
      };
    });

    const volunteers = cloneScenarioItems(preset.volunteers || []).map(function (item, index) {
      const anchor = requests[index % Math.max(1, requests.length)] || {};
      const offset = (Math.random() - 0.5) * 0.06;
      const lat = Number(anchor.lat || 0) + offset;
      const lng = Number(anchor.lng || 0) - offset;
      return {
        id: "VOL-" + slugify(preset.key) + "-" + String(index + 1) + "-" + cycleId.slice(-4),
        name: DEMO_VOLUNTEER_NAMES[(index + Math.floor(Math.random() * DEMO_VOLUNTEER_NAMES.length)) % DEMO_VOLUNTEER_NAMES.length],
        ngo: safeText(item.ngo || item.ngoGroup || "Relief Network", 120),
        skills: Array.isArray(item.skills) ? item.skills.slice() : String(item.skills || "").split(",").map(function (skill) { return safeText(skill, 40); }).filter(Boolean),
        location: randomizeLocationLabel(anchor.district || item.location, item.location),
        district: safeText(anchor.district || item.location || "District", 80),
        availability: safeText(item.availability || "Available", 40),
        activityStatus: safeText(item.activityStatus || normalizedAvailability(item.availability || "available"), 40),
        contact: safeText(item.contact || ("demo." + slugify(item.ngo || item.name || "volunteer") + "@resourceflow.demo"), 180),
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
        reliability: Number(item.reliability || 72 + index * 3),
        pointsEarned: 0,
        completedTasks: 0,
        attendanceDays: 1,
        origin: "demo",
        demoCycleId: cycleId
      };
    });

    const assignments = cloneScenarioItems(preset.assignments || []).map(function (item, index) {
      const request = requests[index % Math.max(1, requests.length)] || {};
      const volunteer = volunteers[index % Math.max(1, volunteers.length)] || {};
      const normalizedStatus = normalizeAssignmentStatus(item.status || "Accepted");
      const createdAt = new Date(nowMs() - (index + 1) * 3 * 60000).toISOString();
      return {
        id: "ASG-" + slugify(preset.key) + "-" + String(index + 1) + "-" + cycleId.slice(-4),
        requestId: safeText(request.id || "", 80),
        title: safeText(item.title || ("Respond to " + safeText(request.title, 140)), 180),
        volunteer: safeText(volunteer.name || item.volunteer || "Volunteer pending", 140),
        district: safeText(request.district || item.district || "", 80),
        location: safeText(request.location || item.location || "", 140),
        status: normalizedStatus,
        date: safeText(item.date || "Today " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), 40),
        points: Number(item.points || computeTaskPoints(request.priority || "Medium", 0)),
        createdAt: createdAt,
        updatedAt: createdAt,
        acceptedAt: createdAt,
        startedAt: normalizedStatus === "In Progress" || normalizedStatus === "Completed" ? createdAt : "",
        completedAt: normalizedStatus === "Completed" ? createdAt : "",
        estimatedDurationMinutes: estimatedDurationMinutes(request.priority || "Medium", "disaster-demo"),
        shiftCount: 0,
        shifted: false,
        pointsAwarded: normalizedStatus === "Completed",
        origin: "demo",
        volunteerOrigin: "demo",
        source: "disaster-demo",
        demoCycleId: cycleId
      };
    });

    const donations = cloneScenarioItems(preset.donations || []).map(function (item, index) {
      const createdAt = new Date(nowMs() - (index + 1) * 5 * 60000).toISOString();
      return Object.assign({}, item, {
        id: "DON-" + slugify(preset.key) + "-" + String(index + 1) + "-" + cycleId.slice(-4),
        donor: randomFrom(DEMO_DONOR_NAMES) || safeText(item.donor || "Demo donor", 120),
        status: normalizeDonationLifecycle(item.status || "Submitted"),
        createdAt: createdAt,
        updatedAt: createdAt,
        origin: "demo",
        source: "disaster-demo",
        demoCycleId: cycleId
      });
    });

    return {
      scenario: preset.key,
      label: preset.label,
      summary: preset.summary,
      requests: requests,
      assignments: assignments,
      volunteers: volunteers,
      donations: donations,
      audit: ["Disaster demo generated new incoming requests, volunteer movement, and donation records."].concat(cloneScenarioItems(preset.audit || [])),
      outreach: cloneScenarioItems(preset.outreach || []),
      systemNotice: preset.label + " loaded. Review the tracker, AI story, and map links.",
      generatedAt: generatedAt,
      lastRefreshedAt: generatedAt,
      demoCycleId: cycleId
    };
  }

  function mergeGeneratedScenarioWithLiveData(generated, existingWorkspace) {
    const existing = enrichWorkspace(existingWorkspace || EMPTY_WORKSPACE);
    const liveRequests = (existing.requests || []).filter(function (item) { return safeText(item.origin, 20).toLowerCase() !== "demo"; });
    const liveAssignments = (existing.assignments || []).filter(function (item) { return safeText(item.origin, 20).toLowerCase() !== "demo"; });
    const liveVolunteers = (existing.volunteers || []).filter(function (item) { return safeText(item.origin, 20).toLowerCase() !== "demo"; });
    const liveDonations = (existing.donations || []).filter(function (item) { return safeText(item.origin, 20).toLowerCase() !== "demo"; });

    return enrichWorkspace({
      scenario: generated.scenario,
      label: generated.label,
      summary: generated.summary,
      requests: generated.requests.concat(liveRequests),
      assignments: generated.assignments.concat(liveAssignments),
      volunteers: mergeVolunteersByIdentity(liveVolunteers.concat(generated.volunteers)),
      donations: generated.donations.concat(liveDonations),
      audit: generated.audit.concat(existing.audit || []).slice(0, 18),
      outreach: generated.outreach.concat(existing.outreach || []).slice(0, 12),
      systemNotice: generated.systemNotice,
      generatedAt: generated.generatedAt,
      lastRefreshedAt: generated.lastRefreshedAt,
      demoCycleId: generated.demoCycleId
    });
  }

  function mergeVolunteersByIdentity(items) {
    const seen = {};
    return items.filter(function (item) {
      const key = normalizeSearchQuery([item.id, item.name, item.contact, item.email].join(" "));
      if (!key || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });
  }

  function randomizeRequestTitle(title, category, district) {
    const categoryLabel = safeText(category || "Support", 60);
    const suffix = randomFrom(["response", "support", "assist", "coverage", "follow-up", "handoff"]) || "support";
    return safeText(title || (categoryLabel + " request"), 140) + " - " + suffix + " - " + safeText(district || "district", 80);
  }

  function hydrateVolunteerProfilesIntoWorkspace(workspace) {
    const profiles = loadJson(PORTAL_PROFILE_KEY, {});
    const entryProfile = loadJson(ENTRY_PROFILE_KEY, {});
    const volunteerProfile = profiles && profiles.volunteer && typeof profiles.volunteer === "object" ? profiles.volunteer : null;
    const name = safeText(volunteerProfile && (volunteerProfile.fullName || volunteerProfile.displayName) || entryProfile.displayName || "", 120);
    const email = safeText(volunteerProfile && volunteerProfile.email || entryProfile.email || "", 180);
    if (!name && !email) {
      return false;
    }
    const key = normalizeSearchQuery(name || email);
    const existingIndex = workspace.volunteers.findIndex(function (item) {
      return normalizeSearchQuery(item.name || item.contact || "") === key || normalizeSearchQuery(item.contact || "") === normalizeSearchQuery(email);
    });
    const record = {
      id: safeText((volunteerProfile && volunteerProfile.id) || ("VOL-LIVE-" + slugify(email || name)), 80),
      name: name || "Live Volunteer",
      ngo: safeText(volunteerProfile && volunteerProfile.ngoGroup || "ResourceFlow Team", 120),
      skills: Array.isArray(volunteerProfile && volunteerProfile.skills)
        ? volunteerProfile.skills.slice()
        : String(volunteerProfile && volunteerProfile.skills || "coordination, support").split(",").map(function (skill) { return safeText(skill, 40); }).filter(Boolean),
      location: safeText(volunteerProfile && volunteerProfile.location || "Unknown district", 140),
      district: safeText(volunteerProfile && volunteerProfile.district || volunteerProfile && volunteerProfile.location || "Unknown district", 80),
      availability: safeText(volunteerProfile && volunteerProfile.activityStatus || volunteerProfile && volunteerProfile.availability || "Available", 40),
      activityStatus: safeText(volunteerProfile && volunteerProfile.activityStatus || "available", 40),
      contact: email || safeText(volunteerProfile && volunteerProfile.phone || "", 180),
      origin: "real"
    };
    if (existingIndex >= 0) {
      workspace.volunteers[existingIndex] = Object.assign({}, workspace.volunteers[existingIndex], record);
    } else {
      workspace.volunteers.unshift(record);
    }
    return true;
  }

  function runWorkspaceAutomation(options) {
    const workspace = getWorkspace();
    let changed = hydrateVolunteerProfilesIntoWorkspace(workspace);
    if (workspace.scenario !== "none") {
      const refreshed = maybeRefreshDemoWorkspace(workspace, options);
      if (refreshed.changed) {
        changed = true;
      }
    }
    if (applyRequestAutomation(workspace)) {
      changed = true;
    }
    if (applyAssignmentAutomation(workspace)) {
      changed = true;
    }
    if (recalculateVolunteerProfiles(workspace)) {
      changed = true;
    }
    if (changed) {
      workspace.requests = sortRequestsForLifecycle(workspace.requests || []);
      workspace.assignments = sortAssignmentsForLifecycle(workspace.assignments || []);
      workspace.donations = sortDonationsForLifecycle(workspace.donations || []);
      workspace.lastAutomationAt = nowIso();
      saveWorkspace(workspace);
    }
    return { changed: changed, workspace: enrichWorkspace(workspace) };
  }

  function maybeRefreshDemoWorkspace(workspace, options) {
    const generatedAt = parseTimestamp(workspace.generatedAt || workspace.lastRefreshedAt);
    if (!generatedAt || nowMs() - generatedAt < DEMO_REFRESH_MS) {
      return { changed: false };
    }
    const refreshed = buildScenarioWorkspace(workspace.scenario, workspace);
    workspace.scenario = refreshed.scenario;
    workspace.label = refreshed.label;
    workspace.summary = refreshed.summary;
    workspace.requests = refreshed.requests;
    workspace.assignments = refreshed.assignments;
    workspace.volunteers = refreshed.volunteers;
    workspace.donations = refreshed.donations;
    workspace.audit = refreshed.audit;
    workspace.outreach = refreshed.outreach;
    workspace.systemNotice = refreshed.label + " auto-refreshed with a new 10-minute demo cycle.";
    workspace.generatedAt = refreshed.generatedAt;
    workspace.lastRefreshedAt = refreshed.lastRefreshedAt;
    workspace.demoCycleId = refreshed.demoCycleId;
    workspace.audit.unshift("AI cleared the old demo cycle and loaded a fresh randomized " + refreshed.label + " workspace.");
    return { changed: true };
  }

  function applyRequestAutomation(workspace) {
    let changed = false;
    const sorted = sortRequestsForLifecycle(workspace.requests || []);
    sorted.forEach(function (request) {
      if (request.broadcastedAt == null && (request.source === "live" || request.source === "disaster-demo")) {
        request.status = "Pending";
        request.broadcastedAt = nowIso();
        workspace.audit.unshift("AI logged " + request.title + " and broadcasted a Pending status to Admin and Government.");
        workspace.systemNotice = request.title + " is Pending and visible in Admin and Government review queues.";
        changed = true;
      }
      const stage = normalizeRequestStatus(request.status);
      if ((stage === "Pending" || stage === "Reviewed") && !workspace.assignments.some(function (assignment) { return assignment.requestId === request.id && isAssignmentActiveStage(assignment.status); })) {
        const createdAssignments = createLifecycleAssignmentsForRequest(request, workspace);
        if (createdAssignments.length) {
          Array.prototype.unshift.apply(workspace.assignments, createdAssignments);
          request.status = "Assigned";
          request.updatedAt = nowIso();
          workspace.audit.unshift("AI matched " + createdAssignments.map(function (item) { return item.volunteer; }).join(", ") + " to " + request.title + ".");
          workspace.systemNotice = request.title + " was assigned through the AI operations queue.";
          changed = true;
        }
      }
    });
    return changed;
  }

  function applyAssignmentAutomation(workspace) {
    let changed = false;
    (workspace.assignments || []).forEach(function (assignment) {
      const stage = normalizeAssignmentStatus(assignment.status);
      const request = workspace.requests.find(function (item) { return item.id === assignment.requestId; }) || null;
      const elapsed = elapsedMinutes(assignment.startedAt || assignment.acceptedAt || assignment.createdAt);
      const duration = Math.max(6, Number(assignment.estimatedDurationMinutes || (request && request.estimatedDurationMinutes) || 12));
      const autoManaged = Boolean(assignment.autoManaged || safeText(assignment.volunteerOrigin || "", 20).toLowerCase() === "demo");

      if (autoManaged && stage === "Accepted" && elapsed >= Math.max(1, duration * 0.2)) {
        assignment.status = "In Progress";
        assignment.startedAt = assignment.startedAt || nowIso();
        assignment.updatedAt = nowIso();
        if (request) {
          request.status = "In Progress";
          request.updatedAt = nowIso();
        }
        workspace.audit.unshift("Volunteer " + assignment.volunteer + " is currently In Progress on " + assignment.title + ".");
        workspace.systemNotice = assignment.volunteer + " is now In Progress on " + assignment.title + ".";
        changed = true;
      }

      if (!assignment.shifted && !isAssignmentCompleteStage(assignment.status) && elapsed >= duration * 0.5) {
        const shifted = shiftAssignmentToNextVolunteer(assignment, request, workspace);
        if (shifted) {
          changed = true;
        }
      }

      if (!isAssignmentCompleteStage(assignment.status) && safeText(assignment.volunteerOrigin || "", 20).toLowerCase() === "demo" && elapsed >= duration * 0.85) {
        completeAssignment(assignment, request, workspace, "AI auto-completed the demo volunteer task after route progress was confirmed.");
        changed = true;
      }
    });
    return changed;
  }

  function recalculateVolunteerProfiles(workspace) {
    let changed = false;
    (workspace.volunteers || []).forEach(function (volunteer) {
      const related = (workspace.assignments || []).filter(function (assignment) {
        return normalizeSearchQuery(assignment.volunteer) === normalizeSearchQuery(volunteer.name);
      });
      const completed = related.filter(function (assignment) { return isAssignmentCompleteStage(assignment.status); }).length;
      const points = related.reduce(function (sum, assignment) {
        return sum + Number(assignment.points || 0);
      }, 0);
      const reliability = computeVolunteerReliability(volunteer, workspace.assignments || []);
      if (volunteer.completedTasks !== completed || volunteer.pointsEarned !== points || volunteer.reliability !== reliability) {
        volunteer.completedTasks = completed;
        volunteer.pointsEarned = points;
        volunteer.reliability = reliability;
        volunteer.attendanceDays = Math.max(Number(volunteer.attendanceDays || 0), completed);
        changed = true;
      }
    });
    return changed;
  }

  function createLifecycleAssignmentsForRequest(request, workspace) {
    const assignments = [];
    const realVolunteer = pickBestVolunteerForRequest(request, workspace, { origin: "real" });
    const demoVolunteer = pickBestVolunteerForRequest(request, workspace, {
      origin: "demo",
      excludeVolunteerNames: realVolunteer ? [realVolunteer.name] : []
    });
    if (request.source === "live") {
      if (realVolunteer) {
        assignments.push(createAssignmentFromRequest(request, workspace, {
          volunteer: realVolunteer,
          origin: "live",
          volunteerOrigin: "real",
          status: "Accepted",
          autoManaged: false
        }));
      }
      if (demoVolunteer) {
        assignments.push(createAssignmentFromRequest(request, workspace, {
          volunteer: demoVolunteer,
          origin: "live-support",
          volunteerOrigin: "demo",
          status: "Accepted",
          autoManaged: true,
          supportLane: true
        }));
      }
      if (!assignments.length) {
        const fallbackVolunteer = pickBestVolunteerForRequest(request, workspace);
        if (fallbackVolunteer) {
          assignments.push(createAssignmentFromRequest(request, workspace, {
            volunteer: fallbackVolunteer,
            origin: "live-fallback",
            volunteerOrigin: safeText(fallbackVolunteer.origin || "demo", 20).toLowerCase() || "demo",
            status: "Accepted",
            autoManaged: safeText(fallbackVolunteer.origin || "demo", 20).toLowerCase() === "demo"
          }));
        }
      }
    } else {
      const nearest = pickBestVolunteerForRequest(request, workspace, { origin: "demo" }) || pickBestVolunteerForRequest(request, workspace);
      if (nearest) {
        assignments.push(createAssignmentFromRequest(request, workspace, {
          volunteer: nearest,
          origin: "demo",
          volunteerOrigin: safeText(nearest.origin || "demo", 20).toLowerCase() || "demo",
          status: "Accepted",
          autoManaged: safeText(nearest.origin || "demo", 20).toLowerCase() === "demo"
        }));
      }
    }
    return assignments;
  }

  function shiftAssignmentToNextVolunteer(assignment, request, workspace) {
    const nextVolunteer = pickBestVolunteerForRequest(request || assignment, workspace, {
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
    assignment.acceptedAt = nowIso();
    assignment.startedAt = "";
    assignment.updatedAt = nowIso();
    assignment.points = computeTaskPoints(request && request.priority || "Medium", assignment.shiftCount);
    if (request) {
      request.status = "Assigned";
      request.updatedAt = nowIso();
    }
    workspace.audit.unshift(buildShiftAuditLine(assignment, nextVolunteer, request || { title: assignment.title }));
    workspace.audit.unshift(buildVolunteerStatusLine(assignment, "Accepted"));
    workspace.systemNotice = buildVolunteerStatusLine(assignment, "Accepted");
    return true;
  }

  function completeAssignment(assignment, request, workspace, reason) {
    assignment.status = "Completed";
    assignment.completedAt = nowIso();
    assignment.updatedAt = nowIso();
    assignment.points = computeTaskPoints(request && request.priority || "Medium", assignment.shiftCount);
    awardVolunteerPoints(workspace, assignment);
    if (request) {
      request.status = "Delivered";
      request.updatedAt = nowIso();
    }
    workspace.audit.unshift(buildVolunteerStatusLine(assignment, "Completed"));
    workspace.audit.unshift(reason || ("Volunteer " + assignment.volunteer + " completed " + assignment.title + "."));
    workspace.systemNotice = buildVolunteerStatusLine(assignment, "Completed");
  }

  function awardVolunteerPoints(workspace, assignment) {
    if (assignment.pointsAwarded) {
      return;
    }
    const volunteer = (workspace.volunteers || []).find(function (item) {
      return normalizeSearchQuery(item.name) === normalizeSearchQuery(assignment.volunteer);
    });
    if (volunteer) {
      volunteer.pointsEarned = Number(volunteer.pointsEarned || 0) + Number(assignment.points || 0);
      volunteer.completedTasks = Number(volunteer.completedTasks || 0) + 1;
      volunteer.lastStatus = "Completed";
      volunteer.attendanceDays = Math.max(Number(volunteer.attendanceDays || 0), Number(volunteer.completedTasks || 0));
    }
    assignment.pointsAwarded = true;
  }

  function isPageAllowed(role, page) {
    const normalizedPage = page === "overview" ? "community" : page;
    return (ROLE_CONFIG[role] || ROLE_CONFIG.user).pages.indexOf(normalizedPage) !== -1;
  }

  function homeRouteForRole(role) {
    if (role === "volunteer") return "./volunteer.html";
    if (role === "government") return "./operations.html";
    if (role === "admin") return "./admin.html";
    return "./community.html";
  }

  function normalizePage(value) {
    const page = safeText(value, 40).toLowerCase();
    if (page === "overview") {
      return "community";
    }
    return PAGE_TITLES[page] ? page : "community";
  }

  function normalizePortal(value) {
    const portal = safeText(value, 40).toLowerCase();
    if (portal === "community" || portal === "user") return "user";
    if (portal === "volunteer") return "volunteer";
    if (portal === "government" || portal === "ngo" || portal === "employee") return "government";
    if (portal === "admin") return "admin";
    return "";
  }

  function applyTheme(mode) {
    document.documentElement.classList.toggle("rf-theme-dark", mode === "dark");
  }

  function loadTheme() {
    return safeText(localStorage.getItem(THEME_KEY), 20).toLowerCase() === "dark" ? "dark" : "light";
  }

  function saveTheme(mode) {
    localStorage.setItem(THEME_KEY, mode === "dark" ? "dark" : "light");
  }

  function themeToggleLabel(mode) {
    return (mode || loadTheme()) === "dark" ? "Light Mode" : "Dark Mode";
  }

  function clearPortalState() {
    localStorage.removeItem(PORTAL_SELECTION_KEY);
    localStorage.removeItem(PORTAL_HANDOFF_KEY);
    localStorage.removeItem(DEMO_AUTH_KEY);
  }

  function joinSkills(value) {
    if (Array.isArray(value)) {
      return value.map(function (item) {
        return safeText(item, 80);
      }).filter(Boolean).join(", ");
    }
    return safeText(value, 240);
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore localStorage failures and keep the app responsive.
    }
  }

  function ensureInteractiveTestIds(scope) {
    const root = scope || document;
    root.querySelectorAll("button, a, input, select, textarea").forEach(function (node, index) {
      if (node.dataset && node.dataset.testid) {
        return;
      }
      const text = node.id || node.name || (node.dataset && node.dataset.action) || (node.textContent || "control-" + index);
      node.dataset.testid = (node.tagName.toLowerCase() + "-" + String(text).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/-+/g, "-").replace(/^-|-$/g, "");
    });
  }

  function observeInteractiveTestIds() {
    if (!window.MutationObserver || document.body.dataset.testIdObserver === "true") {
      return;
    }
    document.body.dataset.testIdObserver = "true";
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node instanceof HTMLElement) {
            ensureInteractiveTestIds(node);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function announce(message) {
    if (!message) {
      return;
    }
    let live = document.getElementById("portalLiveRegion");
    if (!live) {
      live = document.createElement("div");
      live.id = "portalLiveRegion";
      live.className = "skip-link";
      live.setAttribute("aria-live", "polite");
      live.style.left = "-9999px";
      document.body.appendChild(live);
    }
    live.textContent = message;
  }

  function safeText(value, limit) {
    const sanitized = (value == null ? "" : String(value)).replace(/\s+/g, " ").trim();
    return typeof limit === "number" && limit > 0 ? sanitized.slice(0, limit) : sanitized;
  }

  function escapeHtml(value) {
    return safeText(value).replace(/[&<>"']/g, function (match) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[match];
    });
  }

  function cssEscape(value) {
    const text = safeText(value, 80);
    if (typeof CSS !== "undefined" && CSS && typeof CSS.escape === "function") {
      return CSS.escape(text);
    }
    return text.replace(/[^a-zA-Z0-9_-]/g, "");
  }

  function formatCurrency(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  }

  function formatCurrency(value) {
    return "Rs " + Number(value || 0).toLocaleString("en-IN");
  }

  function notificationItem(title, meta, status, copy) {
    const item = {
      title: safeText(title, 140),
      meta: safeText(meta, 180),
      status: safeText(status, 60),
      copy: safeText(copy, 260)
    };
    item.id = buildNotificationId(item);
    item.unread = isNotificationUnread(item.id);
    return item;
  }

  function applyModerationRequestAction(requestId, action) {
    const workspace = getManagedWorkspace({ reason: "moderate-request" });
    const request = (workspace.requests || []).find(function (item) {
      return safeText(item.id, 80) === safeText(requestId, 80);
    });
    if (!request) {
      pushToast("warning", "Request not found", "The selected request is no longer visible in the workspace.");
      return;
    }
    if (action === "approve") {
      request.status = normalizeRequestStatus(request.status) === "Pending" ? "Reviewed" : request.status;
      request.flagged = false;
      request.flagReason = "";
      appendRequestHistory(request, "reviewed", "Admin approved the request for lifecycle progression.", "Admin");
      workspace.audit.unshift("Admin approved request " + request.title + " for " + request.district + ".");
      pushToast("success", "Request approved", request.title + " moved into the reviewed stage.");
    } else if (action === "toggle-flag") {
      request.flagged = !Boolean(request.flagged);
      request.flagReason = request.flagged ? "Flagged by admin for moderation review." : "";
      workspace.audit.unshift("Admin " + (request.flagged ? "flagged" : "cleared") + " request " + request.title + ".");
      pushToast(request.flagged ? "warning" : "success", request.flagged ? "Request flagged" : "Flag removed", request.title + (request.flagged ? " now requires moderator follow-up." : " is back in the normal queue."));
    }
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function applyModerationDonationAction(donationId, action) {
    const workspace = getManagedWorkspace({ reason: "moderate-donation" });
    const donation = (workspace.donations || []).find(function (item) {
      return safeText(item.id, 80) === safeText(donationId, 80);
    });
    if (!donation) {
      pushToast("warning", "Donation not found", "The selected donation record is no longer visible.");
      return;
    }
    if (action === "approve") {
      donation.status = "Verified";
      donation.flagged = false;
      donation.flagReason = "";
      workspace.audit.unshift("Admin verified donation from " + safeText(donation.donorName || donation.donor, 120) + ".");
      pushToast("success", "Donation verified", safeText(donation.donorName || donation.donor, 120) + " is ready for packing or routing.");
    } else if (action === "toggle-flag") {
      donation.flagged = !Boolean(donation.flagged);
      donation.flagReason = donation.flagged ? "Flagged by admin for verification or routing review." : "";
      workspace.audit.unshift("Admin " + (donation.flagged ? "flagged" : "cleared") + " donation from " + safeText(donation.donorName || donation.donor, 120) + ".");
      pushToast(donation.flagged ? "warning" : "success", donation.flagged ? "Donation flagged" : "Flag removed", safeText(donation.donorName || donation.donor, 120) + (donation.flagged ? " now needs a review pass." : " is back in the normal queue."));
    }
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function applyBulkModeration(decision) {
    const workspace = getManagedWorkspace({ reason: "bulk-moderation" });
    let changed = 0;
    if (decision === "approve") {
      (workspace.requests || []).forEach(function (request) {
        if (changed >= 3) return;
        if (normalizeRequestStatus(request.status) === "Pending") {
          request.status = "Reviewed";
          request.flagged = false;
          request.flagReason = "";
          appendRequestHistory(request, "reviewed", "Admin bulk-approved the request into review.", "Admin");
          changed += 1;
        }
      });
      (workspace.donations || []).forEach(function (donation) {
        if (changed >= 6) return;
        if (normalizeDonationLifecycle(donation.status) === "Submitted") {
          donation.status = "Verified";
          donation.flagged = false;
          donation.flagReason = "";
          changed += 1;
        }
      });
      workspace.audit.unshift("Admin bulk-approved " + changed + " moderation item(s).");
    } else if (decision === "flag") {
      (workspace.requests || []).forEach(function (request) {
        if (changed >= 3) return;
        if (normalizeRequestStatus(request.status) === "Pending" && !request.flagged) {
          request.flagged = true;
          request.flagReason = "Flagged during bulk moderation review.";
          changed += 1;
        }
      });
      (workspace.donations || []).forEach(function (donation) {
        if (changed >= 6) return;
        if (normalizeDonationLifecycle(donation.status) === "Submitted" && !donation.flagged) {
          donation.flagged = true;
          donation.flagReason = "Flagged during bulk moderation review.";
          changed += 1;
        }
      });
      workspace.audit.unshift("Admin bulk-flagged " + changed + " moderation item(s).");
    }
    if (!changed) {
      pushToast("warning", "No items changed", "There were no matching moderation items for that action.");
      return;
    }
    pushToast("success", "Bulk action applied", String(changed) + " moderation item(s) were updated.");
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function buildSuspiciousActivityCards(workspace) {
    const cards = [];
    (workspace.requests || []).filter(function (request) {
      return normalizeRequestStatus(request.status) === "Pending" && priorityScore(request.priority) >= 0.82;
    }).slice(0, 2).forEach(function (request) {
      cards.push({
        title: "Critical request waiting",
        meta: request.district + " · " + safeText(request.category, 80),
        status: request.flagged ? "Flagged" : "Pending",
        copy: request.title + " is still pending while carrying critical urgency and should be reviewed immediately.",
        actions: [
          { label: "Approve", action: "bulk-approve-request", requestId: request.id, tone: "primary-button compact-button", testId: "moderation-approve-request" },
          { label: request.flagged ? "Unflag" : "Flag", action: "toggle-suspicious-request", requestId: request.id, tone: "ghost-button compact-button", testId: "moderation-flag-request" }
        ]
      });
    });
    (workspace.donations || []).filter(function (donation) {
      const lifecycle = normalizeDonationLifecycle(donation.status);
      return lifecycle === "Submitted" && (!safeText(donation.linkedRequestId || donation.linkedRequestTitle, 160) || Number(donation.amount || 0) >= 5000 || !safeText(donation.contact || donation.donorEmail, 160));
    }).slice(0, 3).forEach(function (donation) {
      cards.push({
        title: safeText(donation.donorName || donation.donor, 120) + " donation check",
        meta: formatDonationLine(donation),
        status: donation.flagged ? "Flagged" : "Submitted",
        copy: donation.flagged
          ? safeText(donation.flagReason || "This donation has been flagged for moderator review.", 220)
          : "This donation should be linked, verified, or flagged before it continues through dispatch.",
        actions: [
          { label: "Verify", action: "bulk-approve-donation", donationId: donation.id, tone: "primary-button compact-button", testId: "moderation-verify-donation" },
          { label: donation.flagged ? "Unflag" : "Flag", action: "toggle-suspicious-donation", donationId: donation.id, tone: "ghost-button compact-button", testId: "moderation-flag-donation" }
        ]
      });
    });
    return cards.slice(0, 5);
  }

  function buildModerationFilters(workspace) {
    const requests = workspace.requests || [];
    const donations = workspace.donations || [];
    const flaggedCount = requests.filter(function (request) { return request.flagged; }).length
      + donations.filter(function (donation) { return donation.flagged; }).length;
    const pendingCount = requests.filter(function (request) { return normalizeRequestStatus(request.status) === "Pending"; }).length
      + donations.filter(function (donation) { return normalizeDonationLifecycle(donation.status) === "Submitted"; }).length;
    return {
      filter: loadModerationFilter(),
      counts: {
        all: pendingCount + flaggedCount,
        pending: pendingCount,
        flagged: flaggedCount,
        requests: requests.filter(function (request) { return normalizeRequestStatus(request.status) === "Pending" || request.flagged; }).length,
        donations: donations.filter(function (donation) { return normalizeDonationLifecycle(donation.status) === "Submitted" || donation.flagged; }).length
      }
    };
  }

  function renderRequestLookupSection(workspace, session) {
    const lookupState = loadRequestLookupState();
    const match = lookupState.searched ? findTrackedRequestByReceipt(lookupState.receiptId, workspace, session) : null;
    const body = !lookupState.searched
      ? '<div class="empty-box">Enter a receipt ID to jump straight to the latest request status and update history.</div>'
      : match
        ? '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(match.tracked.title) + '</strong><p class="feed-meta">Receipt ID ' + escapeHtml(match.tracked.receiptId) + ' · ' + escapeHtml(match.tracked.district) + '</p></div>' + renderStatus(match.request ? match.request.status : match.tracked.status) + '</div><div class="feed-list">' + (match.history.length ? match.history.slice(0, 5).map(function (entry) { return '<div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(titleCase(entry.type || "update")) + '</span><span class="feed-chip">' + escapeHtml(formatShortDate(entry.createdAt)) + '</span></div><p class="card-copy">' + escapeHtml(entry.text) + '</p></div>'; }).join("") : '<p class="card-copy">No history updates yet. The request is still visible in the shared queue.</p>') + '</div></article>'
        : '<div class="empty-box">No request found for that receipt ID. Check the ID and try again.</div>';
    return '<article class="surface-card"><p class="section-label">Receipt Lookup</p><h2 class="section-title">Track one request instantly</h2><form id="communityRequestLookupForm" class="form-grid" data-testid="community-request-lookup"><label><span>Receipt ID</span><input class="text-input" name="receiptId" type="text" placeholder="RF-CH-2401" value="' + escapeHtml(lookupState.receiptId) + '"></label><div class="feed-card-actions"><button class="primary-button compact-button" type="submit" data-testid="lookup-request-submit">Find Request</button><button class="ghost-button compact-button" type="button" data-action="clear-request-lookup" data-testid="lookup-request-clear">Clear</button></div></form>' + body + '</article>';
  }

  function renderAdminModerationSection(workspace) {
    const filterInfo = buildModerationFilters(workspace);
    const moderationItems = buildModerationQueue(workspace).concat(buildSuspiciousActivityCards(workspace)).filter(function (item) {
      const normalizedTitle = normalizeSearchQuery(item.title);
      const normalizedStatus = normalizeSearchQuery(item.status);
      if (filterInfo.filter === "pending") return normalizedStatus.indexOf("pending") !== -1 || normalizedStatus.indexOf("submitted") !== -1;
      if (filterInfo.filter === "flagged") return normalizedStatus.indexOf("flagged") !== -1;
      if (filterInfo.filter === "requests") return normalizedTitle.indexOf("request") !== -1;
      if (filterInfo.filter === "donations") return normalizedTitle.indexOf("donation") !== -1;
      return true;
    });
    const filterButtons = [
      { key: "all", label: "All", count: filterInfo.counts.all },
      { key: "pending", label: "Pending", count: filterInfo.counts.pending },
      { key: "flagged", label: "Flagged", count: filterInfo.counts.flagged },
      { key: "requests", label: "Requests", count: filterInfo.counts.requests },
      { key: "donations", label: "Donations", count: filterInfo.counts.donations }
    ].map(function (item) {
      return '<button class="' + escapeHtml(item.key === filterInfo.filter ? "primary-button compact-button" : "ghost-button compact-button") + '" type="button" data-action="set-moderation-filter" data-filter-key="' + escapeHtml(item.key) + '" data-testid="moderation-filter-' + escapeHtml(item.key) + '">' + escapeHtml(item.label) + " (" + escapeHtml(String(item.count)) + ')</button>';
    }).join("");
    const bulkButtons = '<div class="feed-card-actions"><button class="primary-button compact-button" type="button" data-action="bulk-approve-items" data-testid="bulk-approve-items">Bulk Approve</button><button class="ghost-button compact-button" type="button" data-action="bulk-flag-items" data-testid="bulk-flag-items">Bulk Flag</button></div>';
    return '<article class="surface-card"><p class="section-label">Moderation Center</p><h2 class="section-title">Verification, approvals, and suspicious activity</h2><div class="feed-card-actions">' + filterButtons + '</div>' + bulkButtons + '<div class="feed-list">' + renderApprovalCards(moderationItems) + '</div></article>';
  }

  function buildNotifications(workspace, session) {
    const notices = [];
    const latestRequest = workspace.requests[0];
    const latestAssignment = workspace.assignments[0];
    const latestDonation = workspace.donations[0];
    const volunteerSnapshot = session && session.role === "volunteer" ? buildVolunteerSnapshot(session, workspace) : null;
    (workspace.audit || []).slice(0, 12).forEach(function (entry) {
      const line = safeText(entry, 260);
      const normalized = line.toLowerCase();
      if (!line) return;
      if (normalized.indexOf("shift") !== -1 || normalized.indexOf("reassign") !== -1) return notices.push(notificationItem("Assignment shifted", "Lifecycle automation", "Shifted", line));
      if (normalized.indexOf("completed") !== -1 || normalized.indexOf("delivered") !== -1) return notices.push(notificationItem("Completion update", "Volunteer / delivery progress", "Completed", line));
      if (normalized.indexOf("in progress") !== -1) return notices.push(notificationItem("Field work in progress", "Live assignment update", "In Progress", line));
      if (normalized.indexOf("matched") !== -1 || normalized.indexOf("assigned") !== -1) return notices.push(notificationItem("Assignment created", "AI / operator matching", "Assigned", line));
      if (normalized.indexOf("pending") !== -1 || normalized.indexOf("submitted") !== -1 || normalized.indexOf("broadcast") !== -1) notices.push(notificationItem("New pending request", "Request intake", "Pending", line));
    });
    if (latestRequest) notices.push(notificationItem(latestRequest.title, latestRequest.district + " · " + normalizeRequestStatus(latestRequest.status), normalizeRequestStatus(latestRequest.status), "Latest request now visible in the lifecycle with " + String(latestRequest.beneficiaries || 0) + " people affected."));
    if (latestAssignment) notices.push(notificationItem(latestAssignment.title, latestAssignment.volunteer + " · " + latestAssignment.district, normalizeAssignmentStatus(latestAssignment.status), buildVolunteerStatusLine(latestAssignment, latestAssignment.status)));
    if (latestDonation) notices.push(notificationItem(safeText(latestDonation.donorName || latestDonation.donor, 120) + " donation", formatDonationLine(latestDonation), normalizeDonationLifecycle(latestDonation.status), "Donation tracking is now connected to the response story and admin review board."));
    if (volunteerSnapshot) notices.push(notificationItem("Volunteer growth update", volunteerSnapshot.ngoGroup + " · " + volunteerSnapshot.reliability + "% reliable", volunteerSnapshot.activeTasks && volunteerSnapshot.activeTasks[0] ? normalizeAssignmentStatus(volunteerSnapshot.activeTasks[0].status) : (volunteerSnapshot.completed ? "Completed" : "Accepted"), "You have " + volunteerSnapshot.activeTasks.length + " active task(s) and " + volunteerSnapshot.completed + " completed task(s) visible in your lane."));
    if (!notices.length) {
      return [notificationItem("No live notifications yet", "Load a scenario", "Pending", "Requests, assignments, and donations will appear here once the workspace is active.")];
    }
    return notices.filter(function (item, index, list) {
      return list.findIndex(function (candidate) {
        return candidate.title === item.title && candidate.copy === item.copy;
      }) === index;
    }).slice(0, 6);
  }

  function renderTrackedRequestSection(workspace, session) {
    const tracked = loadTrackedRequests().filter(function (item) {
      const requesterEmail = normalizeSearchQuery(item.requesterEmail);
      const sessionEmail = normalizeSearchQuery(session && session.email);
      return !sessionEmail || !requesterEmail || requesterEmail === sessionEmail;
    });
    if (!tracked.length) {
      return '<article class="surface-card"><p class="section-label">Track My Request</p><h2 class="section-title">Receipt history for submitted requests</h2><div class="empty-box">Submit a community request to get a receipt ID and visible progress history.</div></article>';
    }
    return '<article class="surface-card"><p class="section-label">Track My Request</p><h2 class="section-title">Receipt history for submitted requests</h2><div class="feed-list">' + tracked.map(function (item) {
      const match = (workspace.requests || []).find(function (request) {
        return safeText(request.id, 80) === safeText(item.id, 80);
      });
      const history = match && Array.isArray(match.history) && match.history.length
        ? match.history.slice(0, 4).map(function (entry) {
            return '<div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(titleCase(entry.type || "update")) + '</span><span class="feed-chip">' + escapeHtml(formatShortDate(entry.createdAt)) + '</span></div><p class="card-copy">' + escapeHtml(entry.text) + '</p>';
          }).join("")
        : '<p class="card-copy">No new updates yet. This request is being tracked in the shared lifecycle.</p>';
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">Receipt ID ' + escapeHtml(item.receiptId) + ' · ' + escapeHtml(item.district) + '</p></div>' + renderStatus(item.status) + '</div>' + history + '</article>';
    }).join("") + '</div></article>';
  }

  function renderCommunityPage(workspace) {
    const session = getSession();
    const lifecycleSection = '<article class="surface-card"><p class="section-label">Live Lifecycle</p><h2 class="section-title">Requests moving from intake to closure</h2>' + renderStatusBoard(workspace.requests) + '</article>';
    const districtSection = '<article class="surface-card"><p class="section-label">District Comparison</p><h2 class="section-title">Where the visible pressure is building</h2><div class="feed-list">' + renderDistrictComparisonCards(workspace) + '</div></article>';
    const mapSection = renderMapStage(workspace, { eyebrow: "Live Impact Map", title: "Visible pressure zones and mapped requests", meta: workspace.label || "No demo loaded", location: firstMapLocation(workspace), summary: "Every card in the feed links back to a mappable location so teams can move from overview to action quickly." });
    const trackerSection = '<article id="communityTrackerSection" class="surface-card"><p class="section-label">Community Request Tracker</p><h2 class="section-title">Requests currently visible to the network</h2><div class="feed-list">' + renderCommunityTracker(workspace.requests) + '</div></article>';
    const activeNeedsSection = '<article class="surface-card"><div class="section-head"><div><p class="section-label">Active Needs</p><h2 class="section-title">Latest community requests</h2></div></div><div class="feed-list">' + renderRequestCards(workspace.requests) + '</div></article>';
    const aiMatchingSection = '<article class="surface-card"><p class="section-label">AI Matching Story</p><h2 class="section-title">How ResourceFlow explains the next step</h2><div class="feed-list">' + renderWorkflowCards(buildMatchingSteps(workspace)) + '</div></article>';
    const routeGroupsSection = '<article class="surface-card"><p class="section-label">Route Groups</p><h2 class="section-title">Map-linked response clusters</h2><div class="feed-list">' + renderRouteGroups(workspace) + '</div></article>';
    const notificationsSection = renderNotificationInbox(buildNotifications(workspace, session), "Community");
    const requestFormSection = '<article class="surface-card"><p class="section-label">Community Request Form</p><h2 class="section-title">Raise a support request</h2><form id="communityRequestForm" class="form-grid" data-testid="community-request-form"><label><span>Request title</span><input class="text-input" name="title" type="text" placeholder="Emergency food kits for affected streets" required></label><div class="grid-2"><label><span>Category</span><select class="text-select" name="category" required><option value="">Choose category</option><option>Food</option><option>Medical</option><option>Shelter</option><option>Education</option><option>Logistics</option></select></label><label><span>District</span><input class="text-input" name="district" type="text" placeholder="Chennai" required></label></div><div class="grid-2"><label><span>Location address</span><input class="text-input" name="location" type="text" placeholder="Velachery, Chennai" required></label><label><span>Estimated people affected</span><input class="text-input" name="beneficiaries" type="number" min="1" step="1" placeholder="40" required></label></div><div class="grid-2"><label><span>Urgency</span><select class="text-select" name="priority" required><option value="Critical">Critical</option><option value="High">High</option><option value="Medium" selected>Medium</option><option value="Low">Low</option></select></label><label><span>Need summary</span><input class="text-input" name="shortSummary" type="text" placeholder="Families need food, blankets, and safe shelter." required></label></div><label><span>Detailed context</span><textarea class="text-area" name="summary" placeholder="Describe the situation, road access, vulnerable groups, and immediate needs." required></textarea></label><button class="primary-button" type="submit" data-testid="submit-community-request">Submit Request</button></form><div id="communityRequestStatus" class="notice-box">Submitted requests are added to the tracker below and become part of the visible feed immediately.</div></article>';
    const responseStorySection = '<article class="surface-card"><p class="section-label">Response Story</p><h2 class="section-title">What changes after a request is entered</h2><div class="feed-list">' + renderListCards(["The request enters the lifecycle as Pending and appears in the community tracker immediately.", "Operations can review the mapped location, urgency, district, and people affected.", "The AI story updates as volunteers, donations, and assignments are attached.", "Admins can later use the same request in reports, exports, and public impact summaries."]) + '</div></article>';
    const donationBreakdownSection = '<article class="surface-card"><p class="section-label">Donation Breakdown</p><h2 class="section-title">What support is already visible</h2><div class="feed-list">' + renderDonationBreakdownCards(workspace) + '</div></article>';
    const completionTrendSection = '<article class="surface-card"><p class="section-label">Completion Trend</p><h2 class="section-title">Progress across the active request lifecycle</h2><div class="feed-list">' + renderAnalyticsCards(buildLifecycleAnalytics(workspace)) + '</div></article>';
    return [
      renderHero({ eyebrow: "Community Portal", title: "A public-facing response board that stays calm and readable.", copy: workspace.summary, primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="overview-load-demo">Load Flood Demo</button>', secondary: '<a class="ghost-button" href="./donations.html" data-testid="overview-donate">Donation Portal</a>', sideCards: [miniCard("Workspace", workspace.label || "No demo loaded", "A single community lane that shows urgent needs, support, and progress."), miniCard("Visible Spaces", "Community, Donations, AI Prediction", "Each portal stays visually separate while sharing one response story.")] }),
      renderActionTiles([{ label: "I Need Help", copy: "Raise an urgent community request", href: "#communityRequestForm", tone: "brand" }, { label: "I Want to Donate", copy: "Open money and item support", href: "./donations.html", tone: "outline" }, { label: "Track Requests", copy: "See live request movement", href: "#communityTrackerSection", tone: "muted" }, { label: "AI Prediction", copy: "Open the forecasting and matching view", href: "./insights.html", tone: "outline", testId: "overview-open-ai" }]),
      renderMetrics(workspaceMetrics(workspace)),
      renderWeightedColumns([{ weight: 2, markup: lifecycleSection }, { weight: 2, markup: districtSection }, { weight: 4, markup: mapSection }, { weight: 4, markup: trackerSection }, { weight: 4, markup: activeNeedsSection }, { weight: 3, markup: aiMatchingSection }, { weight: 2, markup: routeGroupsSection }, { weight: 2, markup: notificationsSection }, { weight: 4, markup: requestFormSection }, { weight: 3, markup: renderRequestLookupSection(workspace, session) }, { weight: 4, markup: renderTrackedRequestSection(workspace, session) }, { weight: 2, markup: responseStorySection }, { weight: 2, markup: donationBreakdownSection }, { weight: 2, markup: completionTrendSection }])
    ].join("");
  }

  function renderAdminPage(workspace) {
    const session = getSession();
    const governanceSection = '<article class="surface-card"><p class="section-label">Governance Pulse</p><h2 class="section-title">Audit events, review queue, and outreach drafts</h2><div class="feed-list">' + renderListCards(workspace.audit) + '</div><div id="adminVolunteerStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Volunteer activity status cards will appear here.</div></div><div id="adminDonationStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Donation workflow status cards will appear here.</div></div></article>';
    const snapshotSection = '<article class="surface-card"><p class="section-label">Live Snapshot</p><h2 class="section-title">Shared backend summary</h2><div id="sharedAdminStatus" class="notice-box">Admin dashboard is checking the shared backend.</div><div id="adminSharedSummary" class="shared-metric-grid"><div class="empty-box">Admin metrics will appear here after sign-in.</div></div></article>';
    const volunteerRecordsSection = '<article class="surface-card"><p class="section-label">Volunteer Directory Records</p><h2 class="section-title">Shared volunteer visibility</h2><div id="adminVolunteerRecords" class="record-grid"><div class="empty-box">Shared volunteer management is loading.</div></div></article>';
    const donationRecordsSection = '<article class="surface-card"><p class="section-label">Donation Records</p><h2 class="section-title">Money and item support from the backend</h2><div id="adminDonationRecords" class="record-grid"><div class="empty-box">Shared donation management is loading.</div></div></article>';
    const moderationSection = renderAdminModerationSection(workspace);
    const analyticsSection = '<article class="surface-card"><p class="section-label">Analytics Upgrade</p><h2 class="section-title">District comparison, donation mix, and completion trend</h2><div class="feed-list">' + renderAnalyticsCards(buildAdminAnalytics(workspace)) + '</div></article>';
    const suspiciousSection = '<article class="surface-card"><p class="section-label">Suspicious Activity</p><h2 class="section-title">Flagged or risky items requiring escalation</h2><div class="feed-list">' + renderApprovalCards(buildSuspiciousActivityCards(workspace)) + '</div></article>';
    const notificationsSection = renderNotificationInbox(buildNotifications(workspace, session), "Admin");
    const usageGuardSection = '<article class="surface-card"><p class="section-label">Firebase Usage Guard</p><h2 class="section-title">Safe usage inside the no-cost tier</h2><div class="feed-list">' + buildUsageGuardCards() + '</div></article>';
    const aiActionSection = '<article class="surface-card"><p class="section-label">AI Action History</p><h2 class="section-title">What the copilot changed and why</h2><div class="feed-list">' + renderNotificationCards(buildAiActionHistory(workspace)) + '</div></article>';
    const outreachSection = '<article class="surface-card"><p class="section-label">Outreach Center</p><form id="adminOutreachForm" class="form-grid" data-testid="outreach-center-form"><label><span>Subject</span><input class="text-input" name="subject" type="text" placeholder="Volunteer briefing for evening flood response"></label><label><span>Message</span><textarea class="text-area" name="message" placeholder="Share timing, district, safety notes, and reporting instructions."></textarea></label><label><span>Recipients</span><input class="text-input" name="recipients" type="text" placeholder="Community, Volunteer, Donation portal"></label><button class="primary-button" type="button" data-action="save-outreach" data-testid="save-outreach-draft">Save Draft</button></form></article>';
    const draftsSection = '<article class="surface-card"><p class="section-label">Outreach Drafts</p><div id="adminOutreachDrafts" class="feed-list">' + renderListCards(workspace.outreach) + '</div></article>';
    const timelineSection = '<article class="surface-card"><p class="section-label">Assignment Timeline</p><h2 class="section-title">Per-request lifecycle and handoff</h2><div class="feed-list">' + renderRequestTimelineCards(workspace) + '</div></article>';
    const roleManagementSection = '<section class="surface-card"><p class="section-label">User Role Management</p><h2 class="section-title">Who can access which portal right now</h2><div class="table-shell"><table><thead><tr><th>Name</th><th>Role</th><th>Current Access</th><th>Status</th></tr></thead><tbody>' + renderRoleRows() + '</tbody></table></div></section>';
    return [
      renderHero({
        eyebrow: "Admin Dashboard",
        title: "Governance, live snapshot, and outreach in one admin control room.",
        copy: "The admin lane combines local demo intelligence with shared Firestore-backed volunteer and donation management.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="admin-load-demo">Load Demo</button>',
        secondary: '<a class="ghost-button" href="./impact.html" data-testid="admin-open-impact">Public Impact</a>',
        sideCards: [
          miniCard("Governance Pulse", "Audit events, review queue, outreach drafts", "These cards stay high-contrast in light and dark mode."),
          miniCard("Visible Spaces", "Community, Volunteer, Donations, AI Prediction", "The portal menu keeps navigation compact while the live feed and widgets stay visible.")
        ]
      }),
      renderActionTiles([
        { label: "AI Prediction", copy: "Open the explainable forecasting workspace", href: "./insights.html", tone: "outline", testId: "admin-open-ai" },
        { label: "Public Impact", copy: "Switch to the NGO and judge story view", href: "./impact.html", tone: "muted", testId: "admin-open-impact-tile" },
        { label: "Print Report", copy: "Generate a printable admin summary", action: "print-report", tone: "outline", testId: "admin-print-report" }
      ]),
      renderMetrics([
        metric("Live Snapshot", String(workspace.requests.length), "Requests currently visible in the workspace feed."),
        metric("Assignments", String(workspace.assignments.length), "Assignment stats linked to the active scenario."),
        metric("Completion Rate", String(buildCompletionRate(workspace)) + "%", "Closed or delivered request progress in the active scenario."),
        metric("Donation Records", String(workspace.donations.length), "Local scenario donation records plus shared backend entries below."),
        metric("Beneficiaries", String(totalBeneficiaries(workspace)), "Projected people supported by the loaded scenario.")
      ]),
      renderWeightedColumns([
        { weight: 5, markup: governanceSection },
        { weight: 3, markup: snapshotSection },
        { weight: 3, markup: moderationSection },
        { weight: 2, markup: suspiciousSection },
        { weight: 2, markup: analyticsSection },
        { weight: 2, markup: notificationsSection },
        { weight: 2, markup: usageGuardSection },
        { weight: 2, markup: aiActionSection },
        { weight: 6, markup: volunteerRecordsSection },
        { weight: 8, markup: donationRecordsSection },
        { weight: 3, markup: outreachSection },
        { weight: 2, markup: draftsSection },
        { weight: 2, markup: timelineSection },
        { weight: 3, markup: roleManagementSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function submitCommunityRequest(form) {
    const data = new FormData(form);
    const workspace = getManagedWorkspace({ reason: "submit-request" });
    const session = getSession();
    const request = {
      id: "REQ-" + Math.floor(Math.random() * 900 + 100),
      title: safeText(data.get("title"), 140),
      category: safeText(data.get("category"), 80),
      district: safeText(data.get("district"), 80),
      location: safeText(data.get("location"), 140),
      beneficiaries: Number(data.get("beneficiaries") || 40),
      priority: safeText(data.get("priority"), 40) || "Medium",
      status: "Pending",
      summary: safeText(data.get("shortSummary"), 180) || safeText(data.get("summary"), 280),
      ai: "The AI is broadcasting this request to Admin and Government, then matching the best volunteers and donation gaps.",
      requestedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      requester: safeText(session.name || "Community user", 120),
      requesterUid: safeText(session.uid || "", 120),
      requesterEmail: safeText(session.email || "", 140),
      blocked: false,
      source: "live",
      origin: "live",
      priorityLane: "live",
      broadcastTo: ["admin", "government"],
      complexity: inferTaskComplexity(safeText(data.get("priority"), 40) || "Medium"),
      estimatedDurationMinutes: estimatedDurationMinutes(safeText(data.get("priority"), 40) || "Medium", "live")
    };
    request.receiptId = buildRequestReceiptId(request);
    request.history = [buildRequestHistoryEntry("submitted", "Request created and added to the live intake board.", request.requester)];
    workspace.requests.unshift(request);
    workspace.systemNotice = "New community request added to the live tracker and broadcasted as Pending.";
    workspace.audit.unshift("A community request was submitted for " + safeText(data.get("district"), 80) + " and routed into the lifecycle board.");
    trackSubmittedRequest(request, session);
    pushToast("success", "Request submitted", "Receipt ID " + request.receiptId + " is now visible in the tracker.");
    if (!navigator.onLine) {
      enqueueOfflineAction({ type: "community-request", requestId: request.id, receiptId: request.receiptId });
    }
    saveWorkspace(workspace);
    clearDraft(COMMUNITY_DRAFT_KEY);
    runWorkspaceAutomation({ reason: "submit-request" });
    renderApp(document.getElementById("portalApp"));
  }

  function canUseWorkspaceBackendSync() {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    return Boolean(config.enabled && !config.forceLocalWorkspace && config.lifecycleBackendEnabled);
  }

  function saveWorkspace(workspace, options) {
    const nextWorkspace = enrichWorkspace(workspace);
    syncTrackedRequestsFromWorkspace(nextWorkspace);
    const serialized = JSON.stringify(nextWorkspace);
    localStorage.setItem(WORKSPACE_KEY, serialized);
    const shouldSyncBackend = !(options && options.skipBackendSync) && canUseWorkspaceBackendSync();
    setSyncStatus(shouldSyncBackend ? "queued" : "local", shouldSyncBackend ? "Workspace changes are queued for sync." : "Saved locally in the current workspace.");
    if (shouldSyncBackend) {
      scheduleWorkspaceBackendSync(serialized, options && options.reason);
    } else {
      WORKSPACE_SYNC_RUNTIME.pendingSerialized = "";
      WORKSPACE_SYNC_RUNTIME.reason = "";
      WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized = serialized;
    }
  }

  async function flushWorkspaceBackendSync() {
    const serialized = WORKSPACE_SYNC_RUNTIME.pendingSerialized;
    if (!canUseWorkspaceBackendSync() || !serialized) {
      return;
    }
    if (WORKSPACE_SYNC_RUNTIME.inflight) return;
    if (serialized === WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized) return;
    WORKSPACE_SYNC_RUNTIME.inflight = true;
    setSyncStatus("syncing", "Syncing workspace changes to the shared backend.");
    try {
      const functions = await ensureFirebaseFunctionsClient(config);
      const callable = functions.httpsCallable("processWorkspaceLifecycle");
      const result = await callable({ workspace: JSON.parse(serialized), reason: WORKSPACE_SYNC_RUNTIME.reason || "workspace-save" });
      const state = result && result.data && result.data.state ? enrichWorkspace(result.data.state) : null;
      const nextSerialized = state ? JSON.stringify(state) : serialized;
      WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized = nextSerialized;
      WORKSPACE_SYNC_RUNTIME.pendingSerialized = nextSerialized;
      if (state && nextSerialized !== localStorage.getItem(WORKSPACE_KEY)) {
        localStorage.setItem(WORKSPACE_KEY, nextSerialized);
        syncTrackedRequestsFromWorkspace(state);
        window.dispatchEvent(new CustomEvent("resourceflow:workspace-synced"));
      }
      flushOfflineQueue();
      setSyncStatus("synced", "Workspace is synced with the shared backend.");
    } catch (error) {
      console.warn("Workspace backend sync skipped.", error);
      WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized = serialized;
      setSyncStatus("error", "Backend sync paused. ResourceFlow will keep working with the local workspace.");
    } finally {
      WORKSPACE_SYNC_RUNTIME.inflight = false;
      if (WORKSPACE_SYNC_RUNTIME.pendingSerialized && WORKSPACE_SYNC_RUNTIME.pendingSerialized !== WORKSPACE_SYNC_RUNTIME.lastSyncedSerialized && !WORKSPACE_SYNC_RUNTIME.timerId) {
        WORKSPACE_SYNC_RUNTIME.timerId = window.setTimeout(function () {
          WORKSPACE_SYNC_RUNTIME.timerId = 0;
          flushWorkspaceBackendSync();
        }, 1500);
      }
    }
  }

  init();
})();

