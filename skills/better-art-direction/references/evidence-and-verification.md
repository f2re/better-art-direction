# Evidence and verification

Use this reference whenever a claim depends on rendered appearance, interaction, responsive behavior, or runtime state.

## Contents

- Evidence hierarchy
- Baseline capture
- Static audit helper
- Visual audit helper
- Manual interaction checks
- Accessibility checks
- Responsive and content stress
- Visual comparison
- Reporting limits

## Evidence hierarchy

Prefer evidence in this order:

1. Rendered interaction in the target environment.
2. Computed styles, DOM state, network behavior, and console output.
3. Shared tokens, component implementations, and source code.
4. Screenshots supplied without source.
5. Written descriptions.

Source can prove implementation details but not the final visual rhythm. A screenshot can prove appearance at one moment but not keyboard behavior, responsive states, or code-level causes. Combine evidence when the conclusion crosses those boundaries.

## Baseline capture

Before redesign or polish work:

- Record the target routes and primary flow.
- Capture representative desktop and mobile screenshots.
- Note existing viewport support, theme, localization, and content density.
- Record console errors and failed requests separately from design findings.
- Identify the shared components and tokens responsible for repeated symptoms.

Use the same environment, content, browser, viewport, font availability, and animation settings for before-and-after comparison.

## Static audit helper

Run the dependency-free scanner against source files:

```bash
node <skill-dir>/scripts/static-audit.mjs .
```

Useful options:

```bash
node <skill-dir>/scripts/static-audit.mjs src \
  --format markdown \
  --out .art-direction-audit/static.md

node <skill-dir>/scripts/static-audit.mjs src --strict
node <skill-dir>/scripts/static-audit.mjs src --format json --no-fail
```

The scanner reports:

- generic transformation copy,
- decorative numbered labels,
- unsupported proof claims,
- repeated generic links,
- common gradient and decoration defaults,
- card nesting,
- raw color and shape sprawl,
- focus removal,
- icon-only buttons without evident accessible names,
- placeholder content,
- fake chrome,
- dead-end empty states,
- selected technical risks.

Interpret warnings contextually. The scanner is deliberately conservative and does not decide whether a visual choice is valid for the product.

## Visual audit helper

Install browser dependencies in the target project:

```bash
npm install --save-dev playwright axe-core
npx playwright install chromium
```

Then run:

```bash
node <skill-dir>/scripts/visual-audit.mjs \
  --url http://127.0.0.1:3000 \
  --paths /,/settings,/reports \
  --widths 320,375,414,768,1440 \
  --out .art-direction-audit
```

Useful options:

```bash
node <skill-dir>/scripts/visual-audit.mjs --url http://127.0.0.1:3000 --headed
node <skill-dir>/scripts/visual-audit.mjs --url http://127.0.0.1:3000 --strict
node <skill-dir>/scripts/visual-audit.mjs --url http://127.0.0.1:3000 --no-axe
```

The script captures screenshots and reports:

- page-load failures,
- console and request failures,
- horizontal overflow,
- elements extending outside the viewport,
- duplicate IDs,
- missing labels and accessible names,
- images without `alt`,
- clipped text,
- small hit areas,
- likely invisible keyboard focus,
- infinite animation under reduced-motion preference,
- axe-core violations when `axe-core` is installed.

Treat the script output as evidence, not as a complete accessibility certification.

## Manual interaction checks

Complete the primary user path without a mouse:

- Reach every action with Tab or the expected composite-widget keys.
- Confirm focus is visible and not trapped outside active overlays.
- Close overlays with Escape where appropriate.
- Confirm focus returns to the invoking control.
- Activate buttons with Enter and Space.
- Confirm menus, tabs, listboxes, and grids follow their expected keyboard model.
- Ensure sticky regions do not hide focused content.

Walk all affected states:

- default,
- hover,
- focus,
- active,
- disabled,
- loading,
- empty,
- error,
- success,
- offline or failed request when relevant.

## Accessibility checks

Automated checks identify only part of the problem. Combine axe with:

- semantic heading and landmark review,
- accessible-name inspection,
- form label and error association,
- keyboard traversal,
- 200% zoom,
- reflow at 320 CSS pixels,
- reduced motion,
- screen-reader spot checks for complex widgets,
- color-independent status communication.

Do not classify a screen as accessible solely because axe returns no violations.

## Responsive and content stress

At minimum test `320`, `375`, `414`, `768`, and one representative desktop width. Add wider or device-specific sizes when the product requires them.

Stress with:

- the longest realistic title and label,
- Russian and another representative locale when localization exists,
- large numeric values and long identifiers,
- empty lists,
- one item,
- dense lists or tables,
- loading skeletons,
- validation errors,
- permission restrictions,
- missing imagery,
- 200% browser zoom,
- virtual keyboard and safe-area constraints on mobile.

Do not accept a direction that only works with short English placeholder copy.

## Visual comparison

For redesigns and polish passes:

1. Capture the same routes, widths, content, and states before and after.
2. Compare hierarchy, orientation, density, and task efficiency before decoration.
3. Check that the signature is present but not repeated indiscriminately.
4. Confirm the result still belongs to the existing product family where preservation was required.
5. Use pixel comparison only for regression-sensitive surfaces; visual judgment remains necessary for intentional redesign.

If the project already uses Playwright Test, prefer its screenshot expectations:

```ts
await expect(page).toHaveScreenshot("settings.png");
```

Generate baselines and comparisons in the same operating system and browser environment.

## Reporting limits

State exactly what was run and observed. Use these labels:

- `Verified`: inspected in the rendered product or passed an executed check.
- `Source-only`: supported by code but not runtime behavior.
- `Not verified`: required environment, data, or dependency was unavailable.
- `Heuristic`: a pattern worth review, not a confirmed defect.

Never convert a missing verification step into a confirmed finding. Never claim uninspected routes or states were covered.
