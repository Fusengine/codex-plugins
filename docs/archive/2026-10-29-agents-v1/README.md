# Archive v1 → v2 mapping — AGENTS.md and lead-orchestration (promoted 2026-10-29)
This folder keeps the v1 originals (`AGENTS.v1.md`, `lead-orchestration.v1.md`) replaced on 2026-10-29 by the outcome-first v2, now live in `AGENTS.md`, `plugins/codex-rules/templates/AGENTS.md.template` and `plugins/ai-pilot/skills/lead-orchestration/SKILL.md`. The tables below map every v1 line to its v2 location.

Sizes (`wc -c`): `AGENTS.md` 9,905 B → `AGENTS.v2.md` 9,971 B. Correction 2026-11-09: the "< 10,000 spill cap" first written here was Claude Code's hook threshold, not a Codex limit. Codex's real AGENTS.md limit is `project_doc_max_bytes` (default 32 KiB), the combined budget of the project AGENTS.md chain (https://learn.chatgpt.com/docs/agent-configuration/agents-md; `codex-rs/core/src/agents_md.rs`). `SKILL.md` 18,903 B / 160 lines → `lead-orchestration.v2.md` 20,557 B / 167 lines.

## AGENTS.md line → v2 location (J = Judgment first, A = Always-on, U = Universal, R = Routes)
| Orig. | v2 location | Change |
|---|---|---|
| 22 s1 (outcome accountability) | J1 | moved; + "procedure serves it, every rule still applies" |
| 8 (owner question mid-task) | J2 | moved; "previous rule" → "the 'Ask only' rule" (no longer follows line 7) |
| 49 (enumerate every part) | J3 | moved; + "including parts added mid-task, carried to an answer" |
| 50 (no done without evidence) | J4 | moved; + "contradiction with own latest observation = not done" |
| 42 (visual: screenshot first) | J5 | moved; + "or claiming a fix" |
| 21 lead-orchestration sentence | R1 | exact duplicate of line 54; merged ("MUST invoke, fully read, and follow") |
| 22 owner-corrections sentence | U6 (orig. 43) | duplicate of 43; merged, keeps "without reopening permission … relaunch" |
| 22 coordination + research-afresh sentences | A2 | verbatim |
| 5-7, 9-11 · 15-17 · 21 rest, 23-24 · 28-33 · 37-41, 44-48 · 54-63 · 67-69 | same sections, same order | verbatim |

Counts: MUST 13 → 12 (the line-21 duplicate of route 54 merged), routes 10 → 10. No rule, gate, route, agent mapping or delegation step removed.

## lead-orchestration diff
- Step 1: checklist = requests ledger (owner questions included; open / done + proof / waiting), carried by the step-9 report; rebuilt from the last report after compaction. No file, no extra write.
- Step 7: new item 4 (proof observed after last edit; visual item = screenshot after last edit; contradiction with latest observation = stays open). Items 4-5 renumbered 5-6, text unchanged.
- Step 9: line 1 = the answer, unchanged; line 2 = the ledger (every open/waiting item + items closed this turn with proof).
- Steps 2-6, 8, Exit Contract, Forbidden: byte-identical (`diff`).

## Challenger fixes (amendment 1)
1. Research-afresh sentence (orig. 22) restored verbatim in Always-on (A2); R4 back to orig. 57 verbatim. Bold labels dropped from J1-J5 to stay < 10,000 B (no rule text removed; that target was the mistaken cap corrected under Sizes above).
2. Ledger moved out of `.harness/apex/requests.md` into the report: the PRD router is written only before spawning and at `validated` marks, never per owner message, so the report is the only zero-new-write carrier.
3. Step 7: visual proof = screenshot after last edit, applying the existing screenshot rule (not a new gate).
4. Step 1 example: heading replaced by a one-line ledger.
5. This README updated: mapping, sizes, this section. Amendment 2: step 9 ledger moved from line 1 to line 2; line 1 stays "the answer", as in the original.
