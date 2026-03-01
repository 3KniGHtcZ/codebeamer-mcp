import type {
  CbTracker,
  CbTrackerField,
} from "../../../src/client/codebeamer-client.js";

export function makeTracker(overrides: Partial<CbTracker> = {}): CbTracker {
  return {
    id: 100,
    name: "Bug Tracker",
    type: { id: 1, name: "Bug" },
    project: { id: 1, name: "Demo Project" },
    description: "Track software defects",
    keyName: "BUG",
    ...overrides,
  };
}

export function makeTrackerField(
  overrides: Partial<CbTrackerField> = {},
): CbTrackerField {
  return {
    fieldId: 1,
    name: "Summary",
    type: "TextFieldValue",
    required: true,
    hidden: false,
    ...overrides,
  };
}

