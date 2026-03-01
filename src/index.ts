#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { HttpClient } from "./client/http-client.js";
import { CodebeamerClient } from "./client/codebeamer-client.js";
import {
  registerProjectTools,
  registerTrackerTools,
  registerItemTools,
  registerItemDetailTools,
  registerUserTools,
} from "./tools/index.js";

const config = loadConfig();

const server = new McpServer({
  name: "codebeamer",
  version: "0.1.0",
});

const httpClient = new HttpClient(config);
const client = new CodebeamerClient(httpClient);

registerProjectTools(server, client);
registerTrackerTools(server, client);
registerItemTools(server, client);
registerItemDetailTools(server, client);
registerUserTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
