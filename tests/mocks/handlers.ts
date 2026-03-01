import { http, HttpResponse } from "msw";
import { makeProject, makeProjectPage } from "./fixtures/projects.js";
import { makeTracker, makeTrackerField, makeTrackerPage } from "./fixtures/trackers.js";
import { makeItem, makeItemPage, makeRelation, makeComment } from "./fixtures/items.js";
import { makeUser } from "./fixtures/users.js";

const BASE = "https://test-cb.example.com/v3";

export const handlers = [
  // Projects
  http.get(`${BASE}/projects`, () =>
    HttpResponse.json(makeProjectPage([makeProject(), makeProject({ id: 2, name: "Second Project", keyName: "SEC" })], 1, 25, 2)),
  ),

  http.get(`${BASE}/projects/:id`, ({ params }) =>
    HttpResponse.json(makeProject({ id: Number(params.id) })),
  ),

  // Trackers
  http.get(`${BASE}/projects/:projectId/trackers`, () =>
    HttpResponse.json(makeTrackerPage()),
  ),

  http.get(`${BASE}/trackers/:id/fields`, () =>
    HttpResponse.json([
      makeTrackerField(),
      makeTrackerField({ fieldId: 2, name: "Description", type: "WikiTextFieldValue", required: false }),
    ]),
  ),

  http.get(`${BASE}/trackers/:id/items`, () =>
    HttpResponse.json(makeItemPage()),
  ),

  http.get(`${BASE}/trackers/:id`, ({ params }) =>
    HttpResponse.json(makeTracker({ id: Number(params.id) })),
  ),

  // Items
  http.get(`${BASE}/items/query`, () =>
    HttpResponse.json(makeItemPage([makeItem(), makeItem({ id: 501, name: "Another bug" })], 1, 25, 2)),
  ),

  http.get(`${BASE}/items/:id/relations`, () =>
    HttpResponse.json([makeRelation()]),
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
