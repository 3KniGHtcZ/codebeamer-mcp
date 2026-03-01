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
- Node.js 18+
- Access to a Codebeamer instance (URL, username, password)

### 1. Clone and build

```bash
git clone https://github.com/3KniGHtcZ/codebeamer-mcp.git
cd codebeamer-mcp
npm install
npm run build
```

### 2. Configure credentials

**Option A – environment variables** (recommended):
```bash
export CB_URL=https://your-instance.example.com
export CB_USERNAME=your_username
export CB_PASSWORD=your_password
```

**Option B – `.env` file** (local development):
```
CB_URL=https://your-instance.example.com
CB_USERNAME=your_username
CB_PASSWORD=your_password
```

### 3. Connect to Claude Code

Edit `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "codebeamer": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "CB_URL": "https://your-instance.example.com",
        "CB_USERNAME": "your_username",
        "CB_PASSWORD": "your_password"
      }
    }
  }
}
```

> ⚠️ **Never commit `.mcp.json` with real credentials** — it is listed in `.gitignore`.
> Place it in the root of the project where you use Claude Code, or globally at `~/.claude/mcp.json`.

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
| `CB_URL` | Codebeamer instance URL | _(required)_ |
| `CB_USERNAME` | Login username | _(required)_ |
| `CB_PASSWORD` | Password | _(required)_ |
| `CB_API_VERSION` | API version | `v3` |
| `CB_TIMEOUT_MS` | Request timeout (ms) | `30000` |
| `CB_MAX_ITEMS` | Max items per page | `100` |
