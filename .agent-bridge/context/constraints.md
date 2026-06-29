# Project Constraints

## Safety

- Never print raw secrets from config or logs.
- Mask API keys, tokens, bearer values, and long secret-looking strings.
- Never write to Claude config without creating a timestamped backup.
- Auto-fix only deterministic mechanical issues.
- Do not start or kill Claude Desktop from the tool in V1.

## Technical

- Use Node.js standard library only for V1.
- Keep install simple: `npm install` should not need native dependencies.
- Support Windows paths and PowerShell users.
- Prefer explicit JSON parsing and structured diagnostics over regex-only behavior.
- Tests must create temporary fixtures, not touch the real user config.

## Product

- Output must be plain-English and actionable.
- Every diagnostic should include severity, affected server, evidence, and suggested fix.
- The tool should be useful even when no config exists.
- Free scan should be valuable. V1 includes only tiny deterministic auto-fixes. Paid/pro future can add broader fix coverage, UI, and multi-client support.
