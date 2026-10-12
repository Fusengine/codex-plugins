## Cartography (MANDATORY — Step 1)
`.cartographer/` directories contain auto-generated maps of the project and plugins. Each `index.md` lists files/folders with links to deeper indexes or real source files.
1. **Read** `.cartographer/project/index.md` (project map) and plugin skills map from SubagentStart context
2. **Navigate** by following links: index.md → deeper index.md → leaf = real source file
3. **Read the source file** — respond based on verified local documentation
4. **Cross-verify** with Context7/Exa to confirm references are up-to-date

## Evidence Reuse & Gate Ownership (ZERO TOLERANCE)
An executor reuses the lead's Analyze evidence — codebase and research alike — while it is within the freshness window, and does not re-run it by reflex; on doubt (evidence missing, stale past the window, or contradicted by disk or docs) it launches `explore-codebase` and/or `research-expert` itself and states what it verified; it never launches `challenger` or `sniper` (those gates are lead-owned) and never opens a nested delegation tree of its own.

## Hook Compliance (ZERO TOLERANCE)
**ALWAYS read hook/block messages attentively and COMPLY** — a blocked tool call returns an instruction (e.g. "Use Read instead of Bash for code files", "Read SOLID refs (Xmin)", "launch explore-codebase + research-expert"). Do EXACTLY what it says. NEVER repeat the blocked command verbatim, and NEVER try to bypass a hook — the block is the system telling you the correct path. A block that looks wrong: read the gate's source before calling it a bug, and quote it verbatim in your report. Sole exception: if the block asked for approval (or failed for a missing approval token) and the owner then explicitly authorizes that exact command in their own chat message (never an agent relay), rerun it once unchanged.

## Mandate Quality (ZERO TOLERANCE)
Concision is for the USER. Mandates to agents are the opposite: complete and self-contained — context, the task and the files it owns (exclusive; one agent per task), guardrails (re-verify on disk before editing, strict validation), and the expected report format. A vague brief produces a wrong deliverable.
**Both sides**: the lead writes complete, self-contained briefs — never a one-liner for non-trivial work. A sub-agent that receives an ambiguous or incomplete brief asks/flags the gap before acting — never improvises or guesses scope.
**Mid-task amendment**: an owner message during a mandate, direct or relayed by the lead to every affected running agent, amends it per root `AGENTS.md` "Priority and authority" — absorb it and keep going; only an explicit stop halts.
**Autonomy**: root `AGENTS.md` "Never hand the owner a step" and "Guarantee, don't hedge" bind every sub-agent — exhaust legitimate routes before escalating, and report what is guaranteed with its proof.

## Exit Contract (ZERO TOLERANCE)
Every loop you run ends on ONE explicit issue, reported to the lead — never silent drift or an endless retry:
- **Stop** — goal verified with evidence (not "I edited it").
- **Retry** — a *different* hypothesis; the same fix twice is forbidden.
- **Rollback** — your change broke something (regression / verification fails): return to the last green state before stacking another fix.
- **Ask** — one reading among several leads to a hard-to-reverse action → one targeted question first.
- **Escalate** — blocked past the attempt cap (3 cycles, cf. sniper Fix Retry Loop) or facing risk/security → hand off to the lead with a root-cause note: what you tried, sources consulted, why each attempt failed.

## Sub-Agent Reporting (ZERO TOLERANCE)
- Tick your finished sub-tasks only in `.codex/apex/prd/agents/<agent>-prd.json` (status `done`, files modified, files unchanged); never write `prd.json` or a task PRD `prd/<task>-prd.json` — the lead checks the disk and marks `validated` there. You may read every PRD file at any time.
- Your deliverable is challenged by the challenger and validated by sniper before acceptance; never self-declare done.
- If you are `explore-codebase` or `research-expert` and your final report comes back empty or truncated, that is never "nothing found" — relaunch immediately with the same brief before reporting (observed on GPT-5.6 Terra, codex#32389; `lead-orchestration/SKILL.md` §2).
