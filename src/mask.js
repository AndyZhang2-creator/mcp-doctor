"use strict";

const SECRET_KEY_PATTERN = /(api[_-]?key|token|secret|password|authorization|bearer|private[_-]?key|(^|[_-])pat($|[_-]))/i;

function isSecretKey(key) {
  return SECRET_KEY_PATTERN.test(String(key || ""));
}

function maskText(text) {
  if (!text) return text;
  let masked = String(text);

  masked = masked.replace(/(Authorization\s*:\s*Bearer\s+)([A-Za-z0-9._~+/=-]+)/gi, "$1***MASKED***");
  masked = masked.replace(/(Bearer\s+)(sk-[A-Za-z0-9._-]+)/gi, "$1***MASKED***");
  masked = masked.replace(/\b(sk-[A-Za-z0-9_-]{8,})\b/g, "***MASKED***");
  masked = masked.replace(/\b(gh[pousr]_[A-Za-z0-9_]{8,})\b/g, "***MASKED***");
  masked = masked.replace(/\b([A-Za-z0-9_-]{40,})\b/g, "***MASKED***");
  masked = masked.replace(/((?:api[_-]?key|token|secret|password|pat)\s*[:=]\s*["']?)([^"',\s]+)/gi, "$1***MASKED***");

  return masked;
}

function maskObject(value, key = "") {
  if (isSecretKey(key)) {
    if (value === undefined || value === null || value === "") return value;
    return "***MASKED***";
  }

  if (typeof value === "string") return maskText(value);
  if (Array.isArray(value)) return value.map((item) => maskObject(item));
  if (value && typeof value === "object") {
    const out = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      out[childKey] = maskObject(childValue, childKey);
    }
    return out;
  }

  return value;
}

module.exports = {
  maskText,
  maskObject,
  isSecretKey,
};
