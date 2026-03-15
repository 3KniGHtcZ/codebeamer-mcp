function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in .env or as an environment variable.`,
    );
  }
  return value;
}

export interface Config {
  baseUrl: string;
  authHeader: string;
}

export function loadConfig(): Config {
  const host = requireEnv("CB_URL");
  const baseUrl = `${host.replace(/\/$/, "")}/v3`;

  const apiKey = process.env.CB_API_KEY;
  if (apiKey) {
    return { baseUrl, authHeader: `Bearer ${apiKey}` };
  }

  const username = requireEnv("CB_USERNAME");
  const password = requireEnv("CB_PASSWORD");
  const encoded = Buffer.from(`${username}:${password}`).toString("base64");
  return { baseUrl, authHeader: `Basic ${encoded}` };
}
