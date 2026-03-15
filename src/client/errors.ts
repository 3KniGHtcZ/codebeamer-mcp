export class CbError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "CbError";
  }
}

export class CbAuthError extends CbError {
  constructor() {
    super("Authentication failed. Check CB_USERNAME and CB_PASSWORD.", 401);
    this.name = "CbAuthError";
  }
}

export class CbNotFoundError extends CbError {
  constructor(resource: string) {
    super(`Not found: ${resource}`, 404);
    this.name = "CbNotFoundError";
  }
}

export class CbForbiddenError extends CbError {
  constructor() {
    super(
      "Forbidden. Your account does not have access to this resource.",
      403,
    );
    this.name = "CbForbiddenError";
  }
}

export class CbValidationError extends CbError {
  constructor(message: string, body?: unknown) {
    super(`Validation error: ${message}`, 400, body);
    this.name = "CbValidationError";
  }
}

export class CbRateLimitError extends CbError {
  constructor() {
    super("Rate limit exceeded. Retry after a moment.", 429);
    this.name = "CbRateLimitError";
  }
}

export class CbConflictError extends CbError {
  constructor(resource: string) {
    super(
      `Conflict: ${resource} was modified by another user. Re-fetch and retry.`,
      409,
    );
    this.name = "CbConflictError";
  }
}

export function mapHttpError(
  status: number,
  body: unknown,
  resource?: string,
): CbError {
  switch (status) {
    case 401:
      return new CbAuthError();
    case 403:
      return new CbForbiddenError();
    case 404:
      return new CbNotFoundError(resource ?? "resource");
    case 409:
      return new CbConflictError(resource ?? "resource");
    case 429:
      return new CbRateLimitError();
    case 400:
    case 422: {
      const msg =
        typeof body === "object" &&
        body !== null &&
        "message" in body
          ? String((body as { message: unknown }).message)
          : "Bad request";
      return new CbValidationError(msg, body);
    }
    default:
      return new CbError(
        `Codebeamer API error (HTTP ${status})`,
        status,
        body,
      );
  }
}
