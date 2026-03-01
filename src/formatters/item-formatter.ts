import type {
  CbItem,
  CbPage,
  CbRelation,
  CbComment,
} from "../client/codebeamer-client.js";

export function formatItemList(page: CbPage<CbItem>): string {
  const totalPages = Math.ceil(page.total / page.pageSize);
  const header = `## Items (page ${page.page} of ${totalPages}, ${page.total} total)\n`;

  if (page.items.length === 0) return `${header}\n_No items found._`;

  const rows = page.items.map(
    (item) =>
      `| ${item.id} | ${item.name} | ${item.status?.name ?? "-"} | ${item.priority?.name ?? "-"} | ${item.assignedTo?.map((u) => u.name).join(", ") || "-"} |`,
  );

  return [
    header,
    "| ID | Summary | Status | Priority | Assigned To |",
    "|----|---------|--------|----------|-------------|",
    ...rows,
  ].join("\n");
}

export function formatItem(item: CbItem): string {
  const lines: string[] = [
    `## [${item.id}] ${item.name}`,
    "",
    `- **Tracker:** ${item.tracker?.name ?? "?"} (ID: ${item.tracker?.id ?? "?"})`,
    `- **Project:** ${item.project?.name ?? "?"}`,
    `- **Status:** ${item.status?.name ?? "?"}`,
    `- **Priority:** ${item.priority?.name ?? "?"}`,
    `- **Assigned to:** ${item.assignedTo?.map((u) => u.name).join(", ") || "unassigned"}`,
    `- **Created:** ${item.createdAt ?? "?"} by ${item.createdBy?.name ?? "?"}`,
    `- **Updated:** ${item.updatedAt ?? "?"}`,
  ];

  if (item.storyPoints !== undefined) {
    lines.push(`- **Story Points:** ${item.storyPoints}`);
  }

  const description = item.description?.value ?? item.description?.markup;
  if (description) {
    lines.push("", "### Description", "", description);
  }

  if (item.customFields && item.customFields.length > 0) {
    lines.push("", "### Custom Fields", "");
    for (const field of item.customFields) {
      lines.push(`- **${field.name}:** ${formatFieldValue(field.value)}`);
    }
  }

  return lines.join("\n");
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "_empty_";
  if (typeof value === "object" && value !== null && "name" in value) {
    return (value as { name: string }).name;
  }
  if (Array.isArray(value)) {
    return value.map(formatFieldValue).join(", ");
  }
  return String(value);
}

export function formatRelations(relations: CbRelation[]): string {
  if (relations.length === 0) return "_No relations found._";

  const rows = relations.map(
    (r) =>
      `| ${r.id} | ${r.type?.name ?? "?"} | ${r.itemRevision?.id ?? "?"} | ${r.itemRevision?.name ?? "?"} |`,
  );

  return [
    `## Relations (${relations.length})`,
    "",
    "| Relation ID | Type | Target ID | Target Name |",
    "|-------------|------|-----------|-------------|",
    ...rows,
  ].join("\n");
}

export function formatComments(comments: CbComment[]): string {
  if (comments.length === 0) return "_No comments found._";

  const formatted = comments.map(
    (c) =>
      `### ${c.createdBy?.name ?? "?"} — ${c.createdAt ?? ""}\n\n${c.text?.value ?? c.text?.markup ?? "_empty_"}`,
  );

  return [`## Comments (${comments.length})`, "", ...formatted].join("\n\n");
}
