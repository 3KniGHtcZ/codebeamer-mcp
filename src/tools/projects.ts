import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import {
  formatProjectList,
  formatProject,
} from "../formatters/project-formatter.js";

export function registerProjectTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "list_projects",
    {
      title: "List Projects",
      description:
        "List all Codebeamer projects the authenticated user can access. " +
        "Returns a summary table with project IDs, names, and keys. " +
        "Use the returned IDs to fetch trackers or items.",
      inputSchema: {
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
          .max(100)
          .default(25)
          .describe("Items per page (max 100)"),
      },
    },
    async ({ page, pageSize }) => {
      const result = await client.listProjects(page, pageSize);
      return { content: [{ type: "text", text: formatProjectList(result) }] };
    },
  );

  server.registerTool(
    "get_project",
    {
      title: "Get Project",
      description:
        "Get full details for a single Codebeamer project by its numeric ID.",
      inputSchema: {
        projectId: z
          .number()
          .int()
          .positive()
          .describe("Numeric Codebeamer project ID"),
      },
    },
    async ({ projectId }) => {
      const project = await client.getProject(projectId);
      return { content: [{ type: "text", text: formatProject(project) }] };
    },
  );
}
