import { describe, it, expect } from "vitest";
import { HttpClient } from "../../../src/client/http-client.js";
import { CodebeamerClient } from "../../../src/client/codebeamer-client.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient() {
  const http = new HttpClient({
    baseUrl: BASE,
    username: "testuser",
    password: "testpass",
  });
  return new CodebeamerClient(http);
}

describe("create_association", () => {
  it("creates an association and returns result", async () => {
    const client = makeClient();
    const assoc = await client.createAssociation({
      from: { id: 500 },
      to: { id: 501 },
      type: { id: 1 },
      description: "Blocking dependency",
    });

    expect(assoc.id).toBe(400);
    expect(assoc.type?.name).toBe("depends on");
    expect(assoc.description).toBe("Blocking dependency");
  });

  it("creates an association without description", async () => {
    const client = makeClient();
    const assoc = await client.createAssociation({
      from: { id: 500 },
      to: { id: 502 },
      type: { id: 2 },
    });

    expect(assoc.id).toBe(400);
  });
});
