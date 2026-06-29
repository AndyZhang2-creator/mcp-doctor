# Reddit Drafts

Read each subreddit rule page before posting. Do not post the same thing everywhere. Lead with the useful debugging steps, then link the repo.

## r/ClaudeAI Style Post

Title:

```text
MCP server not showing up in Claude Desktop on Windows? I made a local doctor CLI
```

Body:

```text
I kept seeing the same Claude Desktop MCP setup failure pattern on Windows: config looks fine, the server never appears, and the useful error is buried in logs.

I made MCP Doctor, a local Node CLI that checks:

- claude_desktop_config.json exists and parses
- mcpServers has the right shape
- each command exists on PATH
- Windows npx servers use cmd /c where needed
- env values are not empty
- %APPDATA% and ${VAR} placeholders are not left unexpanded
- Claude MCP logs have recent error lines

It masks secret-looking output and does not upload config or logs.

Install from GitHub:

npm install -g github:AndyZhang2-creator/mcp-doctor
mcp-doctor scan

Repo:
https://github.com/AndyZhang2-creator/mcp-doctor

If you have a broken MCP setup, I would like to know whether it catches the real issue or misses it.
```

## r/mcp Style Post

Title:

```text
Local Claude Desktop MCP setup diagnostics for Windows
```

Body:

```text
I built a small CLI called MCP Doctor for debugging Claude Desktop MCP setup problems locally.

The goal is not to be a full MCP platform. It is a narrow support tool for the boring failures: invalid config JSON, missing commands, PATH issues, Windows npx launch issues, empty env vars, unexpanded paths, and Claude MCP log errors.

It is useful for MCP server authors too: instead of asking users to paste their whole config, ask them to run a local scan and share the masked output.

Repo:
https://github.com/AndyZhang2-creator/mcp-doctor
```

## Reply Template

Use this when someone is already asking for help:

```text
This looks like the kind of issue MCP Doctor is meant to catch. It runs locally and masks secret-looking values:

npm install -g github:AndyZhang2-creator/mcp-doctor
mcp-doctor scan

If it reports a `claude-log-error` or `windows-npx-wrapper` warning, that may point to the fix. Do not paste unmasked config or tokens publicly.
```
