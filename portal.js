(function () {
  const PORTAL_SELECTION_KEY = "resourceflow-portal-selection-v2";
  const PORTAL_PROFILE_KEY = "resourceflow-portal-profile-v2";
  const PORTAL_HANDOFF_KEY = "resourceflow-portal-handoff-v1";
  const ENTRY_PROFILE_KEY = "resourceflow-entry-profile-v1";
  const DEMO_AUTH_KEY = "resourceflow-demo-auth-v1";
  const THEME_KEY = "resourceflow-theme-mode-v2";
  const WORKSPACE_KEY = "resourceflow-demo-workspace-v2";
  const CACHE_RESET_KEY = "resourceflow-portal-cache-reset-v1";
  const FIREBASE_SDK_VERSION = "10.12.5";

  const PAGE_TITLES = {
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
      description: "View community status, donate, and follow visible response progress.",
      pages: ["overview", "donations"],
      chips: ["Overview only", "Donation access", "Read-only tracking"]
    },
    volunteer: {
      label: "Volunteer",
      description: "Track your assignments, view the shared directory, and follow your response progress.",
      pages: ["volunteer", "directory"],
      chips: ["Assignments", "Achievements", "Shared directory"]
    },
    government: {
      label: "Government Employee",
      description: "Coordinate live response operations, review pressure zones, and monitor the AI dispatch story.",
      pages: ["operations", "insights"],
      chips: ["Operations board", "District view", "AI dispatch"]
    },
    admin: {
      label: "Admin",
      description: "Manage platform activity, donation records, volunteer records, and public impact.",
      pages: ["overview", "volunteer", "directory", "donations", "operations", "insights", "admin", "impact", "judge"],
      chips: ["Full access", "Audit trail", "Governance controls"]
    }
  };

  const SIDEBAR_ITEMS = [
    { key: "overview", label: "Community Portal", shortLabel: "Community", href: "./overview.html", icon: "home", caption: "Public view and requests", roles: ["user", "admin"] },
    { key: "volunteer", label: "Volunteer Hub", shortLabel: "Volunteer", href: "./volunteer.html", icon: "volunteer_activism", caption: "Assignments and impact", roles: ["volunteer", "admin"] },
    { key: "directory", label: "Volunteer Directory", shortLabel: "Directory", href: "./directory.html", icon: "groups", caption: "Shared responder profiles", roles: ["volunteer", "admin"] },
    { key: "donations", label: "Donation Center", shortLabel: "Donations", href: "./donations.html", icon: "redeem", caption: "Money and item support", roles: ["user", "admin"] },
    { key: "operations", label: "Government Ops", shortLabel: "Operations", href: "./operations.html", icon: "shield_person", caption: "District coordination board", roles: ["government", "admin"] },
    { key: "insights", label: "AI Prediction", shortLabel: "AI", href: "./insights.html", icon: "monitoring", caption: "Forecasts and risk analysis", roles: ["government", "admin"] },
    { key: "admin", label: "Admin Dashboard", shortLabel: "Admin", href: "./admin.html", icon: "admin_panel_settings", caption: "Governance and control", roles: ["admin"] }
  ];

  const SCENARIO_PRESETS = {
    flood: {
      key: "flood",
      label: "Flood Response",
      summary: "A flood warning has escalated into active street-level response across low-lying neighborhoods.",
      requests: [
        { id: "REQ-104", title: "Dry ration kits for low-lying streets", category: "Food", district: "Chennai", location: "Velachery, Chennai", beneficiaries: 180, priority: "Critical", status: "Assigned", summary: "Families displaced by overnight flooding need ready-to-cook meal kits and drinking water.", ai: "AI matched food handlers and two-wheeler responders because they are within 4 km and available this evening." },
        { id: "REQ-105", title: "Temporary shelter support at school hall", category: "Shelter", district: "Chennai", location: "Saidapet Government School, Chennai", beneficiaries: 140, priority: "High", status: "In Progress", summary: "Mats, blankets, and volunteer registration support are needed for the emergency shelter.", ai: "AI prioritized bilingual volunteers with registration support skills for faster intake at the shelter." },
        { id: "REQ-106", title: "Medical support for senior citizens", category: "Medical", district: "Chennai", location: "Adyar Community Clinic, Chennai", beneficiaries: 65, priority: "Critical", status: "Queued", summary: "Medicine pickup and blood pressure checks are required for seniors isolated by waterlogging.", ai: "AI flagged the request because medicine lead time is short and the available nurse volunteer is nearby." },
        { id: "REQ-107", title: "School book recovery and child-safe space", category: "Education", district: "Chennai", location: "Perungudi Relief Camp, Chennai", beneficiaries: 150, priority: "Medium", status: "Submitted", summary: "Children at the relief camp need book kits, mats, and supervised activity support.", ai: "AI recommended education volunteers and book donations to combine relief and child engagement in one trip." }
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
        { id: "REQ-210", title: "Pre-position shelter kits", category: "Shelter", district: "Nagapattinam", location: "Nagapattinam Collectorate", beneficiaries: 220, priority: "Critical", status: "Assigned", summary: "Before landfall, the district needs shelter kits moved to two evacuation centers.", ai: "AI prioritized logistics volunteers with vehicle access because the movement window closes by evening." },
        { id: "REQ-211", title: "Fishing harbor warning support", category: "Community Alert", district: "Nagapattinam", location: "Akkaraipettai Harbor", beneficiaries: 90, priority: "High", status: "In Progress", summary: "Field teams are needed to spread evacuation and safe-return notices in person.", ai: "AI suggested bilingual volunteers because the harbor team needs Tamil and Telugu outreach support." },
        { id: "REQ-212", title: "Emergency medicine staging", category: "Medical", district: "Cuddalore", location: "Cuddalore District Hospital", beneficiaries: 130, priority: "High", status: "Queued", summary: "Medicine packs and glucose supplies need staging ahead of expected outages.", ai: "AI flagged a high-value medicine window and recommended fast deployment before road closures." }
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
        { id: "REQ-310", title: "Registration desk support", category: "Medical", district: "Kolkata", location: "Tangra Community Hall, Kolkata", beneficiaries: 160, priority: "High", status: "Assigned", summary: "Volunteers are needed to manage patient tokens, intake forms, and crowd flow.", ai: "AI matched volunteers with coordination and bilingual skills to reduce intake delays." },
        { id: "REQ-311", title: "Medicine desk coordination", category: "Medical", district: "Kolkata", location: "Tangra Community Hall, Kolkata", beneficiaries: 160, priority: "High", status: "In Progress", summary: "Doctors need one runner and one record-keeper for medicine dispensation.", ai: "AI paired one logistics volunteer and one data-entry volunteer because both are already on-site." },
        { id: "REQ-312", title: "Health awareness booklets", category: "Education", district: "Kolkata", location: "Tangra Community Hall, Kolkata", beneficiaries: 160, priority: "Medium", status: "Submitted", summary: "Printed materials and volunteer speakers are required for follow-up awareness sessions.", ai: "AI suggested clubbing booklets with the donation run to avoid a separate last-mile trip." }
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

  const REQUEST_STAGES = ["Submitted", "Reviewed", "Assigned", "In Progress", "Delivered"];

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

    root.innerHTML = [
      '<div class="drawer-backdrop" data-action="close-menu"></div>',
      renderHeader(page, session),
      '<div class="rf-layout">',
      renderSidebar(page, session),
      '<main id="portalMain" class="main-stack" tabindex="-1">',
      allowed ? renderPage(page, session, workspace) : renderAccessRestricted(page, session),
      "</main>",
      renderRail(page, session, workspace),
      "</div>"
      ,
      renderMobileDock(page, session)
    ].join("");

    document.body.classList.remove("rf-sidebar-open");
    bindEvents(root, page, session);
    ensureInteractiveTestIds(document);
  }

  function renderHeader(page, session) {
    const roleData = ROLE_CONFIG[session.role] || ROLE_CONFIG.user;
    return [
      '<header class="rf-header">',
      '<div class="rf-header-main">',
      '<button class="menu-button header-menu-button" type="button" data-action="toggle-menu" data-testid="toggle-menu" aria-label="Toggle sidebar menu"><span></span><span></span><span></span></button>',
      '<a class="rf-brand" href="./index.html" data-testid="brand-home">',
      '<span class="rf-brand-mark">RF</span>',
      '<span class="rf-brand-copy"><strong>ResourceFlow</strong><small>Management Console</small></span>',
      "</a>",
      '<div class="rf-page-intro">',
      '<span class="rf-page-kicker">' + escapeHtml(roleData.label) + '</span>',
      '<strong>' + escapeHtml(PAGE_TITLES[page] || "Portal") + '</strong>',
      "</div>",
      "</div>",
      '<div class="rf-header-actions">',
      '<div class="rf-header-chip">Live workspace</div>',
      '<button class="ghost-button theme-toggle header-theme-button" type="button" data-action="toggle-theme" data-testid="toggle-theme"><span class="button-full-label">' + escapeHtml(themeToggleLabel()) + '</span><span class="button-short-label">Theme</span></button>',
      '<button class="ghost-button header-switch-button" type="button" data-action="switch-portal" data-testid="switch-portal">Switch Portal</button>',
      '<button class="primary-button header-signout-button" type="button" data-action="signout" data-testid="sign-out">Sign Out</button>',
      "</div>",
      "</header>"
    ].join("");
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
      '<h2 class="session-name">Operational Control</h2>',
      '<p class="section-copy">A stitched command shell for community, volunteer, government, and admin response lanes.</p>',
      "</section>",
      '<section class="surface-card session-card">',
      '<p class="section-label">Current Access</p>',
      '<h3 class="section-title">' + escapeHtml(roleData.label) + "</h3>",
      '<p class="section-copy">' + escapeHtml(session.summary) + "</p>",
      '<div class="chip-row">' + roleData.chips.map(function (chip) { return '<span class="chip">' + escapeHtml(chip) + "</span>"; }).join("") + "</div>",
      "</section>",
      '<section class="surface-card">',
      '<p class="section-label">Visible Spaces</p>',
      '<div class="space-nav">' + nav + "</div>",
      "</section>",
      '<section class="surface-card sidebar-profile-card">',
      '<p class="section-label">Profile</p>',
      '<h3 class="section-title">' + escapeHtml(session.name) + "</h3>",
      '<p class="section-copy">' + escapeHtml(session.email || "Signed-in workspace session") + "</p>",
      '<div class="chip-row">',
      '<span class="chip">' + escapeHtml(roleData.label) + "</span>",
      session.profile.primarySummary ? '<span class="chip">' + escapeHtml(session.profile.primarySummary) + "</span>" : "",
      "</div>",
      '<button class="ghost-button sidebar-footer-action" type="button" data-action="seed-demo" data-scenario="flood" data-testid="sidebar-load-demo">Load Flood Demo</button>',
      "</section>",
      "</aside>"
    ].join("");
  }

  function renderRail(page, session, workspace) {
    const insightItems = buildInsightItems(workspace);
    const donations = workspace.donations.slice(0, 3);
    return [
      '<aside class="rf-rail right-stack">',
      '<section class="surface-card">',
      '<p class="section-label">Scenario Switcher</p>',
      '<h3 class="section-title">Change the live response story</h3>',
      '<form id="scenarioControlForm" class="form-grid compact-form" data-testid="scenario-control-form">',
      '<label><span>Active Scenario</span><select id="scenarioSelect" class="text-select" data-testid="scenario-select">' + renderScenarioOptions(workspace.scenario) + "</select></label>",
      '<div class="action-stack">',
      '<button class="primary-button" type="submit" data-testid="load-selected-scenario">Load Scenario</button>',
      '<button class="ghost-button" type="button" data-action="reset-workspace" data-testid="reset-workspace">Clear Demo</button>',
      "</div>",
      "</form>",
      '<div class="notice-box">' + escapeHtml(workspace.systemNotice || "Choose a scenario to populate the workspace.") + "</div>",
      "</section>",
      '<section class="surface-card">',
      '<p class="section-label">Quick Actions</p>',
      '<h3 class="section-title">Fast workspace moves</h3>',
      '<div class="quick-actions">',
      '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="load-demo">Load Demo</button>',
      '<button class="ghost-button" type="button" data-action="seed-demo" data-scenario="cyclone" data-testid="load-cyclone">Cyclone Demo</button>',
      '<button class="ghost-button" type="button" data-action="seed-demo" data-scenario="medical" data-testid="load-medical">Medical Demo</button>',
      '<a class="ghost-button" href="./donations.html" data-testid="open-donations">Donation Portal</a>',
      "</div>",
      "</section>",
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
      case "overview":
        return renderOverviewPage(workspace);
      case "volunteer":
        return renderVolunteerPage(session, workspace);
      case "directory":
        return renderDirectoryPage();
      case "donations":
        return renderDonationsPage();
      case "operations":
        return renderOperationsPage(workspace);
      case "insights":
        return renderInsightsPage(workspace);
      case "admin":
        return renderAdminPage(workspace);
      case "impact":
        return renderImpactPage(workspace);
      case "judge":
        return renderJudgePage(workspace);
      default:
        return renderOverviewPage(workspace);
    }
  }

  function renderOverviewPage(workspace) {
    return [
      renderHero({
        eyebrow: "Community Portal",
        title: "A public-facing response board that stays calm and readable.",
        copy: workspace.summary,
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="overview-load-demo">Load Flood Demo</button>',
        secondary: '<a class="ghost-button" href="./donations.html" data-testid="overview-donate">Donation Portal</a>',
        sideCards: [
          miniCard("Workspace", workspace.label || "No demo loaded", "A single community lane that shows urgent needs, support, and progress."),
          miniCard("Visible Spaces", "Community, Volunteer, Donations", "Each portal stays visually separate while sharing one response story.")
        ]
      }),
      renderActionTiles([
        { label: "I Need Help", copy: "Raise an urgent community request", href: "#communityRequestForm", tone: "brand" },
        { label: "I Want to Donate", copy: "Open money and item support", href: "./donations.html", tone: "outline" },
        { label: "Track Requests", copy: "See live request movement", href: "#communityTrackerSection", tone: "muted" }
      ]),
      renderMetrics(workspaceMetrics(workspace)),
      '<section class="page-columns"><div class="page-columns-main">' +
      renderMapStage(workspace, {
        eyebrow: "Live Impact Map",
        title: "Visible pressure zones and mapped requests",
        meta: workspace.label || "No demo loaded",
        location: firstMapLocation(workspace),
        summary: "Every card in the feed links back to a mappable location so teams can move from overview to action quickly."
      }) +
      '<section class="surface-card"><div class="section-head"><div><p class="section-label">Active Needs</p><h2 class="section-title">Latest community requests</h2></div></div><div class="feed-list">' + renderRequestCards(workspace.requests) + "</div></section></div>" +
      '<div class="page-columns-side"><section class="surface-card"><p class="section-label">Request Status Tracker</p><h2 class="section-title">See what is moving right now</h2>' + renderStatusBoard(workspace.requests) + '</section><section id="communityTrackerSection" class="surface-card"><p class="section-label">Community Request Tracker</p><h2 class="section-title">Requests currently visible to the network</h2><div class="feed-list">' + renderCommunityTracker(workspace.requests) + '</div></section><section class="surface-card"><p class="section-label">AI Matching Story</p><h2 class="section-title">How ResourceFlow explains the next step</h2><div class="feed-list">' + renderWorkflowCards(buildMatchingSteps(workspace)) + "</div></section></div></section>" +
      '<section class="two-col"><article class="surface-card"><p class="section-label">Community Request Form</p><h2 class="section-title">Raise a support request</h2><form id="communityRequestForm" class="form-grid" data-testid="community-request-form"><label><span>Request title</span><input class="text-input" name="title" type="text" placeholder="Emergency food kits for affected streets" required></label><div class="grid-2"><label><span>Category</span><select class="text-select" name="category" required><option value="">Choose category</option><option>Food</option><option>Medical</option><option>Shelter</option><option>Education</option><option>Logistics</option></select></label><label><span>District</span><input class="text-input" name="district" type="text" placeholder="Chennai" required></label></div><div class="grid-2"><label><span>Location address</span><input class="text-input" name="location" type="text" placeholder="Velachery, Chennai" required></label><label><span>Estimated people affected</span><input class="text-input" name="beneficiaries" type="number" min="1" step="1" placeholder="40" required></label></div><div class="grid-2"><label><span>Urgency</span><select class="text-select" name="priority" required><option value="Submitted">Submitted</option><option value="Reviewed">Reviewed</option><option value="Assigned">Assigned</option><option value="In Progress">In Progress</option></select></label><label><span>Need summary</span><input class="text-input" name="shortSummary" type="text" placeholder="Families need food, blankets, and safe shelter." required></label></div><label><span>Detailed context</span><textarea class="text-area" name="summary" placeholder="Describe the situation, road access, vulnerable groups, and immediate needs." required></textarea></label><button class="primary-button" type="submit" data-testid="submit-community-request">Submit Request</button></form><div id="communityRequestStatus" class="notice-box">Submitted requests are added to the tracker below and become part of the visible feed immediately.</div></article><article class="surface-card"><p class="section-label">Response Story</p><h2 class="section-title">What changes after a request is entered</h2><div class="feed-list">' + renderListCards(["The request appears in the community tracker immediately.", "Operations can open the mapped location and review urgency, district, and people affected.", "The AI story updates as volunteers, donations, and assignments are attached.", "Admins can later use the same request in reports and public impact summaries."]) + "</div></article></section>"
    ].join("");
  }

  function renderVolunteerPage(session, workspace) {
    const personal = buildVolunteerSnapshot(session, workspace);
    return [
      renderHero({
        eyebrow: "Volunteer Portal",
        title: safeText(session.name || "Volunteer", 80) + "'s response board",
        copy: personal.summary,
        primary: '<a class="primary-button" href="./directory.html" data-testid="open-directory">Open Volunteer Directory</a>',
        secondary: '<button class="ghost-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="volunteer-load-demo">Load Demo</button>',
        sideCards: [
          miniCard("Current District", personal.district, "The top district is derived from the active requests in the current scenario."),
          miniCard("Current Impact", String(personal.completed) + " tasks completed", "Points and badges update as the volunteer archive grows.")
        ]
      }),
      renderAlertBanner(workspace, "Flash flood warning", "The volunteer lane should make one next action obvious, even on small screens."),
      '<section class="page-columns"><div class="page-columns-main">' +
      renderMapStage(workspace, {
        eyebrow: "Live Sentinel Monitoring",
        title: "A visual map for the volunteer task queue",
        meta: topDistrict(workspace) || "No district selected",
        location: firstMapLocation(workspace),
        summary: "Volunteers can inspect the zone context, then jump out to Google Maps from each assignment card."
      }) +
      '</div><div class="page-columns-side"><section class="surface-card"><p class="section-label">Current Impact</p><h2 class="section-title">' + escapeHtml(String(personal.points)) + ' points earned</h2><div class="chip-row">' + personal.badges.map(function (badge) { return '<span class="chip">' + escapeHtml(badge) + '</span>'; }).join("") + '</div><p class="section-copy">Attendance, completed tasks, and active assignments are shown below so every volunteer can see their contribution clearly.</p></section><section class="surface-card"><p class="section-label">AI Task Priority</p><h2 class="section-title">Optimized for ' + escapeHtml(firstName(session.name)) + '</h2><div class="stack-list">' + renderPriorityQueue(personal.activeTasks.length ? personal.activeTasks : workspace.requests.slice(0, 3)) + "</div></section></div></section>",
      renderMetrics([
        metric("Points", String(personal.points), "Response points earned from completed assignments."),
        metric("Completed Tasks", String(personal.completed), "Closed assignments tied to your volunteer profile."),
        metric("Attendance Days", String(personal.attendance), "Engagement days tracked in the current demo story."),
        metric("Active Tasks", String(personal.activeTasks.length), "Assignments still open for your role.")
      ]),
      '<section class="two-col"><article class="surface-card"><p class="section-label">My Tasks</p><h2 class="section-title">Assignments for this volunteer session</h2><div class="feed-list">' + renderAssignmentCards(personal.activeTasks) + '</div></article><article class="surface-card"><p class="section-label">Volunteer Activity Archive</p><h2 class="section-title">Completed work visible to the team</h2><div class="feed-list">' + renderArchiveCards(personal.archive) + "</div></article></section>",
      '<section class="surface-card"><p class="section-label">Volunteer Directory Preview</p><h2 class="section-title">See other registered volunteers</h2><div class="stack-list">' + renderVolunteerPreviewCards(workspace.volunteers) + "</div></section>"
    ].join("");
  }

  function renderDirectoryPage() {
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
      '<section class="two-col"><article class="surface-card"><p class="section-label">Volunteer Registration</p><h2 class="section-title">Create or update a shared profile</h2><div id="sharedVolunteerStatus" class="notice-box">Sign in to create your volunteer profile and see the shared directory from Firestore.</div><form id="sharedVolunteerForm" class="form-grid" data-testid="shared-volunteer-form"><label><span>Full Name</span><input class="text-input" name="fullName" type="text" placeholder="Thenmozhi P" required></label><label><span>NGO Group Name</span><input class="text-input" name="ngoGroup" type="text" placeholder="Care Bridge" required></label><label><span>Skills</span><input class="text-input" name="skills" type="text" placeholder="first aid, food distribution, registration" required></label><div class="grid-2"><label><span>Phone</span><input class="text-input" name="phone" type="text" placeholder="+91 98765 43210" required></label><label><span>Email</span><input class="text-input" name="email" type="email" placeholder="volunteer@example.com" required></label></div><div class="grid-2"><label><span>Availability</span><select class="text-select" name="availability" required><option value="">Choose availability</option><option>Full Day</option><option>Half Day</option><option>Evening</option><option>Weekend</option><option>On Call</option></select></label><label><span>Activity Status</span><select class="text-select" name="activityStatus" required><option value="available">Available</option><option value="on call">On Call</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div><label><span>Location (Optional)</span><input class="text-input" name="location" type="text" placeholder="Salt Lake, Kolkata"></label><button class="primary-button" type="submit" data-testid="save-volunteer-profile">Save Shared Volunteer Profile</button></form></article><article class="surface-card"><p class="section-label">Filters</p><h2 class="section-title">Search by skill, NGO, or location</h2><div class="form-grid"><label><span>Search</span><input id="sharedVolunteerSearch" class="text-input" type="text" placeholder="Search by name, skill, NGO, or contact" data-testid="shared-volunteer-search"></label><div class="grid-2"><label><span>Skills</span><input id="sharedVolunteerSkillFilter" class="text-input" type="text" placeholder="first aid, logistics" data-testid="shared-volunteer-skill-filter"></label><label><span>NGO Group</span><input id="sharedVolunteerNgoFilter" class="text-input" type="text" placeholder="Care Bridge" data-testid="shared-volunteer-ngo-filter"></label></div><label><span>Location</span><input id="sharedVolunteerLocationFilter" class="text-input" type="text" placeholder="Kolkata, Chennai, Salt Lake" data-testid="shared-volunteer-location-filter"></label></div><div id="sharedVolunteerDirectoryStats" class="shared-metric-grid"><div class="empty-box">Directory metrics will appear here after sign-in.</div></div></article></section><section class="surface-card"><p class="section-label">Volunteer Directory Records</p><h2 class="section-title">Shared volunteer profiles</h2><div id="sharedVolunteerDirectoryList" class="stack-list"><div class="empty-box">Volunteer cards will appear here after sign-in.</div></div></section>'
    ].join("");
  }

  function renderDonationsPage() {
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
      '<section class="surface-card"><p class="section-label">Donation Records</p><h2 class="section-title">Submit a money or item donation</h2><div id="donationPortalStatus" class="notice-box">Sign in to store donation records in Firestore and track their status.</div><div class="two-col donation-panels"><article class="surface-card nested-card" data-donation-panel="money"><p class="section-label">Money Donation</p><form id="moneyDonationForm" class="form-grid" data-testid="money-donation-form"><label><span>Donor Name</span><input class="text-input" name="donorName" type="text" placeholder="Shri Sundaram" required></label><div class="grid-2"><label><span>Amount</span><input class="text-input" name="amount" type="number" min="1" step="1" placeholder="1000" required></label><label><span>Payment Method</span><select class="text-select" name="paymentMethod" required><option value="">Choose method</option><option>UPI</option><option>Bank Transfer</option><option>Card</option><option>Cash</option><option>Cheque</option></select></label></div><label><span>Message / Note</span><textarea class="text-area" name="message" placeholder="Add a note for the receiving team."></textarea></label><button class="primary-button" type="submit" data-testid="save-money-donation">Save Money Donation</button></form></article><article class="surface-card nested-card" data-donation-panel="item" hidden><p class="section-label">Item Donation</p><form id="itemDonationForm" class="form-grid" data-testid="item-donation-form"><label><span>Donor Name</span><input class="text-input" name="donorName" type="text" placeholder="Diya Raman" required></label><div class="grid-2"><label><span>Item Type</span><select class="text-select" name="itemType" required><option value="">Choose item type</option><option>Clothes</option><option>Food</option><option>Books</option><option>Other Useful Items</option></select></label><label><span>Quantity</span><input class="text-input" name="quantity" type="number" min="1" step="1" placeholder="12" required></label></div><label><span>Description</span><textarea class="text-area" name="description" placeholder="Describe the items being donated." required></textarea></label><label><span>Contact Details</span><input class="text-input" name="contactDetails" type="text" placeholder="+91 98765 43210 | donor@example.com" required></label><button class="primary-button" type="submit" data-testid="save-item-donation">Save Item Donation</button></form></article></div></section>',
      '<section class="two-col"><article class="surface-card"><p class="section-label">Live Snapshot</p><div id="donationSummaryGrid" class="shared-metric-grid"><div class="empty-box">Your shared donation summary will appear here after sign-in.</div></div></article><article class="surface-card"><p class="section-label">Donation Records</p><div id="donationHistoryList" class="stack-list"><div class="empty-box">Recent donation records from your account will appear here.</div></div></article></section>'
    ].join("");
  }

  function renderOperationsPage(workspace) {
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
        metric("Assignments", String(workspace.assignments.length), "Live dispatch items created from the active scenario."),
        metric("Beneficiaries", String(totalBeneficiaries(workspace)), "People projected to be supported across the board.")
      ]),
      '<section class="page-columns"><div class="page-columns-main">' +
      renderMapStage(workspace, {
        eyebrow: "Live Deployment Map",
        title: "District movement and resource view",
        meta: topDistrict(workspace) || "No district yet",
        location: firstMapLocation(workspace),
        summary: "Use the mapped location to pivot from the oversight board into Google Maps routing."
      }) +
      '</div><div class="page-columns-side"><section class="surface-card"><p class="section-label">Urgent Requests</p><h2 class="section-title">What needs action first</h2><div class="stack-list">' + renderRequestCards(workspace.requests.slice(0, 3)) + '</div></section><section class="surface-card"><p class="section-label">AI Dispatch Story</p><h2 class="section-title">Why this district is being prioritized</h2><div class="feed-list">' + renderWorkflowCards(buildMatchingSteps(workspace)) + "</div></section></div></section>" +
      '<section class="two-col"><article class="surface-card"><p class="section-label">District Pressure Board</p><h2 class="section-title">Where teams should move next</h2><div class="feed-list">' + renderDistrictSummaryCards(workspace) + '</div></article><article class="surface-card"><p class="section-label">Active Dispatch</p><h2 class="section-title">Assignments currently being coordinated</h2><div class="feed-list">' + renderAssignmentCards(workspace.assignments) + "</div></article></section>" +
      '<section class="surface-card"><p class="section-label">Request Workflow</p><h2 class="section-title">Status pipeline across the active scenario</h2>' + renderStatusBoard(workspace.requests) + "</section>"
    ].join("");
  }

  function renderInsightsPage(workspace) {
    const items = buildInsightItems(workspace);
    return [
      renderHero({
        eyebrow: "AI Insights",
        title: "AI prediction and resource forecasting in one explainable view.",
        copy: "Use the insight feed to explain district pressure, volunteer fit, and how the current scenario is unfolding.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="medical" data-testid="insights-load-demo">Load Medical Demo</button>',
        secondary: '<a class="ghost-button" href="./operations.html" data-testid="insights-back-operations">Back To Operations</a>',
        sideCards: [
          miniCard("Scenario", workspace.label || "No demo loaded", "Insight cards become richer once requests, assignments, and donations exist."),
          miniCard("AI Story", String(items.length) + " live cards", "Each card explains a decision in plain language.")
        ]
      }),
      '<section class="page-columns"><div class="page-columns-main">' +
      renderMapStage(workspace, {
        eyebrow: "AI Heatmap",
        title: "Predicted shortage and district risk view",
        meta: workspace.label || "No demo loaded",
        location: firstMapLocation(workspace),
        summary: "The prediction view surfaces where resources may run short before the next response step begins."
      }) +
      '</div><div class="page-columns-side"><section class="surface-card"><p class="section-label">Predicted Funding</p><h2 class="section-title">' + escapeHtml(formatCurrency(totalBeneficiaries(workspace) * 420)) + '</h2><p class="section-copy">A simple estimate based on the visible requests, beneficiaries, and the currently loaded scenario.</p></section><section class="surface-card"><p class="section-label">Resource Gaps</p><div class="feed-list">' + renderProjectionCards(workspace.requests) + "</div></section></div></section>" +
      '<section class="two-col"><article class="surface-card"><p class="section-label">Requirement Projections</p><h2 class="section-title">Category-level demand forecast</h2><div class="feed-list">' + renderProjectionCards(workspace.requests, true) + '</div></article><article class="surface-card"><p class="section-label">Coordination Log</p><h2 class="section-title">AI explanation and analyst notes</h2><div class="feed-list">' + items.map(function (item) { return '<div class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.meta) + '</p></div></div><p class="card-copy">' + escapeHtml(item.copy) + "</p></div>"; }).join("") + "</div></article></section>"
    ].join("");
  }

  function renderAdminPage(workspace) {
    return [
      renderHero({
        eyebrow: "Admin Dashboard",
        title: "Governance, live snapshot, and outreach in one admin control room.",
        copy: "The admin lane combines local demo intelligence with shared Firestore-backed volunteer and donation management.",
        primary: '<button class="primary-button" type="button" data-action="seed-demo" data-scenario="flood" data-testid="admin-load-demo">Load Demo</button>',
        secondary: '<a class="ghost-button" href="./impact.html" data-testid="admin-open-impact">Public Impact</a>',
        sideCards: [
          miniCard("Governance Pulse", "Audit events, review queue, outreach drafts", "These cards stay high-contrast in light and dark mode."),
          miniCard("Visible Spaces", "Community, Volunteer, Donations", "The sidebar remains fixed while the feed and widgets scroll.")
        ]
      }),
      renderMetrics([
        metric("Live Snapshot", String(workspace.requests.length), "Requests currently visible in the workspace feed."),
        metric("Assignments", String(workspace.assignments.length), "Assignment stats linked to the active scenario."),
        metric("Beneficiaries", String(totalBeneficiaries(workspace)), "Projected people supported by the loaded scenario."),
        metric("Donation Records", String(workspace.donations.length), "Local scenario donation records plus shared backend entries below.")
      ]),
      '<section class="two-col"><article class="surface-card"><p class="section-label">Governance Pulse</p><h2 class="section-title">Audit events, review queue, and outreach drafts</h2><div class="feed-list">' + renderListCards(workspace.audit) + '</div><div id="adminVolunteerStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Volunteer activity status cards will appear here.</div></div><div id="adminDonationStatusBoard" class="shared-metric-grid" style="margin-top:16px;"><div class="empty-box">Donation workflow status cards will appear here.</div></div></article><article class="surface-card"><p class="section-label">Live Snapshot</p><h2 class="section-title">Shared backend summary</h2><div id="sharedAdminStatus" class="notice-box">Admin dashboard is checking the shared backend.</div><div id="adminSharedSummary" class="shared-metric-grid"><div class="empty-box">Admin metrics will appear here after sign-in.</div></div></article></section>',
      '<section class="surface-card"><p class="section-label">User Role Management</p><h2 class="section-title">Who can access which portal right now</h2><div class="table-shell"><table><thead><tr><th>Name</th><th>Role</th><th>Current Access</th><th>Status</th></tr></thead><tbody>' + renderRoleRows() + '</tbody></table></div></section>',
      '<section class="two-col"><article class="surface-card"><p class="section-label">Volunteer Directory Records</p><h2 class="section-title">Shared volunteer visibility</h2><div id="adminVolunteerRecords" class="stack-list"><div class="empty-box">Shared volunteer management is loading.</div></div></article><article class="surface-card"><p class="section-label">Donation Records</p><h2 class="section-title">Money and item support from the backend</h2><div id="adminDonationRecords" class="stack-list"><div class="empty-box">Shared donation management is loading.</div></div></article></section>',
      '<section class="two-col"><article class="surface-card"><p class="section-label">Outreach Center</p><form id="adminOutreachForm" class="form-grid" data-testid="outreach-center-form"><label><span>Subject</span><input class="text-input" name="subject" type="text" placeholder="Volunteer briefing for evening flood response"></label><label><span>Message</span><textarea class="text-area" name="message" placeholder="Share timing, district, safety notes, and reporting instructions."></textarea></label><label><span>Recipients</span><input class="text-input" name="recipients" type="text" placeholder="Community, Volunteer, Donation portal"></label><button class="primary-button" type="button" data-action="save-outreach" data-testid="save-outreach-draft">Save Draft</button></form></article><article class="surface-card"><p class="section-label">Outreach Drafts</p><div id="adminOutreachDrafts" class="feed-list">' + renderListCards(workspace.outreach) + "</div></article></section>"
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
    return '<section class="surface-card access-restricted"><p class="section-label">Access Restricted</p><h1>You cannot open ' + escapeHtml(PAGE_TITLES[page] || "this page") + ' with the current portal.</h1><p class="section-copy">Your current role is ' + escapeHtml((ROLE_CONFIG[session.role] || ROLE_CONFIG.user).label) + '. Use Switch Portal or open one of the spaces available in the sidebar.</p><div class="action-stack"><button class="primary-button" type="button" data-action="switch-portal" data-testid="restricted-switch-portal">Switch Portal</button><a class="ghost-button" href="' + escapeHtml(homeRouteForRole(session.role)) + '" data-testid="restricted-go-home">Go To Allowed Space</a></div></section>';
  }

  function renderHero(config) {
    return '<section class="hero-card"><div class="hero-grid"><div class="hero-copy"><p class="section-label">' + escapeHtml(config.eyebrow) + '</p><h1>' + escapeHtml(config.title) + '</h1><p class="section-copy">' + escapeHtml(config.copy) + '</p><div class="action-stack hero-actions">' + config.primary + config.secondary + '</div></div><div class="hero-side">' + (config.sideCards || []).join("") + "</div></div></section>";
  }

  function miniCard(label, title, copy) {
    return '<article class="mini-card"><span class="section-label">' + escapeHtml(label) + '</span><strong>' + escapeHtml(title) + '</strong><p class="card-copy">' + escapeHtml(copy) + "</p></article>";
  }

  function renderActionTiles(items) {
    if (!items || !items.length) {
      return "";
    }
    return '<section class="action-tile-grid">' + items.map(function (item) {
      const element = item.href ? "a" : "button";
      const attrs = item.href ? ' href="' + escapeHtml(item.href) + '"' : ' type="button"';
      const dataAttrs = item.testId ? ' data-testid="' + escapeHtml(item.testId) + '"' : "";
      return '<' + element + ' class="action-tile action-tile-' + escapeHtml(item.tone || "brand") + '"' + attrs + dataAttrs + '><strong>' + escapeHtml(item.label) + '</strong><span>' + escapeHtml(item.copy) + '</span></' + element + ">";
    }).join("") + "</section>";
  }

  function renderAlertBanner(workspace, title, copy) {
    if (!workspace.requests.length) {
      return "";
    }
    return '<section class="alert-banner"><span class="alert-icon">!</span><div><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(copy) + '</p></div><button class="primary-button alert-button" type="button" data-action="seed-demo" data-scenario="' + escapeHtml(workspace.scenario === "none" ? "flood" : workspace.scenario) + '" data-testid="refresh-alert-scenario">Acknowledge</button></section>';
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
      { name: "Community User", role: "Community", access: "Community Portal and Donations", status: "Visible" },
      { name: "Volunteer", role: "Volunteer", access: "Volunteer Portal and Directory", status: "Available" },
      { name: "Government Employee", role: "Government", access: "Operations and AI Insights", status: "Active" },
      { name: "Admin", role: "Admin", access: "All portals", status: "Submitted" }
    ];
    return rows.map(function (row) {
      return "<tr><td>" + escapeHtml(row.name) + "</td><td>" + escapeHtml(row.role) + "</td><td>" + escapeHtml(row.access) + "</td><td>" + renderStatus(row.status) + "</td></tr>";
    }).join("");
  }

  function renderRequestCards(items) {
    if (!items.length) {
      return '<div class="empty-box">No active requests yet. Use Load Demo to bring in a fake disaster scenario.</div>';
    }
    return items.map(function (item) {
      const stage = normalizeRequestStatus(item.status);
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.summary) + '</p></div>' + renderStatus(stage) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.category) + '</span><span class="feed-chip">' + escapeHtml(item.district) + '</span><span class="feed-chip">' + escapeHtml(String(item.beneficiaries)) + ' beneficiaries</span><span class="feed-chip">' + escapeHtml(item.priority) + '</span></div>' + renderStepper(stage) + '<p class="card-copy"><strong>AI match:</strong> ' + escapeHtml(item.ai) + '</p><div class="action-stack" style="margin-top:14px;"><button class="ghost-button" type="button" data-map-location="' + escapeHtml(item.location) + '" data-testid="view-map-' + escapeHtml(item.id.toLowerCase()) + '">View on Map</button></div></article>';
    }).join("");
  }
  function renderAssignmentCards(items) {
    if (!items.length) {
      return '<div class="empty-box">No assignments are visible yet. Load a demo scenario to populate assignments.</div>';
    }
    return items.map(function (item) {
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.title) + '</strong><p class="feed-meta">' + escapeHtml(item.volunteer) + ' - ' + escapeHtml(item.date) + '</p></div>' + renderStatus(item.status) + '</div><div class="feed-chip-row"><span class="feed-chip">' + escapeHtml(item.district) + '</span><span class="feed-chip">' + escapeHtml(item.location) + '</span><span class="feed-chip">' + escapeHtml(String(item.points)) + ' pts</span></div><div class="action-stack" style="margin-top:14px;"><button class="ghost-button" type="button" data-map-location="' + escapeHtml(item.location) + '" data-testid="assignment-map-' + escapeHtml(item.id.toLowerCase()) + '">View on Map</button></div></article>';
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
      return '<article class="feed-card"><div class="feed-card-head"><div><strong>' + escapeHtml(item.name) + '</strong><p class="feed-meta">' + escapeHtml(item.ngo) + '</p></div>' + renderStatus(item.availability) + '</div><p class="card-copy">' + escapeHtml(item.skills.join(", ")) + ' - ' + escapeHtml(item.location) + '</p></article>';
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

  function buildVolunteerSnapshot(session, workspace) {
    const portalProfile = session.profile || {};
    const baseName = safeText(portalProfile.fullName || session.name || "", 120).toLowerCase();
    const assignments = workspace.assignments.filter(function (item) {
      return baseName && safeText(item.volunteer, 120).toLowerCase() === baseName;
    });
    const activeTasks = assignments.filter(function (item) { return item.status !== "Completed"; });
    const archive = assignments.filter(function (item) { return item.status === "Completed"; });
    const fallbackAssignments = assignments.length ? assignments : workspace.assignments.slice(0, 3);
    const points = fallbackAssignments.reduce(function (sum, item) { return sum + Number(item.points || 0); }, 0);
    return {
      summary: assignments.length ? "You currently have " + activeTasks.length + " active task(s) and " + archive.length + " completed task(s) in the demo workspace." : "No personal assignments are linked yet, so the portal is showing the live volunteer opportunities from the current scenario.",
      district: topDistrict(workspace) || "No district yet",
      points: points,
      completed: archive.length,
      attendance: Math.max(archive.length + (activeTasks.length ? 1 : 0), assignments.length ? 4 : 0),
      activeTasks: activeTasks.length ? activeTasks : workspace.assignments.slice(0, 3),
      archive: archive.length ? archive : workspace.assignments.filter(function (item) { return item.status === "Completed"; }).slice(0, 3),
      badges: buildVolunteerBadges(points, archive.length)
    };
  }

  function buildVolunteerBadges(points, completed) {
    const badges = [];
    if (completed >= 1) badges.push("First Response");
    if (completed >= 2) badges.push("Steady Support");
    if (points >= 50) badges.push("High Impact");
    return badges.length ? badges : ["Ready To Respond"];
  }

  function buildInsightItems(workspace) {
    if (!workspace.requests.length) {
      return [{ title: "Load demo data", meta: "No active scenario", copy: "Use the quick actions to load a flood, cyclone, or medical demo scenario." }];
    }
    const topRequest = workspace.requests[0];
    return [
      { title: "Top pressure district", meta: topDistrict(workspace) || "No district", copy: "The system is prioritizing " + (topDistrict(workspace) || "the visible district") + " because it has the densest combination of urgent requests and pending assignments." },
      { title: "Best volunteer fit", meta: workspace.assignments.length + " assignment(s)", copy: topRequest.ai },
      { title: "Next best action", meta: workspace.label || "Scenario", copy: "Move the highest-priority request first, then use the donation and volunteer records to show end-to-end proof." }
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
  function normalizeRequestStatus(status) {
    const normalized = safeText(status, 40).toLowerCase();
    if (!normalized || normalized === "tracked") return "Submitted";
    if (normalized.indexOf("delivered") !== -1 || normalized.indexOf("completed") !== -1 || normalized.indexOf("closed") !== -1) return "Delivered";
    if (normalized.indexOf("progress") !== -1 || normalized.indexOf("active") !== -1) return "In Progress";
    if (normalized.indexOf("assigned") !== -1) return "Assigned";
    if (normalized.indexOf("review") !== -1 || normalized.indexOf("queue") !== -1 || normalized.indexOf("pending") !== -1) return "Reviewed";
    return "Submitted";
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
    if (stage === "Submitted") return "Fresh community requests waiting for review.";
    if (stage === "Reviewed") return "Requests checked and ready for assignment.";
    if (stage === "Assigned") return "A team or volunteer has been attached.";
    if (stage === "In Progress") return "Field work is currently active.";
    return "Support delivered and visible in the archive.";
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
      const stage = item.assignments >= item.requests && item.requests > 0 ? "In Progress" : item.requests ? "Reviewed" : "Submitted";
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

  function renderStatus(status) {
    return '<span class="record-status-pill record-status-pill-' + statusTone(status) + '">' + escapeHtml(status || "Tracked") + "</span>";
  }

  function statusTone(status) {
    const normalized = safeText(status, 40).toLowerCase();
    if (normalized.indexOf("complete") !== -1 || normalized.indexOf("delivered") !== -1 || normalized.indexOf("available") !== -1 || normalized.indexOf("active") !== -1 || normalized.indexOf("visible") !== -1) return "success";
    if (normalized.indexOf("submitted") !== -1 || normalized.indexOf("review") !== -1 || normalized.indexOf("queue") !== -1 || normalized.indexOf("pending") !== -1 || normalized.indexOf("scheduled") !== -1 || normalized.indexOf("assigned") !== -1 || normalized.indexOf("progress") !== -1) return "pending";
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

    root.querySelectorAll("[data-action='toggle-theme']").forEach(function (button) {
      button.addEventListener("click", function () {
        const next = loadTheme() === "dark" ? "light" : "dark";
        saveTheme(next);
        applyTheme(next);
        updateThemeToggleButtons(root, next);
      });
    });

    root.querySelectorAll("[data-action='switch-portal']").forEach(function (button) {
      button.addEventListener("click", function () {
        localStorage.removeItem(PORTAL_SELECTION_KEY);
        localStorage.removeItem(PORTAL_HANDOFF_KEY);
        window.location.assign("./index.html");
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
        renderApp(document.getElementById("portalApp"));
      });
    });

    root.querySelectorAll("[data-action='reset-workspace']").forEach(function (button) {
      button.addEventListener("click", function () {
        resetWorkspace();
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

    const scenarioForm = document.getElementById("scenarioControlForm");
    if (scenarioForm) {
      scenarioForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const select = document.getElementById("scenarioSelect");
        const selectedScenario = select ? safeText(select.value || "none", 40).toLowerCase() : "none";
        if (selectedScenario === "none") {
          resetWorkspace();
        } else {
          seedWorkspace(selectedScenario);
        }
        renderApp(document.getElementById("portalApp"));
      });
    }

    const outreachButton = document.querySelector("[data-action='save-outreach']");
    if (outreachButton) {
      outreachButton.addEventListener("click", function () {
        saveOutreachDraft();
      });
    }

    if (page === "donations") {
      showDonationTab("money");
    }
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

  function submitCommunityRequest(form) {
    const data = new FormData(form);
    const workspace = getWorkspace();
    workspace.requests.unshift({
      id: "REQ-" + Math.floor(Math.random() * 900 + 100),
      title: safeText(data.get("title"), 140),
      category: safeText(data.get("category"), 80),
      district: safeText(data.get("district"), 80),
      location: safeText(data.get("location"), 140),
      beneficiaries: Number(data.get("beneficiaries") || 40),
      priority: safeText(data.get("priority"), 40) || "Submitted",
      status: safeText(data.get("priority"), 40) || "Submitted",
      summary: safeText(data.get("shortSummary"), 180) || safeText(data.get("summary"), 280),
      ai: "The AI will attach skills, district fit, and donation needs after an operator reviews this request."
    });
    workspace.systemNotice = "New community request added to the live tracker.";
    workspace.audit.unshift("A community request was submitted for " + safeText(data.get("district"), 80) + " and routed into the visible tracker.");
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
    return stored && stored.requests && stored.assignments && stored.volunteers ? stored : Object.assign({}, EMPTY_WORKSPACE);
  }

  function seedWorkspace(scenario) {
    const preset = SCENARIO_PRESETS[scenario] || SCENARIO_PRESETS.flood;
    saveWorkspace({
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
    });
  }

  function resetWorkspace() {
    saveWorkspace(Object.assign({}, EMPTY_WORKSPACE));
  }

  function saveWorkspace(workspace) {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
  }

  function isPageAllowed(role, page) {
    return (ROLE_CONFIG[role] || ROLE_CONFIG.user).pages.indexOf(page) !== -1;
  }

  function homeRouteForRole(role) {
    if (role === "volunteer") return "./volunteer.html";
    if (role === "government") return "./operations.html";
    if (role === "admin") return "./admin.html";
    return "./overview.html";
  }

  function normalizePage(value) {
    const page = safeText(value, 40).toLowerCase();
    return PAGE_TITLES[page] ? page : "overview";
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

  function formatCurrency(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
  }

  function formatCurrency(value) {
    return "Rs " + Number(value || 0).toLocaleString("en-IN");
  }

  init();
})();

