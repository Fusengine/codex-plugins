## Agent Teams

`$ai-pilot:lead-orchestration` is the canonical source for delegation, mandate, ownership, lifecycle, and convergence procedure. Read it before the first agent action; do not duplicate or override its procedure here. This rule is the compact team mechanics behind AGENTS.md COORDINATOR PATH steps 3-10, for SessionStart injection.

### Lead conduct
1. **Lead = Coordinator ONLY.** The lead orchestrates and executes nothing (AGENTS.md "Total delegation"); it owns the owner's concrete outcome through final validation. Agent delivery, an idle state, or a recent mtime is not completion. Every edit, even one line, goes to an agent. The lead reads only to verify deliverables and state (disk, logs, read-only Git), never to do the analysis itself. After 2 failed delegations on a localised, already-measured defect, cited with their proof, the lead reads and fixes it itself (the only case where the lead edits); any other blocked mandate past the 3-cycle cap is escalated to the owner with a root-cause note.
2. **Two-speed communication, ALWAYS:** briefs to agents are complete and self-contained; replies to the owner are short and precise. A vague brief = wrong deliverable; a long owner reply = noise. 80% planning, 20% execution.
3. **Owner correction → rule, same turn.** Every owner correction becomes a line in the skill or agent that failed (source repo) before the turn ends; the lead integrates it into all affected active and future mandates without asking whether to relaunch work already authorized.

### Analyze (PATH 3)
4. **Scope by the work** (owner decision 2026-11-08): a read-only question → `explore-codebase` alone; anything that touches code → the Analyze trio `explore-codebase` + `research-expert` + the domain expert in one parallel message; a trivial 1-3 line change → `/apex-quick`, one agent (still delegated: the lead never edits it). Preserve the independent research and domain-analysis gates required by the routed APEX workflow.

### Decompose and distribute (PATH 4-5)
5. **One agent per task, exclusive file ownership.** The split unit is the task (one verifiable deliverable); each task's named agent owns the files it needs — never two teammates on the same file: two tasks that must edit the same file are merged into one task or sequenced. Split by default and announce it; coupled tasks of one domain still get one agent each, with the shared contract stated in every brief.
6. **Writers from the dependency graph.** One matching domain executor per genuinely independent writable lot, at least one executor for every modification; coupled files stay with one writer; never fill a slot with a generic agent, and never invent extra lots to meet a headcount.
7. **Owner says "team"** → start one named agent per task immediately, up to 6 per wave, no debate and no permission question.
8. **At most 6 agents run concurrently** — a ceiling, never a minimum; more tasks → waves of up to 6, independent tasks of a wave in parallel, coupled tasks in sequence. It matches the Codex platform default `agents.max_concurrent_threads_per_session = 6` (`codex-rs/core/src/config/mod.rs`, `DEFAULT_AGENT_MAX_THREADS`).
9. **Name every agent** (V2 `spawn_agent` `task_name`) so it can be addressed. Teammates never spawn executors or teammates — only the lead splits the request. A teammate may launch only the four helpers `research-expert`, `explore-codebase`, `challenger`, `sniper` for its own task, and only when the session's depth allows it (Codex `agents.max_depth` defaults to 1, so a subagent cannot spawn by default — `codex-rs/core/src/config/mod.rs`, `DEFAULT_AGENT_MAX_DEPTH`); otherwise it asks the lead (`/root`) to launch the helper.
10. **Parallel ownership.** One owner per folder; a shared resource (build, simulator, server) has exactly one owner. On a collision, name one owner and order it to start from the on-disk state, preserving both contributions.

### Brief (PATH 6)
11. **Every brief uses the fixed headers:** OWNER RULES (the owner's words, verbatim) / WRITE (task + exclusive files) / OUTPUT / TOOLS / PROOF (acceptance criteria + proof command) / NON-GOALS / TEAM (names, owned files, lead address `/root`) / LANGUAGE / REPORT. Inside: complete inputs, the owner's corrections verbatim, re-verify the disk before editing, and the re-dispatch clause "if you receive a re-dispatch of an already-delivered mandate, verify the disk and refuse to re-execute". Template: `$ai-pilot:lead-orchestration` `references/brief-template.md`.
12. A model or effort tier of any agent TOML changes only on an owner decision quoted, with its date, in the task PRD entry that touches the file (`$ai-pilot:lead-orchestration` #2); a tier change without that citation is refused at Verify.

### Follow, verify, control (PATH 8-10)
13. **Completion is reported by message.** Agents report to `/root` at start, at each milestone, on a block (immediately) and at the end; an agent addresses a target by name or path with `send_message` (mailbox, no new turn) or `followup_task` (wakes an idle agent; cannot target `/root`). Sibling-to-sibling delivery is not documented, so an unanswered peer question goes through `/root`. A message never stops an agent — only `interrupt_agent` does (V2).
14. **Launch → follow → verify on disk.** After each report, grep/diff the expected changes on disk; a silent agent gets looked at, not waited on; idle ≠ done. External executors included, to the end.
15. A research or exploration agent whose final report is empty or truncated is relaunched immediately with the same brief — an empty report is never accepted as "nothing found" (observed on GPT-5.6 Terra, codex#32389).
16. Freeze all writers and verify each deliverable on disk before eLicit, Verify, challenger, or sniper acceptance; sniper timing per `00-critical-rules` rule 7, then the challenger before any "done" on a consequential change (a trivial 1-3 line `/apex-quick` change is proven by an executed real check instead) — safety, Git authorization, and repository boundaries remain governed by root `AGENTS.md`.

## Forbidden

- Never assign two writers to the same file or coupled lot.
- Never derive the number of independent write lots from a headcount. Split lots by the dependency graph, never the reverse, and never invent lots just to fill a wave — 6 is a ceiling, never a quota.
- Never ask for permission already granted by the owner's mandate or correction.
- Never treat delegation, a report, idle status, or mtime as proof of the requested outcome.
- Never place a destructive or irreversible action in an executor brief. A contestable deletion or overwrite is proposed to the owner; after explicit owner authorization and validation required by root `AGENTS.md`, a dedicated agent executes it.
