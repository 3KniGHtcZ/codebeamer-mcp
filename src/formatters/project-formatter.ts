import type { CbProject, CbPage } from "../client/codebeamer-client.js";

export function formatProjectList(page: CbPage<CbProject>): string {
  const totalPages = Math.ceil(page.total / page.pageSize);
  const header = `## Projects (page ${page.page} of ${totalPages}, ${page.total} total)\n`;

  if (page.items.length === 0) return `${header}\n_No projects found._`;

  const rows = page.items.map(
    (p) =>
      `| ${p.id} | ${p.name} | ${p.keyName} | ${p.closed ? "Closed" : "Open"} |`,
  );

  return [
    header,
    "| ID | Name | Key | Status |",
    "|----|------|-----|--------|",
    ...rows,
  ].join("\n");
}

export function formatProject(project: CbProject): string {
  const lines: string[] = [
    `## ${project.name}`,
    "",
    `- **ID:** ${project.id}`,
    `- **Key:** ${project.keyName}`,
    `- **Status:** ${project.closed ? "Closed" : "Open"}`,
  ];

  if (project.category) {
    lines.push(`- **Category:** ${project.category}`);
  }
  if (project.description) {
    lines.push("", "### Description", "", project.description);
  }
  if (project.createdAt) {
    lines.push(`- **Created:** ${project.createdAt}`);
  }

  return lines.join("\n");
}
