(function () {
  const FIREBASE_SDK_VERSION = "10.12.5";
  const FIREBASE_SCRIPTS = [
    "https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-firestore-compat.js"
  ];
  const VOLUNTEER_COLLECTION = "resourceflowVolunteerProfiles";
  const DONATION_COLLECTION = "resourceflowDonations";
  const ADMIN_ROLES = ["admin", "coordinator"];
  const VOLUNTEER_ACTIVITY_OPTIONS = ["available", "on call", "active", "inactive"];
  const DONATION_STATUS_OPTIONS = ["submitted", "reviewing", "scheduled", "received", "completed"];

  const state = {
    auth: null,
    db: null,
    user: null,
    profile: null,
    volunteers: [],
    donations: [],
    unsubscribeVolunteers: null,
    unsubscribeOwnDonations: null,
    unsubscribeAdminDonations: null
  };

  const refs = {};

  document.addEventListener("DOMContentLoaded", function () {
    cacheRefs();
    if (!hasSharedPortalTargets()) {
      return;
    }
    bindStaticEvents();
    bootstrapSharedPortal().catch(function (error) {
      console.warn("Shared portal bootstrap failed.", error);
      renderFatalError("Shared backend could not be initialized right now.");
    });
  });

  function cacheRefs() {
    refs.page = document.body ? safeText(document.body.dataset.page || "", 40).toLowerCase() : "";
    refs.donationPortalStatus = document.getElementById("donationPortalStatus");
    refs.moneyDonationForm = document.getElementById("moneyDonationForm");
    refs.itemDonationForm = document.getElementById("itemDonationForm");
    refs.donationSummaryGrid = document.getElementById("donationSummaryGrid");
    refs.donationHistoryList = document.getElementById("donationHistoryList");
    refs.sharedVolunteerStatus = document.getElementById("sharedVolunteerStatus");
    refs.sharedVolunteerForm = document.getElementById("sharedVolunteerForm");
    refs.sharedVolunteerDirectoryStats = document.getElementById("sharedVolunteerDirectoryStats");
    refs.sharedVolunteerDirectoryList = document.getElementById("sharedVolunteerDirectoryList");
    refs.sharedVolunteerSearch = document.getElementById("sharedVolunteerSearch");
    refs.sharedVolunteerSkillFilter = document.getElementById("sharedVolunteerSkillFilter");
    refs.sharedVolunteerNgoFilter = document.getElementById("sharedVolunteerNgoFilter");
    refs.sharedVolunteerLocationFilter = document.getElementById("sharedVolunteerLocationFilter");
    refs.sharedAdminStatus = document.getElementById("sharedAdminStatus");
    refs.adminSharedSummary = document.getElementById("adminSharedSummary");
    refs.adminVolunteerRecords = document.getElementById("adminVolunteerRecords");
    refs.adminDonationRecords = document.getElementById("adminDonationRecords");
  }

  function hasSharedPortalTargets() {
    return Boolean(
      refs.moneyDonationForm
      || refs.itemDonationForm
      || refs.sharedVolunteerForm
      || refs.adminVolunteerRecords
      || refs.adminDonationRecords
    );
  }

  async function bootstrapSharedPortal() {
    const config = getFirebaseConfig();
    if (!config.enabled) {
      renderFatalError("Firebase is disabled in the current ResourceFlow configuration.");
      return;
    }

    await ensureFirebaseScripts();
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(buildFirebaseInitConfig(config));
    }

    state.auth = window.firebase.auth();
    state.db = window.firebase.firestore();
    state.auth.onAuthStateChanged(function (user) {
      handleAuthStateChange(user).catch(function (error) {
        console.warn("Shared portal auth refresh failed.", error);
        renderFatalError("The shared portal could not refresh your session.");
      });
    });
  }

  async function handleAuthStateChange(user) {
    clearRealtimeSubscriptions();
    state.user = user || null;
    state.profile = state.user ? await loadUserProfile(state.user.uid) : null;
    state.volunteers = [];
    state.donations = [];

    updateAccessStates();
    prefillSharedForms();

    if (refs.moneyDonationForm || refs.itemDonationForm) {
      if (state.user) {
        watchOwnDonations();
        setDonationMessage("Donation portal connected. Your submissions are stored in Firestore and visible in admin review.", "success");
      } else {
        renderDonationGuestState();
      }
    }

    if (refs.sharedVolunteerForm || refs.sharedVolunteerDirectoryList) {
      if (state.user) {
        watchVolunteers();
        setVolunteerMessage("Shared volunteer directory connected. Every signed-in volunteer can see these profiles.", "success");
      } else {
        renderVolunteerGuestState();
      }
    }

    if (refs.adminSharedSummary || refs.adminVolunteerRecords || refs.adminDonationRecords) {
      if (state.user && isManager()) {
        if (!state.unsubscribeVolunteers) {
          watchVolunteers();
        }
        watchAdminDonations();
        setAdminMessage("Admin dashboard connected to shared Firestore collections.", "success");
      } else {
        renderAdminLockedState();
      }
    }

    syncVolunteerTopStats();
  }

  async function loadUserProfile(uid) {
    if (!state.db || !uid) {
      return null;
    }
    try {
      const snapshot = await state.db.collection("resourceflowUsers").doc(uid).get();
      return snapshot.exists && snapshot.data() ? snapshot.data() : null;
    } catch (error) {
      console.warn("Could not load user profile.", error);
      return null;
    }
  }

  function updateAccessStates() {
    setFormDisabled(refs.moneyDonationForm, !state.user);
    setFormDisabled(refs.itemDonationForm, !state.user);
    setFormDisabled(refs.sharedVolunteerForm, !state.user);
  }

  function prefillSharedForms() {
    prefillDonationForms();
    prefillVolunteerForm();
  }

  function prefillDonationForms() {
    const displayName = currentDisplayName();
    [refs.moneyDonationForm, refs.itemDonationForm].forEach(function (form) {
      if (!form) {
        return;
      }
      if (form.elements.donorName && !safeText(form.elements.donorName.value, 120)) {
        form.elements.donorName.value = displayName;
      }
    });
    if (refs.itemDonationForm && refs.itemDonationForm.elements.contactDetails && !safeText(refs.itemDonationForm.elements.contactDetails.value, 180)) {
      refs.itemDonationForm.elements.contactDetails.value = currentContactEmail();
    }
  }

  function prefillVolunteerForm() {
    if (!refs.sharedVolunteerForm) {
      return;
    }
    const portalProfile = loadPortalProfile("volunteer");
    const existing = currentVolunteerProfile();
    const source = existing || portalProfile || {};

    fillIfBlank(refs.sharedVolunteerForm.elements.fullName, source.fullName || source.displayName || currentDisplayName());
    fillIfBlank(refs.sharedVolunteerForm.elements.ngoGroup, source.ngoGroup || "");
    fillIfBlank(refs.sharedVolunteerForm.elements.skills, joinSkills(source.skills));
    fillIfBlank(refs.sharedVolunteerForm.elements.phone, source.phone || "");
    fillIfBlank(refs.sharedVolunteerForm.elements.email, source.email || currentContactEmail());
    fillIfBlank(refs.sharedVolunteerForm.elements.availability, source.availability || "");
    fillIfBlank(refs.sharedVolunteerForm.elements.location, source.location || "");
    fillIfBlank(refs.sharedVolunteerForm.elements.activityStatus, normalizeActivityStatus(source.activityStatus || "available"));
  }

  function currentVolunteerProfile() {
    const uid = state.user && state.user.uid ? state.user.uid : "";
    return state.volunteers.find(function (item) {
      return item.id === uid;
    }) || null;
  }

  function bindStaticEvents() {
    bindSubmit(refs.moneyDonationForm, handleMoneyDonationSubmit);
    bindSubmit(refs.itemDonationForm, handleItemDonationSubmit);
    bindSubmit(refs.sharedVolunteerForm, handleVolunteerProfileSubmit);

    [
      refs.sharedVolunteerSearch,
      refs.sharedVolunteerSkillFilter,
      refs.sharedVolunteerNgoFilter,
      refs.sharedVolunteerLocationFilter
    ].forEach(function (field) {
      if (!field || field.dataset.bound === "true") {
        return;
      }
      field.dataset.bound = "true";
      field.addEventListener("input", renderVolunteerDirectory);
      field.addEventListener("change", renderVolunteerDirectory);
    });

    if (document.body && document.body.dataset.sharedAdminBound !== "true") {
      document.body.dataset.sharedAdminBound = "true";
      document.addEventListener("click", handleAdminControlClick);
    }
  }

  function bindSubmit(form, handler) {
    if (!form || form.dataset.bound === "true") {
      return;
    }
    form.dataset.bound = "true";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      handler().catch(function (error) {
        console.warn("Shared portal submit failed.", error);
        routeSubmitError(error);
      });
    });
  }

  function handleAdminControlClick(event) {
    const trigger = event.target.closest("[data-shared-admin-action]");
    if (!trigger) {
      return;
    }
    const action = safeText(trigger.dataset.sharedAdminAction || "", 40);
    if (action === "save-volunteer-status") {
      updateVolunteerStatus(trigger.dataset.recordId || "").catch(function (error) {
        console.warn("Volunteer status update failed.", error);
        setAdminMessage("Volunteer status update failed. Check your permissions and Firestore rules.", "error");
      });
    }
    if (action === "save-donation-status") {
      updateDonationStatus(trigger.dataset.recordId || "").catch(function (error) {
        console.warn("Donation status update failed.", error);
        setAdminMessage("Donation status update failed. Check your permissions and Firestore rules.", "error");
      });
    }
  }

  function watchVolunteers() {
    clearSubscription("unsubscribeVolunteers");
    state.unsubscribeVolunteers = state.db.collection(VOLUNTEER_COLLECTION).orderBy("updatedAt", "desc").onSnapshot(function (snapshot) {
      state.volunteers = snapshot.docs.map(function (doc) {
        return sanitizeVolunteerProfile(doc.id, doc.data());
      });
      renderVolunteerDirectory();
      renderAdminVolunteerRecords();
      renderAdminSummary();
      prefillVolunteerForm();
      syncVolunteerTopStats();
    }, function (error) {
      console.warn("Volunteer directory feed failed.", error);
      setVolunteerMessage("Volunteer directory could not load right now.", "error");
      setAdminMessage("Volunteer directory feed failed to load.", "error");
    });
  }

  function watchOwnDonations() {
    clearSubscription("unsubscribeOwnDonations");
    state.unsubscribeOwnDonations = state.db.collection(DONATION_COLLECTION).where("ownerUid", "==", state.user.uid).onSnapshot(function (snapshot) {
      state.donations = snapshot.docs.map(function (doc) {
        return sanitizeDonationRecord(doc.id, doc.data());
      }).sort(compareByNewest);
      renderHomeDonationViews();
    }, function (error) {
      console.warn("Own donation feed failed.", error);
      setDonationMessage("Your donation history could not be loaded right now.", "error");
    });
  }

  function watchAdminDonations() {
    clearSubscription("unsubscribeAdminDonations");
    state.unsubscribeAdminDonations = state.db.collection(DONATION_COLLECTION).orderBy("createdAt", "desc").limit(100).onSnapshot(function (snapshot) {
      state.donations = snapshot.docs.map(function (doc) {
        return sanitizeDonationRecord(doc.id, doc.data());
      });
      renderAdminDonationRecords();
      renderAdminSummary();
    }, function (error) {
      console.warn("Admin donation feed failed.", error);
      setAdminMessage("Donation record feed failed to load.", "error");
    });
  }

  async function handleMoneyDonationSubmit() {
    requireSignedIn("Please sign in before submitting a donation record.");
    const formData = new FormData(refs.moneyDonationForm);
    const record = sanitizeDonationPayload("money", {
      donorName: formData.get("donorName"),
      amount: formData.get("amount"),
      paymentMethod: formData.get("paymentMethod"),
      message: formData.get("message")
    });
    if (!record.donorName || record.amount <= 0 || !record.paymentMethod) {
      throw new Error("Please complete donor name, amount, and payment method.");
    }
    await state.db.collection(DONATION_COLLECTION).add(record);
    refs.moneyDonationForm.reset();
    prefillDonationForms();
    setDonationMessage("Money donation saved to the shared ResourceFlow backend.", "success");
  }

  async function handleItemDonationSubmit() {
    requireSignedIn("Please sign in before submitting a donation record.");
    const formData = new FormData(refs.itemDonationForm);
    const record = sanitizeDonationPayload("item", {
      donorName: formData.get("donorName"),
      itemType: formData.get("itemType"),
      quantity: formData.get("quantity"),
      description: formData.get("description"),
      contactDetails: formData.get("contactDetails")
    });
    if (!record.donorName || !record.itemType || record.quantity <= 0 || !record.description || !record.contactDetails) {
      throw new Error("Please complete all item donation fields before saving.");
    }
    await state.db.collection(DONATION_COLLECTION).add(record);
    refs.itemDonationForm.reset();
    prefillDonationForms();
    setDonationMessage("Item donation saved to the shared ResourceFlow backend.", "success");
  }

  async function handleVolunteerProfileSubmit() {
    requireSignedIn("Please sign in before creating a volunteer profile.");
    const formData = new FormData(refs.sharedVolunteerForm);
    const existing = currentVolunteerProfile();
    const record = sanitizeVolunteerPayload({
      id: state.user.uid,
      ownerUid: state.user.uid,
      fullName: formData.get("fullName"),
      ngoGroup: formData.get("ngoGroup"),
      skills: formData.get("skills"),
      phone: formData.get("phone"),
      email: formData.get("email") || currentContactEmail(),
      availability: formData.get("availability"),
      location: formData.get("location"),
      activityStatus: formData.get("activityStatus"),
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    });
    if (!record.fullName || !record.ngoGroup || !record.skills.length || !record.phone || !record.email || !record.availability) {
      throw new Error("Please complete all required volunteer profile fields.");
    }
    await state.db.collection(VOLUNTEER_COLLECTION).doc(state.user.uid).set(record, { merge: true });
    setVolunteerMessage("Shared volunteer profile saved. Other signed-in volunteers can now see it.", "success");
  }

  async function updateVolunteerStatus(recordId) {
    requireManager();
    const select = document.getElementById(domId("volunteer-status-", recordId));
    if (!select) {
      return;
    }
    await state.db.collection(VOLUNTEER_COLLECTION).doc(recordId).set({
      activityStatus: normalizeActivityStatus(select.value),
      updatedAt: new Date().toISOString(),
      updatedBy: currentActor()
    }, { merge: true });
    setAdminMessage("Volunteer activity status updated.", "success");
  }

  async function updateDonationStatus(recordId) {
    requireManager();
    const select = document.getElementById(domId("donation-status-", recordId));
    if (!select) {
      return;
    }
    await state.db.collection(DONATION_COLLECTION).doc(recordId).set({
      status: normalizeDonationStatus(select.value),
      updatedAt: new Date().toISOString(),
      updatedBy: currentActor()
    }, { merge: true });
    setAdminMessage("Donation workflow status updated.", "success");
  }

  function renderHomeDonationViews() {
    renderHomeDonationSummary();
    renderHomeDonationHistory();
    if (refs.donationPortalStatus && state.user) {
      setDonationMessage("Showing " + state.donations.length + " donation record(s) from your signed-in account.", "success");
    }
  }

  function renderHomeDonationSummary() {
    if (!refs.donationSummaryGrid) {
      return;
    }
    if (!state.user) {
      refs.donationSummaryGrid.innerHTML = '<div class="empty-box">Sign in to track your donations and save them into the shared backend.</div>';
      return;
    }

    const moneyTotal = state.donations.reduce(function (sum, item) {
      return sum + (item.kind === "money" ? item.amount : 0);
    }, 0);
    const itemOffers = state.donations.filter(function (item) {
      return item.kind === "item";
    }).length;
    const latestStatus = state.donations.length ? titleCase(state.donations[0].status) : "Waiting";

    refs.donationSummaryGrid.innerHTML = [
      metricCard("My Records", String(state.donations.length), "Donation entries saved under your signed-in account."),
      metricCard("Money Pledged", formatCurrency(moneyTotal), "Money donation records stored in Firestore."),
      metricCard("Item Offers", String(itemOffers), "Item donation submissions waiting for admin handling."),
      metricCard("Latest Status", latestStatus, state.donations.length ? "Most recent donation workflow stage." : "Your next donation will appear here.")
    ].join("");
  }

  function renderHomeDonationHistory() {
    if (!refs.donationHistoryList) {
      return;
    }
    if (!state.user) {
      refs.donationHistoryList.innerHTML = '<div class="empty-box">Sign in to see your saved donation records and status updates.</div>';
      return;
    }
    if (!state.donations.length) {
      refs.donationHistoryList.innerHTML = '<div class="empty-box">No donation records yet. Use the forms above to create the first one.</div>';
      return;
    }
    refs.donationHistoryList.innerHTML = state.donations.map(function (item) {
      return renderDonationCard(item, false);
    }).join("");
  }

  function renderVolunteerDirectory() {
    if (!refs.sharedVolunteerDirectoryList && !refs.sharedVolunteerDirectoryStats) {
      return;
    }
    if (!state.user) {
      renderVolunteerGuestState();
      return;
    }

    const filtered = filterVolunteers(state.volunteers);
    if (refs.sharedVolunteerDirectoryStats) {
      refs.sharedVolunteerDirectoryStats.innerHTML = [
        metricCard("Visible Profiles", String(filtered.length), "Profiles currently matching your filters."),
        metricCard("Active Now", String(filtered.filter(function (item) { return item.activityStatus === "active" || item.activityStatus === "available"; }).length), "Volunteers marked as available or active."),
        metricCard("NGO Groups", String(uniqueCount(filtered.map(function (item) { return item.ngoGroup; }))), "Distinct groups represented in the filtered view."),
        metricCard("Top Skill", titleCase(topSkill(filtered) || "balanced"), filtered.length ? "Most common shared skill in the current results." : "Add volunteer profiles to surface demand patterns.")
      ].join("");
    }

    if (refs.sharedVolunteerDirectoryList) {
      if (!filtered.length) {
        refs.sharedVolunteerDirectoryList.innerHTML = '<div class="empty-box">No volunteer profiles match the current search filters yet.</div>';
      } else {
        refs.sharedVolunteerDirectoryList.innerHTML = filtered.map(function (item) {
          return renderVolunteerCard(item, false);
        }).join("");
      }
    }

    setVolunteerMessage("Showing " + filtered.length + " of " + state.volunteers.length + " shared volunteer profile(s).", "success");
  }

  function renderAdminSummary() {
    if (!refs.adminSharedSummary || !(state.user && isManager())) {
      return;
    }
    const moneyTotal = state.donations.reduce(function (sum, item) {
      return sum + (item.kind === "money" ? item.amount : 0);
    }, 0);
    const activeVolunteers = state.volunteers.filter(function (item) {
      return item.activityStatus === "active" || item.activityStatus === "available" || item.activityStatus === "on call";
    }).length;
    const pendingDonations = state.donations.filter(function (item) {
      return item.status === "submitted" || item.status === "reviewing" || item.status === "scheduled";
    }).length;

    refs.adminSharedSummary.innerHTML = [
      metricCard("Volunteer Profiles", String(state.volunteers.length), "Shared directory entries stored in Firestore."),
      metricCard("Active Volunteers", String(activeVolunteers), "Volunteers available, on call, or actively engaged."),
      metricCard("Donation Records", String(state.donations.length), "Money and item donations in the admin queue."),
      metricCard("Money Logged", formatCurrency(moneyTotal), "Total money donation value currently recorded."),
      metricCard("Item Offers", String(state.donations.filter(function (item) { return item.kind === "item"; }).length), "Item donation entries available for coordination."),
      metricCard("Needs Review", String(pendingDonations), "Donation records still moving through review or scheduling.")
    ].join("");

    setAdminMessage(
      "Managing " + state.volunteers.length + " volunteer profile(s) and " + state.donations.length + " donation record(s).",
      "success"
    );

    renderAdminStatusBoards();
  }

  function renderAdminVolunteerRecords() {
    if (!refs.adminVolunteerRecords) {
      return;
    }
    if (!(state.user && isManager())) {
      refs.adminVolunteerRecords.innerHTML = '<div class="empty-box">Admin or coordinator access is required to manage volunteer records.</div>';
      return;
    }
    if (!state.volunteers.length) {
      refs.adminVolunteerRecords.innerHTML = '<div class="empty-box">No shared volunteer profiles have been saved yet.</div>';
      return;
    }
    refs.adminVolunteerRecords.innerHTML = state.volunteers.map(function (item) {
      return renderVolunteerCard(item, true);
    }).join("");
  }

  function renderAdminDonationRecords() {
    if (!refs.adminDonationRecords) {
      return;
    }
    if (!(state.user && isManager())) {
      refs.adminDonationRecords.innerHTML = '<div class="empty-box">Admin or coordinator access is required to manage donation records.</div>';
      return;
    }
    if (!state.donations.length) {
      refs.adminDonationRecords.innerHTML = '<div class="empty-box">No donation records have been saved yet.</div>';
      return;
    }
    refs.adminDonationRecords.innerHTML = state.donations.map(function (item) {
      return renderDonationCard(item, true);
    }).join("");
  }

  function renderAdminStatusBoards() {
    const volunteerBoard = document.getElementById("adminVolunteerStatusBoard");
    const donationBoard = document.getElementById("adminDonationStatusBoard");
    if (volunteerBoard) {
      const volunteerCounts = buildStatusCounts(state.volunteers.map(function (item) {
        return item.activityStatus;
      }), VOLUNTEER_ACTIVITY_OPTIONS);
      volunteerBoard.innerHTML = volunteerCounts.map(function (item) {
        return metricCard(titleCase(item.label), String(item.count), "Volunteer activity status");
      }).join("");
    }
    if (donationBoard) {
      const donationCounts = buildStatusCounts(state.donations.map(function (item) {
        return item.status;
      }), DONATION_STATUS_OPTIONS);
      donationBoard.innerHTML = donationCounts.map(function (item) {
        return metricCard(titleCase(item.label), String(item.count), "Donation workflow status");
      }).join("");
    }
  }

  function renderDonationGuestState() {
    if (refs.donationSummaryGrid) {
      refs.donationSummaryGrid.innerHTML = '<div class="empty-box">Sign in to record donations in the shared backend and monitor their status.</div>';
    }
    if (refs.donationHistoryList) {
      refs.donationHistoryList.innerHTML = '<div class="empty-box">Your donation records will appear here after sign-in.</div>';
    }
    setDonationMessage("Sign in to save donation records to the shared Firestore backend.", "error");
  }

  function renderVolunteerGuestState() {
    if (refs.sharedVolunteerDirectoryStats) {
      refs.sharedVolunteerDirectoryStats.innerHTML = '<div class="empty-box">Sign in to load the shared volunteer directory and save your own profile.</div>';
    }
    if (refs.sharedVolunteerDirectoryList) {
      refs.sharedVolunteerDirectoryList.innerHTML = '<div class="empty-box">The shared volunteer directory becomes visible after sign-in.</div>';
    }
    setVolunteerMessage("Sign in to create your profile and view other volunteers from the shared backend.", "error");
  }

  function renderAdminLockedState() {
    if (refs.adminSharedSummary) {
      refs.adminSharedSummary.innerHTML = '<div class="empty-box">Admin or coordinator access is required to read shared volunteer and donation records.</div>';
    }
    if (refs.adminVolunteerRecords) {
      refs.adminVolunteerRecords.innerHTML = '<div class="empty-box">Shared volunteer management is locked until an admin or coordinator signs in.</div>';
    }
    if (refs.adminDonationRecords) {
      refs.adminDonationRecords.innerHTML = '<div class="empty-box">Shared donation management is locked until an admin or coordinator signs in.</div>';
    }
    const volunteerBoard = document.getElementById("adminVolunteerStatusBoard");
    const donationBoard = document.getElementById("adminDonationStatusBoard");
    if (volunteerBoard) {
      volunteerBoard.innerHTML = '<div class="empty-box">Volunteer activity status becomes visible for admin or coordinator sessions.</div>';
    }
    if (donationBoard) {
      donationBoard.innerHTML = '<div class="empty-box">Donation workflow status becomes visible for admin or coordinator sessions.</div>';
    }
    setAdminMessage("Admin or coordinator access is required for shared data management.", "error");
  }

  function renderFatalError(message) {
    if (refs.donationPortalStatus) {
      setDonationMessage(message, "error");
    }
    if (refs.sharedVolunteerStatus) {
      setVolunteerMessage(message, "error");
    }
    if (refs.sharedAdminStatus) {
      setAdminMessage(message, "error");
    }
  }

  function routeSubmitError(error) {
    const message = error && error.message ? error.message : "The shared backend request failed.";
    if (refs.page === "home" || refs.page === "donations") {
      setDonationMessage(message, "error");
      return;
    }
    if (refs.page === "volunteer" || refs.page === "directory") {
      setVolunteerMessage(message, "error");
      return;
    }
    setAdminMessage(message, "error");
  }

  function renderVolunteerCard(item, includeAdminControls) {
    const skills = item.skills.map(function (skill) {
      return renderChip(titleCase(skill));
    }).join("");
    const details = [
      renderDetailItem("NGO Group", item.ngoGroup || "Not shared"),
      renderDetailItem("Skills", item.skills.length ? item.skills.map(titleCase).join(", ") : "Not shared"),
      renderDetailItem("Availability", item.availability || "Not shared"),
      renderDetailItem("Contact", [item.email, item.phone].filter(Boolean).join(" | ") || "Not shared"),
      renderDetailItem("Status", titleCase(item.activityStatus || "available"))
    ];
    if (item.location) {
      details.push(renderDetailItem("Location", item.location));
    }
    const controls = includeAdminControls ? [
      '<div class="button-row compact-controls shared-admin-controls">',
      '<label class="inline-select">',
      "<span>Status</span>",
      '<select id="' + escapeHtml(domId("volunteer-status-", item.id)) + '">',
      VOLUNTEER_ACTIVITY_OPTIONS.map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (option === item.activityStatus ? " selected" : "") + ">" + escapeHtml(titleCase(option)) + "</option>";
      }).join(""),
      "</select>",
      "</label>",
      '<button class="ghost-button" type="button" data-shared-admin-action="save-volunteer-status" data-record-id="' + escapeHtml(item.id) + '">Save Status</button>',
      "</div>"
    ].join("") : "";

    return [
      '<div class="stack-card shared-record-card">',
      '<div class="shared-card-head">',
      "<strong>" + escapeHtml(item.fullName) + "</strong>",
      renderRecordStatusPill(item.activityStatus, "volunteer"),
      "</div>",
      '<p class="card-meta shared-subtitle">Volunteer profile' + (item.ngoGroup ? " - " + escapeHtml(item.ngoGroup) : "") + "</p>",
      '<div class="shared-detail-grid">' + details.join("") + "</div>",
      '<div class="shared-divider"></div>',
      '<div class="chip-row">' + skills + (item.location ? renderChip(item.location) : "") + "</div>",
      controls,
      "</div>"
    ].join("");
  }

  function renderDonationCard(item, includeAdminControls) {
    const headline = item.kind === "money"
      ? formatCurrency(item.amount) + " via " + (item.paymentMethod || "manual")
      : titleCase(item.itemType || "Item") + " x" + item.quantity;
    const description = item.kind === "money"
      ? (item.message || "No donor note added.")
      : (item.description || "No item description added.");
    const details = item.kind === "money"
      ? [
          renderDetailItem("Donation Type", "Money"),
          renderDetailItem("Amount", formatCurrency(item.amount)),
          renderDetailItem("Payment", item.paymentMethod || "Manual"),
          renderDetailItem("Contact", item.ownerEmail || "Not shared"),
          renderDetailItem("Status", titleCase(item.status || "submitted"))
        ]
      : [
          renderDetailItem("Donation Type", titleCase(item.itemType || "Item")),
          renderDetailItem("Quantity", String(item.quantity || 0)),
          renderDetailItem("Contact", item.contactDetails || item.ownerEmail || "Not shared"),
          renderDetailItem("Status", titleCase(item.status))
        ];
    const controls = includeAdminControls ? [
      '<div class="button-row compact-controls shared-admin-controls">',
      '<label class="inline-select">',
      "<span>Status</span>",
      '<select id="' + escapeHtml(domId("donation-status-", item.id)) + '">',
      DONATION_STATUS_OPTIONS.map(function (option) {
        return '<option value="' + escapeHtml(option) + '"' + (option === item.status ? " selected" : "") + ">" + escapeHtml(titleCase(option)) + "</option>";
      }).join(""),
      "</select>",
      "</label>",
      '<button class="ghost-button" type="button" data-shared-admin-action="save-donation-status" data-record-id="' + escapeHtml(item.id) + '">Save Status</button>',
      "</div>"
    ].join("") : "";

    return [
      '<div class="stack-card shared-record-card">',
      '<div class="shared-card-head">',
      "<strong>" + escapeHtml(item.donorName) + "</strong>",
      renderRecordStatusPill(item.status, "donation"),
      "</div>",
      '<p class="card-meta shared-subtitle">' + escapeHtml(headline) + "</p>",
      '<div class="shared-detail-grid">' + details.join("") + "</div>",
      '<div class="shared-divider"></div>',
      '<div class="chip-row">' + renderChip(titleCase(item.kind)) + renderChip(formatShortDate(item.createdAt)) + "</div>",
      '<p class="card-meta">' + escapeHtml(description) + "</p>",
      controls,
      "</div>"
    ].join("");
  }

  function renderDetailItem(label, value) {
    return [
      '<div class="shared-detail-item">',
      '<span class="shared-detail-label">' + escapeHtml(label) + "</span>",
      "<strong class=\"shared-detail-value\">" + escapeHtml(value || "Not shared") + "</strong>",
      "</div>"
    ].join("");
  }

  function renderRecordStatusPill(status, type) {
    const normalized = normalizeText(status || "tracked");
    const tone = /(active|available|approved|delivered|closed|completed)/.test(normalized)
      ? "success"
      : /(submitted|reviewing|pending|scheduled|on call|queued|draft)/.test(normalized)
        ? "pending"
        : /(rejected|archived|cancelled|unavailable|inactive)/.test(normalized)
          ? "muted"
          : (type === "volunteer" ? "success" : "pending");
    return '<span class="record-status-pill record-status-pill-' + tone + '">' + escapeHtml(titleCase(status || "tracked")) + "</span>";
  }

  function syncVolunteerTopStats() {
    const countNode = document.getElementById("volunteerStatCount");
    const countTextNode = document.getElementById("volunteerStatCountText");
    const focusNode = document.getElementById("volunteerStatFocus");
    const focusTextNode = document.getElementById("volunteerStatFocusText");
    const readinessNode = document.getElementById("volunteerStatReadiness");
    const readinessTextNode = document.getElementById("volunteerStatReadinessText");

    if (countNode) {
      countNode.textContent = String(state.volunteers.length);
    }
    if (countTextNode) {
      countTextNode.textContent = state.user
        ? "Profiles visible in the shared Firestore volunteer directory."
        : "Sign in to load the shared Firestore volunteer directory.";
    }
    if (focusNode) {
      focusNode.textContent = titleCase(topSkill(state.volunteers) || "balanced");
    }
    if (focusTextNode) {
      focusTextNode.textContent = state.volunteers.length
        ? "Most common skill focus across visible volunteer profiles."
        : "The top skill focus will appear once profiles are saved.";
    }
    if (readinessNode) {
      readinessNode.textContent = state.user ? "Cloud Ready" : "Guest";
    }
    if (readinessTextNode) {
      readinessTextNode.textContent = state.user
        ? "Your profile and the shared directory are backed by Firestore."
        : "Sign in to save profiles into the shared backend.";
    }
  }

  function sanitizeVolunteerProfile(id, input) {
    const next = input && typeof input === "object" ? input : {};
    return {
      id: safeText(id || next.id || "", 120),
      ownerUid: safeText(next.ownerUid || "", 120),
      fullName: safeText(next.fullName || "Volunteer", 120),
      ngoGroup: safeText(next.ngoGroup || "Independent", 140),
      skills: parseList(next.skills),
      phone: safeText(next.phone || "", 40),
      email: safeText(next.email || "", 140),
      availability: safeText(next.availability || "Flexible", 60),
      location: safeText(next.location || "", 140),
      activityStatus: normalizeActivityStatus(next.activityStatus || "available"),
      createdAt: safeIso(next.createdAt),
      updatedAt: safeIso(next.updatedAt),
      updatedBy: safeText(next.updatedBy || "", 140)
    };
  }

  function sanitizeVolunteerPayload(input) {
    const next = input && typeof input === "object" ? input : {};
    const now = new Date().toISOString();
    return {
      id: safeText(next.id || (state.user ? state.user.uid : ""), 120),
      ownerUid: safeText(next.ownerUid || (state.user ? state.user.uid : ""), 120),
      fullName: safeText(next.fullName, 120),
      ngoGroup: safeText(next.ngoGroup, 140),
      skills: parseList(next.skills),
      phone: safeText(next.phone, 40),
      email: safeText(next.email || currentContactEmail(), 140),
      availability: safeText(next.availability, 60),
      location: safeText(next.location, 140),
      activityStatus: normalizeActivityStatus(next.activityStatus || "available"),
      createdAt: safeIso(next.createdAt || now),
      updatedAt: now,
      updatedBy: currentActor()
    };
  }

  function sanitizeDonationRecord(id, input) {
    const next = input && typeof input === "object" ? input : {};
    return {
      id: safeText(id, 120),
      ownerUid: safeText(next.ownerUid || "", 120),
      ownerEmail: safeText(next.ownerEmail || "", 140),
      donorName: safeText(next.donorName || "Donor", 120),
      kind: next.kind === "money" ? "money" : "item",
      amount: safeInteger(next.amount, 0),
      paymentMethod: safeText(next.paymentMethod || "", 60),
      message: safeText(next.message || "", 280),
      itemType: safeText(next.itemType || "", 80),
      quantity: safeInteger(next.quantity, 0),
      description: safeText(next.description || "", 280),
      contactDetails: safeText(next.contactDetails || next.ownerEmail || "", 180),
      status: normalizeDonationStatus(next.status || "submitted"),
      createdAt: safeIso(next.createdAt),
      updatedAt: safeIso(next.updatedAt),
      updatedBy: safeText(next.updatedBy || "", 140)
    };
  }

  function sanitizeDonationPayload(kind, input) {
    const next = input && typeof input === "object" ? input : {};
    const now = new Date().toISOString();
    const normalizedKind = kind === "money" ? "money" : "item";
    return {
      ownerUid: safeText(state.user && state.user.uid ? state.user.uid : "", 120),
      ownerEmail: currentContactEmail(),
      donorName: safeText(next.donorName, 120),
      kind: normalizedKind,
      amount: normalizedKind === "money" ? safeInteger(next.amount, 0) : 0,
      paymentMethod: normalizedKind === "money" ? safeText(next.paymentMethod, 60) : "",
      message: normalizedKind === "money" ? safeText(next.message, 280) : "",
      itemType: normalizedKind === "item" ? safeText(next.itemType, 80) : "",
      quantity: normalizedKind === "item" ? safeInteger(next.quantity, 0) : 0,
      description: normalizedKind === "item" ? safeText(next.description, 280) : "",
      contactDetails: normalizedKind === "item" ? safeText(next.contactDetails || currentContactEmail(), 180) : currentContactEmail(),
      status: "submitted",
      createdAt: now,
      updatedAt: now,
      updatedBy: currentActor()
    };
  }

  function filterVolunteers(items) {
    const search = normalizeText(valueOf(refs.sharedVolunteerSearch));
    const skill = normalizeText(valueOf(refs.sharedVolunteerSkillFilter));
    const ngo = normalizeText(valueOf(refs.sharedVolunteerNgoFilter));
    const location = normalizeText(valueOf(refs.sharedVolunteerLocationFilter));

    return items.filter(function (item) {
      const haystack = normalizeText([
        item.fullName,
        item.ngoGroup,
        item.email,
        item.phone,
        item.location,
        item.availability,
        item.activityStatus,
        item.skills.join(" ")
      ].join(" "));
      const skillText = normalizeText(item.skills.join(" "));
      return (!search || haystack.indexOf(search) >= 0)
        && (!skill || skillText.indexOf(skill) >= 0)
        && (!ngo || normalizeText(item.ngoGroup).indexOf(ngo) >= 0)
        && (!location || normalizeText(item.location).indexOf(location) >= 0);
    });
  }

  function clearRealtimeSubscriptions() {
    clearSubscription("unsubscribeVolunteers");
    clearSubscription("unsubscribeOwnDonations");
    clearSubscription("unsubscribeAdminDonations");
  }

  function clearSubscription(key) {
    if (typeof state[key] === "function") {
      state[key]();
    }
    state[key] = null;
  }

  function requireSignedIn(message) {
    if (!state.user) {
      throw new Error(message || "Sign in is required.");
    }
  }

  function requireManager() {
    requireSignedIn("Admin or coordinator access is required.");
    if (!isManager()) {
      throw new Error("Admin or coordinator access is required.");
    }
  }

  function isManager() {
    const role = normalizeRole(state.profile && (state.profile.role || state.profile.requestedRole || ""));
    return ADMIN_ROLES.indexOf(role) >= 0 || isConfiguredAdminEmail(currentContactEmail());
  }

  function isConfiguredAdminEmail(email) {
    const config = getFirebaseConfig();
    const current = normalizeText(email);
    return Array.isArray(config.adminEmails)
      && config.adminEmails.some(function (item) {
        return normalizeText(item) === current;
      });
  }

  function setDonationMessage(message, tone) {
    if (refs.donationPortalStatus) {
      setBoxTone(refs.donationPortalStatus, tone);
      refs.donationPortalStatus.textContent = message;
    }
  }

  function setVolunteerMessage(message, tone) {
    if (refs.sharedVolunteerStatus) {
      setBoxTone(refs.sharedVolunteerStatus, tone);
      refs.sharedVolunteerStatus.textContent = message;
    }
  }

  function setAdminMessage(message, tone) {
    if (refs.sharedAdminStatus) {
      setBoxTone(refs.sharedAdminStatus, tone);
      refs.sharedAdminStatus.textContent = message;
    }
  }

  function setBoxTone(node, tone) {
    if (!node) {
      return;
    }
    node.classList.remove("shared-status-error", "shared-status-success");
    if (tone === "error") {
      node.classList.add("shared-status-error");
    }
    if (tone === "success") {
      node.classList.add("shared-status-success");
    }
  }

  function setFormDisabled(form, disabled) {
    if (!form) {
      return;
    }
    form.classList.toggle("is-disabled", Boolean(disabled));
    Array.from(form.querySelectorAll("input, select, textarea, button")).forEach(function (field) {
      field.disabled = Boolean(disabled);
    });
  }

  function fillIfBlank(field, value) {
    if (!field) {
      return;
    }
    const nextValue = String(value || "");
    if (!nextValue || String(field.value || "").trim()) {
      return;
    }
    field.value = nextValue;
  }

  function currentDisplayName() {
    if (state.user && safeText(state.user.displayName || "", 120)) {
      return safeText(state.user.displayName, 120);
    }
    if (state.profile && safeText(state.profile.displayName || "", 120)) {
      return safeText(state.profile.displayName, 120);
    }
    const email = currentContactEmail();
    return email ? titleCase(email.split("@")[0].replace(/[._-]+/g, " ")) : "ResourceFlow User";
  }

  function currentContactEmail() {
    return safeText(
      state.user && state.user.email
        ? state.user.email
        : (state.profile && state.profile.email ? state.profile.email : ""),
      140
    );
  }

  function currentActor() {
    return currentContactEmail() || currentDisplayName() || "resourceflow-shared";
  }

  function loadPortalProfile(portal) {
    try {
      const raw = localStorage.getItem("resourceflow-portal-profile-v2");
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" && parsed[portal] ? parsed[portal] : {};
    } catch (error) {
      return {};
    }
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

  async function ensureFirebaseScripts() {
    for (const url of FIREBASE_SCRIPTS) {
      await loadScript(url);
    }
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-shared-src="' + url + '"]');
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
      script.dataset.sharedSrc = url;
      script.onload = function () {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

function metricCard(label, value, text) {
  return [
    '<article class="stat-card shared-metric-card">',
    '<span class="shared-metric-label">' + escapeHtml(label) + "</span>",
    "<strong class=\"shared-metric-value\">" + escapeHtml(value) + "</strong>",
    "<small class=\"shared-metric-meta\">" + escapeHtml(text) + "</small>",
    "</article>"
  ].join("");
}

  function renderChip(value) {
    return '<span class="chip">' + escapeHtml(value) + "</span>";
  }

  function topSkill(items) {
    const counts = {};
    items.forEach(function (item) {
      item.skills.forEach(function (skill) {
        const key = normalizeText(skill);
        if (!key) {
          return;
        }
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.keys(counts).sort(function (left, right) {
      return counts[right] - counts[left];
    })[0] || "";
  }

  function parseList(value) {
    const list = Array.isArray(value) ? value : String(value || "").split(",");
    const unique = [];
    list.forEach(function (item) {
      const cleaned = safeText(item, 48).toLowerCase();
      if (cleaned && unique.indexOf(cleaned) < 0) {
        unique.push(cleaned);
      }
    });
    return unique.slice(0, 10);
  }

  function joinSkills(value) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return safeText(value || "", 180);
  }

  function normalizeText(value) {
    return safeText(value || "", 400).toLowerCase();
  }

  function normalizeRole(value) {
    const role = normalizeText(value);
    return role || "user";
  }

  function normalizeActivityStatus(value) {
    const normalized = normalizeText(String(value || "").replace(/\s+/g, " "));
    return VOLUNTEER_ACTIVITY_OPTIONS.indexOf(normalized) >= 0 ? normalized : "available";
  }

  function normalizeDonationStatus(value) {
    const normalized = normalizeText(value);
    return DONATION_STATUS_OPTIONS.indexOf(normalized) >= 0 ? normalized : "submitted";
  }

  function safeText(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 180);
  }

  function safeInteger(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return typeof fallback === "number" ? fallback : 0;
    }
    return Math.max(0, Math.round(numeric));
  }

  function safeIso(value) {
    const date = new Date(value || new Date().toISOString());
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function valueOf(field) {
    return field && typeof field.value !== "undefined" ? field.value : "";
  }

  function compareByNewest(left, right) {
    return String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || ""));
  }

  function uniqueCount(values) {
    const map = {};
    values.forEach(function (item) {
      const key = normalizeText(item);
      if (key) {
        map[key] = true;
      }
    });
    return Object.keys(map).length;
  }

  function buildStatusCounts(values, options) {
    const counts = {};
    options.forEach(function (option) {
      counts[option] = 0;
    });
    values.forEach(function (value) {
      const key = normalizeText(value);
      if (Object.prototype.hasOwnProperty.call(counts, key)) {
        counts[key] += 1;
      }
    });
    return options.map(function (option) {
      return {
        label: option,
        count: counts[option] || 0
      };
    });
  }

  function domId(prefix, value) {
    return prefix + String(value || "").replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  function formatCurrency(value) {
    const amount = safeInteger(value, 0);
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      return "INR " + amount;
    }
  }

  function formatShortDate(value) {
    const date = new Date(value || new Date().toISOString());
    if (Number.isNaN(date.getTime())) {
      return "Today";
    }
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short"
      }).format(date);
    } catch (error) {
      return date.toISOString().slice(0, 10);
    }
  }

  function titleCase(value) {
    return String(value || "").replace(/\b\w/g, function (character) {
      return character.toUpperCase();
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getFirebaseConfig() {
    return window.RESOURCEFLOW_FIREBASE_CONFIG || {};
  }
})();
