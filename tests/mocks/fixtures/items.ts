import type {
  CbItem,
  CbRelation,
  CbComment,
  CbPage,
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

export function makeItemPage(
  items: CbItem[] = [makeItem()],
  page = 1,
  pageSize = 25,
  total?: number,
): CbPage<CbItem> {
  return {
    page,
    pageSize,
    total: total ?? items.length,
    items,
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

export function makeComment(
  overrides: Partial<CbComment> = {},
): CbComment {
  return {
    id: 300,
    text: { markup: "wiki", value: "I can reproduce this on Chrome 120." },
    createdAt: "2024-03-02T11:00:00Z",
    createdBy: { id: 5, name: "john.doe" },
    ...overrides,
  };
}
