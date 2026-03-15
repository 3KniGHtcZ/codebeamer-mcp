# codebeamer-mcp

A read-only MCP (Model Context Protocol) server for Codebeamer ALM. Allows Claude and other MCP clients to read projects, trackers, and items from Codebeamer using natural language.

## Tools (11)

| Tool | Description |
|---|---|
| `list_projects` | List all projects |
| `get_project` | Get project details |
| `list_trackers` | List trackers in a project |
| `get_tracker` | Get tracker details |
| `list_tracker_items` | List items in a tracker |
| `search_items` | Full-text / cbQL search |
| `get_item` | Get item details |
| `get_item_relations` | Get outgoing/incoming associations (depends on, blocks, …) |
| `get_item_references` | Get upstream/downstream traceability references (derived from, covers, …) |
| `get_item_comments` | Get item comments |
| `get_user` | Get user details |

## Installation

### Requirements
- Node.js 20+
- Access to a Codebeamer instance (URL + credentials or API token)

### Quick Start (npm)

No need to clone the repository. Add this to your `.mcp.json` (project root or `~/.claude/mcp.json` for global):

**Option A — Username & password (Basic Auth):**

```json
{
  "mcpServers": {
    "codebeamer": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "codebeamer-mcp"],
      "env": {
        "CB_URL": "https://your-instance.example.com/cb/api",
        "CB_USERNAME": "your_username",
        "CB_PASSWORD": "your_password"
      }
    }
  }
}
```

**Option B — Bearer token (OpenID Connect / OAuth2):**

```json
{
  "mcpServers": {
    "codebeamer": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "codebeamer-mcp"],
      "env": {
        "CB_URL": "https://your-instance.example.com/cb/api",
        "CB_API_KEY": "your_oauth2_access_token"
      }
    }
  }
}
```

That's it — `npx` downloads and runs the latest version automatically. If `CB_API_KEY` is set, it takes precedence over username/password.

#### Alternative: global install

```bash
npm install -g codebeamer-mcp
```

Then use `"command": "codebeamer-mcp"` instead of `npx` in the config above.

#### Pinning a specific version

```json
"args": ["-y", "codebeamer-mcp@0.2.0"]
```

### Updates

| Method | Update behavior |
|---|---|
| `npx -y codebeamer-mcp` | Always fetches the latest version |
| `npm install -g codebeamer-mcp` | Stays on installed version. Run `npm update -g codebeamer-mcp` to update |
| Pinned version (`@0.2.0`) | Never auto-updates; change the version string manually |

> ⚠️ **Never commit `.mcp.json` with real credentials** — it is listed in `.gitignore`.

### From source (development)

```bash
git clone https://github.com/3KniGHtcZ/codebeamer-mcp.git
cd codebeamer-mcp
npm install
npm run build
```

Then use `"command": "node"` with `"args": ["dist/index.js"]` in your `.mcp.json`.

## Development & Testing

```bash
# Run tests (no real Codebeamer instance needed)
npm test

# Start the mock API server (port 3001)
node mock-server.mjs

# Interactive testing via MCP Inspector
CB_URL=http://localhost:3001 CB_USERNAME=mock CB_PASSWORD=mock \
  npx @modelcontextprotocol/inspector node dist/index.js
```

## Configuration

| Variable | Description | Default |
|---|---|---|
| `CB_URL` | Codebeamer API URL, e.g. `https://your-instance.example.com/cb/api` (the server appends `/v3` automatically) | _(required)_ |
| `CB_API_KEY` | OAuth2 / OpenID Connect Bearer token. When set, `CB_USERNAME` and `CB_PASSWORD` are not needed | — |
| `CB_USERNAME` | Login username (required if `CB_API_KEY` is not set) | — |
| `CB_PASSWORD` | Password (required if `CB_API_KEY` is not set) | — |
| `CB_API_VERSION` | API version | `v3` |
| `CB_TIMEOUT_MS` | Request timeout (ms) | `30000` |
| `CB_MAX_ITEMS` | Max items per page | `100` |
