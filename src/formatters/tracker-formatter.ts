import type {
  CbTracker,
  CbTrackerField,
  CbPage,
} from "../client/codebeamer-client.js";

export function formatTrackerList(page: CbPage<CbTracker>): string {
  const totalPages = Math.ceil(page.total / page.pageSize);
  const header = `## Trackers (page ${page.page} of ${totalPages}, ${page.total} total)\n`;

  if (page.items.length === 0) return `${header}\n_No trackers found._`;

  const rows = page.items.map(
    (t) =>
      `| ${t.id} | ${t.name} | ${t.type?.name ?? "-"} | ${t.keyName ?? "-"} |`,
  );

  return [
    header,
    "| ID | Name | Type | Key |",
    "|----|------|------|-----|",
    ...rows,
  ].join("\n");
}

export function formatTracker(
  tracker: CbTracker,
  fields: CbTrackerField[],
): string {
  const lines: string[] = [
    `## ${tracker.name}`,
    "",
    `- **ID:** ${tracker.id}`,
    `- **Type:** ${tracker.type?.name ?? "?"}`,
    `- **Project:** ${tracker.project?.name ?? "?"} (ID: ${tracker.project?.id ?? "?"})`,
  ];

  if (tracker.keyName) {
    lines.push(`- **Key:** ${tracker.keyName}`);
  }
  if (tracker.description) {
    lines.push("", "### Description", "", tracker.description);
  }

  if (fields.length > 0) {
    const visibleFields = fields.filter((f) => !f.hidden);
    lines.push("", "### Fields", "");
    lines.push("| ID | Name | Type | Required |");
    lines.push("|----|------|------|----------|");
    for (const f of visibleFields) {
      lines.push(
        `| ${f.fieldId} | ${f.name} | ${f.type ?? "-"} | ${f.required ? "Yes" : "No"} |`,
      );
    }
  }

  return lines.join("\n");
}
