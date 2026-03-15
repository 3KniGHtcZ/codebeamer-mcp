import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";
import { formatItem } from "../../../src/formatters/item-formatter.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient() {
  const http = new HttpClient({
    baseUrl: BASE,
    username: "testuser",
    password: "testpass",
  });
  return new CodebeamerClient(http);
}

describe("create_item", () => {
  it("creates an item and returns formatted result", async () => {
    const client = makeClient();
    const item = await client.createItem(100, {
      name: "New bug report",
      description: "Something is broken",
      status: { id: 10 },
      priority: { id: 3 },
      storyPoints: 3,
    });

    expect(item.id).toBe(600);
    expect(item.name).toBe("New bug report");

    const text = formatItem(item);
    expect(text).toContain("[600]");
    expect(text).toContain("New bug report");
  });

  it("creates an item with minimal fields", async () => {
    const client = makeClient();
    const item = await client.createItem(100, {
      name: "Simple task",
    });

    expect(item.id).toBe(600);
    expect(item.name).toBe("Simple task");
  });
});

describe("update_item", () => {
  it("updates an item and returns formatted result", async () => {
    const client = makeClient();
    const item = await client.updateItem(500, {
      name: "Updated title",
      status: { id: 20 },
    });

    expect(item.id).toBe(500);

    const text = formatItem(item);
    expect(text).toContain("[500]");
  });
});
