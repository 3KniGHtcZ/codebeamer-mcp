import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";
import {
  formatRelations,
  formatReferences,
  formatComments,
  formatItemDetails,
} from "../../../src/formatters/item-formatter.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient() {
  const http = new HttpClient({
    baseUrl: BASE,
    username: "testuser",
    password: "testpass",
  });
  return new CodebeamerClient(http);
}

describe("get_item_relations", () => {
  it("returns formatted associations", async () => {
    const client = makeClient();
    const page = await client.getItemRelations(500);
    const text = formatRelations(page);

    expect(text).toContain("## Associations");
    expect(text).toContain("Outgoing");
    expect(text).toContain("depends on");
    expect(text).toContain("501");
    expect(text).toContain("Incoming");
    expect(text).toContain("blocks");
  });
});

describe("get_item_references", () => {
  it("returns formatted upstream and downstream references", async () => {
    const client = makeClient();
    const page = await client.getItemRelations(500);
    const text = formatReferences(page);

    expect(text).toContain("## References");
    expect(text).toContain("Upstream");
    expect(text).toContain("derived from");
    expect(text).toContain("REQ-42");
    expect(text).toContain("Downstream");
    expect(text).toContain("covers");
    expect(text).toContain("TC-10");
  });
});

describe("get_item_details", () => {
  it("returns metadata and custom fields without description", async () => {
    const client = makeClient();
    const item = await client.getItem(500);
    const text = formatItemDetails(item);

    expect(text).toContain("[500] Login button does not respond");
    expect(text).toContain("**Project:** Demo Project");
    expect(text).toContain("**Priority:** High");
    expect(text).toContain("john.doe");
    expect(text).toContain("**Story Points:** 5");
    expect(text).toContain("### Custom Fields");
    expect(text).toContain("Environment");
    expect(text).toContain("Production");
    expect(text).toContain("Authentication");

    expect(text).not.toContain("### Description");
    expect(text).not.toContain("Steps to reproduce");
  });
});

describe("get_item_details — test case with test steps", () => {
  it("renders test steps as a numbered table", async () => {
    const client = makeClient();
    const item = await client.getItem(700);
    const text = formatItemDetails(item);

    expect(text).toContain("[700] TC-01: Verify user can log in");
    expect(text).toContain("### Test Steps");
    expect(text).toContain("| # | Action | Expected Result |");
    expect(text).toContain("Navigate to the login page");
    expect(text).toContain("Login form is displayed");
    expect(text).toContain("Enter valid credentials and click Login");
    expect(text).toContain("User is redirected to the dashboard");
    expect(text).toContain("Verify username is shown in the header");
    expect(text).toContain("Header shows the logged-in user's name");
  });

  it("renders step numbers starting from 1", async () => {
    const client = makeClient();
    const item = await client.getItem(700);
    const text = formatItemDetails(item);

    const lines = text.split("\n").filter((l) => l.startsWith("| ") && !l.startsWith("| #") && !l.startsWith("|---"));
    expect(lines[0]).toMatch(/^\| 1 \|/);
    expect(lines[1]).toMatch(/^\| 2 \|/);
    expect(lines[2]).toMatch(/^\| 3 \|/);
  });

  it("does not render test step field under Custom Fields section", async () => {
    const client = makeClient();
    const item = await client.getItem(700);
    const text = formatItemDetails(item);

    const customFieldsSection = text.split("### Test Steps")[0];
    expect(customFieldsSection).not.toContain("**Test Steps:**");
  });
});

describe("get_item_comments", () => {
  it("returns formatted comments", async () => {
    const client = makeClient();
    const comments = await client.getItemComments(500);
    const text = formatComments(comments);

    expect(text).toContain("## Comments (2)");
    expect(text).toContain("john.doe");
    expect(text).toContain("Chrome 120");
    expect(text).toContain("Fixed in v2.1");
    expect(text).toContain("jane.smith");
  });
});
