"use strict";

const path = require("node:path");
const { commandExists, hasPathSeparator, isWindows } = require("./path-utils");
const { maskText } = require("./mask");
const { summarizeLogDiagnostics } = require("./logs");

function diagnostic({
  id,
  severity,
  server = "global",
  evidence,
  suggestion,
  fixable = false,
}) {
  return {
    id,
    severity,
    server,
    evidence: maskText(String(evidence || "")),
    suggestion,
    fixable,
  };
}

function diagnoseConfig({ configResult, platform, env }) {
  const diagnostics = [];

  if (!configResult.exists) {
    diagnostics.push(diagnostic({
      id: "missing-config",
      severity: "error",
      evidence: `${configResult.path} does not exist.`,
      suggestion: "Open Claude Desktop developer settings once, or create claude_desktop_config.json with an mcpServers object.",
    }));
    return diagnostics;
  }

  if (!configResult.ok) {
    diagnostics.push(diagnostic({
      id: "invalid-json",
      severity: "error",
      evidence: configResult.error,
      suggestion: "Fix JSON syntax before Claude Desktop can read any MCP servers.",
    }));
    return diagnostics;
  }

  const config = configResult.config;
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    diagnostics.push(diagnostic({
      id: "config-not-object",
      severity: "error",
      evidence: "The top-level Claude config is not a JSON object.",
      suggestion: "Use a top-level object with an mcpServers property.",
    }));
    return diagnostics;
  }

  if (!config.mcpServers || typeof config.mcpServers !== "object" || Array.isArray(config.mcpServers)) {
    diagnostics.push(diagnostic({
      id: "missing-mcpservers",
      severity: "error",
      evidence: "Config does not contain an object property named mcpServers.",
      suggestion: "Add an mcpServers object containing one entry per MCP server.",
    }));
    return diagnostics;
  }

  const entries = Object.entries(config.mcpServers);
  if (entries.length === 0) {
    diagnostics.push(diagnostic({
      id: "empty-mcpservers",
      severity: "warning",
      evidence: "mcpServers exists but has no server entries.",
      suggestion: "Add at least one server entry, then fully quit and reopen Claude Desktop.",
    }));
    return diagnostics;
  }

  for (const [serverName, server] of entries) {
    inspectServer(serverName, server, { platform, env }, diagnostics);
  }

  return diagnostics;
}

function inspectServer(serverName, server, context, diagnostics) {
  if (!server || typeof server !== "object" || Array.isArray(server)) {
    diagnostics.push(diagnostic({
      id: "server-not-object",
      severity: "error",
      server: serverName,
      evidence: "Server entry is not a JSON object.",
      suggestion: "Each mcpServers entry should be an object with command and args.",
    }));
    return;
  }

  const command = server.command;
  if (command === undefined || command === null || command === "") {
    diagnostics.push(diagnostic({
      id: "missing-command",
      severity: "error",
      server: serverName,
      evidence: "Server entry has no command.",
      suggestion: "Add a command, such as cmd for Windows npx servers or an absolute executable path.",
    }));
    return;
  }

  if (typeof command !== "string") {
    diagnostics.push(diagnostic({
      id: "command-not-string",
      severity: "error",
      server: serverName,
      evidence: `command has type ${typeof command}.`,
      suggestion: "Set command to a string.",
    }));
    return;
  }

  if (hasPathSeparator(command) && !path.isAbsolute(command)) {
    diagnostics.push(diagnostic({
      id: "relative-command-path",
      severity: "warning",
      server: serverName,
      evidence: `command is a relative path: ${command}`,
      suggestion: "Use an absolute path. Claude Desktop may launch MCP servers from a different working directory.",
    }));
  }

  if (isWindows(context.platform) && command.toLowerCase() === "npx") {
    if (server.args === undefined || Array.isArray(server.args)) {
      diagnostics.push(diagnostic({
        id: "windows-npx-wrapper",
        severity: "warning",
        server: serverName,
        evidence: "On Windows, Claude Desktop often needs npx launched through cmd /c.",
        suggestion: 'Use command "cmd" and args ["/c", "npx", ...].',
        fixable: true,
      }));
    } else {
      diagnostics.push(diagnostic({
        id: "windows-npx-wrapper-unsafe",
        severity: "error",
        server: serverName,
        evidence: `Cannot safely wrap npx because args has type ${typeof server.args}.`,
        suggestion: 'Change args to an array before using auto-fix, for example ["-y", "@scope/server"].',
        fixable: false,
      }));
    }
  }

  if (!commandExists(command, context)) {
    diagnostics.push(diagnostic({
      id: "command-not-found",
      severity: "error",
      server: serverName,
      evidence: `Command was not found on PATH: ${command}`,
      suggestion: "Install the missing runtime or use an absolute command path.",
    }));
  }

  inspectEnv(serverName, server.env, context, diagnostics);
}

function inspectEnv(serverName, envBlock, context, diagnostics) {
  if (!envBlock) return;
  if (typeof envBlock !== "object" || Array.isArray(envBlock)) {
    diagnostics.push(diagnostic({
      id: "env-not-object",
      severity: "error",
      server: serverName,
      evidence: "env is present but is not a JSON object.",
      suggestion: "Set env to an object of string keys and values.",
    }));
    return;
  }

  for (const [key, value] of Object.entries(envBlock)) {
    if (value === "" || value === null || value === undefined) {
      diagnostics.push(diagnostic({
        id: "missing-env-value",
        severity: "warning",
        server: serverName,
        evidence: `env.${key} is empty.`,
        suggestion: `Set env.${key} or remove it if the server does not need it.`,
      }));
      continue;
    }

    if (typeof value !== "string") {
      diagnostics.push(diagnostic({
        id: "env-value-not-string",
        severity: "warning",
        server: serverName,
        evidence: `env.${key} has type ${typeof value}.`,
        suggestion: "Claude MCP env values should be strings.",
      }));
      continue;
    }

    const percentVars = [...value.matchAll(/%([A-Za-z_][A-Za-z0-9_]*)%/g)].map((match) => match[1]);
    for (const variable of percentVars) {
      const canFix = variable.toUpperCase() === "APPDATA" && Boolean(context.env.APPDATA);
      diagnostics.push(diagnostic({
        id: "unexpanded-percent-env",
        severity: canFix ? "warning" : "error",
        server: serverName,
        evidence: `env.${key} contains %${variable}% and Claude may not expand it.`,
        suggestion: canFix ? `Expand %${variable}% to its current value.` : `Replace %${variable}% with an absolute value.`,
        fixable: canFix,
      }));
    }

    const dollarVars = [...value.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((match) => match[1]);
    for (const variable of dollarVars) {
      diagnostics.push(diagnostic({
        id: "unexpanded-dollar-env",
        severity: "warning",
        server: serverName,
        evidence: `env.${key} contains \${${variable}} and Claude may not expand it.`,
        suggestion: `Replace \${${variable}} with an absolute value.`,
      }));
    }
  }
}

function diagnose({ configResult, logsResult, platform, env }) {
  return [
    ...diagnoseConfig({ configResult, platform, env }),
    ...summarizeLogDiagnostics(logsResult).map((item) => diagnostic(item)),
  ];
}

module.exports = {
  diagnose,
  diagnoseConfig,
};
