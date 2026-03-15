import type { Config } from "../config.js";
import { mapHttpError } from "./errors.js";

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  resource?: string;
}

export class HttpClient {
  constructor(private readonly config: Config) {}

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`);

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: this.config.authHeader,
        Accept: "application/json",
        "User-Agent": "codebeamer-mcp/0.1.0",
      },
    });

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
