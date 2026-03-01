import type { CbUser } from "../client/codebeamer-client.js";

export function formatUser(user: CbUser): string {
  const lines: string[] = [
    `## ${user.firstName ?? ""} ${user.lastName ?? ""} (${user.name})`.trim(),
    "",
    `- **ID:** ${user.id}`,
    `- **Username:** ${user.name}`,
  ];

  if (user.firstName) lines.push(`- **First Name:** ${user.firstName}`);
  if (user.lastName) lines.push(`- **Last Name:** ${user.lastName}`);
  if (user.email) lines.push(`- **Email:** ${user.email}`);
  if (user.status) lines.push(`- **Status:** ${user.status}`);
  if (user.registryDate)
    lines.push(`- **Registered:** ${user.registryDate}`);

  return lines.join("\n");
}
