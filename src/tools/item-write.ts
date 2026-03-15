import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import type {
  CbCreateItemRequest,
  CbUpdateItemRequest,
} from "../client/codebeamer-client.js";
import { formatItem } from "../formatters/item-formatter.js";

export function registerItemWriteTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "create_item",
    {
      title: "Create Item",
      description:
        "Create a new work item in a Codebeamer tracker. " +
        "Use get_tracker to discover available fields, statuses, and priorities. " +
        "Returns the created item with all fields.",
      inputSchema: {
        trackerId: z
          .number()
          .int()
          .positive()
          .describe("Numeric tracker ID to create the item in"),
        name: z.string().min(1).describe("Item summary / title"),
        description: z
          .string()
          .optional()
          .describe("Item description (plain text or wiki markup)"),
        statusId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Status ID (use get_tracker to see available statuses)"),
        priorityId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Priority ID (use get_tracker to see available priorities)"),
        assignedToIds: z
          .array(z.number().int().positive())
          .optional()
          .describe("Array of user IDs to assign"),
        storyPoints: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("Story points estimate"),
      },
    },
    async ({ trackerId, name, description, statusId, priorityId, assignedToIds, storyPoints }) => {
      const data: CbCreateItemRequest = { name };
      if (description !== undefined) data.description = description;
      if (statusId !== undefined) data.status = { id: statusId };
      if (priorityId !== undefined) data.priority = { id: priorityId };
      if (assignedToIds !== undefined) data.assignedTo = assignedToIds.map((id) => ({ id }));
      if (storyPoints !== undefined) data.storyPoints = storyPoints;

      const item = await client.createItem(trackerId, data);
      return { content: [{ type: "text", text: formatItem(item) }] };
    },
  );

  server.registerTool(
    "update_item",
    {
      title: "Update Item",
      description:
        "Update fields on an existing Codebeamer work item. " +
        "Only provide the fields you want to change. " +
        "Returns the updated item with all fields.",
      inputSchema: {
        itemId: z
          .number()
          .int()
          .positive()
          .describe("Numeric item ID to update"),
        name: z.string().min(1).optional().describe("New summary / title"),
        description: z
          .string()
          .optional()
          .describe("New description (plain text or wiki markup)"),
        statusId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("New status ID"),
        priorityId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("New priority ID"),
        assignedToIds: z
          .array(z.number().int().positive())
          .optional()
          .describe("New array of assigned user IDs (replaces current)"),
        storyPoints: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("New story points estimate"),
      },
    },
    async ({ itemId, name, description, statusId, priorityId, assignedToIds, storyPoints }) => {
      const data: CbUpdateItemRequest = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (statusId !== undefined) data.status = { id: statusId };
      if (priorityId !== undefined) data.priority = { id: priorityId };
      if (assignedToIds !== undefined) data.assignedTo = assignedToIds.map((id) => ({ id }));
      if (storyPoints !== undefined) data.storyPoints = storyPoints;

      const item = await client.updateItem(itemId, data);
      return { content: [{ type: "text", text: formatItem(item) }] };
    },
  );
}
