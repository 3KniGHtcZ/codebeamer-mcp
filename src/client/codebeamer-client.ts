import { HttpClient } from "./http-client.js";

// --- Response types (only fields used by formatters) ---

export interface CbReference {
  id: number;
  name: string;
  type?: string;
}

export interface CbProject {
  id: number;
  name: string;
  keyName: string;
  description?: string;
  category?: string;
  closed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CbTracker {
  id: number;
  name: string;
  type?: CbReference;
  project?: CbReference;
  description?: string;
  keyName?: string;
}

export interface CbTrackerField {
  fieldId: number;
  name: string;
  type?: string;
  required?: boolean;
  hidden?: boolean;
}

export interface CbItem {
  id: number;
  name: string;
  description?: { markup?: string; value?: string };
  tracker?: CbReference;
  project?: CbReference;
  status?: CbReference;
  priority?: CbReference;
  assignedTo?: CbReference[];
  categories?: CbReference[];
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  createdBy?: CbReference;
  modifiedBy?: CbReference;
  storyPoints?: number;
  customFields?: Array<{ fieldId: number; name: string; value: unknown }>;
}

export interface CbRelation {
  id: number;
  type?: CbReference;
  itemRevision?: { id: number; name: string; version?: number };
}

export interface CbComment {
  id: number;
  text?: { markup?: string; value?: string };
  createdAt?: string;
  createdBy?: CbReference;
}

export interface CbUser {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  registryDate?: string;
}

export interface CbPage<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

// --- Client ---

export class CodebeamerClient {
  constructor(private readonly http: HttpClient) {}

  // Projects
  listProjects(page: number, pageSize: number): Promise<CbPage<CbProject>> {
    return this.http.get("/projects", {
      params: { page, pageSize },
      resource: "projects",
    });
  }

  getProject(id: number): Promise<CbProject> {
    return this.http.get(`/projects/${id}`, { resource: `project ${id}` });
  }

  // Trackers
  listTrackers(
    projectId: number,
    page: number,
    pageSize: number,
  ): Promise<CbPage<CbTracker>> {
    return this.http.get(`/projects/${projectId}/trackers`, {
      params: { page, pageSize },
      resource: `trackers for project ${projectId}`,
    });
  }

  getTracker(id: number): Promise<CbTracker> {
    return this.http.get(`/trackers/${id}`, { resource: `tracker ${id}` });
  }

  getTrackerFields(id: number): Promise<CbTrackerField[]> {
    return this.http.get(`/trackers/${id}/fields`, {
      resource: `fields for tracker ${id}`,
    });
  }

  // Items
  getItem(id: number): Promise<CbItem> {
    return this.http.get(`/items/${id}`, { resource: `item ${id}` });
  }

  listTrackerItems(
    trackerId: number,
    page: number,
    pageSize: number,
  ): Promise<CbPage<CbItem>> {
    return this.http.get(`/trackers/${trackerId}/items`, {
      params: { page, pageSize },
      resource: `items for tracker ${trackerId}`,
    });
  }

  searchItems(
    queryString: string,
    page: number,
    pageSize: number,
  ): Promise<CbPage<CbItem>> {
    return this.http.get("/items/query", {
      params: { queryString, page, pageSize },
      resource: "item query",
    });
  }

  // Item details
  getItemRelations(id: number): Promise<CbRelation[]> {
    return this.http.get(`/items/${id}/relations`, {
      resource: `relations for item ${id}`,
    });
  }

  getItemComments(id: number): Promise<CbComment[]> {
    return this.http.get(`/items/${id}/comments`, {
      resource: `comments for item ${id}`,
    });
  }

  // Users
  getUser(id: number): Promise<CbUser> {
    return this.http.get(`/users/${id}`, { resource: `user ${id}` });
  }
}
