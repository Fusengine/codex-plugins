---
name: never-do
description: "Canonical never-do list (design and code) and the reference bar. MUST be read before generating any UI and re-checked at design-review before any done claim, in every lane including taste-first."
---

# Never Do — design and code errors that make a page read as "horrible"

Grounding: owner verdict « mais design horrible » on the Codex T10 run-1 page
(`docs/validation/doctrine-coherence/t10/run-1/audit-design.md`, findings F1-F10) → N1 to N12;
T10 run-3 audit (`t10/run-3/desktop-light-result.png`) → N13-N18; T11 owner verdict on
hand-drawn icons → N19. Each rule
below is generic, not tied to that subject. This file is the **canonical home** of the list
and of the reference bar; other files point here and never restate it.

**When it is read (MUST).**
1. **Before generating** — after Gate 0 is written and before the first line of HTML/CSS/
   tokens, in every lane (`design-method` moves and the `taste-first` lane alike). Copy the
   rule numbers that apply to this surface into the plan, one line each.
2. **At review** — `design-review` re-checks every rule against the rendered captures and
   the code (`design-review/references/review-procedure.md` item 8c). A hit is a finding
   with the severity below; a P0/P1 hit means not done.

## The list

| # | Never | How it shows in the design | How it shows in the code / check | Sev. |
|---|---|---|---|---|
| N1 | **Dump a comparative or multi-source result per source.** | The user has to diff rows by eye; identical answers repeated N times; no verdict. | One row per source rendered in arrival order; no grouping key; values not sorted. Fix: compute the verdict (agree / diverge / partial) first, group sources by identical answer, sort values stably, mark the outlier. | P0 |
| N2 | **Let a title or decoration outweigh the primary action of a single-purpose tool.** | Squint test: the largest, darkest object above the fold is a slogan, not the input/command bar. | Display `font-size` on the H1 far above the input's size; input is a thin outlined box. Fix: the input/command bar is the focal block (largest + highest contrast); the headline is a short value line. | P0 |
| N3 | **Ship a visual that carries no data in the current state, or only duplicates data shown elsewhere.** | A map, chart or illustration that is decorative before use and redundant after. | Markers/series not bound to the result model; same values printed in the table. Fix: the visual encodes the user's result (group, value, divergence) and stays readable at every breakpoint, or it is cut. | P1 |
| N4 | **Ship an empty pre-use state.** | Below the input, only empty containers ("Run a check to see results"). | Result component rendered only after the first response. Fix: render the real result component with a live or clearly labelled sample before first input. | P1 |
| N5 | **Take the category's first reflex for palette, typeface or ornament.** | Anyone could guess the look from the category (dotted world map on navy, mint-on-forest "trust" green, mono micro-labels, arrow glyphs, Inter by default). | Tokens match a first-order cluster of `design-method` §AI-slop test. Fix: rework the Design Read until the answer is not obvious from the category. | P1 |
| N6 | **Invert the theme for a single section.** | A dark slab dropped into a light page (or the reverse) reads as two templates stitched together. | One section with its own background ladder outside the theme tokens. Allowed only when the dark object is a depicted dark object (terminal, device, screen). `pre-flight-checklist.md` theme-lock check is the mechanical companion. | P1 |
| N7 | **Deliver a single theme without an owner lock.** | Light and dark captures are identical. | No `prefers-color-scheme` (or theme-class) token set; one `theme-color`. Fix: both themes designed, each with its own surface ladder and elevation; identical light/dark captures = fail. | P1 |
| N8 | **Jump in the type scale or multiply micro text styles.** | Display size straight to body with nothing between; many tiny grey lines. | Ratio between consecutive steps far above the scale; ≥2 distinct sizes under body. Fix: one scale (`design-system` §Typography scale) governs every string. | P2 |
| N9 | **Leave loading, partial or error states as a status sentence.** | A button label and a line of text are the only feedback; results jump in. | No skeleton, no per-source pending/answered/failed state, errors only in a status string. Fix: each source shows pending → answered/failed inside the result component, streaming visibly. | P2 |
| N10 | **Shrink the desktop composition to mobile.** | A 3-column table and a map strip squeezed to 390px. | Same markup with only `font-size`/width reductions at the mobile breakpoint. Fix: compose mobile separately (stacked groups, compact strip instead of a map). | P2 |
| N11 | **Treat "design-expert consulted" as "design-expert executed".** | A page styled by an executor that never ran Gate 0 or `design-review`. | UI files (`*.html`, `*.css`, component markup) written without the Gate 0 artefacts and the review output attached. Fix: the visual layer is written by the design-expert method, or the deliverable carries its locked Gate 0 + review artefacts; otherwise it is not done. | P0 |
| N12 | **Self-certify a visual ("clean", "polished") without the reference bar.** | Done claimed from the build's own screenshots alone. | No side-by-side capture set against the references below. Fix: run the reference bar. | P0 |
| N13 | **Repeat an identical result row by row, even under a consensus badge.** | N rows carry the same value; a "results agree" badge sits on top of the full dump, so the eye still scans every row. | One `<tr>` per source with no aggregation step; the consensus flag is computed but not used to collapse. Fix: lead with a consensus summary (the shared value + `n/N` count), then show **only the divergent rows**; full per-source detail is collapsed (disclosure) and opens on demand. Inside a row, multi-value answers keep one stable sort order. | P0 |
| N14 | **Keep a column whose value is identical on every row.** | A status column showing the same badge on all rows: visual noise, zero information. | Column rendered unconditionally whatever its cardinality. Fix: a column with a single distinct value is removed and stated once in the summary; only exceptions (failed, empty, pending, outlier) get a badge. | P1 |
| N15 | **Drop one dark card into a light page (or the reverse).** | One panel in the inverse theme reads as a second template stitched in. | A component with its own hard-coded background outside the theme tokens. Allowed only when that panel is the **signature element stated in the brief** (Gate 0 artefact 2) or a depicted dark object (N6); otherwise it follows the page theme in light and dark. | P1 |
| N16 | **Show a decorative visual (map, chart) before first use.** | At first paint the visual is an empty or ornamental frame: dots, a legend for states that do not exist yet. | Visual bound to the result model only after the first response. Fix: from the first paint it renders real or clearly labelled example data, in the same encoding as the live result; otherwise it is not rendered until it has data (N3). | P1 |
| N17 | **Leave the results area empty before first use.** | A blank or placeholder container where the output will appear. | Result component mounted only on response. Fix: show an example result with the real result component; a clear guided empty state (what will appear, the one action to get it) is acceptable only where an example cannot be shown (private data). For a single-purpose tool, N4 applies: the example result is required. | P1 |
| N18 | **Say "done" without re-reading this list against your own screenshots.** | Done claimed while a rule above is visibly broken in the capture. | Report has no never-do ledger. Fix: before any done claim, the executor re-reads this file against its own captures (light + dark, desktop + mobile) and lists **every rule N1-N19 as `pass` / `fail` / `n/a`** with the capture path in its report; any P0/P1 `fail` means not done. | P0 |
| N19 | **Hand-make the icon set or the component kit on a web stack.** | Icons drawn one by one (inconsistent stroke, size, optical weight); buttons, inputs, dialogs and tables rebuilt from scratch with uneven states and focus. | On Vite, Next.js, Astro, TanStack Start, Laravel + Inertia React (marketing and landing sites included) or any web-app frontend: inline `<svg>` icon paths or a custom icon sprite; component markup with no `components.json` / shadcn components; or a shadcn component forked/rewritten internally, or a home-made kit run beside it. Identity comes from tokens / CSS variables, `cva` variants, composition and shadcn blocks, never from distorting the components. Fix: shadcn/ui components (`npx shadcn@latest init -t next\|vite\|start\|react-router\|laravel\|astro`, then `add`; shadcn MCP for the registry) + Lucide icons from the stack's package (`lucide-react` in React, `@lucide/astro` in `.astro` files, `lucide` in vanilla JS); restyle through tokens, never re-implement. Canonical rule: `design-web/SKILL.md` §Component kit and icons. Exempt: plain static HTML pages and mobile mockups. Brand marks and logos are not icons. | P1 |

Copy bans (em dash, category-restating headline) stay canonical in `design-method`
§Absolute bans and `ux-copy`; not restated here.

## The reference bar — picked at Gate 0, compared before done

**At brief time (Gate 0, artefact 3).** Name **two best-in-class references of the same
domain and function** (for a tool surface: two real products doing the same job; for a
brand page: two pages of the same sector at the top of their category). If the owner named
a reference, it is one of the two and it wins every disagreement. Record them as
`Reference bar: {name + URL}, {name + URL}`. They are in addition to the corpus pages, never
a substitute for them.

**Before done (`design-review` item 8c).** Capture each reference and the build at the
**same viewport(s)** (desktop and mobile at minimum, same theme where the reference has
one). Compare **section by section**: first screen, pre-use state, result/primary content,
states, mobile. For each section write `better / equal / worse` + one line why.
**Any `worse` = not done** — fix it within the review loop or report it as an open P1.

## Reconciliation with `taste-first` (its Forbidden list bans competitor-lift and lookalike tests)

The two do not conflict, because they test different things:

- The **lift / lookalike tests** taste-first forbids ask *"could this be confused with, or
  pasted onto, a competitor?"* — a distinguishability gate that pushes toward copying or
  anti-copying. Their intent, **never copy a reference's structure, flow or look**, stays
  in force in every lane.
- The **reference bar** asks *"is each section at least as good as the best real product
  of this function?"* — a **quality floor**, not a design source. It never dictates
  structure, palette or device; it only refuses a section that is worse.

So in the taste-first lane the reference bar is **required**, and it runs **inside
Promotion Checkpoint 2** as one of its criteria (no added promotion stage). At Checkpoint 1
the references are not shown to the critic and do not steer the thesis.
