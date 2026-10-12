---
name: brief-template
description: Copy-paste mandate skeleton the lead fills before every delegation
when-to-use: Step 3 of lead-orchestration, before any spawn_agent, followup_task, or external executor launch
keywords: brief, mandate, delegation, ownership, guardrails, report format
priority: high
related: worked-examples.md
---

# Brief Template

## Why

A brief summarised from memory drifts from the owner's request: parts get dropped, negative constraints vanish, paths get invented. The template forces the owner's exact words, the task with the files it owns, and the proof into the mandate, so the agent is judged on disk instead of on its own summary. The field list it fills is defined once in `SKILL.md` step 3.

## Template

```markdown
## Owner corrections (verbatim)
- "<exact correction>"

## Context
<what exists, why this mandate, what was already tried and failed>

## Owner request (verbatim)
> "<exact owner sentence(s), copied, not paraphrased>"

## Inputs
<verified local context, dependencies, current-mandate research record: sources, versions, captured-at>

## Expected outputs
<observable deliverables and required report artifacts>

## Acceptance (one per checklist part)
1. <part 1> -- proof: <screenshot path | test name + exit code | diff hunk>
2. <part 2> -- proof: <...>
N. Negative: <"do not touch X"> -- proof: `git diff --stat` shows no change under X

## Scope and ownership (one agent per task)
- Task: <the single task this agent owns>
- Write: <absolute paths this task needs -- no concurrent task touches them>
- Read only: <paths>
- Non-scope: <paths, systems, or behavior>
- Protected target (only if the owner named it): <path> -- owner's words: "<quote>"

## Skills to load (required, read before editing)
- `$solid:solid-detection` + the `solid-*` skill it selects, <domain skills>, `$ai-pilot:verification`

## Guardrails
- Re-read each file on disk right before editing; start from the on-disk state, preserve unrelated edits, never revert another contributor.
- No cap, timeout, or limit not stated here or by the hook (`FUSE_SOLID_MAX_LINES`).
- Hook block -> do what it says; read the gate source before calling it a bug.
- No commit / push / tag / publish. No deletion outside your files.
- Re-dispatch of an already-delivered mandate -> verify the disk, report the existing evidence, do not re-execute.
- Your deliverable is challenged by the challenger and validated by sniper before acceptance.
- Long task: one status line to the lead at a fixed cadence (done / blocked / next).

## Evidence
<exact proof commands or artifact checks>

## Escalation
<conditions for Retry, Ask, Rollback, or Escalate>

## Report (to the lead)
status: done | failed verification | blocked
exit: Stop | Retry | Rollback | Ask | Escalate
files: <changed path:line list> | unchanged: <reviewed, left unchanged>
proof: <per part: artifact path or command + exit code>
skills_consulted: <skill files actually read>
not done: <parts + why>
risks: <residual risks>
```

## Filling rules

| Field | Rule |
|-------|------|
| Owner request | Copy the sentence. If the owner sent a mockup or capture, give its path: it is the source of truth, not a hint. |
| Acceptance | One line per checklist part from intake; each has a proof the lead can open. |
| Protected target | Only when the owner named it in this session; quote him. Otherwise omit the line. |
| Report length | Size it to the deliverable; the owner-facing reply is the lead's job. |
| External executor | Add: "write code only -- never push, PR, merge, tag, or publish; release goes through `$commit-pro:commit`". |
