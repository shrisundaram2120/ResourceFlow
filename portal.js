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

  const REQUEST_STAGES = ["Requested", "Reviewed", "Assigned", "In Progress", "Delivered", "Closed"];
  const DONATION_STAGES = ["Submitted", "Verified", "Packed", "Dispatched", "Delivered"];
  const ASSIGNMENT_STAGES = ["Assigned", "In Progress", "Delivered", "Closed"];

  function init() {
    const root = document.getElementById("portalApp");
    if (!root) {
      return;
    }
    clearLegacyCachesOnce();
    applyTheme(loadTheme());
    renderApp(root);
    observeInteractiveTestIds();
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
    const workspace = getWorkspace();
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
      headerMarkup = renderHeader(page, session);
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
      '<div class="rf-layout">',
      '<main id="portalMain" class="main-stack" tabindex="-1">',
      pageMarkup,
      "</main>",
      railMarkup,
      "</div>",
      demoMarkup,
      aiMarkup,
      mobileMarkup
    ].join("");

    document.body.classList.remove("rf-sidebar-open");
    document.body.classList.toggle("rf-ai-open", !!AI_RUNTIME.drawerOpen || !!DEMO_RUNTIME.drawerOpen);
    bindEvents(root, page, session);
    ensureInteractiveTestIds(document);
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

  function enrichWorkspace(workspace) {
    const next = workspace && typeof workspace === "object" ? workspace : {};
    const requests = cloneScenarioItems(next.requests || []).map(function (item, index) {
      const status = normalizeRequestStatus(item.status || item.priority || "Requested");
      return Object.assign({}, item, {
        id: safeText(item.id || ("REQ-" + String(index + 100)), 80),
        status: status,
        priority: safeText(item.priority || "Medium", 40),
        requestedAt: safeText(item.requestedAt || item.date || ("2026-04-" + String(10 + (index % 9)) + "T08:30:00.000Z"), 40),
        requester: safeText(item.requester || "Community Network", 120),
        blocked: Boolean(item.blocked)
      });
    });
    const assignments = cloneScenarioItems(next.assignments || []).map(function (item, index) {
      const inferredRequest = requests.find(function (request) {
        return safeText(request.location, 140).toLowerCase() === safeText(item.location, 140).toLowerCase()
          || (safeText(request.district, 80).toLowerCase() === safeText(item.district, 80).toLowerCase()
            && safeText(request.title, 140).toLowerCase().indexOf(safeText(item.title, 140).toLowerCase().slice(0, 12)) >= 0);
      });
      return Object.assign({}, item, {
        id: safeText(item.id || ("ASG-" + String(index + 300)), 80),
        requestId: safeText(item.requestId || (inferredRequest && inferredRequest.id) || "", 80),
        status: normalizeAssignmentStatus(item.status || "Assigned")
      });
    });
    const volunteers = cloneScenarioItems(next.volunteers || []).map(function (item, index) {
      return Object.assign({}, item, {
        id: safeText(item.id || ("VOL-" + String(index + 1)), 80),
        ngo: safeText(item.ngo || item.ngoGroup || "Relief Network", 120),
        reliability: Number(item.reliability || computeVolunteerReliability(item, assignments))
      });
    });
    const donations = cloneScenarioItems(next.donations || []).map(function (item, index) {
      return Object.assign({}, item, {
        id: safeText(item.id || ("DON-" + String(index + 1)), 80),
        status: normalizeDonationLifecycle(item.status || "Submitted")
      });
    });
    return {
      scenario: safeText(next.scenario || "none", 40).toLowerCase(),
      label: safeText(next.label || EMPTY_WORKSPACE.label, 120),
      summary: safeText(next.summary || EMPTY_WORKSPACE.summary, 280),
      requests: requests,
      assignments: assignments,
      volunteers: volunteers,
      donations: donations,
      audit: cloneScenarioItems(next.audit || []),
      outreach: cloneScenarioItems(next.outreach || []),
      systemNotice: safeText(next.systemNotice || EMPTY_WORKSPACE.systemNotice, 280)
    };
  }

  function normalizeAssignmentStatus(status) {
    const normalized = safeText(status, 40).toLowerCase();
    if (!normalized) return "Assigned";
    if (normalized.indexOf("closed") !== -1) return "Closed";
    if (normalized.indexOf("deliver") !== -1 || normalized.indexOf("complete") !== -1) return "Delivered";
    if (normalized.indexOf("progress") !== -1 || normalized.indexOf("active") !== -1) return "In Progress";
    return "Assigned";
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
      return normalizeAssignmentStatus(item.status) === "Delivered";
    }).length;
    return Math.max(68, Math.min(98, 70 + delivered * 9 + Math.max(0, related.length - delivered) * 3));
  }

  function normalizeRequestStatus(status) {
    const normalized = safeText(status, 40).toLowerCase();
    if (!normalized || normalized === "tracked" || normalized === "submitted" || normalized === "queued") return "Requested";
    if (normalized.indexOf("review") !== -1 || normalized.indexOf("pending") !== -1) return "Reviewed";
    if (normalized.indexOf("assigned") !== -1) return "Assigned";
    if (normalized.indexOf("progress") !== -1 || normalized.indexOf("active") !== -1) return "In Progress";
    if (normalized.indexOf("deliver") !== -1 || normalized.indexOf("complete") !== -1) return "Delivered";
    if (normalized.indexOf("closed") !== -1 || normalized.indexOf("archive") !== -1) return "Closed";
    return "Requested";
  }

  function renderHeader(page, session) {
    const roleData = ROLE_CONFIG[session.role] || ROLE_CONFIG.user;
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
      '<label class="rf-search-shell"><span class="rf-symbol" aria-hidden="true">search</span><input class="rf-search-input" type="search" placeholder="' + escapeHtml(copy("searchPlaceholder", "Search requests, volunteers, donations...")) + '" aria-label="Search workspace" data-testid="header-search"></label>',
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

  function renderPortalLauncher(session, page) {
    const activeRole = normalizePortal(session.role) || "user";
    const roleData = ROLE_CONFIG[session.role] || ROLE_CONFIG.user;
    const activeItem = PORTAL_MENU_ITEMS.find(function (item) {
      return item.role === activeRole;
    }) || PORTAL_MENU_ITEMS[0];
    const nav = SIDEBAR_ITEMS.map(function (item) {
      const allowed = item.roles.indexOf(session.role) !== -1;
      const active = item.key === page;
      return [
        '<a class="tab-link',
        active ? " is-active" : "",
        allowed ? "" : " is-locked",
        ' portal-launcher-nav-item" href="' + (allowed ? escapeHtml(item.href) : "#") + '"',
        allowed ? "" : ' data-locked="true"',
        ' data-nav-target="' + escapeHtml(item.key) + '"',
        ' data-testid="portal-launcher-nav-' + escapeHtml(item.key) + '">',
        '<span class="tab-icon"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(item.icon) + '</span></span>',
        '<span class="tab-copy"><strong>' + escapeHtml(item.label) + '</strong><small>' + escapeHtml(item.caption) + '</small></span>',
        '<span class="tab-state">' + (allowed ? (active ? "Open" : "Go") : "Locked") + "</span>",
        "</a>"
      ].join("");
    }).join("");
    return [
      '<details class="portal-launcher" data-testid="portal-launcher">',
      '<summary class="ghost-button portal-launcher-toggle" data-testid="portal-launcher-toggle" aria-label="Open portal switching menu">',
      '<span class="rf-symbol" aria-hidden="true">apps</span>',
      '<span class="portal-launcher-copy"><strong>' + escapeHtml(activeItem.label) + '</strong><small>Switch portal workspace</small></span>',
      '<span class="rf-symbol portal-launcher-caret" aria-hidden="true">expand_more</span>',
      "</summary>",
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
      '<section class="surface-card portal-launcher-panel">',
      '<p class="section-label">' + escapeHtml(copy("navigation", "Navigation")) + '</p>',
      '<div class="portal-launcher-nav">' + nav + "</div>",
      "</section>",
      '<section class="surface-card portal-launcher-panel">',
      '<p class="section-label">' + escapeHtml(copy("profile", "Profile")) + '</p>',
      '<div class="portal-launcher-profile">',
      '<h3 class="section-title portal-launcher-title">' + escapeHtml(session.name) + "</h3>",
      '<p class="section-copy">' + escapeHtml(session.email || "Signed-in workspace session") + "</p>",
      '<div class="chip-row portal-launcher-chip-row">',
      '<span class="chip">' + escapeHtml(roleData.label) + "</span>",
      session.profile.primarySummary ? '<span class="chip">' + escapeHtml(session.profile.primarySummary) + "</span>" : "",
      "</div>",
      '<button class="ghost-button portal-launcher-demo-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="portal-launcher-load-demo">' + escapeHtml(copy("loadDemo", "Load Flood Demo")) + '</button>',
      "</div>",
      "</section>",
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
    }).slice(0, 4);
    return '<nav class="rf-mobile-dock">' + items.map(function (item) {
      const active = item.key === page;
      return '<a class="rf-mobile-link' + (active ? ' is-active' : '') + '" href="' + escapeHtml(item.href) + '" data-testid="mobile-nav-' + escapeHtml(item.key) + '"><span class="rf-symbol" aria-hidden="true">' + escapeHtml(item.icon) + '</span><span>' + escapeHtml(item.shortLabel || item.label) + '</span></a>';
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
    const aiMatchingSection = '<article class="surface-card"><p class="section-label">AI Matching Story</p><h2 class="section-title">How ResourceFlow explains the next step</h2><div class="feed-list">' + renderWorkflowCards(buildMatchingSteps(workspace)) + '</div></article>';
    const routeGroupsSection = '<article class="surface-card"><p class="section-label">Route Groups</p><h2 class="section-title">Map-linked response clusters</h2><div class="feed-list">' + renderRouteGroups(workspace) + '</div></article>';
    const notificationsSection = '<article class="surface-card"><p class="section-label">Notifications</p><h2 class="section-title">What changed most recently</h2><div class="feed-list">' + renderNotificationCards(buildNotifications(workspace, getSession())) + '</div></article>';
    const requestFormSection = '<article class="surface-card"><p class="section-label">Community Request Form</p><h2 class="section-title">Raise a support request</h2><form id="communityRequestForm" class="form-grid" data-testid="community-request-form"><label><span>Request title</span><input class="text-input" name="title" type="text" placeholder="Emergency food kits for affected streets" required></label><div class="grid-2"><label><span>Category</span><select class="text-select" name="category" required><option value="">Choose category</option><option>Food</option><option>Medical</option><option>Shelter</option><option>Education</option><option>Logistics</option></select></label><label><span>District</span><input class="text-input" name="district" type="text" placeholder="Chennai" required></label></div><div class="grid-2"><label><span>Location address</span><input class="text-input" name="location" type="text" placeholder="Velachery, Chennai" required></label><label><span>Estimated people affected</span><input class="text-input" name="beneficiaries" type="number" min="1" step="1" placeholder="40" required></label></div><div class="grid-2"><label><span>Urgency</span><select class="text-select" name="priority" required><option value="Critical">Critical</option><option value="High">High</option><option value="Medium" selected>Medium</option><option value="Low">Low</option></select></label><label><span>Need summary</span><input class="text-input" name="shortSummary" type="text" placeholder="Families need food, blankets, and safe shelter." required></label></div><label><span>Detailed context</span><textarea class="text-area" name="summary" placeholder="Describe the situation, road access, vulnerable groups, and immediate needs." required></textarea></label><button class="primary-button" type="submit" data-testid="submit-community-request">Submit Request</button></form><div id="communityRequestStatus" class="notice-box">Submitted requests are added to the tracker below and become part of the visible feed immediately.</div></article>';
    const responseStorySection = '<article class="surface-card"><p class="section-label">Response Story</p><h2 class="section-title">What changes after a request is entered</h2><div class="feed-list">' + renderListCards(["The request enters the lifecycle as Requested and appears in the community tracker immediately.", "Operations can review the mapped location, urgency, district, and people affected.", "The AI story updates as volunteers, donations, and assignments are attached.", "Admins can later use the same request in reports, exports, and public impact summaries."]) + '</div></article>';
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
        '<div class="feed-card-head"><div><strong>' + escapeHtml(item.title || "Community request") + '</strong><p class="feed-meta">' + escapeHtml(item.district || "District") + ' - ' + escapeHtml(item.location || "Location") + '</p></div>' + renderStatus(normalizeRequestStatus(item.status || "Requested")) + '</div>',
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
      return '<div class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title || "Community request") + '</strong><p class="feed-meta">' + escapeHtml(item.district || "District") + ' - ' + escapeHtml(item.location || "Location") + '</p></div>' + renderStatus(normalizeRequestStatus(item.status || "Requested")) + '</div><p class="card-copy">' + escapeHtml(item.summary || "Visible request details will appear here once the full page refreshes.") + '</p></div>';
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
    const prioritySection = '<article class="surface-card"><p class="section-label">AI Task Priority</p><h2 class="section-title">Optimized for ' + escapeHtml(firstName(session.name)) + '</h2><div class="stack-list">' + renderPriorityQueue(personal.activeTasks.length ? personal.activeTasks : workspace.requests.slice(0, 3)) + '</div></article>';
    const growthSection = '<article class="surface-card"><p class="section-label">Volunteer Growth</p><h2 class="section-title">Badges, streak, NGO, and reliability</h2><div class="feed-list">' + renderVolunteerGrowthCards(personal) + '</div></article>';
    const directoryPreviewSection = '<article class="surface-card"><p class="section-label">Volunteer Directory Preview</p><h2 class="section-title">See other registered volunteers</h2><div class="record-grid">' + renderVolunteerPreviewCards(workspace.volunteers) + '</div></article>';
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
    const donationFormSection = '<section class="surface-card"><p class="section-label">Donation Records</p><h2 class="section-title">Submit a money or item donation</h2><div id="donationPortalStatus" class="notice-box">Sign in to store donation records in Firestore and track their status.</div><div class="two-col donation-panels"><article class="surface-card nested-card" data-donation-panel="money"><p class="section-label">Money Donation</p><form id="moneyDonationForm" class="form-grid" data-testid="money-donation-form"><label><span>Donor Name</span><input class="text-input" name="donorName" type="text" placeholder="Shri Sundaram" required></label><div class="grid-2"><label><span>Amount</span><input class="text-input" name="amount" type="number" min="1" step="1" placeholder="1000" required></label><label><span>Payment Method</span><select class="text-select" name="paymentMethod" required><option value="">Choose method</option><option>UPI</option><option>Bank Transfer</option><option>Card</option><option>Cash</option><option>Cheque</option></select></label></div><label><span>Message / Note</span><textarea class="text-area" name="message" placeholder="Add a note for the receiving team."></textarea></label><button class="primary-button" type="submit" data-testid="save-money-donation">Save Money Donation</button></form></article><article class="surface-card nested-card" data-donation-panel="item" hidden><p class="section-label">Item Donation</p><form id="itemDonationForm" class="form-grid" data-testid="item-donation-form"><label><span>Donor Name</span><input class="text-input" name="donorName" type="text" placeholder="Diya Raman" required></label><div class="grid-2"><label><span>Item Type</span><select class="text-select" name="itemType" required><option value="">Choose item type</option><option>Clothes</option><option>Food</option><option>Books</option><option>Other Useful Items</option></select></label><label><span>Quantity</span><input class="text-input" name="quantity" type="number" min="1" step="1" placeholder="12" required></label></div><label><span>Description</span><textarea class="text-area" name="description" placeholder="Describe the items being donated." required></textarea></label><label><span>Contact Details</span><input class="text-input" name="contactDetails" type="text" placeholder="+91 98765 43210 | donor@example.com" required></label><button class="primary-button" type="submit" data-testid="save-item-donation">Save Item Donation</button></form></article></div></section>';
    const snapshotSection = '<article class="surface-card"><p class="section-label">Live Snapshot</p><div id="donationSummaryGrid" class="shared-metric-grid"><div class="empty-box">Your shared donation summary will appear here after sign-in.</div></div></article>';
    const recordsSection = '<article class="surface-card"><p class="section-label">Donation Records</p><div id="donationHistoryList" class="record-grid"><div class="empty-box">Recent donation records from your account will appear here.</div></div></article>';
    const workflowSection = '<article class="surface-card"><p class="section-label">Donation Tracking</p><h2 class="section-title">Submitted to delivered workflow</h2>' + renderDonationWorkflowBoard(workspace.donations) + '</article>';
    const breakdownSection = '<article class="surface-card"><p class="section-label">Donation Breakdown</p><h2 class="section-title">Funding and item mix</h2><div class="feed-list">' + renderDonationBreakdownCards(workspace) + '</div></article>';
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
        { weight: 2, markup: breakdownSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderOperationsPage(workspace) {
    const mapSection = renderMapStage(workspace, {
      eyebrow: "Live Deployment Map",
      title: "District movement and resource view",
      meta: topDistrict(workspace) || "No district yet",
      location: firstMapLocation(workspace),
      summary: "Use the mapped location to pivot from the oversight board into Google Maps routing."
    });
    const urgentSection = '<section class="surface-card"><p class="section-label">Urgent Requests</p><h2 class="section-title">What needs action first</h2><div class="stack-list">' + renderRequestCards(workspace.requests.slice(0, 3)) + '</div></section>';
    const aiDispatchSection = '<section class="surface-card"><p class="section-label">AI Dispatch Story</p><h2 class="section-title">Why this district is being prioritized</h2><div class="feed-list">' + renderWorkflowCards(buildMatchingSteps(workspace)) + '</div></section>';
    const approvalsSection = '<section class="surface-card"><p class="section-label">Pending Approvals</p><h2 class="section-title">Items waiting for operator review</h2><div class="feed-list">' + renderApprovalCards(buildPendingApprovals(workspace)) + '</div></section>';
    const districtPressureSection = '<article class="surface-card"><p class="section-label">District Pressure Board</p><h2 class="section-title">Where teams should move next</h2><div class="feed-list">' + renderDistrictSummaryCards(workspace) + '</div></article>';
    const activeDispatchSection = '<article class="surface-card"><p class="section-label">Active Dispatch</p><h2 class="section-title">Assignments currently being coordinated</h2><div class="feed-list">' + renderAssignmentCards(workspace.assignments) + '</div></article>';
    const blockedSection = '<article class="surface-card"><p class="section-label">Blocked Cases</p><h2 class="section-title">Requests that need escalation</h2><div class="feed-list">' + renderApprovalCards(buildBlockedCases(workspace)) + '</div></article>';
    const routeGroupsSection = '<article class="surface-card"><p class="section-label">Route Groups</p><h2 class="section-title">Grouped movements by district</h2><div class="feed-list">' + renderRouteGroups(workspace) + '</div></article>';
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
        { weight: 3, markup: districtPressureSection },
        { weight: 3, markup: activeDispatchSection },
        { weight: 2, markup: blockedSection },
        { weight: 2, markup: routeGroupsSection },
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
    const governanceSection = '<article class="surface-card"><p class="section-label">Governance Pulse</p><h2 class="section-title">Audit events, review queue, and outreach drafts</h2><div class="feed-list">' + renderListCards(workspace.audit) + '</div><div id="adminVolunteerStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Volunteer activity status cards will appear here.</div></div><div id="adminDonationStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Donation workflow status cards will appear here.</div></div></article>';
    const snapshotSection = '<article class="surface-card"><p class="section-label">Live Snapshot</p><h2 class="section-title">Shared backend summary</h2><div id="sharedAdminStatus" class="notice-box">Admin dashboard is checking the shared backend.</div><div id="adminSharedSummary" class="shared-metric-grid"><div class="empty-box">Admin metrics will appear here after sign-in.</div></div></article>';
    const volunteerRecordsSection = '<article class="surface-card"><p class="section-label">Volunteer Directory Records</p><h2 class="section-title">Shared volunteer visibility</h2><div id="adminVolunteerRecords" class="record-grid"><div class="empty-box">Shared volunteer management is loading.</div></div></article>';
    const donationRecordsSection = '<article class="surface-card"><p class="section-label">Donation Records</p><h2 class="section-title">Money and item support from the backend</h2><div id="adminDonationRecords" class="record-grid"><div class="empty-box">Shared donation management is loading.</div></div></article>';
    const moderationSection = '<article class="surface-card"><p class="section-label">Moderation Center</p><h2 class="section-title">Verification, approvals, and blocked work</h2><div class="feed-list">' + renderApprovalCards(buildModerationQueue(workspace)) + '</div></article>';
    const analyticsSection = '<article class="surface-card"><p class="section-label">Analytics Upgrade</p><h2 class="section-title">District comparison, donation mix, and completion trend</h2><div class="feed-list">' + renderAnalyticsCards(buildAdminAnalytics(workspace)) + '</div></article>';
    const outreachSection = '<article class="surface-card"><p class="section-label">Outreach Center</p><form id="adminOutreachForm" class="form-grid" data-testid="outreach-center-form"><label><span>Subject</span><input class="text-input" name="subject" type="text" placeholder="Volunteer briefing for evening flood response"></label><label><span>Message</span><textarea class="text-area" name="message" placeholder="Share timing, district, safety notes, and reporting instructions."></textarea></label><label><span>Recipients</span><input class="text-input" name="recipients" type="text" placeholder="Community, Volunteer, Donation portal"></label><button class="primary-button" type="button" data-action="save-outreach" data-testid="save-outreach-draft">Save Draft</button></form></article>';
    const draftsSection = '<article class="surface-card"><p class="section-label">Outreach Drafts</p><div id="adminOutreachDrafts" class="feed-list">' + renderListCards(workspace.outreach) + '</div></article>';
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
        { weight: 3, markup: outreachSection },
        { weight: 2, markup: draftsSection },
        { weight: 3, markup: roleManagementSection }
      ], "portal-weighted-flow")
    ].join("");
  }

  function renderImpactPage(workspace) {
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
      '<section class="page-columns"><div class="page-columns-main"><section class="surface-card"><p class="section-label">Impact Feed</p><h2 class="section-title">Visible progress for judges, partners, and NGOs</h2><div class="feed-list">' + renderImpactCards(workspace) + '</div></section></div><div class="page-columns-side"><section class="surface-card"><p class="section-label">Snapshot</p><h2 class="section-title">' + escapeHtml(String(totalBeneficiaries(workspace))) + ' people supported</h2><p class="section-copy">This page is designed as a clean, presentation-friendly summary of the live response workspace.</p></section></div></section>'
    ].join("");
  }

  function renderJudgePage(workspace) {
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
      '<section class="surface-card"><p class="section-label">Submission Flow</p><h2 class="section-title">How the product works end to end</h2><div class="feed-list">' + renderListCards(["Community users raise requests or view progress in a clean portal.", "Volunteers see assignments, points, attendance, and completed work.", "Government operations monitor requests and AI dispatch from a district-focused board.", "Admins manage donation records, volunteer records, outreach, and governance in one place."]) + "</div></section>"
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
      if (canManage && stage !== "Closed") {
        actionButtons.push('<button class="ghost-button" type="button" data-action="advance-request-status" data-request-id="' + escapeHtml(item.id) + '" data-testid="advance-request-' + escapeHtml(item.id.toLowerCase()) + '">Advance Status</button>');
      }
      if (canManage && stage !== "Closed") {
        actionButtons.push('<button class="ghost-button" type="button" data-action="close-request" data-request-id="' + escapeHtml(item.id) + '" data-testid="close-request-' + escapeHtml(item.id.toLowerCase()) + '">Close Request</button>');
      }
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.summary) + '</p></div>' + renderStatus(stage) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.category) + '</span><span class="feed-chip">' + escapeHtml(item.district) + '</span><span class="feed-chip">' + escapeHtml(String(item.beneficiaries)) + ' beneficiaries</span><span class="feed-chip">' + escapeHtml(item.priority) + '</span><span class="feed-chip feed-chip-risk feed-chip-risk-' + escapeHtml(prediction.tone) + '">Risk ' + escapeHtml(String(prediction.score)) + '</span></div>' + renderStepper(stage) + '<p class="card-copy"><strong>Boosted triage:</strong> ' + escapeHtml(prediction.explanation) + '</p><p class="card-copy"><strong>AI match:</strong> ' + escapeHtml(item.ai) + '</p><div class="action-stack" style="margin-top:14px;">' + actionButtons.join("") + '</div></article>';
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
      if (normalizedStatus !== "Closed" && normalizedStatus !== "Delivered") {
        actions.push('<button class="ghost-button" type="button" data-action="advance-assignment-status" data-assignment-id="' + escapeHtml(item.id) + '" data-testid="advance-assignment-' + escapeHtml(item.id.toLowerCase()) + '">' + escapeHtml(session.role === "volunteer" ? "Update Progress" : "Advance Assignment") + '</button>');
      }
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.volunteer) + ' - ' + escapeHtml(item.date) + '</p></div>' + renderStatus(normalizedStatus) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.district) + '</span><span class="feed-chip">' + escapeHtml(item.location) + '</span><span class="feed-chip">' + escapeHtml(String(item.points)) + ' pts</span></div><div class="action-stack" style="margin-top:14px;">' + actions.join("") + '</div></article>';
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
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.district) + ' - ' + escapeHtml(item.location) + '</p></div>' + renderStatus(stage) + '</div>' + renderStepper(stage) + '<div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.category) + '</span><span class="feed-chip">' + escapeHtml(String(item.beneficiaries)) + ' people</span><span class="feed-chip">' + escapeHtml(item.priority) + '</span></div></article>';
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
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div>' + renderStatus(item.status) + '</div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
    }).join("");
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
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div>' + renderStatus(item.status) + '</div><p class="card-copy">' + escapeHtml(item.copy) + '</p></article>';
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
    const activeTasks = assignments.filter(function (item) { return !/(delivered|closed|completed)/i.test(safeText(item.status, 40)); });
    const archive = assignments.filter(function (item) { return /(delivered|closed|completed)/i.test(safeText(item.status, 40)); });
    const fallbackAssignments = assignments.length ? assignments : workspace.assignments.slice(0, 3);
    const points = fallbackAssignments.reduce(function (sum, item) { return sum + Number(item.points || 0); }, 0);
    const reliability = Math.max(68, Math.min(99, computeVolunteerReliability(sharedVolunteer || { name: session.name }, workspace.assignments) + archive.length * 2));
    return {
      summary: assignments.length ? "You currently have " + activeTasks.length + " active task(s) and " + archive.length + " completed task(s) in the demo workspace." : "No personal assignments are linked yet, so the portal is showing the live volunteer opportunities from the current scenario.",
      district: topDistrict(workspace) || "No district yet",
      points: points,
      completed: archive.length,
      attendance: Math.max(archive.length + (activeTasks.length ? 1 : 0), assignments.length ? 4 : 0),
      streak: Math.max(archive.length, assignments.length ? 3 : 1),
      activeTasks: activeTasks.length ? activeTasks : workspace.assignments.slice(0, 3),
      archive: archive.length ? archive : workspace.assignments.filter(function (item) { return /(delivered|closed|completed)/i.test(safeText(item.status, 40)); }).slice(0, 3),
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
    return [
      { title: "Top pressure district", meta: topDistrict(workspace) || "No district", copy: "The system is prioritizing " + (topDistrict(workspace) || "the visible district") + " because it has the densest combination of urgent requests and pending assignments." },
      { title: "Best volunteer fit", meta: workspace.assignments.length + " assignment(s)", copy: topRequest.ai },
      { title: "Boosted risk signal", meta: topPrediction ? (topPrediction.request.district + " - " + String(topPrediction.score) + "/100") : (workspace.label || "Scenario"), copy: topPrediction ? topPrediction.recommendation : "Load a scenario to activate the boosted ranking engine." }
    ];
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
    if (stage === "Requested") return "Fresh community requests waiting for first review.";
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
      const stage = item.assignments >= item.requests && item.requests > 0 ? "In Progress" : item.requests ? "Reviewed" : "Requested";
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
        status: volunteerSnapshot.completed ? "Delivered" : "Assigned",
        copy: "You have " + volunteerSnapshot.activeTasks.length + " active task(s) and " + volunteerSnapshot.completed + " completed task(s) visible in your lane."
      });
    }
    if (!notices.length) {
      return [{
        title: "No live notifications yet",
        meta: "Load a scenario",
        status: "Requested",
        copy: "Requests, assignments, and donations will appear here once the workspace is active."
      }];
    }
    return notices.slice(0, 5);
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
        const stage = normalizeAssignmentStatus(assignment.status);
        return stage === "Assigned" || stage === "In Progress";
      }).length;
      return {
        title: item.district + " route group",
        meta: item.requests.length + " requests · " + item.assignments.length + " assignments",
        status: criticalCount ? "High Priority" : activeAssignments ? "In Progress" : "Requested",
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
        const stage = normalizeRequestStatus(request.status);
        return stage === "Delivered" || stage === "Closed";
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
      const stage = normalizeAssignmentStatus(assignment.status);
      return stage === "Assigned" || stage === "In Progress";
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
      const stage = normalizeRequestStatus(request.status);
      return request.blocked || ((stage === "Requested" || stage === "Reviewed") && priorityScore(request.priority) >= 0.82);
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
      const stage = normalizeRequestStatus(request.status);
      return stage === "Requested" || stage === "Reviewed";
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
      const stage = normalizeRequestStatus(request.status);
      return stage === "Delivered" || stage === "Closed";
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
        status: "Delivered",
        copy: "Visible request and donation records are moving without an obvious moderation backlog."
      });
    }
    return items;
  }

  function buildAdminAnalytics(workspace) {
    const deliveredAssignments = workspace.assignments.filter(function (assignment) {
      const stage = normalizeAssignmentStatus(assignment.status);
      return stage === "Delivered" || stage === "Closed";
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
        title: "Delivered assignments",
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
        const stage = normalizeAssignmentStatus(assignment.status);
        return stage === "Delivered" || stage === "Closed";
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
    if (normalized.indexOf("requested") !== -1 || normalized.indexOf("submitted") !== -1 || normalized.indexOf("review") !== -1 || normalized.indexOf("queue") !== -1 || normalized.indexOf("pending") !== -1 || normalized.indexOf("verified") !== -1 || normalized.indexOf("packed") !== -1 || normalized.indexOf("dispatch") !== -1 || normalized.indexOf("scheduled") !== -1 || normalized.indexOf("assigned") !== -1 || normalized.indexOf("progress") !== -1) return "pending";
    return "muted";
  }

  function bindEvents(root, page, session) {
    root.querySelectorAll("[data-nav-target][data-locked='true']").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        announce("Access restricted for the current portal.");
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
      communityForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitCommunityRequest(communityForm);
      });
    }

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

    if (page === "donations") {
      showDonationTab("money");
    }

    document.onkeydown = function (event) {
      if (event && event.key === "Escape") {
        let changed = false;
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
      workspace: getWorkspace()
    };
    downloadTextFile("resourceflow-" + page + "-report.json", JSON.stringify(payload, null, 2), "application/json");
    announce("JSON export created for the current workspace.");
  }

  function exportWorkspaceCsv(page, session) {
    const workspace = getWorkspace();
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
    const workspace = getWorkspace();
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
    request.updatedAt = new Date().toISOString();
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
    const workspace = getWorkspace();
    const request = workspace.requests.find(function (item) {
      return item.id === requestId;
    });
    if (!request) {
      return;
    }
    request.status = "Closed";
    request.updatedAt = new Date().toISOString();
    syncAssignmentsForRequest(request, workspace, "Closed");
    workspace.audit.unshift(request.title + " was closed from the admin or operations lane.");
    workspace.systemNotice = request.title + " is now closed.";
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function advanceAssignmentLifecycle(assignmentId) {
    const workspace = getWorkspace();
    const assignment = workspace.assignments.find(function (item) {
      return item.id === assignmentId;
    });
    if (!assignment) {
      return;
    }
    const currentStage = normalizeAssignmentStatus(assignment.status);
    const currentIndex = ASSIGNMENT_STAGES.indexOf(currentStage);
    const nextStage = ASSIGNMENT_STAGES[Math.min(currentIndex + 1, ASSIGNMENT_STAGES.length - 1)];
    assignment.status = nextStage;
    assignment.updatedAt = new Date().toISOString();
    if (assignment.requestId) {
      const request = workspace.requests.find(function (item) { return item.id === assignment.requestId; });
      if (request) {
        if (nextStage === "In Progress") {
          request.status = "In Progress";
        } else if (nextStage === "Delivered") {
          request.status = "Delivered";
        } else if (nextStage === "Closed") {
          request.status = "Closed";
        }
      }
    }
    workspace.audit.unshift(assignment.title + " moved to " + nextStage + ".");
    workspace.systemNotice = assignment.title + " updated to " + nextStage + ".";
    saveWorkspace(workspace);
    renderApp(document.getElementById("portalApp"));
  }

  function createAssignmentFromRequest(request, workspace) {
    const bestVolunteer = pickBestVolunteerForRequest(request, workspace) || workspace.volunteers[0] || { name: "Volunteer pending", location: request.location, ngo: "ResourceFlow" };
    return {
      id: "ASG-" + Math.floor(Math.random() * 900 + 100),
      requestId: request.id,
      title: "Respond to " + request.title,
      volunteer: bestVolunteer.name,
      district: request.district,
      location: request.location,
      status: "Assigned",
      date: "Today " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      points: Math.max(14, Math.round(Number(request.beneficiaries || 10) / 8))
    };
  }

  function pickBestVolunteerForRequest(request, workspace) {
    const category = safeText(request.category, 60).toLowerCase();
    const district = safeText(request.district, 80).toLowerCase();
    const keywords = CATEGORY_SKILLS[category] || [];
    const candidates = workspace.volunteers.map(function (volunteer) {
      const location = safeText(volunteer.location, 140).toLowerCase();
      const skills = joinSkills(volunteer.skills).toLowerCase();
      let score = Number(volunteer.reliability || computeVolunteerReliability(volunteer, workspace.assignments));
      if (district && location.indexOf(district) !== -1) score += 12;
      if (keywords.some(function (keyword) { return skills.indexOf(keyword) !== -1; })) score += 14;
      if (/available|active|on call/.test(safeText(volunteer.availability, 40).toLowerCase())) score += 8;
      return { volunteer: volunteer, score: score };
    }).sort(function (left, right) {
      return right.score - left.score;
    });
    return candidates.length ? candidates[0].volunteer : null;
  }

  function syncAssignmentsForRequest(request, workspace, overrideStatus) {
    const targetStatus = overrideStatus || normalizeRequestStatus(request.status);
    workspace.assignments.forEach(function (assignment) {
      if (assignment.requestId !== request.id) {
        return;
      }
      if (targetStatus === "Assigned") {
        assignment.status = "Assigned";
      } else if (targetStatus === "In Progress") {
        assignment.status = "In Progress";
      } else if (targetStatus === "Delivered") {
        assignment.status = "Delivered";
      } else if (targetStatus === "Closed") {
        assignment.status = "Closed";
      }
    });
  }

  function submitCommunityRequest(form) {
    const data = new FormData(form);
    const workspace = getWorkspace();
    const session = getSession();
    workspace.requests.unshift({
      id: "REQ-" + Math.floor(Math.random() * 900 + 100),
      title: safeText(data.get("title"), 140),
      category: safeText(data.get("category"), 80),
      district: safeText(data.get("district"), 80),
      location: safeText(data.get("location"), 140),
      beneficiaries: Number(data.get("beneficiaries") || 40),
      priority: safeText(data.get("priority"), 40) || "Medium",
      status: "Requested",
      summary: safeText(data.get("shortSummary"), 180) || safeText(data.get("summary"), 280),
      ai: "The AI will attach skills, district fit, and donation needs after an operator reviews this request.",
      requestedAt: new Date().toISOString(),
      requester: safeText(session.name || "Community user", 120),
      blocked: false
    });
    workspace.systemNotice = "New community request added to the live tracker and set to Requested.";
    workspace.audit.unshift("A community request was submitted for " + safeText(data.get("district"), 80) + " and routed into the lifecycle board.");
    saveWorkspace(workspace);
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
    const workspace = getWorkspace();
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
      const workspace = getWorkspace();
      const history = getAiChatHistory(session.role);
      const result = await requestAiCopilot(message, session, workspace, history);
      appendAiChatMessage(session.role, "assistant", result.text, result.sourceLabel);
      AI_RUNTIME.engine = result.engine;
      AI_RUNTIME.status = result.notice;
      AI_RUNTIME.tone = result.engine === "local-boosted" ? "" : "success";
    } catch (error) {
      const fallback = buildLocalCopilotResponse(message, getWorkspace(), session);
      appendAiChatMessage(session.role, "assistant", fallback.text, "Local boosted engine");
      AI_RUNTIME.engine = "local-boosted";
      AI_RUNTIME.status = "Live AI was unavailable, so the local boosted engine answered instead.";
      AI_RUNTIME.tone = "error";
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
    return {
      engine: "local-boosted",
      sourceLabel: "Local boosted engine",
      notice: "Gemini is not configured yet, so the local boosted engine is answering from the visible workspace.",
      text: buildLocalCopilotResponse(message, workspace, session).text
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
      text: text
    };
  }

  async function requestDirectGeminiResponse(message, session, workspace, history) {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        encodeURIComponent(config.geminiModel || "gemini-2.5-flash") +
        ":generateContent?key=" +
        encodeURIComponent(config.geminiApiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildCopilotPrompt(workspace, session, message, history) }]
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
      throw new Error("Gemini direct request failed.");
    }
    const payload = await response.json();
    const text = extractGeminiTextClient(payload);
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return {
      engine: "gemini-direct",
      sourceLabel: "Gemini direct",
      notice: "Gemini answered directly from the configured browser key.",
      text: text
    };
  }

  function buildLocalCopilotResponse(message, workspace, session) {
    const prompt = safeText(message, 900).toLowerCase();
    const topPrediction = buildBoostedPredictionRows(workspace)[0] || null;
    const topAssignment = workspace.assignments[0] || null;
    const topDonation = workspace.donations[0] || null;
    const topDistrictName = topDistrict(workspace) || "the active district";
    let text = "The local boosted engine needs active workspace data to answer clearly. Load a scenario first.";

    if (topPrediction) {
      if (prompt.indexOf("district") !== -1 || prompt.indexOf("where") !== -1 || prompt.indexOf("priority") !== -1) {
        text = topPrediction.request.district + " is the highest-priority district right now. " + topPrediction.explanation + " Next move: " + topPrediction.recommendation;
      } else if (prompt.indexOf("volunteer") !== -1 || prompt.indexOf("assign") !== -1 || prompt.indexOf("match") !== -1) {
        text = "The best current volunteer match is explained by the request itself: " + topPrediction.request.ai + " The boosted score is " + String(topPrediction.score) + "/100 because coverage and progress are still limited.";
      } else if (prompt.indexOf("donation") !== -1 || prompt.indexOf("money") !== -1 || prompt.indexOf("item") !== -1) {
        text = topDonation
          ? ("The latest visible donation is from " + topDonation.donor + " - " + formatDonationLine(topDonation) + ". The boosted engine still recommends surfacing more " + safeText(topPrediction.request.category, 60).toLowerCase() + " support for " + topPrediction.request.district + ".")
          : ("No donation records are visible yet. The model recommends surfacing donations for " + topPrediction.request.title + " first.");
      } else if (prompt.indexOf("summary") !== -1 || prompt.indexOf("plan") !== -1 || prompt.indexOf("next") !== -1) {
        text = "For the next 2 hours, focus on " + topPrediction.request.title + " in " + topPrediction.request.district + ". " + topPrediction.recommendation + " Current visible operations also show " + workspace.assignments.length + " assignment(s) and " + workspace.donations.length + " donation record(s).";
      } else {
        text = "ResourceFlow's local boosted engine recommends focusing on " + topPrediction.request.title + " in " + topPrediction.request.district + ". The request carries a " + String(topPrediction.score) + "/100 risk score. " + topPrediction.explanation;
      }
    } else if (workspace.requests.length) {
      text = "The visible workspace has requests, but the boosted ranking engine does not yet have enough context to rank them strongly. Load or refresh a demo scenario.";
    }

    if (session.role === "volunteer") {
      text += " In the volunteer lane, keep the answer focused on assignments, travel, and safe completion.";
    } else if (session.role === "government") {
      text += " In the government lane, focus on district pressure, sequencing, and deployment.";
    } else if (session.role === "admin") {
      text += " In the admin lane, combine this with donations, audit trail, and outreach drafts.";
    }

    return { text: text };
  }

  function buildCopilotPrompt(workspace, session, message, history) {
    const snapshot = {
      scenario: workspace.label,
      summary: workspace.summary,
      role: (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label,
      topRequests: workspace.requests.slice(0, 5).map(function (item) {
        return {
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
      boostedSignals: buildBoostedPredictionRows(workspace).slice(0, 3).map(function (item) {
        return {
          title: item.request.title,
          district: item.request.district,
          score: item.score,
          recommendation: item.recommendation
        };
      })
    };
    const transcript = history.slice(-6).map(function (item) {
      return (item.speaker === "assistant" ? "Assistant" : "User") + ": " + item.text;
    }).join("\n");
    return [
      "You are ResourceFlow Copilot, an NGO disaster-response chatbot inside a coordination platform.",
      "Answer briefly, clearly, and operationally. Prefer short paragraphs or compact bullets.",
      "Use only the workspace data provided. Mention exact districts, volunteers, donations, and statuses when relevant.",
      "If data is missing, say so directly instead of inventing details.",
      "The active portal role is: " + (ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label + ". Tailor the answer to that role.",
      transcript ? "Recent conversation:\n" + transcript : "",
      "Workspace snapshot:\n" + JSON.stringify(snapshot, null, 2),
      "User question: " + message
    ].join("\n\n");
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

  function seedWorkspace(scenario) {
    const preset = SCENARIO_PRESETS[scenario] || SCENARIO_PRESETS.flood;
    saveWorkspace(enrichWorkspace({
      scenario: preset.key,
      label: preset.label,
      summary: preset.summary,
      requests: preset.requests.slice(),
      assignments: preset.assignments.slice(),
      volunteers: preset.volunteers.slice(),
      donations: preset.donations.slice(),
      audit: preset.audit.slice(),
      outreach: preset.outreach.slice(),
      systemNotice: preset.label + " loaded. Review the tracker, AI story, and map links."
    }));
  }

  function resetWorkspace() {
    saveWorkspace(enrichWorkspace(Object.assign({}, EMPTY_WORKSPACE)));
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

  function saveWorkspace(workspace) {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(enrichWorkspace(workspace)));
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

  init();
})();

