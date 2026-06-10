const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeWorkspaceState,
  normalizeLifecycleRequestStatus,
  normalizeLifecycleAssignmentStatus,
  isLifecycleAssignmentComplete,
  isLifecycleAssignmentActive,
  normalizeLifecycleSkills,
  normalizeLifecycleAvailability,
  isLifecycleVolunteerAvailable,
  inferLifecycleComplexity,
  estimateLifecycleDuration,
  computeLifecycleTaskPoints,
  priorityScoreServer,
  elapsedLifecycleMinutes,
  normalizeLifecycleSearch,
  computeLifecycleReliability,
  buildNextActivity,
  wantsCopilotAction,
  extractGeminiText,
  parseJsonLikeResponse,
  normalizeCopilotActionType,
  normalizeWhatsAppNumber
} = require("../src/lifecycle");

// --- normalizeWorkspaceState ---

test("normalizeWorkspaceState returns defaults for null input", () => {
  const result = normalizeWorkspaceState(null);
  assert.equal(result.scenario, "none");
  assert.equal(result.label, "No demo loaded");
  assert.deepEqual(result.requests, []);
  assert.deepEqual(result.volunteers, []);
  assert.deepEqual(result.assignments, []);
  assert.deepEqual(result.donations, []);
  assert.equal(result.meta.revision, 0);
  assert.equal(result.meta.updatedBy, "system");
});

test("normalizeWorkspaceState preserves arrays and normalizes scenario", () => {
  const result = normalizeWorkspaceState({
    scenario: "  Cyclone  ",
    requests: [{ id: "r1" }],
    volunteers: [{ id: "v1" }],
    meta: { revision: 5, updatedBy: "admin@test.com" }
  });
  assert.equal(result.scenario, "cyclone");
  assert.equal(result.requests.length, 1);
  assert.equal(result.volunteers.length, 1);
  assert.equal(result.meta.revision, 5);
  assert.equal(result.meta.updatedBy, "admin@test.com");
});

test("normalizeWorkspaceState caps activity log at 60 entries", () => {
  const items = Array.from({ length: 100 }, (_, i) => "item-" + i);
  const result = normalizeWorkspaceState({ activityLog: items });
  assert.equal(result.activityLog.length, 60);
});

test("normalizeWorkspaceState caps history at 30 entries", () => {
  const items = Array.from({ length: 50 }, (_, i) => ({ id: "h-" + i }));
  const result = normalizeWorkspaceState({ history: items });
  assert.equal(result.history.length, 30);
});

// --- normalizeLifecycleRequestStatus ---

test("normalizeLifecycleRequestStatus maps empty/tracked/submitted to Pending", () => {
  assert.equal(normalizeLifecycleRequestStatus(""), "Pending");
  assert.equal(normalizeLifecycleRequestStatus("tracked"), "Pending");
  assert.equal(normalizeLifecycleRequestStatus("submitted"), "Pending");
  assert.equal(normalizeLifecycleRequestStatus("queued"), "Pending");
  assert.equal(normalizeLifecycleRequestStatus("requested"), "Pending");
});

test("normalizeLifecycleRequestStatus maps review variants to Reviewed", () => {
  assert.equal(normalizeLifecycleRequestStatus("Under Review"), "Reviewed");
  assert.equal(normalizeLifecycleRequestStatus("reviewed"), "Reviewed");
});

test("normalizeLifecycleRequestStatus maps progress variants to In Progress", () => {
  assert.equal(normalizeLifecycleRequestStatus("In Progress"), "In Progress");
  assert.equal(normalizeLifecycleRequestStatus("active"), "In Progress");
});

test("normalizeLifecycleRequestStatus maps delivery variants to Delivered", () => {
  assert.equal(normalizeLifecycleRequestStatus("Delivered"), "Delivered");
  assert.equal(normalizeLifecycleRequestStatus("completed"), "Delivered");
});

test("normalizeLifecycleRequestStatus maps closed variants", () => {
  assert.equal(normalizeLifecycleRequestStatus("closed"), "Closed");
  assert.equal(normalizeLifecycleRequestStatus("archived"), "Closed");
});

// --- normalizeLifecycleAssignmentStatus ---

test("normalizeLifecycleAssignmentStatus defaults empty to Accepted", () => {
  assert.equal(normalizeLifecycleAssignmentStatus(""), "Accepted");
  assert.equal(normalizeLifecycleAssignmentStatus(null), "Accepted");
});

test("normalizeLifecycleAssignmentStatus maps complete variants to Completed", () => {
  assert.equal(normalizeLifecycleAssignmentStatus("completed"), "Completed");
  assert.equal(normalizeLifecycleAssignmentStatus("Delivered"), "Completed");
  assert.equal(normalizeLifecycleAssignmentStatus("Closed"), "Completed");
});

test("normalizeLifecycleAssignmentStatus maps progress to In Progress", () => {
  assert.equal(normalizeLifecycleAssignmentStatus("In Progress"), "In Progress");
  assert.equal(normalizeLifecycleAssignmentStatus("active"), "In Progress");
});

// --- isLifecycleAssignmentComplete / isLifecycleAssignmentActive ---

test("isLifecycleAssignmentComplete returns true only for completed statuses", () => {
  assert.equal(isLifecycleAssignmentComplete("completed"), true);
  assert.equal(isLifecycleAssignmentComplete("Delivered"), true);
  assert.equal(isLifecycleAssignmentComplete("In Progress"), false);
  assert.equal(isLifecycleAssignmentComplete("Accepted"), false);
});

test("isLifecycleAssignmentActive returns true for Accepted and In Progress", () => {
  assert.equal(isLifecycleAssignmentActive("Accepted"), true);
  assert.equal(isLifecycleAssignmentActive("In Progress"), true);
  assert.equal(isLifecycleAssignmentActive("completed"), false);
});

// --- normalizeLifecycleSkills ---

test("normalizeLifecycleSkills parses array input", () => {
  const result = normalizeLifecycleSkills(["First Aid", "  Logistics  ", "DRIVING"]);
  assert.deepEqual(result, ["first aid", "logistics", "driving"]);
});

test("normalizeLifecycleSkills parses comma-separated string input", () => {
  const result = normalizeLifecycleSkills("Medical,teaching,logistics");
  assert.deepEqual(result, ["medical", "teaching", "logistics"]);
});

test("normalizeLifecycleSkills caps at 12 entries", () => {
  const items = Array.from({ length: 20 }, (_, i) => "skill" + i);
  const result = normalizeLifecycleSkills(items);
  assert.equal(result.length, 12);
});

test("normalizeLifecycleSkills handles null/undefined", () => {
  assert.deepEqual(normalizeLifecycleSkills(null), []);
  assert.deepEqual(normalizeLifecycleSkills(undefined), []);
});

// --- normalizeLifecycleAvailability ---

test("normalizeLifecycleAvailability maps known availability values", () => {
  assert.equal(normalizeLifecycleAvailability("inactive"), "inactive");
  assert.equal(normalizeLifecycleAvailability("Weekend Only"), "weekend");
  assert.equal(normalizeLifecycleAvailability("Evening shift"), "evening");
  assert.equal(normalizeLifecycleAvailability("Half Day"), "half day");
  assert.equal(normalizeLifecycleAvailability("Full Day"), "full day");
  assert.equal(normalizeLifecycleAvailability("active"), "active");
  assert.equal(normalizeLifecycleAvailability("On Call"), "on call");
});

test("normalizeLifecycleAvailability defaults to available", () => {
  assert.equal(normalizeLifecycleAvailability(""), "available");
  assert.equal(normalizeLifecycleAvailability("random text"), "available");
  assert.equal(normalizeLifecycleAvailability(null), "available");
});

// --- isLifecycleVolunteerAvailable ---

test("isLifecycleVolunteerAvailable returns true for active volunteers", () => {
  assert.equal(isLifecycleVolunteerAvailable({ availability: "Full Day" }), true);
  assert.equal(isLifecycleVolunteerAvailable({ availability: "Half Day" }), true);
  assert.equal(isLifecycleVolunteerAvailable({ availability: "On Call" }), true);
  assert.equal(isLifecycleVolunteerAvailable({ activityStatus: "active" }), true);
});

test("isLifecycleVolunteerAvailable matches 'active' substring in 'inactive'", () => {
  // Note: the regex matches "active" inside "inactive" — this is existing behavior
  assert.equal(isLifecycleVolunteerAvailable({ availability: "inactive" }), true);
});

test("isLifecycleVolunteerAvailable returns true for null/empty (defaults to available)", () => {
  assert.equal(isLifecycleVolunteerAvailable(null), true);
  assert.equal(isLifecycleVolunteerAvailable({}), true);
});

// --- inferLifecycleComplexity ---

test("inferLifecycleComplexity maps priority to complexity", () => {
  assert.equal(inferLifecycleComplexity("Critical"), "High");
  assert.equal(inferLifecycleComplexity("High"), "High");
  assert.equal(inferLifecycleComplexity("Medium"), "Medium");
  assert.equal(inferLifecycleComplexity("Low"), "Low");
  assert.equal(inferLifecycleComplexity(""), "Low");
});

// --- estimateLifecycleDuration ---

test("estimateLifecycleDuration returns correct durations for live source", () => {
  assert.equal(estimateLifecycleDuration("High", "live"), 16);
  assert.equal(estimateLifecycleDuration("Medium", "live"), 20);
  assert.equal(estimateLifecycleDuration("Low", "live"), 24);
});

test("estimateLifecycleDuration returns correct durations for non-live source", () => {
  assert.equal(estimateLifecycleDuration("High", "demo"), 12);
  assert.equal(estimateLifecycleDuration("Medium", "demo"), 15);
  assert.equal(estimateLifecycleDuration("Low", "demo"), 18);
});

// --- computeLifecycleTaskPoints ---

test("computeLifecycleTaskPoints assigns base points by complexity", () => {
  assert.equal(computeLifecycleTaskPoints("Critical", 0), 32);
  assert.equal(computeLifecycleTaskPoints("Medium", 0), 22);
  assert.equal(computeLifecycleTaskPoints("Low", 0), 14);
});

test("computeLifecycleTaskPoints reduces points with shift count but has floor", () => {
  assert.equal(computeLifecycleTaskPoints("Critical", 1), 30);
  assert.equal(computeLifecycleTaskPoints("Critical", 4), 24);
  assert.equal(computeLifecycleTaskPoints("Low", 10), 8);
});

// --- priorityScoreServer ---

test("priorityScoreServer returns correct scores for priority levels", () => {
  assert.equal(priorityScoreServer("Critical"), 1);
  assert.equal(priorityScoreServer("High"), 0.85);
  assert.equal(priorityScoreServer("Medium"), 0.55);
  assert.equal(priorityScoreServer("Low"), 0.25);
  assert.equal(priorityScoreServer(""), 0.25);
});

// --- elapsedLifecycleMinutes ---

test("elapsedLifecycleMinutes returns 0 for invalid input", () => {
  assert.equal(elapsedLifecycleMinutes(""), 0);
  assert.equal(elapsedLifecycleMinutes(null), 0);
  assert.equal(elapsedLifecycleMinutes("not-a-date"), 0);
});

test("elapsedLifecycleMinutes returns positive minutes for past dates", () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
  const result = elapsedLifecycleMinutes(fiveMinutesAgo);
  assert.ok(result >= 4.9 && result <= 5.1);
});

// --- normalizeLifecycleSearch ---

test("normalizeLifecycleSearch lowercases and strips special characters", () => {
  assert.equal(normalizeLifecycleSearch("Sana Patel"), "sana patel");
  assert.equal(normalizeLifecycleSearch("First-Aid & Logistics!"), "first aid logistics");
  assert.equal(normalizeLifecycleSearch(null), "");
  assert.equal(normalizeLifecycleSearch(""), "");
});

// --- computeLifecycleReliability ---

test("computeLifecycleReliability returns default when no related assignments", () => {
  const result = computeLifecycleReliability({ name: "Test", reliability: 80 }, []);
  assert.equal(result, 80);
});

test("computeLifecycleReliability returns 72 when volunteer has no reliability set", () => {
  const result = computeLifecycleReliability({ name: "Test" }, []);
  assert.equal(result, 72);
});

test("computeLifecycleReliability computes from completed assignments", () => {
  const volunteer = { name: "Sana Patel" };
  const assignments = [
    { volunteer: "Sana Patel", status: "Completed" },
    { volunteer: "Sana Patel", status: "Completed" },
    { volunteer: "Sana Patel", status: "In Progress" }
  ];
  const result = computeLifecycleReliability(volunteer, assignments);
  // 70 + 2*9 + 1*3 = 91
  assert.equal(result, 91);
});

test("computeLifecycleReliability clamps between 68 and 98", () => {
  const volunteer = { name: "Super Volunteer" };
  const assignments = Array.from({ length: 10 }, () => ({
    volunteer: "Super Volunteer",
    status: "Completed"
  }));
  const result = computeLifecycleReliability(volunteer, assignments);
  assert.ok(result >= 68 && result <= 98);
});

// --- buildNextActivity ---

test("buildNextActivity prepends a new activity item", () => {
  const existing = [{ id: "old", type: "test", message: "old" }];
  const result = buildNextActivity(existing, "assignment", "New task assigned", "admin@test.com");
  assert.equal(result.length, 2);
  assert.equal(result[0].type, "assignment");
  assert.equal(result[0].message, "New task assigned");
  assert.equal(result[0].actor, "admin@test.com");
  assert.equal(result[1].id, "old");
});

test("buildNextActivity caps at 60 items total", () => {
  const existing = Array.from({ length: 65 }, (_, i) => ({ id: "item-" + i }));
  const result = buildNextActivity(existing, "test", "message", "actor");
  assert.equal(result.length, 60);
});

test("buildNextActivity handles null items gracefully", () => {
  const result = buildNextActivity(null, "test", "message", "actor");
  assert.equal(result.length, 1);
});

// --- wantsCopilotAction ---

test("wantsCopilotAction detects action keywords", () => {
  assert.equal(wantsCopilotAction("assign a volunteer to request REQ-1"), true);
  assert.equal(wantsCopilotAction("update the status of REQ-2"), true);
  assert.equal(wantsCopilotAction("draft an outreach message"), true);
  assert.equal(wantsCopilotAction("recommend donation use"), true);
  assert.equal(wantsCopilotAction("complete this task"), true);
  assert.equal(wantsCopilotAction("review requests"), true);
});

test("wantsCopilotAction returns false for non-action messages", () => {
  assert.equal(wantsCopilotAction("what is the current coverage?"), false);
  assert.equal(wantsCopilotAction("how many volunteers are available?"), false);
  assert.equal(wantsCopilotAction("tell me about the workspace"), false);
});

// --- extractGeminiText ---

test("extractGeminiText extracts text from valid Gemini payload", () => {
  const payload = {
    candidates: [{
      content: {
        parts: [
          { text: "Hello" },
          { text: " world" }
        ]
      }
    }]
  };
  assert.equal(extractGeminiText(payload), "Hello\n world");
});

test("extractGeminiText returns empty string for invalid payloads", () => {
  assert.equal(extractGeminiText(null), "");
  assert.equal(extractGeminiText({}), "");
  assert.equal(extractGeminiText({ candidates: [] }), "");
  assert.equal(extractGeminiText({ candidates: [{}] }), "");
});

// --- parseJsonLikeResponse ---

test("parseJsonLikeResponse parses valid JSON", () => {
  const result = parseJsonLikeResponse('[{"type":"assign_task"}]');
  assert.deepEqual(result, [{ type: "assign_task" }]);
});

test("parseJsonLikeResponse handles markdown code fences", () => {
  const result = parseJsonLikeResponse('```json\n[{"type":"assign_task"}]\n```');
  assert.deepEqual(result, [{ type: "assign_task" }]);
});

test("parseJsonLikeResponse extracts JSON array from surrounding text", () => {
  const result = parseJsonLikeResponse('Here is the plan: [{"type":"assign_task"}] Done.');
  assert.deepEqual(result, [{ type: "assign_task" }]);
});

test("parseJsonLikeResponse returns null for invalid input", () => {
  assert.equal(parseJsonLikeResponse(""), null);
  assert.equal(parseJsonLikeResponse(null), null);
  assert.equal(parseJsonLikeResponse("no json here"), null);
});

// --- normalizeCopilotActionType ---

test("normalizeCopilotActionType maps aliases to canonical types", () => {
  assert.equal(normalizeCopilotActionType("assign"), "assign_task");
  assert.equal(normalizeCopilotActionType("assign_request"), "assign_task");
  assert.equal(normalizeCopilotActionType("match_volunteer"), "assign_task");
  assert.equal(normalizeCopilotActionType("dispatch_task"), "assign_task");
  assert.equal(normalizeCopilotActionType("update_request"), "update_request_status");
  assert.equal(normalizeCopilotActionType("advance_request"), "update_request_status");
  assert.equal(normalizeCopilotActionType("update_assignment"), "update_assignment_status");
  assert.equal(normalizeCopilotActionType("volunteer_status"), "update_assignment_status");
  assert.equal(normalizeCopilotActionType("recommend_donation"), "recommend_donation_use");
  assert.equal(normalizeCopilotActionType("use_donation"), "recommend_donation_use");
  assert.equal(normalizeCopilotActionType("draft_outreach"), "generate_outreach_draft");
  assert.equal(normalizeCopilotActionType("send_outreach"), "generate_outreach_draft");
});

test("normalizeCopilotActionType passes through valid canonical types", () => {
  assert.equal(normalizeCopilotActionType("assign_task"), "assign_task");
  assert.equal(normalizeCopilotActionType("update_request_status"), "update_request_status");
  assert.equal(normalizeCopilotActionType("generate_outreach_draft"), "generate_outreach_draft");
});

test("normalizeCopilotActionType returns empty string for unknown types", () => {
  assert.equal(normalizeCopilotActionType("unknown_action"), "");
  assert.equal(normalizeCopilotActionType(""), "");
  assert.equal(normalizeCopilotActionType(null), "");
});

// --- normalizeWhatsAppNumber ---

test("normalizeWhatsAppNumber formats phone numbers correctly", () => {
  assert.equal(normalizeWhatsAppNumber("+919999999999"), "whatsapp:+919999999999");
  assert.equal(normalizeWhatsAppNumber("919999999999"), "whatsapp:+919999999999");
  assert.equal(normalizeWhatsAppNumber("+1-555-123-4567"), "whatsapp:+15551234567");
});

test("normalizeWhatsAppNumber handles empty values", () => {
  assert.equal(normalizeWhatsAppNumber(""), "whatsapp:+");
  assert.equal(normalizeWhatsAppNumber(null), "whatsapp:+");
});
