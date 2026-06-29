"use strict";

const path = require("node:path");

function getDefaultClaudePaths({ platform, env }) {
  if (platform === "win32") {
    const appData = env.APPDATA || (env.USERPROFILE ? path.join(env.USERPROFILE, "AppData", "Roaming") : "");
    return {
      configPath: path.join(appData, "Claude", "claude_desktop_config.json"),
      logDir: path.join(appData, "Claude", "logs"),
    };
  }

  if (platform === "darwin") {
    const home = env.HOME || "";
    return {
      configPath: path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json"),
      logDir: path.join(home, "Library", "Logs", "Claude"),
    };
  }

  const home = env.HOME || "";
  return {
    configPath: path.join(home, ".config", "Claude", "claude_desktop_config.json"),
    logDir: path.join(home, ".local", "state", "Claude", "logs"),
  };
}

module.exports = {
  getDefaultClaudePaths,
};

