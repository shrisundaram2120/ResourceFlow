(function () {
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    var trigger = document.getElementById("runTests");
    if (trigger) {
      trigger.addEventListener("click", runSuite);
    }
    runSuite();
  }

  function runSuite() {
    var results = [];
    var originalConfig = clone(window.RESOURCEFLOW_FIREBASE_CONFIG || {});

    function test(name, fn) {
      try {
        fn();
        results.push({ name: name, pass: true, detail: "Passed" });
      } catch (error) {
        results.push({
          name: name,
          pass: false,
          detail: error && error.message ? error.message : "Unknown error"
        });
      }
    }

    function expect(condition, message) {
      if (!condition) {
        throw new Error(message);
      }
    }

    try {
      test("App test API is exposed", function () {
        expect(window.ResourceFlowTestAPI, "window.ResourceFlowTestAPI was not found.");
      });

      test("Criteria test API is exposed", function () {
        expect(window.ResourceFlowCriteriaTestAPI, "window.ResourceFlowCriteriaTestAPI was not found.");
      });

      test("Role resolution honors configured admins and coordinators", function () {
        window.RESOURCEFLOW_FIREBASE_CONFIG = Object.assign({}, originalConfig, {
          adminEmails: ["lead@resourceflow.test"],
          coordinatorEmails: ["ops@resourceflow.test"]
        });
        expect(window.ResourceFlowTestAPI.resolveRoleForEmail("lead@resourceflow.test") === "admin", "Admin email was not mapped correctly.");
        expect(window.ResourceFlowTestAPI.resolveRoleForEmail("ops@resourceflow.test") === "coordinator", "Coordinator email was not mapped correctly.");
        expect(window.ResourceFlowTestAPI.resolveRoleForEmail("volunteer@resourceflow.test") === "volunteer", "Fallback volunteer role was not mapped correctly.");
      });

      test("Request validation blocks incomplete submissions", function () {
        var request = window.ResourceFlowTestAPI.sanitizeRequestRecord({
          organization: "",
          title: "",
          category: "",
          zone: "North",
          skills: []
        });
        expect(Boolean(window.ResourceFlowTestAPI.validateRequest(request)), "Incomplete request should have failed validation.");
      });

      test("Matching engine prefers the strongest skill and location fit", function () {
        var data = window.ResourceFlowTestAPI.sanitizeState({
          requests: [
            {
              id: "req-1",
              organization: "Health on Wheels",
              title: "Medical desk support",
              category: "Medical Support",
              urgency: 5,
              peopleNeeded: 1,
              zone: "Central",
              location: "Kolkata Medical College area",
              beneficiaries: 80,
              skills: ["first aid", "registration"],
              notes: "Urgent registration and triage support."
            }
          ],
          volunteers: [
            {
              id: "vol-1",
              name: "Sana Patel",
              zone: "Central",
              location: "Esplanade, Kolkata",
              availability: "Full Day",
              skills: ["first aid", "registration"],
              transport: "Yes",
              experience: "Advanced"
            },
            {
              id: "vol-2",
              name: "Riya Das",
              zone: "West",
              location: "Howrah, Kolkata",
              availability: "Half Day",
              skills: ["teaching"],
              transport: "No",
              experience: "Beginner"
            }
          ]
        });
        var assignments = window.ResourceFlowTestAPI.generateAssignments(data);
        expect(assignments.length === 1, "Expected one assignment for the sample workspace.");
        expect(assignments[0].volunteerId === "vol-1", "Matching engine did not pick the strongest volunteer.");
        expect(Number(assignments[0].score) > 0, "Assignment score should be positive.");
      });

      test("Analytics metrics compute coverage, readiness, and live risks", function () {
        var normalized = window.ResourceFlowCriteriaTestAPI.normalizeState({
          requests: [
            {
              id: "req-1",
              organization: "Seva Relief Collective",
              title: "Meal distribution",
              category: "Food Distribution",
              urgency: 5,
              peopleNeeded: 1,
              zone: "East",
              beneficiaries: 120,
              skills: ["coordination"]
            },
            {
              id: "req-2",
              organization: "Night Shelter Network",
              title: "Shelter setup",
              category: "Shelter Support",
              urgency: 4,
              peopleNeeded: 2,
              zone: "North",
              beneficiaries: 45,
              skills: ["logistics"]
            }
          ],
          volunteers: [
            {
              id: "vol-1",
              name: "Aarav",
              zone: "East",
              availability: "Full Day",
              skills: ["coordination"],
              transport: "Yes",
              experience: "Advanced"
            }
          ],
          assignments: [
            {
              id: "asg-1",
              requestId: "req-1",
              volunteerId: "vol-1",
              requestTitle: "Meal distribution",
              volunteerName: "Aarav",
              organization: "Seva Relief Collective",
              category: "Food Distribution",
              zone: "East",
              urgency: 5,
              score: 96,
              reason: "Strong skill and zone fit."
            }
          ],
          history: [
            {
              at: "2026-03-29T10:00:00.000Z",
              revision: 3,
              requests: 2,
              volunteers: 1,
              assignments: 1,
              coverage: 50,
              criticalFill: 50
            }
          ],
          meta: {
            revision: 3,
            updatedBy: "ops@resourceflow.test",
            updatedAt: "2026-03-29T10:00:00.000Z"
          }
        });
        var metrics = window.ResourceFlowCriteriaTestAPI.computeMetrics(normalized);
        expect(metrics.coverage === 50, "Coverage metric should be 50% for one covered request out of two.");
        expect(metrics.readinessScore > 0, "Readiness score should be greater than zero.");
        expect(metrics.riskRadar.length === 1, "Expected one uncovered request in the risk radar.");
      });

      test("AidFlow signals generate predictive forecast and verification tokens", function () {
        var normalized = window.ResourceFlowTestAPI.sanitizeState({
          requests: [
            {
              id: "req-flood-1",
              organization: "Seva Relief Collective",
              title: "Flood relief meal distribution",
              category: "Food Distribution",
              urgency: 5,
              peopleNeeded: 3,
              zone: "East",
              beneficiaries: 120,
              skills: ["coordination", "driving"],
              notes: "Water levels are rising around the shelter cluster."
            }
          ],
          volunteers: [
            {
              id: "vol-1",
              name: "Aarav",
              zone: "East",
              availability: "Full Day",
              skills: ["coordination"],
              transport: "Yes",
              experience: "Advanced"
            }
          ],
          assignments: [
            {
              id: "asg-1",
              requestId: "req-flood-1",
              volunteerId: "vol-1",
              requestTitle: "Flood relief meal distribution",
              volunteerName: "Aarav",
              organization: "Seva Relief Collective",
              category: "Food Distribution",
              zone: "East",
              urgency: 5,
              score: 94,
              reason: "Strong zone fit."
            }
          ]
        });
        var signals = window.ResourceFlowTestAPI.buildAidFlowSignals(normalized);
        expect(signals.forecasts.length === 1, "Expected one forecast item.");
        expect(/Highest projected shortage/.test(signals.forecastTitle), "Forecast title should summarize the top projected shortage.");
        expect(/RF-EAS-/.test(signals.verifications[0].token), "Verification token should use the request zone prefix.");
      });

      test("Admin review queue surfaces uncovered operational gaps", function () {
        var normalized = window.ResourceFlowTestAPI.sanitizeState({
          requests: [
            {
              id: "req-admin-1",
              organization: "River Relief",
              title: "Boat dispatch support",
              category: "Logistics",
              urgency: 5,
              peopleNeeded: 3,
              zone: "South",
              beneficiaries: 140,
              skills: ["logistics", "driving"]
            }
          ],
          volunteers: [
            {
              id: "vol-admin-1",
              name: "Arjun",
              zone: "South",
              availability: "Full Day",
              skills: ["logistics"],
              transport: "Yes",
              experience: "Intermediate"
            }
          ],
          assignments: []
        });
        var queue = window.ResourceFlowTestAPI.buildAdminReviewQueue(normalized);
        expect(queue.length === 1, "Expected one admin review item for the uncovered request.");
        expect(/staffing gap/i.test(queue[0].subject), "Review item subject should describe the staffing gap.");
        expect(/resourceflow\.demo/i.test(queue[0].recipients), "Review recipients should be generated for manual outreach.");
      });

      test("Approval queue keeps new requests pending until reviewed", function () {
        var normalized = window.ResourceFlowTestAPI.sanitizeState({
          requests: [
            {
              id: "req-pending-1",
              organization: "Flood Relief Desk",
              title: "Boat marshal support",
              category: "Logistics",
              urgency: 5,
              peopleNeeded: 2,
              zone: "South",
              skills: ["logistics"],
              approvalStatus: "pending",
              workflowStatus: "pending"
            },
            {
              id: "req-approved-1",
              organization: "Meal Network",
              title: "Community kitchen support",
              category: "Food Distribution",
              urgency: 4,
              peopleNeeded: 1,
              zone: "East",
              skills: ["coordination"],
              approvalStatus: "approved",
              workflowStatus: "assigned"
            }
          ]
        });
        var queue = window.ResourceFlowTestAPI.buildApprovalQueue(normalized);
        expect(queue.length === 1, "Expected only the pending request in the approval queue.");
        expect(queue[0].id === "req-pending-1", "Approval queue should prioritize the pending request.");
      });

      test("Shift planning groups requests into shared response slots", function () {
        var normalized = window.ResourceFlowTestAPI.sanitizeState({
          requests: [
            {
              id: "req-shift-1",
              organization: "Night Shelter",
              title: "Bed setup support",
              category: "Shelter Support",
              urgency: 4,
              peopleNeeded: 2,
              zone: "North",
              skills: ["logistics"],
              approvalStatus: "approved",
              shiftLabel: "Today - Evening"
            },
            {
              id: "req-shift-2",
              organization: "Mobile Health",
              title: "Registration desk",
              category: "Medical Support",
              urgency: 5,
              peopleNeeded: 1,
              zone: "Central",
              skills: ["registration"],
              approvalStatus: "approved",
              shiftLabel: "Today - Evening"
            }
          ],
          assignments: [
            {
              id: "asg-shift-1",
              requestId: "req-shift-1",
              volunteerId: "vol-shift-1",
              requestTitle: "Bed setup support",
              volunteerName: "Aarav",
              organization: "Night Shelter",
              category: "Shelter Support",
              zone: "North",
              urgency: 4,
              score: 82,
              reason: "Zone fit",
              status: "assigned",
              shiftLabel: "Today - Evening"
            }
          ]
        });
        var shifts = window.ResourceFlowTestAPI.buildShiftPlan(normalized);
        expect(shifts.length === 1, "Expected one grouped shift slot.");
        expect(shifts[0].title === "Today - Evening", "Shift planner should preserve the shift label.");
        expect(shifts[0].openSlots === 2, "Expected two open slots after one assignment covers three requested positions.");
      });

      test("Archived overview surfaces soft-deleted records for restore", function () {
        var normalized = window.ResourceFlowTestAPI.sanitizeState({
          requests: [
            {
              id: "req-arch-1",
              organization: "Community Desk",
              title: "Archived request",
              category: "Food Distribution",
              urgency: 2,
              peopleNeeded: 1,
              zone: "West",
              skills: ["coordination"],
              archived: true
            }
          ],
          volunteers: [
            {
              id: "vol-arch-1",
              name: "Archived Volunteer",
              zone: "West",
              availability: "Weekend",
              skills: ["support"],
              transport: "No",
              experience: "Beginner",
              archived: true
            }
          ]
        });
        var archived = window.ResourceFlowTestAPI.buildArchivedOverview(normalized);
        expect(archived.length === 2, "Expected both archived request and volunteer to be visible.");
      });

      test("Volunteer outreach supports multilingual free-mode messaging", function () {
        var normalized = window.ResourceFlowTestAPI.sanitizeState({
          requests: [
            {
              id: "req-outreach-1",
              organization: "Community Care",
              title: "Shelter support desk",
              category: "Shelter Support",
              urgency: 4,
              peopleNeeded: 2,
              zone: "North",
              beneficiaries: 70,
              skills: ["registration", "coordination"]
            }
          ],
          volunteers: []
        });
        var message = window.ResourceFlowTestAPI.buildVolunteerOutreachMessage(normalized, "Hinglish", "Warm");
        expect(/zone|volunteer|support|madad|useful/i.test(message), "Volunteer outreach message did not generate a meaningful localized draft.");
      });

      test("Sanitization preserves safe artifacts and history snapshots", function () {
        var sanitized = window.ResourceFlowTestAPI.sanitizeState({
          artifacts: [
            {
              id: "art-1",
              type: "field-photo",
              relatedTo: "req-1",
              notes: "Proof photo",
              name: "proof.jpg",
              size: 2048,
              contentType: "image/jpeg",
              uploadedBy: "lead@resourceflow.test",
              createdAt: "2026-03-29T10:00:00.000Z",
              url: "https://example.com/file"
            }
          ],
          history: [
            {
              id: "hist-1",
              at: "2026-03-29T10:00:00.000Z",
              revision: 4,
              requests: 2,
              volunteers: 3,
              assignments: 1,
              coverage: 50,
              criticalFill: 50
            }
          ],
          meta: {
            revision: 4,
            updatedBy: "lead@resourceflow.test",
            updatedAt: "2026-03-29T10:00:00.000Z"
          }
        });
        expect(sanitized.artifacts.length === 1, "Expected one sanitized artifact.");
        expect(sanitized.history.length === 1, "Expected one sanitized history snapshot.");
        expect(sanitized.meta.revision === 4, "Meta revision should be preserved.");
      });

      test("Free-mode helpers build local analysis and manual outreach text", function () {
        var analysis = window.ResourceFlowTestAPI.buildLocalAnalysisText();
        var brief = window.ResourceFlowTestAPI.buildManualNotificationBrief({
          subject: "Urgent volunteer update",
          message: "Please report by 6 PM.",
          channels: ["email", "whatsapp"],
          recipients: [{ name: "Sana", email: "sana@example.com", phone: "+919999999999" }],
          createdAt: "2026-03-30T10:00:00.000Z"
        });
        expect(/ResourceFlow Local Strategy Engine/.test(analysis), "Local analysis helper did not return the expected heading.");
        expect(/Urgent volunteer update/.test(brief), "Manual outreach brief did not preserve the subject.");
        expect(/sana@example.com/i.test(brief), "Manual outreach brief did not include recipients.");
      });
    } finally {
      window.RESOURCEFLOW_FIREBASE_CONFIG = originalConfig;
    }

    renderResults(results);
  }

  function renderResults(results) {
    var host = document.getElementById("testResults");
    var summary = document.getElementById("testSummary");
    var timestamp = document.getElementById("testTimestamp");
    if (!host || !summary || !timestamp) {
      return;
    }

    var passCount = results.filter(function (item) { return item.pass; }).length;
    var total = results.length;
    var allPassed = total > 0 && passCount === total;
    var failCount = Math.max(total - passCount, 0);

    summary.textContent = allPassed
      ? passCount + "/" + total + " tests passed"
      : passCount + "/" + total + " tests passed, " + failCount + " failed";
    timestamp.textContent = "Last run at " + new Date().toLocaleString();

    host.innerHTML = results.map(function (result) {
      return [
        '<div class="stack-card">',
        '<div class="chip-row">',
        '<span class="chip ' + (result.pass ? "low" : "critical") + '">' + (result.pass ? "PASS" : "FAIL") + "</span>",
        "</div>",
        "<strong>" + escapeHtml(result.name) + "</strong>",
        '<p class="card-meta">' + escapeHtml(result.detail) + "</p>",
        "</div>"
      ].join("");
    }).join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }
})();
