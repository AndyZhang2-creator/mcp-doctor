# Social Posts

## X/Twitter

```text
Built MCP Doctor: a local CLI for "why is my MCP server not showing up in Claude Desktop?"

It checks config JSON, PATH, Windows npx/cmd issues, empty env vars, unexpanded paths, and Claude MCP logs.

Local-only. Secrets masked. Backup before writes.

https://github.com/AndyZhang2-creator/mcp-doctor
```

```text
Tiny MCP debugging painkiller:

mcp-doctor scan

Finds Claude Desktop MCP config/log issues locally:
- invalid JSON
- missing command
- Windows npx wrapper issue
- empty env values
- Claude MCP log errors

https://github.com/AndyZhang2-creator/mcp-doctor
```

## LinkedIn

```text
I built MCP Doctor, a local CLI for debugging Claude Desktop MCP setup problems on Windows.

The first version focuses on the failures that waste time:
- broken `claude_desktop_config.json`
- commands missing from PATH
- Windows `npx` launch issues
- empty env vars
- unexpanded `%APPDATA%`
- Claude MCP log errors

It does not upload config or logs, masks secret-looking values, and only writes fixes when explicitly requested.

Repo: https://github.com/AndyZhang2-creator/mcp-doctor
```

## GitHub Discussion Post

```text
I made a small local doctor CLI for Claude Desktop MCP setup issues:

https://github.com/AndyZhang2-creator/mcp-doctor

It is meant for cases where an MCP server does not show up and the UI does not explain why. It scans local config and logs, masks secrets, and reports actionable diagnostics. V1 is Windows-first because the npx/cmd/PATH issues are common there.
```
