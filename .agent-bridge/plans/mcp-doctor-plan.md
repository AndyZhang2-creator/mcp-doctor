# MCP Doctor Plan

Status: ACTIVE
Owner: Codex
Date: 2026-06-29

## Mission

Build a Claude Desktop-first MCP diagnostic CLI that finds and safely fixes the most common reasons MCP servers do not show up or fail silently.

## Product Bet

MCP is moving fast, but local setup still breaks on boring details: bad JSON, bad Windows paths, missing `npx`, missing env vars, stdio servers logging to stdout, hidden Claude logs, and full restart requirements. A small local tool can become the trusted first stop for "my MCP server is broken."

## V1 Scope

1. CLI command: `mcp-doctor scan`
2. Optional safe fix mode: `mcp-doctor scan --fix`
3. Claude Desktop config discovery:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS/Linux paths documented but not primary
4. Claude log discovery:
   - Windows: `%APPDATA%\Claude\logs\mcp*.log`
5. Diagnostics:
   - Missing config
   - Invalid JSON
   - Missing `mcpServers`
   - Empty server map
   - Missing command
   - Relative command path for local executables
   - Missing executable on PATH
   - Windows `npx` entries that should run through `cmd /c`
   - `%APPDATA%` literal or unresolved env placeholders in config/env
   - Missing env values
   - Secret masking in output
   - Recent log errors summarized per server
6. Safe fixes:
   - Wrap Windows `npx` commands as `cmd /c npx ...`
   - Expand `%APPDATA%` in env values when safe
   - Create config backup before writing
7. Tests:
   - Unit tests for diagnostics
   - Unit tests for safe fixes
   - CLI smoke test against fixtures
8. Docs:
   - README
   - Agent Bridge review notes

## Agent Roles

### Product Agent

Checks whether the MVP solves an urgent, narrow job and avoids scope creep.

### Engineering Agent

Checks architecture, implementation risks, test strategy, and Windows behavior.

### CEO Agent

Challenges whether the product is sharp enough, says where agents went wrong, and decides what to improve before final implementation.

## Build Plan

1. Create project skeleton.
2. Implement config discovery and parsing.
3. Implement diagnostic engine.
4. Implement safe fix planner and writer.
5. Implement CLI rendering.
6. Add fixtures and tests.
7. Write README and launch positioning.
8. Run CEO review and revise.

## Acceptance Criteria

- `npm test` passes.
- `node bin/mcp-doctor.js scan --config test/fixtures/valid-claude-config.json --logs test/fixtures/logs` prints useful diagnostics.
- `node bin/mcp-doctor.js scan --config test/fixtures/npx-windows-config.json --fix --yes --dry-run=false` writes a backup and fixes the temp config in tests.
- Real config scanning is read-only unless `--fix --yes` is passed.
- Output masks secrets.
- CEO review artifact lists what was wrong and what changed.

## Risks

- Risk: accidentally leaking secrets.
  Mitigation: central mask function, test it.

- Risk: unsafe config writes.
  Mitigation: backups, explicit `--fix --yes`, limited fix set.

- Risk: trying to support too many clients.
  Mitigation: Claude Desktop only in V1.

- Risk: a generic checker is less useful than official MCP Inspector.
  Mitigation: target the local host setup layer that Inspector does not fully solve for beginners.

## CEO Review Incorporated

Decision: HOLD SCOPE.

Changes accepted before implementation:

- Keep the product Claude Desktop + Windows first.
- Keep `--fix`, but only for deterministic V1 fixes:
  - wrap Windows `npx` as `cmd /c npx ...`
  - expand `%APPDATA%` in env values when deterministic
- Default fixes to dry-run.
- Require `--fix --yes --dry-run=false` before writing.
- Treat log analysis as conservative evidence display, not smart root-cause inference.
- Make masking, backup, and fix planning first-class tested modules.
