# Support Playbook

The best advertising is helping people already stuck.

## Search Queries

Use these on GitHub, Reddit, and search engines:

```text
"Claude Desktop" "MCP" "npx" "ENOENT"
"claude_desktop_config.json" "not showing up"
"MCP server" "Claude" "Windows" "npx"
"MCP" "spawn npx ENOENT"
"mcpServers" "Claude Desktop" "PATH"
```

## Helpful Reply Pattern

1. Acknowledge the exact symptom.
2. Suggest one manual check.
3. Offer MCP Doctor as a local way to collect masked evidence.
4. Warn them not to paste secrets.

Template:

```text
This might be a Windows spawn/PATH issue rather than the MCP server itself.

Quick manual check: look for recent files under `%APPDATA%\Claude\logs` and search for `ERROR`, `ENOENT`, or the server name.

I built MCP Doctor to automate that local check:

npm install -g github:AndyZhang2-creator/mcp-doctor
mcp-doctor scan

It masks secret-looking values, but still do not paste raw config or tokens publicly.
```

## Issue Labels To Add Later

- `diagnostic-miss`
- `needs-fixture`
- `mac-support`
- `log-pattern`
- `safe-fix`

## Feedback Questions

Ask users:

- Did MCP Doctor find the real issue?
- Which MCP server were you trying to install?
- Did the suggested fix work after fully quitting and reopening Claude Desktop?
- Was any output confusing?
- Did it print anything you would not feel safe sharing?
