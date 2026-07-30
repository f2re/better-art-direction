import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { analyzeContent, formatReport, scanPath } from "../skills/better-art-direction/scripts/static-audit.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(TEST_DIR, "fixtures");

test("detects high-confidence technical and anti-template signals", async () => {
  const report = await scanPath(path.join(FIXTURES, "ai-slop.tsx"));
  const ids = new Set(report.findings.map((item) => item.id));

  for (const expected of ["BAD001", "BAD002", "BAD003", "BAD004", "BAD005", "BAD006", "BAD007", "BAD008", "BAD011", "BAD012", "BAD013", "BAD014", "BAD017"]) {
    assert.equal(ids.has(expected), true, `expected ${expected}`);
  }
  assert.ok(report.counts.error >= 2);
  assert.ok(report.counts.warning >= 5);
});

test("keeps a restrained domain interface clear", async () => {
  const report = await scanPath(path.join(FIXTURES, "clean-interface.html"));
  assert.equal(report.counts.error, 0);
  assert.equal(report.counts.warning, 0);
});

test("analyzeContent accepts inline source and returns stable positions", () => {
  const findings = analyzeContent('<button className="focus:outline-none"><SearchIcon /></button>', "Search.tsx");
  assert.deepEqual(new Set(findings.map((item) => item.id)), new Set(["BAD007", "BAD008"]));
  assert.equal(findings.every((item) => item.line === 1), true);
  assert.equal(findings.some((item) => item.column > 1), true);
});

test("report formatters include counts and recommendations", async () => {
  const report = await scanPath(path.join(FIXTURES, "ai-slop.tsx"));
  const markdown = formatReport(report, "markdown");
  const json = JSON.parse(formatReport(report, "json"));
  assert.match(markdown, /Better Art Direction static audit/);
  assert.match(markdown, /Recommendation/);
  assert.equal(json.scannedFiles, 1);
  assert.equal(json.findings.length, report.findings.length);
});
