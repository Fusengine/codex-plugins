---
name: lead-orchestration
description: "Coordinate lead delegation safely, from owner request to verified report: the detailed version of the AGENTS.md COORDINATOR PATH (receive, check the place is free, analyze, decompose, distribute, brief, launch, follow, verify, control, report). Use before any lead delegation, subagent, or team action, and for intake, decisions journal, agent selection, folder ownership, mtime preflight, parallel work, mandate construction, follow-up, blocks, agent lifecycle, stopping, relaunching, convergence, verification, WIP commits, and the final report."
---

# Lead Orchestration

Coordinate executors without overlapping ownership, stale writers, redundant permission prompts, or unverified handoffs. This is the canonical source for delegation procedure and the detailed version of the `AGENTS.md` COORDINATOR PATH: same 11 steps, same names, same order; `AGENTS.md` keeps the one-line summary. The lead retains responsibility for the requested outcome after delegation; executors own bounded deliverables, not convergence of the whole request.

**Executors.** A spawned executor performs its mandate directly and does not create another delegation tree unless explicitly assigned that responsibility. It starts from the lead's Analyze evidence and does not re-run it by reflex while that evidence is fresh: produced in this mandate and not contradicted by the current disk or docs (rule 08 "Evidence reuse"). On doubt (missing, not fresh, contradicted) it launches explore-codebase and/or research-expert itself only when the session's depth allows it (step 7 helpers), otherwise it asks `/root`; it reports what it verified and why, and never treats an unverified claim as fact. Targeted explore/research on doubt is not delegation.

**Reading this skill.** Read this file — and each SKILL.md or reference — in its own tool call that reads only that file: never inside a batched script (`Promise.allSettled`, several `exec_command` in one call), never in a multi-file `cat` or a call that also runs `date`/`ls`/`git`, never with a `max_output_tokens` lowered below the file (bench 2026-11-22: every truncated skill read was one of these). If the output is truncated or ends before the file does, read the missing line range before acting. Each step ends with a **Check**: the step is not done until it holds. Real-session failures behind each step: `references/worked-examples.md`. Conditional references bind whenever their condition holds:

- MUST read `references/brief-template.md` when writing any brief (step 6).
- MUST read `references/prd-mode.md` when the mandate is a WRITE mandate, before the first executor spawn (step 5: PRD layers for every write mandate, harness PRD mode for 2+ agents), and on resume or after a compaction of such a mandate.
- MUST read `references/project-skill.md` when `<project root>/.agents/skills/project-<name>/SKILL.md` is missing (step 3), and at the commit cycle (step 11).
- MUST read `references/verify-by-type.md` when a ledger item is a migration, deploy, production-data change or visual item, or carries an owner-named reference (step 9).
- MUST read `references/release.md` when the mandate is complete or the owner asks for the commit cycle (steps 10-11).

## Authority and precedence

1. Follow `AGENTS.md` over this skill whenever they conflict. Never use delegation to expand the user's authority.
2. Autonomy (owning rule: `AGENTS.md` AUTONOMY): a clear change request authorizes reversible work inside that scope; technical decisions are taken alone and reported; no redundant permission.
3. Ask only before an irreversible action, a material scope expansion, or for the one part that contradicts the owner's own words (one binary question; the rest continues). State reversible assumptions and continue.
4. **ALWAYS DELEGATE:** the lead orchestrates and never executes task work (sole exception: the 2-failed-delegations rule in step 8). Assign at least one executor for every modification.

## The lead executes nothing

Owning rule: `AGENTS.md` RECURRING TRAPS "ALWAYS DELEGATE" (allowed writes and commands listed there); steps 7, 8 and Forbidden point here. No edit (even one line), no ssh, no UI driving, no script, no migration, no LESSON edit. Writes: own scratch notes, `docs/decisions.md`, the PRD files of `references/prd-mode.md`. Commands: read-only verification and, write mandate with 2+ agents, the coordinator `prd init` / `prd status` / `prd validate` / `prd compact`. Reads and greps only to verify an agent's deliverable. Sole exception: after 2 failed delegations on a localised, already-measured defect, the lead first cites both failures with their proof, then fixes it itself.

## 1. Receive — the request as a ledger carried by every report

Restate the request as numbered named parts, including negative constraints ("don't touch X"), every question the owner asked, and every reference the owner sent (mockup, file, style) — the reference is the source of truth, not a hint. This list is the requests ledger. Each item carries one status — `open`, `done` (with its proof pointer: screenshot path, HTTP status, test output), or `waiting` (on whom).

**Owner messages mid-task** (owning rule: `AGENTS.md` AUTONOMY). An owner message amends the ledger: add the part, tell the running agents (step 8), keep going. An amendment that adds a target never closes the original item; both stay open until each is proven. Only an explicit stop order halts work: a question about quality, frustration, an insult, or "I'll ask another assistant" (e.g. « je demande à Claude ») is not one — answer in one line and keep executing; a delivered mandate the owner has not accepted stays active.

**Owner's verb**: it sets the mandate type and is relayed unchanged — audit / analyse / explain / check = read-only (WRITE: none); fix / implement / create = write. Never turn an audit into a fix or a question into an action.
**Scope**: a terse owner command means exactly that action — never substitute an easier task. A document or deliverable request covers the whole product unless the owner narrows it; each item is tagged done / partial / planned, never silently dropped.
**Target echo** (`AGENTS.md` HARD STOP 2): before the first write outside the session's workspace root, echo the target repository and absolute path in the reply and in the brief's WRITE header.

The ledger lives in the step-11 report, not in a file (the PRD router is written only before spawning and at `validated` marks; a ledger file would add writes, while the report goes out every turn). After a context compaction, rebuild the ledger from the last report before acting.

<example>
Ledger after owner message 3: R6 done (/checkout 200, curl 10:47 after last edit) · R7 open: include shop customers in the export · R8 open: answer "why don't we use sonner?" · R9 waiting (owner): staging URL
</example>

**Decisions journal + roadmap.** At every Receive read the project's `docs/decisions.md` and `docs/roadmap.md` (Done / In progress / Next): recorded owner decisions are executed, never re-debated; a risk is flagged once. Record each new owner decision in the journal, dated, one line. Codex has no `@` import in `AGENTS.md` (the loader only concatenates files: https://learn.chatgpt.com/docs/agent-configuration/agents-md), so the project's `AGENTS.md` carries one pointer line naming both files. A missing roadmap or pointer is created by an agent in this mandate (the lead executes nothing; step 11 has `skill-creator` update the roadmap); a read-only mandate (audit / analyse / explain / check, WRITE: none — owner's verb rule) creates nothing: report it missing and create it at the next write mandate.

**Relayed message.** `AGENTS.md` COORDINATOR PATH "Relayed message" (owning rule).

**Check:** every owner sentence maps to a ledger item; no item was invented by the lead; every owner question is an item until answered; no item was closed by an amendment instead of a proof; new decisions are in `docs/decisions.md`; `docs/roadmap.md` exists, its creation is assigned, or (read-only mandate) it is reported missing; the project's `AGENTS.md` points to both.

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

- Scope by the work: a read-only question -> `explore-codebase` alone; anything that touches code -> the Analyze trio below; a trivial 1-3 line change -> `apex-quick`, one agent (still delegated: the lead never edits). Every other task runs the routed APEX workflow in full. The read-only route holds — unless the request also asks to analyse or improve the project: read-only wording ("do not change anything") never cancels ideas mode; launch `brainstorming` ideas mode in the same message.
- Analyze always starts the trio in one parallel message: `explore-codebase` for code analysis, `research-expert` for web or documentation research, and the matching domain expert. Debug ("why", "not working") always goes through Analyze.
- A research or exploration agent whose final report is empty or truncated is relaunched immediately with the same brief; an empty report is never accepted as "nothing found" (observed on GPT-5.6 Terra, codex#32389).
- **Brainstorm** (rule 02, no exception): a new feature, page, section, or component, or any major change -> agent `brainstorming` (design mode) launched in the SAME message as the Analyze trio — never after it, never skipped because the trio or the owner's wording "already describes" the design; it receives the trio's findings by message when they land. An "analyse / improve this project" request -> the same agent in ideas mode. It never asks the owner: it states its assumptions or asks `/root` one binary question, and the lead escalates at most one binary question; a settled owner mandate means no question at all.
- **Project skill**: when `<project root>/.agents/skills/project-<name>/SKILL.md` is missing, read `references/project-skill.md` and launch its bootstrap (`skill-creator` from this Analyze's `explore-codebase` report) in the same mandate, in parallel: it never gates the mandate, a trivial fix proceeds meanwhile. A read-only mandate creates nothing and reports it missing. When the skill exists, every brief names it.

**Check:** a new feature, page, section, component, or major change had `brainstorming` in the same spawn message as the trio; the analysis reports (and, for a new feature, the design doc approved by the lead, or by the owner when escalated or already settled by the mandate) are in hand before any task is cut; the project skill exists, its bootstrap is launched, or (read-only mandate) it is reported missing.

## 4. Decompose — one task = one verifiable deliverable

Cut the ledger into tasks; each task produces one deliverable that can be proven on its own (a file diff, a passing test, a capture). Route by TASK: one agent per task, and the task owns every file it needs. Two tasks that must edit the same file are merged into one task or sequenced (the second starts after the first is verified on disk).

- One agent per task: each task is one verifiable deliverable with exclusive files. Derive the writers from the dependency graph: assign one matching domain executor to each genuinely independent writable lot, with at least one executor for every modification. Keep coupled files with one writer; never invent extra write lots to meet a headcount. Two writers on one file are never allowed.
- At most 6 agents run concurrently — a ceiling, never a minimum; more tasks run in waves of up to 6.
- Use parallel agents only for independent batches with disjoint ownership. Do not parallelize dependent work.
- Map the full chain to its end at the start (producer release → consumer wiring/bump → owner install) and launch every unblocked step in parallel; a downstream step is prepared against the local build while an upstream blocker is resolved, never parked behind it.

**Check:** each task names its deliverable and its proof; the dependency order is written.

## 5. Distribute — ownership table

One named agent per task. Write the table before launching:

| Agent (name) | Task | Exclusive files | Skills to load |
|--------------|------|-----------------|----------------|
| `api-auth` | ... | `src/auth/**` | `$solid:solid-detection` + selected `solid-*`, domain skills, `$ai-pilot:verification` |

- A shared resource (build, simulator, dev server, database) has exactly one owner; the others ask it by message.
- Select the matching domain expert whenever one exists. Never substitute a generic agent for an available domain expert. Implementation always routes to `explore-codebase` plus the stack's domain expert; topical agents (SEO, copy) handle only their sub-part and never act as the executor.
- **UI deliverable** (owning rule: `05-frontend-rules` "Executor"): any web deliverable with a UI — page, site, screen, component styling — is EXECUTED by `design-expert`, the named writer of the markup and styling (HTML/CSS, or the framework's component markup and styles). The framework or language expert (per `01-project-detection`) only wires logic, data and state, after or alongside, in files or blocks `design-expert` does not own; it never writes the styling. `design-expert` "consulted", reviewing, or advising someone else's markup never counts as this route.
- The lead loads only this skill and `$ai-pilot:apex-methodology`; it never applies domain skills itself. Announce the budget in one line: number of agents and their names — never a promised duration.
- When the user explicitly asks for a team, start one immediately: one named agent per task, up to 6 per wave, no debate.
- **Task state.** Each sub-task moves `assigned` → `validated` only after the lead checks the result against the disk; each agent reports only in its own file and never writes another's (router, task PRD, compaction, `current_task` roll-up for every write mandate: `references/prd-mode.md` "Layers").
- **Harness PRD mode** (WRITE mandate, 2+ agents): read `references/prd-mode.md` before the first executor spawn. Summary: the lead runs `prd init` itself (no agent spawned, nothing waits on it); PRD mode is on only when `init` prints `created …` or `exists` and the router exists; the lead writes the task PRD before any executor; every brief carries `PRD mode: on|off` and every executor or helper brief carries "never run `prd init`"; a read-only mandate runs no `harness prd` command.
- **Model tier.** A model or effort tier of any agent TOML changes only on an owner decision quoted, with its date, in the task PRD entry that touches the file; a tier change without that citation is refused at Verify.

**Check:** each task has exactly one agent; every UI deliverable's HTML/CSS is owned by a `design-expert` executor task (not a consult), and any framework expert on it owns only logic/data wiring; no file and no shared resource has two owners (merged or sequenced instead); every brief carries `PRD mode: on|off`; the `references/prd-mode.md` "Check" holds in full.

## 6. Brief — fixed headers, self-contained mandate

Fill `references/brief-template.md`, whose fixed headers are OWNER RULES (verbatim) / WRITE / OUTPUT / TOOLS / PROOF / NON-GOALS / TEAM / LANGUAGE / REPORT. Owner corrections and recorded decisions go first, under OWNER RULES (step 11). A protected path (`~/.codex`, `~/.claude`, a deployed or marketplace path, install scripts) goes into WRITE only when the owner named it in this session; quote the exact sentence, and the agent writes that target and nothing else.

**"Everywhere"** ("everywhere / from any X / on every screen"): `references/brief-template.md` filling rules (grep every place, one test and one real capture per place).

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

Launch every independent agent of the table in one message, each with its task name. For code, the brief asks for tests first (RED, then GREEN). From here the lead only follows. External executors (another CLI or model run outside this tree) write code only: never push, PR, merge, tag, or publish; releases go through `$commit-pro:commit`. **Gate (write mandate, 2+ agents)**: `references/prd-mode.md` "Launch gate" — no executor `spawn_agent` before the lead's own `prd init` output is in hand and, PRD mode on, the task PRD is written.

- When multi-agent V2 is applicable, require `[features.multi_agent_v2]`, its configured `tool_namespace`, an exact `agent_type`, and an explicitly bounded `fork_turns`. V2 documents only `"none"` (the child receives the brief only) and `"all"` (the child receives the full parent history); a numeric value is accepted but mapped to full history (codex rust-v0.169.0 `multi_agents_v2/spawn.rs:221-237`), so the only real bound is `"none"` — pass `"none"` for a fresh-context executor and put everything it needs in the brief. Never omit `fork_turns` (omitted means `"all"`) or use `"all"` with `agent_type`.
- Treat the returned nickname as identity evidence. A task path alone is insufficient to establish agent identity.
- Agents discover each other with `list_agents` and address a target by agent path or name with `send_message` (the lead is `/root`); sibling-to-sibling delivery is not documented, so route peer questions through `/root` when a direct one goes unanswered. A message only enters the receiver's mailbox; it never stops or waits for it. `followup_task` also wakes the target for a new turn and cannot target the root.
- A teammate never spawns executors or teammates. It may launch only the four helpers `research-expert`, `explore-codebase`, `challenger`, and `sniper`, for its own task, and only when the session's depth allows it (Codex `agents.max_depth` defaults to 1: a subagent cannot spawn under V1; V2 enforcement is not confirmed); otherwise it asks `/root`. Its own helper runs never replace the lead's step-10 Control.

**Check:** the lead's own tool calls since step 1 stay within "The lead executes nothing" (no write to a project file except `docs/decisions.md` and the PRD files; no command except read-only verification and the coordinator `prd init` / `prd status` / `prd validate` / `prd compact`; sole other exception: the 2-failed-delegations rule); write mandate with 2+ agents -> the `prd init` output preceded every executor launch; no external executor brief mentions a release step.

## 8. Follow — the owner never asks "is it moving?"

Poll every running executor at a fixed cadence (`wait_agent` with a timeout, `list_agents` status, output files, mtimes, `git diff --stat`, test logs) — a report is a claim until the disk confirms it. Toward the owner, speak only on a result, a blocker, or an owner-only action (`AGENTS.md` "Report outcomes only"), never a status-only relay; the poll keeps the last measurement ready so any owner question is answered at once. Stall = no new output on disk since the last poll: steer the same agent with `followup_task` carrying the precise next step; never spawn a duplicate on the same mandate. External executors included, to the end.

- A message does not stop an agent; it only enters its mailbox. Use `interrupt_agent` (V2; the counterpart of Claude's TaskStop — `close_agent` exists only in V1 and is not registered in V2), then confirm target mtimes are stable before treating the writer as stopped.
- Never assign a second writer to an owned folder. If a collision occurs, name one owner and instruct it to continue from the current on-disk state while preserving both contributions.
- Compare every report with the original request, absorb owner corrections into all active mandates, and keep unresolved parts assigned. Delegation never transfers outcome responsibility away from the lead.
- Do not run final validation while writers are active. A delta sent after spawn is unapplied until the writer explicitly confirms it was integrated.
- Never report "still waiting" twice. On the next turn, make a decision: verify, interrupt and relaunch, reroute, or escalate.
- After 2 failed delegations on a localised, already-measured defect, the lead reads and fixes it itself (the only case where the lead edits); any other blocked mandate past the 3-cycle cap is escalated to the owner with a root-cause note. No relaunch loop.
- **Blocks:** before handing anything back, make the agent try every authorized route: the owner's existing script instead of asking for credentials, a scriptable source or API instead of a bot-walled page, a real browser session instead of a plain fetch. When a hook or gate refuses, read its source and do exactly what the message says before calling it a bug. Only a CAPTCHA, a password, or an approval the owner must type goes back: one line, the exact text to type, naming the routes already tried.
- **Re-measure before "blocked":** before telling the owner a part is blocked, re-measure the block in this turn by attempting the next normal action; a block reported earlier is a dated measurement, not the current state. An aggregate counter (e.g. a "gates 7d" total) is never proof of a current block.
- **Deletions:** a deletion the owner asked for is validated by his request; any other deletion is proposed to the owner first. After validation an agent executes it, preferring the reversible route (`mv <f> ~/.Trash/`), then proves it with `ls`.

**Check:** the lead can answer "where is it?" with the last measurement (time, files changed, tests), never "I don't know"; no owner-facing line is a status-only relay; every "blocked" told to the owner cites a measurement taken this turn; a hand-back names the routes already tried and the gate source was read whenever a gate is blamed.

## 9. Verify — open the real output, tick each part by name

1. Wait for every writer to report and explicitly confirm that all queued deltas are integrated.
2. Verify the artifact on disk after every report. A report or idle notification is not proof of delivery.
3. Open the actual deliverable against the real target (screenshot, extracted frames, running dev server, real DB, installed version — not the manifest or an isolated fixture) per `$ai-pilot:verification` "Look before done" and its "Proof by type" (UI, tests, commit, migration/deploy, platform advice). Tick each ledger item from step 1 by name; an omitted or unproven part is written "not verified". A proven part is stated as guaranteed with its proof; never "I can't guarantee".
4. A `done` cites an observation taken AFTER the last edit to its files (screenshot path, HTTP status, test output), and the report's ledger carries that pointer. If the claim contradicts the lead's own latest observation (e.g. "in place" while the last fetch returned 404), it is not done: the item stays `open`. Migration, deploy, production data, visual items: `references/verify-by-type.md`.
5. **Owner-named reference** (site, file, mockup): it is the bar at Verify — compare the deliverable with it section by section before "done", inside this same cycle: a gap goes back to the same executor as a targeted fix (`followup_task`), never a new full cycle (no new trio, sniper, or commit for it) (`references/verify-by-type.md`).
   - **UI deliverable**: verified against its reference bar before done — the owner-named reference, else 2 named same-domain references — by section-by-section screenshot comparison at the same viewport, light + dark; any section worse than the bar = not done (`05-frontend-rules`; `references/verify-by-type.md`).
     - **Never-do ledger**: a `design-expert` report without its never-do ledger (every rule of `design-method/references/never-do.md`, N1-N18 today: pass / fail / n.a. + capture path) is not a report — resume the same agent and ask for it.
     - **Independent review gate**: before "done" on any UI, launch ONE fresh `design-expert` in review mode, given only the captures + `never-do.md` (never the executor's claims), scoring every rule on the real captures. Any fail → the resumed executor fixes it, the review re-runs on the new captures; done only at 0 fail.
6. Each task verified -> launch the `commit` agent in WIP mode on the working branch (commit only — no push, bump, PR, merge, or tag): standing owner policy (`AGENTS.md` hard stops), never re-asked. One WIP commit per verified task, never one per gate or per retry. When the task's changed files are not tracked in a Git working tree of the owner's project (no repository, untracked target, a copy outside the repo), spawn no `commit` agent and report "no WIP commit: <reason>" (`06-tooling-rules` "WIP mode"). On `main`, `master`, `develop` or `production` the commit agent's branch step creates the working branch first; never a WIP commit directly there.

**Check:** each part has a proof artifact path observed after its last edit, or is marked "not verified"; no done claim contradicts the lead's latest observation; each owner-named reference has its section-by-section comparison; each UI deliverable has light + dark same-viewport captures compared section by section with its reference bar and no section worse; each verified task has its WIP commit hash; each executor report lists the skills it consulted, and a missing one is "not verified".

## 10. Control — core first, no over-engineering

1. Stop or close every writer before the final sniper pass, then confirm relevant mtimes remain stable.
2. Run no validation mid-flight. Hand off to the eLicit, Verify, challenge, and code-quality routes required by `AGENTS.md` only after execution is frozen: `sniper` once on all changes, then the `challenger` before any "done" on a consequential change, root-cause, irreversible action or 2nd-time fix (trivial 1-3 line `apex-quick` change: an executed real check with its output cited instead — `AGENTS.md` COORDINATOR PATH step 10). Gate order (owning rule: `02-apex-workflow` "Mandatory skill routes" "Gate order"): sniper runs ONCE per mandate, after every executor has finished and its deliverable is verified on disk (single-agent change: right after that agent) — never one sniper per task, per gate, or per retry; a challenger verdict on an unchanged diff is cited by its verdict, never re-run; a read-only "why" question (WRITE: none) has no eLicit/Verify/sniper gate and at most one challenger, on its root-cause claim. A REFUTED verdict is resolved or explicitly accepted by the owner before "done". On a new feature or behaviour change the challenger's product lens also checks coherence, usability and consistency, after the verdict and without changing it (`$ai-pilot:challenge`).
   - **Full gate before release**: `references/release.md` (an agent runs the project's full gate; the lead reads its output itself).
3. **Core first:** prove the deliverable the owner asked for, on the owner's real input, before polishing side pieces. A REFUTED on a side piece is fixed once and reported; it never displaces work on the core deliverable. No round cap — order, not count.
4. **No over-engineering** (same definition as rule 08 "Executing the Brief"): the simplest design that meets the request, reusable and maintainable (DRY + SOLID) — the helpers, tests and shared code it implies are good structure. A speculative mechanism beyond the need (new subsystem, replacement for a tool the owner already has, unrequested hardening, "just in case" modes or flags) is proposed in one line in the report, not built.

**Check:** the core deliverable is proven on the owner's real input; sniper ZERO errors and the challenger verdict are in hand; the run holds one sniper per mandate, one WIP commit per verified task, no challenger re-run on an unchanged diff, and at most one challenger on a read-only "why".

## 11. Report — answer first, then learn

**Release.** Mandate complete, or the owner asks for the commit cycle (any wording, any language) -> read `references/release.md` and launch the `commit` agent in full mode: push the working branch, PR, CI, merge (never squash), tag, release — announced in the report, with no further owner step. Before the release PR, `skill-creator` updates `docs/roadmap.md` and the project skill once per mandate (`references/project-skill.md`). Never push a protected branch (`main`, `master`, `develop`, `production`), never force-push or reset without the owner.

Reply in the owner's language, also right after a sub-agent's report; the line cap is owned by `AGENTS.md` AUTONOMY "Replies" (≤10 lines in total for answer, ledger, proof, not verified, WIP commits, merge/release, one recommendation and the next step; `Suggestion:` lines sit outside the cap). Line 1 is the answer (done / not done / blocked). Line 2 is the ledger, compact — `Open: …; Waiting: …; Closed: … (proof)` — listing every `open` or `waiting` item, not only the latest message, plus the items closed this turn, each with its proof pointer. No option menu when one choice is clearly better. Deliverables sit at a path the owner sees (visible folder, sent file, link), never only inside a hidden directory.

**Suggestions**: the agents' REPORT "Suggestions" field, and an ideas-mode `brainstorming` pass when the mandate analysed or improved a project, feed the report's grounded suggestions, the top ones in the final reply one line each as `Suggestion: <idea> → gain: <concrete benefit>` (grounding: rule 08 "Executing the Brief"); proposed, never built without the owner's go.

**Learn:** copy every owner correction verbatim into every current and future mandate, including respawns. Within the same turn, delegate one line encoding it into the skill or agent that failed, in the source repository; never sync to a deployed or marketplace path unless the owner asked. An owner verdict that contradicts a measurement wins and is propagated to every brief already dispatched.

**Check:** line 1 answers the question asked; line 2 names every ledger item still `open` or `waiting`; each agent's final report carries its "Suggestions" field (or "none"); every deliverable path is outside a dot-folder (the project skill under `.agents/skills/` is the owner-chosen exception); `docs/roadmap.md` and the project skill were updated before the release; each correction is grep-able in the failing skill or agent before the turn ends.

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
