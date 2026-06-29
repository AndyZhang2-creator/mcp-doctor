# Security Policy

MCP Doctor is designed to inspect local Claude Desktop MCP config and logs without sending them anywhere.

## Reporting

Please report security issues through GitHub security advisories if available, or open an issue with only non-secret reproduction details.

Do not paste real API keys, bearer tokens, private keys, Claude config files, or logs that contain credentials.

## Data Handling

- Config files stay on the user's machine.
- Log files stay on the user's machine.
- Secret-looking values are masked in CLI output.
- Write mode requires `--fix --yes --dry-run=false`.
- Write mode creates a timestamped backup next to the original config.

## Supported Version

The current supported version is `0.1.x`.
