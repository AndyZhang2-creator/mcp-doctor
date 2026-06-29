"use strict";

const fs = require("node:fs");

function readClaudeConfig(configPath, fsImpl = fs) {
  if (!configPath) {
    return {
      ok: false,
      exists: false,
      path: configPath,
      error: "No config path was provided.",
    };
  }

  if (!fsImpl.existsSync(configPath)) {
    return {
      ok: false,
      exists: false,
      path: configPath,
      error: "Claude Desktop config was not found.",
    };
  }

  let raw;
  try {
    raw = fsImpl.readFileSync(configPath, "utf8");
  } catch (error) {
    return {
      ok: false,
      exists: true,
      path: configPath,
      error: `Unable to read config: ${error.message}`,
    };
  }

  try {
    return {
      ok: true,
      exists: true,
      path: configPath,
      raw,
      config: JSON.parse(raw),
    };
  } catch (error) {
    return {
      ok: false,
      exists: true,
      path: configPath,
      raw,
      error: `Invalid JSON: ${error.message}`,
    };
  }
}

module.exports = {
  readClaudeConfig,
};

