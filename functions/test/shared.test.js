const test = require("node:test");
const assert = require("node:assert/strict");
const {
  assertAdmin,
  assertManager,
  decodeRoleClaim,
  normalizeSkills,
  normalizeRole,
  safeInteger,
  safeIso,
  safeText,
  normalizeZone,
  sanitizeNotificationPayload,
  sanitizeVolunteerRecord,
  sanitizeClientError
} = require("../src/shared");

test("normalizeRole keeps supported roles", () => {
  assert.equal(normalizeRole("admin"), "admin");
  assert.equal(normalizeRole("coordinator"), "coordinator");
  assert.equal(normalizeRole("government"), "government");
  assert.equal(normalizeRole("volunteer"), "volunteer");
  assert.equal(normalizeRole("user"), "user");
});

test("normalizeRole falls back safely", () => {
  assert.equal(normalizeRole("owner"), "user");
  assert.equal(normalizeRole(""), "user");
});

test("normalizeZone keeps allowed zones and defaults invalid values", () => {
  assert.equal(normalizeZone("North"), "North");
  assert.equal(normalizeZone("Unknown"), "Central");
});

test("normalizeSkills deduplicates and lowercases values", () => {
  const skills = normalizeSkills([" First Aid ", "first aid", "Logistics"]);
  assert.deepEqual(skills, ["first aid", "logistics"]);
});

test("safeInteger clamps and rounds numeric values", () => {
  assert.equal(safeInteger(9.6, 1, 10, 5), 10);
  assert.equal(safeInteger(-4, 1, 10, 5), 1);
  assert.equal(safeInteger("bad", 1, 10, 5), 5);
});

test("sanitizeVolunteerRecord attaches owner identity", () => {
  const volunteer = sanitizeVolunteerRecord(
    {
      name: "Sana Patel",
      zone: "East",
      location: "Salt Lake, Kolkata",
      skills: ["coordination", "first aid"],
      transport: "Yes"
    },
    {
      uid: "user-1",
      email: "sana@example.com"
    }
  );

  assert.equal(volunteer.ownerUid, "user-1");
  assert.equal(volunteer.ownerEmail, "sana@example.com");
  assert.equal(volunteer.zone, "East");
  assert.equal(volunteer.skills.length, 2);
});

test("sanitizeNotificationPayload limits channels and recipients", () => {
  const payload = sanitizeNotificationPayload({
    subject: "Urgent update",
    message: "Please report by 5 PM.",
    channels: ["email", "whatsapp", "unknown"],
    recipients: [
      { email: "ops@example.com", phone: "+919999999999" },
      { email: "", phone: "" }
    ]
  });

  assert.deepEqual(payload.channels, ["email", "whatsapp"]);
  assert.equal(payload.recipients.length, 1);
});

test("sanitizeClientError preserves page and actor context", () => {
  const error = sanitizeClientError(
    {
      page: "operations.html",
      message: "Assignment render failed",
      stack: "stack trace"
    },
    "lead@example.com"
  );

  assert.equal(error.page, "operations.html");
  assert.equal(error.actor, "lead@example.com");
  assert.match(error.message, /Assignment render failed/);
});

test("assertManager and assertAdmin read custom claims safely", () => {
  assert.equal(assertManager({ token: { role: "admin" } }), true);
  assert.equal(assertManager({ token: { role: "coordinator" } }), true);
  assert.equal(assertManager({ token: { role: "government" } }), true);
  assert.equal(assertManager({ token: { role: "volunteer" } }), false);
  assert.equal(assertAdmin({ token: { role: "admin" } }), true);
  assert.equal(assertAdmin({ token: { role: "coordinator" } }), false);
});

test("safeText trims, collapses whitespace, and respects limit", () => {
  assert.equal(safeText("  hello   world  ", 180), "hello world");
  assert.equal(safeText("abcdef", 3), "abc");
  assert.equal(safeText(null), "");
  assert.equal(safeText(undefined), "");
  assert.equal(safeText(123, 10), "123");
  assert.equal(safeText("  \t\n  multiple   spaces  \n", 50), "multiple spaces");
});

test("safeText uses default limit when none provided", () => {
  const longInput = "a".repeat(250);
  const result = safeText(longInput);
  assert.equal(result.length, 180);
});

test("safeIso returns valid ISO string for valid dates", () => {
  const result = safeIso("2024-06-15T12:00:00Z");
  assert.equal(result, "2024-06-15T12:00:00.000Z");
});

test("safeIso returns current time for invalid dates", () => {
  const before = new Date().toISOString();
  const result = safeIso("not-a-date");
  const after = new Date().toISOString();
  assert.ok(result >= before && result <= after);
});

test("safeIso handles null and undefined gracefully", () => {
  // new Date(null) => epoch 1970-01-01 (valid date, returns epoch ISO)
  assert.equal(safeIso(null), "1970-01-01T00:00:00.000Z");
  // new Date(undefined) => Invalid Date (falls back to current time)
  const before = new Date().toISOString();
  const result = safeIso(undefined);
  const after = new Date().toISOString();
  assert.ok(result >= before && result <= after);
});

test("decodeRoleClaim extracts role from auth token", () => {
  assert.equal(decodeRoleClaim({ token: { role: "admin" } }), "admin");
  assert.equal(decodeRoleClaim({ token: { role: "coordinator" } }), "coordinator");
  assert.equal(decodeRoleClaim({ token: { role: "volunteer" } }), "volunteer");
});

test("decodeRoleClaim defaults to user for missing or invalid claims", () => {
  assert.equal(decodeRoleClaim(null), "user");
  assert.equal(decodeRoleClaim({}), "user");
  assert.equal(decodeRoleClaim({ token: {} }), "user");
  assert.equal(decodeRoleClaim({ token: { role: "superuser" } }), "user");
});
