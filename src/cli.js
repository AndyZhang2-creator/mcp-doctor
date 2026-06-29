"use strict";

const { getDefaultClaudePaths } = require("./discovery");
const { readClaudeConfig } = require("./config");
const { loadClaudeLogs } = require("./logs");
const { diagnose } = require("./diagnostics");
const { planFixes, writeConfigWithBackup } = require("./fixes");
const { renderReport } = require("./render");

function parseArgs(argv) {
  const args = {
    command: "scan",
    fix: false,
    yes: false,
    dryRun: true,
  };

  const tokens = [...argv];
  if (tokens[0] && !tokens[0].startsWith("-")) {
    args.command = tokens.shift();
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === "--help" || token === "-h") args.help = true;
    else if (token === "--fix") args.fix = true;
    else if (token === "--yes" || token === "-y") args.yes = true;
    else if (token === "--config") args.configPath = tokens[++i];
    else if (token.startsWith("--config=")) args.configPath = token.slice("--config=".length);
    else if (token === "--logs") args.logDir = tokens[++i];
    else if (token.startsWith("--logs=")) args.logDir = token.slice("--logs=".length);
    else if (token === "--platform") args.platform = tokens[++i];
    else if (token.startsWith("--platform=")) args.platform = token.slice("--platform=".length);
    else if (token === "--dry-run=false") args.dryRun = false;
    else if (token === "--dry-run=true" || token === "--dry-run") args.dryRun = true;
    else throw new Error(`Unknown option: ${token}`);
  }

  return args;
}

function helpText() {
  return [
    "MCP Doctor",
    "",
    "Usage:",
    "  mcp-doctor scan [--config path] [--logs path]",
    "  mcp-doctor scan --fix --yes --dry-run=false [--config path]",
    "",
    "Default behavior is read-only. Fix mode is dry-run unless --dry-run=false is passed.",
    "",
  ].join("\n");
}

async function run({ argv, env, platform, stdout, stderr }) {
  const args = parseArgs(argv);
  const activePlatform = args.platform || env.MCP_DOCTOR_PLATFORM || platform;

  if (args.help) {
    stdout.write(helpText());
    return 0;
  }

  if (args.command !== "scan") {
    stderr.write(`Unknown command: ${args.command}\n`);
    return 1;
  }

  const defaults = getDefaultClaudePaths({ platform: activePlatform, env });
  const configPath = args.configPath || defaults.configPath;
  const logDir = args.logDir || defaults.logDir;

  const configResult = readClaudeConfig(configPath);
  const logsResult = loadClaudeLogs(logDir);
  const diagnostics = diagnose({
    configResult,
    logsResult,
    platform: activePlatform,
    env,
  });

  let fixPlan = null;
  let writeResult = null;
  if (args.fix && configResult.ok) {
    fixPlan = planFixes(configResult.config, {
      platform: activePlatform,
      env,
    });

    if (fixPlan.changed && args.yes && args.dryRun === false) {
      writeResult = writeConfigWithBackup(configPath, fixPlan.config);
    }
  }

  stdout.write(renderReport({
    configPath,
    logDir,
    configResult,
    logsResult,
    diagnostics,
    fixPlan,
    writeResult,
    fixRequested: args.fix,
    yes: args.yes,
    dryRun: args.dryRun,
    platform: activePlatform,
  }));

  return 0;
}

module.exports = {
  parseArgs,
  run,
};

