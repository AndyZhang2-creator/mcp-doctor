# Contributing

Thanks for helping make MCP setup less painful.

## Local Setup

```powershell
npm install
npm test
```

## Good First Issues

- Add more Claude Desktop MCP log patterns.
- Improve diagnostic wording.
- Add fixtures for common broken MCP server configs.
- Add Mac support once the Windows-first path is stable.

## Safety Rules

- Never add fixtures with real tokens.
- Keep config/log data local.
- Mask secret-looking output.
- Keep auto-fixes deterministic and reversible.
- Add tests for every new fix.
