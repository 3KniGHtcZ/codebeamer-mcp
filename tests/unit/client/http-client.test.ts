import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { mockServer } from "../../setup.js";
import { HttpClient } from "../../../src/client/http-client.js";
import {
  CbAuthError,
  CbNotFoundError,
  CbForbiddenError,
  CbRateLimitError,
  CbValidationError,
  CbError,
} from "../../../src/client/errors.js";

const BASE = "https://test-cb.example.com/v3";

function makeClient(authHeader?: string) {
  return new HttpClient({
    baseUrl: BASE,
    authHeader: authHeader ?? `Basic ${Buffer.from("testuser:testpass").toString("base64")}`,
  });
}

describe("HttpClient", () => {
  it("sends Basic Auth header", async () => {
    let receivedAuth = "";
    mockServer.use(
      http.get(`${BASE}/test-auth`, ({ request }) => {
        receivedAuth = request.headers.get("Authorization") ?? "";
        return HttpResponse.json({ ok: true });
      }),
    );

    const client = makeClient();
    await client.get("/test-auth");

    const expected = `Basic ${Buffer.from("testuser:testpass").toString("base64")}`;
    expect(receivedAuth).toBe(expected);
  });

  it("sends Bearer token header", async () => {
    let receivedAuth = "";
    mockServer.use(
      http.get(`${BASE}/test-bearer`, ({ request }) => {
        receivedAuth = request.headers.get("Authorization") ?? "";
        return HttpResponse.json({ ok: true });
      }),
    );

    const client = makeClient("Bearer my-oauth2-token");
    await client.get("/test-bearer");

    expect(receivedAuth).toBe("Bearer my-oauth2-token");
  });

  it("appends query params", async () => {
    let receivedUrl = "";
    mockServer.use(
      http.get(`${BASE}/test-params`, ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json({ ok: true });
      }),
    );

    const client = makeClient();
    await client.get("/test-params", { params: { page: 2, pageSize: 10 } });

    const url = new URL(receivedUrl);
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("pageSize")).toBe("10");
  });

  it("skips undefined params", async () => {
    let receivedUrl = "";
    mockServer.use(
      http.get(`${BASE}/test-undef`, ({ request }) => {
        receivedUrl = request.url;
        return HttpResponse.json({ ok: true });
      }),
    );

    const client = makeClient();
    await client.get("/test-undef", { params: { a: "1", b: undefined } });

    const url = new URL(receivedUrl);
    expect(url.searchParams.get("a")).toBe("1");
    expect(url.searchParams.has("b")).toBe(false);
  });

  it("maps 401 to CbAuthError", async () => {
    mockServer.use(
      http.get(`${BASE}/fail`, () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    const client = makeClient();
    await expect(client.get("/fail")).rejects.toThrow(CbAuthError);
  });

  it("maps 404 to CbNotFoundError", async () => {
    mockServer.use(
      http.get(`${BASE}/missing`, () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 }),
      ),
    );

    const client = makeClient();
    await expect(
      client.get("/missing", { resource: "item 999" }),
    ).rejects.toThrow(CbNotFoundError);
  });

  it("maps 403 to CbForbiddenError", async () => {
    mockServer.use(
      http.get(`${BASE}/secret`, () =>
        HttpResponse.json({}, { status: 403 }),
      ),
    );

    const client = makeClient();
    await expect(client.get("/secret")).rejects.toThrow(CbForbiddenError);
  });

  it("maps 429 to CbRateLimitError", async () => {
    mockServer.use(
      http.get(`${BASE}/limited`, () =>
        HttpResponse.json({}, { status: 429 }),
      ),
    );

    const client = makeClient();
    await expect(client.get("/limited")).rejects.toThrow(CbRateLimitError);
  });

  it("maps 400 to CbValidationError", async () => {
    mockServer.use(
      http.get(`${BASE}/bad`, () =>
        HttpResponse.json({ message: "Invalid query" }, { status: 400 }),
      ),
    );

    const client = makeClient();
    await expect(client.get("/bad")).rejects.toThrow(CbValidationError);
  });

  it("maps unknown status to CbError", async () => {
    mockServer.use(
      http.get(`${BASE}/boom`, () =>
        HttpResponse.json({}, { status: 502 }),
      ),
    );

    const client = makeClient();
    await expect(client.get("/boom")).rejects.toThrow(CbError);
  });
});
