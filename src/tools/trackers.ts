import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import {
  formatTrackerList,
  formatTracker,
} from "../formatters/tracker-formatter.js";

export function registerTrackerTools(
  server: McpServer,
  client: CodebeamerClient,
): void {
  server.registerTool(
    "list_trackers",
    {
      title: "List Trackers",
      description:
        "List all trackers (Requirements, Bugs, Test Cases, etc.) in a Codebeamer project. " +
        "Use the returned tracker IDs to list items or get tracker details.",
      inputSchema: {
        projectId: z
          .number()
          .int()
          .positive()
          .describe("Numeric project ID"),
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
    async ({ projectId, page, pageSize }) => {
      const result = await client.listTrackers(projectId, page, pageSize);
      return { content: [{ type: "text", text: formatTrackerList(result) }] };
    },
  );

  server.registerTool(
    "get_tracker",
    {
      title: "Get Tracker",
      description:
        "Get details of a Codebeamer tracker including its field schema. " +
        "The field list shows what fields are available for items in this tracker, " +
        "useful for constructing cbQL queries.",
      inputSchema: {
        trackerId: z
          .number()
          .int()
          .positive()
          .describe("Numeric tracker ID"),
      },
    },
    async ({ trackerId }) => {
      const [tracker, fields, { items }] = await Promise.all([
        client.getTracker(trackerId),
        client.getTrackerFields(trackerId),
        client.listTrackerItems(trackerId, 1, 100),
      ]);
      return {
        content: [{ type: "text", text: formatTracker(tracker, fields, items) }],
      };
    },
  );
}
