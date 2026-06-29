# MCP Doctor Launch Kit

This is the cheap-start advertising plan for MCP Doctor.

Goal: find people whose Claude Desktop MCP setup is already broken, help them fix it, and turn those conversations into product feedback.

## Positioning

One-line pitch:

> MCP server not showing up in Claude Desktop? MCP Doctor finds the broken config, bad path, missing env var, Windows `npx` issue, or Claude log error locally.

Short pitch:

> MCP Doctor is a local CLI for debugging Claude Desktop MCP setup problems on Windows. It scans `claude_desktop_config.json` and Claude MCP logs, masks secrets, explains the likely failure, and can safely apply tiny mechanical fixes with backups.

Do not pitch it as a broad MCP platform yet. The wedge is specific: Claude Desktop, Windows, local diagnostics, secret-safe output.

## Target Users

- AI builders installing MCP servers for Claude Desktop.
- Consultants setting up MCP for clients.
- Developers stuck on Windows `npx`, PATH, env var, or config problems.
- MCP server authors who need a support tool for their users.

## Channels

Use these in order:

1. GitHub README and issues.
2. Show HN.
3. Reddit communities where MCP and Claude Desktop setup are on topic.
4. X/Twitter and LinkedIn short demos.
5. Helpful replies to public GitHub issues from MCP server repos.
6. Short video demos.

Do not start with paid ads. The audience is small, technical, and pain-driven. Organic support replies will beat generic ads.

## Seven-Day Launch Plan

Day 0: make the repo public, add topics, verify install, create release `v0.1.0`.

Day 1: post Show HN with the repo link. Stay in comments and answer every real question.

Day 2: post one useful Reddit guide, not a drive-by link. Title it around the pain: "MCP server not showing up in Claude Desktop on Windows?"

Day 3: search GitHub issues in popular MCP server repos for setup failures. Reply with diagnosis steps and link MCP Doctor only when relevant.

Day 4: record a 45 to 60 second demo showing a broken config, the scan, a dry-run fix, and the backup behavior.

Day 5: write one tutorial: "How to debug Claude Desktop MCP servers on Windows."

Day 6: collect the first five user problems and turn repeated pain into issues.

Day 7: publish the package to npm if logged in and ready. The `mcp-doctor` npm name is taken, so use `claude-mcp-doctor` unless you choose a scoped package.

## What To Measure

- GitHub stars are nice, but issues and comments matter more.
- Count installs only after npm publish.
- Track repeated diagnostic misses.
- Track how many people say "this found the problem."
- Track which MCP server names appear most in bug reports.

## Product Follow-Ups

High-signal features after launch:

- Mac support.
- More Claude log patterns.
- Cursor and VS Code MCP config detection.
- `doctor.json` machine-readable output.
- A tiny desktop wrapper after CLI adoption is proven.
- Server-author support mode: "ask users to run this and paste masked output."
