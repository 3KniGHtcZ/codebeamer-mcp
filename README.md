# codebeamer-mcp

An MCP (Model Context Protocol) server for Codebeamer ALM. Allows Claude and other MCP clients to read and write projects, trackers, and items in Codebeamer using natural language.

## Tools (17)

### Read

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

### Write

| Tool | Description |
|---|---|
| `create_item` | Create a new item in a tracker. Supports folders, item type, and parent nesting |
| `update_item` | Update an existing item (name, description, status, priority, assignee, custom fields) |
| `add_comment` | Add a comment to an item |
| `create_association` | Create an association between two items (e.g. depends on, blocks) |
| `create_reference` | Add a downstream traceability reference between two items |
| `create_harm` | Create a harm entry in an RM Harms List tracker with IMDRF code and severity (1–5) |

## Installation

### Requirements
- Node.js 20+
- Access to a Codebeamer instance (URL, username, password)

### Quick Start (npm)

No need to clone the repository. Add this to your `.mcp.json` (project root or `~/.claude/mcp.json` for global):

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

That's it — `npx` downloads and runs the latest version automatically.

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
| `CB_USERNAME` | Login username | _(required)_ |
| `CB_PASSWORD` | Password | _(required)_ |
| `CB_API_VERSION` | API version | `v3` |
| `CB_TIMEOUT_MS` | Request timeout (ms) | `30000` |
| `CB_MAX_ITEMS` | Max items per page | `100` |
