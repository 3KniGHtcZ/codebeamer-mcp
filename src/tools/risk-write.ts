import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import { formatItem } from "../formatters/item-formatter.js";

export function registerRiskWriteTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "create_harm",
    {
      title: "Create Harm",
      description:
        "Create a new item in a Codebeamer RM Harms List tracker. " +
        "Supports setting the IMDRF code (text) and Severity (integer 1–5). " +
        "Use list_trackers to find the Harms List tracker ID for your project.",
      inputSchema: {
        trackerId: z
          .number()
          .int()
          .positive()
          .describe("Numeric tracker ID of the RM Harms List tracker"),
        name: z.string().min(1).describe("Harm name / summary"),
        description: z
          .string()
          .optional()
          .describe("Harm description (plain text or wiki markup)"),
        imdrfCode: z
          .string()
          .optional()
          .describe("IMDRF code for this harm (e.g. 'E0001')"),
        severity: z
          .number()
          .int()
          .min(1)
          .max(5)
          .optional()
          .describe("Severity level (integer 1–5)"),
        parentId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Parent item ID to nest this harm inside (e.g. a folder)"),
      },
    },
    async ({ trackerId, name, description, imdrfCode, severity, parentId }) => {
      const customFields: Array<{ fieldId: number; type: string; value: unknown }> = [];

      if (imdrfCode !== undefined) {
        customFields.push({ fieldId: 10000, type: "TextFieldValue", value: imdrfCode });
      }
      if (severity !== undefined) {
        customFields.push({ fieldId: 10001, type: "IntegerFieldValue", value: severity });
      }

      const data = {
        name,
        ...(description !== undefined ? { description } : {}),
        ...(customFields.length > 0 ? { customFields } : {}),
      };

      const item = await client.createItem(trackerId, data, parentId);
      return { content: [{ type: "text", text: formatItem(item) }] };
    },
  );
}
