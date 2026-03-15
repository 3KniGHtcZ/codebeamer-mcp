import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { mockServer } from "../../setup.js";
import { HttpClient } from "../../../src/client/http-client.js";
import {
  CbConflictError,
  CbValidationError,
} from "../../../src/client/errors.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient() {
  return new HttpClient({
    baseUrl: BASE,
    username: "testuser",
    password: "testpass",
  });
}

describe("HttpClient.post", () => {
  it("sends JSON body with POST method", async () => {
    let receivedMethod = "";
    let receivedBody: unknown = null;
    let receivedContentType = "";

    mockServer.use(
      http.post(`${BASE}/test-post`, async ({ request }) => {
        receivedMethod = request.method;
        receivedContentType = request.headers.get("Content-Type") ?? "";
        receivedBody = await request.json();
        return HttpResponse.json({ id: 1 }, { status: 201 });
      }),
    );

    const client = makeClient();
    const result = await client.post<{ id: number }>("/test-post", {
      body: { name: "Test" },
    });

    expect(receivedMethod).toBe("POST");
    expect(receivedContentType).toBe("application/json");
    expect(receivedBody).toEqual({ name: "Test" });
    expect(result).toEqual({ id: 1 });
  });

  it("maps 409 to CbConflictError", async () => {
    mockServer.use(
      http.post(`${BASE}/conflict`, () =>
        HttpResponse.json({ message: "Conflict" }, { status: 409 }),
      ),
    );

    const client = makeClient();
    await expect(
      client.post("/conflict", { body: {}, resource: "item 500" }),
    ).rejects.toThrow(CbConflictError);
  });

  it("maps 400 to CbValidationError", async () => {
    mockServer.use(
      http.post(`${BASE}/bad-post`, () =>
        HttpResponse.json({ message: "Missing name" }, { status: 400 }),
      ),
    );

    const client = makeClient();
    await expect(
      client.post("/bad-post", { body: {} }),
    ).rejects.toThrow(CbValidationError);
  });
});

describe("HttpClient.put", () => {
  it("sends JSON body with PUT method", async () => {
    let receivedMethod = "";
    let receivedBody: unknown = null;

    mockServer.use(
      http.put(`${BASE}/test-put`, async ({ request }) => {
        receivedMethod = request.method;
        receivedBody = await request.json();
        return HttpResponse.json({ id: 1, name: "Updated" });
      }),
    );

    const client = makeClient();
    const result = await client.put<{ id: number; name: string }>("/test-put", {
      body: { name: "Updated" },
    });

    expect(receivedMethod).toBe("PUT");
    expect(receivedBody).toEqual({ name: "Updated" });
    expect(result).toEqual({ id: 1, name: "Updated" });
  });
});
