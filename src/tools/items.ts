import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import {
  formatItemList,
  formatItem,
} from "../formatters/item-formatter.js";

export function registerItemTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "search_items",
    {
      title: "Search Items (cbQL)",
      description:
        "Search Codebeamer items using cbQL query language. " +
        "Examples: " +
        "'tracker.id IN (42) AND status.name = \"Open\"', " +
        "'summary LIKE \"login bug\"', " +
        "'priority.name = \"High\" AND assignedTo.name = \"john.doe\"', " +
        "'project.id IN (1) AND modifiedAt >= -1w'. " +
        "Use get_tracker to see available fields for a tracker.",
      inputSchema: {
        query: z.string().describe("cbQL query string"),
        page: z
          .number()
          .int()
          .min(1)
          .default(1)
          .describe("Page number (starts at 1)"),
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(25)
          .describe("Items per page (max 50)"),
      },
    },
    async ({ query, page, pageSize }) => {
      const result = await client.searchItems(query, page, pageSize);
      return { content: [{ type: "text", text: formatItemList(result) }] };
    },
  );

  server.registerTool(
    "list_tracker_items",
    {
      title: "List Tracker Items",
      description:
        "List all items in a specific Codebeamer tracker with pagination. " +
        "Returns a table with item IDs, summaries, statuses, and priorities.",
      inputSchema: {
        trackerId: z
          .number()
          .int()
          .positive()
          .describe("Numeric tracker ID"),
        page: z
          .number()
          .int()
          .min(1)
          .default(1)
          .describe("Page number (starts at 1)"),
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(25)
          .describe("Items per page (max 50)"),
      },
    },
    async ({ trackerId, page, pageSize }) => {
      const { items, debug } = await client.listTrackerItems(trackerId, page, pageSize);
      let text = formatItemList(items);
      if (items.length === 0 && debug) {
        text += `\n\n---\n**Debug (raw API responses):**\n\`\`\`\n${debug}\n\`\`\``;
      }
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "get_item",
    {
      title: "Get Item",
      description:
        "Get full details of a Codebeamer work item by its numeric ID. " +
        "Returns status, priority, assignees, description, and custom fields.",
      inputSchema: {
        itemId: z
          .number()
          .int()
          .positive()
          .describe("Numeric item (work item) ID"),
      },
    },
    async ({ itemId }) => {
      const item = await client.getItem(itemId);
      return { content: [{ type: "text", text: formatItem(item) }] };
    },
  );
}
