---
description: Quick Flow for a trivial 1-3 line change - one delegated domain expert locates, fixes, self-reviews and proves it with a real functional check; the lead verifies on disk and runs full sniper.
argument-hint: "<fix description>"
---

# APEX Quick Flow

Fast-track workflow for a trivial 1-3 line change (typo, one-line bug fix, config value). No team, no handoffs between agents. It skips Brainstorm, the Analyze trio and the team split — never eLicit, the functional check, or sniper.

A trivial 1-3 line change runs here with one delegated domain expert: no Brainstorm, no Analyze trio, no team split; eLicit, a real functional check, and sniper still run.

**The main session never edits.** It spawns ONE domain-expert agent (the Project Detection expert for the stack) with a self-contained brief, per `$ai-pilot:lead-orchestration`; that agent locates, applies the minimal change, reviews and validates. The main session only briefs, verifies the result on disk, and runs sniper (sole exception to "never edits": the 2-failed-delegations rule in `$ai-pilot:lead-orchestration` Follow).

---

## When to Use

Scope rule (owner decision 2026-11-08): read-only question → `explore-codebase` alone; anything that touches code beyond a trivial 1-3 line change → full APEX (`/prompts:apex`) with the Analyze trio (`explore-codebase` + `research-expert` + the domain expert) in one parallel message; one agent per task; at most 6 agents concurrently — a ceiling, never a minimum.

✅ **Use APEX Quick (trivial 1-3 line change only):**
- Typo fixes
- Single-line bug fixes
- A local rename touching 1-3 lines
- A one-value UI tweak (text, class, token)
- A config value change
- A short documentation fix

❌ **Use Full APEX instead:** new features, security or API changes, database migrations, anything larger than 1-3 lines, and work that needs a multi-task plan.

---

## Quick Flow Workflow

```
┌─────────────────────────────────────────────────────────┐
│              APEX QUICK (one delegated expert)          │
│                                                         │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌────────┐ │
│  │ LOCATE  │ → │   FIX   │ → │ ELICIT  │ → │ VERIFY │ │
│  └─────────┘   └─────────┘   └─────────┘   └────────┘ │
│      │             │             │             │       │
│      ▼             ▼             ▼             ▼       │
│   Find file     Apply        1 quick      Run tests   │
│   + line        minimal      technique    or run it   │
│                 change       (--auto)                  │
└─────────────────────────────────────────────────────────┘
          then the lead: verify on disk → full sniper
```

---

## Execution

### Step 1: LOCATE

```
The delegated expert finds the file and line (grep / read).
More than 1-3 lines, or the cause is unclear → stop and report:
the lead reroutes to full APEX.
```

### Step 2: FIX

```
Minimal change only. Preserve existing style; no refactoring,
no scope creep.
```

### Step 3: eLicit

```
The expert runs $ai-pilot:elicitation in --auto mode with ONE named
quick technique (never left to the user to pick):

| Fix Type | Quick Technique |
|----------|-----------------|
| Bug fix  | TEST-01 (Edge cases) |
| Typo     | DOC-03 (Consistency) |
| Style    | MAINT-02 (Convention) |
| Security | SEC-02 (Validation) |
| Config   | DATA-01 (Schema) |

--skip-elicit is ignored. The challenger is not required for the
trivial change itself (it is proven by the real check below); it runs
as soon as the change turns out consequential or a root-cause claim
is made.
```

### Step 4: VERIFY

```
Real functional check per $ai-pilot:verification (executed, never
linter-only):
- Run the tests covering the changed code, or run the build / the
  program / the page and observe the corrected behaviour
- Report the command + its output (or screenshot path) as proof
- Linter / type check on the changed file(s) too, but they are not the proof
Same challenger rule as Step 3: required only if the change is
consequential.
```

Then the main session verifies on disk and runs sniper (full, never skipped).

---

## Example Usage

```bash
/prompts:apex-quick Fix typo in login button text
```

**Delegated expert executes:**
```
1. LOCATE: Grep "login" → Found LoginButton.tsx:23
2. FIX: Change "Logi" → "Login"
3. eLicit: DOC-03 (Consistency) --auto → OK
4. VERIFY: bun test LoginButton → pass; rendered button reads "Login"
```

**Lead:** diff on disk matches the report → full sniper → 0 errors.

✅ Done in single pass

---

## Comparison

| Aspect | APEX Full | APEX Quick |
|--------|-----------|------------|
| Scope | Anything touching code | Trivial 1-3 line change |
| Agents | Analyze trio + one agent per task (≤ 6 concurrent) | 1 delegated expert (lead never edits) |
| Phases | Brainstorm-Analyze-Plan-Execute-eLicit-Verify-eXamine | Locate-Fix-eLicit-Verify, then sniper |
| Plan tracking (`update_plan`) | Multi-task | No |
| Verify | Full verification skill + challenger | Real functional check (tests or run) |
| Sniper | Full | Full (run by the main session) |

---

## Quick Flow Rules

### DO:
- ✅ Use for a trivial 1-3 line change; anything larger → full APEX
- ✅ Single file preferred
- ✅ Quick self-review
- ✅ Immediate verification

### DON'T:
- ❌ Add features while fixing
- ❌ Refactor surrounding code
- ❌ Skip the review step
- ❌ Use for security changes
- ❌ Skip eLicit, the functional check or sniper — `--skip-elicit` is ignored

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
- Functional check: {command run} → {observed output}
- Linter / types: ✅ 0 errors
- unresolved: {items_or_none}
- escalation: {action_or_none}

**Status**: ✅ Fixed
```

---

## Arguments

- `$ARGUMENTS`: Description of the fix to apply

Example: `/prompts:apex-quick Fix missing null check in handler`
