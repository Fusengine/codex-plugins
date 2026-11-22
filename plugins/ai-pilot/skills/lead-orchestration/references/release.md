---
name: release
description: Full gate before release (step 10) and the commit-cycle / release flow through the commit agent (step 11)
when-to-use: MUST read when the mandate is complete or the owner asks for the commit cycle (any wording, any language), before the commit agent is dispatched in release (full) mode
keywords: release, commit cycle, full gate, CI, merge, tag, commit agent, protected branch
priority: high
related: project-skill.md
---

# Release

Moved from `SKILL.md` steps 10 and 11; `SKILL.md` keeps the trigger, the protected-branch rule and the pointer. WIP commits after each verified task stay in `SKILL.md` step 9.

## Full gate before release (step 10 Control)

Before the `commit` agent is dispatched in release mode, an agent runs the project's full gate and the lead reads its output itself, never quoting an "all green". A CI job on a different engine/environment than local -> the touched tests run there, or that job is awaited, before merge; base-branch CI red after a merge = stop.

## Commit cycle (step 11 Report)

Mandate complete, or the owner asks for the commit cycle (any wording, any language; quote the owner's words in the invocation; relays per step 1 "Relayed message") -> launch the `commit` agent in full mode: it pushes the working branch, opens the PR, waits for CI, merges (never squash), tags, and releases — announced in the report, with no further owner step.

1. The full gate above still runs first.
2. The commit agent's real-run gate needs the proof of a complete end-to-end run in the real tool (docs-only branches exempt).
3. Before the release PR: roadmap + project skill update, once per mandate — `references/project-skill.md` "Update before the release".
4. Never push a protected branch (`main`, `master`, `develop`, `production`), never force-push or reset without the owner.

## Check

The full gate output was read by the lead itself; `docs/roadmap.md` and the project skill were updated before the release; the release is announced in the report.
