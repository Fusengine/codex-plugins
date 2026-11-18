# Fusengine Support Workbench

## Brief lock

- Register: product. Tone: concentrated, direct, and composed. Design read: an agent's triage desk, not an analytics homepage. Variance 5, density 7, motion 1.
- Primary task: find the relevant support request, inspect it without losing queue context, then return to triage.
- Scope: Inbox and Overview, each in light and dark. One offline HTML with two independent, hash-addressable switches; all original inputs remain read-only.
- Macrostructure: data-dashboard-as-hero + Focus Ladder (Ticket Lens, selected by the blind challenger). Progression unit: one actual request. Inbox narrows by status/search, then request, then detail. Overview narrows by owner or recent resolution into the same detail; the 4 open / 2 resolved totals are shortcuts to Inbox filters.
- On-screen inventory: one workspace rail; Inbox has one filter/search strip, one request list, and one detail pane; Overview has one workload strip, two assignee groups, one resolved list, and one detail pane. One level-1 heading per screen, no marketing hero, imagery, placeholder graphs, or invented demand/SLA data.
- Old sequence: title then full-width flat queue (Inbox); title, owner list beside a secondary status/resolved column (Overview). Retained: sample request facts, French labels, persistent two-view navigation. Not retained: the flat full-width list, naked owner timeline, or global top menu.

## Design Reference

Inspiration: https://front.com/product (customer support vocabulary only).

- Corpus: reve/tokens-reve.md §3 Surface hierarchy, linear/tokens-linear.md §7 Buttons architecture
- Rendered and scrolled: `reve-recode/index.html` and `linear-recode/index.html`. Parley §11.1–2 supported the light-mode edge and shadow choices.
- Invented: Ticket Lens. A selected row ends in a short rule at the seam of a raised opaque detail pane. The tint and rule are shared by both views, so moving between queues does not reset the mental model. On narrow screens the list and pane stack; the accent stays on the selected row and the same accent starts the pane instead of drawing across unrelated content.
- Je reproduis: separate ground, working surface and control well with role-based elevation [corpus: reve/tokens-reve.md §3], shared control geometry with variant styling [corpus: linear/tokens-linear.md §7], named support conversations with real assignees and statuses [sector: https://front.com/product — register]

### Colors

The locked Fusengine palette is from `docs/mockups/design-system.md`, `docs/concept-support/design-system.md`, and `src/styles.css`. The table preserves source ground, ink, secondary text, rail, selection and accent in OKLCH equivalents. Pane and well are derived from these roles; blue denotes selected context and open workload only.

| Token | Light | Dark |
|---|---|---|
| `--ground` | oklch(0.95729 0.00743 260.73) | oklch(0.16560 0.01269 277.51) |
| `--rail` | oklch(0.98501 0.00697 268.55) | oklch(0.19402 0.01620 279.20) |
| `--surface` | oklch(0.997 0.001 265) | oklch(0.222 0.018 274) |
| `--raised` | oklch(0.998 0.001 265) | oklch(0.264 0.026 272) |
| `--well` | oklch(0.965 0.009 265) | oklch(0.204 0.019 273) |
| `--ink` | oklch(0.21411 0.02074 267.68) | oklch(0.96601 0.00624 255.48) |
| `--muted` | oklch(0.47046 0.05877 257.67) | oklch(0.83572 0.02967 259.59) |
| `--accent` | oklch(0.35089 0.24314 264.05) | oklch(0.73151 0.13912 274.33) |
| `--on-accent` | oklch(0.998 0.001 265) | oklch(0.16560 0.01269 277.51) |
| `--selection` | oklch(0.93966 0.02599 276.40) | oklch(0.29704 0.05784 270.34) |
| `--line` | oklch(0.878 0.017 263) | oklch(0.37423 0.04116 262.30) |
| `--control-line` | oklch(0.62574 0.03115 256.53) | oklch(0.615 0.04699 262.06) |

### Typography

- `--font-display: "Public Sans Variable", "Public Sans", system-ui, sans-serif`
- `--font-body: "Manrope Variable", "Manrope", system-ui, sans-serif`
- Source family preference, no font downloads; OS fallback is the normal offline path.
- Scale: `--small` 0.75rem / `--body` 0.9375rem / `--lead` 1.1875rem / `--subhead` 1.5rem / `--title` 1.875rem / `--display` 2.375rem / `--metric` 3rem. Body line-height 1.5; display line-height 1.1. Tabular workload counts, naturally wrapped detail copy.

### Spacing, elevation, and states

- Standard product grid: 4 / 8 / 12 / 16 / 24 / 32 / 48px. Nested radii: 8px controls, 12px wells, 16px working panes. Minimum interactive target: 40px, becomes 44px where needed on touch widths.
- Light elevation: tinted diffuse drop for the workbench, contact shadow underneath the Ticket Lens, solid cool keyline. Dark elevation: progressively lighter opaque planes, top rim highlight, then contact shadow; never rely on black-on-black shadow.
- The same request fixtures drive rows, assignee totals, filter totals, and inspection. Open messages display only the supplied excerpt; resolved requests have no fabricated message, date, or owner. The search has an explicit empty state. No loading/network/error simulation is needed for embedded data.
- Instant keyboard-accessible view changes; no decorative motion. Theme button and view links write combined hashes. A standalone hash controls its named axis; initial default is Inbox and system appearance. Each history entry restores its resolved state.
