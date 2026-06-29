# MCP Doctor

Claude Desktop MCP setup doctor for Windows.

MCP Doctor scans your local Claude Desktop MCP config and logs, then tells you why servers are not showing up or failing silently. It is local-only, masks secrets, and will not write config changes unless you explicitly ask it to.

## What It Checks

- Missing `claude_desktop_config.json`
- Invalid JSON
- Missing or empty `mcpServers`
- Missing or non-string `command`
- Commands missing from `PATH`
- Relative command paths
- Windows `npx` entries that should run through `cmd /c`
- Empty env values
- `%APPDATA%` or `${VAR}` placeholders that Claude may not expand
- Recent Claude MCP log errors

## Install

For local development:

```powershell
npm install
```

No runtime dependencies are required.

## Usage

Read-only scan:

```powershell
node .\bin\mcp-doctor.js scan
```

Scan a specific config:

```powershell
node .\bin\mcp-doctor.js scan --config "$env:APPDATA\Claude\claude_desktop_config.json"
```

Preview safe fixes:

```powershell
node .\bin\mcp-doctor.js scan --fix
```

Write safe fixes:

```powershell
node .\bin\mcp-doctor.js scan --fix --yes --dry-run=false
```

Fix mode creates a timestamped backup before writing.

## V1 Safe Fixes

MCP Doctor only writes two kinds of fixes in V1:

1. Wrap Windows `npx` servers:

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
}
```

becomes:

```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-memory"]
}
```

2. Expand `%APPDATA%` in env values when Windows provides `APPDATA`.

It does not edit secrets, install packages, start Claude, kill Claude, or guess package names.

## Safety Model

- Config and logs stay on your machine.
- Secret-looking strings are masked in output.
- Writes require `--fix --yes --dry-run=false`.
- Every write creates a backup next to the config file.
- Tests cover masking, dry-run behavior, backup creation, Windows `PATHEXT`, and CLI fixture scans.

## Development

Run tests:

```powershell
npm test
```

Run against fixtures:

```powershell
node .\bin\mcp-doctor.js scan --platform=win32 --config .\test\fixtures\npx-windows-config.json --logs .\test\fixtures\logs
```

## Launch Positioning

Promise:

> Fix Claude Desktop MCP setup problems locally, without uploading your config or secrets.

First target users:

- AI builders setting up MCP servers
- Consultants configuring Claude Desktop for clients
- Developers debugging Windows `npx` and config issues

This is intentionally not a broad MCP platform yet. V1 knows one job: Claude Desktop MCP setup repair on Windows.

