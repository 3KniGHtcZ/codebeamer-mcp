import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import { formatComments } from "../formatters/item-formatter.js";

export function registerCommentWriteTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "add_comment",
    {
      title: "Add Comment",
      description:
        "Add a comment to a Codebeamer work item. " +
        "Supports plain text and wiki markup formats. " +
        "Returns the created comment.",
      inputSchema: {
        itemId: z
          .number()
          .int()
          .positive()
          .describe("Numeric item ID to comment on"),
        comment: z.string().min(1).describe("Comment text"),
        format: z
          .enum(["PlainText", "Wiki"])
          .default("PlainText")
          .describe("Comment format: PlainText or Wiki markup"),
      },
    },
    async ({ itemId, comment, format }) => {
      const result = await client.addComment(itemId, {
        comment,
        commentFormat: format,
      });
      return {
        content: [{ type: "text", text: formatComments([result]) }],
      };
    },
  );
}
