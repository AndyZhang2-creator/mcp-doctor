# Demo Script

## 45-Second Demo

Scene 1: Broken Setup

Show `claude_desktop_config.json` with an `npx` MCP server and `%APPDATA%` in an env value. Do not show real tokens.

Voice:

```text
When an MCP server does not show up in Claude Desktop, the UI often does not tell you why.
```

Scene 2: Run Scan

```powershell
mcp-doctor scan --config .\test\fixtures\npx-windows-config.json --logs .\test\fixtures\logs
```

Voice:

```text
MCP Doctor scans your local config and Claude MCP logs. It masks secret-looking values before printing anything.
```

Scene 3: Show Findings

Zoom on:

```text
windows-npx-wrapper
unexpanded-percent-env
claude-log-error
```

Voice:

```text
Here it found the Windows npx wrapper issue, an unexpanded APPDATA path, and the relevant Claude log line.
```

Scene 4: Preview Fix

```powershell
mcp-doctor scan --fix
```

Voice:

```text
Fix mode starts as a preview. It only writes when you pass the explicit write flags.
```

Scene 5: Safety

```powershell
mcp-doctor scan --fix --yes --dry-run=false
```

Voice:

```text
When it writes, it creates a timestamped backup first. V1 only applies tiny mechanical fixes.
```

Scene 6: Close

Show the GitHub repo.

Voice:

```text
If your MCP server is not showing up in Claude Desktop on Windows, try MCP Doctor.
```

## Screenshot Checklist

- README first viewport.
- Terminal scan output.
- Masked secret in output.
- Safe fix command.
- Backup file after write.
