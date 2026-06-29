#!/usr/bin/env node
"use strict";

const { run } = require("../src/cli");
const { maskText } = require("../src/mask");

run({
  argv: process.argv.slice(2),
  env: process.env,
  platform: process.platform,
  stdout: process.stdout,
  stderr: process.stderr,
}).then((code) => {
  process.exitCode = code;
}).catch((error) => {
  console.error(`mcp-doctor failed: ${maskText(error.message || String(error))}`);
  process.exitCode = 1;
});
