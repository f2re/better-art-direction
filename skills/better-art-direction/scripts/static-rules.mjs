const SEVERITY = { error: 0, warning: 1, info: 2 };

function positionAt(text, offset) {
  const lines = text.slice(0, Math.max(0, offset)).split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function compact(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, 180);
}

function make(text, offset, rule, evidence) {
  return { ...rule, ...positionAt(text, offset), evidence: compact(evidence) };
}

function matches(text, regex, rule, limit = 8, accept = () => true) {
  const findings = [];
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) && findings.length < limit) {
    if (accept(match)) findings.push(make(text, match.index, rule, match[0]));
    if (!match[0].length) regex.lastIndex += 1;
  }
  return findings;
}

const RULES = [
  {
    id: "BAD001", severity: "warning", title: "Generic transformation copy",
    message: "Interchangeable marketing language does not describe a concrete product action.",
    suggestion: "Replace it with a specific task, constraint, or verified outcome.",
    regex: /\b(?:unlock the power|seamless experience|revolutioni[sz]e (?:your|the)|elevate your|next[- ]level solution|transform your workflow)\b|(?:раскройте потенциал|бесшовн(?:ый|ого) опыт|революционн(?:ое|ый) решени[ея]|вывед(?:ите|и) .* на новый уровень)/giu,
  },
  {
    id: "BAD002", severity: "warning", title: "Decorative numbered meta-label",
    message: "The label simulates structure without proving a meaningful sequence.",
    suggestion: "Remove it or connect the number to a real process, timeline, or reference system.",
    regex: /\b(?:section|feature|question|chapter|about us|why us|блок|секция|раздел|вопрос|преимущество)\s*[-–—:]?\s*0?\d{1,2}\b/giu,
  },
  {
    id: "BAD003", severity: "warning", title: "Proof claim requires evidence",
    message: "The quantitative or social-proof claim may be unsupported.",
    suggestion: "Link verified evidence, mark data to confirm, or remove the claim-dependent structure.",
    regex: /\btrusted by\s+[\d,.\s]+\+?\s+(?:teams|users|companies|businesses)|\b\d+(?:\.\d+)?\s*[x×]\s+(?:faster|better|more)|\b\+?\d+(?:\.\d+)?%\s+(?:conversion|growth|satisfaction|improvement)|(?:нам доверяют|выбор)\s+[\d\s,.]+\+?\s+(?:команд|пользователей|компаний)|\d+(?:[,.]\d+)?\s*[x×]\s+(?:быстрее|эффективнее)/giu,
  },
  {
    id: "BAD005", severity: "info", title: "Common purple-to-blue gradient",
    message: "This frequent generated default needs a product or brand rationale.",
    suggestion: "Confirm its semantic role or use existing brand and subject-specific color sources.",
    regex: /(?:from-(?:purple|violet|fuchsia|indigo)-\d{2,3}|#(?:7c3aed|8b5cf6|9333ea)).{0,180}(?:to-(?:blue|cyan|sky)-\d{2,3}|#(?:2563eb|3b82f6|06b6d4))/gis,
  },
  {
    id: "BAD006", severity: "warning", title: "Unbounded transition",
    message: "Transitioning all properties can animate layout and paint changes accidentally.",
    suggestion: "List only intended properties, normally transform, opacity, or a local color change.",
    regex: /\btransition-all\b|transition\s*:\s*all\b/giu,
  },
  {
    id: "BAD012", severity: "warning", title: "Placeholder content drives the interface",
    message: "Placeholder copy or random imagery is not reliable product evidence.",
    suggestion: "Use realistic domain content and mark unresolved material explicitly.",
    regex: /\blorem ipsum\b|picsum\.photos|placehold(?:er)?\.(?:com|co)|dummyimage\.com/giu,
  },
  {
    id: "BAD013", severity: "info", title: "Fake application or device chrome",
    message: "Decorative browser, phone, terminal, or editor chrome can make evidence feel synthetic.",
    suggestion: "Use a real screenshot or omit the frame unless device context is essential.",
    regex: /fake[-_ ]?(?:browser|phone|terminal|editor)|browser[-_ ]window|traffic[-_ ]light[-_ ]dots|mock[-_ ](?:browser|device|terminal)/giu,
  },
  {
    id: "BAD014", severity: "info", title: "Legacy viewport-height unit",
    message: "100vh and h-screen can fail with mobile browser chrome and virtual keyboards.",
    suggestion: "Confirm the behavior and prefer dynamic viewport units or min-height where appropriate.",
    regex: /\bh-screen\b|height\s*:\s*100vh\b/giu,
  },
];

function repeatedGenericCtas(text) {
  const found = [...text.matchAll(/\b(?:learn more|read more|click here|find out more|узнать больше|читать далее|подробнее|нажмите здесь)\b/giu)];
  if (found.length < 3) return [];
  return [make(text, found[0].index, {
    id: "BAD004", severity: "warning", title: "Repeated generic action labels",
    message: `${found.length} generic labels hide destinations and make sections interchangeable.`,
    suggestion: "Name each destination or consequence explicitly.",
  }, found[0][0])];
}

function focusRemoval(text) {
  return matches(text, /outline\s*:\s*(?:none|0)\b|\bfocus:outline-none\b/giu, {
    id: "BAD007", severity: "error", title: "Focus indicator removed",
    message: "The default focus indicator is removed without an evident replacement.",
    suggestion: "Restore it or add a verified :focus-visible indicator.",
  }, 8, (match) => {
    const context = text.slice(Math.max(0, match.index - 220), match.index + 320);
    return !/focus-visible|outline-offset|box-shadow\s*:/iu.test(context);
  });
}

function iconOnlyButtons(text) {
  const regex = /<button\b([^>]*)>\s*(?:<(?:svg|[A-Z][\w.]*(?:Icon)?)\b[^>]*(?:\/>|>[\s\S]{0,260}?<\/(?:svg|[A-Z][\w.]*(?:Icon)?)>))\s*<\/button>/g;
  return matches(text, regex, {
    id: "BAD008", severity: "error", title: "Icon-only button has no evident accessible name",
    message: "The control appears to contain only an icon and no accessible name.",
    suggestion: "Add aria-label or aria-labelledby and hide decorative icon content when appropriate.",
  }, 8, (match) => !/aria-label\s*=|aria-labelledby\s*=|title\s*=/i.test(match[1] || ""));
}

function rawColorSprawl(text, filePath) {
  if (/tokens?|theme|variables?/iu.test(filePath)) return [];
  const values = new Set([...text.matchAll(/#[\da-f]{3,8}\b|(?:rgb|hsl|oklch)\([^)]*\)/giu)].map((m) => m[0].toLowerCase()));
  if (values.size < 8) return [];
  const first = text.search(/#[\da-f]{3,8}\b|(?:rgb|hsl|oklch)\(/iu);
  return [make(text, Math.max(0, first), {
    id: "BAD009", severity: "info", title: "Raw color sprawl outside the token layer",
    message: `${values.size} distinct raw colors were found in one implementation file.`,
    suggestion: "Map repeated roles to the existing semantic token system.",
  }, [...values].slice(0, 5).join(", "))];
}

function radiusSprawl(text) {
  const values = new Set([...text.matchAll(/rounded-(?:none|sm|md|lg|xl|2xl|3xl|full|\[[^\]]+\])|border-radius\s*:\s*[^;\n}]+/giu)].map((m) => compact(m[0])));
  if (values.size < 6) return [];
  const first = text.search(/rounded-|border-radius/iu);
  return [make(text, Math.max(0, first), {
    id: "BAD010", severity: "info", title: "Shape vocabulary is fragmented",
    message: `${values.size} radius treatments were found in one source.`,
    suggestion: "Assign shape by role and reuse the existing radius scale.",
  }, [...values].slice(0, 5).join(", "))];
}

function nestedCards(text) {
  const regex = /<(?:Card|article|section)\b[^>]*(?:class(?:Name)?\s*=\s*["'`][^"'`]*(?:card|rounded)[^"'`]*["'`])?[^>]*>[\s\S]{0,900}<(?:Card|article|section)\b[^>]*(?:class(?:Name)?\s*=\s*["'`][^"'`]*(?:card|rounded)[^"'`]*["'`])?/giu;
  return matches(text, regex, {
    id: "BAD011", severity: "warning", title: "Nested card hierarchy",
    message: "A card-like container encloses another card-like container and may manufacture hierarchy through boxes.",
    suggestion: "Use spacing, alignment, typography, or a genuinely different object relationship.",
  }, 4);
}

function repeatedDecoration(text, regex, threshold, id, title, message, suggestion) {
  const found = [...text.matchAll(regex)];
  if (found.length < threshold) return [];
  return [make(text, found[0].index, { id, severity: "info", title, message: `${found.length} ${message}`, suggestion }, found[0][0])];
}

function deadEndEmptyState(text) {
  return matches(text, /\b(?:no results|nothing here|no items|no data|нет результатов|ничего нет|данных нет)\b/giu, {
    id: "BAD017", severity: "warning", title: "Empty state has no evident recovery or next action",
    message: "The empty-state copy appears without a nearby action or explanation.",
    suggestion: "Orient the user and provide one relevant next action unless emptiness is final.",
  }, 8, (match) => {
    const context = text.slice(match.index, match.index + 500);
    return !/<(?:button|a)\b|onClick\s*=|href\s*=|clear filters|create|add |retry|сбросить|создать|добавить|повторить/iu.test(context);
  });
}

export function analyzeContent(text, filePath = "inline") {
  const findings = RULES.flatMap((rule) => matches(text, rule.regex, rule));
  findings.push(...repeatedGenericCtas(text));
  findings.push(...focusRemoval(text));
  findings.push(...iconOnlyButtons(text));
  findings.push(...rawColorSprawl(text, filePath));
  findings.push(...radiusSprawl(text));
  findings.push(...nestedCards(text));
  findings.push(...repeatedDecoration(text, /(?:absolute[^\n]{0,160}(?:blur-(?:2xl|3xl)|filter:\s*blur)|(?:blur-(?:2xl|3xl)[^\n]{0,160}absolute))/giu, 3, "BAD015", "Repeated ambient blur decoration", "absolute blurred decorations were found.", "Keep only decoration that supports the composition or replace it with product material."));
  findings.push(...repeatedDecoration(text, /\bbackdrop-blur(?:-[\w\[\]./-]+)?\b|backdrop-filter\s*:\s*blur/giu, 5, "BAD016", "Repeated glass treatment", "backdrop-blur treatments were found.", "Restrict transparency to a small number of meaningful layers."));
  findings.push(...deadEndEmptyState(text));
  return findings.sort((a, b) => SEVERITY[a.severity] - SEVERITY[b.severity] || a.line - b.line || a.column - b.column || a.id.localeCompare(b.id));
}

export { SEVERITY };
