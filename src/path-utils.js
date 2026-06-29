"use strict";

const fs = require("node:fs");
const path = require("node:path");

function isWindows(platform) {
  return platform === "win32";
}

function hasPathSeparator(command) {
  return /[\\/]/.test(command);
}

function pathEntries(env) {
  return String(env.PATH || env.Path || "").split(path.delimiter).filter(Boolean);
}

function candidateNames(command, platform, env) {
  if (!isWindows(platform) || path.extname(command)) return [command];
  const pathext = String(env.PATHEXT || ".COM;.EXE;.BAT;.CMD;.PS1")
    .split(";")
    .filter(Boolean);
  return [command, ...pathext.map((ext) => `${command}${ext.toLowerCase()}`), ...pathext.map((ext) => `${command}${ext.toUpperCase()}`)];
}

function fileExistsExecutable(filePath, fsImpl) {
  try {
    const stat = fsImpl.statSync(filePath);
    return stat.isFile();
  } catch (_) {
    return false;
  }
}

function commandExists(command, { env = process.env, platform = process.platform, fsImpl = fs } = {}) {
  if (!command || typeof command !== "string") return false;

  if (isWindows(platform) && command.toLowerCase() === "cmd") return true;

  if (path.isAbsolute(command) || hasPathSeparator(command)) {
    return candidateNames(command, platform, env).some((candidate) => fileExistsExecutable(candidate, fsImpl));
  }

  for (const dir of pathEntries(env)) {
    for (const candidate of candidateNames(command, platform, env)) {
      if (fileExistsExecutable(path.join(dir, candidate), fsImpl)) return true;
    }
  }

  return false;
}

module.exports = {
  commandExists,
  hasPathSeparator,
  isWindows,
};

