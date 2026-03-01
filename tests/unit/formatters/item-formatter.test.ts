import { describe, it, expect } from "vitest";
import {
  formatItemList,
  formatItem,
  formatRelations,
  formatComments,
} from "../../../src/formatters/item-formatter.js";
import { makeItem, makeItemPage, makeRelation, makeComment } from "../../mocks/fixtures/items.js";

describe("formatItemList", () => {
  it("formats empty page", () => {
    const text = formatItemList(makeItemPage([], 1, 25, 0));
    expect(text).toContain("No items found");
  });

  it("formats page with items", () => {
    const text = formatItemList(makeItemPage([makeItem(), makeItem({ id: 501, name: "Bug #2", status: { id: 11, name: "Closed" } })], 1, 25, 2));
    expect(text).toContain("| 500 |");
    expect(text).toContain("| 501 |");
    expect(text).toContain("Closed");
    expect(text).toContain("page 1 of 1");
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
    expect(formatRelations([])).toContain("No relations");
  });

  it("formats relations list", () => {
    const text = formatRelations([makeRelation()]);
    expect(text).toContain("depends on");
    expect(text).toContain("501");
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
