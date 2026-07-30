# Coordination with sibling skills

Use this reference when other `better-*` skills are installed. Keep one owner per rule and one consolidated finding per root cause.

## Ownership matrix

| Concern | Owner | Art-direction role |
| --- | --- | --- |
| Product truth and audience | `better-art-direction` | Define the subject, context, and stakes |
| Surface mode | `better-art-direction` | Distinguish operational, analytical, consumer, editorial, commerce, and marketing modes |
| Macrostructure | `better-art-direction` | Choose the dominant composition and page rhythm |
| Signature element | `better-art-direction` | Select one product-specific memorable device |
| Density stance | `better-art-direction` | Set the overall density according to frequency and expertise |
| Imagery and material vocabulary | `better-art-direction` | Decide what kind of visual material belongs |
| Motion thesis | `better-art-direction` | Decide where motion carries meaning and where it stays absent |
| Grouping and spacing | `better-layout` | Implement spatial hierarchy and adaptive structure |
| Font loading and type behavior | `better-typography` | Implement type scale, wrapping, measure, numeric behavior, and rendering |
| Palette and contrast measurement | `better-colors` | Build or repair semantic colors and rendered pairs |
| Surfaces, icons, and micro-interactions | `better-ui` | Implement visual detail after structure is sound |
| Keyboard, semantics, forms, zoom | `better-accessibility` | Set non-negotiable interaction requirements |
| Labels, errors, and empty-state copy | `better-writing` | Own source wording and product vocabulary |
| Cross-domain review and verdict | `better-interface` | Orchestrate broad audits and consolidate findings |

## Discovery

Check the installed skill parent directory for sibling folders only when the current task needs them. Typical relative paths are:

```text
../better-layout/SKILL.md
../better-typography/SKILL.md
../better-colors/SKILL.md
../better-ui/SKILL.md
../better-accessibility/SKILL.md
../better-writing/SKILL.md
../better-interface/SKILL.md
```

Do not fail the art-direction task when a sibling is absent. Mark detailed domain work as not delegated and keep only the cross-domain quality floor required to avoid an unusable direction.

## Recommended order

For a greenfield direction or major redesign:

1. `better-art-direction`
2. `better-accessibility`
3. `better-layout`
4. `better-writing`
5. `better-typography`
6. `better-colors`
7. `better-ui`
8. `better-interface` for final consolidation when installed

For a small polish task, load only the owning skills. Do not load all domains by habit.

## Handoffs

Use explicit handoffs:

- "The art direction requires a compact analytical workspace; use `better-layout` to define the responsive regions and spacing."
- "The signature depends on tabular changing values; use `better-typography` for numeric behavior."
- "The status scale is semantically meaningful; use `better-colors` to construct and measure the rendered pairs."
- "The transition preserves context between object states; use `better-ui` for the motion recipe and `better-accessibility` for reduced-motion behavior."
- "The destructive action is unclear; use `better-writing` for the label and `better-accessibility` for dialog semantics."

Do not restate the sibling's complete rules in the art-direction output.

## Conflict resolution

When two skills appear to disagree:

1. Preserve explicit user and repository requirements.
2. Let accessibility requirements override optional visual effects.
3. Let the owning skill decide implementation details inside the art-direction constraint.
4. Prefer the existing product system unless the task explicitly includes migration.
5. Record a tradeoff instead of silently applying contradictory rules.

Examples:

- `better-art-direction` may call for dense expert use; `better-layout` should preserve that density while preventing target overlap and clipping.
- `better-art-direction` may select a vivid accent; `better-colors` must adjust the actual values to meet contrast and gamut requirements.
- `better-art-direction` may propose a state transition; `better-accessibility` decides what remains under reduced motion.
- `better-ui` may suggest more polish, but the art-direction restraint rule can reject decoration that competes with the signature.

## Consolidated reporting

Report each root cause once. A single repeated icon-tile pattern is one art-direction finding with all confirmed locations, not separate color, layout, UI, and writing findings.

In the consolidated explanation:

- Name the owning domain.
- Mention secondary effects briefly.
- Cite every confirmed location.
- Recommend one systemic fix.
- Avoid padding the report with low-impact repetitions.
