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
  username: string;
  password: string;
}

export function loadConfig(): Config {
  const host = requireEnv("CB_URL");
  const username = requireEnv("CB_USERNAME");
  const password = requireEnv("CB_PASSWORD");

  const baseUrl = `${host.replace(/\/$/, "")}/v3`;

  return { baseUrl, username, password };
}
