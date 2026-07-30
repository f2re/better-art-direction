# Output formats

Use the format matching the operating mode. Keep evidence and implementation status explicit.

## Direction mode

### Scope and evidence

State:

- product or surface,
- audience and primary job,
- repository or rendered evidence inspected,
- stack and existing design-system constraints,
- unresolved assumptions.

### Art-direction contract

| Field | Decision |
| --- | --- |
| Product truth | One sentence |
| Surface mode | Operational, analytical, consumer, editorial, commerce, marketing, or other |
| Direction statement | Product-specific visual thesis |
| Signature | One memorable device |
| Composition | Major regions, hierarchy, and responsive behavior |
| Type roles | Display, body, utility, data |
| Color roles | Background, surface, text, accent, status, focus |
| Imagery/material | Real visual vocabulary or explicit no-imagery stance |
| Motion | Meaningful movement and immediate interactions |
| Anti-references | Three defaults to avoid |
| Constraints | Framework, accessibility, performance, browser, localization |

### Candidate decision

| Candidate | Product fit | Clarity | Distinctiveness | Durability | Cost | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |

Present the selected candidate and concise reasons for rejecting the others.

### Implementation map

List affected surfaces, shared tokens or components, and the order of work. Do not fabricate exact files before inspecting the repository.

### Verification plan

Name the routes, states, widths, content stress cases, and automated or manual checks.

## Audit mode

### Scope and coverage

State the exact files, routes, screenshots, states, and widths inspected. Mark source-only and not-verified areas.

### Findings

Order by user impact and systemic reach:

| # | Severity | Domain | Evidence | Current pattern | Recommended direction | Why |
| --- | --- | --- | --- | --- | --- | --- |

Use:

- `HIGH`: blocks a task, misleads, creates trust or data-loss risk, hides critical content, or causes a systemic accessibility failure.
- `MEDIUM`: meaningfully harms comprehension, efficiency, adaptability, product fit, or consistency.
- `LOW`: isolated polish with limited task impact.
- `HEURISTIC`: a probable template signal that requires contextual judgment.

One root cause is one row. Cite `path:line` and rendered screen/state when both are relevant.

### Considered but rejected

| Candidate issue | Evidence inspected | Rejected because |
| --- | --- | --- |

Include real borderline patterns. Do not invent filler.

### Verification

List commands and interactions with observed results. Separate passed checks from `Not verified`.

### Verdict

Use one:

- `Block`: a high-impact task, trust, or accessibility failure remains.
- `Needs redesign`: the direction is structurally interchangeable or mismatched to the product.
- `Needs changes`: only medium or low confirmed findings remain.
- `Approve`: no actionable findings remain within verified scope.

## Redesign or polish mode

### Direction and boundaries

State the selected direction, preserved product behavior, and explicit non-goals.

### Changes

| Area | Before | After | Product reason |
| --- | --- | --- | --- |

Reference exact files and shared causes. Distinguish redesign from incidental cleanup.

### Verification

Include:

- commands run,
- routes and states opened,
- viewport widths,
- keyboard and reduced-motion checks,
- screenshots produced,
- automated findings resolved or remaining.

### Remaining risks

List only concrete unverified or deferred items.

## Study mode

### Reference boundary

Identify the screenshot or URL, observable scope, and any unavailable runtime or source evidence.

### Extracted DNA

| Dimension | Observation | Transferable principle | Do not copy |
| --- | --- | --- | --- |
| Macrostructure |  |  |  |
| Hierarchy |  |  |  |
| Type roles |  |  |  |
| Color roles |  |  |  |
| Material/imagery |  |  |  |
| Motion |  |  |  |

### Application to the target product

Explain how the principles change to fit the target's audience, content, and product mode. Refuse literal copying of proprietary assets, brand marks, distinctive illustrations, or paid templates.

## Durable ART_DIRECTION.md

Create this artifact only when requested or when a multi-surface implementation needs persistent direction. Use the bundled template and replace every placeholder.

The document must contain decisions that alter implementation. Exclude generic advice, audit history, and unverified brand narratives. Preserve an existing `DESIGN.md` or repository schema when it already owns these decisions.
