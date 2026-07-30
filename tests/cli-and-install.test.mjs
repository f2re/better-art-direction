import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATIC = path.join(ROOT, "skills/better-art-direction/scripts/static-audit.mjs");
const VISUAL = path.join(ROOT, "skills/better-art-direction/scripts/visual-audit.mjs");
const INSTALLER = path.join(ROOT, "scripts/install-skill.sh");

test("static CLI returns a failing status for errors and supports no-fail", () => {
  const fixture = path.join(ROOT, "tests/fixtures/ai-slop.tsx");
  const strict = spawnSync(process.execPath, [STATIC, fixture], { encoding: "utf8" });
  assert.equal(strict.status, 1);
  assert.match(strict.stdout, /BAD007/);

  const noFail = spawnSync(process.execPath, [STATIC, fixture, "--no-fail"], { encoding: "utf8" });
  assert.equal(noFail.status, 0);
});

test("visual CLI exposes deterministic help without Playwright", () => {
  const result = spawnSync(process.execPath, [VISUAL, "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /--url/);
  assert.match(result.stdout, /playwright axe-core/);
});

test("bash installer copies the complete skill into user scope", () => {
  if (process.platform === "win32") return;
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "better-art-direction-home-"));
  const result = spawnSync("bash", [INSTALLER, "--user", "--copy", "--force"], {
    encoding: "utf8",
    env: { ...process.env, HOME: home },
  });
  assert.equal(result.status, 0, result.stderr);
  const installed = path.join(home, ".agents/skills/better-art-direction");
  assert.equal(fs.existsSync(path.join(installed, "SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(installed, "scripts/visual-audit.mjs")), true);
  assert.match(result.stdout, /\$better-art-direction/);
});

test("visual CLI completes a multi-route audit through the Playwright contract", () => {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "better-art-direction-playwright-"));
  const moduleDir = path.join(workspace, "node_modules/playwright-core");
  fs.mkdirSync(moduleDir, { recursive: true });
  fs.writeFileSync(path.join(workspace, "package.json"), '{"name":"fixture","private":true}\n');
  fs.writeFileSync(path.join(moduleDir, "package.json"), '{"name":"playwright-core","version":"0.0.0","main":"index.js"}\n');
  fs.writeFileSync(path.join(moduleDir, "index.js"), `
const fs = require("node:fs");
const path = require("node:path");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n8sAAAAASUVORK5CYII=", "base64");
function signals() {
  return {
    title: "Fixture",
    lang: "ru",
    h1Count: 1,
    mainCount: 1,
    overflow: { viewportWidth: 320, documentWidth: 360, overflowPixels: 40 },
    overflowElements: [{ selector: ".wide", tag: "div", left: 0, right: 360, width: 360, text: "wide" }],
    clippedText: [],
    smallTargets: [],
    unnamedControls: [],
    formControlsWithoutLabels: [],
    imagesWithoutAlt: [],
    duplicateIds: [],
    fixedObstructions: []
  };
}
const page = {
  on() {},
  async goto() { return { status() { return 200; } }; },
  async waitForLoadState() {},
  async evaluate(fn) {
    const source = String(fn);
    if (source.includes("const isVisible")) return signals();
    if (source.includes("document.getAnimations")) return [];
    return undefined;
  },
  async emulateMedia() {},
  async reload() {},
  async screenshot(options) { fs.mkdirSync(path.dirname(options.path), { recursive: true }); fs.writeFileSync(options.path, png); }
};
const context = { async newPage() { return page; }, async close() {} };
const browser = { async newContext() { return context; }, async close() {} };
exports.chromium = { async launch() { return browser; } };
`);

  const outputDir = path.join(workspace, "audit");
  const result = spawnSync(process.execPath, [
    VISUAL,
    "--url", "http://127.0.0.1:3000",
    "--paths", "/,/settings",
    "--widths", "320",
    "--out", outputDir,
    "--no-axe",
    "--no-fail",
    "--format", "json",
  ], { cwd: workspace, encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.variantsInspected, 2);
  assert.equal(report.counts.error, 2);
  assert.equal(report.findings.every((item) => item.id === "BAV001"), true);
  assert.equal(fs.existsSync(path.join(outputDir, "report.json")), true);
  assert.equal(fs.readdirSync(path.join(outputDir, "screenshots")).length, 2);
});
