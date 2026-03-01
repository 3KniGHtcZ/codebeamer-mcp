#!/usr/bin/env node
/**
 * Lightweight mock of the Codebeamer v3 REST API for local testing.
 * Serves realistic fixture data on http://localhost:3001/v3/
 */
import { createServer } from "http";

const PORT = 3001;

// --- Fixture data ---

const projects = [
  { id: 1, name: "Phoenix Platform", keyName: "PHOE", description: "Core product platform", category: "Development", closed: false, createdAt: "2023-06-01T08:00:00Z", updatedAt: "2024-11-20T14:30:00Z" },
  { id: 2, name: "Mobile App", keyName: "MOB", description: "iOS and Android client", category: "Development", closed: false, createdAt: "2023-09-01T08:00:00Z", updatedAt: "2024-10-05T10:00:00Z" },
  { id: 3, name: "Legacy Backend", keyName: "LGB", description: "End-of-life backend service", category: "Maintenance", closed: true, createdAt: "2021-01-01T08:00:00Z", updatedAt: "2024-01-31T00:00:00Z" },
];

const trackers = [
  { id: 101, name: "Bug Reports", type: { id: 1, name: "Bug" }, project: { id: 1, name: "Phoenix Platform" }, description: "Track software defects", keyName: "BUG" },
  { id: 102, name: "User Stories", type: { id: 2, name: "Requirement" }, project: { id: 1, name: "Phoenix Platform" }, description: "Feature requirements", keyName: "STORY" },
  { id: 103, name: "Test Cases", type: { id: 3, name: "TestCase" }, project: { id: 1, name: "Phoenix Platform" }, description: "Manual and automated tests", keyName: "TC" },
  { id: 104, name: "Sprint Tasks", type: { id: 4, name: "Task" }, project: { id: 2, name: "Mobile App" }, description: "Engineering tasks", keyName: "TASK" },
];

const trackerFields = {
  101: [
    { fieldId: 1, name: "Summary", type: "TextFieldValue", required: true, hidden: false },
    { fieldId: 2, name: "Description", type: "WikiTextFieldValue", required: false, hidden: false },
    { fieldId: 3, name: "Status", type: "ChoiceFieldValue", required: true, hidden: false },
    { fieldId: 4, name: "Priority", type: "ChoiceFieldValue", required: true, hidden: false },
    { fieldId: 5, name: "Assigned To", type: "UserFieldValue", required: false, hidden: false },
    { fieldId: 6, name: "Severity", type: "ChoiceFieldValue", required: false, hidden: false },
    { fieldId: 7, name: "Build Found", type: "TextFieldValue", required: false, hidden: false },
  ],
  102: [
    { fieldId: 1, name: "Summary", type: "TextFieldValue", required: true, hidden: false },
    { fieldId: 2, name: "Description", type: "WikiTextFieldValue", required: false, hidden: false },
    { fieldId: 8, name: "Story Points", type: "IntegerFieldValue", required: false, hidden: false },
    { fieldId: 9, name: "Sprint", type: "ChoiceFieldValue", required: false, hidden: false },
    { fieldId: 10, name: "Epic", type: "ChoiceFieldValue", required: false, hidden: false },
  ],
  default: [
    { fieldId: 1, name: "Summary", type: "TextFieldValue", required: true, hidden: false },
    { fieldId: 2, name: "Description", type: "WikiTextFieldValue", required: false, hidden: false },
  ],
};

const items = [
  {
    id: 1001,
    name: "Login button unresponsive on Safari",
    description: { markup: "wiki", value: "Steps to reproduce:\n1. Open Safari 17\n2. Navigate to /login\n3. Enter credentials\n4. Click 'Sign In' button\n\nExpected: Login succeeds\nActual: Nothing happens, no network request sent" },
    tracker: { id: 101, name: "Bug Reports" },
    project: { id: 1, name: "Phoenix Platform" },
    status: { id: 10, name: "Open" },
    priority: { id: 3, name: "High" },
    assignedTo: [{ id: 5, name: "jan.novak" }, { id: 6, name: "petra.kral" }],
    createdAt: "2024-10-15T09:00:00Z",
    updatedAt: "2024-10-18T14:30:00Z",
    submittedAt: "2024-10-15T09:00:00Z",
    createdBy: { id: 2, name: "marie.novotna" },
    modifiedBy: { id: 5, name: "jan.novak" },
    storyPoints: null,
    customFields: [
      { fieldId: 6, name: "Severity", value: { id: 1, name: "Critical" } },
      { fieldId: 7, name: "Build Found", value: "2024.10.1-rc3" },
    ],
  },
  {
    id: 1002,
    name: "Password reset email not delivered",
    description: { markup: "wiki", value: "Users report not receiving password reset emails. Issue started after the email service migration on 2024-10-10." },
    tracker: { id: 101, name: "Bug Reports" },
    project: { id: 1, name: "Phoenix Platform" },
    status: { id: 11, name: "In Progress" },
    priority: { id: 2, name: "Critical" },
    assignedTo: [{ id: 7, name: "tomas.pospisil" }],
    createdAt: "2024-10-16T11:00:00Z",
    updatedAt: "2024-10-20T09:00:00Z",
    submittedAt: "2024-10-16T11:00:00Z",
    createdBy: { id: 3, name: "lukas.benes" },
    modifiedBy: { id: 7, name: "tomas.pospisil" },
    customFields: [
      { fieldId: 6, name: "Severity", value: { id: 1, name: "Critical" } },
      { fieldId: 7, name: "Build Found", value: "2024.10.1" },
    ],
  },
  {
    id: 1003,
    name: "Implement dark mode toggle",
    description: { markup: "wiki", value: "As a user, I want to switch between light and dark mode so that I can use the app comfortably in different lighting conditions.\n\nAcceptance criteria:\n- Toggle accessible from user settings\n- Preference persisted across sessions\n- All screens support dark mode" },
    tracker: { id: 102, name: "User Stories" },
    project: { id: 1, name: "Phoenix Platform" },
    status: { id: 12, name: "Planned" },
    priority: { id: 4, name: "Normal" },
    assignedTo: [],
    createdAt: "2024-09-01T08:00:00Z",
    updatedAt: "2024-09-05T10:00:00Z",
    submittedAt: "2024-09-01T08:00:00Z",
    createdBy: { id: 1, name: "admin" },
    modifiedBy: { id: 1, name: "admin" },
    storyPoints: 8,
    customFields: [
      { fieldId: 9, name: "Sprint", value: { id: 20, name: "Sprint 14" } },
    ],
  },
];

const relations = {
  1001: [
    { id: 201, type: { id: 1, name: "depends on" }, itemRevision: { id: 1002, name: "Password reset email not delivered", version: 1 } },
  ],
  1002: [
    { id: 202, type: { id: 2, name: "is child of" }, itemRevision: { id: 1003, name: "Implement dark mode toggle", version: 2 } },
  ],
  default: [],
};

const comments = {
  1001: [
    { id: 301, text: { value: "Confirmed on Safari 17.2 on macOS Sonoma. Not reproducible on Chrome or Firefox." }, createdAt: "2024-10-15T13:00:00Z", createdBy: { id: 5, name: "jan.novak" } },
    { id: 302, text: { value: "Found the root cause: Safari blocks form submission when the button is inside a shadow DOM. Will open a PR today." }, createdAt: "2024-10-18T10:00:00Z", createdBy: { id: 6, name: "petra.kral" } },
    { id: 303, text: { value: "PR #847 merged. Please verify on staging." }, createdAt: "2024-10-18T16:30:00Z", createdBy: { id: 6, name: "petra.kral" } },
  ],
  1002: [
    { id: 304, text: { value: "Checked the email service logs - emails are being queued but the new SMTP relay is rejecting them due to SPF mismatch." }, createdAt: "2024-10-17T09:00:00Z", createdBy: { id: 7, name: "tomas.pospisil" } },
  ],
  default: [],
};

const users = {
  1: { id: 1, name: "admin", firstName: "System", lastName: "Administrator", email: "admin@example.com", status: "Activated", registryDate: "2020-01-01T00:00:00Z" },
  2: { id: 2, name: "marie.novotna", firstName: "Marie", lastName: "Novotná", email: "marie.novotna@example.com", status: "Activated", registryDate: "2021-03-15T08:00:00Z" },
  3: { id: 3, name: "lukas.benes", firstName: "Lukáš", lastName: "Beneš", email: "lukas.benes@example.com", status: "Activated", registryDate: "2021-06-01T08:00:00Z" },
  5: { id: 5, name: "jan.novak", firstName: "Jan", lastName: "Novák", email: "jan.novak@example.com", status: "Activated", registryDate: "2022-01-10T08:00:00Z" },
  6: { id: 6, name: "petra.kral", firstName: "Petra", lastName: "Král", email: "petra.kral@example.com", status: "Activated", registryDate: "2022-05-01T08:00:00Z" },
  7: { id: 7, name: "tomas.pospisil", firstName: "Tomáš", lastName: "Pospíšil", email: "tomas.pospisil@example.com", status: "Activated", registryDate: "2023-01-15T08:00:00Z" },
};

// --- HTTP Server ---

function page(allItems, pageNum, pageSize) {
  const start = (pageNum - 1) * pageSize;
  return { page: pageNum, pageSize, total: allItems.length, items: allItems.slice(start, start + pageSize) };
}

function json(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(data));
}

function notFound(res, msg = "Not found") {
  json(res, { message: msg }, 404);
}

const server = createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const p = parseInt(url.searchParams.get("page") ?? "1");
  const ps = parseInt(url.searchParams.get("pageSize") ?? "25");

  console.log(`${req.method} ${path}`);

  // Projects - real Codebeamer API returns a plain array (no pagination wrapper)
  if (path === "/v3/projects") {
    const start = (p - 1) * ps;
    return json(res, projects.slice(start, start + ps));
  }
  const projMatch = path.match(/^\/v3\/projects\/(\d+)$/);
  if (projMatch) {
    const proj = projects.find(x => x.id === Number(projMatch[1]));
    return proj ? json(res, proj) : notFound(res, `Project ${projMatch[1]} not found`);
  }

  // Trackers in project - returns plain array
  const projTrackersMatch = path.match(/^\/v3\/projects\/(\d+)\/trackers$/);
  if (projTrackersMatch) {
    const projectId = Number(projTrackersMatch[1]);
    const filtered = trackers.filter(t => t.project.id === projectId);
    const list = filtered.length ? filtered : trackers;
    return json(res, list.slice((p - 1) * ps, p * ps));
  }

  // Tracker fields
  const trackerFieldsMatch = path.match(/^\/v3\/trackers\/(\d+)\/fields$/);
  if (trackerFieldsMatch) {
    const id = Number(trackerFieldsMatch[1]);
    return json(res, trackerFields[id] ?? trackerFields.default);
  }

  // Tracker items - returns plain array
  const trackerItemsMatch = path.match(/^\/v3\/trackers\/(\d+)\/items$/);
  if (trackerItemsMatch) {
    const trackerId = Number(trackerItemsMatch[1]);
    const filtered = items.filter(i => i.tracker.id === trackerId);
    const list = filtered.length ? filtered : items;
    return json(res, list.slice((p - 1) * ps, p * ps));
  }

  // Single tracker
  const trackerMatch = path.match(/^\/v3\/trackers\/(\d+)$/);
  if (trackerMatch) {
    const tracker = trackers.find(t => t.id === Number(trackerMatch[1]));
    return tracker ? json(res, tracker) : notFound(res, `Tracker ${trackerMatch[1]} not found`);
  }

  // Item query - returns plain array
  if (path === "/v3/items/query") {
    const q = url.searchParams.get("queryString") ?? "";
    const filtered = q.includes("status.name = \"In Progress\"")
      ? items.filter(i => i.status.name === "In Progress")
      : items;
    return json(res, filtered.slice((p - 1) * ps, p * ps));
  }

  // Item relations
  const itemRelationsMatch = path.match(/^\/v3\/items\/(\d+)\/relations$/);
  if (itemRelationsMatch) {
    const id = Number(itemRelationsMatch[1]);
    return json(res, relations[id] ?? relations.default);
  }

  // Item comments
  const itemCommentsMatch = path.match(/^\/v3\/items\/(\d+)\/comments$/);
  if (itemCommentsMatch) {
    const id = Number(itemCommentsMatch[1]);
    return json(res, comments[id] ?? comments.default);
  }

  // Single item
  const itemMatch = path.match(/^\/v3\/items\/(\d+)$/);
  if (itemMatch) {
    const item = items.find(i => i.id === Number(itemMatch[1]));
    return item ? json(res, item) : notFound(res, `Item ${itemMatch[1]} not found`);
  }

  // Users
  const userMatch = path.match(/^\/v3\/users\/(\d+)$/);
  if (userMatch) {
    const user = users[Number(userMatch[1])];
    return user ? json(res, user) : notFound(res, `User ${userMatch[1]} not found`);
  }

  notFound(res, `Unknown path: ${path}`);
});

server.listen(PORT, () => {
  console.log(`Mock Codebeamer API running at http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET /v3/projects");
  console.log("  GET /v3/projects/:id");
  console.log("  GET /v3/projects/:id/trackers");
  console.log("  GET /v3/trackers/:id");
  console.log("  GET /v3/trackers/:id/fields");
  console.log("  GET /v3/trackers/:id/items");
  console.log("  GET /v3/items/query?queryString=...");
  console.log("  GET /v3/items/:id");
  console.log("  GET /v3/items/:id/relations");
  console.log("  GET /v3/items/:id/comments");
  console.log("  GET /v3/users/:id");
});
