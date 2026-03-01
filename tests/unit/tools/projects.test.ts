import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";
import { formatProjectList, formatProject } from "../../../src/formatters/project-formatter.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient() {
  const http = new HttpClient({
    baseUrl: BASE,
    username: "testuser",
    password: "testpass",
  });
  return new CodebeamerClient(http);
}

describe("list_projects", () => {
  it("returns formatted project list", async () => {
    const client = makeClient();
    const result = await client.listProjects(1, 25);
    const text = formatProjectList(result);

    expect(text).toContain("## Projects");
    expect(text).toContain("Demo Project");
    expect(text).toContain("Second Project");
    expect(text).toContain("DEMO");
    expect(text).toContain("2 total");
  });

  it("returns no projects message when list is empty", async () => {
    const client = makeClient();
    const text = formatProjectList([]);

    expect(text).toContain("_No projects found._");
  });
});

describe("get_project", () => {
  it("returns formatted project detail", async () => {
    const client = makeClient();
    const result = await client.getProject(1);
    const text = formatProject(result);

    expect(text).toContain("## Demo Project");
    expect(text).toContain("**ID:** 1");
    expect(text).toContain("**Key:** DEMO");
    expect(text).toContain("Open");
    expect(text).toContain("A demonstration project");
  });
});
