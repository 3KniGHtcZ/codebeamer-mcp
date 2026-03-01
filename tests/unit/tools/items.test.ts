import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";
import {
  formatItemList,
  formatItem,
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

describe("search_items", () => {
  it("returns formatted search results", async () => {
    const client = makeClient();
    const result = await client.searchItems('tracker.id IN (100)', 1, 25);
    const text = formatItemList(result);

    expect(text).toContain("## Items");
    expect(text).toContain("2 total");
    expect(text).toContain("Login button does not respond");
    expect(text).toContain("Another bug");
  });
});

describe("list_tracker_items", () => {
  it("returns formatted item list", async () => {
    const client = makeClient();
    const { items } = await client.listTrackerItems(100, 1, 25);
    const text = formatItemList(items);

    expect(text).toContain("## Items");
    expect(text).toContain("500");
    expect(text).toContain("Open");
    expect(text).toContain("High");
  });
});

describe("get_item", () => {
  it("returns formatted item detail", async () => {
    const client = makeClient();
    const item = await client.getItem(500);
    const text = formatItem(item);

    expect(text).toContain("[500] Login button does not respond");
    expect(text).toContain("**Status:** Open");
    expect(text).toContain("**Priority:** High");
    expect(text).toContain("john.doe");
    expect(text).toContain("**Story Points:** 5");
    expect(text).toContain("Steps to reproduce");
    expect(text).toContain("Environment");
    expect(text).toContain("Production");
    expect(text).toContain("Authentication");
  });
});
