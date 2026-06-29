"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const { readClaudeConfig } = require("../src/config");
const { diagnoseConfig, diagnose } = require("../src/diagnostics");
const { planFixes, writeConfigWithBackup } = require("../src/fixes");
const { maskObject, maskText } = require("../src/mask");
const { commandExists } = require("../src/path-utils");
const { loadClaudeLogs } = require("../src/logs");

const ROOT = path.resolve(__dirname, "..");
const FIXTURES = path.join(__dirname, "fixtures");

function fixture(name) {
  return path.join(FIXTURES, name);
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "mcp-doctor-"));
}

test("maskText hides common secret shapes", () => {
  const text = "Authorization: Bearer sk-test_abcdefghijklmnopqrstuvwxyz123456 token=ghp_abcdefghijklmnopqrstuvwxyz123456";
  const masked = maskText(text);
  assert.equal(masked.includes("sk-test"), false);
  assert.equal(masked.includes("ghp_"), false);
  assert.match(masked, /\*\*\*MASKED\*\*\*/);
});

test("maskObject masks secret-keyed config values", () => {
  const masked = maskObject({
    env: {
      BRAVE_API_KEY: "abc123",
      NORMAL_PATH: "C:\\Users\\andy",
    },
  });
  assert.equal(masked.env.BRAVE_API_KEY, "***MASKED***");
  assert.equal(masked.env.NORMAL_PATH, "C:\\Users\\andy");
});

test("invalid JSON is reported before diagnostics inspect servers", () => {
  const config = readClaudeConfig(fixture("invalid-json.json"));
  const diagnostics = diagnoseConfig({ configResult: config, platform: "win32", env: process.env });
  assert.equal(config.ok, false);
  assert.equal(diagnostics[0].id, "invalid-json");
});

test("empty mcpServers is a warning", () => {
  const config = readClaudeConfig(fixture("empty-mcpservers.json"));
  const diagnostics = diagnoseConfig({ configResult: config, platform: "win32", env: process.env });
  assert.equal(diagnostics[0].id, "empty-mcpservers");
  assert.equal(diagnostics[0].severity, "warning");
});

test("missing env values are diagnosed without printing secrets", () => {
  const config = readClaudeConfig(fixture("missing-env-config.json"));
  const diagnostics = diagnoseConfig({ configResult: config, platform: "win32", env: process.env });
  assert.ok(diagnostics.some((item) => item.id === "missing-env-value"));
});

test("windows npx config gets a safe fix plan", () => {
  const config = readClaudeConfig(fixture("npx-windows-config.json"));
  const fixPlan = planFixes(config.config, {
    platform: "win32",
    env: { APPDATA: "C:\\Users\\andyl\\AppData\\Roaming" },
  });

  assert.equal(fixPlan.changed, true);
  assert.equal(fixPlan.config.mcpServers.memory.command, "cmd");
  assert.deepEqual(fixPlan.config.mcpServers.memory.args.slice(0, 3), ["/c", "npx", "-y"]);
  assert.equal(fixPlan.config.mcpServers.memory.env.APP_PATH, "C:\\Users\\andyl\\AppData\\Roaming\\Claude\\data");
});

test("windows npx auto-fix refuses non-array args", () => {
  const config = readClaudeConfig(fixture("npx-string-args-config.json"));
  const diagnostics = diagnoseConfig({
    configResult: config,
    platform: "win32",
    env: process.env,
  });
  const fixPlan = planFixes(config.config, {
    platform: "win32",
    env: { APPDATA: "C:\\Users\\andyl\\AppData\\Roaming" },
  });

  assert.ok(diagnostics.some((item) => item.id === "windows-npx-wrapper-unsafe" && item.fixable === false));
  assert.equal(fixPlan.changed, false);
  assert.equal(fixPlan.config.mcpServers.unsafe.command, "npx");
  assert.equal(fixPlan.config.mcpServers.unsafe.args, "-y @modelcontextprotocol/server-memory");
});

test("writeConfigWithBackup creates backup before write", () => {
  const dir = makeTempDir();
  const configPath = path.join(dir, "claude_desktop_config.json");
  fs.copyFileSync(fixture("npx-windows-config.json"), configPath);
  const config = readClaudeConfig(configPath).config;
  const fixed = planFixes(config, {
    platform: "win32",
    env: { APPDATA: "C:\\Users\\andyl\\AppData\\Roaming" },
  }).config;

  const result = writeConfigWithBackup(configPath, fixed, {
    now: new Date("2026-06-29T12:00:00.000Z"),
  });

  assert.equal(fs.existsSync(result.backupPath), true);
  const written = JSON.parse(fs.readFileSync(configPath, "utf8"));
  assert.equal(written.mcpServers.memory.command, "cmd");
});

test("writeConfigWithBackup preserves original when temp write fails", () => {
  const dir = makeTempDir();
  const configPath = path.join(dir, "claude_desktop_config.json");
  fs.copyFileSync(fixture("npx-windows-config.json"), configPath);
  const before = fs.readFileSync(configPath, "utf8");
  const config = readClaudeConfig(configPath).config;
  const fixed = planFixes(config, {
    platform: "win32",
    env: { APPDATA: "C:\\Users\\andyl\\AppData\\Roaming" },
  }).config;

  const fsImpl = {
    copyFileSync: fs.copyFileSync,
    readFileSync: fs.readFileSync,
    renameSync: fs.renameSync,
    existsSync: fs.existsSync,
    unlinkSync: fs.unlinkSync,
    writeFileSync(filePath, payload, encoding) {
      if (String(filePath).includes(".tmp-")) throw new Error("simulated temp write failure");
      return fs.writeFileSync(filePath, payload, encoding);
    },
  };

  assert.throws(() => writeConfigWithBackup(configPath, fixed, {
    fsImpl,
    now: new Date("2026-06-29T12:00:00.000Z"),
  }), /simulated temp write failure/);

  assert.equal(fs.readFileSync(configPath, "utf8"), before);
});

test("commandExists respects Windows PATHEXT", () => {
  const dir = makeTempDir();
  fs.writeFileSync(path.join(dir, "npx.cmd"), "@echo off\n");
  assert.equal(commandExists("npx", {
    platform: "win32",
    env: { PATH: dir, PATHEXT: ".COM;.EXE;.BAT;.CMD" },
  }), true);
});

test("log diagnostics are masked", () => {
  const config = readClaudeConfig(fixture("valid-claude-config.json"));
  const logs = loadClaudeLogs(fixture("logs"));
  const diagnostics = diagnose({
    configResult: config,
    logsResult: logs,
    platform: "win32",
    env: process.env,
  });

  const logDiag = diagnostics.find((item) => item.id === "claude-log-error");
  assert.ok(logDiag);
  assert.equal(logDiag.evidence.includes("sk-test"), false);
});

test("missing config diagnostic is covered", () => {
  const missingPath = path.join(makeTempDir(), "missing.json");
  const config = readClaudeConfig(missingPath);
  const diagnostics = diagnoseConfig({ configResult: config, platform: "win32", env: process.env });
  assert.equal(diagnostics[0].id, "missing-config");
});

test("missing executable diagnostic is covered", () => {
  const config = readClaudeConfig(fixture("missing-command-config.json"));
  const diagnostics = diagnoseConfig({
    configResult: config,
    platform: "win32",
    env: { PATH: makeTempDir(), PATHEXT: ".COM;.EXE;.BAT;.CMD" },
  });
  assert.ok(diagnostics.some((item) => item.id === "command-not-found"));
});

test("CLI errors mask secret-looking unknown arguments", () => {
  const result = require("node:child_process").spawnSync(process.execPath, [
    path.join(ROOT, "bin", "mcp-doctor.js"),
    "scan",
    "--token=sk-test_abcdefghijklmnopqrstuvwxyz123456",
  ], {
    cwd: ROOT,
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  assert.equal(result.stderr.includes("sk-test"), false);
  assert.match(result.stderr, /\*\*\*MASKED\*\*\*/);
});

test("log diagnostics keep newest files first when limiting", () => {
  const dir = makeTempDir();
  for (let i = 0; i < 14; i += 1) {
    const file = path.join(dir, `mcp-server-${String(i).padStart(2, "0")}.log`);
    fs.writeFileSync(file, `2026-06-29T10:00:${String(i).padStart(2, "0")}Z ERROR file-${i}\n`);
    const time = new Date(2026, 5, 29, 10, 0, i);
    fs.utimesSync(file, time, time);
  }

  const logs = loadClaudeLogs(dir, { maxFiles: 14, maxLines: 5 });
  const diagnostics = require("../src/logs").summarizeLogDiagnostics(logs);
  assert.equal(diagnostics.length, 12);
  assert.match(diagnostics[0].evidence, /file-13/);
  assert.equal(diagnostics.some((item) => /file-0\b/.test(item.evidence)), false);
});

test("CLI scan prints diagnostics for fixture config", () => {
  const output = execFileSync(process.execPath, [
    path.join(ROOT, "bin", "mcp-doctor.js"),
    "scan",
    "--platform=win32",
    `--config=${fixture("npx-windows-config.json")}`,
    `--logs=${fixture("logs")}`,
  ], {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      APPDATA: "C:\\Users\\andyl\\AppData\\Roaming",
    },
  });

  assert.match(output, /windows-npx-wrapper/);
  assert.match(output, /Fix mode:\n  Not requested/);
  assert.equal(output.includes("sk-test"), false);
});

test("CLI fix defaults to dry-run and does not write", () => {
  const dir = makeTempDir();
  const configPath = path.join(dir, "claude_desktop_config.json");
  fs.copyFileSync(fixture("npx-windows-config.json"), configPath);

  execFileSync(process.execPath, [
    path.join(ROOT, "bin", "mcp-doctor.js"),
    "scan",
    "--platform=win32",
    `--config=${configPath}`,
    "--fix",
    "--yes",
  ], {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      APPDATA: "C:\\Users\\andyl\\AppData\\Roaming",
    },
  });

  const after = JSON.parse(fs.readFileSync(configPath, "utf8"));
  assert.equal(after.mcpServers.memory.command, "npx");
});

test("CLI fix writes only with yes and dry-run false", () => {
  const dir = makeTempDir();
  const configPath = path.join(dir, "claude_desktop_config.json");
  fs.copyFileSync(fixture("npx-windows-config.json"), configPath);

  const output = execFileSync(process.execPath, [
    path.join(ROOT, "bin", "mcp-doctor.js"),
    "scan",
    "--platform=win32",
    `--config=${configPath}`,
    "--fix",
    "--yes",
    "--dry-run=false",
  ], {
    cwd: ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      APPDATA: "C:\\Users\\andyl\\AppData\\Roaming",
    },
  });

  const after = JSON.parse(fs.readFileSync(configPath, "utf8"));
  assert.equal(after.mcpServers.memory.command, "cmd");
  assert.match(output, /Backup:/);
  assert.equal(fs.readdirSync(dir).some((name) => name.includes(".bak-")), true);
});
