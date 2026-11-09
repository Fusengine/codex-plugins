## Response Language
- Replies to the user: **in the user's language** (per the user's own configuration), including the reply right after a sub-agent's report — a shared rule must NEVER hardcode a human language, or every plugin user is forced into it
- Written artifacts — docs (*.md), **code comments, lessons (`MEMORY/LESSON.md`), commit messages, CHANGELOG, skill/agent files**: **English** (international standard), regardless of conversation language
- Code identifiers, technical terms: **original form** (never translate)
- Identity and posture (skeptical, analytical, latest stable versions, the user is the expert): AGENTS.md "Identity and communication" — not repeated here

## Writing Style (ALWAYS)
- Clear, concise, precise. Lead with the answer, then only the details that change a decision
- NEVER write like a dictionary — no exhaustive lists when one answer is expected, no theory recap before the point, no restating what the user already knows

## DRY Priority (BEFORE writing ANY code)
1. **Grep first** - Search codebase for existing functions, hooks, utils, services
2. **Reuse > Create** - Extend existing code instead of creating new
3. **Shared first** - If used by 2+ features, create in shared location directly (see 04-solid-dry-rules)
4. **Extract at 3** - 3+ occurrences of same logic = extract to shared helper
5. **Never copy-paste** - Import and reuse, never duplicate logic blocks

## Code Error Prevention (ZERO TOLERANCE)
1. **NEVER invent an API** - library call/option/config key not 100% certain → verify FIRST: ① fuse-browser fast-path (`browser_fetch` / `browser_serp_batch` on known doc URLs) → ② Context7 (official docs) → ③ Exa code context (cross-check across all three). Docs > memory
2. **NEVER edit a file not read in this session** - Read the target file before ANY Edit. The lead reads only to verify deliverables and state, never to do the analysis itself (`03-agent-teams`)
3. **Match existing conventions** - grep a sibling file (same type/folder) before introducing any new pattern, naming, or error-handling style
4. **Zero dangling references** - after any edit or file split, verify imports, exports, and types still resolve
5. **NEVER report done with failing checks** - done = sniper ZERO errors (lint + types) AND `verification` passed (AGENTS.md COORDINATOR PATH 9: real output opened, each part of the request ticked by name, proof by type; unverified = "not verified"). A hidden failure is a lie, not a completion
6. **Challenger before any claim (lead)** - before reporting a root cause, a done/verified claim on a consequential change (several files, a behaviour change), an irreversible action (commit/deploy/rm/push) or a second attempt at a fix, the LEAD runs the `challenger` agent in a fresh context and gets CONFIRMED / REFUTED / UNCERTAIN; a REFUTED is resolved or owner-accepted before the claim reaches the owner; also at every eLicit and Verify gate of full APEX (AGENTS.md "Mandatory skill routes", `$ai-pilot:challenge`). A trivial 1-3 line `apex-quick` change is proven by an executed real check (test/build/run) instead of the challenger; eLicit and sniper still run (owner decision 9). challenger = claims and root causes; sniper = code
7. **sniper timing** - a single-agent change gets sniper right after that change; several agents get one sniper pass, after all of them have finished and their deliverables are verified on disk (AGENTS.md code-quality route)
