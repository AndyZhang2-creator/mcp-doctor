# MCP Doctor

MCP server not showing up in Claude Desktop?

MCP Doctor scans your local Claude Desktop MCP config and logs, then explains the broken JSON, missing command, bad Windows `npx` setup, empty env value, or Claude log error that is keeping the server from loading.

It is local-only. It masks secrets. It will not write config changes unless you explicitly ask it to.

## Why It Exists

MCP setup failures are usually tiny and annoying:

- `npx` works in PowerShell but Claude cannot spawn it.
- A config file has valid-looking JSON with the wrong shape.
- An env var is empty.
- `%APPDATA%` stays unexpanded.
- Claude Desktop logs the real error, but the user never sees it.

MCP Doctor gives that failure a name and a next step.

## Install

Install from GitHub:

```powershell
npm install -g github:AndyZhang2-creator/mcp-doctor
```

Then run:

```powershell
mcp-doctor scan
```

For local development:

```powershell
git clone https://github.com/AndyZhang2-creator/mcp-doctor.git
cd mcp-doctor
npm install
node .\bin\mcp-doctor.js scan
```

No runtime dependencies are required.

## Usage

Read-only scan:

```powershell
mcp-doctor scan
```

Scan a specific config:

```powershell
mcp-doctor scan --config "$env:APPDATA\Claude\claude_desktop_config.json"
```

Preview safe fixes:

```powershell
mcp-doctor scan --fix
```

Write safe fixes:

```powershell
mcp-doctor scan --fix --yes --dry-run=false
```

Fix mode creates a timestamped backup before writing.

## Example Output

```text
Diagnostics: 0 error(s), 3 warning(s)

1. [WARNING] claude-log-error
   Server: brave
   Evidence: mcp-server-brave.log: 2026-06-29T10:00:01Z ERROR spawn npx ENOENT token=***MASKED***
   Suggested fix: Review this Claude MCP log line. It may explain why the server did not connect.
   Fixable by MCP Doctor: no

2. [WARNING] windows-npx-wrapper
   Server: memory
   Evidence: On Windows, Claude Desktop often needs npx launched through cmd /c.
   Suggested fix: Use command "cmd" and args ["/c", "npx", ...].
   Fixable by MCP Doctor: yes
```

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

Check package contents:

```powershell
npm pack --dry-run
```

## Launch Kit

Advertising copy, launch posts, support replies, and video scripts are in [docs/launch-kit/README.md](docs/launch-kit/README.md).

Current positioning:

> Fix Claude Desktop MCP setup problems locally, without uploading your config or secrets.

First target users:

- AI builders setting up MCP servers
- Consultants configuring Claude Desktop for clients
- Developers debugging Windows `npx` and config issues

This is intentionally not a broad MCP platform yet. V1 knows one job: Claude Desktop MCP setup repair on Windows.
