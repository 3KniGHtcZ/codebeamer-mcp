import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";
import {
  formatTrackerList,
  formatTracker,
} from "../../../src/formatters/tracker-formatter.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient() {
  const http = new HttpClient({
    baseUrl: BASE,
    username: "testuser",
    password: "testpass",
  });
  return new CodebeamerClient(http);
}

describe("list_trackers", () => {
  it("returns formatted tracker list", async () => {
    const client = makeClient();
    const result = await client.listTrackers(1, 1, 25);
    const text = formatTrackerList(result);

    expect(text).toContain("## Trackers");
    expect(text).toContain("1 total");
    expect(text).toContain("Bug Tracker");
    expect(text).toContain("100");
  });
});

describe("get_tracker", () => {
  it("returns formatted tracker with fields and items", async () => {
    const client = makeClient();
    const [tracker, fields, { items }] = await Promise.all([
      client.getTracker(100),
      client.getTrackerFields(100),
      client.listTrackerItems(100, 1, 100),
    ]);
    const text = formatTracker(tracker, fields, items);

    expect(text).toContain("Bug Tracker");
    expect(text).toContain("Summary");
    expect(text).toContain("Description");
    expect(text).toContain("TextFieldValue");
    expect(text).toContain("### Items");
    expect(text).toContain("Login button does not respond");
    expect(text).toContain("Open");
  });
});
