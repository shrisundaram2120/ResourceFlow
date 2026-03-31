const STORAGE_KEY = "resourceflow-state-v1";

const sampleRequests = [
  {
    id: crypto.randomUUID(),
    organization: "Seva Relief Collective",
    title: "Community meal distribution at East Ward",
    category: "Food Distribution",
    urgency: 5,
    peopleNeeded: 4,
    zone: "East",
    beneficiaries: 180,
    skills: ["coordination", "food handling", "driving"],
    notes: "Need quick meal packing, distribution queue support, and one driver for pickup.",
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    organization: "Health on Wheels",
    title: "Mobile health camp registration support",
    category: "Medical Support",
    urgency: 4,
    peopleNeeded: 3,
    zone: "Central",
    beneficiaries: 95,
    skills: ["first aid", "registration", "translation"],
    notes: "Need volunteers to guide patients, manage forms, and support the nursing desk.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: crypto.randomUUID(),
    organization: "Night Shelter Network",
    title: "Blanket and shelter kit sorting",
    category: "Shelter Support",
    urgency: 3,
    peopleNeeded: 2,
    zone: "North",
    beneficiaries: 60,
    skills: ["logistics", "inventory"],
    notes: "Need people to sort donated kits and prepare intake tables before evening arrivals.",
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString()
  }
];

const sampleVolunteers = [
  {
    id: crypto.randomUUID(),
    name: "Aarav Mehta",
    zone: "East",
    availability: "Full Day",
    skills: ["coordination", "food handling", "driving"],
    transport: "Yes",
    experience: "Advanced"
  },
  {
    id: crypto.randomUUID(),
    name: "Diya Raman",
    zone: "Central",
    availability: "Half Day",
    skills: ["registration", "translation", "teaching"],
    transport: "No",
    experience: "Intermediate"
  },
  {
    id: crypto.randomUUID(),
    name: "Kabir Joshi",
    zone: "Central",
    availability: "Full Day",
    skills: ["first aid", "registration", "crowd support"],
    transport: "Yes",
    experience: "Advanced"
  },
  {
    id: crypto.randomUUID(),
    name: "Sana Patel",
    zone: "North",
    availability: "Weekend",
    skills: ["logistics", "inventory", "coordination"],
    transport: "Yes",
    experience: "Intermediate"
  },
  {
    id: crypto.randomUUID(),
    name: "Ishaan Verma",
    zone: "East",
    availability: "Evening",
    skills: ["driving", "food handling", "logistics"],
    transport: "Yes",
    experience: "Beginner"
  }
];

const requestSamples = [
  {
    organization: "Hope Kitchens",
    title: "Lunch delivery support for senior residents",
    category: "Food Distribution",
    urgency: 4,
    peopleNeeded: 3,
    zone: "West",
    beneficiaries: 80,
    skills: "food handling, elder care, coordination",
    notes: "Need one coordinator and two distribution volunteers for apartment clusters."
  },
  {
    organization: "Campus Care Hub",
    title: "Weekend learning support for migrant children",
    category: "Education Outreach",
    urgency: 3,
    peopleNeeded: 5,
    zone: "South",
    beneficiaries: 45,
    skills: "teaching, coordination, translation",
    notes: "Need volunteers for tutoring, registration, and activity management."
  }
];

const volunteerSamples = [
  {
    name: "Riya Shah",
    zone: "West",
    availability: "Weekend",
    skills: "elder care, food handling, coordination",
    transport: "No",
    experience: "Intermediate"
  },
  {
    name: "Aditya Kumar",
    zone: "South",
    availability: "Half Day",
    skills: "teaching, translation, registration",
    transport: "Yes",
    experience: "Beginner"
  }
];

const state = loadState();

const requestForm = document.querySelector("#requestForm");
const volunteerForm = document.querySelector("#volunteerForm");
const requestsList = document.querySelector("#requestsList");
const volunteersList = document.querySelector("#volunteersList");
const assignmentsList = document.querySelector("#assignmentsList");
const assignmentSummary = document.querySelector("#assignmentSummary");
const categoryBars = document.querySelector("#categoryBars");
const insightBox = document.querySelector("#insightBox");
const heroInsightTitle = document.querySelector("#heroInsightTitle");
const heroInsightText = document.querySelector("#heroInsightText");
const heroCoverage = document.querySelector("#heroCoverage");

document.querySelector("#seedDataButton").addEventListener("click", seedData);
document.querySelector("#resetButton").addEventListener("click", resetAll);
document.querySelector("#matchButton").addEventListener("click", runMatching);
document.querySelector("#exportButton").addEventListener("click", exportReport);
document.querySelector("#autofillRequestButton").addEventListener("click", () => autofillForm(requestForm, requestSamples));
document.querySelector("#autofillVolunteerButton").addEventListener("click", () => autofillForm(volunteerForm, volunteerSamples));

requestForm.addEventListener("submit", handleRequestSubmit);
volunteerForm.addEventListener("submit", handleVolunteerSubmit);

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((button) => button.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}Tab`).classList.add("active");
  });
});

render();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { requests: [], volunteers: [], assignments: [] };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      requests: Array.isArray(parsed.requests) ? parsed.requests : [],
      volunteers: Array.isArray(parsed.volunteers) ? parsed.volunteers : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : []
    };
  } catch (error) {
    return { requests: [], volunteers: [], assignments: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function handleRequestSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const request = {
    id: crypto.randomUUID(),
    organization: formData.get("organization").trim(),
    title: formData.get("title").trim(),
    category: formData.get("category"),
    urgency: Number(formData.get("urgency")),
    peopleNeeded: Number(formData.get("peopleNeeded")),
    zone: formData.get("zone"),
    beneficiaries: Number(formData.get("beneficiaries")),
    skills: parseSkills(formData.get("skills")),
    notes: formData.get("notes").trim(),
    createdAt: new Date().toISOString()
  };

  state.requests.unshift(request);
  state.assignments = [];
  saveState();
  event.currentTarget.reset();
  render();
  switchTab("requests");
}

function handleVolunteerSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const volunteer = {
    id: crypto.randomUUID(),
    name: formData.get("name").trim(),
    zone: formData.get("zone"),
    availability: formData.get("availability"),
    skills: parseSkills(formData.get("skills")),
    transport: formData.get("transport"),
    experience: formData.get("experience")
  };

  state.volunteers.unshift(volunteer);
  state.assignments = [];
  saveState();
  event.currentTarget.reset();
  render();
  switchTab("volunteers");
}

function parseSkills(rawValue) {
  return String(rawValue)
    .split(",")
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}

function seedData() {
  state.requests = structuredClone(sampleRequests);
  state.volunteers = structuredClone(sampleVolunteers);
  state.assignments = [];
  runMatching();
}

function resetAll() {
  state.requests = [];
  state.volunteers = [];
  state.assignments = [];
  saveState();
  render();
  switchTab("requests");
}

function runMatching() {
  const availableVolunteerIds = new Set(state.volunteers.map((volunteer) => volunteer.id));
  const assignments = [];
  const sortedRequests = [...state.requests].sort((left, right) => right.urgency - left.urgency);

  for (const request of sortedRequests) {
    const candidates = state.volunteers
      .filter((volunteer) => availableVolunteerIds.has(volunteer.id))
      .map((volunteer) => ({ volunteer, score: scoreVolunteerForRequest(volunteer, request) }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    const selected = candidates.slice(0, request.peopleNeeded);
    if (selected.length === 0) {
      continue;
    }

    selected.forEach((entry) => {
      assignments.push({
        id: crypto.randomUUID(),
        requestId: request.id,
        requestTitle: request.title,
        organization: request.organization,
        volunteerId: entry.volunteer.id,
        volunteerName: entry.volunteer.name,
        zone: request.zone,
        category: request.category,
        score: entry.score,
        reason: buildReason(entry.volunteer, request),
        urgency: request.urgency
      });
      availableVolunteerIds.delete(entry.volunteer.id);
    });
  }

  state.assignments = assignments;
  saveState();
  render();
  switchTab("assignments");
}
function scoreVolunteerForRequest(volunteer, request) {
  let score = 0;
  const skillMatches = volunteer.skills.filter((skill) => request.skills.includes(skill)).length;

  score += skillMatches * 28;
  score += volunteer.zone === request.zone ? 18 : 0;
  score += volunteer.transport === "Yes" ? 10 : 0;
  score += availabilityWeight(volunteer.availability);
  score += experienceWeight(volunteer.experience);
  score += request.urgency * 4;

  if (skillMatches === 0 && volunteer.zone !== request.zone) {
    score -= 20;
  }

  return Math.max(score, 0);
}

function availabilityWeight(availability) {
  switch (availability) {
    case "Full Day":
      return 16;
    case "Half Day":
      return 10;
    case "Weekend":
      return 8;
    case "Evening":
      return 6;
    default:
      return 0;
  }
}

function experienceWeight(experience) {
  switch (experience) {
    case "Advanced":
      return 14;
    case "Intermediate":
      return 9;
    case "Beginner":
      return 5;
    default:
      return 0;
  }
}

function buildReason(volunteer, request) {
  const reasons = [];
  const matchedSkills = volunteer.skills.filter((skill) => request.skills.includes(skill));

  if (matchedSkills.length > 0) {
    reasons.push(`skills match: ${matchedSkills.join(", ")}`);
  }
  if (volunteer.zone === request.zone) {
    reasons.push(`same zone: ${request.zone}`);
  }
  if (volunteer.transport === "Yes") {
    reasons.push("can travel independently");
  }
  reasons.push(`${volunteer.experience.toLowerCase()} experience`);

  return reasons.join(" | ");
}

function render() {
  renderRequests();
  renderVolunteers();
  renderAssignments();
  renderMetrics();
  renderAnalytics();
}

function renderRequests() {
  requestsList.innerHTML = "";
  if (state.requests.length === 0) {
    requestsList.append(emptyMessage("No requests yet. Add one or load the demo data."));
    return;
  }

  state.requests.forEach((request) => {
    const template = document.querySelector("#requestCardTemplate");
    const card = template.content.firstElementChild.cloneNode(true);

    card.querySelector(".urgency-pill").textContent = urgencyLabel(request.urgency);
    card.querySelector(".urgency-pill").style.background = urgencyColor(request.urgency);
    card.querySelector(".timestamp").textContent = formatRelativeTime(request.createdAt);
    card.querySelector(".card-title").textContent = request.title;
    card.querySelector(".card-subtitle").textContent = `${request.organization} | ${request.category}`;
    card.querySelector(".notes").textContent = request.notes || "No extra notes provided.";

    const dataPoints = card.querySelector(".data-points");
    [
      `${request.peopleNeeded} volunteers needed`,
      `${request.zone} zone`,
      `${request.beneficiaries} beneficiaries`,
      `skills: ${request.skills.join(", ")}`
    ].forEach((item) => dataPoints.append(chip(item)));

    requestsList.append(card);
  });
}

function renderVolunteers() {
  volunteersList.innerHTML = "";
  if (state.volunteers.length === 0) {
    volunteersList.append(emptyMessage("No volunteers yet. Register one or load the demo data."));
    return;
  }

  state.volunteers.forEach((volunteer) => {
    const template = document.querySelector("#volunteerCardTemplate");
    const card = template.content.firstElementChild.cloneNode(true);

    card.querySelector(".availability-pill").textContent = volunteer.availability;
    card.querySelector(".availability-pill").style.background = "linear-gradient(135deg, #58c39b, #0f8d84)";
    card.querySelector(".experience-tag").textContent = volunteer.experience;
    card.querySelector(".card-title").textContent = volunteer.name;
    card.querySelector(".card-subtitle").textContent = `${volunteer.zone} zone | ${volunteer.transport === "Yes" ? "Has transport" : "No transport"}`;

    const dataPoints = card.querySelector(".data-points");
    [
      `skills: ${volunteer.skills.join(", ")}`,
      volunteer.availability,
      volunteer.transport === "Yes" ? "Can cover distant requests" : "Local coverage only"
    ].forEach((item) => dataPoints.append(chip(item)));

    volunteersList.append(card);
  });
}

function renderAssignments() {
  assignmentsList.innerHTML = "";
  if (state.assignments.length === 0) {
    assignmentsList.append(emptyMessage("No assignments yet. Run the matching engine after adding data."));
    assignmentSummary.textContent = "Run the matching engine to generate assignments.";
    return;
  }

  const grouped = groupAssignmentsByRequest();
  assignmentSummary.textContent = `Generated ${state.assignments.length} assignments across ${Object.keys(grouped).length} request(s). The engine prioritizes urgency, skill overlap, zone fit, transport, and experience.`;

  Object.values(grouped).forEach((requestAssignments) => {
    const template = document.querySelector("#assignmentCardTemplate");
    const card = template.content.firstElementChild.cloneNode(true);
    const first = requestAssignments[0];

    card.querySelector(".score-tag").textContent = `Avg. score ${Math.round(average(requestAssignments.map((item) => item.score)))}`;
    card.querySelector(".card-title").textContent = first.requestTitle;
    card.querySelector(".card-subtitle").textContent = `${first.organization} | ${first.category} | ${first.zone} zone`;
    card.querySelector(".notes").textContent = requestAssignments.map((item) => `${item.volunteerName}: ${item.reason}`).join(" || ");

    const dataPoints = card.querySelector(".data-points");
    requestAssignments.forEach((item) => dataPoints.append(chip(item.volunteerName)));

    assignmentsList.append(card);
  });
}

function renderMetrics() {
  const assignmentVolunteerIds = new Set(state.assignments.map((assignment) => assignment.volunteerId));
  const beneficiaries = state.requests.reduce((sum, request) => sum + request.beneficiaries, 0);
  const coverage = calculateCoverage();

  document.querySelector("#requestsCount").textContent = state.requests.length;
  document.querySelector("#volunteersCount").textContent = state.volunteers.length;
  document.querySelector("#assignmentsCount").textContent = state.assignments.length > 0 ? `${state.assignments.length}/${assignmentVolunteerIds.size}` : state.assignments.length;
  document.querySelector("#beneficiariesCount").textContent = beneficiaries;
  document.querySelector("#heroCoverage").textContent = `${coverage}%`;

  const topInsight = buildInsight();
  heroInsightTitle.textContent = topInsight.title;
  heroInsightText.textContent = topInsight.text;
}

function renderAnalytics() {
  const coverage = calculateCoverage();
  const criticalFillRate = calculateCriticalFillRate();
  const utilization = calculateUtilization();

  document.querySelector("#coverageMetric").textContent = `${coverage}%`;
  document.querySelector("#criticalMetric").textContent = `${criticalFillRate}%`;
  document.querySelector("#utilizationMetric").textContent = `${utilization}%`;

  categoryBars.innerHTML = "";
  const categoryMap = state.requests.reduce((accumulator, request) => {
    accumulator[request.category] = (accumulator[request.category] || 0) + 1;
    return accumulator;
  }, {});

  const entries = Object.entries(categoryMap);
  if (entries.length === 0) {
    categoryBars.append(emptyMessage("No category demand yet."));
  } else {
    const maxValue = Math.max(...entries.map(([, count]) => count));
    entries.sort((left, right) => right[1] - left[1]).forEach(([category, count]) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `
        <div class="bar-head">
          <span>${category}</span>
          <span>${count}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${(count / maxValue) * 100}%"></div>
        </div>
      `;
      categoryBars.append(row);
    });
  }

  insightBox.textContent = buildInsight().longText;
}
function buildInsight() {
  if (state.requests.length === 0 && state.volunteers.length === 0) {
    return {
      title: "Start with demo data",
      text: "Seed the workspace to see automatic volunteer matching in action.",
      longText: "Add data or load the demo to generate operational insights."
    };
  }

  const criticalRequests = state.requests.filter((request) => request.urgency >= 4);
  const unfilledCritical = criticalRequests.filter((request) => {
    const assignedCount = state.assignments.filter((assignment) => assignment.requestId === request.id).length;
    return assignedCount < request.peopleNeeded;
  });

  if (unfilledCritical.length > 0) {
    const top = unfilledCritical.sort((left, right) => right.urgency - left.urgency)[0];
    return {
      title: "Critical request needs attention",
      text: `${top.title} in ${top.zone} still needs more coverage.`,
      longText: `The highest-risk gap is "${top.title}" for ${top.organization}. Recruit more volunteers with ${top.skills.join(", ")} skills near the ${top.zone} zone to improve response speed.`
    };
  }

  const dominantCategory = mostCommonCategory();
  return {
    title: "Coverage looks strong",
    text: `Most demand right now is in ${dominantCategory}.`,
    longText: `The system is covering the current workload well. The strongest demand pattern is ${dominantCategory}, so your next scaling step should be targeted volunteer recruitment and local partnerships in that service area.`
  };
}

function calculateCoverage() {
  if (state.requests.length === 0) {
    return 0;
  }
  const coveredIds = new Set(state.assignments.map((assignment) => assignment.requestId));
  return Math.round((coveredIds.size / state.requests.length) * 100);
}

function calculateCriticalFillRate() {
  const criticalRequests = state.requests.filter((request) => request.urgency >= 4);
  if (criticalRequests.length === 0) {
    return 0;
  }

  const filledCount = criticalRequests.filter((request) => {
    const assignedCount = state.assignments.filter((assignment) => assignment.requestId === request.id).length;
    return assignedCount >= request.peopleNeeded;
  }).length;

  return Math.round((filledCount / criticalRequests.length) * 100);
}

function calculateUtilization() {
  if (state.volunteers.length === 0) {
    return 0;
  }
  const usedVolunteerIds = new Set(state.assignments.map((assignment) => assignment.volunteerId));
  return Math.round((usedVolunteerIds.size / state.volunteers.length) * 100);
}

function urgencyLabel(level) {
  switch (level) {
    case 5:
      return "Critical";
    case 4:
      return "High";
    case 3:
      return "Moderate";
    case 2:
      return "Low";
    default:
      return "Routine";
  }
}

function urgencyColor(level) {
  switch (level) {
    case 5:
      return "linear-gradient(135deg, #c94b2c, #ef6b4a)";
    case 4:
      return "linear-gradient(135deg, #ec7a3d, #f6b544)";
    case 3:
      return "linear-gradient(135deg, #d9a437, #f1cf68)";
    case 2:
      return "linear-gradient(135deg, #4ea56d, #58c39b)";
    default:
      return "linear-gradient(135deg, #5e8db5, #7ca6c8)";
  }
}

function groupAssignmentsByRequest() {
  return state.assignments.reduce((accumulator, assignment) => {
    accumulator[assignment.requestId] ||= [];
    accumulator[assignment.requestId].push(assignment);
    return accumulator;
  }, {});
}

function average(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function emptyMessage(text) {
  const box = document.createElement("div");
  box.className = "empty-message";
  box.textContent = text;
  return box;
}

function chip(text) {
  const node = document.createElement("span");
  node.className = "data-chip";
  node.textContent = text;
  return node;
}

function formatRelativeTime(value) {
  const created = new Date(value).getTime();
  const minutes = Math.max(1, Math.round((Date.now() - created) / 60000));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day ago`;
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${name}Tab`);
  });
}

function mostCommonCategory() {
  if (state.requests.length === 0) {
    return "community support";
  }

  const counts = state.requests.reduce((accumulator, request) => {
    accumulator[request.category] = (accumulator[request.category] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0][0];
}

function autofillForm(form, samples) {
  const sample = samples[Math.floor(Math.random() * samples.length)];
  Object.entries(sample).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  });
}

function exportReport() {
  const report = {
    exportedAt: new Date().toISOString(),
    metrics: {
      totalRequests: state.requests.length,
      totalVolunteers: state.volunteers.length,
      totalAssignments: state.assignments.length,
      coverage: calculateCoverage(),
      criticalFillRate: calculateCriticalFillRate(),
      utilization: calculateUtilization()
    },
    requests: state.requests,
    volunteers: state.volunteers,
    assignments: state.assignments
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "resourceflow-report.json";
  link.click();
  URL.revokeObjectURL(url);
}
