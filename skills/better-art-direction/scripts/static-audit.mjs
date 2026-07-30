#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { analyzeContent, SEVERITY } from "./static-rules.mjs";

const EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".sass", ".less", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".vue", ".svelte", ".astro", ".mdx"]);
const EXCLUDED = new Set([".git", ".next", ".nuxt", ".output", ".turbo", ".cache", "node_modules", "dist", "build", "coverage", "vendor"]);

function usage() {
  return `Better Art Direction static audit

Usage:
  node static-audit.mjs [target] [options]

Options:
  --format <text|json|markdown>  Output format (default: text)
  --out <file>                   Write the report to a file
  --strict                       Exit 1 when warnings are present
  --no-fail                      Always exit 0
  --max-files <number>           Maximum source files (default: 5000)
  --help                         Show this help
`;
}

function parseArgs(argv) {
  const options = { target: ".", format: "text", out: null, strict: false, noFail: false, maxFiles: 5000 };
  let targetSet = false;
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--help" || value === "-h") options.help = true;
    else if (value === "--strict") options.strict = true;
    else if (value === "--no-fail") options.noFail = true;
    else if (value === "--format") options.format = argv[++i];
    else if (value === "--out") options.out = argv[++i];
    else if (value === "--max-files") options.maxFiles = Number.parseInt(argv[++i], 10);
    else if (value.startsWith("-")) throw new Error(`Unknown option: ${value}`);
    else if (!targetSet) { options.target = value; targetSet = true; }
    else throw new Error(`Unexpected argument: ${value}`);
  }
  if (!new Set(["text", "json", "markdown"]).has(options.format)) throw new Error(`Unsupported format: ${options.format}`);
  if (!Number.isInteger(options.maxFiles) || options.maxFiles < 1) throw new Error("--max-files must be a positive integer");
  return options;
}

async function collectFiles(target, maxFiles) {
  const absolute = path.resolve(target);
  const stat = await fs.stat(absolute);
  if (stat.isFile()) return [absolute];
  if (!stat.isDirectory()) throw new Error(`Target is not a file or directory: ${target}`);
  const files = [];
  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (files.length >= maxFiles) return;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED.has(entry.name)) await walk(full);
      } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
    }
  }
  await walk(absolute);
  return files;
}

export async function scanPath(target, { maxFiles = 5000 } = {}) {
  const root = path.resolve(target);
  const files = await collectFiles(root, maxFiles);
  const findings = [];
  for (const file of files) {
    const display = path.relative(process.cwd(), file).replaceAll("\\", "/") || path.basename(file);
    try {
      const text = await fs.readFile(file, "utf8");
      findings.push(...analyzeContent(text, file).map((item) => ({ ...item, file: display })));
    } catch (error) {
      findings.push({ id: "BAD000", severity: "error", title: "Source file could not be read", file: display, line: 1, column: 1, message: error.message, suggestion: "Check permissions and encoding.", evidence: "" });
    }
  }
  findings.sort((a, b) => SEVERITY[a.severity] - SEVERITY[b.severity] || a.file.localeCompare(b.file) || a.line - b.line || a.id.localeCompare(b.id));
  const counts = Object.fromEntries(["error", "warning", "info"].map((severity) => [severity, findings.filter((item) => item.severity === severity).length]));
  return { target: root, scannedFiles: files.length, filesWithFindings: new Set(findings.map((item) => item.file)).size, counts, findings };
}

function escapeCell(value) { return String(value).replaceAll("|", "\\|").replaceAll("\n", " "); }

export function formatReport(report, format = "text") {
  if (format === "json") return `${JSON.stringify(report, null, 2)}\n`;
  if (format === "markdown") {
    const lines = ["# Better Art Direction static audit", "", `- Scanned files: ${report.scannedFiles}`, `- Files with findings: ${report.filesWithFindings}`, `- Errors: ${report.counts.error}`, `- Warnings: ${report.counts.warning}`, `- Informational: ${report.counts.info}`, ""];
    if (!report.findings.length) return `${lines.join("\n")}No static findings.\n`;
    lines.push("| Severity | Rule | Location | Finding | Evidence | Recommendation |", "| --- | --- | --- | --- | --- | --- |");
    for (const item of report.findings) lines.push(`| ${item.severity.toUpperCase()} | ${item.id} | \`${escapeCell(item.file)}:${item.line}:${item.column}\` | ${escapeCell(item.title)} — ${escapeCell(item.message)} | \`${escapeCell(item.evidence)}\` | ${escapeCell(item.suggestion)} |`);
    lines.push("", "Heuristic findings require product-specific judgment; they are not blanket style prohibitions.", "");
    return `${lines.join("\n")}\n`;
  }
  const lines = ["Better Art Direction static audit", `Scanned ${report.scannedFiles} files; ${report.counts.error} errors, ${report.counts.warning} warnings, ${report.counts.info} informational findings.`];
  for (const item of report.findings) lines.push("", `${item.severity.toUpperCase()} ${item.id} ${item.file}:${item.line}:${item.column}`, `${item.title}: ${item.message}`, `Evidence: ${item.evidence}`, `Recommendation: ${item.suggestion}`);
  if (!report.findings.length) lines.push("No static findings.");
  return `${lines.join("\n")}\n`;
}

async function main() {
  let options;
  try { options = parseArgs(process.argv.slice(2)); }
  catch (error) { console.error(error.message); console.error(usage()); process.exitCode = 2; return; }
  if (options.help) { console.log(usage()); return; }
  try {
    const report = await scanPath(options.target, options);
    const output = formatReport(report, options.format);
    if (options.out) {
      const destination = path.resolve(options.out);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, output, "utf8");
      console.log(`Wrote ${options.format} report to ${destination}`);
    } else process.stdout.write(output);
    if (!options.noFail && (report.counts.error > 0 || (options.strict && report.counts.warning > 0))) process.exitCode = 1;
  } catch (error) { console.error(`Audit failed: ${error.message}`); process.exitCode = 2; }
}

export { analyzeContent } from "./static-rules.mjs";
const direct = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (direct) await main();
