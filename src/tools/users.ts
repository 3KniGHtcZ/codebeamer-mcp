import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import { formatUser } from "../formatters/user-formatter.js";

export function registerUserTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "get_user",
    {
      title: "Get User",
      description:
        "Get profile details for a Codebeamer user by their numeric ID. " +
        "User IDs appear in item fields like assignedTo and createdBy.",
      inputSchema: {
        userId: z.number().int().positive().describe("Numeric user ID"),
      },
    },
    async ({ userId }) => {
      const user = await client.getUser(userId);
      return { content: [{ type: "text", text: formatUser(user) }] };
    },
  );
}
