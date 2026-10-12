---
name: elicitation
description: "Use when an expert agent self-reviews and self-corrects code after the Execute phase, before sniper validation (BMAD-METHOD elicitation techniques)."
---

<objective>
Elicitation lets an expert agent self-review and self-correct its own work after Execute. In APEX it always runs automatically: the expert selects and names techniques from the catalog, records evidence and unresolved findings, persists the artifact, then hands the claim to challenger before Verify. Manual selection and skip flags cannot bypass this gate.

It sits between Execute and eXamine in the APEX flow, scores itself against an exit threshold (>=90% proceed, 70-89% document gaps, <70% iterate), and persists its findings to `.codex/apex/docs/elicit-{task-slug}.json` so a later pass can diff against prior verdicts instead of restarting.
</objective>

# Elicitation Skill

## Purpose

Enable expert agents to **self-review and self-correct** their code before external validation (sniper). Based on BMAD-METHOD's 75 elicitation techniques.

---

## Execution Mode

After Execute, run this skill in `--auto` mode. Detect the artifact type, select at least one named technique, apply it without asking the user to choose, and record its evidence. Any legacy reference that describes manual or skip behavior is superseded by this top-level contract inside APEX.

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────┐
│              ELICITATION WORKFLOW                       │
│                                                         │
│  Step 0: Init           → Load context                 │
│  Step 1: Analyze Code   → Detect code type             │
│  Step 2: Select         → Choose techniques (or auto)  │
│  Step 3: Apply Review   → Execute techniques           │
│  Step 4: Self-Correct   → Fix own issues               │
│  Step 5: Report         → Artifact before challenger   │
└─────────────────────────────────────────────────────────┘
```

---

## Auto-Detection Matrix

| Code Type Detected | Auto-Selected Techniques |
|--------------------|--------------------------|
| Authentication/Security | Security Audit, OWASP Check, Input Validation |
| API Endpoints | Error Handling, Type Coverage, API Contracts |
| Database/ORM | N+1 Detection, Migration Safety, Data Integrity |
| UI Components | Accessibility, Edge Cases, Loading States |
| Business Logic | SOLID Compliance, Unit Test Coverage, Edge Cases |
| Refactoring | Breaking Changes, Regression Analysis, Backward Compat |
| Performance Critical | Profiling, Memory Analysis, Complexity Check |
| Config/Docs/Plugin files (`.md` agents/skills, `hooks.json`, frontmatter YAML) | CQ-01, DOC-01, INT-01 + validation by the **strictest parser in the consumption chain** (e.g. `js-yaml` strict for frontmatter, `json.tool` for JSON) -- never "looks well-formed" |

---

## Technique Categories (12)

Full catalog: `references/techniques-catalog.md`

1. **Code Quality** (7): Code review, Pattern detection, Complexity analysis...
2. **Security** (7): OWASP audit, Input validation, Auth check...
3. **Performance** (6): Profiling, N+1 detection, Memory analysis...
4. **Architecture** (6): SOLID check, Dependency analysis, Coupling review...
5. **Testing** (6): Edge cases, Boundary testing, Error paths...
6. **Documentation** (6): API review, Comment check, Type coverage...
7. **UX** (6): Accessibility, Error messages, Loading states...
8. **Data** (6): Schema validation, Migration safety, Data integrity...
9. **Concurrency** (6): Race conditions, Deadlock analysis, State sync...
10. **Integration** (7): API contracts, Backward compat, Breaking changes...
11. **Observability** (6): Logging, Metrics, Error tracking...
12. **Maintainability** (6): Readability, Naming, File organization...

**Total: 75 techniques**

---

## Integration with APEX

```
Analyze → Plan → Execute → [eLicit] → challenger → Verify → challenger → eXamine
```

**Benefits:**
- Expert catches own mistakes before sniper
- Faster validation (less sniper corrections)
- Knowledge retention (expert learns from self-review)

---

## Forbidden

- ❌ Skip init step (must load context)
- ❌ Apply techniques without understanding code type
- ❌ Self-correct without documenting changes
- ❌ Report without listing applied techniques
- ❌ Use techniques outside expertise domain
- ❌ Ask the user to select a technique during APEX
- ❌ Honor any flag or legacy reference that skips eLicit, Verify, challenger, or sniper

---

## Exit Criteria (Step 5: Report)

**Score** = techniques applied / techniques selected, weighted by critical category (Security, Architecture).

| Score | Status | Action |
|-------|--------|--------|
| ≥ 90% | 🟢 | Persist evidence, then proceed to challenger |
| 70-89% | 🟡 | Document and escalate gaps, then proceed to challenger |
| < 70% | 🔴 | Iterate and refresh evidence before challenger |

**Self-correction failure**: If a self-correction breaks the code, safely revert only that correction, keep the finding as an unresolved report item, and escalate it. Never use destructive Git or disturb unrelated work.

---

## Artifact Contract

Step 5 persists `.codex/apex/docs/elicit-{task-slug}.json`. The report records inputs, named techniques, findings, corrections, evidence, unresolved items, escalation, and status. Reuse a prior artifact only when its input revision and task scope match the current frozen artifacts; otherwise refresh it. Then send the claim and evidence only to challenger. Verify starts after the challenger report. Full schema: `references/artifact-contract.md`.

---

## Steps Reference

| Step | File | Purpose |
|------|------|---------|
| 0 | `steps/step-00-init.md` | Load context, detect mode, load prior artifact if present |
| 1 | `steps/step-01-analyze-code.md` | Analyze written code |
| 2 | `steps/step-02-select-techniques.md` | Select techniques |
| 3 | `steps/step-03-apply-review.md` | Apply review |
| 4 | `steps/step-04-self-correct.md` | Self-correct |
| 5 | `steps/step-05-report.md` | Generate report, persist `elicit-{task-slug}.json` |
