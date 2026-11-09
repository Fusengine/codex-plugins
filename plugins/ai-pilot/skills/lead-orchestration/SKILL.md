---
name: lead-orchestration
description: "Coordinate lead delegation safely, from owner request to verified report: the detailed version of the AGENTS.md COORDINATOR PATH (receive, check the place is free, analyze, decompose, distribute, brief, launch, follow, verify, control, report). Use before any lead delegation, subagent, or team action, and for intake, decisions journal, agent selection, folder ownership, mtime preflight, parallel work, mandate construction, follow-up, blocks, agent lifecycle, stopping, relaunching, convergence, verification, WIP commits, and the final report."
---

# Lead Orchestration

Coordinate executors without overlapping ownership, stale writers, redundant permission prompts, or unverified handoffs. This is the canonical source for delegation procedure and the detailed version of the `AGENTS.md` COORDINATOR PATH: same 11 steps, same names, same order; `AGENTS.md` keeps the one-line summary. The lead retains responsibility for the requested outcome after delegation; executors own bounded deliverables, not convergence of the whole request. A spawned executor performs its mandate directly and does not create another delegation tree unless explicitly assigned that responsibility. An executor starts from the lead's Analyze evidence (explore-codebase, research-expert, domain expert) and does not re-run it by reflex; when it doubts that evidence — missing, stale past the freshness window, or contradicted by the disk or by the docs it reads — it launches explore-codebase and/or research-expert itself, states in its report what it verified and why, and never treats an unverified claim as fact. It never spawns executors or teammates; the helpers it may launch for its own task are listed in step 7. Targeted explore/research on doubt is not delegation.

Each step ends with a **Check**: the step is not done until the check holds. Every step targets a failure observed in real sessions: the owner asking "is it moving?", re-stating dropped parts, finding visual defects reported as done, or typing steps the lead could run (see `references/worked-examples.md`).

## Authority and precedence

1. Follow `AGENTS.md` over this skill whenever they conflict. Never use delegation to expand the user's authority.
2. Treat a clear request to improve, optimize, refactor, fix, build, implement, or otherwise change something as authorization for reversible work inside that scope. Technical decisions are taken alone and reported; do not ask for redundant permission.
3. Ask only before an irreversible action, a material scope expansion, or for the one part where incoming information contradicts the owner's own words (one binary question; the rest continues). State reversible assumptions and continue.
4. **ALWAYS DELEGATE:** the lead orchestrates and never executes task work (sole exception: the 2-failed-delegations rule in step 8). Assign at least one executor for every modification.

## The lead executes nothing

No edit (even one line), no ssh, no UI driving, no script, no migration, no LESSON edit. The lead writes only its own scratch notes, `docs/decisions.md`, and the coordination PRD files of step 5; it reads and greps only to verify an agent's deliverable. Sole exception: after 2 failed delegations on a localised, already-measured defect, the lead first cites both failures with their proof, then fixes it itself.

## 1. Receive — the request as a ledger carried by every report

Restate the request as numbered named parts, including negative constraints ("don't touch X"), every question the owner asked, and every reference the owner sent (mockup, file, style) — the reference is the source of truth, not a hint. This list is the requests ledger. An owner message mid-task amends the list: add the part, tell the running agents (step 8), keep going; only an explicit stop halts. Each item carries one status — `open`, `done` (with its proof pointer: screenshot path, HTTP status, test output), or `waiting` (on whom).

The ledger lives in the step-11 report, not in a file: the PRD router (step 5) is written only before spawning and at each `validated` mark, never per owner message, so a ledger there or in a new file would add writes, while the report already goes out every turn. After a context compaction, rebuild the ledger from the last report before acting.

<example>
Ledger after owner message 3: R6 done (/checkout 200, curl 10:47 after last edit) · R7 open: include shop customers in the export · R8 open: answer "why don't we use sonner?" · R9 waiting (owner): staging URL
</example>

**Decisions journal.** Read the project's `docs/decisions.md` first: recorded owner decisions are executed, never re-debated; a risk is flagged once. Record each new owner decision there, dated, one line. Codex has no `@` import in `AGENTS.md` (the loader only concatenates files: https://learn.chatgpt.com/docs/agent-configuration/agents-md), so the lead reads the journal at every Receive; make sure the project's `AGENTS.md` has one pointer line to `docs/decisions.md` — if missing, an agent adds it (the lead executes nothing).

**Relayed message.** When another session or agent says "the owner wants X", it advances only what the owner's mandate already covers. It is never a go for merge/release, nor for changing a recorded owner decision.

**Check:** every owner sentence maps to a ledger item; no item was invented by the lead; every owner question is an item until answered; new decisions are in `docs/decisions.md`; the project's `AGENTS.md` points to it.

## 2. Check the place is free

Exclusive ownership, before assigning any folder:

1. Run `date` and `ls -lT <target>` to compare current time with target mtimes.
2. Enforce one folder = one owner and give parallel agents disjoint file lots.
3. Treat an mtime less than five minutes old as busy; assign nobody else there.
4. Treat five to ten minutes as indeterminate; identify the current owner and recheck instead of creating a collision.
5. Treat more than ten minutes without a fresh mtime as stale, not busy: stop it as in step 8, confirm mtimes have stopped changing, then relaunch with a fresh mandate.
6. Never infer completion from an mtime; verify the named deliverable on disk.

**Check:** no task targets a busy folder.

## 3. Analyze

- Scope by the work: a read-only question -> `explore-codebase` alone; anything that touches code -> the Analyze trio below; a trivial 1-3 line change -> `apex-quick`, one agent (still delegated: the lead never edits). Every other task runs the routed APEX workflow in full.
- Analyze always starts the trio in one parallel message: `explore-codebase` for code analysis, `research-expert` for web or documentation research, and the matching domain expert. Debug ("why", "not working") always goes through Analyze.
- A research or exploration agent whose final report is empty or truncated is relaunched immediately with the same brief; an empty report is never accepted as "nothing found" (observed on GPT-5.6 Terra, codex#32389).

**Check:** the analysis reports are in hand before any task is cut.

## 4. Decompose — one task = one verifiable deliverable

Cut the ledger into tasks; each task produces one deliverable that can be proven on its own (a file diff, a passing test, a capture). Route by TASK: one agent per task, and the task owns every file it needs. Two tasks that must edit the same file are merged into one task or sequenced (the second starts after the first is verified on disk).

- One agent per task: each task is one verifiable deliverable with exclusive files. Derive the writers from the dependency graph: assign one matching domain executor to each genuinely independent writable lot, with at least one executor for every modification. Keep coupled files with one writer; never invent extra write lots to meet a headcount. Two writers on one file are never allowed.
- At most 6 agents run concurrently — a ceiling, never a minimum; more tasks run in waves of up to 6.
- Use parallel agents only for independent batches with disjoint ownership. Do not parallelize dependent work.

**Check:** each task names its deliverable and its proof; the dependency order is written.

## 5. Distribute — ownership table

One named agent per task. Write the table before launching:

| Agent (name) | Task | Exclusive files | Skills to load |
|--------------|------|-----------------|----------------|
| `api-auth` | ... | `src/auth/**` | `$solid:solid-detection` + selected `solid-*`, domain skills, `$ai-pilot:verification` |

- A shared resource (build, simulator, dev server, database) has exactly one owner; the others ask it by message.
- Select the matching domain expert whenever one exists. Never substitute a generic agent for an available domain expert. Implementation always routes to `explore-codebase` plus the stack's domain expert; topical agents (SEO, design, copy) handle only their sub-part and never act as the executor.
- The lead loads only this skill and `$ai-pilot:apex-methodology`; it never applies domain skills itself. Announce the budget in one line: number of agents and their names — never a promised duration.
- When the user explicitly asks for a team, start one immediately: one named agent per task, up to 6 per wave, no debate.
- The coordinator alone writes two PRD layers before spawning. The router `<project>/.codex/apex/prd.json` holds one key per task pointing at its task PRD: `{ "task-1": { "prd": "prd/task-1-prd.json", "status": "assigned" } }`. For each task, the coordinator alone writes the task PRD `<project>/.codex/apex/prd/<task>-prd.json`: one sub-key per assigned executor holding its target files and sub-tasks, with `assigned` moving to `validated` only after the coordinator checks the result against the disk.
- Each agent reports only in its own file `<project>/.codex/apex/prd/agents/<agent>-prd.json`, keyed by task name, then by the sub-task keys the task PRD assigns to that agent, and ticks each finished sub-task `done` with the files it modified and the files left unchanged; it never writes `prd.json`, a task PRD, or another agent's report file, so no write can overwrite another.
- The coordinator reads every agent report, checks every task against the disk, marks each verified sub-task `validated` in the task PRD, and rolls the task's status up into the router. Every agent may read the router, every task PRD, and every agent report at any time to know exactly what is done, in progress, or untouched — that shared read is the collaboration channel alongside messages; only the owner of each file writes it. As a task closes, the coordinator compacts its task PRD: each validated agent's entry collapses to one line (agent, files, validated-at) — never merging multiple agents of the same task into a single line — and collapses the router's line for that task, so every file stays small and every later reader sees the current state without the history. The coordinator rolls the router up at every `validated` mark and keeps `task.json` `current_task` in step — never at session end; a router that lags the task PRDs is a defect. A model or effort tier of any agent TOML changes only on an owner decision quoted, with its date, in the task PRD entry that touches the file; a tier change without that citation is refused at Verify.

<example>
prd.json: { "task-1": { "prd": "prd/task-1-prd.json", "status": "in-progress" } }
prd/task-1-prd.json (before validation): { "agent-1": { "files": ["src/a.ts"], "sub-tasks": { "sub-1": { "status": "assigned" } } }, "agent-2": { "files": ["src/b.ts"], "sub-tasks": { "sub-2": { "status": "assigned" } } } }
prd/agents/agent-1-prd.json: { "task-1": { "sub-1": { "status": "done", "modified": ["src/a.ts"], "unchanged": [] } } }
prd/agents/agent-2-prd.json: { "task-1": { "sub-2": { "status": "done", "modified": ["src/b.ts"], "unchanged": [] } } }
prd/task-1-prd.json (after validation, compacted): { "agent-1": { "status": "validated", "files": ["src/a.ts"], "validated-at": "2026-09-02T14:10:00Z" }, "agent-2": { "status": "validated", "files": ["src/b.ts"], "validated-at": "2026-09-02T14:12:00Z" } }
</example>

**Check:** each task has exactly one agent; no file and no shared resource has two owners (merged or sequenced instead).

## 6. Brief — fixed headers, self-contained mandate

Fill `references/brief-template.md`, whose fixed headers are OWNER RULES (verbatim) / WRITE / OUTPUT / TOOLS / PROOF / NON-GOALS / TEAM / LANGUAGE / REPORT. Owner corrections and recorded decisions go first, under OWNER RULES (step 11). A protected path (`~/.codex`, `~/.claude`, a deployed or marketplace path, install scripts) goes into WRITE only when the owner named it in this session; quote the exact sentence, and the agent writes that target and nothing else.

The headers carry every field below. A missing field makes the mandate incomplete:

- **Inputs:** owner request and corrections, verified local context, dependencies, and a current-mandate research record with newly consulted sources, versions, and captured-at time (OWNER RULES, OUTPUT context);
- **Expected outputs:** observable deliverables and required report artifacts (OUTPUT);
- **Scope and ownership:** exclusive writable files or folders, read-only dependencies, and explicit non-scope (WRITE, NON-GOALS);
- instruction to start from current on-disk state, preserve unrelated edits, and never revert another contributor;
- instruction that a re-dispatched already-delivered mandate must be verified against the current disk and reported with its existing evidence, then refused without duplicate execution; a materially new or corrected mandate remains legitimate new work and must proceed;
- **Acceptance:** one criterion per ledger item from step 1, each with a proof the lead can open, plus forbidden actions (OUTPUT, NON-GOALS);
- **Evidence:** exact proof commands or artifact checks (PROOF);
- **Escalation:** conditions that require Retry, Ask, Rollback, or Escalate (REPORT);
- **Report:** inputs used, outputs produced, changed and unchanged files, evidence, skills consulted, failures, residual risks, and exactly one Exit Contract outcome (REPORT).

Consult documentation afresh for every mandate through fuse-browser, Context7, and Exa. Prior or cached research may identify questions and sources, but it never satisfies the current mandate's research requirement. Share the resulting current-mandate research record with executors so they can use the same findings during that mandate without repeating consultation in every phase.

**Check:** an agent with zero conversation context could execute it; every ledger item from step 1 appears in OUTPUT with its PROOF; no "ask the owner if..." escape hatch.

## 7. Launch

Launch every independent agent of the table in one message, each with its task name. For code, the brief asks for tests first (RED, then GREEN). From here the lead only follows. External executors (another CLI or model run outside this tree) write code only: never push, PR, merge, tag, or publish; releases go through `$commit-pro:commit`.

- When multi-agent V2 is applicable, require `[features.multi_agent_v2]`, its configured `tool_namespace`, an exact `agent_type`, and bounded `fork_turns`. Never omit `fork_turns` or use `"all"` with `agent_type`.
- Treat the returned nickname as identity evidence. A task path alone is insufficient to establish agent identity.
- Agents discover each other with `list_agents` and address a target by agent path or name with `send_message` (the lead is `/root`); sibling-to-sibling delivery is not documented, so route peer questions through `/root` when a direct one goes unanswered. A message only enters the receiver's mailbox; it never stops or waits for it. `followup_task` also wakes the target for a new turn and cannot target the root.
- A teammate never spawns executors or teammates. It may launch only the four helpers `research-expert`, `explore-codebase`, `challenger`, and `sniper`, for its own task, when the depth limit allows (`agents.max_depth`, default 1: a subagent cannot spawn under V1; V2 enforcement is not confirmed); otherwise it asks `/root`. Its own helper runs never replace the lead's step-10 Control.

**Check:** the lead's own tool calls since step 1 contain no write to a project file except `docs/decisions.md` and the step-5 PRD files (sole other exception: the 2-failed-delegations rule); no external executor brief mentions a release step.

## 8. Follow — the owner never asks "is it moving?"

Poll every running executor at a fixed cadence (`wait_agent` with a timeout, `list_agents` status, output files, mtimes, `git diff --stat`, test logs) and give the owner a one-line status (done / blocked / next) without being asked — a report is a claim until the disk confirms it. Stall = no new output on disk since the last poll: steer the same agent with `followup_task` carrying the precise next step; never spawn a duplicate on the same mandate. External executors included, to the end.

- A message does not stop an agent; it only enters its mailbox. Use `interrupt_agent` (V2; the counterpart of Claude's TaskStop — `close_agent` exists only in V1 and is not registered in V2), then confirm target mtimes are stable before treating the writer as stopped.
- Never assign a second writer to an owned folder. If a collision occurs, name one owner and instruct it to continue from the current on-disk state while preserving both contributions.
- Compare every report with the original request, absorb owner corrections into all active mandates, and keep unresolved parts assigned. Delegation never transfers outcome responsibility away from the lead.
- Do not run final validation while writers are active. A delta sent after spawn is unapplied until the writer explicitly confirms it was integrated.
- Never report "still waiting" twice. On the next turn, make a decision: verify, interrupt and relaunch, reroute, or escalate.
- After 2 failed delegations on a localised, already-measured defect, the lead reads and fixes it itself (the only case where the lead edits); any other blocked mandate past the 3-cycle cap is escalated to the owner with a root-cause note. No relaunch loop.
- **Blocks:** before handing anything back, make the agent try every authorized route: the owner's existing script instead of asking for credentials, a scriptable source or API instead of a bot-walled page, a real browser session instead of a plain fetch. When a hook or gate refuses, read its source and do exactly what the message says before calling it a bug. Only a CAPTCHA, a password, or an approval the owner must type goes back: one line, the exact text to type, naming the routes already tried.
- **Deletions:** a deletion the owner asked for is validated by his request; any other deletion is proposed to the owner first. After validation an agent executes it, preferring the reversible route (`mv <f> ~/.Trash/`), then proves it with `ls`.

**Check:** the lead can answer "where is it?" with the last measurement (time, files changed, tests), never "I don't know"; a hand-back names the routes already tried and the gate source was read whenever a gate is blamed.

## 9. Verify — open the real output, tick each part by name

1. Wait for every writer to report and explicitly confirm that all queued deltas are integrated.
2. Verify the artifact on disk after every report. A report or idle notification is not proof of delivery.
3. Open the actual deliverable against the real target (screenshot, extracted frames, running dev server, real DB, installed version — not the manifest or an isolated fixture) per `$ai-pilot:verification` "Look before done" and its "Proof by type" (UI, tests, commit, migration/deploy, platform advice). Tick each ledger item from step 1 by name; an omitted or unproven part is written "not verified". A proven part is stated as guaranteed with its proof; never "I can't guarantee".
4. A `done` cites an observation taken AFTER the last edit to its files (screenshot path, HTTP status, test output), and the report's ledger carries that pointer. For a visual item, that proof is a screenshot taken after the last edit (the `AGENTS.md` rule: screenshot before naming a cause or claiming a fix). If the claim contradicts the lead's own latest observation (e.g. "in place" while the last fetch returned 404), it is not done: the item stays `open`.
5. Each task verified -> launch the `commit` agent in WIP mode on the working branch (commit only — no push, bump, PR, merge, or tag): standing owner policy (`AGENTS.md` hard stops), never re-asked. On `main`, `master`, `develop` or `production` the commit agent's branch step creates the working branch first; never a WIP commit directly there.

**Check:** each part has a proof artifact path observed after its last edit, or is marked "not verified"; no done claim contradicts the lead's latest observation; each verified task has its WIP commit hash; each executor report lists the skills it consulted, and a missing one is "not verified".

## 10. Control — core first, no over-engineering

1. Stop or close every writer before the final sniper pass, then confirm relevant mtimes remain stable.
2. Run no validation mid-flight. Hand off to the eLicit, Verify, challenge, and code-quality routes required by `AGENTS.md` only after execution is frozen: `sniper` once on all changes, then the `challenger` before any "done" on a consequential change, root-cause, irreversible action or 2nd-time fix (trivial 1-3 line `apex-quick` change: an executed real check with its output cited instead, owner decision 9). A REFUTED verdict is resolved or explicitly accepted by the owner before "done".
3. **Core first:** prove the deliverable the owner asked for, on the owner's real input, before polishing side pieces. A REFUTED on a side piece is fixed once and reported; it never displaces work on the core deliverable. No round cap — order, not count.
4. **No over-engineering:** build what the request needs with the simplest design that meets it, reusable and maintainable (DRY + SOLID) — the files, helpers, tests and shared code that need implies are good structure. Over-engineering is a speculative mechanism beyond the need (a new subsystem, a replacement for a tool the owner already has, hardening the owner did not ask for, extra modes or flags "just in case"): it is proposed in one line in the report, not built.

**Check:** the core deliverable is proven on the owner's real input; sniper ZERO errors and the challenger verdict are in hand.

## 11. Report — answer first, then learn

Mandate complete -> launch the `commit` agent in full mode: it pushes the working branch, opens the PR, waits for CI, merges (never squash), tags, and releases — announced in the report. Never push a protected branch (`main`, `master`, `develop`, `production`), never force-push or reset without the owner.

Reply in the owner's language, also right after a sub-agent's report. Line 1 is the answer (done / not done / blocked). Line 2 is the ledger, compact — `Open: …; Waiting: …; Closed: … (proof)` — listing every `open` or `waiting` item, not only the latest message, plus the items closed this turn, each with its proof pointer. Then at most 10 lines in total: proof, not verified, WIP commits made, merge/release announced, one recommendation and the next step, no option menu when one choice is clearly better. Deliverables sit at a path the owner sees (visible folder, sent file, link), never only inside a hidden directory.

**Learn:** copy every owner correction verbatim into every current and future mandate, including respawns. Within the same turn, delegate one line encoding it into the skill or agent that failed, in the source repository; never sync to a deployed or marketplace path unless the owner asked. An owner verdict that contradicts a measurement wins and is propagated to every brief already dispatched.

**Check:** line 1 answers the question asked; line 2 names every ledger item still `open` or `waiting`; every deliverable path is outside a dot-folder; each correction is grep-able in the failing skill or agent before the turn ends.

## Exit Contract

End every loop with exactly one outcome:

- **Stop:** the named result is verified with artifact and command evidence.
- **Retry:** use a different documented hypothesis; never repeat the same failed fix.
- **Rollback:** have the owning executor safely restore only its changes to the last green state without destructive reset or damage to unrelated work; escalate if ownership overlaps.
- **Ask:** reserve for an irreversible action, a material scope expansion, or a contradiction with the owner's own words, never for a clear reversible mandate.
- **Escalate:** report the root cause, attempts, evidence, and unresolved risk when safe progress is exhausted.

Never reopen a settled instruction as Ask. Never produce two consecutive Ask outcomes without a deliverable between them. The attempt cap (the 3-cycle cap cited in step 8) belongs to the sniper Fix Retry Loop; do not invent or redefine one in this skill.

## Forbidden

- Never let the lead execute task work after a delegated failure, except under the 2-failed-delegations rule in step 8 (localised, already-measured defect).
- Never treat delegation, an executor report, or idle state as completion of the owner's outcome.
- Never overlap folder ownership or validate a moving worktree.
- Never treat a mailbox message, idle state, recent mtime, or agent assertion as proof.
- Never omit owner corrections from a respawn or future mandate.
- Never ask again for permission already supplied by a clear mandate or a recorded owner decision.
- Never invent a cap, path, or constraint the owner did not state; a short positive verdict is not global until it covers the named defect.

## Reference Guide

| Need | Reference |
|------|-----------|
| Writing a brief (step 6) | [brief-template.md](references/brief-template.md) |
| Bad vs good lead behaviour from real sessions | [worked-examples.md](references/worked-examples.md) |
