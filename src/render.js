"use strict";

const { maskObject } = require("./mask");

const SEVERITY_ORDER = {
  error: 0,
  warning: 1,
  info: 2,
};

function sortDiagnostics(diagnostics) {
  return [...diagnostics].sort((a, b) => {
    const severity = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (severity !== 0) return severity;
    return String(a.server).localeCompare(String(b.server));
  });
}

function renderDiagnostic(item, index) {
  return [
    `${index + 1}. [${item.severity.toUpperCase()}] ${item.id}`,
    `   Server: ${item.server}`,
    `   Evidence: ${item.evidence}`,
    `   Suggested fix: ${item.suggestion}`,
    `   Fixable by MCP Doctor: ${item.fixable ? "yes" : "no"}`,
  ].join("\n");
}

function renderFixPlan({ fixPlan, fixRequested, yes, dryRun, writeResult }) {
  if (!fixRequested) {
    return [
      "",
      "Fix mode:",
      "  Not requested. Run with --fix to preview safe fixes.",
    ].join("\n");
  }

  if (!fixPlan) {
    return [
      "",
      "Fix mode:",
      "  No fix plan was created because the config could not be parsed.",
    ].join("\n");
  }

  if (!fixPlan.changed) {
    return [
      "",
      "Fix mode:",
      "  No safe V1 fixes were found.",
    ].join("\n");
  }

  const lines = [
    "",
    "Fix mode:",
    `  Dry-run: ${dryRun ? "yes" : "no"}`,
    `  Write allowed: ${yes && dryRun === false ? "yes" : "no"}`,
    "  Planned changes:",
  ];

  for (const change of fixPlan.changes) {
    lines.push(`  - ${change.server}: ${change.message}`);
  }

  if (!yes) {
    lines.push("  Nothing written. Add --yes to allow writes.");
  } else if (dryRun !== false) {
    lines.push("  Nothing written. Fix mode defaults to dry-run. Add --dry-run=false to write.");
  } else if (writeResult && writeResult.wrote) {
    lines.push(`  Wrote config. Backup: ${writeResult.backupPath}`);
  }

  return lines.join("\n");
}

function renderReport({
  configPath,
  logDir,
  configResult,
  logsResult,
  diagnostics,
  fixPlan,
  writeResult,
  fixRequested,
  yes,
  dryRun,
  platform,
}) {
  const sorted = sortDiagnostics(diagnostics);
  const errors = sorted.filter((item) => item.severity === "error").length;
  const warnings = sorted.filter((item) => item.severity === "warning").length;

  const lines = [
    "MCP Doctor",
    "==========",
    "",
    `Target: Claude Desktop (${platform})`,
    `Config: ${configPath}`,
    `Logs: ${logDir}`,
    "",
    "Config status:",
    `  Exists: ${configResult.exists ? "yes" : "no"}`,
    `  Parsed: ${configResult.ok ? "yes" : "no"}`,
  ];

  if (configResult.ok) {
    const serverNames = Object.keys(configResult.config.mcpServers || {});
    lines.push(`  Servers: ${serverNames.length ? serverNames.join(", ") : "none"}`);
  } else if (configResult.error) {
    lines.push(`  Error: ${configResult.error}`);
  }

  lines.push("");
  lines.push("Log status:");
  lines.push(`  Directory exists: ${logsResult.exists ? "yes" : "no"}`);
  lines.push(`  MCP log files read: ${logsResult.files.length}`);

  lines.push("");
  lines.push(`Diagnostics: ${errors} error(s), ${warnings} warning(s)`);
  if (sorted.length === 0) {
    lines.push("No obvious Claude Desktop MCP setup problems found.");
  } else {
    lines.push("");
    sorted.forEach((item, index) => {
      lines.push(renderDiagnostic(item, index));
      lines.push("");
    });
  }

  lines.push(renderFixPlan({ fixPlan, fixRequested, yes, dryRun, writeResult }));

  if (fixPlan && fixPlan.changed) {
    lines.push("");
    lines.push("Masked preview of fixed config:");
    lines.push(JSON.stringify(maskObject(fixPlan.config), null, 2));
  }

  lines.push("");
  lines.push("Next step:");
  if (errors > 0) {
    lines.push("  Fix the error diagnostics, then fully quit and reopen Claude Desktop.");
  } else if (warnings > 0) {
    lines.push("  Review warnings. If you apply fixes, fully quit and reopen Claude Desktop.");
  } else {
    lines.push("  If Claude still does not show tools, inspect Claude's MCP logs after a full restart.");
  }

  return `${lines.join("\n")}\n`;
}

module.exports = {
  renderReport,
  sortDiagnostics,
};

