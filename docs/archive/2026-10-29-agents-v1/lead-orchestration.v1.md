---
name: lead-orchestration
description: "Coordinate lead delegation safely, from owner request to verified report. Use before any lead delegation, subagent, or team action, and for intake, agent selection, folder ownership, mtime preflight, parallel work, mandate construction, follow-up, blocks, agent lifecycle, stopping, relaunching, convergence, verification, and the final report."
---

# Lead Orchestration

Coordinate executors without overlapping ownership, stale writers, redundant permission prompts, or unverified handoffs. This is the canonical source for delegation procedure. The lead retains responsibility for the requested outcome after delegation; executors own bounded deliverables, not convergence of the whole request. A spawned executor performs its mandate directly and does not create another delegation tree unless explicitly assigned that responsibility. An executor starts from the lead's Analyze evidence (explore-codebase, research-expert, domain expert) and does not re-run it by reflex; when it doubts that evidence — missing, stale past the freshness window, or contradicted by the disk or by the docs it reads — it launches explore-codebase and/or research-expert itself, states in its report what it verified and why, and never treats an unverified claim as fact. What it never launches: challenger and sniper (lead-owned gates), or a full delegation tree of its own. Targeted explore/research on doubt is not delegation.

The procedure below runs in nine steps. Each ends with a **Check**: the step is not done until the check holds. Every step targets a failure observed in real sessions: the owner asking "is it moving?", re-stating dropped parts, finding visual defects reported as done, or typing steps the lead could run (see `references/worked-examples.md`).

## Authority and precedence

1. Follow `AGENTS.md` over this skill whenever they conflict. Never use delegation to expand the user's authority.
2. Treat a clear request to improve, optimize, refactor, fix, build, implement, or otherwise change something as authorization for reversible work inside that scope. Do not ask for redundant permission.
3. Ask only before an irreversible action or a material scope expansion. State reversible assumptions and continue.
4. **ALWAYS DELEGATE:** the lead orchestrates and never executes task work (sole exception: the 2-failed-delegations rule in Follow). Assign at least one executor for every modification.

## 1. Intake — the request as a checklist

Restate the request as numbered named parts, including negative constraints ("don't touch X") and every reference the owner sent (mockup, file, style). An owner message mid-task amends the list: add the part, tell the running agents (step 5), keep going; only an explicit stop halts.

**Check:** every owner sentence maps to a part; no part was invented by the lead.

## 2. Route — one agent per task

Split the checklist into tasks and route by TASK: one agent per task, and the task owns every file it needs. Two tasks that must edit the same file are merged into one task or sequenced (the second starts after the first is verified on disk). Each executor is told which skills to load: `$solid:solid-detection` and the `solid-*` skill it selects, the stack's domain skills, and `$ai-pilot:verification`. The lead loads only this skill and `$ai-pilot:apex-methodology`; it never applies domain skills itself. Announce the budget (agents, expected duration) in one line.

- Every task runs the routed APEX workflow in full; there is no scope ladder and no "too small to delegate" case.
- Analyze always starts the trio in one parallel message: `explore-codebase` for code analysis, `research-expert` for web or documentation research, and the matching domain expert.
- A research or exploration agent whose final report is empty or truncated is relaunched immediately with the same brief; an empty report is never accepted as "nothing found" (observed on GPT-5.6 Terra, codex#32389).
- Any code change is executed by at least three domain experts matching the project stack, on disjoint file lots — the same specialty runs as separate instances when the stack yields only one matching expert type; never fill the remaining slots with a generic agent. Derive those writers from the dependency graph: assign one matching domain executor to each genuinely independent writable lot, with at least one executor for every modification. Keep coupled files with one writer; never invent extra write lots to meet a headcount.
- The coordinator alone writes two PRD layers before spawning. The router `<project>/.codex/apex/prd.json` holds one key per task pointing at its task PRD: `{ "task-1": { "prd": "prd/task-1-prd.json", "status": "assigned" } }`. For each task, the coordinator alone writes the task PRD `<project>/.codex/apex/prd/<task>-prd.json`: one sub-key per assigned executor holding its target files and sub-tasks, with `assigned` moving to `validated` only after the coordinator checks the result against the disk.
- Each agent reports only in its own file `<project>/.codex/apex/prd/agents/<agent>-prd.json`, keyed by task name, then by the sub-task keys the task PRD assigns to that agent, and ticks each finished sub-task `done` with the files it modified and the files left unchanged; it never writes `prd.json`, a task PRD, or another agent's report file, so no write can overwrite another.
- The coordinator reads every agent report, checks every task against the disk, marks each verified sub-task `validated` in the task PRD, and rolls the task's status up into the router. Every agent may read the router, every task PRD, and every agent report at any time to know exactly what is done, in progress, or untouched — that shared read is the collaboration channel alongside messages; only the owner of each file writes it. As a task closes, the coordinator compacts its task PRD: each validated agent's entry collapses to one line (agent, files, validated-at) — never merging multiple agents of the same task into a single line — and collapses the router's line for that task, so every file stays small and every later reader sees the current state without the history. The coordinator rolls the router up at every `validated` mark and keeps `task.json` `current_task` in step — never at session end; a router that lags the task PRDs is a defect. A model or effort tier of any agent TOML changes only on an owner decision quoted, with its date, in the task PRD entry that touches the file; a tier change without that citation is refused at Verify.
- When a change touches fewer files than experts, split the work by concern (implementation, tests, verification or docs) so every expert still owns a disjoint lot; exclusive ownership always prevails, and two writers on one file are never allowed.
- Every executor is told in its brief that its deliverable is challenged by the challenger and validated by sniper before acceptance; a self-declared "done" is never accepted.
- Use parallel agents only for independent batches with disjoint ownership. Do not parallelize dependent work.
- A team is for genuinely independent batches; a team means at least four agents when capacity permits. When the user explicitly asks for a team, start one immediately and size it to the independent lots and available capacity.
- Select the matching domain expert whenever one exists. Never substitute a generic agent for an available domain expert.
- Implementation always routes to `explore-codebase` plus the stack's domain expert; topical agents (SEO, design, copy) handle only their sub-part and never act as the executor.

<example>
prd.json: { "task-1": { "prd": "prd/task-1-prd.json", "status": "in-progress" } }
prd/task-1-prd.json (before validation): { "agent-1": { "files": ["src/a.ts"], "sub-tasks": { "sub-1": { "status": "assigned" } } }, "agent-2": { "files": ["src/b.ts"], "sub-tasks": { "sub-2": { "status": "assigned" } } } }
prd/agents/agent-1-prd.json: { "task-1": { "sub-1": { "status": "done", "modified": ["src/a.ts"], "unchanged": [] } } }
prd/agents/agent-2-prd.json: { "task-1": { "sub-2": { "status": "done", "modified": ["src/b.ts"], "unchanged": [] } } }
prd/task-1-prd.json (after validation, compacted): { "agent-1": { "status": "validated", "files": ["src/a.ts"], "validated-at": "2026-09-02T14:10:00Z" }, "agent-2": { "status": "validated", "files": ["src/b.ts"], "validated-at": "2026-09-02T14:12:00Z" } }
</example>

Exclusive ownership, before assigning any folder:

1. Run `date` and `ls -lT <target>` to compare current time with target mtimes.
2. Enforce one folder = one owner and give parallel agents disjoint file lots.
3. Treat an mtime less than five minutes old as busy; assign nobody else there.
4. Treat five to ten minutes as indeterminate; identify the current owner and recheck instead of creating a collision.
5. Treat more than ten minutes without a fresh mtime as stale, not busy: stop it as in step 5, confirm mtimes have stopped changing, then relaunch with a fresh mandate.
6. Never infer completion from an mtime; verify the named deliverable on disk.

**Check:** each task has exactly one agent; no file is owned by two concurrent tasks (merged or sequenced instead); no task targets a busy folder.

## 3. Brief — self-contained mandate

Fill `references/brief-template.md`. Put the owner-corrections block first (step 8). A protected path (`~/.codex`, `~/.claude`, a deployed or marketplace path, install scripts) goes into a brief only when the owner named it in this session; quote the exact sentence, and the agent writes that target and nothing else.

Include every field below. A missing field makes the mandate incomplete:

- **Inputs:** owner request and corrections, verified local context, dependencies, and a current-mandate research record with newly consulted sources, versions, and captured-at time;
- **Expected outputs:** observable deliverables and required report artifacts;
- **Scope and ownership:** exclusive writable files or folders, read-only dependencies, and explicit non-scope;
- instruction to start from current on-disk state, preserve unrelated edits, and never revert another contributor;
- instruction that a re-dispatched already-delivered mandate must be verified against the current disk and reported with its existing evidence, then refused without duplicate execution; a materially new or corrected mandate remains legitimate new work and must proceed;
- **Acceptance:** one criterion per checklist part from step 1, each with a proof the lead can open, plus forbidden actions;
- **Evidence:** exact proof commands or artifact checks;
- **Escalation:** conditions that require Retry, Ask, Rollback, or Escalate;
- **Report:** inputs used, outputs produced, changed and unchanged files, evidence, skills consulted, failures, residual risks, and exactly one Exit Contract outcome.

Consult documentation afresh for every mandate through fuse-browser, Context7, and Exa. Prior or cached research may identify questions and sources, but it never satisfies the current mandate's research requirement. Share the resulting current-mandate research record with executors so they can use the same findings during that mandate without repeating consultation in every phase.

**Check:** an agent with zero conversation context could execute it; every checklist part from step 1 appears as an acceptance criterion.

## 4. Delegate everything

The lead edits no project file, even one line in a skill or rule; only its own scratch notes. The only exception is the 2-failed-delegations rule in Follow. External executors (another CLI or model run outside this tree) write code only: never push, PR, merge, tag, or publish; releases go through `$commit-pro:commit`.

- When multi-agent V2 is applicable, require `[features.multi_agent_v2]`, its configured `tool_namespace`, an exact `agent_type`, and bounded `fork_turns`. Never omit `fork_turns` or use `"all"` with `agent_type`.
- Treat the returned nickname as identity evidence. A task path alone is insufficient to establish agent identity.
- Agents discover each other with `list_agents` and can message any agent, sibling or parent, with `send_message` targeted by agent path or name (the lead is `/root`). A message only enters the receiver's mailbox; it never stops or waits for it. `followup_task` also wakes the target for a new turn and cannot target the root.

**Check:** the lead's own tool calls since intake contain no write to a project file, so the lead edited nothing (sole exception: the 2-failed-delegations rule); no external executor brief mentions a release step.

## 5. Follow — the owner never asks "is it moving?"

Poll every running executor at a fixed cadence (`wait_agent` with a timeout, `list_agents` status, output files, mtimes) and give the owner a one-line status (done / blocked / next) without being asked. Stall = no new output on disk since the last poll: steer the same agent with `followup_task` carrying the precise next step; never spawn a duplicate on the same mandate.

- A message does not stop an agent; it only enters its mailbox. Use `interrupt_agent`, then `close_agent` (the Codex equivalent of TaskStop), then confirm target mtimes are stable before treating the writer as stopped.
- Never assign a second writer to an owned folder. If a collision occurs, name one owner and instruct it to continue from the current on-disk state while preserving both contributions.
- Compare every report with the original request, absorb owner corrections into all active mandates, and keep unresolved parts assigned. Delegation never transfers outcome responsibility away from the lead.
- Do not run final validation while writers are active. A delta sent after spawn is unapplied until the writer explicitly confirms it was integrated.
- Never report "still waiting" twice. On the next turn, make a decision: verify, interrupt and relaunch, reroute, or escalate.
- After 2 failed delegations on a localised, already-measured defect, the lead reads and fixes it itself (the only case where the lead edits); any other blocked mandate past the 3-cycle cap is escalated to the owner with a root-cause note.

**Check:** the lead can answer "where is it?" with the last measurement (time, files changed, tests), never "I don't know".

## 6. Blocks — find the legitimate route

Before handing anything back, try every authorized path: trash instead of delete (`mv <f> ~/.Trash/`), the owner's existing script instead of asking for credentials, a scriptable source or API instead of a bot-walled page, a real browser session instead of a plain fetch. When a hook or gate refuses, read its source and do exactly what the message says before calling it a bug. Only a CAPTCHA, a password, or an approval the owner must type goes back: one line, the exact text to type.

**Check:** the hand-back names the routes already tried; the gate source was read whenever a gate is blamed.

## 7. Verify — open the real output, tick each part by name

1. Wait for every writer to report and explicitly confirm that all queued deltas are integrated.
2. Verify the artifact on disk after every report. A report or idle notification is not proof of delivery.
3. Open the actual deliverable against the real target (screenshot, extracted frames, running dev server, real DB, installed version — not the manifest or an isolated fixture) per `$ai-pilot:verification` "Look before done". Tick each checklist part from step 1 by name; an omitted or unproven part is written "not verified". A proven part is stated as guaranteed with its proof.
4. Stop or close every writer before the final sniper pass, then confirm relevant mtimes remain stable.
5. Run no validation mid-flight. Hand off to the eLicit, Verify, challenge, and code-quality routes required by `AGENTS.md` only after execution is frozen.

**Check:** each part has a proof artifact path or is marked "not verified"; sniper and challenger verdicts are in hand; each executor report lists the skills it consulted, and a missing one is "not verified".

## 8. Learn — each owner correction becomes a rule the same turn

Copy every owner correction verbatim into every current and future mandate, including respawns. Within the same turn, delegate one line encoding it into the skill or agent that failed, in the source repository; never sync to a deployed or marketplace path unless the owner asked. An owner verdict that contradicts a measurement wins and is propagated to every brief already dispatched.

**Check:** the correction is grep-able in the failing skill or agent before the turn ends.

## 9. Report — answer first

Reply in the owner's language. Line 1 is the answer (done / not done / blocked); then at most 10 lines in total: one recommendation and the next step, no option menu when one choice is clearly better. Deliverables sit at a path the owner sees (visible folder, sent file, link), never only inside a hidden directory.

**Check:** line 1 answers the question asked; every deliverable path is outside a dot-folder.

## Exit Contract

End every loop with exactly one outcome:

- **Stop:** the named result is verified with artifact and command evidence.
- **Retry:** use a different documented hypothesis; never repeat the same failed fix.
- **Rollback:** have the owning executor safely restore only its changes to the last green state without destructive reset or damage to unrelated work; escalate if ownership overlaps.
- **Ask:** reserve for an irreversible action or material scope expansion, never for a clear reversible mandate.
- **Escalate:** report the root cause, attempts, evidence, and unresolved risk when safe progress is exhausted.

Never reopen a settled instruction as Ask. Never produce two consecutive Ask outcomes without a deliverable between them. The attempt cap (the 3-cycle cap cited in Follow) belongs to the sniper Fix Retry Loop; do not invent or redefine one in this skill.

## Forbidden

- Never let the lead execute task work after a delegated failure, except under the 2-failed-delegations rule in Follow (localised, already-measured defect).
- Never treat delegation, an executor report, or idle state as completion of the owner's outcome.
- Never overlap folder ownership or validate a moving worktree.
- Never treat a mailbox message, idle state, recent mtime, or agent assertion as proof.
- Never omit owner corrections from a respawn or future mandate.
- Never ask again for permission already supplied by a clear mandate.
- Never invent a cap, path, or constraint the owner did not state; a short positive verdict is not global until it covers the named defect.

## Reference Guide

| Need | Reference |
|------|-----------|
| Writing a brief (step 3) | [brief-template.md](references/brief-template.md) |
| Bad vs good lead behaviour from real sessions | [worked-examples.md](references/worked-examples.md) |
