(function () {
  const PORTAL_SELECTION_KEY = "resourceflow-portal-selection-v2";
  const PORTAL_PROFILE_KEY = "resourceflow-portal-profile-v2";
  const DEMO_AUTH_KEY = "resourceflow-demo-auth-v1";
  const ENTRY_PROFILE_KEY = "resourceflow-entry-profile-v1";
  const PORTAL_HANDOFF_KEY = "resourceflow-portal-handoff-v1";
  const FIREBASE_SDK_VERSION = "10.12.5";
  const FIREBASE_AUTH_SCRIPTS = [
    "https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-auth-compat.js"
  ];
  const FIREBASE_FIRESTORE_SCRIPT = "https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VERSION + "/firebase-firestore-compat.js";

  const PORTAL_ROUTES = {
    user: "./overview.html",
    volunteer: "./volunteer.html",
    government: "./operations.html",
    admin: "./admin.html"
  };

  const ZONE_OPTIONS = ["North", "South", "East", "West", "Central"];

  const PORTAL_SETUP_CONFIG = {
    user: {
      title: "Community setup",
      text: "Tell us what kind of community access you need.",
      fields: [
        { name: "locality", label: "Locality", type: "text", placeholder: "Salt Lake, Kolkata", required: true },
        { name: "preferredLanguage", label: "Preferred language", type: "select", required: true, options: ["English", "Hindi", "Bengali", "Hinglish"] },
        { name: "interest", label: "Main purpose", type: "select", required: true, options: ["View updates", "Track aid progress", "Request support"] }
      ]
    },
    volunteer: {
      title: "Volunteer setup",
      text: "Tell us where you can help and when you are available.",
      fields: [
        { name: "district", label: "Primary district", type: "select", required: true, options: ZONE_OPTIONS },
        { name: "location", label: "Location", type: "text", placeholder: "Tollygunge, Kolkata", required: true },
        { name: "ngoGroup", label: "NGO group", type: "text", placeholder: "Seva Relief Collective", required: true },
        { name: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210", required: true },
        { name: "availability", label: "Availability", type: "select", required: true, options: ["Full Day", "Half Day", "Evening", "Weekend"] },
        { name: "skills", label: "Skills", type: "text", placeholder: "first aid, coordination, driving", required: true },
        { name: "languages", label: "Languages", type: "text", placeholder: "English, Hindi, Bengali", required: true },
        { name: "transport", label: "Transport", type: "select", required: true, options: ["Yes", "No"] }
      ]
    },
    government: {
      title: "Government operator setup",
      text: "Tell us your department, district, and operating capacity.",
      fields: [
        { name: "department", label: "Department", type: "text", placeholder: "Disaster Management Cell", required: true },
        { name: "designation", label: "Designation", type: "text", placeholder: "Field Operations Officer", required: true },
        { name: "district", label: "Primary district", type: "select", required: true, options: ZONE_OPTIONS },
        { name: "officeLocation", label: "Office location", type: "text", placeholder: "District coordination office", required: true },
        { name: "shift", label: "Shift", type: "select", required: true, options: ["Morning", "Afternoon", "Evening", "24/7 Rotation"] },
        { name: "teamSize", label: "Team size", type: "select", required: true, options: ["1-5", "6-10", "11-20", "20+"] }
      ]
    },
    admin: {
      title: "Admin setup",
      text: "Confirm the organization and oversight district for this admin session.",
      fields: [
        { name: "organization", label: "Organization", type: "text", placeholder: "ResourceFlow Governance Team", required: true },
        { name: "responsibility", label: "Responsibility", type: "text", placeholder: "Platform governance and approvals", required: true },
        { name: "oversightZone", label: "Oversight district", type: "select", required: true, options: ["All Districts"].concat(ZONE_OPTIONS) }
      ]
    }
  };

  const DEMO_PROFILES = {
    user: {
      role: "user",
      displayName: "Aditi Das",
      email: "user@resourceflow.demo",
      title: "Community User"
    },
    volunteer: {
      role: "volunteer",
      displayName: "Sana Patel",
      email: "volunteer@resourceflow.demo",
      title: "Volunteer Responder"
    },
    government: {
      role: "government",
      displayName: "Ravi Sen",
      email: "gov@resourceflow.demo",
      title: "Government Officer"
    },
    admin: {
      role: "admin",
      displayName: "Shri Sundaram",
      email: "acshrisundaram@gmail.com",
      title: "Platform Admin"
    }
  };

  const state = {
    mode: "signin",
    firebaseReady: false,
    authReady: false,
    firestoreReady: false,
    loading: false,
    booting: false,
    initPromise: null,
    firestorePromise: null,
    auth: null,
    db: null,
    user: null,
    demoMode: false,
    activePortal: "",
    portalTransitioning: false
  };

  const refs = {};

  document.addEventListener("DOMContentLoaded", function () {
    cacheRefs();
    bindEvents();
    ensureInteractiveTestIds(document);
    observeInteractiveTestIds();
    setMode("signin");
    setStatus("Secure access screen is ready. Sign in can start in a moment.", "info");
    initializeFirebase();
  });

  function cacheRefs() {
    refs.authStage = document.getElementById("authStage");
    refs.portalStage = document.getElementById("portalStage");
    refs.status = document.getElementById("entryStatus");
    refs.portalStatus = document.getElementById("portalStatus");
    refs.form = document.getElementById("entryAuthForm");
    refs.submit = document.getElementById("entrySubmitButton");
    refs.googleButton = document.getElementById("entryGoogleButton");
    refs.demoButton = document.getElementById("entryDemoButton");
    refs.helpText = document.getElementById("entryHelpText");
    refs.signupFields = document.getElementById("signupFields");
    refs.passwordField = document.getElementById("passwordField");
    refs.emailInput = document.getElementById("entryEmailInput");
    refs.passwordInput = document.getElementById("entryPasswordInput");
    refs.nameInput = document.getElementById("entryNameInput");
    refs.locationInput = document.getElementById("entryLocationInput");
    refs.portalButtons = Array.from(document.querySelectorAll("[data-portal]"));
    refs.portalGrid = document.getElementById("portalGrid");
    refs.portalUserLabel = document.getElementById("portalUserLabel");
    refs.portalUserMeta = document.getElementById("portalUserMeta");
    refs.portalLead = document.getElementById("portalLead");
    refs.portalSetupPanel = document.getElementById("portalSetupPanel");
    refs.portalSetupTitle = document.getElementById("portalSetupTitle");
    refs.portalSetupLead = document.getElementById("portalSetupLead");
    refs.portalSetupStatus = document.getElementById("portalSetupStatus");
    refs.portalSetupFields = document.getElementById("portalSetupFields");
    refs.portalSetupForm = document.getElementById("portalSetupForm");
    refs.portalSetupSubmit = document.getElementById("portalSetupSubmit");
    refs.portalSetupBack = document.getElementById("portalSetupBack");
    refs.modeButtons = Array.from(document.querySelectorAll("[data-auth-mode]"));
    refs.signOutButton = document.getElementById("entrySignOutButton");
  }

  function bindEvents() {
    refs.modeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setMode(button.dataset.authMode || "signin");
      });
    });

    refs.form.addEventListener("submit", handleSubmit);
    refs.googleButton.addEventListener("click", handleGoogleSignIn);
    refs.demoButton.addEventListener("click", handleDemoPreview);
    refs.signOutButton.addEventListener("click", handleSignOut);
    refs.portalSetupForm.addEventListener("submit", handlePortalSetupSubmit);
    refs.portalSetupBack.addEventListener("click", function () {
      state.activePortal = "";
      if (refs.portalGrid) {
        refs.portalGrid.hidden = false;
      }
      refs.portalSetupPanel.hidden = true;
      setPortalStatus("Choose a portal to continue.", "info");
    });
    refs.portalButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        openPortalSetup(button.dataset.portal || "user");
      });
    });
  }

  function setMode(mode) {
    state.mode = normalizeRole(mode === "signup" || mode === "reset" ? mode : "signin");
    const signupActive = state.mode === "signup";
    const resetActive = state.mode === "reset";

    refs.modeButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.authMode === state.mode);
    });

    refs.signupFields.hidden = !signupActive;
    refs.passwordField.hidden = resetActive;
    refs.nameInput.required = signupActive;
    refs.locationInput.required = signupActive;
    refs.passwordInput.required = !resetActive;
    refs.passwordInput.autocomplete = signupActive ? "new-password" : "current-password";
    refs.submit.textContent = resetActive ? "Send Reset Link" : (signupActive ? "Create Account" : "Sign In");
    refs.helpText.textContent = resetActive
      ? "Enter the email address that should receive a password reset link."
      : (signupActive
        ? "Create your account first. After login, you will choose your portal."
        : "Use your existing ResourceFlow account to continue, or switch to Create Account if you are new.");
    setStatus(
      resetActive
        ? "Use Reset if you forgot your password."
        : (signupActive ? "Create your new ResourceFlow account below." : "Sign in with your existing account to continue."),
      "info"
    );
  }

  async function initializeFirebase() {
    if (state.initPromise) {
      return state.initPromise;
    }

    state.booting = true;
    state.initPromise = (async function () {
      try {
        await loadAuthScripts();
        const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
        if (!config.enabled || !config.enableAuth) {
          throw new Error("Authentication is disabled in this project.");
        }

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

        state.auth = window.firebase.auth();
        await state.auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
        state.authReady = true;
        state.firebaseReady = true;
        setStatus("Sign in with your existing account to continue.", "info");

        state.auth.onAuthStateChanged(function (user) {
          state.user = user || null;
          state.demoMode = false;
          clearDemoSession();
          if (state.portalTransitioning) {
            return;
          }
          if (user) {
            const immediateProfile = buildEntryProfile(user);
            showPortalStage(immediateProfile);
            setLoading(false);
            ensureUserProfile(user).then(function (profile) {
              if (state.portalTransitioning) {
                return;
              }
              showPortalStage(profile || immediateProfile);
            }).catch(function (error) {
              console.warn("Profile bootstrap failed.", error);
              if (state.portalTransitioning) {
                return;
              }
              showPortalStage(immediateProfile);
              setPortalStatus("Sign in worked, but profile sync is still catching up. You can continue and choose a portal.", "error");
            });
          } else {
            showAuthStage();
            setLoading(false);
          }
        });
      } catch (error) {
        console.warn("Entry auth initialization failed.", error);
        setStatus(formatAuthError(error), "error");
        setLoading(false);
        throw error;
      } finally {
        state.booting = false;
      }
    })();

    return state.initPromise;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.loading) {
      return;
    }

    const email = safeValue(refs.emailInput.value);
    const password = refs.passwordField.hidden ? "" : refs.passwordInput.value;
    const displayName = safeValue(refs.nameInput.value);
    const location = safeValue(refs.locationInput.value);

    try {
      setLoading(true);
      await ensureAuthReady();

      if (state.mode === "signup") {
        if (!email || !password || !displayName || !location) {
          throw new Error("Please enter your name, location, email, and password to create an account.");
        }
        const credential = await state.auth.createUserWithEmailAndPassword(email, password);
        if (credential.user && typeof credential.user.updateProfile === "function") {
          await credential.user.updateProfile({ displayName: displayName });
        }
        persistEntryProfile({
          displayName: displayName,
          location: location,
          email: email
        });
        if (credential.user) {
          activatePortalSelection(credential.user, {
            displayName: displayName,
            location: location,
            role: resolveDefaultRole(email),
            requestedRole: resolveDefaultRole(email)
          });
        } else {
          setStatus("Account created successfully. Choose your portal next.", "success");
          setLoading(false);
        }
        refs.form.reset();
        return;
      }

      if (state.mode === "reset") {
        if (!email) {
          throw new Error("Enter the email address that should receive the reset link.");
        }
        await state.auth.sendPasswordResetEmail(email);
        setStatus("Password reset email sent. Check your inbox and then come back to sign in.", "success");
        setLoading(false);
        return;
      }

      if (!email || !password) {
        throw new Error("Enter your email and password to sign in.");
      }
      const credential = await state.auth.signInWithEmailAndPassword(email, password);
      if (credential.user) {
        activatePortalSelection(credential.user);
      } else {
        setStatus("Sign in successful. Choose your portal next.", "success");
        setLoading(false);
      }
    } catch (error) {
      setStatus(formatAuthError(error), "error");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (state.loading) {
      return;
    }

    try {
      setLoading(true);
      await ensureAuthReady();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      setStatus("Opening Google sign-in...", "info");
      const credential = await state.auth.signInWithPopup(provider);
      if (credential.user) {
        activatePortalSelection(credential.user);
      } else {
        setStatus("Google sign-in successful. Choose your portal next.", "success");
        setLoading(false);
      }
    } catch (error) {
      setStatus(formatAuthError(error), "error");
      setLoading(false);
    }
  }

  function handleDemoPreview() {
    state.portalTransitioning = false;
    state.demoMode = true;
    state.user = null;
    showPortalStage({
      displayName: "Demo visitor",
      email: "demo@resourceflow.local",
      role: "user"
    });
    refs.portalLead.textContent = "Preview the product quickly with demo data, then choose a portal below.";
    setPortalStatus("Choose a portal to open the demo workspace.", "success");
  }

  function openPortalSetup(portal) {
    const selectedPortal = normalizePortal(portal);
    const config = PORTAL_SETUP_CONFIG[selectedPortal];
    if (!selectedPortal || !config) {
      return;
    }
    state.activePortal = selectedPortal;
    if (refs.portalGrid) {
      refs.portalGrid.hidden = true;
    }
    refs.portalSetupPanel.hidden = false;
    refs.portalSetupTitle.textContent = config.title;
    refs.portalSetupLead.textContent = config.text;
    refs.portalSetupSubmit.textContent = "Save And Open " + portalLabel(selectedPortal);
    refs.portalSetupFields.innerHTML = config.fields.map(function (field) {
      return renderPortalSetupField(selectedPortal, field);
    }).join("");
    setPortalSetupStatus("Complete your " + portalLabel(selectedPortal) + " profile before entering the workspace.", "info");
    refs.portalSetupPanel.scrollIntoView({ block: "start", behavior: "smooth" });
    const firstField = refs.portalSetupFields.querySelector("input, select, textarea");
    if (firstField && typeof firstField.focus === "function") {
      window.setTimeout(function () {
        firstField.focus();
      }, 200);
    }
  }

  function renderPortalSetupField(portal, field) {
    const saved = loadPortalProfiles()[portal] || {};
    const value = safeValue(saved[field.name] || "");
    if (field.type === "select") {
      return [
        '<label class="entry-field">',
        '<span>' + escapeHtml(field.label) + '</span>',
        '<select name="' + escapeHtml(field.name) + '" data-testid="portal-field-' + escapeHtml(field.name) + '"' + (field.required ? ' required' : '') + '>',
        '<option value="">Choose</option>',
        field.options.map(function (option) {
          return '<option value="' + escapeHtml(option) + '"' + (value === option ? ' selected' : '') + '>' + escapeHtml(option) + '</option>';
        }).join(""),
        '</select>',
        '</label>'
      ].join("");
    }
    return [
      '<label class="entry-field">',
      '<span>' + escapeHtml(field.label) + '</span>',
      '<input name="' + escapeHtml(field.name) + '" data-testid="portal-field-' + escapeHtml(field.name) + '" type="text" placeholder="' + escapeHtml(field.placeholder || "") + '" value="' + escapeHtml(value) + '"' + (field.required ? ' required' : '') + '>',
      '</label>'
    ].join("");
  }

  function ensureInteractiveTestIds(root) {
    const scope = root && typeof root.querySelectorAll === "function" ? root : document;
    const selector = "a[href], button, input, select, textarea";
    const nodes = Array.from(scope.querySelectorAll(selector));
    const seen = new Map();
    nodes.forEach(function (node) {
      if (node.dataset && node.dataset.testid) {
        return;
      }
      const seed = safeValue(
        node.id
        || node.getAttribute("name")
        || node.dataset.authMode
        || node.dataset.portal
        || node.textContent
        || node.getAttribute("placeholder")
        || node.getAttribute("aria-label")
        || node.tagName
      );
      const base = slugifyTestId(seed, (node.tagName || "control").toLowerCase());
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      node.dataset.testid = count ? base + "-" + (count + 1) : base;
    });
  }

  function slugifyTestId(value, fallback) {
    const slug = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
    return slug || fallback || "control";
  }

  function observeInteractiveTestIds() {
    if (window.__resourceflowEntryTestObserverStarted || !document.body || typeof MutationObserver !== "function") {
      return;
    }
    window.__resourceflowEntryTestObserverStarted = true;
    const observer = new MutationObserver(function () {
      ensureInteractiveTestIds(document);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function setPortalSetupStatus(message, tone) {
    refs.portalSetupStatus.textContent = message;
    refs.portalSetupStatus.classList.remove("is-error", "is-success");
    if (tone === "error") {
      refs.portalSetupStatus.classList.add("is-error");
    }
    if (tone === "success") {
      refs.portalSetupStatus.classList.add("is-success");
    }
  }

  function loadPortalProfiles() {
    try {
      const raw = localStorage.getItem(PORTAL_PROFILE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function persistPortalProfile(portal, payload) {
    const store = loadPortalProfiles();
    store[portal] = payload;
    localStorage.setItem(PORTAL_PROFILE_KEY, JSON.stringify(store));
  }

  function buildPortalProfile(portal, values) {
    const base = {
      role: portal,
      updatedAt: new Date().toISOString()
    };
    if (portal === "user") {
      return Object.assign(base, values, {
        primarySummary: values.locality + " community view",
        secondarySummary: values.interest + " - " + values.preferredLanguage
      });
    }
    if (portal === "volunteer") {
      return Object.assign(base, values, {
        primarySummary: values.availability + " volunteer - " + values.district + " district",
        secondarySummary: values.skills
      });
    }
    if (portal === "government") {
      return Object.assign(base, values, {
        primarySummary: values.department + " - " + values.district + " district",
        secondarySummary: values.designation + " - " + values.shift + " shift"
      });
    }
    return Object.assign(base, values, {
      primarySummary: values.organization + " admin",
      secondarySummary: values.responsibility
    });
  }

  async function handlePortalSetupSubmit(event) {
    event.preventDefault();
    const portal = normalizePortal(state.activePortal);
    if (!portal) {
      setPortalSetupStatus("Choose a portal first.", "error");
      return;
    }
    const formData = new FormData(refs.portalSetupForm);
    const values = {};
    (PORTAL_SETUP_CONFIG[portal].fields || []).forEach(function (field) {
      values[field.name] = safeValue(formData.get(field.name));
    });
    const missing = Object.keys(values).filter(function (key) {
      return !values[key];
    });
    if (missing.length) {
      setPortalSetupStatus("Please complete all required fields before continuing.", "error");
      return;
    }
    try {
      setLoading(true);
      persistPortalProfile(portal, buildPortalProfile(portal, values));
      setPortalSetupStatus("Profile saved. Opening " + portalLabel(portal) + "...", "success");
      openPortalImmediately(portal, values);
    } catch (error) {
      setPortalSetupStatus(formatAuthError(error), "error");
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      setLoading(true);
      state.portalTransitioning = false;
      if (state.auth && state.auth.currentUser) {
        await state.auth.signOut();
      }
      clearDemoSession();
      localStorage.removeItem(PORTAL_SELECTION_KEY);
      state.demoMode = false;
      showAuthStage();
      setMode("signin");
      refs.form.reset();
      setStatus("You are signed out. Sign in again to continue.", "info");
    } catch (error) {
      setPortalStatus(formatAuthError(error), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handlePortalSelection(portal) {
    const selectedPortal = normalizePortal(portal);
    if (!selectedPortal) {
      return;
    }

    try {
      setLoading(true);
      openPortalImmediately(selectedPortal, {});
    } catch (error) {
      setPortalStatus(formatAuthError(error), "error");
      setLoading(false);
    }
  }

  function openPortalImmediately(selectedPortal, extraProfile) {
    const portal = normalizePortal(selectedPortal);
    const extras = extraProfile && typeof extraProfile === "object" ? extraProfile : {};
    if (!portal) {
      throw new Error("Choose a valid portal to continue.");
    }

    state.portalTransitioning = true;
    document.body.classList.add("portal-transitioning");

    if (state.demoMode) {
      localStorage.setItem(PORTAL_SELECTION_KEY, portal);
      persistPortalHandoff(portal);
      persistDemoSession(portal);
      window.location.assign(portalRouteWithSelection(portal));
      return;
    }

    if (!state.user) {
      throw new Error("Sign in first, then choose your portal.");
    }

    const desiredRole = portal === "admin" && !isAdminEmail(state.user.email || "")
      ? "user"
      : portal;
    const requestedRole = portal;
    localStorage.setItem(PORTAL_SELECTION_KEY, desiredRole);
    const localProfile = buildEntryProfile(state.user, {
      role: desiredRole,
      requestedRole: requestedRole,
      location: extras.location || extras.district || extras.officeLocation || ""
    });
    persistPortalHandoff(desiredRole);
    persistEntryProfile(localProfile);
    window.location.assign(portalRouteWithSelection(desiredRole));
  }

  async function completePortalAccess(selectedPortal, extraProfile) {
    openPortalImmediately(selectedPortal, extraProfile);
  }

  function activatePortalSelection(user, overrides) {
    const immediateProfile = buildEntryProfile(user, overrides);
    state.user = user || null;
    state.demoMode = false;
    clearDemoSession();
    state.portalTransitioning = false;
    showPortalStage(immediateProfile);
    setLoading(false);
    setPortalStatus("Choose a portal to continue.", "success");
    ensureUserProfile(user, overrides).then(function (profile) {
      if (state.portalTransitioning) {
        return;
      }
      showPortalStage(profile || immediateProfile);
      setPortalStatus("Choose a portal to continue.", "success");
    }).catch(function (error) {
      console.warn("Profile sync after sign-in failed.", error);
      if (state.portalTransitioning) {
        return;
      }
      showPortalStage(immediateProfile);
      setPortalStatus("Sign in worked. Choose a portal now and the profile sync will continue in the background.", "error");
    });
  }

  function buildEntryProfile(user, overrides) {
    const profileDraft = loadEntryProfile();
    const extra = overrides && typeof overrides === "object" ? overrides : {};
    const email = safeValue(user.email || profileDraft.email || "");
    const displayName = safeValue(extra.displayName || user.displayName || profileDraft.displayName || deriveName(email));
    const location = safeValue(extra.location || profileDraft.location || "");
    const defaultRole = resolveDefaultRole(email);
    const role = normalizePortal(extra.role || defaultRole);
    const requestedRole = normalizePortal(extra.requestedRole || role || defaultRole);
    const nextProfile = {
      uid: safeValue(user.uid),
      email: email,
      displayName: displayName,
      photoURL: safeValue(user.photoURL || ""),
      location: location,
      role: role,
      requestedRole: requestedRole,
      updatedAt: new Date().toISOString(),
      updatedBy: email || "auth-entry"
    };
    return nextProfile;
  }

  async function ensureUserProfile(user, overrides) {
    if (!user) {
      return null;
    }
    const nextProfile = buildEntryProfile(user, overrides);

    persistEntryProfile(nextProfile);

    try {
      await ensureFirestoreReady();
      if (state.db) {
        const profileRef = state.db.collection("resourceflowUsers").doc(user.uid);
        await profileRef.set(nextProfile, { merge: true });
      }
    } catch (error) {
      console.warn("Entry profile sync fallback to local profile.", error);
    }

    return nextProfile;
  }

  function showAuthStage() {
    state.portalTransitioning = false;
    refs.authStage.hidden = false;
    refs.portalStage.hidden = true;
    refs.portalSetupPanel.hidden = true;
    state.activePortal = "";
    document.body.classList.remove("portal-stage-open");
  }

  function showPortalStage(profile) {
    const summary = profile || loadEntryProfile();
    const keepPortalSetupOpen = Boolean(state.activePortal && refs.portalSetupPanel && !refs.portalSetupPanel.hidden);
    refs.authStage.hidden = true;
    refs.portalStage.hidden = false;
    document.body.classList.add("portal-stage-open");
    refs.portalUserLabel.textContent = summary && summary.displayName
      ? summary.displayName
      : "Signed in";
    refs.portalUserMeta.textContent = summary && summary.email
      ? summary.email
      : "Portal access is ready.";
    refs.portalLead.textContent = state.demoMode
      ? "Preview the product through one of the four demo portals below."
      : "Choose the portal that matches your role and enter the workspace.";
    if (keepPortalSetupOpen) {
      if (refs.portalGrid) {
        refs.portalGrid.hidden = true;
      }
      refs.portalSetupPanel.hidden = false;
      return;
    }
    if (refs.portalGrid) {
      refs.portalGrid.hidden = false;
    }
    refs.portalSetupPanel.hidden = true;
    state.activePortal = "";
    setPortalStatus("Choose a portal to continue.", "info");
  }

  function setStatus(message, tone) {
    refs.status.textContent = message;
    refs.status.classList.remove("is-error", "is-success");
    if (tone === "error") {
      refs.status.classList.add("is-error");
    }
    if (tone === "success") {
      refs.status.classList.add("is-success");
    }
  }

  function setPortalStatus(message, tone) {
    refs.portalStatus.textContent = message;
    refs.portalStatus.classList.remove("is-error", "is-success");
    if (tone === "error") {
      refs.portalStatus.classList.add("is-error");
    }
    if (tone === "success") {
      refs.portalStatus.classList.add("is-success");
    }
  }

  function setLoading(active) {
    state.loading = Boolean(active);
    refs.submit.disabled = state.loading;
    refs.googleButton.disabled = state.loading;
    refs.demoButton.disabled = state.loading;
    refs.signOutButton.disabled = state.loading;
    refs.portalSetupSubmit.disabled = state.loading;
    refs.portalSetupBack.disabled = state.loading;
    refs.modeButtons.forEach(function (button) {
      button.disabled = state.loading;
    });
    refs.portalButtons.forEach(function (button) {
      button.disabled = state.loading;
    });
    refs.portalSetupForm.querySelectorAll("input, select, textarea, button").forEach(function (field) {
      field.disabled = state.loading;
    });
  }

  async function loadFirebaseScripts() {
    for (const url of FIREBASE_AUTH_SCRIPTS) {
      await loadScript(url);
    }
  }

  async function loadAuthScripts() {
    for (const url of FIREBASE_AUTH_SCRIPTS) {
      await loadScript(url);
    }
  }

  async function ensureAuthReady() {
    if (state.authReady && state.auth) {
      return;
    }
    if (state.booting && state.initPromise) {
      await state.initPromise;
      return;
    }
    await initializeFirebase();
  }

  async function ensureFirestoreReady() {
    if (state.firestoreReady && state.db) {
      return;
    }
    await ensureAuthReady();
    if (state.firestorePromise) {
      await state.firestorePromise;
      return;
    }
    state.firestorePromise = (async function () {
      await loadScript(FIREBASE_FIRESTORE_SCRIPT);
      state.db = window.firebase.firestore ? window.firebase.firestore() : null;
      state.firestoreReady = Boolean(state.db);
    })();
    await state.firestorePromise;
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-auth-src="' + url + '"]');
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
      script.dataset.authSrc = url;
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

  function persistEntryProfile(profile) {
    try {
      localStorage.setItem(ENTRY_PROFILE_KEY, JSON.stringify(profile || {}));
    } catch (error) {
      console.warn("Could not save entry profile.", error);
    }
  }

  function persistPortalHandoff(role) {
    try {
      localStorage.setItem(PORTAL_HANDOFF_KEY, JSON.stringify({
        role: normalizePortal(role) || "user",
        createdAt: Date.now()
      }));
    } catch (error) {
      console.warn("Could not save portal handoff.", error);
    }
  }

  function loadEntryProfile() {
    try {
      const raw = localStorage.getItem(ENTRY_PROFILE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function persistDemoSession(role) {
    const profile = DEMO_PROFILES[normalizePortal(role)] || DEMO_PROFILES.user;
    try {
      localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify({
        uid: "demo-" + profile.role,
        role: profile.role,
        title: profile.title,
        displayName: profile.displayName,
        email: profile.email,
        createdAt: new Date().toISOString()
      }));
    } catch (error) {
      console.warn("Could not save demo session.", error);
    }
  }

  function clearDemoSession() {
    try {
      localStorage.removeItem(DEMO_AUTH_KEY);
    } catch (error) {
      console.warn("Could not clear demo session.", error);
    }
  }

  function formatAuthError(error) {
    const code = error && error.code ? String(error.code) : "";
    if (code === "auth/operation-not-allowed") {
      return "This sign-in method is not enabled in Firebase Authentication yet.";
    }
    if (code === "auth/popup-blocked") {
      return "Your browser blocked the Google sign-in popup. Allow popups and try again.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Google sign-in was closed before it finished.";
    }
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized for Firebase sign-in yet. Add the live site domain in Firebase Authentication settings.";
    }
    if (code === "auth/email-already-in-use") {
      return "That email already has a ResourceFlow account. Switch to Sign In instead.";
    }
    if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
      return "That email or password does not match an existing ResourceFlow account.";
    }
    if (code === "auth/weak-password") {
      return "Choose a stronger password with at least six characters.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    return error && error.message
      ? safeValue(error.message)
      : "Authentication could not be completed right now.";
  }

  function resolveDefaultRole(email) {
    return isAdminEmail(email) ? "admin" : "user";
  }

  function portalRouteWithSelection(role) {
    const nextRole = normalizePortal(role) || "user";
    const route = PORTAL_ROUTES[nextRole] || "./overview.html";
    return route + (route.indexOf("?") >= 0 ? "&" : "?") + "portal=" + encodeURIComponent(nextRole);
  }

  function isAdminEmail(email) {
    const config = window.RESOURCEFLOW_FIREBASE_CONFIG || {};
    const emails = Array.isArray(config.adminEmails) ? config.adminEmails : [];
    return emails.indexOf(String(email || "").toLowerCase()) >= 0;
  }

  function normalizeRole(value) {
    const next = String(value || "").trim().toLowerCase();
    return next || "signin";
  }

  function normalizePortal(value) {
    const next = String(value || "").trim().toLowerCase();
    return PORTAL_ROUTES[next] ? next : "";
  }

  function portalLabel(role) {
    return {
      user: "Community Portal",
      volunteer: "Volunteer Portal",
      government: "Government Operations",
      admin: "Admin Console"
    }[normalizePortal(role)] || "portal";
  }

  function safeValue(value) {
    return String(value || "").trim();
  }

  function escapeHtml(value) {
    return safeValue(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function deriveName(email) {
    const local = safeValue(email).split("@")[0];
    if (!local) {
      return "ResourceFlow User";
    }
    return local
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, function (character) {
        return character.toUpperCase();
      });
  }
})();
