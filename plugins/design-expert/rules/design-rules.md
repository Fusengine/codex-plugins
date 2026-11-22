# Design Rules (STRICT — NO EXCEPTIONS)

> Forbidden fonts, contrast thresholds, and the screenshot/review procedure are defined
> once in `skills/design-system/SKILL.md` and `skills/design-review/SKILL.md` — this file
> does not restate them. This file = **reusable component-pattern snippets only**, for
> stacks that render actual JSX/Tailwind (React/Next.js) on top of the generated HTML/CSS.

## IDENTITY SYSTEM — PREREQUISITE

1. Check for `design-system.md` in project root or `docs/`.
2. If missing → run `skills/design-system/SKILL.md` first.
3. ALL components reference `design-system.md` tokens — never a default shadcn palette
   without customization.
4. If `design-system.md` specifies fonts different from Clash Display/Satoshi → USE the
   identity fonts.

## FONT VERIFICATION (BLOCKING)

After ANY UI generation:
1. Grep project CSS for font imports — Clash Display/Satoshi or identity fonts
2. If Roboto, Inter, Arial, Open Sans found → BLOCK and fix
3. Verify `@import url()` or `next/font` loads correct fonts

## COMPONENT PATTERNS

### Cards
```tsx
/* NEVER: Flat white card — ALWAYS: Elevated with depth */
<motion.div
  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6
             border border-white/20 shadow-xl shadow-black/5"
  whileHover={{ y: -4, shadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)" }}
>
```

### KPI Cards
```tsx
/* NEVER same visual weight — ALWAYS hierarchy */
<motion.div className="col-span-2 bg-gradient-to-br from-primary to-primary/80 text-white">
  <span className="text-5xl font-display font-bold">26</span>
  <span className="text-white/70">Total Cases</span>
</motion.div>
```

Card limits: Title max 2 lines (`line-clamp-2`), Description max 3 lines, max 1 primary CTA.

### Charts (Recharts)
```tsx
/* NEVER default colors or hex — ALWAYS CSS variables mapped from design-system.md tokens */
<Bar fill="var(--color-primary)" />
<Cell fill={`var(--color-chart-${i + 1})`} />
```

## BUTTONS

Sizing: height 40-60px, padding-x 16-32px, font 16pt (13-20pt range), touch target 44x44px min.

### States (ALL REQUIRED)
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  disabled={isLoading}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? <Spinner /> : "Label"}
</motion.button>
```

Corner radius: pick ONE (`8px` / `12px` / `9999px` pill) — use everywhere. Contrast
threshold: see `skills/design-system/references/contrast-ratios.md` (canonical).

## FORMS

Layout: ALWAYS single column. Exception: first+last name row only.
Field states: Normal → Focus → Completed (check) → Error (red) → Disabled.
Validation: inline on blur, specific messages (NOT "Invalid input").

## ICONS

- Same stroke width, same corner style, one pack. On a web stack the pack is Lucide only
  (never-do N19); Heroicons/Tabler only off web stacks.
- Sizes: `h-4 w-4` (16px dense) · `h-5 w-5` (20px buttons) · `h-6 w-6` (24px standard).

## GRIDS

12-column system: `grid grid-cols-12 gap-6`.
Responsive: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.

## COLOR USAGE — 60-30-10 RULE

60% Background/Surface · 30% Text/Content · 10% Primary/Accent (buttons, CTAs).

## PHOTOS

Resolution: Hero 1920x1080, Cards 800x600, Avatars 256x256 minimum.
Background text: ALWAYS add overlay `bg-gradient-to-t from-black/60 to-transparent`.

## LOADING STATES

- ALWAYS skeleton screens (9-12% faster perceived — NNG), NEVER spinner only.
- Skeleton matches content layout shape, shimmer animation on placeholders.

## MULTI-STACK RULES

| File | Stack | UI Approach |
|------|-------|-------------|
| No framework files | HTML/CSS | Direct HTML/CSS by default; Gemini `create_frontend` optional accelerator |
| `next.config.*` | Next.js | shadcn/ui + Lucide required (codex-rules 05-frontend-rules rule 3; customize, never distort); Gemini Design optional |
| `vite.config.*` | Vite | shadcn/ui + Lucide required (codex-rules 05-frontend-rules rule 3; customize, never distort); Gemini Design optional |
| `astro.config.*` | Astro | shadcn/ui + Lucide required (codex-rules 05-frontend-rules rule 3; customize, never distort); Gemini Design optional |
| `@tanstack/react-start` | TanStack Start | shadcn/ui + Lucide required (codex-rules 05-frontend-rules rule 3; customize, never distort); Gemini Design optional |
| `composer.json` + `artisan` + Inertia React | Laravel + Inertia React | shadcn/ui + Lucide required (codex-rules 05-frontend-rules rule 3; customize, never distort): `npx shadcn@latest init -t laravel` (or `laravel new`, then `npx shadcn@latest init`) |
| `composer.json` + `artisan`, Blade/Livewire | Laravel Blade/Livewire | Livewire Flux / Blade Icons, unchanged |
| `Package.swift` | Swift | SwiftUI visual specs |

### HTML/CSS Standalone
1. Create design-system.md with OKLCH tokens
2. Build Gemini XML blocks (all 7 fields)
3. `create_frontend` → output IS the file, do NOT rewrite
4. `modify_frontend` for corrections

## REDESIGN DETECTION

| User Says | Mode | Behavior |
|---|---|---|
| "overhaul", "redesign", "from scratch" | **FULL** | New `design-system.md` + replace ALL |
| "create a page", "new page" | **PAGE** | Reuse existing `design-system.md` |
| "improve", "adjust", "modify" | **Iteration** | Keep identity, modify targeted |
| "small component", "minor" | **COMPONENT** | No browsing, existing tokens only |

> Scope-to-site-count mapping: see `skills/design-method/SKILL.md` routing table.

## VALIDATION CHECKLIST (component-pattern specific)

Before shipping a component built with this file's patterns:
- [ ] Font imports present (identity or Clash/Satoshi)
- [ ] NO forbidden fonts (Roboto, Inter, Arial, Open Sans)
- [ ] CSS variables in BOTH `:root` AND `.dark` (values come from `design-system.md`)
- [ ] No hard-coded hex/rgb colors
- [ ] Glassmorphism/depth effects (adapted per mode)
- [ ] Framer Motion imported where motion was gated "in" by `skills/design-motion/SKILL.md`
- [ ] Chart colors use CSS variables, never hex
- [ ] Button states (hover, pressed, disabled) all present
- [ ] Form single-column layout
- [ ] Icons same stroke width, same pack
- [ ] 60-30-10 color ratio respected
- [ ] Touch targets 44x44px minimum
- [ ] fuse-browser screenshot LIGHT + DARK modes
- [ ] NO emojis in UI — use icons
- [ ] Professional testimonials (name, role, company, quote, avatar)
- [ ] Consistent spacing, aligned grids, visual rhythm
- [ ] Footer: 4 columns, links, social, legal

> The **canonical** definitions of fonts, contrast thresholds, OKLCH-only and the
> light/dark screenshot pass live in `skills/design-review/SKILL.md`. The blocking items
> restated above are a local pre-check, not a second source of truth — on any divergence,
> `skills/design-review/SKILL.md` wins.
