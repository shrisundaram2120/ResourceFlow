const test = require("node:test");
const assert = require("node:assert/strict");
const {
  assertAdmin,
  assertManager,
  normalizeSkills,
  normalizeRole,
  safeInteger,
  normalizeZone,
  sanitizeNotificationPayload,
  sanitizeVolunteerRecord,
  sanitizeClientError
} = require("../src/shared");

test("normalizeRole keeps supported roles", () => {
  assert.equal(normalizeRole("admin"), "admin");
  assert.equal(normalizeRole("coordinator"), "coordinator");
  assert.equal(normalizeRole("volunteer"), "volunteer");
});

test("normalizeRole falls back safely", () => {
  assert.equal(normalizeRole("owner"), "volunteer");
  assert.equal(normalizeRole(""), "volunteer");
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
  assert.equal(assertManager({ token: { role: "volunteer" } }), false);
  assert.equal(assertAdmin({ token: { role: "admin" } }), true);
  assert.equal(assertAdmin({ token: { role: "coordinator" } }), false);
});
