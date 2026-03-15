import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";

export function registerAssociationWriteTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "create_association",
    {
      title: "Create Association",
      description:
        "Create an association (link) between two Codebeamer work items. " +
        "Common association types: 'depends on', 'blocks', 'related to', 'derived from'. " +
        "Use get_item_relations on an existing item to discover valid association type IDs.",
      inputSchema: {
        fromItemId: z
          .number()
          .int()
          .positive()
          .describe("Source item ID"),
        toItemId: z
          .number()
          .int()
          .positive()
          .describe("Target item ID"),
        typeId: z
          .number()
          .int()
          .positive()
          .describe(
            "Association type ID (use get_item_relations to discover types)",
          ),
        description: z
          .string()
          .optional()
          .describe("Optional description for the association"),
      },
    },
    async ({ fromItemId, toItemId, typeId, description }) => {
      const result = await client.createAssociation({
        from: { id: fromItemId },
        to: { id: toItemId },
        type: { id: typeId },
        description,
      });
      const text =
        `**Association created** (ID: ${result.id})\n\n` +
        `| Field | Value |\n|---|---|\n` +
        `| From | #${fromItemId} |\n` +
        `| To | #${toItemId} |\n` +
        `| Type | ${result.type?.name ?? typeId} |` +
        (description ? `\n| Description | ${description} |` : "");
      return { content: [{ type: "text", text }] };
    },
  );
}
