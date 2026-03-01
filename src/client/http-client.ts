import type { Config } from "../config.js";
import { mapHttpError } from "./errors.js";

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  resource?: string;
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
        Authorization: this.authHeader,
        Accept: "application/json",
        "User-Agent": "codebeamer-mcp/0.1.0",
      },
    });

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }
      throw mapHttpError(response.status, body, options.resource ?? path);
    }

    return response.json() as Promise<T>;
  }
}
