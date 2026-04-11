import type {
  CbItem,
  CbRelation,
  CbItemRelationsPage,
  CbComment,
} from "../../../src/client/codebeamer-client.js";

export function makeItem(overrides: Partial<CbItem> = {}): CbItem {
  return {
    id: 500,
    name: "Login button does not respond",
    description: { markup: "wiki", value: "Steps to reproduce: click login..." },
    tracker: { id: 100, name: "Bug Tracker" },
    project: { id: 1, name: "Demo Project" },
    status: { id: 10, name: "Open" },
    priority: { id: 3, name: "High" },
    assignedTo: [{ id: 5, name: "john.doe" }],
    categories: [],
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-03-10T14:30:00Z",
    submittedAt: "2024-03-01T09:00:00Z",
    createdBy: { id: 2, name: "jane.smith" },
    modifiedBy: { id: 5, name: "john.doe" },
    storyPoints: 5,
    customFields: [
      { fieldId: 1000, name: "Environment", value: "Production" },
      {
        fieldId: 1001,
        name: "Component",
        value: { id: 50, name: "Authentication" },
      },
    ],
    ...overrides,
  };
}

export function makeRelation(
  overrides: Partial<CbRelation> = {},
): CbRelation {
  return {
    id: 200,
    type: { id: 1, name: "depends on" },
    itemRevision: { id: 501, name: "Fix auth module", version: 3 },
    ...overrides,
  };
}

export function makeItemRelationsPage(
  overrides: Partial<CbItemRelationsPage> = {},
): CbItemRelationsPage {
  return {
    outgoingAssociations: [makeRelation()],
    incomingAssociations: [makeRelation({ id: 201, type: { id: 2, name: "blocks" }, itemRevision: { id: 502, name: "Login crash on iOS", version: 1 } })],
    upstreamReferences: [makeRelation({ id: 202, type: { id: 3, name: "derived from" }, itemRevision: { id: 301, name: "REQ-42: Auth must work on all browsers", version: 2 } })],
    downstreamReferences: [makeRelation({ id: 203, type: { id: 4, name: "covers" }, itemRevision: { id: 601, name: "TC-10: Verify login on Safari", version: 1 } })],
    ...overrides,
  };
}

export function makeComment(
  overrides: Partial<CbComment> = {},
): CbComment {
  return {
    id: 300,
    comment: "I can reproduce this on Chrome 120.",
    commentFormat: "PlainText",
    createdAt: "2024-03-02T11:00:00Z",
    createdBy: { id: 5, name: "john.doe" },
    ...overrides,
  };
}
