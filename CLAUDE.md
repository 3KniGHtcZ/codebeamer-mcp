# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # compile TypeScript → dist/ (tsup, ESM)
npm run dev            # watch mode build
npm run typecheck      # type-check without emitting
npm test               # run all tests once (vitest)
npm run test:watch     # vitest in watch mode
npm run test:coverage  # coverage report

# Run a single test file
npx vitest run tests/unit/tools/items.test.ts

# Interactive MCP testing (requires a running instance or mock server)
node mock-server.mjs                        # start mock API on port 3001
CB_URL=http://localhost:3001 CB_USERNAME=mock CB_PASSWORD=mock npm run inspect
```

## Architecture

The server is a read-only MCP server that exposes Codebeamer ALM data to LLM clients via stdio transport.

```
src/
  index.ts                  # entry point: wires McpServer + transport
  config.ts                 # reads CB_URL / CB_USERNAME / CB_PASSWORD from env
  client/
    http-client.ts          # thin fetch wrapper (Basic Auth, query params, error mapping)
    codebeamer-client.ts    # typed Codebeamer API methods + response types
    errors.ts               # maps HTTP status codes to McpError
  formatters/               # convert API types → markdown strings for tool responses
  tools/                    # register MCP tools on the server (one file per domain)
    index.ts                # re-exports all register* functions
```

**Data flow:** `McpServer` → `register*Tools(server, client)` → `CodebeamerClient` → `HttpClient` → Codebeamer REST API v3. Responses are formatted to markdown by the formatters before being returned as tool content.

### Key implementation details

**`toArray<T>(response)`** in `codebeamer-client.ts` — normalises the inconsistent API response shapes:
- plain `T[]`
- `{ items: T[] }` (query endpoint)
- `{ itemRefs: T[] }` (direct tracker items endpoint)
- generic fallback: first array-valued key in the object

**`listTrackerItems`** — uses `/items/query` with cbQL (`tracker.id IN (id)`) as primary endpoint. When empty, falls back to `/trackers/{id}/items` and returns a `debug` string with raw API output that the tool appends to the response.

**Relations vs References** — `getItemRelations` returns `CbItemRelationsPage` with four named arrays:
- `outgoingAssociations` / `incomingAssociations` → shown by `get_item_relations`
- `upstreamReferences` / `downstreamReferences` → shown by `get_item_references`

## Tests

Tests use **MSW** (Mock Service Worker) to intercept `fetch` calls. No real Codebeamer instance is needed.

- `tests/setup.ts` — starts/stops the MSW server globally
- `tests/mocks/handlers.ts` — defines all intercepted routes
- `tests/mocks/fixtures/` — factory functions (`makeItem()`, `makeTracker()`, …) for test data

Tests call `CodebeamerClient` methods directly and assert on the formatted markdown output. There are no tool-layer tests; tool files are thin wrappers and are tested implicitly through the client+formatter tests.
