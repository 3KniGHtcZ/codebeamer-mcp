#!/usr/bin/env node

import { createRequire } from "node:module";
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
  registerItemWriteTools,
  registerCommentWriteTools,
  registerAssociationWriteTools,
  registerRiskWriteTools,
} from "./tools/index.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const config = loadConfig();

if (config.unsafeSsl) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const server = new McpServer({
  name: "codebeamer",
  version,
});

const httpClient = new HttpClient(config);
const client = new CodebeamerClient(httpClient);

registerProjectTools(server, client);
registerTrackerTools(server, client);
registerItemTools(server, client);
registerItemDetailTools(server, client);
registerUserTools(server, client);
registerItemWriteTools(server, client);
registerCommentWriteTools(server, client);
registerAssociationWriteTools(server, client);
registerRiskWriteTools(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
