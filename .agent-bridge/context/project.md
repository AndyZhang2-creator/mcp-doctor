# MCPTool Project Context

## Product

MCP Doctor is a Claude Desktop-first diagnostic tool for broken MCP setups on Windows.

The first user is a builder who tried to add an MCP server to Claude Desktop and cannot tell why it does not show up. The tool should scan the local Claude config and logs, explain the exact failure, and offer safe fixes with backups.

## Current Goal

Ship the best cheap-start version:

- Local CLI first, no hosted service.
- Claude Desktop first, Windows first.
- Diagnose real MCP setup problems.
- Apply only safe mechanical fixes.
- Keep credentials local and masked.
- Include an Agent Bridge plan, agent notes, CEO review, tests, and README.

## Non-Goals For V1

- Do not build a full GUI.
- Do not support every MCP host yet.
- Do not upload user config or logs.
- Do not invent cloud auth.
- Do not auto-edit secrets.

## User Outcome

A user runs one command and learns:

- Where Claude Desktop config is.
- Whether JSON is valid.
- Which MCP servers are configured.
- Whether commands like node, npm, npx, uv, python, and cmd exist.
- Whether common Windows MCP issues are present.
- What Claude logs say about failures.
- What safe changes can be applied.

