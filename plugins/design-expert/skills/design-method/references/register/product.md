---
name: register-product
description: "Direction for register `product` (dashboard, app, utility tool) — density/predictability/discreet-motion standards, and the anti-generic floor that still applies: the Domain-Specificity Floor and the product furniture anti-pattern list."
---

# Register: Product — Density Over Drama, Never Interchangeable

Gate 0 exempts `product` from Signature Dominance and the Focal-Block Floor — a dashboard
doesn't need one dominant hero block, equal-weight density is correct there. That
exemption is about *layout hierarchy*, not a license to ship generic demo furniture. A
settings page or a KPI panel can be exactly as interchangeable as a bad marketing hero;
this file is the floor that keeps product surfaces domain-specific while staying dense,
predictable, and quiet.

## 1. Standards (opposite of `brand`, by design)

- **Density**: Enterprise Dense / Standard profile
  (`design-system/references/spacing-density.md`) — tight component padding, small gaps,
  more content per viewport. A product screen with brand-register whitespace is wrong here,
  not "generous."
- **Predictability**: consistent interaction patterns across the app — the same table
  sorts the same way everywhere, the same modal pattern for every confirm action. Novelty
  for its own sake is a cost in product register, not a virtue; save it for the one place
  (§3) where distinctiveness is actually required.
- **Motion**: discreet by default — `MOTION_INTENSITY ≤ 4` (`design-motion/references/motion-performance.md`).
  Motion here is state feedback (a row appearing, a toast, a loading skeleton), never
  decorative entrance choreography. If a product surface wants `MOTION_INTENSITY > 4`,
  that needs the same explicit justification `brand.md` §2 requires of its furniture —
  not a silent default either way.

## 2. The Anti-Generic Floor (still applies here)

"Dense and predictable" is not an exemption from having a point of view — it's a
different register of the same requirement. A dashboard that could be re-skinned with any
other SaaS product's logo and ship unnoticed has failed the same way a generic marketing
body fails; it's just failed quietly instead of loudly.

**Domain-Specificity Floor** — the product-register version of `brand.md`'s Competitor
Lift Test: for every data-bearing surface (KPI panel, table, empty state, settings group,
nav), ask *"if this surface's copy, icons, and grouping were dropped unedited into an
unrelated product in the same category, would it look native there?"* If yes, it's
furniture, not product design — the surface carries no trace of what this specific product
actually does, for whom, with what real entities.

## 3. Product Furniture (default reach, justify or replace)

| Furniture | Default (generic) form | Fix |
|---|---|---|
| **Generic KPI ribbon** | 4 cards: "Total Users / Revenue / Growth / Active", arrow-up icon, no context | use the product's real entities and the metric that actually matters to this user role first — not a demo-template quartet picked for symmetry |
| **Marketing triad reused in-app** | the 3-feature-card block from the landing page pasted into the app shell (onboarding, empty states) | write for the state the user is actually in — what to do next with THIS data, not a restated value prop |
| **Cookie-cutter empty state** | centered icon + "No data yet" + generic "Get started" CTA, identical across every list/table in the app | name the actual object type and the actual first action ("No invoices yet — create one from a quote" beats "No data yet") |
| **Undifferentiated settings list** | a flat list of `Switch` rows with no grouping logic, generic labels ("Notifications", "Preferences") | group by the domain's real concerns, label with the actual behavior each toggle controls |
| **Generic nav vocabulary** | sidebar reading `Dashboard / Analytics / Settings / Team` with zero product-specific terms | use the product's actual object names where they exist (e.g. "Deals" not "Records", "Shipments" not "Items") |

Same rule as `brand.md` §2: none of these are permanently banned — each is a decision,
stated in the Pass 1 plan, not a default reached by omission.

## 4. What Stays Exempt

Signature Dominance and the Focal-Block Floor genuinely do not apply here (Gate 0,
`design-web/references/layout-discipline.md` rule 9) — a product screen is allowed, and
usually correct, to have several equal-weight blocks with no single dominant focal
element. Do not import brand-register expressiveness requirements (§4 of `brand.md`) into
product work; the floor here is domain-specificity, not visual drama. **One exception: a
single-purpose tool keeps a dominant primary action (§5).**

## 5. Single-Purpose Tools and Data Results (not exempt)

A public single-purpose tool (checker, converter, lookup, calculator) is `product`, but the
§4 exemption does not apply to its primary action. Canonical errors and checks:
`../never-do.md` N1-N4, N9-N10.

- **Primary action dominant** — the input or command bar is the focal block of the first
  screen (largest and highest contrast under the Squint test). The headline is a short
  value line, never a category slogan larger than the input (N2).
- **Output-first** — a result leads with the answer to the user's question. For a
  comparative or multi-source result: verdict first (agree / diverge / partial), sources
  grouped by identical answer, values sorted stably, the outlier marked, per-source detail
  on demand (N1).
- **Pre-use state shows the output** — the real result component, populated with a live or
  clearly labelled sample, before the first input. Naming the object and the first action
  (§3 empty state) is necessary, not sufficient, for a data surface (N4).
- **Visuals carry data** — a map/chart earns its area only by encoding the current result
  (N3). **States** stream per source: pending → answered / failed, inside the result
  component (N9). **Mobile** is composed, not shrunk (N10).
