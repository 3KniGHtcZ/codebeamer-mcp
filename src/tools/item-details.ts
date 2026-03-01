import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import {
  formatRelations,
  formatComments,
} from "../formatters/item-formatter.js";

export function registerItemDetailTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "get_item_relations",
    {
      title: "Get Item Relations",
      description:
        "Get all relations (associations) for a Codebeamer item. " +
        "Shows incoming and outgoing links like 'depends on', 'blocks', 'derived from', etc.",
      inputSchema: {
        itemId: z
          .number()
          .int()
          .positive()
          .describe("Numeric item ID"),
      },
    },
    async ({ itemId }) => {
      const relations = await client.getItemRelations(itemId);
      return { content: [{ type: "text", text: formatRelations(relations) }] };
    },
  );

  server.registerTool(
    "get_item_comments",
    {
      title: "Get Item Comments",
      description:
        "Get all comments (discussion thread) for a Codebeamer item.",
      inputSchema: {
        itemId: z
          .number()
          .int()
          .positive()
          .describe("Numeric item ID"),
      },
    },
    async ({ itemId }) => {
      const comments = await client.getItemComments(itemId);
      return { content: [{ type: "text", text: formatComments(comments) }] };
    },
  );
}
