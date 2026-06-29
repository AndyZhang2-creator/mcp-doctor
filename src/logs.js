"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { maskText } = require("./mask");

const ERROR_PATTERN = /error|failed|failure|enoent|spawn|exception|invalid|json|cannot|missing|denied/i;

function loadClaudeLogs(logDir, { fsImpl = fs, maxFiles = 8, maxLines = 60 } = {}) {
  if (!logDir || !fsImpl.existsSync(logDir)) {
    return {
      exists: false,
      logDir,
      files: [],
    };
  }

  const files = fsImpl.readdirSync(logDir)
    .filter((name) => /^mcp.*\.log$/i.test(name))
    .map((name) => {
      const filePath = path.join(logDir, name);
      const stat = fsImpl.statSync(filePath);
      const text = fsImpl.readFileSync(filePath, "utf8");
      const lines = text.split(/\r?\n/).filter(Boolean).slice(-maxLines);
      return { name, path: filePath, mtimeMs: stat.mtimeMs, lines };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, maxFiles);

  return {
    exists: true,
    logDir,
    files,
  };
}

function serverFromLogName(name) {
  const match = name.match(/^mcp-server-(.+)\.log$/i);
  return match ? match[1] : "Claude logs";
}

function summarizeLogDiagnostics(logsResult) {
  if (!logsResult.exists || logsResult.files.length === 0) {
    return [];
  }

  const diagnostics = [];
  for (const file of logsResult.files) {
    const matches = file.lines
      .filter((line) => ERROR_PATTERN.test(line))
      .slice(-4);

    for (const line of matches) {
      diagnostics.push({
        id: "claude-log-error",
        severity: "warning",
        server: serverFromLogName(file.name),
        evidence: `${file.name}: ${maskText(line)}`,
        suggestion: "Review this Claude MCP log line. It may explain why the server did not connect.",
      });
    }
  }

  return diagnostics.slice(0, 12);
}

module.exports = {
  loadClaudeLogs,
  summarizeLogDiagnostics,
};
