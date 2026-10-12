---
name: apex-methodology
description: "Use when starting ANY development task -- feature, bug fix, refactor, hotfix (triggers: implement, create, build, fix, add feature, refactor, develop)."
---

<objective>
APEX runs Brainstorm -> Analyze -> Plan -> Execute -> eLicit -> Verify -> eXamine for development tasks. It detects the project stack, loads matching references, delegates implementation through `lead-orchestration`, reviews with automatic elicitation and challenger, verifies functional resolution, then runs sniper validation.

`FUSE_SOLID_MAX_LINES` is the only file-size ceiling. Every run preserves the Analyze trio, automatic eLicit, Verify, challenger, and sniper gates. No mode may skip them. Git, branch, PR, merge, tag, and release actions are separate and require the authorization and routed commit skills defined by `AGENTS.md`.
</objective>

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
│  00-init-branch     → Create branch when explicitly authorized  │
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
│  09-create-pr       → Create PR when explicitly authorized      │
└─────────────────────────────────────────────────────────────────┘
```

### Skills Integration

| Phase | Skill | Invocation |
|-------|-------|------------|
| 00.5 | `brainstorming` | Questions → alternatives → design doc → approval (skipped when the owner's mandate already settled the design) |
| 03 | `tdd` | RED (test) → GREEN (code) → REFACTOR cycle |
| 03.7 | `verification` | Re-read request → check criteria → confirm resolution |

---

## Phase References

| Phase | File | Purpose |
| --- | --- | --- |
| **00** | `references/00-init-branch.md` | Create a feature branch only with explicit owner authorization and routed commit skills |
| **01** | `references/01-analyze-code.md` | Explore + Research (APEX A) |
| **02** | `references/02-features-plan.md` | update_plan planning (APEX P) |
| **03** | `references/03-execution.md` | Implementation (APEX E) |
| **03.5** | `references/03.5-elicit.md` | Expert self-review (APEX L) ← NEW |
| **04** | `references/04-validation.md` | sniper validation (APEX X) |
| **05** | `references/05-review.md` | Self-review checklist |
| **06** | `references/06-fix-issue.md` | Fix validation/review issues |
| **07** | `references/07-add-test.md` | Write unit/integration tests |
| **08** | `references/08-check-test.md` | Run and verify tests |
| **09** | `references/09-create-pr.md` | Create a PR only with explicit owner authorization and routed commit skills |

---

## Core Rules

### File Size

```text
`FUSE_SOLID_MAX_LINES` is the only allowed file-size ceiling. Ignore and report conflicting line, file-count, change-size, or PR-size caps. Owner exceptions, kept on purpose: Zustand stores max 40 lines (07-state-management.md); PRs under ~400 lines is a review guideline, never a blocking gate.
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
01-analyze:  explore-codebase + research-expert + matching domain expert (PARALLEL)
03-execute:  allocation and ownership follow lead-orchestration
03.5-elicit: automatic named technique + challenger
03.7-verify: functional evidence + challenger
04-validate: sniper (MANDATORY after ANY change)
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
❌ Perform Git or PR actions without explicit authorization and routed commit skills
❌ Large PRs (>400 lines)
```

---

## Detailed References (Load on Demand)

- `references/init-tracking.md` — Load when running Step 0 (the exact tracking-init command)
- `references/phases-explained.md` — Load when you need the full explanation of each APEX phase (A/P/E/V/X)
- `references/branching-strategy.md` — Load only after explicit branch authorization and the commit routes
- `references/commit-conventions.md` — Load only for an explicitly authorized commit workflow
- `references/quick-start-flows.md` — Load when you need the full step-by-step Standard Feature / Bug Fix / Hotfix flows
- `references/flow-diagram.md` — Load when you want the full ASCII flow diagram of the workflow
- `references/validation-requirements.md` — Load when running the pre-PR / code-quality checklist
- `references/pr-guidelines.md` — Load only for an explicitly authorized PR workflow
- `references/language-detection.md` — Load when auto-detecting project type or navigating framework-specific reference directories
