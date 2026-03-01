import { describe, it, expect } from "vitest";
import {
  formatItemList,
  formatItem,
  formatRelations,
  formatReferences,
  formatComments,
} from "../../../src/formatters/item-formatter.js";
import { makeItem, makeItemRelationsPage, makeComment } from "../../mocks/fixtures/items.js";

describe("formatItemList", () => {
  it("formats empty list", () => {
    const text = formatItemList([]);
    expect(text).toContain("No items found");
  });

  it("formats list with items", () => {
    const text = formatItemList([makeItem(), makeItem({ id: 501, name: "Bug #2", status: { id: 11, name: "Closed" } })]);
    expect(text).toContain("| 500 |");
    expect(text).toContain("| 501 |");
    expect(text).toContain("Closed");
    expect(text).toContain("2 total");
  });
});

describe("formatItem", () => {
  it("formats full item", () => {
    const text = formatItem(makeItem());
    expect(text).toContain("[500]");
    expect(text).toContain("Bug Tracker");
    expect(text).toContain("Story Points");
    expect(text).toContain("Custom Fields");
  });

  it("handles missing optional fields", () => {
    const text = formatItem(makeItem({ storyPoints: undefined, customFields: [], description: undefined }));
    expect(text).not.toContain("Story Points");
    expect(text).not.toContain("Custom Fields");
    expect(text).not.toContain("Description");
  });
});

describe("formatRelations", () => {
  it("formats empty relations", () => {
    expect(formatRelations({})).toContain("No associations");
  });

  it("formats outgoing and incoming associations", () => {
    const text = formatRelations(makeItemRelationsPage());
    expect(text).toContain("Outgoing");
    expect(text).toContain("depends on");
    expect(text).toContain("501");
    expect(text).toContain("Incoming");
    expect(text).toContain("blocks");
  });
});

describe("formatReferences", () => {
  it("formats empty references", () => {
    expect(formatReferences({})).toContain("No references");
  });

  it("formats upstream and downstream references", () => {
    const text = formatReferences(makeItemRelationsPage());
    expect(text).toContain("Upstream");
    expect(text).toContain("derived from");
    expect(text).toContain("Downstream");
    expect(text).toContain("covers");
  });
});

describe("formatComments", () => {
  it("formats empty comments", () => {
    expect(formatComments([])).toContain("No comments");
  });

  it("formats comments list", () => {
    const text = formatComments([makeComment()]);
    expect(text).toContain("john.doe");
    expect(text).toContain("Chrome 120");
  });
});
