import type { CbUser } from "../../../src/client/codebeamer-client.js";

export function makeUser(overrides: Partial<CbUser> = {}): CbUser {
  return {
    id: 5,
    name: "john.doe",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    status: "Activated",
    registryDate: "2023-06-15T08:00:00Z",
    ...overrides,
  };
}
