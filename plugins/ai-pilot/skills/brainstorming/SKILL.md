---
name: brainstorming
description: Use when creating a feature/component or adding functionality. Fires BEFORE APEX Analyze to refine requirements via structured questioning.
---

<objective>
Brainstorming runs a design-first, no-code-before-approval process ahead of any non-trivial feature, component, or behavior change: explore project context, consult documentation afresh for this mandate, ask clarifying questions one at a time, diverge to 6-8 approaches via a named technique before converging on 2-3 with a trade-off table, present the design for explicit approval (unless an owner mandate already settled it), save it to `docs/plans/`, then hand the resulting current-mandate research record to APEX Analyze.

Skip it entirely for trivial fixes, typos, or simple renames -- those go straight to APEX.
</objective>

# Brainstorming Skill

**Design-first approach: no code before design approval (or a settled owner mandate).**

**Authorized mandate:** when the owner has already given a go-ahead or settled the design, skip questions and approval — state assumptions in one line and proceed. Brainstorm and seek approval only for a material unresolved design choice; an owner refinement mid-mandate amends it, it is not a stop.

---

## Agent Workflow (MANDATORY)

Before ANY brainstorming session, spawn agents in parallel, one `spawn_agent` call each:

1. **explore-codebase** - Understand project context, patterns, constraints
2. **research-expert** - Fetch best practices and documentation

After design approval, transition to **APEX Analyze** with the design, local codebase findings, and the research record produced by fresh fuse-browser → Context7 → Exa consultation for this same mandate. Prior or cached research from another mandate may guide queries but cannot replace that record. Sharing the current-mandate record across phases does not require repeating the consultation.

---

## Overview

| Scenario | Action |
|----------|--------|
| **New feature** | Full brainstorming (6 steps) |
| **Major change** | Full brainstorming (6 steps) |
| **Component creation** | Full brainstorming (6 steps) |
| **Trivial fix (1-3 lines)** | Skip brainstorming, go to APEX |
| **Simple rename/typo** | Skip brainstorming, go to APEX |

---

## 6-Step Process

### Step 1: Explore Project Context

Gather context before asking questions:

- `git log --oneline -20` - Recent changes and direction
- Existing code patterns and conventions
- Related documentation and prior decisions
- Tech stack and dependency constraints

### Step 2: Ask Clarifying Questions (ONE AT A TIME)

Ask focused questions sequentially. Wait for each answer before the next (only if no mandate settled the design — see Authorized mandate).

Categories: purpose, constraints, success criteria, users, integrations.

> See [workflow.md](references/workflow.md) for question categories

### Step 3: Diverge, Then Converge to 2-3 Approaches

Generate ≥6-8 distinct approaches via a named technique (SCAMPER / reverse-brainstorming / analogies), judgment suspended — not 3 sizes of the same idea. Only then converge to 2-3 with trade-offs in table format:

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| Option A | ... | ... | ... |
| Option B | ... | ... | ... |
| Option C | ... | ... | ... |

Always include a clear recommendation with rationale.

### Step 4: Present Design for Approval

Break design into digestible sections:

1. Architecture overview
2. Key components and responsibilities
3. Data flow and state management
4. Edge cases and error handling

**Wait for explicit user approval before proceeding, unless the owner's mandate already settled the design.**

### Step 5: Save Design Document

Save approved design to: `docs/plans/YYYY-MM-DD-<topic>-design.md`

### Step 6: Transition to APEX

Hand off to APEX Analyze phase with the approved design as input.

---

## Reference Guide

| Topic | Reference | When to Consult |
|-------|-----------|-----------------|
| **Workflow** | [workflow.md](references/workflow.md) | Question categories, proposal format, design template |
| **Anti-Patterns** | [anti-patterns.md](references/anti-patterns.md) | Catching rationalizations to skip brainstorming |

---

## Quick Reference

```text
   (Steps 2-4 only when no mandate settled the design — see Authorized mandate)
1. Explore   → git log, codebase, docs (agents in parallel)
2. Question  → ONE AT A TIME, wait for answers
3. Diverge   → 6-8 options (named technique), converge to 2-3 with trade-offs table
4. Design    → Present sections, get approval
5. Save      → docs/plans/YYYY-MM-DD-<topic>-design.md
6. Handoff   → APEX Analyze with approved design + fresh current-mandate research record
```

---

## Critical Rules

1. **NEVER write code before design approval** - An owner go-ahead that settles the design counts as approval
2. **Ask questions ONE AT A TIME** - Never dump a list of 10 questions; none when the mandate settled the design
3. **Propose alternatives** - Minimum 2 approaches with trade-offs; under a mandate, one line stating the chosen approach
4. **Save the design doc** - Creates audit trail and shared reference
5. **Get explicit approval** - Only for a material unresolved choice; never re-ask what the mandate settled
