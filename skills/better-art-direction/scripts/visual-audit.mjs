#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import { collectDomSignals, collectReducedMotion } from "./visual-dom.mjs";

const ORDER = { error: 0, warning: 1, info: 2 };

function usage() {
  return `Better Art Direction visual audit (playwright axe-core)

Usage:
  node visual-audit.mjs --url <base-url> [options]

Options:
  --paths <csv>             Routes to inspect (default: /)
  --widths <csv>            Viewport widths (default: 320,375,414,768,1440)
  --schemes <csv>           light,dark (default: light)
  --height <number>         Viewport height (default: 900)
  --out <directory>         Output directory (default: .art-direction-audit)
  --format <text|json|markdown>  Stdout format (default: text)
  --timeout <ms>            Navigation timeout (default: 30000)
  --executable-path <path>  Chromium executable for playwright-core
  --headed                  Show browser
  --no-axe                  Skip axe-core
  --strict                  Fail on warnings as well as errors
  --no-fail                 Always exit 0
  --help                    Show help

Install in the target project:
  npm install --save-dev playwright axe-core
  npx playwright install chromium
`;
}

function csv(value) { return String(value).split(",").map((item) => item.trim()).filter(Boolean); }
function parseArgs(argv) {
  const options = { url: null, paths: ["/"], widths: [320, 375, 414, 768, 1440], schemes: ["light"], height: 900, out: ".art-direction-audit", format: "text", timeout: 30000, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || null, headed: false, axe: true, strict: false, noFail: false };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--help" || value === "-h") options.help = true;
    else if (value === "--url") options.url = argv[++i];
    else if (value === "--paths") options.paths = csv(argv[++i]);
    else if (value === "--widths") options.widths = csv(argv[++i]).map(Number);
    else if (value === "--schemes") options.schemes = csv(argv[++i]);
    else if (value === "--height") options.height = Number(argv[++i]);
    else if (value === "--out") options.out = argv[++i];
    else if (value === "--format") options.format = argv[++i];
    else if (value === "--timeout") options.timeout = Number(argv[++i]);
    else if (value === "--executable-path") options.executablePath = argv[++i];
    else if (value === "--headed") options.headed = true;
    else if (value === "--no-axe") options.axe = false;
    else if (value === "--strict") options.strict = true;
    else if (value === "--no-fail") options.noFail = true;
    else throw new Error(`Unknown option: ${value}`);
  }
  if (!options.help && !options.url) throw new Error("--url is required");
  if (!options.widths.every((width) => Number.isInteger(width) && width >= 240)) throw new Error("--widths must contain integers >= 240");
  if (!options.schemes.every((scheme) => ["light", "dark"].includes(scheme))) throw new Error("--schemes supports light,dark");
  if (!new Set(["text", "json", "markdown"]).has(options.format)) throw new Error("Unsupported --format");
  return options;
}

async function resolveModule(name) {
  const require = createRequire(path.join(process.cwd(), "package.json"));
  try { return await import(pathToFileURL(require.resolve(name)).href); }
  catch { return null; }
}

async function loadChromium() {
  for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
    const module = await resolveModule(name);
    const chromium = module?.chromium || module?.default?.chromium;
    if (chromium) return { chromium, source: name };
  }
  throw new Error("Playwright not found. Install playwright (or playwright-core with --executable-path) in the target project.");
}

async function loadAxeSource(enabled) {
  if (!enabled) return null;
  const require = createRequire(path.join(process.cwd(), "package.json"));
  try { return await fs.readFile(require.resolve("axe-core/axe.min.js"), "utf8"); }
  catch { return null; }
}

function safeSlug(route, width, scheme) {
  const routeSlug = route === "/" ? "home" : route.replace(/^\/+|\/+$/g, "").replace(/[^a-z0-9а-яё_-]+/giu, "-") || "page";
  return `${routeSlug}-${width}-${scheme}`;
}

function add(findings, variant, id, severity, title, message, evidence = null) {
  findings.push({ id, severity, title, message, evidence, ...variant });
}

function signalsToFindings(signals, variant, findings) {
  const hasDocumentOverflow = (signals.overflow?.overflowPixels || 0) > 1;
  if (hasDocumentOverflow) add(findings, variant, "BAV001", "error", "Horizontal overflow", `Document is ${signals.overflow.overflowPixels}px wider than the viewport.`, { ...signals.overflow, elements: signals.overflowElements });
  else if (signals.overflowElements?.length) add(findings, variant, "BAV002", "warning", "Elements extend outside the viewport", `${signals.overflowElements.length} visible elements cross viewport bounds.`, signals.overflowElements);
  if (signals.clippedText?.length) add(findings, variant, "BAV003", "warning", "Potentially clipped text", `${signals.clippedText.length} visible text elements are clipped.`, signals.clippedText);
  if (signals.unnamedControls?.length) add(findings, variant, "BAV004", "error", "Unnamed interactive controls", `${signals.unnamedControls.length} controls have no evident accessible name.`, signals.unnamedControls);
  if (signals.formControlsWithoutLabels?.length) add(findings, variant, "BAV005", "error", "Form controls without labels", `${signals.formControlsWithoutLabels.length} controls have no associated label.`, signals.formControlsWithoutLabels);
  if (signals.imagesWithoutAlt?.length) add(findings, variant, "BAV006", "error", "Images without alt", `${signals.imagesWithoutAlt.length} images omit the alt attribute.`, signals.imagesWithoutAlt);
  if (signals.duplicateIds?.length) add(findings, variant, "BAV007", "warning", "Duplicate IDs", `Duplicate IDs: ${signals.duplicateIds.join(", ")}.`, signals.duplicateIds);
  if (signals.smallTargets?.length) add(findings, variant, "BAV008", "warning", "Small interaction targets", `${signals.smallTargets.length} targets are smaller than 24×24 CSS pixels.`, signals.smallTargets);
  if (signals.fixedObstructions?.length) add(findings, variant, "BAV009", "warning", "Large fixed or sticky layer", `${signals.fixedObstructions.length} layers cover more than 30% of the viewport.`, signals.fixedObstructions);
  if (!signals.lang) add(findings, variant, "BAV013", "warning", "Document language is missing", "The html element has no lang attribute.");
  if (!signals.mainCount) add(findings, variant, "BAV014", "warning", "Main landmark is missing", "No main element was found.");
}

async function runVariant(browser, axeSource, options, route, width, scheme, screenshotDir) {
  const variant = { route, width, scheme, url: new URL(route, options.url).href };
  const findings = [];
  const context = await browser.newContext({ viewport: { width, height: options.height }, colorScheme: scheme, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const runtime = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on("console", (message) => { if (message.type?.() === "error") runtime.consoleErrors.push(message.text?.() || String(message)); });
  page.on("pageerror", (error) => runtime.pageErrors.push(error.message || String(error)));
  page.on("requestfailed", (request) => runtime.failedRequests.push({ url: request.url?.(), failure: request.failure?.()?.errorText || "failed" }));
  page.on("response", (response) => { if (response.status?.() >= 400) runtime.badResponses.push({ url: response.url?.(), status: response.status() }); });
  try {
    const response = await page.goto(variant.url, { waitUntil: "domcontentloaded", timeout: options.timeout });
    const status = response?.status?.();
    if (status >= 400) add(findings, variant, "BAV012", "error", "Page returned an HTTP error", `Navigation returned HTTP ${status}.`);
    try { await page.waitForLoadState("networkidle", { timeout: Math.min(options.timeout, 5000) }); } catch {}
    const signals = await collectDomSignals(page);
    signalsToFindings(signals, variant, findings);
    if (runtime.consoleErrors.length || runtime.pageErrors.length) add(findings, variant, "BAV010", "error", "Runtime console errors", `${runtime.consoleErrors.length + runtime.pageErrors.length} console or page errors occurred.`, runtime);
    if (runtime.failedRequests.length) add(findings, variant, "BAV011", "warning", "Failed network requests", `${runtime.failedRequests.length} requests failed.`, runtime.failedRequests.slice(0, 20));
    if (runtime.badResponses.length) add(findings, variant, "BAV012", "error", "HTTP error responses", `${runtime.badResponses.length} responses returned 4xx/5xx.`, runtime.badResponses.slice(0, 20));
    if (axeSource && page.addScriptTag) {
      await page.addScriptTag({ content: axeSource });
      const axe = await page.evaluate(async () => globalThis.axe.run(document, { resultTypes: ["violations"] }));
      for (const violation of axe.violations || []) add(findings, variant, "BAV100", ["critical", "serious"].includes(violation.impact) ? "error" : "warning", `axe: ${violation.help}`, violation.description, { impact: violation.impact, nodes: violation.nodes?.slice(0, 10).map((node) => node.target) });
    }
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: scheme });
    await page.reload({ waitUntil: "domcontentloaded", timeout: options.timeout });
    const animations = await collectReducedMotion(page);
    if (animations?.length) add(findings, variant, "BAV015", "warning", "Long-running motion remains under reduced motion", `${animations.length} animations remain active for more than one second.`, animations);
    await page.screenshot({ path: path.join(screenshotDir, `${safeSlug(route, width, scheme)}.png`), fullPage: true, animations: "disabled" });
  } catch (error) {
    add(findings, variant, "BAV000", "error", "Rendered audit failed", error.message || String(error));
  } finally { await context.close(); }
  return findings;
}

function counts(findings) { return Object.fromEntries(["error", "warning", "info"].map((severity) => [severity, findings.filter((item) => item.severity === severity).length])); }
function markdown(report) {
  const lines = ["# Better Art Direction visual audit", "", `- Variants inspected: ${report.variantsInspected}`, `- Errors: ${report.counts.error}`, `- Warnings: ${report.counts.warning}`, `- Informational: ${report.counts.info}`, `- Playwright source: ${report.playwrightSource}`, `- axe-core: ${report.axeEnabled ? "enabled" : "not used"}`, ""];
  if (!report.findings.length) return `${lines.join("\n")}No visual findings.\n`;
  lines.push("| Severity | Rule | Route | Viewport | Finding |", "| --- | --- | --- | --- | --- |");
  for (const item of report.findings) lines.push(`| ${item.severity.toUpperCase()} | ${item.id} | \`${item.route}\` | ${item.width}px / ${item.scheme} | ${item.title} — ${item.message.replaceAll("|", "\\|")} |`);
  return `${lines.join("\n")}\n`;
}
function format(report, type) {
  if (type === "json") return `${JSON.stringify(report, null, 2)}\n`;
  if (type === "markdown") return markdown(report);
  const lines = ["Better Art Direction visual audit", `Inspected ${report.variantsInspected} variants; ${report.counts.error} errors, ${report.counts.warning} warnings.`];
  for (const item of report.findings) lines.push("", `${item.severity.toUpperCase()} ${item.id} ${item.route} ${item.width}px/${item.scheme}`, `${item.title}: ${item.message}`);
  if (!report.findings.length) lines.push("No visual findings.");
  return `${lines.join("\n")}\n`;
}

async function main() {
  let options;
  try { options = parseArgs(process.argv.slice(2)); }
  catch (error) { console.error(error.message); console.error(usage()); process.exitCode = 2; return; }
  if (options.help) { console.log(usage()); return; }
  let browser;
  try {
    const { chromium, source } = await loadChromium();
    const axeSource = await loadAxeSource(options.axe);
    const out = path.resolve(options.out);
    const screenshots = path.join(out, "screenshots");
    await fs.mkdir(screenshots, { recursive: true });
    browser = await chromium.launch({ headless: !options.headed, ...(options.executablePath ? { executablePath: options.executablePath } : {}) });
    const findings = [];
    for (const route of options.paths) for (const width of options.widths) for (const scheme of options.schemes) findings.push(...await runVariant(browser, axeSource, options, route, width, scheme, screenshots));
    findings.sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.route.localeCompare(b.route) || a.width - b.width || a.id.localeCompare(b.id));
    const report = { baseUrl: options.url, routes: options.paths, widths: options.widths, schemes: options.schemes, variantsInspected: options.paths.length * options.widths.length * options.schemes.length, playwrightSource: source, axeEnabled: Boolean(axeSource), counts: counts(findings), findings };
    await fs.writeFile(path.join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
    await fs.writeFile(path.join(out, "report.md"), markdown(report));
    process.stdout.write(format(report, options.format));
    if (!options.noFail && (report.counts.error > 0 || (options.strict && report.counts.warning > 0))) process.exitCode = 1;
  } catch (error) { console.error(`Visual audit failed: ${error.message}`); process.exitCode = 2; }
  finally { await browser?.close?.(); }
}

const direct = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (direct) await main();
