import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";
import {
  formatRelations,
  formatComments,
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
  it("returns formatted relations", async () => {
    const client = makeClient();
    const relations = await client.getItemRelations(500);
    const text = formatRelations(relations);

    expect(text).toContain("## Relations");
    expect(text).toContain("depends on");
    expect(text).toContain("501");
    expect(text).toContain("Fix auth module");
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
