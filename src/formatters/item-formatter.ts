import type {
  CbItem,
  CbItemRelationsPage,
  CbComment,
} from "../client/codebeamer-client.js";

export function formatItemList(items: CbItem[]): string {
  const header = `## Items (${items.length} total)\n`;

  if (items.length === 0) return `${header}\n_No items found._`;

  const rows = items.map(
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

  const description =
    typeof item.description === "string"
      ? item.description
      : item.description?.value ?? item.description?.markup;
  if (description) {
    lines.push("", "### Description", "", description);
  }

  if (item.customFields && item.customFields.length > 0) {
    lines.push("", "### Custom Fields", "");
    for (const field of item.customFields) {
      const displayValue = field.values && field.values.length > 0
        ? field.values.map((v) => v.name ? `[${v.id}] ${v.name}` : String(v.id)).join(", ")
        : formatFieldValue(field.value);
      lines.push(`- **${field.name}:** ${displayValue}`);
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

function relationsTable(relations: { id: number; type?: { name?: string }; itemRevision?: { id: number; name: string } }[]): string[] {
  const rows = relations.map(
    (r) => `| ${r.id} | ${r.type?.name ?? "?"} | ${r.itemRevision?.id ?? "?"} | ${r.itemRevision?.name ?? "?"} |`,
  );
  return [
    "| Relation ID | Type | Target ID | Target Name |",
    "|-------------|------|-----------|-------------|",
    ...rows,
  ];
}

export function formatRelations(page: CbItemRelationsPage): string {
  const outgoing = page.outgoingAssociations ?? [];
  const incoming = page.incomingAssociations ?? [];
  const total = outgoing.length + incoming.length;

  if (total === 0) return "_No associations found._";

  const lines: string[] = [`## Associations (${total})`];

  if (outgoing.length > 0) {
    lines.push("", `### Outgoing (${outgoing.length})`, "", ...relationsTable(outgoing));
  }
  if (incoming.length > 0) {
    lines.push("", `### Incoming (${incoming.length})`, "", ...relationsTable(incoming));
  }

  return lines.join("\n");
}

export function formatReferences(page: CbItemRelationsPage): string {
  const upstream = page.upstreamReferences ?? [];
  const downstream = page.downstreamReferences ?? [];
  const total = upstream.length + downstream.length;

  if (total === 0) return "_No references found._";

  const lines: string[] = [`## References (${total})`];

  if (upstream.length > 0) {
    lines.push("", `### Upstream (${upstream.length})`, "", ...relationsTable(upstream));
  }
  if (downstream.length > 0) {
    lines.push("", `### Downstream (${downstream.length})`, "", ...relationsTable(downstream));
  }

  return lines.join("\n");
}

export function formatComments(comments: CbComment[]): string {
  if (comments.length === 0) return "_No comments found._";

  const formatted = comments.map(
    (c) =>
      `### ${c.createdBy?.name ?? "?"} — ${c.createdAt ?? ""}\n\n${c.comment ?? "_empty_"}`,
  );

  return [`## Comments (${comments.length})`, "", ...formatted].join("\n\n");
}
