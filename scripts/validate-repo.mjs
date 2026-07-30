#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const SKILL_ROOT = path.join(ROOT, "skills", "better-art-direction");
const errors = [];
const warnings = [];

const REQUIRED_FILES = [
  ".codex-plugin/plugin.json",
  ".agents/plugins/marketplace.json",
  "README.md",
  "AGENTS.md",
  "LICENSE",
  "package.json",
  "skills/better-art-direction/SKILL.md",
  "skills/better-art-direction/agents/openai.yaml",
  "skills/better-art-direction/LICENSE.txt",
  "skills/better-art-direction/scripts/static-audit.mjs",
  "skills/better-art-direction/scripts/visual-audit.mjs",
  "skills/better-art-direction/assets/ART_DIRECTION.template.md",
  "quality/trigger-evals.jsonl",
  "quality/scenario-evals.md",
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function read(relativePath) {
  return fs.readFile(path.join(ROOT, relativePath), "utf8");
}

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function parseFrontmatter(markdown, relativePath) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) {
    fail(`${relativePath}: отсутствует YAML-frontmatter`);
    return null;
  }
  const fields = new Map();
  for (const line of match[1].split("\n")) {
    if (!line.trim() || /^\s/.test(line)) continue;
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) {
      fail(`${relativePath}: неподдерживаемая строка frontmatter: ${line}`);
      continue;
    }
    fields.set(field[1], field[2].trim());
  }
  return fields;
}

function localMarkdownLinks(markdown) {
  const links = [];
  const regex = /!?\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const raw = match[1].trim().replace(/^<|>$/g, "");
    if (!raw || raw.startsWith("#") || /^[a-z]+:/i.test(raw)) continue;
    links.push(raw.split("#")[0].split("?")[0]);
  }
  return links;
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...await walk(full));
    else if (entry.isFile()) results.push(full);
  }
  return results;
}

async function validateRequiredFiles() {
  for (const relativePath of REQUIRED_FILES) {
    if (!await exists(path.join(ROOT, relativePath))) fail(`Нет обязательного файла: ${relativePath}`);
  }
}

async function validateSkill() {
  const relativePath = "skills/better-art-direction/SKILL.md";
  const markdown = await read(relativePath);
  const fields = parseFrontmatter(markdown, relativePath);
  if (fields) {
    const names = [...fields.keys()];
    const unsupported = names.filter((name) => !new Set(["name", "description"]).has(name));
    if (unsupported.length) fail(`${relativePath}: допустимы только name и description; найдены ${unsupported.join(", ")}`);
    if (fields.get("name") !== "better-art-direction") fail(`${relativePath}: name должен быть better-art-direction`);
    if (!fields.get("description") || fields.get("description").length < 80) fail(`${relativePath}: description должен подробно задавать область срабатывания`);
  }
  const lineCount = markdown.split("\n").length;
  if (lineCount > 500) fail(`${relativePath}: ${lineCount} строк; основной навык должен быть короче 500 строк`);
  if (!markdown.includes("references/workflow.md")) fail(`${relativePath}: нет прямой ссылки на workflow.md`);
  if (!markdown.includes("scripts/static-audit.mjs") || !markdown.includes("scripts/visual-audit.mjs")) {
    fail(`${relativePath}: не описаны оба встроенных помощника`);
  }
}

async function validateOpenAiYaml() {
  const relativePath = "skills/better-art-direction/agents/openai.yaml";
  const yaml = await read(relativePath);
  if (!/display_name:\s*"[^"]+"/.test(yaml)) fail(`${relativePath}: display_name должен быть строкой в кавычках`);
  if (!/short_description:\s*"[^"]+"/.test(yaml)) fail(`${relativePath}: short_description должен быть строкой в кавычках`);
  const prompt = yaml.match(/default_prompt:\s*"([^"]+)"/);
  if (!prompt) fail(`${relativePath}: отсутствует default_prompt в кавычках`);
  else if (!prompt[1].includes("$better-art-direction")) fail(`${relativePath}: default_prompt должен явно упоминать $better-art-direction`);
  if (!/allow_implicit_invocation:\s*(?:true|false)/.test(yaml)) fail(`${relativePath}: отсутствует policy.allow_implicit_invocation`);
}

async function validateJsonFiles() {
  for (const relativePath of [".codex-plugin/plugin.json", ".agents/plugins/marketplace.json", "package.json"]) {
    try {
      JSON.parse(await read(relativePath));
    } catch (error) {
      fail(`${relativePath}: некорректный JSON: ${error.message}`);
    }
  }

  try {
    const plugin = JSON.parse(await read(".codex-plugin/plugin.json"));
    if (plugin.name !== "better-art-direction") fail("plugin.json: неверное имя плагина");
    if (plugin.skills !== "./skills/") fail("plugin.json: skills должен указывать на ./skills/");
    if (!/^\d+\.\d+\.\d+$/.test(plugin.version ?? "")) fail("plugin.json: версия должна быть SemVer");
  } catch {}

  try {
    const marketplace = JSON.parse(await read(".agents/plugins/marketplace.json"));
    const entry = marketplace.plugins?.find((item) => item.name === "better-art-direction");
    if (!entry) fail("marketplace.json: нет записи better-art-direction");
    else {
      if (entry.source?.source !== "local" || entry.source?.path !== "./") fail("marketplace.json: локальная запись должна указывать на корень репозитория ./");
      if (!entry.policy?.installation || !entry.policy?.authentication || !entry.category) fail("marketplace.json: не заполнены обязательные policy/category поля");
    }
  } catch {}
}

async function validateLinks() {
  const files = (await walk(ROOT)).filter((file) => file.endsWith(".md") && !file.includes(`${path.sep}node_modules${path.sep}`));
  for (const file of files) {
    const markdown = await fs.readFile(file, "utf8");
    for (const link of localMarkdownLinks(markdown)) {
      const target = path.resolve(path.dirname(file), decodeURIComponent(link));
      if (!target.startsWith(ROOT)) {
        fail(`${path.relative(ROOT, file)}: относительная ссылка выходит за пределы репозитория: ${link}`);
      } else if (!await exists(target)) {
        fail(`${path.relative(ROOT, file)}: битая локальная ссылка: ${link}`);
      }
    }
  }
}

async function validateReferenceDepth() {
  const skillMarkdown = await fs.readFile(path.join(SKILL_ROOT, "SKILL.md"), "utf8");
  const linked = new Set(localMarkdownLinks(skillMarkdown).filter((link) => link.startsWith("references/") || link.startsWith("assets/")));
  const resources = (await walk(SKILL_ROOT))
    .filter((file) => /\.(?:md)$/i.test(file) && path.basename(file) !== "SKILL.md")
    .map((file) => path.relative(SKILL_ROOT, file).replaceAll("\\", "/"));
  for (const resource of resources) {
    if (!linked.has(resource) && !resource.endsWith("LICENSE.txt")) {
      warn(`Ресурс не связан напрямую из SKILL.md: ${resource}`);
    }
  }
}

async function validateScripts() {
  const files = (await walk(ROOT)).filter((file) => file.endsWith(".mjs"));
  for (const file of files) {
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (result.status !== 0) fail(`${path.relative(ROOT, file)}: синтаксическая ошибка: ${result.stderr.trim()}`);
  }
}

async function validateEvals() {
  const relativePath = "quality/trigger-evals.jsonl";
  const content = await read(relativePath);
  const rows = content.split("\n").filter(Boolean);
  if (rows.length < 8) fail(`${relativePath}: нужно не менее 8 сценариев срабатывания`);
  for (let index = 0; index < rows.length; index += 1) {
    try {
      const item = JSON.parse(rows[index]);
      if (typeof item.prompt !== "string" || typeof item.should_trigger !== "boolean") {
        fail(`${relativePath}:${index + 1}: нужны prompt и should_trigger`);
      }
    } catch (error) {
      fail(`${relativePath}:${index + 1}: некорректный JSON: ${error.message}`);
    }
  }
}

async function validateReadme() {
  const readme = await read("README.md");
  const requiredSnippets = [
    "codex plugin marketplace add f2re/better-art-direction --ref main",
    "$HOME/.agents/skills",
    ".agents/skills",
    "$better-art-direction",
    "install-skill.sh",
    "install-skill.ps1",
    "static-audit.mjs",
    "visual-audit.mjs",
  ];
  for (const snippet of requiredSnippets) {
    if (!readme.includes(snippet)) fail(`README.md: отсутствует обязательный фрагмент: ${snippet}`);
  }
}

await validateRequiredFiles();
if (!errors.length) {
  await Promise.all([
    validateSkill(),
    validateOpenAiYaml(),
    validateJsonFiles(),
    validateLinks(),
    validateReferenceDepth(),
    validateScripts(),
    validateEvals(),
    validateReadme(),
  ]);
}

for (const message of warnings) console.warn(`WARN: ${message}`);
if (errors.length) {
  for (const message of errors) console.error(`ERROR: ${message}`);
  console.error(`\nПроверка не пройдена: ${errors.length} ошибок, ${warnings.length} предупреждений.`);
  process.exitCode = 1;
} else {
  console.log(`Проверка пройдена: 0 ошибок, ${warnings.length} предупреждений.`);
}
