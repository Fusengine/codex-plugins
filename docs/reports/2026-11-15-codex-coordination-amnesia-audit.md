# Codex coordination and "amnesia" audit (2026-11-15)

Read-only analysis. Nothing in codex-plugins source or `~/.codex` was changed. The owner picks which corrections to apply.

## 1. Summary

- **Verdict.** The lead is not amnesiac about procedure. It re-read `lead-orchestration` 34 times and `docs/decisions.md` 72 times. What it loses at each compaction is its *own state*: the requests ledger, the agent roster and ownership, and the directions the owner rejected. Its children start with the brief only, and no agent TOML points them to the owner's decisions. Coordination drowns in gates (48 challengers for 17 producers) and in micro-steering (612 messages for 83 spawns).
- **Scope.** Lead session `01a1d6b9` (19.5k JSONL lines, 10 compactions) and its 25 child sessions, 2026-11-13 to 2026-11-15, project `fusebrowser` (Astro). Static audit of AGENTS.md, the 40 agent TOMLs, `lead-orchestration`, the APEX rules, the hooks and the `@fusengine/harness` 0.1.116 sources in `node_modules`.
- **Limits.** Every `spawn_agent` / `send_message` / `followup_task` body and every compaction summary is encrypted, so brief headers cannot be checked. Codex source was read on `main`, not on tag 0.169.0. Exa was unavailable (401). The installed `~/.codex` hooks and config were not read.
- **Owner lesson applied.** Every suggestion below was tested against this rule: it must not remove an owner rule, gate or injected context, and it must not add friction. Two suggestions touch an owner rule's wording. They are marked **owner decision** and are not presented as fixes.
- Anchors: `T:n` = line of the lead transcript. `id8:Ln` = line of a child transcript. `file:line` = codex-plugins path, re-opened before writing.

## 2. Findings by layer

### 2.1 Agents (TOML)

**A1. No agent TOML gives children the owner's decisions, the `/root` report protocol or the re-dispatch refusal**
- Evidence: 81 of 83 spawns use `fork_turns:"none"` (`T:52`). The owner restates himself to children: `dc26:L10` "prend ton temps pour optimiser", then `dc26:L69` "tu peux prendre une semaine". `T:17671` "il prend pas de nouvelle aproches".
- Cause (verified, grep): across `plugins/*/agents/*.toml` (40 files), `decisions.md` appears in 0/40, `re-dispatch` in 0/40, `send_message|followup_task` in 0/40, and `/root` only in 14/40 (the domain experts). These behaviours live only in rule 08 and `lead-orchestration/references/brief-template.md:19-22,78-79`. A child therefore gets them only if the lead's brief carries them. That brief is unverifiable, because it is encrypted.
- Suggestion : add one shared 3-line "child contract" block to every TOML `developer_instructions`. (1) If `docs/decisions.md` exists, read it first and execute it. (2) Your final answer is your end report, in the brief's REPORT format. (3) If re-dispatched on a delivered mandate, verify the disk and refuse. → gain : owner decisions reach every child even when a brief forgets them. This also covers the fresh-context (`fork_turns:"none"`) children.
- Regression check: purely additive (3 lines, one file read). It removes nothing and adds no gate.

**A2. design-expert children (the largest transcripts) receive neither the APEX sub-agent block nor the rules block**
- Evidence: across the 10 design-expert sessions (`d749`, `d6ba`, `da00`, `dbc0`, `dc46`, `dc66`, `dcb4`, `dcf8`, `dd0b`, `d9db`), `## APEX Sub-Agent Instructions` and the 37 KB `## Judgment first` rules occur 0 times. astro, challenger, sniper, explore and research children get both (`da32:L12-13`).
- Cause (UNVERIFIED): `plugins/codex-rules/hooks/hooks.json:15-26` and the ai-pilot `SubagentStart` (`scripts/lib/harness-hook-routes.json:9-12`) both use matcher `""`, so they should fire for every child. design-expert additionally ships its own `SubagentStart` with matcher `"design"` (`plugins/design-expert/hooks/hooks.json:88-97`). Why the injection is missing was not traced.
- Suggestion : have the next agent reproduce one design-expert spawn and capture which `SubagentStart` hooks fire, then make design-expert receive the same injection as its siblings. → gain : rule 08 (hook compliance, report, exit contract) reaches the agent that produced the most work.
- Regression check: restores missing context. It removes nothing.

**A3. sniper helpers fork the sniper's full history (11-39 MB per helper)**
- Evidence: `da0d-e5f7` and `da0d-f45b` replay the parent's `spawn_agent prototype_script_sniper` at `L278` (11 MB each). The `d769-*` helpers are 37-39 MB each. The nested spawns *succeeded*, so depth ≥ 2 is effective on this machine. That refutes the "spawn fails at depth 1" hypothesis.
- Cause (verified): `plugins/ai-pilot/agents/sniper.toml:34-35,54` mandates "TWO spawn_agent tool calls" but never sets `fork_turns` (0/40 TOMLs mention it). The V2 default is `all` (`multi_agents_spec.rs` L665-669, source on `main`).
- Suggestion : in `sniper.toml` Phase 1, add "spawn both with `fork_turns: \"none\"` and a self-contained brief (changed files, scope, question)". → gain : helpers start at ~100 KB instead of replaying tens of MB. No replayed `spawn_agent` calls means no risk of re-execution and no inflated counts.
- Regression check: both mandatory spawns stay. Fresh context is the documented "fresh eyes" intent. No gate is removed.

**A4. Children idle-wait on a gate they are allowed to clear themselves**
- Evidence: `dd0b:L541` reads `[BLOCKED] APEX: explore + research required ... Next: 1. Launch the research-expert agent`. At `dd0b:L559` the child "attend une actualisation de la recherche" and sends messages to `/root` (`L545`, `L587`).
- Cause: `plugins/design-expert/agents/design-expert.toml:39-40` already allows the child to launch `research-expert`/`explore-codebase` "when the depth limit allows". However, the Codex-native `<multi_agent_mode>` says "Do not spawn sub-agents unless ... explicitly ask" (`d749:L7`; native text, source UNVERIFIED). The child resolves the conflict by waiting.
- Suggestion : one line in each domain-expert TOML: "A hook block that demands `research-expert`/`explore-codebase` IS the explicit ask: launch it yourself (`fork_turns:\"none\"`), never wait on `/root` for it." → gain : removes idle waits on a gate that only needed one spawn.
- Regression check: the gate still runs; it just gets satisfied faster. No rule or gate is removed.

**A5. Report format diverges from AGENTS.md, and children over-report**
- Evidence: `d9da` sends 130 messages to `/root` and `d6d4` sends 138. A child admits it at `dc26:L234`: "J'ai trop multiplié les contrôles et les comptes rendus." Yet every child is told (`d749:L6`) that its final channel "is immediately delivered back to your parent agent".
- Cause (verified): `plugins/typescript-expert/agents/typescript-expert.toml:98-104` specifies its own report (status / files_changed / ...). That differs from `AGENTS.md:34` and `plugins/codex-rules/rules/03-agent-teams.md:26` (start / milestone / block / end to `/root`), and no TOML says that the final answer *is* the end report.
- Suggestion : align the TOML report blocks on brief-template REPORT, and state "end report = your final answer (auto-delivered); `send_message` only for start, milestone and block". → gain : fewer duplicate messages and fewer wake-ups of the lead.
- Regression check: every report point required by AGENTS.md is kept. Only exact duplicates disappear.

### 2.2 AGENTS.md and injected rules

**B0. Nuance: AGENTS.md itself is NOT lost**
- Evidence: the full 12,281-char block is present, `truncated:false`, in `replacement_history` after all 10 compactions (`T:17693` index 118). Children get 12.9-13.4 KB complete (`d749:L8`).
- Cause (verified, source only): `compact.rs` re-injects the initial context after compaction (L685-733). 12 KB is far below the 32 KiB `project_doc_max_bytes` (agents-md docs).
- What the "amnesia" really is: (1) assistant and tool history is replaced by one opaque 145 KB summary, keeping only the last 8 assistant messages (`retained_context` 8/8, `verified_answers: []`); (2) a truncated per-prompt rule copy (B1); (3) nothing re-injects decisions, mandate or ledger (W1); (4) `fork_turns:"none"` children get only the brief (A1).
- No suggestion on AGENTS.md size or loading. Changing it would add nothing.

**B1. The per-prompt copy of AGENTS.md is cut in the middle, right at the coordination rules**
- Evidence: 138 developer messages start "Warning: truncated output (original token count: N)", 110 of them at 3,077 tokens (`T:1619`). At `d6d4:L529` the cut reads `**Agents communicate.** Every agent is named; ev…619 tokens truncated…ies. Before invoking the sole exception`. The copy that is most recent in context therefore lacks the end of COORDINATOR PATH, "Agents communicate", "Decisions journal" and the start of "ALWAYS DELEGATE".
- Cause (verified, docs + code): `node_modules/@fusengine/harness/src/policy/claude-md-context.ts:54-69` (`buildClaudeMdContext`, called from `runtime/handle.ts:118`) emits the APEX preamble plus the full `~/.codex/AGENTS.md` on every prompt. The ai-pilot `UserPromptSubmit` entry (`plugins/ai-pilot/hooks/hooks.json:3-12`) has no `additionalContextLimit`, so Codex applies its default cap of about 2,500 tokens with a head-and-tail preview (developers.openai.com/codex/hooks, "additionalContextLimit"). `codex-rules` sets `additionalContextLimit: 0` on its own three entries (`plugins/codex-rules/hooks/hooks.json:10,22,34`), but not on this one. That the installed `~/.codex` copy matches the repo is UNVERIFIED.
- Suggestion : add `"additionalContextLimit": 0` to the ai-pilot `UserPromptSubmit` hook, and to any other context-emitting `UserPromptSubmit` entry (core-guards, design-expert, lessons have none). → gain : the copy re-read on every prompt is whole, so the coordination rules are no longer the part that drops.
- Regression check: removes nothing. It adds the ~600 tokens that are currently cut. Deduplicating the copy instead would remove injected context and is rejected.

**B2. The APEX injection names the wrong project type and a non-Codex agent id; it also feeds the "SOLID generic" blocks**
- Evidence: `Project type detected: react` appears 4 times on the Astro site (`T:248,1274,1578,1580`), along with `fuse-react:react-expert`. That led to `site_react_review` (react-expert) being spawned on Astro. Children also hit "read SOLID references for generic" 25 times (`dd0b:L604`, `dc45:L206`, `d9da:L419`).
- Cause (verified): `ProjectType` has no `astro` (`harness/src/policy/detect-project.ts:5-8`). `detect-claude-md-project-type.ts:39-40` returns `react` on a `react` dependency before any Astro check. Astro configs only serve to rule out "typescript" (`:48`), so a non-React Astro site becomes `generic`. `expert-agents.ts:1-5` resolves agent ids from `agents/*.md` frontmatter, which is the Claude format, hence a Claude id instead of Codex `astro-expert`. Correction to an earlier note: "split at 190" is not a ceiling conflict. It is `splitTarget = maxLines - 10` (`config/limits.ts:21-23`).
- Suggestion : in the `@fusengine/harness` source (upstream package, here at 0.1.116), add an `astro` type, checked on `astro.config.*` before the `react` dependency. Map it to `astro-expert` (and to `.toml` agents when `id === "codex"`) and to `solid-astro` (exists: `plugins/astro-expert/skills/solid-astro`). → gain : correct expert routing and correct SOLID references. That ends the react-expert spawn and the 25 "generic" blocks.
- Regression check: detection only gets more precise. No gate is removed; the SOLID-read gate now points at the right refs.

**B3. Conflict: "ALWAYS DELEGATE" vs an approval token that only the top-level session can carry** (owner decision)
- Evidence: `T:1529` "Le premier agent refuse une confirmation relayée ; le second refuse une autorisation héritée. Je vais exécuter uniquement l'installation exacte dans ce chat". The lead then ran `npm install` itself (`T:1541`, `T:12000`) and `vite` (`T:19490`). In the child: `d6d4:L623` "CONFIRM 16a3 unknown — pending codes: none", and `dc26:L481` "rejection: no-token".
- Cause (verified): `harness/src/runtime/confirm/confirm-subagent.ts:17-22` says that a sub-agent never receives its own `UserPromptSubmit`, so it "is STRUCTURALLY unable to place a CONFIRM token". `AGENTS.md:17` lets the owner authorise a gated command. `AGENTS.md:46,53` forbid the lead from executing anything ("This never licenses the lead to execute the step itself"). The rules give no path that satisfies both.
- Suggestion : the owner decides, then one sentence goes into `AGENTS.md:17`. For example: "an owner-approved CONFIRM command runs once, unchanged, in the session where the code was typed; this is the hook's own path, not a breach of Total delegation." → gain : no more dead end and no lead improvising under a rule it believes it is breaking.
- Regression check: it codifies what the hook already forces and removes no gate. It touches the wording of an owner rule, so it is not applied without the owner.

### 2.3 Workflow (lead-orchestration / APEX / commit / hooks)

**W1. Compaction erases the lead's working state, and nothing re-injects it**
- Evidence: the owner's requirement "tous le site" (`T:1225`) was not carried. At `T:8912` the lead discovers that Motion is missing from the docs pages. The owner boundary "sans toucher aux hooks ni au contenu de mes docs" was restated 4 times (`T:6665`, `T:8922`, `T:12303`, `T:17213`). Each compaction keeps 8/8/0 retained messages plus one encrypted 145 KB summary (`T:17693`). Context sat at 94-96% of the 475k window before each of the 10 compactions.
- Cause (verified):
  - The ledger lives only in the report: `plugins/ai-pilot/skills/lead-orchestration/SKILL.md:30`, "After a context compaction, rebuild the ledger from the last report".
  - The PostCompact reminder reaches the UI only on Codex: `harness/src/runtime/lifecycle/post-compact.ts:38` returns `systemMessage`, and the Codex docs say `systemMessage` is a UI warning.
  - No harness code re-reads `decisions.md` (grep: 0 hits in `harness/src`).
  - Native levers exist but are unused: `SessionStart` with `source:"compact"` injects `additionalContext` before the next request (docs: codex/hooks "SessionStart"), and `compact_prompt` / `experimental_compact_prompt_file` override the summary prompt (docs: codex/config-reference).
- Suggestion (a) : when `source === "compact"`, the codex-rules `SessionStart` hook (already matcher `""`, `plugins/codex-rules/hooks/hooks.json:3-13`) appends the project's `docs/decisions.md` and the PRD router `.codex/apex/prd.json`. → gain : owner decisions and task status are back in model context right after every compaction, with no lead action.
- Suggestion (b) : ship a `compact_prompt` telling the summarizer to keep verbatim the requests ledger with statuses, the negative constraints, the roster and owned files, the directions the owner rejected, and any pending CONFIRM. → gain : the summary carries the state that the 8 retained messages miss. This is config under `~/.codex`, so the owner applies it per HARD STOP 2.
- Regression check: both add context. No new file is written, so the SKILL:30 "no ledger file" design is preserved. No owner text is removed.

**W2. `lead-orchestration` asks for a `fork_turns` value that does not exist**
- Evidence: `fork_turns` is `none` on 81 spawns and `all` on 2 (`site_finish` `T:1499`, `typing_approved`).
- Cause (verified, source on `main`): `SKILL.md:125` requires "bounded `fork_turns`. Never omit `fork_turns` or use \"all\" with `agent_type`". V2 accepts only `all | none`, default `all` (`multi_agents_spec.rs` L665-669).
- Suggestion : replace "bounded" with "`fork_turns: \"none\"` (V2 accepts only `all`/`none`, default `all`); the brief therefore carries everything, starting with OWNER RULES verbatim". Re-check on tag 0.169.0. → gain : no guessing, and an explicit reminder that brief = the child's whole world.
- Regression check: same behaviour as today. Wording only.

**W3. Gates check process, not the defect the owner named**
- Evidence: 48 challengers + 6 snipers for 17 producers. 34 of the 48 are named `*_gate`/`*_elicit*`/`*_verify*`, and `product_verify_gate` was spawned twice (`T:5684`, `T:16950`). The owner rejects work right after a pass: `T:4322` "c'est catastrophioque tu sais de quoi parle le site", `T:15566` "ton site est horrible". The lead itself says at `T:15596` "Je me suis dispersé dans les contrôles et les retouches".
- Cause (verified): `plugins/codex-rules/rules/02-apex-workflow.md:17,19` require a challenger at every eLicit and Verify gate plus before "done", on every iteration. Gate count therefore scales with rework. No gate brief is required to test the owner's named defect against the owner's reference first (`brief-template.md:86` says the reference is the source of truth, but only for executors).
- Suggestion : keep every gate. Add one line to the brief template's gate usage: "a challenger or verify brief's first claim to break = the owner's named defect, judged against the owner's reference (path); the verdict cites it". Name each gate `<task>-<iteration>`, never reuse a name. → gain : gates catch what the owner catches, before the owner does. Unique names keep `send_message` targets unambiguous.
- Regression check: no gate removed, no gate added, no cadence change.

**W4. The owner's CONFIRM is requested through a form that cannot satisfy the hook**
- Evidence: `request_user_input_async` was used 4 times, 3 of them for hook approvals (`T:1418`, `T:11787`, `T:19377`). The owner typed `CONFIRM 16a3` twice (`T:1444`, `T:1548`), and later `T:19537` "le hook exige CONFIRM 78a0 seul dans un message normal du chat, sans passer par le formulaire".
- Cause (verified): only a typed `UserPromptSubmit` places the token (`confirm-subagent.ts:17-22`). `SKILL.md:142` and `AGENTS.md:53` say "the exact text to type" without saying where.
- Suggestion : append to `SKILL.md:142` and `AGENTS.md:53`: "as a plain chat message, never via a form (`request_user_input`)". → gain : one owner turn per approval instead of 2-3.
- Regression check: removes nothing and adds no gate. It removes friction.

**W5. The designer repeats a rejected direction**
- Evidence: design-expert was spawned 10 times, and `design_resume`, `design_rethink` and `proposal_new_approach` were reused through 24-55 messages each. The owner says at `T:17656` "ton designer ce repete", then `T:17671` "il prend pas de nouvelle aproches".
- Cause (verified): `SKILL.md:134` says "steer the same agent with `followup_task` ... never spawn a duplicate on the same mandate". The rejected direction stays in that agent's context. `brief-template.md:19-22` (OWNER RULES) has no slot for rejected directions.
- Suggestion : add an OWNER RULES line "Rejected by owner (verbatim, do not repeat): ...", recorded in `docs/decisions.md`. In `SKILL.md:134`, state that an owner rejection of a direction makes the next attempt a new mandate: a fresh spawn carrying the rejected list. "Never duplicate" stays for stalls. → gain : a new approach becomes a contract term, not a hope.
- Regression check: the stall rule is kept and no gate is added. The `Learn` step (`SKILL.md:175`, corrections copied into respawns) is applied, not changed.

**W6. Fleet polling in 10-second slices**
- Evidence: 386 `wait_agent` calls with only `{"timeout_ms":10000}` (`T:195`, `T:359`), plus 46 `sleep` calls (`T:2224`). Each wake costs a reasoning step and a `token_count` record, which fills the window faster.
- Cause (verified): `SKILL.md:134` says "Poll every running executor at a fixed cadence (`wait_agent` with a timeout ...)" without a value. `wait_agent` already blocks on the mailbox (`multi_agents_spec.rs` L193-371, source).
- Suggestion : "cadence derived from the executor's measured run time (default 60-120 s, configurable); no `sleep` between waits, since `wait_agent` already blocks". → gain : fewer wake-ups, fewer tokens, later compactions.
- Regression check: the follow duty and owner status lines are unchanged. AGENTS.md already says a derivable value is the agent's to pick.

## 3. Priority table (top 5 by impact)

| # | Problem | Suggested correction | Files to touch |
|---|---------|---------------------|----------------|
| 1 | Lead state erased by each of 10 compactions; owner restates boundaries 4x (W1) | Re-inject `docs/decisions.md` + PRD router on `SessionStart source=compact`; ship a `compact_prompt` that keeps ledger, constraints, roster, rejected directions | harness `runtime/lifecycle/inject-rules.ts` (codex-rules SessionStart path); owner's `~/.codex/config.toml` (`compact_prompt`, owner-applied) |
| 2 | Children see only the brief; 0/40 TOMLs point to decisions / report / re-dispatch (A1, A5, W2) | 3-line child contract in every TOML; fix `fork_turns` wording; final answer = end report | `plugins/*/agents/*.toml`; `plugins/ai-pilot/skills/lead-orchestration/SKILL.md:125` |
| 3 | Per-prompt AGENTS.md copy cut at the coordination rules (B1) | `"additionalContextLimit": 0` on ai-pilot (and other context-emitting) `UserPromptSubmit` hooks | `plugins/ai-pilot/hooks/hooks.json:3-12` (+ core-guards, design-expert, lessons `hooks.json`) |
| 4 | Gates check process, not the owner's named defect; designer repeats rejected directions (W3, W5) | Gate brief's first claim = named defect vs owner reference; unique gate names; "Rejected by owner" slot + fresh spawn after a rejection | `lead-orchestration/references/brief-template.md:19-22,86`; `SKILL.md:134` |
| 5 | Wrong project type / Claude agent id / SOLID "generic" on Astro (B2), plus CONFIRM via form (W4) | Add `astro` detection before `react` and Codex `.toml` id resolution; "type it as a plain chat message" | `@fusengine/harness` `policy/detect-project.ts`, `detect-claude-md-project-type.ts`, `expert-agents.ts`; `SKILL.md:142`; `AGENTS.md:53` |

Owner decision needed (not ranked as a fix): B3, the session that executes an owner-approved CONFIRM command (`AGENTS.md:17`).

## 4. Not verified

- Brief contents (fixed headers present or not), child reports and the compaction summary: all encrypted.
- Why design-expert children receive no `SubagentStart` injection (A2): not traced.
- Whether the installed `~/.codex` hooks, harness version and config match the repo (`additionalContextLimit`, `compact_prompt`, `model_auto_compact_token_limit`, `agents.max_depth`, `features.memories`). `~/.codex` was not read.
- Codex V2 facts (`fork_turns` values and default, `wait_agent` semantics, re-injection after compaction) were read on `main`, not on tag 0.169.0. Exa cross-check unavailable.
- `<multi_agent_mode>` / `<multi_agent_role>` wording is Codex-native; its source was not located.
- Whether the owner suspended WIP commits: only one commit spawn (`T:563`, minute 8, before any verified task) versus `SKILL.md:155`, which asks for a WIP commit after each verified task.
- The fusebrowser project's own `docs/decisions.md` and `AGENTS.md` were not read. Whether the hook/docs boundary was recorded there is unknown.
- Root cause of `site_finish` needing 7 interrupts (`T:1530`-`T:5190`): the instructions sent were encrypted.
