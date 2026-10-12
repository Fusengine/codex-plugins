---
description: Quick Flow for bounded fixes - the full APEX route with Brainstorm skipped and Plan compressed to one task; Analyze trio, delegated execution, eLicit, Verify, challenger and full sniper always run.
argument-hint: "<fix description>"
---

# APEX Quick Flow

Fast-track workflow for simple bug fixes, typos, and minor changes. Same phases, same agents, same gates as full APEX — only Brainstorm is skipped and Plan is compressed to a single task entry. Inspired by BMAD Barry.

---

## When to Use

The shortcut removes only Brainstorm and the multi-task Plan breakdown — Analyze (explore-codebase + research-expert + domain expert), delegated Execute (domain experts, disjoint file lots), eLicit, Verify, challenger, and full sniper eXamine always run in full, exactly as in full APEX. The lead spawns ONE domain-expert agent that makes the edit; the main session never edits inline, even a one-line fix (sole exception: the 2-failed-delegations rule in `$ai-pilot:lead-orchestration` Follow).

✅ **Use APEX Quick:** bounded fixes, typos, minor UI or config changes, documentation updates, and simple refactors.

❌ **Use Full APEX instead:** new features, security or API changes, database migrations, and work that needs a multi-task plan.

---

## Quick Flow Workflow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│         APEX QUICK (Brainstorm skipped, Plan = 1 task)                        │
│                                                                                │
│ ┌─────────┐  ┌──────┐  ┌─────────┐  ┌────────┐  ┌────────┐  ┌─────────┐    │
│ │ ANALYZE │→ │ PLAN │→ │ EXECUTE │→ │ ELICIT │→ │ VERIFY │→ │ EXAMINE │    │
│ └─────────┘  └──────┘  └─────────┘  └────────┘  └────────┘  └─────────┘    │
│      │           │          │            │           │            │         │
│      ▼           ▼          ▼            ▼           ▼            ▼         │
│  explore-     one plan    dependency-  --auto      functional   full       │
│  codebase +   entry       allocated    elicit +   evidence +   sniper     │
│  research +               writers      challenger  challenger   workflow   │
│  domain expert            per lead-orchestration                            │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Total: 6 phases, no Brainstorm, one-task Plan — same agents and gates as full APEX**

---

## Execution

### Step 1: ANALYZE

```
Lead launches, in ONE parallel message (never sequentially):
- fuse-ai-pilot:explore-codebase
- fuse-ai-pilot:research-expert
- the matching domain expert(s) for the stack
This trio always runs, even for a 1-line fix.
PLAN — the lead records ONE `update_plan` entry (files, owner expert, acceptance check) before spawning executors; no multi-task breakdown.
```

### Step 2: EXECUTE

```
The lead spawns ONE domain-expert agent that makes the edit; the main
session never edits inline, even a one-line fix (sole exception: the
2-failed-delegations rule in `$ai-pilot:lead-orchestration` Follow).
Delegated to domain experts on disjoint file lots, per
`$ai-pilot:lead-orchestration`. That canonical skill governs dependency-based
writer allocation, exclusive ownership, mandate and report fields, research
freshness, lifecycle, convergence, and escalation. The lead does not edit (sole exception:
the 2-failed-delegations rule in `$ai-pilot:lead-orchestration` Follow).
Executors preserve existing style and avoid refactoring scope creep.
```

### Step 3: eLicit

```
Each executor runs $ai-pilot:elicitation in --auto mode on its own
lot with a NAMED technique (never left to the user to pick):

| Fix Type | Quick Technique |
|----------|-----------------|
| Bug fix  | TEST-01 (Edge cases) |
| Typo     | DOC-03 (Consistency) |
| Style    | MAINT-02 (Convention) |
| Security | SEC-02 (Validation) |
| Config   | DATA-01 (Schema) |

Then the lead runs the challenger agent (fresh context) on the
findings before reporting. --skip-elicit is ignored (AGENTS.md l.50).
```

### Step 4: VERIFY

```
$ai-pilot:verification checks the functional fix (references ⇔
declarations, executed/functional check) — no shortcutting to a
linter-only pass. Then the lead runs the challenger again before any
done/verified claim reaches the owner.
```

### Step 5: eXAMINE

```
Full sniper (7-phase), never linter-only, run after eLicit +
challenger and Verify + challenger.
```

---

## Example Usage

```bash
/prompts:apex-quick Fix typo in login button text
```

**Lead executes:**
```
1. ANALYZE: explore-codebase + research-expert + domain expert
   (parallel) → LoginButton.tsx:23
2. EXECUTE: one writer for this coupled lot →
   "Logi" → "Login"
3. eLicit: DOC-03 (Consistency) --auto → OK; challenger → CONFIRMED
4. VERIFY: $ai-pilot:verification → OK; challenger → CONFIRMED
5. eXAMINE: full sniper (7-phase) → 0 errors

✅ Done — same gates as full APEX, Brainstorm skipped, Plan = 1 task
```

---

## Comparison

| Aspect | APEX Full | APEX Quick |
|--------|-----------|------------|
| Brainstorm | Yes | Skipped |
| Agents | Analyze trio + dependency-allocated executors | Analyze trio + dependency-allocated executors |
| Phases | 7 (Brainstorm-Analyze-Plan-Execute-eLicit-Verify-eXamine) | 6 (Analyze-Plan(1 task)-Execute-eLicit-Verify-eXamine) |
| Plan tracking (`update_plan`) | Multi-task | Yes, single task |
| Sniper | Full sniper | Full sniper |
| Use case | Features, refactoring | Bounded fixes, typos |

---

## Quick Flow Rules

### DO:
- ✅ Use for bounded fixes (one concern, clear repro) — no size cap: `FUSE_SOLID_MAX_LINES` is the only ceiling (AGENTS.md l.32)
- ✅ Single file preferred
- ✅ Quick self-review
- ✅ Immediate verification

### DON'T:
- ❌ Add features while fixing
- ❌ Refactor surrounding code
- ❌ Skip the review step
- ❌ Use for security changes
- ❌ Skip Analyze, eLicit, Verify, challenger or sniper — `--skip-elicit` is ignored (AGENTS.md l.50)

---

## Output Format

```markdown
## ⚡ APEX Quick Complete

**Task**: {description}
**File**: {file_path}:{line}
**Change**: {summary}

### eLicitation ({technique_id})
- Result: ✅ OK

### Verification
- Linter: ✅ 0 errors
- TypeScript: ✅ OK
- challenger_verdict: {CONFIRMED|REFUTED|UNCERTAIN}
- evidence: {commands_or_artifacts}
- unresolved: {items_or_none}
- escalation: {action_or_none}

**Status**: ✅ Fixed
```

---

## Arguments

- `$ARGUMENTS`: Description of the fix to apply

Example: `/prompts:apex-quick Fix missing null check in handler`
