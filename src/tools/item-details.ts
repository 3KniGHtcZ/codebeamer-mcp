import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CodebeamerClient } from "../client/codebeamer-client.js";
import {
  formatRelations,
  formatReferences,
  formatComments,
  formatReviews,
  formatReviewItem,
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
      const page = await client.getItemRelations(itemId);
      return { content: [{ type: "text", text: formatRelations(page) }] };
    },
  );

  server.registerTool(
    "get_item_references",
    {
      title: "Get Item References",
      description:
        "Get upstream and downstream traceability references for a Codebeamer item. " +
        "Upstream references point to items this one is derived from (e.g. requirements). " +
        "Downstream references point to items derived from this one (e.g. test cases).",
      inputSchema: {
        itemId: z
          .number()
          .int()
          .positive()
          .describe("Numeric item ID"),
      },
    },
    async ({ itemId }) => {
      const page = await client.getItemRelations(itemId);
      return { content: [{ type: "text", text: formatReferences(page) }] };
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

  server.registerTool(
    "get_item_reviews",
    {
      title: "Get Item Reviews",
      description:
        "Get all Review Hub reviews for a Codebeamer tracker item. " +
        "Shows the overall review result (APPROVED/REJECTED/UNDECIDED), " +
        "individual reviewer votes, and review configuration (required approvals/rejections).",
      inputSchema: {
        itemId: z
          .number()
          .int()
          .positive()
          .describe("Numeric item ID"),
      },
    },
    async ({ itemId }) => {
      const reviews = await client.getItemReviews(itemId);
      if (reviews.length > 0) {
        return { content: [{ type: "text", text: formatReviews(reviews) }] };
      }
      // API returned no reviews — check if this item IS a review itself
      const item = await client.getItem(itemId);
      if (item.typeName === "REVIEW") {
        const relations = await client.getItemRelations(itemId);
        const downstream = relations.downstreamReferences ?? [];
        const shownIds = downstream
          .slice(0, 20)
          .map((r) => r.itemRevision?.id)
          .filter((id): id is number => id !== undefined);
        const nameMap = new Map<number, string>();
        if (shownIds.length > 0) {
          const fetched = await client.searchItems(
            `item.id IN (${shownIds.join(",")})`,
            1,
            25,
          );
          for (const fi of fetched) nameMap.set(fi.id, fi.name);
        }
        return { content: [{ type: "text", text: formatReviewItem(item, relations, nameMap) }] };
      }
      return { content: [{ type: "text", text: "_No reviews found for this item._" }] };
    },
  );
}
