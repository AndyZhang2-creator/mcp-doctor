"use strict";

const fs = require("node:fs");

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function planFixes(config, { platform, env }) {
  const next = cloneJson(config);
  const changes = [];

  if (!next.mcpServers || typeof next.mcpServers !== "object" || Array.isArray(next.mcpServers)) {
    return { changed: false, changes, config: next };
  }

  for (const [serverName, server] of Object.entries(next.mcpServers)) {
    if (!server || typeof server !== "object" || Array.isArray(server)) continue;

    if (
      platform === "win32" &&
      typeof server.command === "string" &&
      server.command.toLowerCase() === "npx" &&
      (server.args === undefined || Array.isArray(server.args))
    ) {
      const oldArgs = server.args === undefined ? [] : server.args;
      server.command = "cmd";
      server.args = ["/c", "npx", ...oldArgs];
      changes.push({
        id: "windows-npx-wrapper",
        server: serverName,
        message: 'Changed command "npx" to command "cmd" with args ["/c", "npx", ...].',
      });
    }

    if (server.env && typeof server.env === "object" && !Array.isArray(server.env) && env.APPDATA) {
      for (const [key, value] of Object.entries(server.env)) {
        if (typeof value !== "string") continue;
        const expanded = value.replace(/%APPDATA%/gi, env.APPDATA);
        if (expanded !== value) {
          server.env[key] = expanded;
          changes.push({
            id: "expand-appdata-env",
            server: serverName,
            message: `Expanded %APPDATA% in env.${key}.`,
          });
        }
      }
    }
  }

  return {
    changed: changes.length > 0,
    changes,
    config: next,
  };
}

function backupPathFor(configPath, now = new Date()) {
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  return `${configPath}.bak-${stamp}`;
}

function writeConfigWithBackup(configPath, config, { fsImpl = fs, now = new Date() } = {}) {
  const backupPath = backupPathFor(configPath, now);
  const tempPath = `${configPath}.tmp-${process.pid}-${now.getTime()}`;
  const payload = `${JSON.stringify(config, null, 2)}\n`;

  JSON.parse(payload);
  fsImpl.copyFileSync(configPath, backupPath);
  try {
    fsImpl.writeFileSync(tempPath, payload, "utf8");
    JSON.parse(fsImpl.readFileSync(tempPath, "utf8"));
    fsImpl.renameSync(tempPath, configPath);
    return {
      backupPath,
      wrote: true,
    };
  } catch (error) {
    try {
      if (fsImpl.existsSync(tempPath)) fsImpl.unlinkSync(tempPath);
    } catch (_) {
      // Keep the original error. Cleanup failure is secondary.
    }
    throw error;
  }
}

module.exports = {
  planFixes,
  writeConfigWithBackup,
  backupPathFor,
};
