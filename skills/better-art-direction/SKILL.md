---
name: better-art-direction
description: Define, audit, redesign, and verify product-specific art direction for web and application interfaces. Use for UI/UX design direction, frontend redesigns, visual-system planning, anti-template or anti-AI-slop reviews, reference studies, and requests such as "make this interface distinctive", "this looks AI-generated", "арт-дирекшн", "не должно выглядеть ИИ-шно", or "переработай дизайн". Do not use for isolated typography, color, copy, accessibility, or spacing fixes unless the task also requires an overall visual direction.
---

# Better Art Direction

Create interfaces that belong to their product, audience, and task instead of repeating a fashionable template. Own the product-level visual thesis, composition strategy, signature element, density, imagery, and motion stance. Hand detailed typography, color, layout, accessibility, UI-polish, and copy work to sibling skills when they are installed.

## Resolve the operating mode

Infer one mode from the request and workspace:

- `direction`: define a new art direction before implementation.
- `audit`: inspect an existing interface and report evidence without editing.
- `redesign`: change the visual and structural presentation while preserving product behavior and information architecture.
- `polish`: strengthen an established direction without replacing the product structure.
- `study`: extract reusable design principles from a screenshot, URL, or reference; never copy pixels or proprietary assets.

Treat a review request as read-only. Edit source only when the user asks to implement, redesign, or polish. Follow the mode-specific sequence in [workflow.md](references/workflow.md).

## Start with evidence

1. Read applicable `AGENTS.md`, `README`, product briefs, `DESIGN.md`, tokens, global styles, shared components, package scripts, and representative screens.
2. Identify the real subject, audience, primary job, stakes, information density, and supported devices.
3. Classify the surface using [interface-modes.md](references/interface-modes.md). Do not apply landing-page conventions to operational software, dashboards, scientific tools, or administrative systems.
4. Inspect the rendered interface when runtime appearance matters. Do not infer visual rhythm, clipping, interaction states, or animation quality from source alone.
5. Record uncertainty. Infer from repository evidence when practical; ask one concise question only when the missing answer changes the direction materially and cannot be resolved from the workspace.

## Build the art-direction contract

Define these items before broad implementation:

1. **Product truth**: one sentence describing what the product lets people accomplish.
2. **Audience and context**: who uses it, under what conditions, and with what level of expertise.
3. **Surface mode**: operational, analytical, consumer product, editorial, commerce, marketing, or another evidenced mode.
4. **Direction statement**: one concise visual thesis grounded in the product's subject matter.
5. **Signature**: one memorable structural, typographic, material, data, or interaction device. Spend most expressive effort here.
6. **Composition strategy**: hierarchy, reading order, major regions, density, and responsive behavior.
7. **Type roles**: display, body, utility, and data roles; preserve existing families unless a change is justified.
8. **Color roles**: background, surface, text, accent, status, and focus roles; preserve project tokens unless the task includes a system change.
9. **Imagery and material vocabulary**: real product artifacts, diagrams, photography, textures, or no imagery when imagery would be decorative noise.
10. **Motion thesis**: what movement communicates and which interactions remain immediate.
11. **Anti-references**: three specific defaults the implementation must avoid for this product.
12. **Constraints**: framework, component library, accessibility, performance, browser, localization, and delivery boundaries.

Use [composition.md](references/composition.md) to compare candidate directions. Generate two or three candidates privately, score them by product fit, clarity, distinctiveness, implementation cost, and durability, then choose deliberately. Never use randomization to choose a direction.

## Run the specificity test

Before implementation, ask:

- Could the same composition, copy structure, palette, and decorative devices be relabeled for three unrelated products?
- Does the signature originate from the product's real materials, data, workflows, or culture?
- Is each visual device performing a product or communication function?
- Is the design expressive in one controlled place rather than noisy everywhere?

Revise any direction that fails these tests.

## Avoid template substitution

Read [anti-patterns.md](references/anti-patterns.md) for the complete evidence-based list. Apply these defaults:

- Do not replace one generic style with another fixed anti-AI style.
- Do not force gradients, glass panels, bento grids, giant headings, serif display faces, brutalism, or maximal motion.
- Do not wrap every section in a card or nest cards to manufacture hierarchy.
- Do not invent metrics, testimonials, logos, customers, claims, or product capabilities.
- Do not use decorative labels such as `SECTION 01` unless sequence is meaningful.
- Do not draw fake browser, phone, terminal, or editor chrome around ordinary content.
- Do not use icon tiles, glows, pills, or floating blobs without a specific information or interaction role.
- Do not make operational interfaces resemble marketing pages.
- Do not erase an existing design system merely to make the result look novel.

Treat heuristic detections as prompts for judgment, not automatic prohibitions.

## Implement within the product

When editing an existing project:

1. Preserve routes, data flow, semantics, component ownership, and user-visible behavior unless the user explicitly changes scope.
2. Reuse existing tokens, primitives, and styling conventions before introducing new ones.
3. Change shared causes before repeating leaf-level patches.
4. Use real domain content and realistic lengths. Never rely on `Lorem ipsum`, fake metrics, or placeholder testimonials to make the layout work.
5. Design loading, empty, error, success, disabled, hover, focus, and active states for affected interactive surfaces.
6. Keep navigation and primary actions stable across supported widths.
7. Keep accessibility and reduced motion as the quality floor, not as a later polish step.
8. State planned file creations and deletions before a broad redesign. Never delete production files or replace a route tree without explicit approval.

Persist a durable direction only when the user asks for documentation or the change spans multiple surfaces. Copy [ART_DIRECTION.template.md](assets/ART_DIRECTION.template.md) into the target project and replace every placeholder with evidenced decisions. Do not create a competing design document when the project already has a governing format.

## Coordinate sibling skills

Read [sibling-skills.md](references/sibling-skills.md) when any `better-*` sibling skills are installed. Keep ownership clear:

- `better-art-direction`: product truth, macrostructure, signature, density, imagery, motion thesis, and anti-references.
- `better-layout`: spatial grouping, alignment, spacing, adaptive structure, and reading order.
- `better-typography`: font behavior, type scale, wrapping, text rendering, and numeric typography.
- `better-colors`: palette construction, gamut, semantic color roles, and rendered contrast measurement.
- `better-ui`: surfaces, icons, micro-interactions, and visual polish.
- `better-accessibility`: semantics, keyboard, focus, forms, assistive technology, zoom, and reduced-motion requirements.
- `better-writing`: interface vocabulary, labels, errors, empty states, and source copy.
- `better-interface`: cross-domain orchestration and consolidated reporting.

Report one root cause once. Do not duplicate a sibling rule merely to make the report longer.

## Verify the rendered result

Use [evidence-and-verification.md](references/evidence-and-verification.md).

At minimum, when the project can run:

1. Open every changed representative screen.
2. Check widths `320`, `375`, `414`, `768`, and a representative desktop width.
3. Use realistic content, long labels, empty data, dense data, errors, and loading states.
4. Traverse the primary flow with a keyboard.
5. Check reduced motion and at least one dark or alternate appearance when supported.
6. Inspect console errors, failed requests, clipping, horizontal overflow, and hidden actions.
7. Capture before and after screenshots for redesign or polish work.
8. Run available project tests, accessibility checks, and visual regression checks.

Run the bundled deterministic helpers when useful:

```bash
node <skill-dir>/scripts/static-audit.mjs <target-path>
node <skill-dir>/scripts/visual-audit.mjs \
  --url http://127.0.0.1:3000 \
  --paths /,/settings \
  --widths 320,375,414,768,1440
```

The static scanner reports heuristic and technical signals. The visual scanner requires Playwright in the target workspace and uses axe-core when available. Neither replaces design judgment or manual keyboard review.

## Return a decision-ready result

Use [output-format.md](references/output-format.md). Keep the response proportional to the mode:

- `direction`: art-direction contract, chosen direction, rejected candidates, implementation map, and verification plan.
- `audit`: scope, evidence, prioritized findings, rejected false positives, and verdict; no edits.
- `redesign` or `polish`: contract, changed files, before/after rationale, checks run, observed results, and remaining risks.
- `study`: extracted principles, what is reference-specific, what is transferable, and how to apply the principles without cloning.

Never claim a screen, state, viewport, or interaction was reviewed when it was not inspected.
