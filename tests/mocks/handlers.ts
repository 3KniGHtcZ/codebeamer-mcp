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

  // --- Write operations ---

  // Create item
  http.post(`${BASE}/trackers/:trackerId/items`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      makeItem({
        id: 600,
        name: body.name as string,
        description: body.description as string | undefined,
        status: body.status as { id: number; name: string } | undefined,
        priority: body.priority as { id: number; name: string } | undefined,
        storyPoints: body.storyPoints as number | undefined,
      }),
      { status: 201 },
    );
  }),

  // Update item
  http.put(`${BASE}/items/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      makeItem({
        id: Number(params.id),
        ...(body.name != null && { name: body.name as string }),
        ...(body.status != null && { status: body.status as { id: number; name: string } }),
      }),
    );
  }),

  // Add comment
  http.post(`${BASE}/items/:itemId/comments`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      makeComment({
        id: 350,
        text: body.comment as string,
        createdBy: { id: 5, name: "john.doe" },
      }),
      { status: 201 },
    );
  }),

  // Create association
  http.post(`${BASE}/associations`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 400,
        from: body.from,
        to: body.to,
        type: { ...(body.type as Record<string, unknown>), name: "depends on" },
        description: body.description ?? null,
      },
      { status: 201 },
    );
  }),
];
