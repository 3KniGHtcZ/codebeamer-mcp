import type { Config } from "../config.js";
import { mapHttpError } from "./errors.js";

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  resource?: string;
}

export interface BodyRequestOptions extends RequestOptions {
  body?: unknown;
  formData?: Record<string, string>;
}

export class HttpClient {
  private readonly authHeader: string;

  constructor(private readonly config: Config) {
    const encoded = Buffer.from(
      `${config.username}:${config.password}`,
    ).toString("base64");
    this.authHeader = `Basic ${encoded}`;
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  async post<T>(path: string, options: BodyRequestOptions = {}): Promise<T> {
    return this.request<T>("POST", path, options);
  }

  async put<T>(path: string, options: BodyRequestOptions = {}): Promise<T> {
    return this.request<T>("PUT", path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    options: BodyRequestOptions = {},
  ): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`);

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: "application/json",
      "User-Agent": "codebeamer-mcp/0.1.0",
    };

    const init: RequestInit = { method, headers };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    } else if (options.formData !== undefined) {
      const fd = new FormData();
      for (const [key, value] of Object.entries(options.formData)) {
        fd.append(key, value);
      }
      init.body = fd;
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), init);
    } catch (err) {
      const cause = err instanceof Error ? err.message : String(err);
      const nested =
        err instanceof Error &&
        err.cause instanceof Error
          ? ` (${err.cause.message})`
          : "";
      throw new Error(
        `Cannot connect to Codebeamer at ${this.config.baseUrl}. ` +
          `Check that CB_URL is correct and the server is reachable. Cause: ${cause}${nested}`,
      );
    }

    if (!response.ok) {
      const text = await response.text();
      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
      throw mapHttpError(response.status, body, options.resource ?? path);
    }

    return response.json() as Promise<T>;
  }
}
