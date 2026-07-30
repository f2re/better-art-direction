# Anti-template and anti-AI-slop patterns

Use these patterns as evidence prompts. A match is not automatically a defect; confirm whether it is justified by the product, content, and established system.

## Contents

- Structural patterns
- Surface and styling patterns
- Typography patterns
- Content integrity patterns
- Motion patterns
- Product-mode mismatches
- Technical signals
- Review discipline

## Structural patterns

### Interchangeable page rhythm

Signal: unrelated pages repeat `hero → three feature cards → testimonial → CTA → footer` with only copy and color changes.

Confirm by comparing page structure, not screenshots alone. Fix by rebuilding the argument or workflow around the product's actual evidence and tasks.

### Cardification

Signal: every section, row, field group, statistic, and action is enclosed in a rounded card.

Why it matters: boundaries lose meaning, relationships fragment, and hierarchy depends on decoration instead of layout.

Valid when: each container is a real independent object with its own state or action model.

### Nested cards

Signal: a card contains several visually identical cards solely to create hierarchy.

Fix by using spacing, typography, alignment, background shifts, or a different component relationship.

### Decorative bento

Signal: a grid uses varied spans but contains weak, unrelated, or empty material. The geometry is the idea rather than the information.

Valid when: spatial size communicates importance or a real relationship.

### Marketing hero inside operational software

Signal: an authenticated workspace opens with a giant slogan, supporting paragraph, and decorative illustration before routine work can begin.

Fix by exposing the work state, current object, queue, or next action.

### Arbitrary asymmetry

Signal: offsets and overlaps exist only to appear unconventional and fail with real content or narrow widths.

Valid when: the asymmetry expresses hierarchy, sequence, comparison, or physical subject matter.

### Hidden primary navigation

Signal: important destinations are placed behind ambiguous icons, hover-only interactions, or decorative controls.

Fix by restoring visible, stable navigation appropriate to task frequency.

## Surface and styling patterns

### Generic purple-blue gradient

Signal: purple-to-blue or cyan gradient appears as the default accent despite no brand or subject rationale.

Do not ban the hues. Require a reason, semantic role, and contrast verification.

### Glass everywhere

Signal: repeated translucent panels, blur, and glowing borders create depth without information hierarchy.

Risks: poor contrast, performance cost, visual noise, and inconsistent rendering.

### Icon tile above every heading

Signal: each section starts with a small icon in a rounded colored square, followed by title and paragraph.

Valid when: icons encode a stable taxonomy users learn. Decorative repetition is not a taxonomy.

### Excessive pills

Signal: tags, buttons, navigation, metadata, and labels all use the same capsule shape.

Why it matters: controls, status, and metadata become indistinguishable.

### Universal large radius

Signal: every surface, input, image, dialog, and button uses the same large radius.

Fix by assigning shape according to nesting, role, platform, and material language.

### Glow as affordance

Signal: glow replaces shape, label, focus, or state to indicate interactivity.

Fix by using persistent static cues and reserving glow for a justified visual system.

### Fake device or application chrome

Signal: ordinary screenshots or code are wrapped in hand-drawn browser bars, traffic-light dots, phone frames, terminal title bars, or editor chrome.

Use a real screenshot or omit the frame unless the device context is essential.

### Decorative ambient blobs

Signal: multiple absolute-positioned blurred circles fill empty space but do not support composition or subject.

Fix by using content, product artifacts, or intentional negative space.

## Typography patterns

### Default typography without role decisions

Signal: one family, one weight pattern, and ad hoc sizes are applied to every product type.

Do not ban a common font. Define roles and verify that the type behavior fits density, language, data, and platform.

### Oversized headings in dense tools

Signal: settings, tables, or dashboards use marketing-scale headings that reduce usable workspace.

Fix by matching type scale to task frequency and information density.

### Narrow headline walls

Signal: a display heading wraps into four to six short lines because the container is unnecessarily narrow.

Fix by revisiting hierarchy, width, copy, and scale together; do not enforce a universal line count.

### Italic emphasis as a default signature

Signal: one word in every heading is italicized regardless of meaning.

Valid when: the typography system and content genre justify it and the behavior remains readable.

### Decorative uppercase labels

Signal: `ABOUT US`, `SECTION 01`, `FEATURE 03`, or similar labels precede headings without adding navigation or sequence information.

Remove them or give them a real structural function.

## Content integrity patterns

### Invented proof

Signal: fabricated customer counts, conversion rates, awards, testimonials, logos, or speed claims.

This is a trust failure, not merely a writing issue. Use verified evidence, clearly marked placeholders, or a structure that does not require proof not supplied by the user.

### Generic transformation language

Signals include phrases such as:

- unlock the power,
- seamless experience,
- revolutionize your workflow,
- elevate your business,
- next-level solution,
- раскройте потенциал,
- бесшовный опыт,
- выведите на новый уровень,
- революционное решение.

Replace with specific user actions, constraints, and outcomes supported by the product.

### Repeated generic links

Signal: several links say only `Learn more`, `Read more`, or `Подробнее`.

Use destination-specific labels.

### Placeholder content used as design evidence

Signal: lorem ipsum, random stock images, `picsum`, or invented names determine layout decisions.

Use realistic domain content and lengths. Mark unresolved content explicitly.

### Empty states without a next action

Signal: a screen says `No results` or `Nothing here` and provides no explanation or recovery.

Add orientation and one relevant action, unless emptiness itself is the final state.

## Motion patterns

### Motion everywhere

Signal: each section, card, icon, and heading enters independently.

Why it matters: repeated attention cost makes the interface feel generated and slows routine use.

### Scroll choreography without narrative need

Signal: pinning, horizontal scroll, word-by-word reveals, or card stacking are added because they look premium rather than because they explain the subject.

Use one orchestrated moment when it carries meaning. Keep routine controls immediate.

### Bounce and elastic defaults

Signal: all controls use spring overshoot regardless of product tone or frequency.

Choose motion from material and task. Respect reduced motion.

### Animation as the only state cue

Signal: state changes are communicated only through movement.

Add a persistent label, color, icon, or structural cue.

### Page-load theatre in work tools

Signal: routine application screens replay staged entrances on every visit.

Skip or drastically reduce animation for high-frequency work.

## Product-mode mismatches

- A scientific dashboard styled as a luxury lifestyle landing page.
- An administrative form treated as a cinematic narrative.
- A marketing page reduced to a generic application shell.
- A mobile interaction that depends on hover.
- A dense expert tool expanded into excessive empty space.
- A high-stakes transactional flow using playful errors or ambiguous actions.

Fix the mode before polishing details.

## Technical signals

These are stronger, more objective failures:

- Horizontal overflow at supported widths.
- Clipped or unreachable actions.
- Missing keyboard paths or visible focus.
- Icon-only controls without accessible names.
- Inputs without labels.
- Missing image alternatives.
- `outline: none` without a verified replacement.
- `transition: all` producing accidental motion.
- Layout shifts during loading or interaction.
- Animation that ignores reduced motion.
- Errors, failed requests, or hydration warnings in the console.
- Duplicate IDs and invalid interactive nesting.

Treat these as quality-floor issues even when the visual direction is strong.

## Review discipline

For every reported issue:

1. Cite the exact file and line or the exact rendered screen and state.
2. Distinguish source evidence from runtime evidence.
3. Name the root cause, not each repeated symptom.
4. Explain why the pattern is wrong for this product.
5. Provide a concrete replacement direction.
6. Record plausible candidates that were inspected and rejected as false positives.
7. Do not claim that a fashionable choice is inherently bad. The problem is unexamined default use.
