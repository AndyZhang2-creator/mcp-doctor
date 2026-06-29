# MCP Doctor v0.1.0

First public release of MCP Doctor.

## What It Does

- Scans Claude Desktop MCP config on Windows.
- Reads recent Claude MCP logs.
- Reports invalid JSON, missing `mcpServers`, missing commands, Windows `npx` wrapper issues, empty env values, unexpanded env placeholders, and Claude log errors.
- Masks secret-looking values in output.
- Previews safe fixes by default.
- Writes only with `--fix --yes --dry-run=false`.
- Creates a timestamped backup before writing.

## Install

```powershell
npm install -g github:AndyZhang2-creator/mcp-doctor
mcp-doctor scan
```

## Notes

This release is intentionally narrow: Claude Desktop first, Windows first, local-only.
