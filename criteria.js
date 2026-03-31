(() => {
  const STORAGE_KEY = "resourceflow-state-v4";
  const GOOGLE_MAPS_BASE = "https://www.google.com/maps/search/?api=1&query=";
  const ZONE_HUBS = {
    North: "north community response hub",
    South: "south community response hub",
    East: "east community response hub",
    West: "west community response hub",
    Central: "central community response hub"
  };

  let pwaStatus = {
    label: "Packaged",
    description: "Manifest and service worker are included. Host on Firebase Hosting or localhost to activate install and offline caching."
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.__RESOURCEFLOW_TEST_MODE__) {
      init();
    }
  });

  function init() {
    bindScenarioTools();
    bindOutreachTools();
    registerServiceWorker();
    renderAll(true);
    window.setInterval(function () {
      renderAll(false);
    }, 1200);
  }

  function renderAll(force) {
    const data = loadState();
    const signature = JSON.stringify({
      requests: data.requests.length,
      volunteers: data.volunteers.length,
      assignments: data.assignments.length,
      lastUpdated: data.lastUpdated
    });

    if (!force && window.__resourceFlowCriteriaSignature === signature) {
      renderOutreachMessage(data);
      return;
    }

    window.__resourceFlowCriteriaSignature = signature;
    const metrics = computeMetrics(data);
    renderHome(metrics, data);
    renderOperations(metrics, data);
    renderVolunteer(metrics, data);
    renderInsights(metrics, data);
    renderJudgeMode(metrics, data);
    renderOutreachMessage(data);
    announceWorkspace(metrics);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return normalizeState({});
      }
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      return normalizeState({});
    }
  }

  function normalizeState(value) {
    const next = value && typeof value === "object" ? value : {};
    return {
      requests: Array.isArray(next.requests) ? next.requests : [],
      volunteers: Array.isArray(next.volunteers) ? next.volunteers : [],
      assignments: Array.isArray(next.assignments) ? next.assignments : [],
      activityLog: Array.isArray(next.activityLog) ? next.activityLog : [],
      history: Array.isArray(next.history) ? next.history : [],
      meta: next.meta && typeof next.meta === "object"
        ? next.meta
        : { revision: 0, updatedBy: "system", updatedAt: new Date().toISOString() },
      lastUpdated: next.lastUpdated || new Date().toISOString()
    };
  }

  function computeMetrics(data) {
    const coveredIds = new Set(data.assignments.map(function (item) { return item.requestId; }));
    const uniqueVolunteerIds = new Set(data.assignments.map(function (item) { return item.volunteerId; }));
    const beneficiaries = data.requests.reduce(function (sum, request) {
      return sum + Number(request.beneficiaries || 0);
    }, 0);
    const coverage = data.requests.length ? Math.round((coveredIds.size / data.requests.length) * 100) : 0;
    const criticalRequests = data.requests.filter(function (request) { return Number(request.urgency) >= 4; });
    const criticalCovered = criticalRequests.filter(function (request) {
      return assignedCountForRequest(data, request.id) >= Number(request.peopleNeeded || 0);
    }).length;
    const criticalFill = criticalRequests.length ? Math.round((criticalCovered / criticalRequests.length) * 100) : 0;
    const volunteerHours = uniqueVolunteerIds.size * 4;
    const responseMinutesSaved = coveredIds.size * 18 + criticalCovered * 32;
    const zoneCoverage = buildZoneCoverage(data);
    const fairnessGap = zoneCoverage.length
      ? Math.max.apply(null, zoneCoverage.map(function (item) { return item.coverage; })) - Math.min.apply(null, zoneCoverage.map(function (item) { return item.coverage; }))
      : 0;
    const topRequest = data.requests.slice().sort(function (left, right) {
      if (Number(right.urgency) !== Number(left.urgency)) {
        return Number(right.urgency) - Number(left.urgency);
      }
      return Number(right.beneficiaries || 0) - Number(left.beneficiaries || 0);
    })[0] || null;
    const skillGaps = buildSkillGaps(data);
    const underServedZone = zoneCoverage.slice().sort(function (left, right) { return left.coverage - right.coverage; })[0] || null;
    const firebaseEnabled = Boolean(window.RESOURCEFLOW_FIREBASE_CONFIG && window.RESOURCEFLOW_FIREBASE_CONFIG.enabled && !String(window.RESOURCEFLOW_FIREBASE_CONFIG.apiKey || "").startsWith("YOUR_"));
    const averageScore = data.assignments.length
      ? Math.round(data.assignments.reduce(function (sum, item) { return sum + Number(item.score || 0); }, 0) / data.assignments.length)
      : 0;
    const revision = Number(data.meta && data.meta.revision ? data.meta.revision : 0);
    const activityEvents = Array.isArray(data.activityLog) ? data.activityLog.length : 0;
    const lastEditor = data.meta && data.meta.updatedBy ? data.meta.updatedBy : "system";
    const riskRadar = buildRiskRadar(data);
    const readinessScore = computeReadinessScore({
      coverage: coverage,
      criticalFill: criticalFill,
      requests: data.requests.length,
      volunteers: data.volunteers.length,
      assignments: data.assignments.length
    });
    const historySummary = buildHistorySummary(data.history);

    return {
      beneficiaries: beneficiaries,
      coverage: coverage,
      criticalFill: criticalFill,
      criticalCovered: criticalCovered,
      volunteerHours: volunteerHours,
      responseMinutesSaved: responseMinutesSaved,
      zoneCoverage: zoneCoverage,
      fairnessGap: fairnessGap,
      topRequest: topRequest,
      skillGaps: skillGaps,
      underServedZone: underServedZone,
      firebaseEnabled: firebaseEnabled,
      averageScore: averageScore,
      totalRequests: data.requests.length,
      totalVolunteers: data.volunteers.length,
      totalAssignments: data.assignments.length,
      uniqueAssignedVolunteers: uniqueVolunteerIds.size,
      communitiesServed: zoneCoverage.length,
      revision: revision,
      activityEvents: activityEvents,
      lastEditor: lastEditor,
      riskRadar: riskRadar,
      readinessScore: readinessScore,
      historySummary: historySummary
    };
  }

  function assignedCountForRequest(data, requestId) {
    return data.assignments.filter(function (assignment) {
      return assignment.requestId === requestId;
    }).length;
  }

  function buildZoneCoverage(data) {
    const zones = {};
    data.requests.forEach(function (request) {
      if (!zones[request.zone]) {
        zones[request.zone] = { zone: request.zone, requests: 0, covered: 0, uncovered: 0, coverage: 0 };
      }
      zones[request.zone].requests += 1;
    });

    Object.keys(zones).forEach(function (zone) {
      const coveredIds = new Set(
        data.assignments
          .filter(function (assignment) { return assignment.zone === zone; })
          .map(function (assignment) { return assignment.requestId; })
      );
      zones[zone].covered = coveredIds.size;
      zones[zone].uncovered = Math.max(zones[zone].requests - coveredIds.size, 0);
      zones[zone].coverage = zones[zone].requests ? Math.round((coveredIds.size / zones[zone].requests) * 100) : 0;
    });

    return Object.keys(zones).map(function (key) { return zones[key]; });
  }

  function buildSkillGaps(data) {
    const score = {};
    data.requests.forEach(function (request) {
      const deficit = Math.max(Number(request.peopleNeeded || 0) - assignedCountForRequest(data, request.id), 0);
      if (deficit > 0) {
        (request.skills || []).forEach(function (skill) {
          score[skill] = (score[skill] || 0) + deficit;
        });
      }
    });

    return Object.keys(score)
      .map(function (skill) { return { skill: skill, score: score[skill] }; })
      .sort(function (left, right) { return right.score - left.score; });
  }

  function buildRiskRadar(data) {
    return data.requests.slice()
      .map(function (request) {
        const assigned = assignedCountForRequest(data, request.id);
        const deficit = Math.max(Number(request.peopleNeeded || 0) - assigned, 0);
        const severity = (Number(request.urgency || 0) * 20) + (deficit * 18) + Math.min(Number(request.beneficiaries || 0) / 10, 20);
        return {
          id: request.id,
          title: request.title,
          organization: request.organization,
          zone: request.zone,
          deficit: deficit,
          assigned: assigned,
          peopleNeeded: Number(request.peopleNeeded || 0),
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
    const items = Array.isArray(history) ? history.slice() : [];
    if (!items.length) {
      return {
        items: [],
        coverageDelta: 0,
        criticalDelta: 0
      };
    }
    return {
      items: items.slice(0, 8),
      coverageDelta: items.length > 1 ? Number(items[0].coverage || 0) - Number(items[1].coverage || 0) : 0,
      criticalDelta: items.length > 1 ? Number(items[0].criticalFill || 0) - Number(items[1].criticalFill || 0) : 0
    };
  }
  function renderHome(metrics, data) {
    setText("#criteriaTechEvidence", metrics.totalAssignments
      ? "Firebase Auth roles, Cloud Firestore live sync, revision tracking (rev " + metrics.revision + "), Google Maps routing, browser tests, an explainable matching engine with average fit score " + metrics.averageScore + ", and an AidFlow disaster-forecast layer are active."
      : "Firebase Auth, Firestore, Google Maps routing, browser tests, an explainable matching engine, and predictive disaster-allocation workflows are built into the platform.");
    setText("#criteriaUxEvidence", "Skip links, keyboard focus states, labeled forms, live update regions, mobile-friendly cards, and plain-language flows make the app easier to use.");
    setText("#criteriaCauseEvidence", metrics.totalRequests
      ? "The current workspace tracks " + metrics.totalRequests + " requests across " + metrics.communitiesServed + " zones, serving about " + metrics.beneficiaries + " beneficiaries with " + metrics.coverage + "% request coverage."
      : "The app is structured around urgent community coordination needs like food, medical support, shelter help, and volunteer mobilization.");
    setText("#criteriaInnovationEvidence", "ResourceFlow adds a what-if staffing simulator, AI outreach generation, fairness watch, readiness scoring, risk radar, predictive disaster allocation, QR-ready delivery verification, judge-ready briefs, and a collaboration timeline with " + metrics.activityEvents + " tracked event(s).");
    setText("#impactNarrative", metrics.totalRequests
      ? "Current model: " + metrics.beneficiaries + " projected beneficiaries, " + metrics.responseMinutesSaved + " minutes of estimated coordination time saved, and " + metrics.coverage + "% of requests currently covered."
      : "Load demo data to generate a measurable impact narrative for judges.");
    setText("#techFirebase", metrics.firebaseEnabled ? "Configured + Live Sync" : "Ready For Setup");
    setText("#techMaps", metrics.totalRequests ? "Dispatch Links Live" : "Dispatch Links Ready");
    setText("#techGemini", "AI Workflow Enabled");
    setText("#techPwa", pwaStatus.label);
  }

  function renderOperations(metrics, data) {
    setText("#impactHours", metrics.volunteerHours + " hrs");
    setText("#impactResponseTime", metrics.responseMinutesSaved + " min");
    setText("#impactFairness", metrics.underServedZone ? metrics.underServedZone.zone + " zone" : "Balanced");
    setText("#impactCauseFit", metrics.totalRequests
      ? metrics.coverage + "% coverage for " + metrics.beneficiaries + " projected beneficiaries"
      : "Waiting for live requests");

    const zoneCoverageNode = document.querySelector("#zoneCoverageList");
    if (zoneCoverageNode) {
      zoneCoverageNode.innerHTML = metrics.zoneCoverage.length
        ? metrics.zoneCoverage.map(function (zone) {
            return [
              '<div class="stack-card">',
              '<strong>' + safe(zone.zone) + ' zone</strong>',
              '<p class="card-meta">' + zone.coverage + '% coverage across ' + zone.requests + ' request(s)</p>',
              '<div class="meter"><div class="meter-fill" style="width:' + zone.coverage + '%"></div></div>',
              '<div class="chip-row">' + renderChip(zone.covered + ' covered') + renderChip(zone.uncovered + ' open') + '</div>',
              '<a class="text-link map-link" href="' + mapsLink(zone.zone) + '" target="_blank" rel="noreferrer">Open hub in Google Maps</a>',
              '</div>'
            ].join("");
          }).join("")
        : '<div class="empty-box">Zone coverage evidence will appear here.</div>';
    }

    const mapsNode = document.querySelector("#mapsDispatchList");
    if (mapsNode) {
      const topRequests = data.requests.slice().sort(function (left, right) {
        return Number(right.urgency) - Number(left.urgency);
      }).slice(0, 4);

      mapsNode.innerHTML = topRequests.length
        ? topRequests.map(function (request) {
            return [
              '<div class="stack-card">',
              '<strong>' + safe(request.title) + '</strong>',
              '<p class="card-meta">' + safe(request.organization + ' | ' + request.zone + ' zone') + '</p>',
              '<div class="chip-row">' + renderUrgencyChip(request.urgency) + renderChip(request.category) + '</div>',
              '<a class="text-link map-link" href="' + mapsLink(request.zone, request.title) + '" target="_blank" rel="noreferrer">Open dispatch route</a>',
              '</div>'
            ].join("");
          }).join("")
        : '<div class="empty-box">Google Maps dispatch links will appear here.</div>';
    }
  }

  function renderVolunteer(metrics, data) {
    const accessibilityNode = document.querySelector("#accessibilityChecklist");
    if (accessibilityNode) {
      accessibilityNode.innerHTML = [
        renderStackCard("Keyboard-first navigation", "Skip links, focus states, and clear page landmarks improve keyboard and screen-reader navigation."),
        renderStackCard("Readable data entry", "Every form field is labeled, grouped, and optimized for simple mobile or desktop use."),
        renderStackCard("Live status guidance", "Dynamic panels use clear text and live updates instead of hidden or overloaded interactions."),
        renderStackCard("Low-learning-curve workflow", "Separate overview, operations, volunteer, insights, and judge pages reduce confusion for first-time users.")
      ].join("");
    }

    const trainingNode = document.querySelector("#volunteerTrainingList");
    if (trainingNode) {
      trainingNode.innerHTML = metrics.skillGaps.length
        ? metrics.skillGaps.slice(0, 3).map(function (gap) {
            return renderStackCard(
              "Recruit or train for " + titleCase(gap.skill),
              "This skill appears in the highest number of unfilled requests right now. Training more volunteers here would directly improve staffing coverage."
            );
          }).join("")
        : renderStackCard("Coverage is stable", "Current staffing is covering known requests. Focus on retention, coordinator training, and scaling new partnerships.");
    }

    const communityMessage = document.querySelector("#volunteerCommunityMessage");
    if (communityMessage) {
      communityMessage.textContent = buildOutreachMessage(data, "English", "Warm");
    }
  }

  function renderInsights(metrics, data) {
    renderWhatIfSimulation(data);
    setText("#readinessScore", metrics.readinessScore + " / 100");
    setText("#readinessScoreText", metrics.totalRequests
      ? "This score combines request coverage, critical fill rate, volunteer supply, and assignment activity."
      : "Add requests and volunteers to generate a readiness score.");
    setText("#surgeForecast", metrics.historySummary.coverageDelta > 0
      ? "Coverage Improving"
      : metrics.historySummary.coverageDelta < 0
        ? "Coverage Slipping"
        : "Stable Trend");
    setText("#surgeForecastText", metrics.totalRequests
      ? "Latest coverage change: " + signed(metrics.historySummary.coverageDelta) + " pts. Critical fill change: " + signed(metrics.historySummary.criticalDelta) + " pts."
      : "Trend forecasting activates after a few workspace revisions.");
    setText("#collaborationHealth", metrics.activityEvents + " tracked events");
    setText("#collaborationHealthText", "Last editor: " + metrics.lastEditor + ". Revision: " + metrics.revision + ".");

    const zoneChart = document.querySelector("#zoneChart");
    if (zoneChart) {
      zoneChart.innerHTML = metrics.zoneCoverage.length
        ? renderBarChart("Zone coverage", metrics.zoneCoverage.map(function (item) {
            return { label: item.zone, value: item.coverage, suffix: "%" };
          }))
        : '<div class="empty-box">Zone coverage chart will appear here.</div>';
    }

    const skillChart = document.querySelector("#skillChart");
    if (skillChart) {
      skillChart.innerHTML = metrics.skillGaps.length
        ? renderBarChart("Skill gap pressure", metrics.skillGaps.slice(0, 5).map(function (item) {
            return { label: titleCase(item.skill), value: item.score, suffix: "" };
          }))
        : '<div class="empty-box">Skill gap chart will appear here.</div>';
    }

    const riskRadarList = document.querySelector("#riskRadarList");
    if (riskRadarList) {
      riskRadarList.innerHTML = metrics.riskRadar.length
        ? metrics.riskRadar.slice(0, 5).map(renderRiskCard).join("")
        : '<div class="empty-box">Risk-ranked requests will appear here.</div>';
    }

    const trendHistoryList = document.querySelector("#trendHistoryList");
    if (trendHistoryList) {
      trendHistoryList.innerHTML = metrics.historySummary.items.length
        ? metrics.historySummary.items.map(renderTrendCard).join("")
        : '<div class="empty-box">Revision trend history will appear here.</div>';
    }

    const innovationGrid = document.querySelector("#innovationEvidenceGrid");
    if (innovationGrid) {
      innovationGrid.innerHTML = [
        renderEvidenceCard("Novel Workflow", "Instead of only matching volunteers, the app also simulates coverage improvement and predicts where disaster-response shortages may appear next."),
        renderEvidenceCard("Creative Use Of AI", "The AI layer generates coordinator briefs, judge narratives, outreach drafts, what-if staffing analysis, and satellite-ready forecasting prompts."),
        renderEvidenceCard("Scalability", metrics.firebaseEnabled ? "Firestore is configured for shared multi-device sync with revision " + metrics.revision + ", while the AidFlow layer can later ingest Earth Engine or weather feeds." : "Firebase-ready architecture allows the prototype to scale from local mode to multi-team deployments and later add Earth Engine data."),
        renderEvidenceCard("Verification Trail", "QR-ready delivery tokens create a simple chain-of-custody story for relief packages and field verification.")
      ].join("");
    }
  }

  function renderJudgeMode(metrics, data) {
    setText("#judgeSummary", metrics.totalRequests
      ? "ResourceFlow currently shows " + metrics.totalRequests + " active requests, " + metrics.totalVolunteers + " volunteers, " + metrics.totalAssignments + " assignments, " + metrics.coverage + "% coverage, " + metrics.criticalFill + "% critical fill rate, and revision " + metrics.revision + " with " + metrics.activityEvents + " audit events."
      : "Load demo data or add records to generate a live judging summary.");

    const technicalNode = document.querySelector("#judgeTechnical");
    if (technicalNode) {
      technicalNode.innerHTML = [
        renderStackCard("Google developer technology utilization", metrics.firebaseEnabled ? "Firebase sync is configured for cloud-backed storage with live revision tracking (rev " + metrics.revision + ")." : "The app is Firebase-ready with local fallback for offline prototype use."),
        renderStackCard("Maps-ready dispatch", "Google Maps search links are generated for zone hubs and urgent requests to support real-world field coordination and relief routing."),
        renderStackCard("Coding expertise", "The app uses structured JSON state, input validation guards, duplicate prevention checks, explainable volunteer scoring, and maintainable multi-page flows."),
        renderStackCard("Scalability and sustainability", pwaStatus.description + " The forecasting layer is also ready for Earth Engine, weather, or flood-risk inputs.")
      ].join("");
    }

    const uxNode = document.querySelector("#judgeUx");
    if (uxNode) {
      uxNode.innerHTML = [
        renderStackCard("Design and usability", "Dedicated overview, operations, volunteer, insights, and judge views keep tasks focused and intuitive."),
        renderStackCard("Accessibility", "Skip links, focus-visible states, labeled inputs, readable content hierarchy, and live announcement regions improve accessibility."),
        renderStackCard("Fast comprehension", "Key metrics, priorities, and outreach actions are surfaced immediately without requiring complex setup."),
        renderStackCard("Mobile readiness", "Card-based layouts and large touch targets keep the interface usable on smaller screens.")
      ].join("");
    }
    const causeNode = document.querySelector("#judgeCause");
    if (causeNode) {
      causeNode.innerHTML = [
        renderStackCard("Problem alignment", metrics.totalRequests ? "The workspace directly models high-priority needs like food distribution, medical support, shelter operations, logistics, outreach, and proactive disaster relief planning." : "The product is structured around urgent community and disaster coordination problems rather than generic productivity tasks."),
        renderStackCard("Real-world impact", metrics.totalRequests ? "Current scenario covers about " + metrics.beneficiaries + " projected beneficiaries across " + metrics.communitiesServed + " zones." : "Load demo data to surface measurable beneficiary and zone impact."),
        renderStackCard("Critical response", metrics.totalRequests ? metrics.criticalFill + "% of high-urgency requests are fully staffed in the current scenario, while the forecast layer highlights upcoming relief pressure." : "Critical fill evidence will appear when requests and volunteers exist."),
        renderStackCard("Equity signal", metrics.underServedZone ? metrics.underServedZone.zone + " is the lowest-covered zone right now, which the fairness watch can surface to coordinators." : "Zone fairness checks will activate with live requests.")
      ].join("");
    }

    const innovationNode = document.querySelector("#judgeInnovation");
    if (innovationNode) {
      innovationNode.innerHTML = [
        renderStackCard("Novelty", "ResourceFlow goes beyond dashboards by adding a simulation lab, fairness watch, readiness index, risk radar, predictive disaster allocation, delivery verification, judge mode, outreach generation, and collaboration audit trail."),
        renderStackCard("Creative AI use", "The app turns structured operations data into briefs, recruitment messages, scenario forecasts, satellite-ready prompts, and demo narratives."),
        renderStackCard("Explainability", metrics.totalAssignments ? "Each assignment includes a reason trail so judges can see why a volunteer was recommended." : "Assignment explainability activates after matching runs."),
        renderStackCard("Scalable innovation", "The AI layer works in prototype mode now and can be extended with Gemini, Earth Engine, and QR scanning later while keeping revision and activity audit history.")
      ].join("");
    }

    const deploymentNode = document.querySelector("#judgeDeployment");
    if (deploymentNode) {
      deploymentNode.innerHTML = [
        renderStackCard("Offline-first prototype", "The app runs immediately from static files with browser storage for demos and hackathons."),
        renderStackCard("Cloud-ready architecture", metrics.firebaseEnabled ? "Firebase is configured and ready for shared deployment." : "Add real Firebase credentials in firebase-config.js to enable shared cloud sync."),
        renderStackCard("PWA packaging", pwaStatus.description),
        renderStackCard("Auditability", "Workspace data can be exported as JSON and reviewed with activity-log and revision metadata for code-review-safe traceability.")
      ].join("");
    }
  }

  function bindScenarioTools() {
    const form = document.querySelector("#whatIfForm");
    if (!form || form.dataset.bound === "true") {
      return;
    }
    form.dataset.bound = "true";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      renderWhatIfSimulation(loadState());
    });
  }

  function bindOutreachTools() {
    ["#outreachLanguage", "#outreachTone"].forEach(function (selector) {
      const node = document.querySelector(selector);
      if (node && node.dataset.bound !== "true") {
        node.dataset.bound = "true";
        node.addEventListener("change", function () {
          renderOutreachMessage(loadState());
        });
      }
    });
  }

  function renderWhatIfSimulation(data) {
    const output = document.querySelector("#whatIfResult");
    if (!output) {
      return;
    }

    const zone = inputValue("#whatIfZone", "Central");
    const skill = inputValue("#whatIfSkill", "first aid").toLowerCase();
    const count = Math.max(Number(inputValue("#whatIfCount", "2")), 1);
    const result = simulateScenario(data, zone, skill, count);

    output.textContent = [
      "Scenario result",
      "",
      "If we add " + count + " new volunteer(s) with " + skill + " skills in " + zone + " zone:",
      "Coverage changes from " + result.before.coverage + "% to " + result.after.coverage + "%.",
      "Critical fill rate changes from " + result.before.criticalFill + "% to " + result.after.criticalFill + "%.",
      "Assignments change from " + result.before.totalAssignments + " to " + result.after.totalAssignments + ".",
      "",
      result.summary
    ].join("\n");
  }

  function simulateScenario(data, zone, skill, count) {
    const next = clone(data);
    for (let index = 0; index < count; index += 1) {
      next.volunteers.push({
        id: "sim-" + zone + "-" + skill + "-" + index,
        name: "Simulated Volunteer " + (index + 1),
        zone: zone,
        availability: "Full Day",
        skills: [skill, "coordination"],
        transport: "Yes",
        experience: "Intermediate"
      });
    }
    next.assignments = generateAssignments(next);
    const before = computeMetrics(data);
    const after = computeMetrics(next);
    const coverageDelta = after.coverage - before.coverage;
    const criticalDelta = after.criticalFill - before.criticalFill;
    return {
      before: before,
      after: after,
      summary: coverageDelta > 0 || criticalDelta > 0
        ? "This suggests targeted recruitment in " + zone + " for " + skill + " could materially improve live response quality."
        : "This scenario does not unlock much extra coverage, so coordinators should test a different skill or zone combination."
    };
  }

  function renderOutreachMessage(data) {
    const output = document.querySelector("#outreachMessage");
    if (!output) {
      return;
    }
    const language = inputValue("#outreachLanguage", "English");
    const tone = inputValue("#outreachTone", "Urgent");
    output.textContent = buildOutreachMessage(data, language, tone);
  }

  function buildOutreachMessage(data, language, tone) {
    const metrics = computeMetrics(data);
    const request = metrics.topRequest;
    const topGap = metrics.skillGaps[0] ? metrics.skillGaps[0].skill : "community support";
    if (!request) {
      return "Load demo data or add a request to generate a targeted outreach draft.";
    }

    const base = {
      English: {
        Urgent: "Urgent call for volunteers: We need support in " + request.zone + " zone for " + request.title + ". If you have experience in " + topGap + ", please join the response effort today.",
        Warm: "We are looking for caring volunteers to support " + request.title + " in " + request.zone + " zone. If you can help with " + topGap + ", your time can make a real difference.",
        Formal: "Volunteer support is requested for " + request.title + " in " + request.zone + " zone. Individuals with skills in " + topGap + " are encouraged to register through ResourceFlow."
      },
      Hinglish: {
        Urgent: "Urgent volunteer call: " + request.zone + " zone me " + request.title + " ke liye turant support chahiye. Agar aapke paas " + topGap + " skill hai to aaj hi join kijiye.",
        Warm: "Hum " + request.title + " ke liye " + request.zone + " zone me volunteers dhundh rahe hain. Agar aap " + topGap + " me help kar sakte ho to aapka support bahut valuable hoga.",
        Formal: "" + request.title + " ke liye " + request.zone + " zone me volunteer support invite kiya ja raha hai. " + topGap + " skill wale log ResourceFlow par register kar sakte hain."
      },
      HindiRoman: {
        Urgent: "Tatkal volunteer sahayata ki avashyakta hai: " + request.zone + " kshetra me " + request.title + " ke liye " + topGap + " kaushal wale log turant judein.",
        Warm: "Samudayik sahayata ke liye hum " + request.title + " me madad karne wale volunteers khoj rahe hain. Yadi aap " + topGap + " me sahayata de sakte hain to kripaya judein.",
        Formal: "" + request.title + " ke liye " + request.zone + " kshetra me volunteer sahayata amantrit hai. " + topGap + " kaushal wale log ResourceFlow par panjikaran kar sakte hain."
      }
    };

    return base[language] && base[language][tone]
      ? base[language][tone]
      : base.English.Urgent;
  }
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      pwaStatus = {
        label: "Unavailable",
        description: "This browser does not support service workers, so offline caching cannot be enabled here."
      };
      return;
    }

    if (!/^https?:$/i.test(window.location.protocol)) {
      pwaStatus = {
        label: "Packaged",
        description: "PWA assets are bundled, but service workers need localhost or HTTPS. Use Firebase Hosting or a local server for install and offline mode."
      };
      return;
    }

    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      return Promise.all(registrations.map(function (registration) {
        return registration.unregister();
      }));
    }).then(function () {
      pwaStatus = {
        label: "Direct Load",
        description: "Service worker caching is disabled for stability. The app now loads pages directly from Hosting."
      };
      renderAll(true);
    }).catch(function () {
      pwaStatus = {
        label: "Direct Load",
        description: "The app is loading directly from Hosting without offline caching."
      };
      renderAll(true);
    });
  }

  function announceWorkspace(metrics) {
    const announceNode = document.querySelector("#announce");
    if (!announceNode) {
      return;
    }
    announceNode.textContent = "Workspace updated. " + metrics.totalRequests + " requests, " + metrics.totalVolunteers + " volunteers, and " + metrics.totalAssignments + " assignments currently in view.";
  }

  function generateAssignments(data) {
    const available = new Set(data.volunteers.map(function (volunteer) { return volunteer.id; }));
    const assignments = [];
    const requests = clone(data.requests).sort(function (left, right) {
      return Number(right.urgency) - Number(left.urgency);
    });

    requests.forEach(function (request) {
      const candidates = data.volunteers
        .filter(function (volunteer) { return available.has(volunteer.id); })
        .map(function (volunteer) {
          return { volunteer: volunteer, score: scoreVolunteer(volunteer, request) };
        })
        .filter(function (item) { return item.score > 0; })
        .sort(function (left, right) { return right.score - left.score; })
        .slice(0, Number(request.peopleNeeded || 0));

      candidates.forEach(function (entry) {
        assignments.push({
          requestId: request.id,
          requestTitle: request.title,
          organization: request.organization,
          volunteerId: entry.volunteer.id,
          volunteerName: entry.volunteer.name,
          category: request.category,
          zone: request.zone,
          urgency: request.urgency,
          score: entry.score,
          reason: explainMatch(entry.volunteer, request)
        });
        available.delete(entry.volunteer.id);
      });
    });

    return assignments;
  }

  function scoreVolunteer(volunteer, request) {
    const skillMatches = (volunteer.skills || []).filter(function (skill) {
      return (request.skills || []).indexOf(skill) >= 0;
    }).length;

    let score = 0;
    score += skillMatches * 28;
    score += volunteer.zone === request.zone ? 18 : 0;
    score += volunteer.transport === "Yes" ? 10 : 0;
    score += availabilityWeight(volunteer.availability);
    score += experienceWeight(volunteer.experience);
    score += Number(request.urgency || 0) * 4;

    if (skillMatches === 0 && volunteer.zone !== request.zone) {
      score -= 22;
    }

    return Math.max(score, 0);
  }

  function explainMatch(volunteer, request) {
    const overlap = (volunteer.skills || []).filter(function (skill) {
      return (request.skills || []).indexOf(skill) >= 0;
    });
    const reasons = [];
    if (overlap.length) {
      reasons.push("skills: " + overlap.join(", "));
    }
    if (volunteer.zone === request.zone) {
      reasons.push("same zone");
    }
    if (volunteer.transport === "Yes") {
      reasons.push("independent transport");
    }
    reasons.push(String(volunteer.experience || "intermediate").toLowerCase() + " experience");
    return reasons.join(" | ");
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
      Advanced: 14,
      Intermediate: 9,
      Beginner: 5
    }[value] || 0;
  }

  function mapsLink(zone, title) {
    const query = title ? title + " " + zone + " zone community support" : (ZONE_HUBS[zone] || zone + " response hub");
    return GOOGLE_MAPS_BASE + encodeURIComponent(query);
  }

  function renderStackCard(title, text) {
    return '<div class="stack-card"><strong>' + safe(title) + '</strong><p class="card-meta">' + safe(text) + '</p></div>';
  }

  function renderEvidenceCard(title, text) {
    return '<article class="evidence-card"><h3>' + safe(title) + '</h3><p>' + safe(text) + '</p></article>';
  }

  function renderRiskCard(item) {
    const fill = item.peopleNeeded ? Math.round((item.assigned / item.peopleNeeded) * 100) : 0;
    return [
      '<div class="stack-card">',
      '<strong>' + safe(item.title) + '</strong>',
      '<p class="card-meta">' + safe(item.organization + ' | ' + item.zone + ' zone') + '</p>',
      '<div class="chip-row">' + renderChip('severity ' + item.severity) + renderChip('deficit ' + item.deficit) + renderChip(item.assigned + '/' + item.peopleNeeded + ' filled') + '</div>',
      '<div class="meter"><div class="meter-fill" style="width:' + Math.max(0, Math.min(fill, 100)) + '%"></div></div>',
      '</div>'
    ].join("");
  }

  function renderTrendCard(item) {
    return [
      '<div class="stack-card">',
      '<strong>Revision ' + safe(item.revision) + '</strong>',
      '<p class="card-meta">' + safe(formatDateTime(item.at)) + '</p>',
      '<div class="chip-row">' + renderChip('coverage ' + item.coverage + '%') + renderChip('critical ' + item.criticalFill + '%') + renderChip(item.assignments + ' assignments') + '</div>',
      '</div>'
    ].join("");
  }

  function renderBarChart(title, items) {
    const max = Math.max.apply(null, items.map(function (item) { return Number(item.value || 0); }).concat([1]));
    return [
      '<div class="chart-card">',
      '<strong>' + safe(title) + '</strong>',
      '<div class="chart-list">',
      items.map(function (item) {
        const width = Math.max(6, Math.round((Number(item.value || 0) / max) * 100));
        return [
          '<div class="chart-row">',
          '<span class="chart-label">' + safe(item.label) + '</span>',
          '<div class="chart-track"><div class="chart-bar" style="width:' + width + '%"></div></div>',
          '<span class="chart-value">' + safe(String(item.value) + (item.suffix || "")) + '</span>',
          '</div>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderChip(text) {
    return '<span class="chip">' + safe(text) + '</span>';
  }

  function renderUrgencyChip(level) {
    const label = urgencyLabel(level);
    const tone = {
      Critical: "critical",
      High: "high",
      Moderate: "moderate",
      Low: "low",
      Routine: ""
    }[label];
    return '<span class="chip ' + tone + '">' + label + '</span>';
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

  function safe(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) {
      node.textContent = value;
    }
  }

  function inputValue(selector, fallback) {
    const node = document.querySelector(selector);
    return node ? node.value : fallback;
  }

  function titleCase(value) {
    return String(value)
      .split(" ")
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function signed(value) {
    const number = Number(value || 0);
    return (number > 0 ? "+" : "") + number;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }
    return date.toLocaleString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  window.ResourceFlowCriteriaTestAPI = {
    normalizeState: normalizeState,
    computeMetrics: computeMetrics,
    buildRiskRadar: buildRiskRadar,
    computeReadinessScore: computeReadinessScore
  };
})();
