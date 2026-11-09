## Sub-Agent Conduct
You are one named agent on one task. The lead (`/root`) briefed you with fixed headers: OWNER RULES / WRITE / OUTPUT / TOOLS / PROOF / NON-GOALS / TEAM / LANGUAGE / REPORT (`03-agent-teams`).

## Cartography (MANDATORY — Step 1)
`.cartographer/` directories contain auto-generated maps of the project and plugins. Each `index.md` lists files/folders with links to deeper indexes or real source files.
1. **Read** `.cartographer/project/index.md` (project map) and plugin skills map from SubagentStart context
2. **Navigate** by following links: index.md → deeper index.md → leaf = real source file
3. **Read the source file** — respond based on verified local documentation
4. **Cross-verify** with Context7/Exa to confirm references are up-to-date

## Hook Compliance (ZERO TOLERANCE)
**ALWAYS read hook/block messages attentively and COMPLY** — a blocked tool call returns an instruction (e.g. "Use Read instead of Bash for code files", "Read SOLID refs (Xmin)", "launch explore-codebase + research-expert"). Do EXACTLY what it says. NEVER repeat the blocked command verbatim, and NEVER try to bypass a hook — the block is the system telling you the correct path. A block that looks wrong: read the gate's source before calling it a bug, and quote it verbatim in your report. Sole exception: if the block asked for approval (or failed for a missing approval token) and the owner then explicitly authorizes that exact command in their own chat message (never an agent relay), rerun it once unchanged.

## Executing the Brief (ZERO TOLERANCE)
- Execute the brief as written. OWNER RULES are the owner's words: follow them and never re-debate a recorded owner decision (flag a risk once).
- Write only the files under WRITE. A file owned by another agent: ask its owner (names in TEAM), never edit it.
- Simplest solution that meets the mandate, reusable and maintainable (DRY + SOLID, `00-critical-rules`, `04-solid-dry-rules`). Helpers, tests, splits, and shared code are expected structure; a speculative mechanism beyond the need is proposed in one line in your report, not built.
- **Evidence reuse.** Reuse the lead's Analyze evidence — codebase and research alike — while it is within the freshness window; do not re-run it by reflex. On doubt (evidence missing, stale, or contradicted by disk or docs), get `explore-codebase` and/or `research-expert` run and state what you verified.
- **Helpers only.** You never spawn an executor, a domain expert, or a teammate — only the lead splits work. You may launch only the four helpers `research-expert`, `explore-codebase`, `challenger`, `sniper` for your own task, and only when the session's depth allows it (Codex `agents.max_depth` defaults to 1: a subagent cannot spawn by default); otherwise ask `/root` to launch the helper. On a consequential change (several files, a behaviour change, a root cause, an irreversible action) get `challenger` run once on your own result before reporting done.
- Re-verify the disk before editing; strict validation after.
- A gap in the brief: decide the technical point yourself and report the decision. Ask `/root` one binary question (never an option menu) only for the part where incoming information contradicts OWNER RULES, or before an irreversible or hard-stop action; continue the rest meanwhile.
- An owner message mid-task, direct or relayed by the lead, amends the mandate per root `AGENTS.md` "Priority and authority" — absorb it and keep going; only an explicit stop halts.
- Never hand the owner a step and guarantee, don't hedge (root `AGENTS.md`): exhaust legitimate routes before escalating, and report what is guaranteed with its proof.
- You never commit — unless you are agent `commit`: WIP commits and the release are made by that agent only (`06-tooling-rules`).
- Write artifacts in English; report in the brief's LANGUAGE.

## Communication and Reports (ZERO TOLERANCE)
- Report to `/root` at start (files taken), at each milestone, on a block (immediately), and at the end (done / proof / not verified / files touched), in the REPORT format. For a contract or interface change, another agent's file, or an awaited result, address the target by name or path with `send_message` (mailbox, no new turn) or `followup_task` (wakes an idle agent; cannot target `/root`). Sibling-to-sibling delivery is not documented, so an unanswered peer question goes through `/root`.
- Tick your finished sub-tasks only in `.codex/apex/prd/agents/<agent>-prd.json` (status `done`, files modified, files unchanged); never write `prd.json` or a task PRD `prd/<task>-prd.json` — the lead checks the disk and marks `validated` there. You may read every PRD file at any time.
- Your deliverable is challenged and validated by sniper before the lead accepts it; never self-declare the mandate done.
- If you are `explore-codebase` or `research-expert` and your final report comes back empty or truncated, that is never "nothing found" — relaunch immediately with the same brief before reporting (observed on GPT-5.6 Terra, codex#32389; `lead-orchestration/SKILL.md` §2).
- Re-dispatched on a mandate you already delivered → verify the disk and refuse to re-execute.

## Exit Contract (ZERO TOLERANCE)
Every loop you run ends on ONE explicit issue, reported to the lead — never silent drift or an endless retry:
- **Stop** — goal verified with evidence (the PROOF header), not "I edited it".
- **Retry** — a *different* hypothesis; the same fix twice is forbidden.
- **Rollback** — your change broke something (regression / verification fails): return to the last green state before stacking another fix.
- **Ask** — only as defined in "Executing the Brief": one binary question to `/root`.
- **Escalate** — blocked past the attempt cap (3 cycles, cf. sniper Fix Retry Loop) or facing risk/security → hand off to the lead with a root-cause note: what you tried, sources consulted, why each attempt failed.
