import { http, HttpResponse } from "msw";
import { makeProject } from "./fixtures/projects.js";
import { makeTracker, makeTrackerField } from "./fixtures/trackers.js";
import { makeItem, makeItemRelationsPage, makeComment } from "./fixtures/items.js";
import { makeUser } from "./fixtures/users.js";

const BASE = "https://test-cb.example.com/v3";

export const handlers = [
  // Projects
  http.get(`${BASE}/projects`, () =>
    HttpResponse.json([makeProject(), makeProject({ id: 2, name: "Second Project", keyName: "SEC" })]),
  ),

  http.get(`${BASE}/projects/:id`, ({ params }) =>
    HttpResponse.json(makeProject({ id: Number(params.id) })),
  ),

  // Trackers
  http.get(`${BASE}/projects/:projectId/trackers`, () =>
    HttpResponse.json([makeTracker()]),
  ),

  http.get(`${BASE}/trackers/:id/fields`, () =>
    HttpResponse.json([
      makeTrackerField(),
      makeTrackerField({ fieldId: 2, name: "Description", type: "WikiTextFieldValue", required: false }),
    ]),
  ),

  http.get(`${BASE}/trackers/:id/items`, () =>
    HttpResponse.json([makeItem()]),
  ),

  http.get(`${BASE}/trackers/:id`, ({ params }) =>
    HttpResponse.json(makeTracker({ id: Number(params.id) })),
  ),

  // Items
  http.get(`${BASE}/items/query`, () =>
    HttpResponse.json([makeItem(), makeItem({ id: 501, name: "Another bug" })]),
  ),

  http.get(`${BASE}/items/:id/relations`, () =>
    HttpResponse.json(makeItemRelationsPage()),
  ),

  http.get(`${BASE}/items/:id/comments`, () =>
    HttpResponse.json([makeComment(), makeComment({ id: 301, text: { value: "Fixed in v2.1" }, createdBy: { id: 2, name: "jane.smith" } })]),
  ),

  http.get(`${BASE}/items/:id`, ({ params }) =>
    HttpResponse.json(makeItem({ id: Number(params.id) })),
  ),

  // Users
  http.get(`${BASE}/users/:id`, ({ params }) =>
    HttpResponse.json(makeUser({ id: Number(params.id) })),
  ),
];
