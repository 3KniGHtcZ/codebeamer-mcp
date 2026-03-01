import type { CbProject, CbPage } from "../../../src/client/codebeamer-client.js";

export function makeProject(overrides: Partial<CbProject> = {}): CbProject {
  return {
    id: 1,
    name: "Demo Project",
    keyName: "DEMO",
    description: "A demonstration project",
    category: "Development",
    closed: false,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-01T12:00:00Z",
    ...overrides,
  };
}

export function makeProjectPage(
  items: CbProject[] = [makeProject()],
  page = 1,
  pageSize = 25,
  total?: number,
): CbPage<CbProject> {
  return {
    page,
    pageSize,
    total: total ?? items.length,
    items,
  };
}
