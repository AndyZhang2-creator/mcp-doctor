# Engineering Agent Review

Status: COMPLETE

## Architecture

Keep V1 as a small pipeline:

1. Discover inputs.
2. Parse config.
3. Run pure diagnostics.
4. Plan fixes.
5. Render output.
6. Optionally write.

Suggested files:

- `bin/mcp-doctor.js`
- `src/discovery.js`
- `src/config.js`
- `src/diagnostics.js`
- `src/logs.js`
- `src/fixes.js`
- `src/mask.js`
- `src/render.js`

## High-Confidence Diagnostics

- Missing config.
- Invalid JSON.
- Missing or empty `mcpServers`.
- Missing `command`.
- Non-string `command`.
- Unresolved `%APPDATA%` or `${VAR}` in env values.
- Missing env values.
- Missing executable on PATH.
- Windows `npx` or `npm` command issues.
- Recent log lines with clear spawn, ENOENT, JSON, or error text.

## Safe Fixes

- Backup first.
- Require `--fix --yes`.
- Default fix mode to dry-run.
- Rewrite only deterministic fields.
- Safe V1 fixes:
  - `command: "npx"` to `command: "cmd"` with `args: ["/c", "npx", ...oldArgs]` on Windows.
  - Expand `%APPDATA%` only inside env/path-like string values when the variable exists.

## Required Tests

- Fixture-based config discovery.
- Invalid JSON handling.
- Secret masking across config and logs.
- PATH resolution with Windows `PATHEXT`.
- `npx` fix planning.
- Backup creation before write.
- Dry-run no-write behavior.
- Log summarization with masked secrets.
- CLI smoke tests for scan and fix flows.

## User-Harm Risks

- Leaking tokens in evidence.
- Corrupting `claude_desktop_config.json`.
- Applying fixes without explicit consent.
- Treating PowerShell syntax as Claude spawn syntax.
- Shell-concatenating user config into `cmd /c` strings.

