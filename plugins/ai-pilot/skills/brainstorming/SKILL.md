---
name: brainstorming
description: Use when creating a feature/component or adding functionality (design mode, fires before or alongside APEX Analyze), or when asked to analyse / improve an existing project (ideas mode, 3 grounded suggestions).
---

<objective>
Brainstorming has two modes. **Design mode** runs a design-first, no-code-before-approval process ahead of any non-trivial feature, component, or behavior change: explore project context, consult documentation afresh for this mandate, frame the problem (open points become explicit assumptions or go to the lead), diverge to 6-8 approaches via a named technique before converging on 2-3 with a trade-off table, present the design for approval through the lead (unless an owner mandate already settled it), save it to `docs/plans/`, then hand the resulting current-mandate research record to APEX Analyze.

**Ideas mode** analyses an existing project and proposes its 3 best grounded, coherent improvements as `Suggestion:` lines (format owned by rule 08 "Executing the Brief"), saved to `docs/plans/` -- it never builds anything.

Skip it entirely for trivial fixes, typos, or simple renames -- those go straight to APEX.
</objective>

# Brainstorming Skill

**Design-first approach: no code before design approval (or a settled owner mandate).**

**Authorized mandate:** when the owner has already given a go-ahead or settled the design, skip questions and approval — state assumptions in one line and proceed. Brainstorm and seek approval only for a material unresolved design choice; an owner refinement mid-mandate amends it, it is not a stop.

---

## Agent Workflow (MANDATORY)

Before ANY brainstorming session, spawn agents in parallel (one turn), one `spawn_agent` call each, when the depth limit allows (`agents.max_depth`):

1. **explore-codebase** - Understand project context, patterns, constraints
2. **research-expert** - Fetch best practices and documentation

If the brief already carries their current-mandate findings, reuse them -- do not relaunch. When the depth limit forbids spawning, explore with your own read/grep and research through fuse-browser → Context7 → Exa yourself. The only other agent allowed is **challenger**, once, on the chosen approach (design mode) or the top 3 ideas (ideas mode); when you cannot spawn it, ask `/root` for that pass in your report.

**Questions go to the lead, never to the owner.** Open points are decided from the evidence and written as explicit assumptions; only a point that changes the design and cannot be inferred becomes ONE binary question to the lead (`/root`) via `send_message` (rule 08); the lead escalates at most one binary question to the owner. Under a settled mandate (see Authorized mandate), no question at all.

After design approval, transition to **APEX Analyze** with the design, local codebase findings, and the research record produced by fresh fuse-browser → Context7 → Exa consultation for this same mandate. Prior or cached research from another mandate may guide queries but cannot replace that record. Sharing the current-mandate record across phases does not require repeating the consultation.

---

## Overview

| Scenario | Action |
|----------|--------|
| **"Analyse / improve this project", new ideas** | Ideas mode |
| **New feature** | Full brainstorming (6 steps) |
| **Major change** | Full brainstorming (6 steps) |
| **Component creation** | Full brainstorming (6 steps) |
| **Trivial fix (1-3 lines)** | Skip brainstorming, go to APEX |
| **Simple rename/typo** | Skip brainstorming, go to APEX |

---

## 6-Step Process (design mode)

### Step 1: Explore Project Context

Gather context before framing:

- `git log --oneline -20` - Recent changes and direction
- Existing code patterns and conventions
- Related documentation and prior decisions (`docs/decisions.md`)
- Tech stack and dependency constraints

### Step 2: Frame and Resolve Open Points

Frame the problem and its measurable success criteria (skip when a mandate settled the design — see Authorized mandate). Resolve each open point from the evidence (code, `docs/decisions.md`, brief) and write it as an explicit assumption; only a point that changes the design and cannot be inferred becomes ONE binary question to the lead via `send_message`. Never a series of questions to the owner.

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

**Approval comes through the lead** (who relays to the owner when needed): report the design and its assumptions to the lead before any code is written, unless the owner's mandate already settled the design.

### Step 5: Save Design Document

Save the design to: `docs/plans/YYYY-MM-DD-<topic>-design.md` (`Status: Draft` until the lead approves, then `Approved`). A read-only agent returns the document to the lead, who persists it.

### Step 6: Transition to APEX

Hand off to APEX Analyze phase with the approved design as input.

---

## Ideas Mode

Input: a project path plus any explore/research findings the lead passes.

1. **Coherence** -- read `docs/decisions.md`, `MEMORY/LESSON.md`, `git log --oneline -30`; drop any idea that contradicts a recorded decision or repeats a lesson's mistake.
2. **Explore** -- helpers above, unless the brief carries their findings.
3. **Diverge** -- 6-8 ideas through a named technique (SCAMPER on the main flows, reverse brainstorming, analogies with comparable tools).
4. **Converge** -- top 3 by gain / cost; each grounded: it does not exist yet (file:line of the closest existing code) and every API it relies on is real (doc URL fetched).
5. **Challenge** -- **challenger** once on the top 3; drop or fix any REFUTED idea.
6. **Save** -- `docs/plans/YYYY-MM-DD-<topic>-ideas.md` (returned to the lead for persistence by a read-only agent), short:

```markdown
# <Project> - Ideas (YYYY-MM-DD)
Technique: <name> -- inputs read: <decisions / lessons / git log / explore / research>
## Top 3
1. Suggestion: <idea> → gain: <concrete benefit> -- cost: S/M/L -- risk: <one line>
   Evidence: missing at <file:line>; API: <doc URL>
## Also considered
- <idea> -- dropped because <reason>
## Assumptions
- <assumption made instead of asking>
```

The same 3 `Suggestion:` lines go into the report. Nothing is built.

---

## Reference Guide

| Topic | Reference | When to Consult |
|-------|-----------|-----------------|
| **Workflow** | [workflow.md](references/workflow.md) | Question categories, proposal format, design template |
| **Anti-Patterns** | [anti-patterns.md](references/anti-patterns.md) | Catching rationalizations to skip brainstorming |

---

## Quick Reference

```text
Design mode:
   (Steps 2-4 only when no mandate settled the design — see Authorized mandate)
1. Explore   → git log, codebase, docs (agents in parallel, or reuse brief findings)
2. Frame     → problem + success criteria; open points = assumptions or one binary question to the lead
3. Diverge   → 6-8 options (named technique), converge to 2-3 with trade-offs table
4. Design    → Present sections, approval through the lead
5. Save      → docs/plans/YYYY-MM-DD-<topic>-design.md
6. Handoff   → APEX Analyze with approved design + fresh current-mandate research record

Ideas mode:
coherence → explore → diverge 6-8 → top 3 grounded → challenger → docs/plans/YYYY-MM-DD-<topic>-ideas.md
```

---

## Critical Rules

1. **NEVER write code before design approval** - An owner go-ahead that settles the design counts as approval; ideas mode never builds
2. **Never question the owner** - Open points become explicit assumptions or one binary question to the lead; none when the mandate settled the design
3. **Propose alternatives** - Minimum 2 approaches with trade-offs; under a mandate, one line stating the chosen approach
4. **Save the doc** - Design or ideas doc in `docs/plans/`: audit trail and shared reference
5. **Get explicit approval** - Through the lead, only for a material unresolved choice; never re-ask what the mandate settled
6. **Grounded or dropped** - Every suggestion carries file:line evidence and a verified doc URL
