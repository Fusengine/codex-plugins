---
name: brief-template
description: Copy-paste mandate skeleton with fixed headers the lead fills before every delegation
when-to-use: Step 6 of lead-orchestration, before any spawn_agent, followup_task, or external executor launch
keywords: brief, mandate, delegation, ownership, guardrails, team, report format
priority: high
related: worked-examples.md
---

# Brief Template

## Why

A brief summarised from memory drifts from the owner's request: parts get dropped, negative constraints vanish, paths get invented. Fixed headers force the owner's exact words, the files the task owns, the proof and the team into every mandate, so the agent is judged on disk instead of on its own summary. The header names are fixed (same order, same spelling) so a brief can be checked for completeness; the fields each header carries (Inputs, Expected outputs, Acceptance, Evidence, Escalation, Report) are defined once in `SKILL.md` step 6.

## Template

```markdown
## OWNER RULES (verbatim)
> "<exact owner sentence(s), copied, not paraphrased>"
- Owner corrections (verbatim): "<exact correction>"
- Standing decisions (from docs/decisions.md): <dated lines that apply> -- execute them, do not re-debate.
- Protected target (only if the owner named it): <path> -- owner's words: "<quote>"

## WRITE
- Task: <the single task this agent owns>
- Exclusive files: <absolute paths this task owns -- no concurrent task touches them>
- Read only: <paths you may read>
- Re-read each file on disk right before editing; start from the on-disk state, preserve unrelated edits, never revert another contributor.

## OUTPUT
Context: <what exists, why this mandate, what was already tried and failed>
Inputs: <verified local context, dependencies, current-mandate research record: sources, versions, captured-at>
1. <part 1 -- the deliverable, as an acceptance criterion>
2. <part 2>
N. Negative: <"do not touch X">

## TOOLS
- Skills to load before editing: `$solid:solid-detection` + the `solid-*` skill it selects, <domain skills>, `$ai-pilot:verification`
- Capture tool (visual task): <fuse-browser browser_screenshot / simulator screenshot / frame extraction>
- Helpers you may launch for this task only, when the depth limit allows: research-expert, explore-codebase, challenger, sniper. Never an executor or a teammate.
- Hook block -> do exactly what it says; read the gate source before calling it a bug.

## PROOF
1. <part 1> -- <command + expected exit code | artifact path (capture, test log, diff hunk)>
2. <part 2> -- <...>
N. Negative -- `git diff --stat` shows no change under X
Your deliverable is challenged by the challenger and validated by sniper before acceptance; a self-declared "done" is never accepted.

## NON-GOALS
- <what this task must not do, files it must not touch>
- No commit, push, tag or publish yourself: the lead has the commit agent make a WIP commit once your task is verified.
- No deletion outside your files; a needed deletion is reported to the lead, never executed.
- No cap, timeout or limit not stated here or by the hook (`FUSE_SOLID_MAX_LINES`).

## TEAM
- Lead: `/root`
- Peers: <name -- owned files -- task>, ...
- Message (`send_message`, by path or name) for: a contract or interface change, a file a peer owns (ask, never edit it), a result you wait for. No answer from a peer -> ask `/root`.
- Shared resource owner (build, simulator, server): <name>

## LANGUAGE
Code comments, docs, commit messages: English. Replies to the user: the user's language.

## REPORT (to `/root`, short)
- Start: files taken. Long task: one status line at a fixed cadence (done / blocked / next).
- Block: immediately, with the routes already tried. Escalation: <conditions for Retry, Ask, Rollback, or Escalate>.
- Final:
  status: done | failed verification | blocked
  exit: Stop | Retry | Rollback | Ask | Escalate
  files: <changed path:line list> | unchanged: <reviewed, left unchanged>
  proof: <per part: artifact path or command + exit code>
  not verified: <parts + why>
  skills_consulted: <skill files actually read>
  risks: <residual risks>
- Open points: decide them yourself from the measurement and the mandate's goal, and report the decision. Ask `/root` ONE binary question (never the owner, never an option menu) only for the part where incoming information contradicts OWNER RULES; continue the rest meanwhile. Irreversible Git stays gated by the `AGENTS.md` hard stops, not by a question.
- Re-dispatch of an already-delivered mandate -> verify the disk, report the existing evidence, do not re-execute.
```

## Filling rules

| Header | Rule |
|--------|------|
| OWNER RULES | Copy the sentence. A mockup/capture the owner sent is given by path: it is the source of truth, not a hint. Protected target only when the owner named it in this session; otherwise omit the line. |
| WRITE | Absolute paths; the same file never appears in two concurrent briefs. |
| OUTPUT | One line per ledger item from step 1; context stays in two or three lines. |
| PROOF | One proof per OUTPUT line, something the lead can open or re-run. |
| TOOLS | Visual task -> name the capture tool; without it, the part cannot be proven. |
| NON-GOALS | External executor: add "write code only -- never push, PR, merge, tag, or publish; release goes through `$commit-pro:commit`". |
| TEAM | Every name in the ownership table of step 5, even for a single agent (then Peers: none). |
| REPORT | Size it to the deliverable; the owner-facing reply is the lead's job. |
