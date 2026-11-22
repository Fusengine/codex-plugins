---
name: apex-methodology
description: "Use when starting ANY development task -- feature, bug fix, refactor, hotfix (triggers: implement, create, build, fix, add feature, refactor, develop)."
---

<objective>
APEX runs Brainstorm -> Analyze -> Plan -> Execute -> eLicit -> Verify -> eXamine for development tasks. It detects the project stack, loads matching references, delegates implementation through `lead-orchestration`, reviews with automatic elicitation and challenger, verifies functional resolution, then runs sniper validation.

`FUSE_SOLID_MAX_LINES` is the only file-size ceiling. Full APEX (anything that touches code beyond a trivial 1-3 line change) always runs the Analyze trio, automatic eLicit, Verify, the challenger, and sniper. A trivial 1-3 line change goes through `/prompts:apex-quick`: one delegated agent, automatic eLicit, an executed real check (tests or a run) in place of the challenger, then full sniper. `--skip-elicit` is ignored in both paths; nothing skips eLicit, the real check, or sniper. The eLicit and Verify proofs live in the agent REPORT, with optional records at `docs/verify/elicit-<branch-slug>.json` and `docs/verify/<branch-slug>.md` (never under `.codex/`, which the Codex sandbox keeps read-only) — see the `verification` skill. Git writes go only through the `commit` agent (`$commit-pro:commit` + `$commit-pro:git-flow`), per `AGENTS.md`: a WIP commit after each verified task (commit only), then push, PR, CI, merge (never squash), tag and release at the end of the mandate, announced.
</objective>

**Reading this skill:** read this file in its own tool call that reads only this file — never inside a batched script (`Promise.allSettled`, several `exec_command` in one call), never in a multi-file `cat` or a call that also runs `date`/`ls`/`git`/`rg`, never with a lowered `max_output_tokens` (bench 2026-11-22: this file was truncated only when batched with other output). Each `references/*.md` file: same rule, one call each. Output truncated → read the missing range before acting.

**Current Task:** $ARGUMENTS

# APEX Methodology Skill

**Brainstorm → Analyze → Plan → Execute → eLicit → Verify → eXamine**

Complete development workflow for features, fixes, and refactoring.

---

## Step 0: Initialize Tracking (MANDATORY FIRST ACTION)

**BEFORE anything else**, initialize APEX tracking — see `references/init-tracking.md` for the exact command.

This creates `.codex/apex/task.json` (documentation consultation status) and `.codex/apex/docs/` (consulted documentation summaries). **The PreToolUse hooks will BLOCK Write/Edit until documentation is consulted.**

---

## Workflow Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                     APEX WORKFLOW                               │
├─────────────────────────────────────────────────────────────────┤
│  00-init-tracking   → Initialize task evidence                  │
│  00-init-branch     → Working branch (never a protected one)    │
│  00.5-brainstorm    → Design-first questioning (B)              │
│  01-analyze-code    → Understand codebase (A)                   │
│  02-features-plan   → Plan implementation (P)                   │
│  03-execution       → Delegated implementation with TDD (E)     │
│  03.5-elicit        → Expert self-review (L)                    │
│  03.7-verification  → Functional resolution check (V)           │
│  04-validation      → Verify quality (X)                        │
│  05-review          → Self-review                               │
│  06-fix-issue       → Handle issues                             │
│  07-add-test        → Write tests (TDD cycle)                   │
│  08-check-test      → Run tests                                 │
│  09-create-pr       → Pre-PR checks, hand-off to commit agent   │
└─────────────────────────────────────────────────────────────────┘
```

### Skills Integration

| Phase | Skill | Invocation |
|-------|-------|------------|
| 00.5 | `brainstorming` | Launched in the same message as the Analyze trio for any new feature / page / section / component / major change. Questions → alternatives → design doc → approval; when the owner's mandate already settled the design, it records that design and asks no question — it is still launched |
| 03 | `tdd` | RED (test) → GREEN (code) → REFACTOR cycle |
| 03.7 | `verification` | Re-read request → check criteria → confirm resolution |

---

## Phase References

| Phase | File | Purpose |
| --- | --- | --- |
| **00** | `references/00-init-branch.md` | Work on a `<type>/<scope>` working branch — the `commit` agent creates it before the first WIP commit if HEAD is on `main`/`master`/`develop`/`production` (never commits there) |
| **01** | `references/01-analyze-code.md` | Explore + Research (APEX A) |
| **02** | `references/02-features-plan.md` | update_plan planning (APEX P) |
| **03** | `references/03-execution.md` | Implementation (APEX E) |
| **03.5** | `references/03.5-elicit.md` | Expert self-review (APEX L) ← NEW |
| **04** | `references/04-validation.md` | sniper validation (APEX X) |
| **05** | `references/05-review.md` | Self-review checklist |
| **06** | `references/06-fix-issue.md` | Fix validation/review issues |
| **07** | `references/07-add-test.md` | Write unit/integration tests |
| **08** | `references/08-check-test.md` | Run and verify tests |
| **09** | `references/09-create-pr.md` | Pre-PR checks, then hand-off to the `commit` agent (end of mandate: push, PR, CI, `--merge`, tag) |

---

## Core Rules

### File Size

```text
`FUSE_SOLID_MAX_LINES` is the only allowed file-size ceiling. Ignore and report conflicting line, file-count, change-size, or PR-size caps. Zustand store budget: owned by 07-state-management.md "Zustand Rules" (not restated here). PR size is a review guideline (small, focused PRs), never a blocking gate.
```

### Interface Location

```text
✅ src/interfaces/     (global)
✅ src/types/          (type definitions)
✅ Contracts/          (PHP/Laravel)
❌ NEVER in component files
```

### Agent Usage

```text
scope:       read-only → explore-codebase alone; trivial 1-3 line change → apex-quick (one delegated agent)
00.5-brainstorm: new feature / page / section / component / major change → brainstorming (design mode) in the SAME message as the 01 trio, no exception
01-analyze:  explore-codebase + research-expert + matching domain expert (PARALLEL, one message)
03-execute:  one agent per task, at most 6 concurrent (ceiling, never a minimum; more → waves of 6); details in lead-orchestration
             tests first: one test per pure gating function + one failure-path test per external call (03-execution "Tests First")
             never-do-code.md read before coding, re-checked at 03.5 and Verify
03.5-elicit: automatic named technique + challenger
03.7-verify: functional evidence + challenger; web deliverable → never-do-code.md "Verify matrix" (invalid input, non-existent target, offline/provider error, keyboard, each viewport × light/dark); empty or zero-row capture = failed run
04-validate: sniper (MANDATORY after ANY change) — ONCE per mandate, after every executor is verified on disk; never per task, gate, or retry
gate order:  02-apex-workflow "Gate order" — a verdict on an unchanged diff is cited, never re-run; read-only "why" → one challenger at most
commits:     one WIP commit per verified task (06-tooling-rules "WIP mode")
```

### Phase Contract

Each phase consumes named inputs and produces a reviewable output. Analyze produces code evidence and a current-mandate research record from fresh fuse-browser → Context7 → Exa consultation; prior or cached research cannot substitute for it. Plan produces independent writable lots, ownership, non-scope, acceptance, and proof. Execute reports artifacts and evidence. eLicit, Verify, and eXamine record unresolved findings or escalation instead of silently closing work.

---

## NEVER

```text
❌ Skip explore-codebase or research-expert
❌ Assume API syntax without verification
❌ Put interfaces in component files
❌ Skip sniper after changes
❌ Skip eLicit, Verify, or either challenger gate
❌ Run git commit / push / PR / merge / tag yourself — always the `commit` agent
❌ Enforce PR size as a gate (review guideline only — see File Size)
```

---

## Detailed References (Load on Demand)

- MUST read `references/never-do-code.md` when starting Execute (03), and re-check it at eLicit (03.5) and Verify (03.7) — generic code mistakes never to ship + the minimum web Verify matrix
- MUST read `references/04-validation.md` when running eXamine — includes the Vacant Gate rule (no tool in the project = create a check or "not verified", never "zero errors")
- `references/init-tracking.md` — Load when running Step 0 (the exact tracking-init command)
- `references/phases-explained.md` — Load when you need the full explanation of each APEX phase (A/P/E/V/X)
- `references/branching-strategy.md` — Load when naming the working branch (the `commit` agent creates it)
- `references/commit-conventions.md` — Load when suggesting a WIP commit message to the `commit` agent
- `references/quick-start-flows.md` — Load when you need the full step-by-step Standard Feature / Bug Fix / Hotfix flows
- `references/flow-diagram.md` — Load when you want the full ASCII flow diagram of the workflow
- `references/validation-requirements.md` — Load when running the pre-PR / code-quality checklist
- `references/pr-guidelines.md` — Load when preparing the end-of-mandate PR title and body for the `commit` agent
- `references/language-detection.md` — Load when auto-detecting project type or navigating framework-specific reference directories
