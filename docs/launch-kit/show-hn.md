# Show HN Draft

Checked against the Show HN rules on 2026-06-29. Show HN is for something people can try, not a landing page, signup page, or blog post. Do not ask friends for upvotes.

## Submission

Title:

```text
Show HN: MCP Doctor - debug Claude Desktop MCP setup locally
```

URL:

```text
https://github.com/AndyZhang2-creator/mcp-doctor
```

## First Comment

```text
I built MCP Doctor because Claude Desktop MCP setup failures can be hard to see from the UI, especially on Windows.

It is a local Node CLI. It scans claude_desktop_config.json and Claude MCP logs, masks secret-looking values, and reports issues like invalid JSON, missing commands, empty env vars, unexpanded %APPDATA%, and the common Windows npx/cmd wrapper problem.

It can preview safe fixes with:

  mcp-doctor scan --fix

And it only writes with:

  mcp-doctor scan --fix --yes --dry-run=false

Write mode creates a backup first. V1 is intentionally narrow: Claude Desktop first, Windows first, no cloud service, no telemetry, no secrets uploaded.

I would especially like feedback from people who have had MCP servers fail to show up in Claude Desktop.
```

## Comment Replies

If someone asks why not a GUI:

```text
I started with a CLI because the first pain is diagnosis, and I wanted it to be easy to run from a support thread without uploading config files. A GUI probably makes sense after the diagnostic set is stronger.
```

If someone asks about Mac:

```text
Mac support is the next obvious platform. V1 focuses on Windows because the npx/cmd/PATH failure mode is common there and easy to fix safely.
```

If someone worries about secrets:

```text
That was the main design constraint. The tool reads local files only, masks secret-looking values in output, and does not write unless the explicit write flags are provided. The issue template also tells people not to paste secrets.
```
