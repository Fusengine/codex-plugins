---
name: taste-first
description: "Autonomous art-direction workflow for brand register generate and redesign moves. Use when: creating or rebuilding a brand/marketing surface from a sufficient brief and real assets. Do NOT use for: product UI, audits, refinement moves, or mobile product mockups."
---

# Taste First

This is the sole creative authority for `register: brand` combined with `move: generate`
or `move: redesign`. One named art director owns the complete chain:
thesis, asset transformation, desktop/mobile first frames, and implementation.
The owner's latest verdict is ground truth. An owner rejection immediately invalidates
any earlier `PASS`; record it as `BLOCK` and failure without defending or rationalizing it.

## Enter the lane

1. Confirm both route labels. Owner labels are ground truth.
2. If the register is not `brand`, or the move is not `generate`/`redesign`, stop and
   return to `design-method`.
3. Create `.harness/apex/taste-first.json` as the first task artifact:

```json
{
  "lane": "taste-first",
  "register": "brand",
  "move": "generate",
  "firstFrameLocked": false,
  "active": true,
  "ownerAgentId": "<current design agent id>"
}
```

Use `"redesign"` when applicable. The marker activates the deterministic hook bypass for
obsolete pre-lock inspiration, design-system, Gemini, and legacy design-skill gates. Read
the current design agent id from the runtime context or active-agent state; never guess or
reuse an id from another task.
4. Read the supplied brief, owner constraints, existing surface for redesign, and every
   supplied asset. When these inputs define the audience, objective, content, and
   constraints, begin without a questionnaire. Ask one question only when a missing fact
   would materially change the result.
5. Before the first frame is locked, do not load sibling creative workflows, pattern
   banks, design-system defaults, inspiration quotas, or move procedures. They cannot
   steer this lane.
6. **Exception, MUST read before the first frame:** `../design-method/references/never-do.md`.
   It is a list of errors to avoid (N1-N18), not a creative workflow, so it does not steer
   the thesis; it binds this lane exactly as it binds `design-method`. The sections it
   points to (AI-slop clusters, type scale) are opened only to check a suspected hit,
   never to pick a direction. Record the reference
   bar it defines (two best-in-class references of the same domain and function, or the
   owner-named one) now; it is used only at Promotion Checkpoint 2.

## Art-direction work

Write one positive visual thesis that states the intended experience and the compositional
logic. It is a working instruction for the art director, not a menu for the owner.

Name the single dominant visual device before rendering and complete one working line:
`Dominant device: [device]; it earns its area and complexity by [specific gain].`
This is not a choice menu, candidate comparison, or additional checkpoint.

Transform the real assets into the visual system. If placing a rectangular image in a
rectangle produces a flat result, materially transform it through one or more of:
crop, mask, segmentation, cutout, composite, depth planes, or connective material that
crosses asset and layout boundaries. Opacity changes and gradients alone do not count as
material transformation.

Render actual desktop and mobile first frames. They must demonstrate the thesis with real
assets and representative copy. A text description, wireframe, moodboard, or component
inventory is not first-frame evidence.

## Promotion Checkpoint 1: absolute first-frame evidence

Present the desktop and mobile first frames against absolute criteria:

- the unchanged owner brief and explicit constraints are visibly honored;
- the thesis is legible without an explanation;
- real assets are structurally integrated, not merely placed;
- desktop and mobile are intentional compositions, not one scaled layout;
- the dominant device passes the visual-cost test: it earns its area and complexity by
  improving hierarchy, brand meaning, and emotional authority. Mentally remove or
  simplify it; if the composition becomes more premium, legible, or distinctive, `BLOCK`;
- primary identity and copy remain composed and legible. Deliberate cropping may create
  tension, but it cannot read as accidentally clipped, broken, or dependent on layout
  overflow. Mobile must not use clipping as a substitute for composition;
- boldness feels inevitable to the thesis rather than detachable novelty. Technical or
  material transformation alone does not make a dominant device earned;
- no supplied owner label is contradicted.

The mandatory `challenger` is the independent critic inside this checkpoint. It receives
only the owner brief, explicit constraints, source assets, anonymous
first-frame renders, and the criteria above. It returns exactly `PASS` or `BLOCK`, with no
creative rationale: it may cite only observed evidence. It never receives self-audit,
move report, or implementation details, and it never proposes a direction.
When retesting a category the owner previously rejected, also provide the owner's latest
verdict, stripped of rationale or replacement direction.

On `BLOCK`, the art director revises the same owned concept or replaces it when the thesis
itself failed. The owner may override the verdict or any criterion. On `PASS` or owner
override, set `firstFrameLocked` to `true` in the marker and freeze the concept.

## Implementation

Implement the locked frames faithfully. After lock, load only the platform and technical
skills required to build and validate the surface. Existing tokens may constrain code
when the owner marked them as fixed; otherwise derive implementation tokens from the
locked frames.

Technical checks may correct accessibility, responsiveness, performance, semantics, code
quality, and browser defects. They may not restyle the concept, introduce a new visual
device, replace the asset treatment, or reopen art direction. A conflict between technical
compliance and the lock returns to the art director or owner for a bounded decision.

## Promotion Checkpoint 2: fidelity and technical validation

Compare rendered desktop/mobile implementation screenshots with the locked first frames,
then run the repository's required technical checks. Promotion requires:

- no material regression in composition, hierarchy, typography, color, asset treatment,
  spacing, or responsive intent;
- owner constraints remain intact;
- accessibility, responsive behavior, runtime, console, lint, typecheck, tests, and build
  pass where applicable;
- no never-do hit at P0/P1 (`../design-method/references/never-do.md`), light and dark
  captures both designed and distinct unless the owner locked one theme;
- the reference bar: build and references captured at the same viewports, compared section
  by section; any `worse` section is a `BLOCK`;
- remaining limitations are explicitly owner-accepted.

The mandatory `challenger` is the independent visual critic inside this checkpoint. It
receives only the owner brief, constraints, locked frames, final renders, the reference-bar
captures at the same viewports, and fidelity criteria. When retesting a previously owner-rejected category, it also receives the
owner's latest verdict without rationale or replacement direction. A separate technical
validator receives only the implementation and technical evidence it needs. Each returns
`PASS` or `BLOCK` and may cite only observed evidence; neither receives rationale or
co-designs. The owner may override. Report completion only after a pass or explicit owner
override. Then set `active` to `false` in the marker so later unrelated design tasks
cannot inherit the bypass. Subagent cleanup also deactivates an active owned marker when
the task stops before this update.

## Failure handling

- Missing or unreadable required asset: stop and identify the exact asset.
- First-frame rendering unavailable: report blocked; prose is not substitute evidence.
- Optional design tool unavailable: implement directly.
- Technical check conflicts with the lock: preserve the lock and escalate the narrow
  conflict.

## Forbidden

- No mandatory four-question brief when inputs are sufficient.
- No mandatory signature element, widget, focal quota, hero quota, pattern quota,
  competitor-lift test, lookalike test, or copy self-audit as an independent gate.
  Reconciliation: the intent of this ban (never copy or anti-copy a reference's
  structure or look) stays whole. The reference bar is not a lift or lookalike test: it is
  a quality floor ("is each section at least as good as the best real product of this
  function?"), required in this lane and run inside Promotion Checkpoint 2, never at
  Checkpoint 1 and never as a design source (`../design-method/references/never-do.md`
  §Reconciliation).
- No candidate tournament, ablation, relative winner, or committee selection.
- No critic rationale, replacement direction, style prescription, or shared authorship.
- No additional promotion stage beyond the two defined here.
- No technical restyling after concept lock.
