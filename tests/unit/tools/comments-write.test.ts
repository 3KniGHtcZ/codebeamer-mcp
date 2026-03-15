import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";
import { formatComments } from "../../../src/formatters/item-formatter.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient() {
  const http = new HttpClient({
    baseUrl: BASE,
    username: "testuser",
    password: "testpass",
  });
  return new CodebeamerClient(http);
}

describe("add_comment", () => {
  it("adds a comment and returns formatted result", async () => {
    const client = makeClient();
    const comment = await client.addComment(500, {
      comment: "This is a test comment",
      commentFormat: "PlainText",
    });

    expect(comment.id).toBe(350);

    const text = formatComments([comment]);
    expect(text).toContain("john.doe");
    expect(text).toContain("This is a test comment");
  });
});
