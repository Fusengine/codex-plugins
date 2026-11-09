# Archive v2 → v3 mapping — AGENTS.md (promoted 2026-11-09)
`AGENTS.v2.md` is the v2 template (byte-identical to the root `AGENTS.md` and `plugins/codex-rules/templates/AGENTS.md.template` it replaced). Owner order: "aligner Codex sur Claude. vas y". v3 mirrors the Claude `CLAUDE.md.template`: title / HARD STOPS / COORDINATOR PATH / RECURRING TRAPS / AUTONOMY / "Where the rules live". What is not universal moved to the rule file that owns its topic. Codex has no `@`-import, so rule files are named and opened on demand (OpenAI: "keep the main file concise and reference task-specific markdown files", https://learn.chatgpt.com/guides/best-practices).

Sizes (`wc -c`): `AGENTS.md` 15,759 B → 12,293 B. Rules corpus `plugins/codex-rules/rules/*.md` 30,501 B → 36,897 B. Risk to watch: the `codex-rules` hook previews a long corpus head and tail, so "Mandatory skill routes" (corpus offset ≈ 8.5-10.9 KB) and `03-agent-teams` rule 2 (≈ 14 KB) can fall outside the per-message preview. AGENTS "Where the rules live" names their file, and the model opens it on demand, as in the Claude design. Budget: `project_doc_max_bytes` (default 32 KiB) is the combined budget of the project AGENTS.md chain. The installer copies root `AGENTS.md` to `~/.codex/AGENTS.md` and does not inline the rules (`scripts/lib/install/sync-agents-md-rules.ts`, prune by default), so the installed file is 12,293 B.

Landing check: every v2 sentence of more than 25 characters was searched verbatim in v3 `AGENTS.md` and the rule files. All land, except the 4 lines marked "adapted" or "duplicate" below.

## v2 line → v3 location
| v2 line | Content | v3 location | Change |
|---|---|---|---|
| 5 | outcome accountability | `00-critical-rules` "Judgment first" | moved verbatim |
| 6 | owner question mid-task | AGENTS AUTONOMY | verbatim |
| 7 | enumerate every part | `00-critical-rules` "Judgment first" | moved verbatim |
| 8 | no done without evidence | `00-critical-rules` "Judgment first" | moved verbatim |
| 9 | visual: screenshot first | AGENTS RECURRING TRAPS | verbatim |
| 10 | core first | `00-critical-rules` "Judgment first" | moved verbatim |
| 14 | this file overrides skills | AGENTS HARD STOPS intro line | verbatim |
| 15-16 | reversible edits authorized; ask only | AGENTS AUTONOMY | verbatim |
| 17 | never refuse | AGENTS AUTONOMY | verbatim |
| 18 | relayed message | AGENTS COORDINATOR PATH "Relayed message" | verbatim (as in Claude) |
| 19 | no mandate → one next step | AGENTS AUTONOMY | verbatim |
| 20 | never hand the owner a step | AGENTS AUTONOMY | verbatim |
| 21 | deliverables where the owner sees them | AGENTS AUTONOMY | verbatim |
| 25 | identity, latest stable | `00-critical-rules` "Identity and communication" | moved verbatim; replaces 00's old pointer line to AGENTS |
| 26 | expert owner, concise | `00-critical-rules` "Identity and communication" | moved verbatim |
| 27 | reply language / English artifacts | `00-critical-rules` "Response Language" lines 1-2 | duplicate: same two rules already there |
| 31 | ALWAYS DELEGATE / total delegation / scope / cap 6 / team | AGENTS RECURRING TRAPS "Total delegation" | verbatim |
| 32 | coordinate by dependency, research afresh | `03-agent-teams` rule 2 | moved verbatim (appended) |
| 33 | sequential thinking | `00-critical-rules` "Judgment first" | moved verbatim |
| 34 | cartography path | `08-subagent-conduct` "Cartography" | adapted: "the research/browser trigger below" → "(`02-apex-workflow` "Mandatory skill routes")" |
| 38-47, 49 | COORDINATOR PATH 1-9, 11 | AGENTS COORDINATOR PATH | verbatim |
| 48 | PATH 10 Control | AGENTS COORDINATOR PATH 10 | adapted: "the code-quality route below" → "(`02-apex-workflow` "Mandatory skill routes")" |
| 51, 53 | Agents communicate; Decisions journal | AGENTS COORDINATOR PATH | verbatim |
| 57 | Git via commit agent | AGENTS HARD STOP 1 | verbatim |
| 58 | never commit on protected branches | AGENTS HARD STOP 1 | verbatim |
| 59-61 | scope, secrets, deployed, source repo | AGENTS HARD STOP 2 | verbatim |
| 62 | hooks | AGENTS HARD STOP 5 | verbatim |
| 66 | DRY + SOLID first principle | `00-critical-rules` "DRY Priority" intro | moved verbatim |
| 67 | sole file-size ceiling | AGENTS RECURRING TRAPS "Never invent a constraint" | verbatim + Claude's "hook ceiling blocks a fix → report it" |
| 68 | read target, preserve readers | `00-critical-rules` Code Error Prevention 2 | moved verbatim |
| 69 | owner attribution | `00-critical-rules` Code Error Prevention 8 | moved verbatim |
| 70 | JSDoc | `04-solid-dry-rules` | moved verbatim |
| 71-73 | owner correction, mtime, short verdict | AGENTS RECURRING TRAPS | verbatim |
| 74 | guarantee, don't hedge | AGENTS AUTONOMY | verbatim |
| 75 | never repeat a failed fix | `00-critical-rules` Code Error Prevention 9 | moved verbatim |
| 76 | regression = failing check | `00-critical-rules` Code Error Prevention 10 | moved verbatim |
| 80 | lead-orchestration route | AGENTS HARD STOP 0 | adapted: merged into HARD STOP 0, every term kept (delegation, subagent, team, ownership, mtime, agent-lifecycle, MUST invoke/fully read/follow, before the first agent action) |
| 81, 83-88 | APEX, research, eLicit, challenge, verification, code-quality, apex-quick routes | `02-apex-workflow` "Mandatory skill routes" | moved verbatim |
| 82 | SOLID route | `04-solid-dry-rules` | moved verbatim |
| 89 | commit route | AGENTS HARD STOP 1 | verbatim |
| 90 | memory compaction | `06-tooling-rules` "Memory Hygiene" | moved verbatim |
| 94-96 | repository invariants | `06-tooling-rules` "Repository invariants" | moved verbatim |

## Added (from Claude, absent in v2)
- HARD STOP 4: "A message does NOT stop an agent … Only `interrupt_agent` stops it; confirm the mtimes stopped before reporting a state frozen." Before this, the line lived only in `03-agent-teams` rule 13 and `lead-orchestration`.
- AUTONOMY: "Each owner correction → a rule in the skill or agent that failed, same turn" (points to `03-agent-teams` rule 3, already there).
- "Where the rules live": one line per rule file 00-08 with its topics, plus the key skills.

## Cross-references updated (v2 section names no longer exist)
`00-critical-rules` (Mandatory skill routes, code-quality route → `02-apex-workflow`); `02-apex-workflow` (Shortcuts → "below"); `04-solid-dry-rules` ("Universal safety and quality" → RECURRING TRAPS); `06-tooling-rules` ("Priority and authority" → COORDINATOR PATH "Relayed message"; "Hard stops" → HARD STOPS 1); `08-subagent-conduct` ("Priority and authority" → AUTONOMY).

## Wording changed in place (meaning unchanged)
`02-apex-workflow` Shortcuts and eLicit Modes: "no option may skip eLicit, Verify or sniper" → "eLicit, Verify and sniper cannot be skipped by any option". The old wording matched the routing test's contradiction probe `(skip|bypass) eLicit|Verify|sniper` once 02 became a test destination.

## Tests moved with the content
`scripts/lib/agents-md-routing.test.ts` and `scripts/lib/agent-orchestration-contract.test.ts` now assert each moved phrase in its new file, with the same regex. Details:
- Route test: routes are collected from AGENTS.md plus the rules, and the required set is unchanged. AGENTS.md must still name `$ai-pilot:lead-orchestration`, `$ai-pilot:apex-methodology`, `$commit-pro:commit` and `$commit-pro:git-flow`.
- `commit-from-source`: the regex order is reversed, because the commit route now sits in HARD STOP 1, before the source-repo line in HARD STOP 2.
- AGENTS.md no longer forbids the name `interrupt_agent`, because HARD STOP 4 names it on purpose, and a new assertion requires that HARD STOP. `TaskStop`, `fork_turns`, `agent_type` and `nickname` stay forbidden there, and so does "mtime … busy/stale".

## Installed size
Default install (prune): `~/.codex/AGENTS.md` = root `AGENTS.md` = 12,293 B. Legacy merge (`FUSE_RULES_MERGE_AGENTS_MD=1`): 49,271 B (v2 with the same rules: 52,737 B). Both are measured with `mergeRulesSection`, without a real install.
