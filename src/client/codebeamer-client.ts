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
  keyName?: string;
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

export interface CbTrackerSchemaOption {
  id: number;
  name: string;
}

export interface CbTrackerSchemaField {
  id: number;
  name: string;
  type?: string;
  trackerItemField?: string;
  legacyRestName?: string;
  options?: CbTrackerSchemaOption[];
}

export interface CbItem {
  id: number;
  name: string;
  description?: string | { markup?: string; value?: string };
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
  customFields?: Array<{ fieldId: number; name: string; value?: unknown; values?: Array<{ id: number; name?: string; type?: string }> }>;
}

export interface CbRelation {
  id: number;
  type?: CbReference;
  itemRevision?: { id: number; name: string; version?: number };
}

export interface CbItemRelationsPage {
  outgoingAssociations?: CbRelation[];
  incomingAssociations?: CbRelation[];
  upstreamReferences?: CbRelation[];
  downstreamReferences?: CbRelation[];
}

export interface CbComment {
  id: number;
  text?: string | { markup?: string; value?: string };
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

// --- Request types for write operations ---

export interface CbCreateItemRequest {
  name: string;
  description?: string;
  categories?: Array<{ id: number; type: string }>;
  status?: { id: number };
  priority?: { id: number };
  assignedTo?: Array<{ id: number }>;
  storyPoints?: number;
  customFields?: Array<{ fieldId: number; type: string; value: unknown }>;
}

export interface CbUpdateItemRequest {
  name?: string;
  description?: string;
  status?: { id: number; type?: string };
  priority?: { id: number };
  assignedTo?: Array<{ id: number }>;
  storyPoints?: number;
  customFields?: Array<{ fieldId: number; type: string; values?: Array<{ id: number; type: string }>; value?: unknown }>;
}

export interface CbEditableField {
  fieldId: number;
  name: string;
  values?: Array<{ id: number; name?: string; type?: string }>;
  value?: unknown;
  type?: string;
}

export interface CbCreateCommentRequest {
  comment: string;
  commentFormat?: string;
}

export interface CbCreateAssociationRequest {
  from: { id: number };
  to: { id: number };
  type: { id: number };
  description?: string;
}

export interface CbAssociation {
  id: number;
  from?: CbReference;
  to?: CbReference;
  type?: CbReference;
  description?: string;
}

// --- Helpers ---

// Codebeamer API returns either a plain array or a paginated object depending on the endpoint/version.
// Known keys: "items" (query endpoint), "itemRefs" (tracker items endpoint in some versions).
function toArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;
    if (Array.isArray(obj["items"])) return obj["items"] as T[];
    if (Array.isArray(obj["itemRefs"])) return obj["itemRefs"] as T[];
    // Generic fallback: find first array-valued key
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        console.error(`[codebeamer-mcp] Using response key "${key}" instead of "items"`);
        return obj[key] as T[];
      }
    }
    console.error("[codebeamer-mcp] No array found in response:", JSON.stringify(obj).slice(0, 300));
  }
  return [];
}

// --- Client ---

export class CodebeamerClient {
  constructor(private readonly http: HttpClient) {}

  // Projects
  async listProjects(page: number, pageSize: number): Promise<CbProject[]> {
    const raw = await this.http.get<unknown>("/projects", {
      params: { page, pageSize },
      resource: "projects",
    });
    return toArray(raw);
  }

  getProject(id: number): Promise<CbProject> {
    return this.http.get(`/projects/${id}`, { resource: `project ${id}` });
  }

  // Trackers
  async listTrackers(
    projectId: number,
    page: number,
    pageSize: number,
  ): Promise<CbTracker[]> {
    const raw = await this.http.get<unknown>(`/projects/${projectId}/trackers`, {
      params: { page, pageSize },
      resource: `trackers for project ${projectId}`,
    });
    return toArray(raw);
  }

  getTracker(id: number): Promise<CbTracker> {
    return this.http.get(`/trackers/${id}`, { resource: `tracker ${id}` });
  }

  getTrackerFields(id: number): Promise<CbTrackerField[]> {
    return this.http.get(`/trackers/${id}/fields`, {
      resource: `fields for tracker ${id}`,
    });
  }

  getTrackerSchema(id: number): Promise<CbTrackerSchemaField[]> {
    return this.http.get(`/trackers/${id}/schema`, {
      resource: `schema for tracker ${id}`,
    });
  }

  // Items
  getItem(id: number): Promise<CbItem> {
    return this.http.get(`/items/${id}`, { resource: `item ${id}` });
  }

  async listTrackerItems(
    trackerId: number,
    page: number,
    pageSize: number,
  ): Promise<{ items: CbItem[]; debug?: string }> {
    const raw = await this.http.get<unknown>("/items/query", {
      params: { queryString: `tracker.id IN (${trackerId})`, page, pageSize },
      resource: `items for tracker ${trackerId}`,
    });
    const items = toArray<CbItem>(raw);
    if (items.length > 0) return { items };

    // Items empty — also try the direct endpoint so we can show raw debug info
    let rawDirect: unknown;
    try {
      rawDirect = await this.http.get<unknown>(`/trackers/${trackerId}/items`, {
        params: { page, pageSize },
        resource: `items for tracker ${trackerId} (direct)`,
      });
    } catch {
      rawDirect = null;
    }
    const rawObj = raw as Record<string, unknown> | null;
    const directObj = rawDirect as Record<string, unknown> | null;
    const queryTotal = rawObj?.["total"] ?? "?";
    const directTotal = directObj?.["total"] ?? "?";
    const directItems = toArray<CbItem>(rawDirect);
    const debug =
      `API vrátilo total=${queryTotal} pro cbQL query a total=${directTotal} pro přímý endpoint.\n` +
      `Pokud je total=0, Codebeamer říká že tam žádné itemy nejsou (špatný tracker ID, chybí oprávnění nebo prázdný tracker).\n` +
      `query: ${JSON.stringify(raw).slice(0, 300)}\n` +
      `direct: ${JSON.stringify(rawDirect).slice(0, 300)}`;
    return { items: directItems, debug };
  }

  async searchItems(
    queryString: string,
    page: number,
    pageSize: number,
  ): Promise<CbItem[]> {
    const raw = await this.http.get<unknown>("/items/query", {
      params: { queryString, page, pageSize },
      resource: "item query",
    });
    return toArray(raw);
  }

  // Item details
  getItemRelations(id: number): Promise<CbItemRelationsPage> {
    return this.http.get(`/items/${id}/relations`, {
      resource: `relations for item ${id}`,
    });
  }

  async getItemComments(id: number): Promise<CbComment[]> {
    const raw = await this.http.get<unknown>(`/items/${id}/comments`, {
      resource: `comments for item ${id}`,
    });
    return toArray(raw);
  }

  // Users
  getUser(id: number): Promise<CbUser> {
    return this.http.get(`/users/${id}`, { resource: `user ${id}` });
  }

  // --- Write operations ---

  createItem(trackerId: number, data: CbCreateItemRequest, parentId?: number): Promise<CbItem> {
    return this.http.post(`/trackers/${trackerId}/items`, {
      params: parentId !== undefined ? { parentItemId: parentId } : undefined,
      body: data,
      resource: `create item in tracker ${trackerId}`,
    });
  }

  updateItem(itemId: number, data: CbUpdateItemRequest): Promise<CbItem> {
    return this.http.put(`/items/${itemId}`, {
      body: data,
      resource: `update item ${itemId}`,
    });
  }

  addComment(itemId: number, data: CbCreateCommentRequest): Promise<CbComment> {
    return this.http.post(`/items/${itemId}/comments`, {
      body: data,
      resource: `add comment to item ${itemId}`,
    });
  }

  createAssociation(data: CbCreateAssociationRequest): Promise<CbAssociation> {
    return this.http.post("/associations", {
      body: data,
      resource: "create association",
    });
  }

  async getItemEditableFields(id: number): Promise<CbEditableField[]> {
    const raw = await this.http.get<{ editableFields?: CbEditableField[] }>(
      `/items/${id}/fields`,
      { resource: `editable fields for item ${id}` },
    );
    return raw.editableFields ?? [];
  }

  async createDownstreamReference(fromItemId: number, toItemId: number): Promise<void> {
    // Downstream reference is created by setting the "superordinateRequirement" field
    // on the downstream (to) item to point to the upstream (from) item.
    const toItem = await this.getItem(toItemId);
    const trackerId = toItem.tracker?.id;
    if (!trackerId) throw new Error(`Cannot determine tracker for item ${toItemId}`);

    const schema = await this.getTrackerSchema(trackerId);
    const superordinateField = schema.find(
      (f) => f.legacyRestName === "superordinateRequirement",
    );
    if (!superordinateField) {
      throw new Error(
        `Tracker ${trackerId} has no superordinateRequirement field. Cannot create downstream reference.`,
      );
    }

    const fields = await this.getItemEditableFields(toItemId);
    const currentField = fields.find((f) => f.fieldId === superordinateField.id);
    const existingValues = currentField?.values ?? [];
    if (existingValues.some((v) => v.id === fromItemId)) return; // already linked

    const newValues = [...existingValues, { id: fromItemId, type: "TrackerItemReference" }];

    await this.http.put(`/items/${toItemId}/fields`, {
      body: {
        fieldValues: [
          {
            fieldId: superordinateField.id,
            type: "ChoiceFieldValue",
            values: newValues,
          },
        ],
      },
      resource: `add downstream reference from ${fromItemId} to ${toItemId}`,
    });
  }
}
