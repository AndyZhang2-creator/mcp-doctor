# npm Publish Notes

Checked on 2026-06-29:

- `mcp-doctor` is already taken on npm.
- `claude-mcp-doctor` was not found on npm.
- This machine was not logged into npm.

The package name in `package.json` is set to `claude-mcp-doctor`, while the installed command remains `mcp-doctor`.

## Publish

```powershell
npm adduser
npm test
npm pack --dry-run
npm publish
```

After publish, users should be able to run:

```powershell
npx claude-mcp-doctor scan
```

or:

```powershell
npm install -g claude-mcp-doctor
mcp-doctor scan
```

## After Publish

Update `README.md` install instructions to put npm first and GitHub second.

Add this to the Show HN first comment:

```text
Install:

npx claude-mcp-doctor scan
```
