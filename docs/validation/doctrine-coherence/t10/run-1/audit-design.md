# T10 run-1 — Design audit: "Atlas DNS" worldwide DNS checker

Owner verdict (ground truth, 2026-11-22): **« mais design horrible »** / « pourquoi c'est toujours moche ».
This audit does not soften that verdict. It explains why the page reads as horrible, ranks
each cause by impact, turns each into a reusable "never do" rule, and says which doctrine
step should have caught it and why it did not.

- Site audited (read-only): `/Users/brunoazoulay/Downloads/dossier sans titre/run-1/` (`index.html` 79 l., `styles.css` 129 l., `app.js` 198 l., `world.png`)
- Captures: `docs/validation/doctrine-coherence/t10/run-1/{desktop,mobile}-{light,dark}-{initial,result}.png`
- Skills read: `plugins/design-expert/agents/design-expert.toml`, `skills/taste-first/SKILL.md`, `skills/design-method/SKILL.md` (worktree copy diffed against the loaded copy: identical except the Codex read-in-ranges header and `spawn_agent`/`challenger` naming), `design-method/references/moves/generate.md`, `design-method/references/register/product.md`, `design-review/references/review-procedure.md` + `pre-flight-checklist.md` (grepped), `design-web`, `design-webapp`, `design-system`, `design-motion` SKILL.md.
- Context fact that frames everything below: the executor was `typescript-expert`; `design-expert` was only consulted. None of the gates below ran on this page.

Severity: P0 Blocking / P1 Major / P2 Minor / P3 Polish. No aggregate score.

---

## 1. What the owner sees (one paragraph)

A giant two-line slogan ("Vérification DNS mondiale.") eats the top of the page, the actual
tool is a small form under it, then a 550 px navy block with a dotted world map that shows
nothing before use, then an empty white box. After a lookup, the page becomes a long, flat
table repeating the same two IP addresses six times. Nothing answers the only question a
worldwide DNS check exists to answer ("do all regions see the same thing?"), the one visual
(the map) is decoration, and the visual language (Inter, forest/mint green, mono
micro-labels, arrow glyphs, dotted map on navy) is the default "dev-tool landing" every
generator produces. It looks like a template because it is the template's skeleton with no
decision taken against it.

---

## 2. Findings, ranked by impact

### F1 — P0 — The results do not answer the question; the value of the product is invisible
- **Evidence**: `desktop-light-result.png` y≈1155–1925 (6 rows, ≈830 px); `mobile-light-result.png` y≈900–1730. Each row repeats `A 104.20.23.154 / TTL n s / A 172.66.147.243 / TTL n s`; the order of the two IPs flips row to row (Lagos 104 first, Helsinki 172 first) so the eye cannot compare down a column. No consensus line ("6/6 sondes d'accord"), no grouping by answer, no highlighting of a divergent probe, TTL repeated per record, latency (`0 ms`, `4 ms`) parked in a far-right mono column. `styles.css:98-112` (plain table, `.records` list), `app.js:126` (latency cell).
- **Why it reads as horrible**: the user ran the tool to see agreement or propagation. The page makes them do the diff by eye across 24 lines of identical data. A comparison tool that shows no comparison is the core failure; every other finding is secondary.
- **Generic rule — Never**: ship a comparative or multi-source result as a raw per-source dump. Always lead with the verdict (agree / diverge / partial), group sources by identical answer, sort values stably, and visually mark the outlier.

### F2 — P0 — The headline is the hero, the tool is a footnote
- **Evidence**: `desktop-light-initial.png`: H1 occupies y≈160–345 (≈700×185 px), the form y≈447–499, the "Vérifier" button ≈125×52 px. `styles.css:35` `font-size: clamp(2.95rem, 7.6vw, 6.1rem)` (≈98 px at 1440), `letter-spacing: -.062em`; `styles.css:41` form `max-width: 760px`; `styles.css:44` 52 px controls. Squint test: the largest, darkest object above the fold is the slogan; the input is a thin outlined rectangle.
- **Why**: on a single-purpose utility, the input IS the product. The page spends its most expensive area on a category label ("Vérification DNS mondiale" says what, never why this one) and leaves the primary action visually equal to the helper text under it.
- **Rule — Never**: let anything outweigh the primary action on a single-purpose tool. The input/command bar must be the focal element of the first screen (largest + highest contrast by the Squint test); a headline stating the category is not a hero.

### F3 — P1 — The map is decoration that costs a third of the page
- **Evidence**: `desktop-light-initial.png` y≈588–1135 (≈550 px) before any lookup: dotted continents, grid, a fake compass "N ↑" (`index.html:53`), "Natural Earth" credit, a legend for three states none of which exist yet, "6 continents ciblés". After lookup: six 8 px mint dots, no label, no value, no link to the matching row (`styles.css:86-90`, `app.js:130-134`). Mobile: the map collapses to a ≈150 px strip where markers overlap continents (`mobile-light-result.png` y≈590–750). Only 6 probes, one per continent (`app.js:4,67` `limit: 1`), so the map can never carry more than six dots.
- **Why**: "network tool → dark dotted world map with glowing dots" is a first-order category reflex (`design-method` AI-slop test, first-order tier). It is used as filler: it encodes nothing the table does not, and before use it encodes nothing at all.
- **Rule — Never**: place a data visual that carries no data in the current state, or a map/chart whose information is fully duplicated elsewhere. A visual earns its area only if it encodes the user's result (here: colour by answer group, latency, divergence) and stays readable at every breakpoint.

### F4 — P1 — Dead initial state: nothing shows what the tool produces
- **Evidence**: `desktop-light-initial.png` y≈1157–1249: white card "Résultats par sonde / Lancez une vérification pour afficher les réponses des sondes." `index.html:65-75`. Combined with the empty map, the whole page below the form is empty containers.
- **Why**: a first-time visitor cannot see the output, so cannot judge the tool. The copy technically names the object and the action (it would pass `register/product.md` §3 "cookie-cutter empty state") and is still dead.
- **Rule — Never**: ship a pre-use state that is an empty container. Show the output before the first input: a live or clearly labelled sample result on a well-known domain, rendered with the real result component.

### F5 — P1 — Generic visual language, mid-page theme inversion, no depth
- **Evidence**: `styles.css:4` `font-family: Inter`; `styles.css:1-10` palette = off-white `#f5f8f6`, forest `#185c45`, mint `#88dfb9` (the "trustworthy green tool" reflex); mono micro-labels everywhere at 0.64–0.77 rem (`styles.css:30,70,80,96,112`); decorative arrow glyphs `↘ ↗` (`index.html:16,35`); a navy `#101f2e` block dropped into a light page (`styles.css:63-66`) — exactly the mid-page inversion `design-review/references/pre-flight-checklist.md:40-45` fails. Surfaces: a flat white card with a 1 px border (`styles.css:91-94`), no elevation system, no surface hierarchy.
- **Why**: each choice is the first one any generator makes; together they fingerprint the page as generated. The light page with a navy slab reads as two templates stitched together.
- **Rule — Never**: accept the category's first reflex for palette/type/ornament, and never invert the theme mid-page unless the dark object is literally a depicted dark object (terminal, device).

### F6 — P1 — No dark mode
- **Evidence**: `desktop-light-initial.png` and `desktop-dark-initial.png` are byte-identical (222 878 B); same for `mobile-*-initial.png` (93 155 B). No `prefers-color-scheme` in `styles.css`; `index.html:7` single `theme-color`.
- **Why**: for a developer/network audience, a tool that ignores the OS theme looks unfinished; the "dark" capture proves nobody designed it.
- **Rule — Never**: deliver a web UI with one theme unless the owner locked it. Light and dark are both designed (own tokens, own surface ladder) and their captures must differ.

### F7 — P2 — Broken type scale and noisy micro-copy
- **Evidence**: sizes in use: ≈98 px H1, 18 px h2 (`styles.css:69`), 16 px body, 13 px labels, then 10–12 px mono in six places. Ratio from h2 to H1 ≈5.4× with no intermediate step; ≥6 distinct small sizes. Header holds a logo and one mono link pointing to an anchor on the same short page (`index.html:16`). Helper lines "Exemple : example.com" + "Le domaine saisi est transmis à Globalping…" stack under the form as two more small grey lines.
- **Rule — Never**: jump from display size to body with no scale between, or multiply micro text styles. One scale (ratio ≥1.25, 6–8 steps, ≤3 contrast variations per view, per `design-system`) governs every string.

### F8 — P2 — States not designed
- **Evidence**: loading = button label "Vérification…" + status text (`app.js:178-182`); pending probes have no visual on the table; no partial/error styling in the captures; `report.json` mobile-dark run returned 0 rows with an empty status (no error surfaced). No motion at all, so streaming results (polled every 650 ms, `app.js:79`) appear as jumps.
- **Rule — Never**: let loading, partial, error and empty states fall back to a text line. A multi-source tool streams: each source shows pending → answered, with a skeleton, and errors are visible in the result component.

### F9 — P2 — Mobile is the desktop shrunk
- **Evidence**: `mobile-light-result.png`: 3-column table at 390 px with wrapped meta ("Finlande · Hetzner / Online"), latency column squeezed, map strip unreadable.
- **Rule — Never**: shrink a desktop table and map to mobile. Mobile gets its own composition (stacked result cards grouped by answer, map dropped or replaced by a compact region strip).

### F10 — P3 — Copy-ban hits
- **Evidence**: em dash in `<title>` (`index.html:8` "Atlas DNS — Vérification…") and in marker tooltips (`app.js:134` `" — "`): `design-method` Absolute bans "Em dash in copy". The H1 is a category label, not a value statement.
- **Rule — Never**: em dash in copy; never a headline that only restates the category.

---

## 3. "Never do" rules — generic, reusable

1. Never present a multi-source or comparative result as a raw per-source dump: verdict first, group identical answers, stable sort, mark outliers.
2. Never let a headline, illustration or decoration outweigh the primary action of a single-purpose tool: the input is the focal element of the first screen (Squint test).
3. Never ship a visual (map, chart, illustration) that carries no data in the current state or only duplicates data shown elsewhere.
4. Never ship an empty pre-use state: show a real or labelled sample output rendered with the real result component.
5. Never take the category's first reflex for palette, typeface and ornament (dotted world map, mint-on-navy, mono micro-labels, arrow glyphs, Inter by default).
6. Never invert the theme for one section of a page unless the dark object is a depicted dark object.
7. Never ship a single theme without an owner lock: light and dark both designed; identical light/dark captures are a failure.
8. Never jump from display to body size without a scale, never more than one micro-text style.
9. Never leave loading/partial/error states as a status sentence: stream per source with visible pending, answered and failed states.
10. Never shrink a desktop composition to mobile: compose mobile separately.
11. Never let UI be built by an executor that did not run the design method: "design-expert consulted" is not "design-expert executed".
12. Never self-certify a visual as "clean / soigné": done requires a side-by-side comparison with named references at the same viewport.

## 4. The positive bar the doctrine should impose

- **Named references to beat, chosen at Gate 0.** For a tool surface: two best-in-class products of the same function (for a DNS checker: e.g. a propagation checker and a measurement-platform UI) for *function and data presentation*, plus at least one corpus page for craft. Captured at the same viewports as the build.
- **Screenshot-vs-reference comparison before done.** Section by section (first screen, pre-use state, result state, mobile): "better / equal / worse" with one line why. Any "worse" = not done. This is the bar the owner will apply; the doctrine must apply it first.
- **Primary action dominant.** On a utility, the input/command bar is the focal block of the first screen; the headline is subordinate (short value line, not a category slogan).
- **Output-first.** The answer to the user's question is the first thing in the result: consensus verdict, groups by answer, outlier highlight, then detail on demand.
- **Meaningful pre-use state.** The real result component, populated with a sample or live example, visible before the first input.
- **Every visual earns its area with the user's data**, and is readable on mobile, or it is cut.
- **Both themes designed**, distinct captures, surface hierarchy and elevation in each (corpus `reve` §3 surface ladder is the procedure).
- **States designed**: pending/answered/failed per source, streaming, error inside the result component.
- **Mobile composed**, not shrunk.

## 5. Which doctrine step should have caught each mistake, and why it did not

**Root cause, above every finding: no design gate ran.** The executor was `typescript-expert`; `design-expert` was only consulted. `05-frontend-rules` forbids styling that skips the design-expert brief, but nothing enforces that the agent writing the CSS is the one that ran Gate 0. Every skill below was available and none executed. Fix: a UI-bearing file (`*.html`, `*.css`, component markup) is owned by `design-expert` for its visual layer, or the executor must carry the design-expert's locked Gate 0 + review artefacts and the lead rejects the deliverable without them.

Even had `design-expert` executed, the skills have gaps that let this page through:

| Finding | Step that should have caught it | Why it did not (or would not) |
|---|---|---|
| F1 results dump | `design-webapp` steps 5–6 (tables, dataviz); `register/product.md` §2 Domain-Specificity Floor | Not run. And even run: the table rules are mechanical (identifier first, numbers right-aligned, sticky header) and this table would pass them. No rule says a comparison result must aggregate, group and highlight divergence. **Gap.** |
| F2 headline over tool | `design-web` step 3 hero discipline + Focal-Block Floor (brand); `design-review` Squint lens | Register ambiguity: a public single-purpose tool is neither `brand` (hero/banks/taste-first push a big headline) nor `product` (`register/product.md` §4 exempts the Focal-Block Floor). The router says "ask ONE question" but no lane says "on a utility, the input is the focal block". **Gap.** |
| F3 decorative map | `design-method` AI-slop test first-order tier; screen-holding floor | Not run. And the screen-holding floor lists "map" among the matter that holds a screen (`design-method/SKILL.md` §screen-holding floor), which rewards a filler map rather than questioning it. No rule requires a visual to encode the current data. **Gap.** |
| F4 dead pre-use state | `design-webapp` step 4 (empty state); `register/product.md` §3 cookie-cutter empty state | The rule only governs the wording ("name the object and the first action"); this copy complies and the state is still dead. No rule requires showing the output before first use. **Gap.** |
| F5 generic language, inversion | `design-method` Absolute bans + 2-level slop test; `design-review` Part 1 item 6–7 (`pre-flight-checklist.md:40-45` theme lock) | Not run. The theme-lock check would have failed the navy slab mechanically; the slop test would have flagged the dotted map. Existing rules, not executed. |
| F6 no dark mode | `design-review` Part 2 item 2 (light + dark via `colorScheme`) | Not run. And even run: the procedure captures both and checks contrast in both, but never requires a dark theme to exist; identical captures are not a listed failure. **Gap.** |
| F7 type scale | `design-system` Typography scale; `design-review` Part 1 item 14 Type-Scale floor | Not run. Existing rule. |
| F8 states | `design-webapp` step 4 (loading skeleton, error, populated); `design-motion` | Not run. Existing rules, but nothing covers streaming multi-source results (per-source pending). Partial gap. |
| F9 mobile shrunk | `design-review` Part 2 item 3 (cross-viewport); `design-webapp` step 5 (mobile table fallback) | Not run. Existing rules cover capture, not "compose mobile separately". Partial gap. |
| F10 em dash | `design-method` Absolute bans; `design-review` Part 1 item 4 | Not run. Existing deterministic grep. |
| Owner-verdict gap (F-all) | `design-review` item 9 challenger; `taste-first` Promotion Checkpoints | No step compares the build to a named best-in-class product of the same function. The corpus is 15 marketing pages + 2 app UIs; `design-inspiration` uses sector sites "for register only"; and `taste-first` explicitly forbids competitor-lift and lookalike tests (`taste-first/SKILL.md:139-140`). So the one comparison the owner actually makes ("is this as good as the real tools?") is either absent or forbidden. **Gap.** |

## 6. Proposed doctrine changes (for the lead; no skill edited here)

1. Enforcement: the visual layer of any UI deliverable is executed by `design-expert`, or the lead refuses it without Gate 0 artefacts + `design-review` output attached.
2. New lane or explicit rule in `register/product.md`: **public single-purpose tool** — the input is the focal block; output-first; pre-use state shows a sample result.
3. `design-webapp` / `register/product.md`: comparative-result rule (verdict, grouping, stable order, outlier highlight).
4. `design-method` screen-holding floor: a map/chart counts as matter only if it encodes the user's current data.
5. `design-review` Part 1: a theme-existence check (both themes defined unless owner-locked; identical light/dark captures = P1).
6. Gate 0 artefact 3 extended for tool surfaces: two named functional references; `design-review` Part 2 adds a section-by-section screenshot comparison against them ("worse anywhere = not done"). Reconcile with `taste-first`'s ban on competitor tests, which applies to brand pages only and must not be inherited by tool surfaces.
