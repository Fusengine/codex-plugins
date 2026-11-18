> **Superseded by owner correction 2026-11-18 (`docs/decisions.md`).** The matrix, the `max` tiers and the benchmark gate below were replaced by the owner's decision; the current policy lives only in [`docs/workflow/agents.md` § Model Policy](../workflow/agents.md#model-policy). Body kept unchanged as a record.

# Model fleet 6.2 — design (Status: Draft)

Date: 2026-11-18. Author: brainstorm-matrix. Mode: design.
Owner rule (verbatim, `docs/decisions.md:14`): « okay sol 6.2 est sorti on vas reorganisé tous propremet repense ».
Inputs: `docs/reports/model-fleet-6.2-research.md` (cited **R§n**), `docs/reports/model-fleet-6.2-explore.md` (cited **E§n**), `docs/workflow/agents.md:7-23` (the 2026-10-29 blind benchmark, cited **B1029**), `scripts/lib/agent-toml.ts`, `scripts/lib/agent-toml.test.ts`, `scripts/lib/agent-tier-matrix.test.ts`.

## 0. Frame

Problem: one new candidate model exists (`gpt-6.2-sol`, R§1, R§5), and the fleet encoding is tied to one model id (`TERRA_*` names, single-literal type, tests keyed on `"gpt-6.1-terra|…"`, E§6.5). The rethink must (a) place Sol 6.2 only where facts support it, (b) make the next switch a value change, (c) fix the recorded drift, (d) remove no owner rule, gate or context and add no friction (project lesson 2026-10-29).

Success criteria:
1. A 40-agent matrix where every non-default placement cites a fact.
2. After the cleanup, a model switch edits one table in `agent-toml.ts` plus the policy paragraph in `docs/workflow/agents.md`; no identifier rename, no test rename.
3. Every existing lock stays (exact per-tier membership, total 40, zero `ultra`, map-vs-disk parity, dated-JSDoc citation vs v1.0.50).
4. Drift items E§6.1, E§6.2, E§6.5 closed.

Assumptions (no question needed):
- A1. Rule 12 (`plugins/codex-rules/rules/03-agent-teams.md:23`) holds: tier values change only after an owner decision quoted with its date. The 2026-11-18 decision opens the rethink but explicitly conditions it on a grounded matrix (`docs/decisions.md:14`). So the cleanup ships first, value-neutral; the matrix values ship after the benchmark below and the owner's go on the numbers.
- A2. The coordinator stays outside the policy (`docs/workflow/agents.md:10-11`).
- A3. Astra is out: 4x Sol prices (R§3), Sol 6.2 within 0.5 points of Astra on FrontierCode 2.0 at about one-fifth the cost (R§4), and the owner already dropped Astra for cost on 2026-09-23 (« supprime astra il coute chere », `docs/workflow/agents.md:43`).
- A4. `ultra` stays excluded: it is "maximum reasoning with automatic task delegation" (R§2), which conflicts with "only the lead spawns agents" and with the owner's 2026-10-29 words "Do not use `ultra`" (`agent-toml.ts:27-29`). Nothing in R gives a counter-argument.
- A5. Security-expert stays on Terra: the 6.2 system card reports tightened default cyber restrictions (R§4, last bullet). The owner wants a local attacker role (`docs/workflow/agents.md:85-88`), so a stricter model risks refusals. Its TOML is also pilot-locked (lesson 2026-11-10).

## 1. Diverge → converge

Technique: SCAMPER on the "model per agent" mapping, plus reverse brainstorming ("how would we make the next switch painful?").

| # | Option | Kept? |
|---|---|---|
| 1 | All 40 on Sol 6.2 medium (AA 57 vs 51, same cost per task at max, R§4) | No. It repeats the 2026-09-27 / 2026-09-30 all-Sol states that B1029 reversed, contradicts B1029 on executors and visual work, and doubles token price for executors |
| 2 | Status quo, all Terra | No. It ignores the owner's request to rethink |
| 3 | Sol 6.2 only for judgment gates and authoring (high/max tiers), Terra for executors, visual and security | **Recommended** |
| 4 | Option 3 plus research/explore on Sol 6.2 | Partly: `research-expert` only (low volume, judgment over sources). `explore-codebase` is high-volume and was never weaker on Terra |
| 5 | Sol 6.2 at lower effort (`low`) for executors, to offset 2x token price | No. Sol/low was "no better" in 2026-09-23 (`agents.md:55-56`), and there is no 6.2 low-effort data (R§4) |
| 6 | Astra for `design-expert` (vendor frontend claims, R§4) | No (A3). Terra max won every visual test (B1029) |
| 7 | Encode by model id (status quo encoding) | No. Reverse brainstorming says this is exactly what makes switches painful (E§6.5) |
| 8 | Role tiers mapped to `{model, effort}` in one table | **Recommended** for the encoding |

Converge (top 3):

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| A. Option 1, all Sol 6.2 | One value; best public index | Contradicts B1029 on executors and visual; 2x token price on 32 high-volume agents; re-opens Sol 6.1 failures ("no tools", capacity) fleet-wide | Rejected |
| B. Option 3+4 with role tiers (8) | Sol 6.2 only where reasoning dominates and volume is low; executors keep the measured winner; next switch = one table | Sol placements depend on 3 unverified points (R "Not verified") | **Recommended** |
| C. Status quo values + role tiers only | Zero risk | Does not answer the owner's rethink | Fallback per tier if the benchmark fails |

## 2. Proposed matrix (40 agents)

Tier names are roles, not models. Recommended values after the benchmark:

| Tier | `{model, effort}` | Count |
|---|---|---|
| `EXECUTOR` | `gpt-6.1-terra` / `medium` | 31 |
| `VISUAL_GATE` | `gpt-6.1-terra` / `max` | 1 |
| `SECURITY_GATE` | `gpt-6.1-terra` / `max` | 1 |
| `JUDGE` | `gpt-6.2-sol` / `high` | 5 |
| `ADVERSARIAL_GATE` | `gpt-6.2-sol` / `max` | 1 |
| `RESEARCH` | `gpt-6.2-sol` / `medium` | 1 |
| **Total** | 33 Terra (31 medium + 2 max) + 7 Sol 6.2 (1 medium + 5 high + 1 max), 0 Astra, 0 `ultra` | **40** |

| Agent | Tier | Model | Effort | Reason (source) |
|---|---|---|---|---|
| astro-expert | EXECUTOR | gpt-6.1-terra | medium | Terra medium = Sol medium on code executors, 27/27 hidden tests, 1.5x faster, 3x cheaper (B1029); Sol 6.2 is 2x Terra per token (R§3) |
| devops-expert | EXECUTOR | gpt-6.1-terra | medium | Same executor shape (B1029); added on the default 2026-11-10 (`agent-toml.ts:23-25`) |
| go-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| hermes-expert | EXECUTOR | gpt-6.1-terra | medium | B1029; default since 2026-11-09 (`agent-toml.ts:20-22`) |
| laravel-expert | EXECUTOR | gpt-6.1-terra | medium | Blind Laravel review 31/40 equal Terra/Sol (B1029) |
| nextjs-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| php-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| react-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| rust-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| shadcn-ui-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| swift-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| tailwindcss-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| tanstack-start-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| typescript-expert | EXECUTOR | gpt-6.1-terra | medium | B1029 executors |
| sniper-faster | EXECUTOR | gpt-6.1-terra | medium | Bounded mechanical fixes; Terra fastest on bounded work (`agents.md:120-126`) |
| commit | EXECUTOR | gpt-6.1-terra | medium | Scripted flow under hard stops; no fact favours Sol 6.2; unchanged keeps the release flow stable |
| commit-detector | EXECUTOR | gpt-6.1-terra | medium | Mechanical intent detection (E§1) |
| cartographer | EXECUTOR | gpt-6.1-terra | medium | Mechanical map generation (E§1) |
| lessons-compactor | EXECUTOR | gpt-6.1-terra | medium | Proposes only, owner approves (rule 06 "Memory Hygiene"); low stakes |
| explore-codebase | EXECUTOR | gpt-6.1-terra | medium | High-volume (every Analyze trio, rule 03 PATH 3); 2x token price would multiply; Terra fine since 2026-09-02 (`agents.md:79-80`) |
| websearch | EXECUTOR | gpt-6.1-terra | medium | Defined as "speed > depth" (agent description); Terra cheaper per token (R§3) |
| changelog-watcher | EXECUTOR | gpt-6.1-terra | medium | Monitoring, bounded (E§1) |
| seo-expert | EXECUTOR | gpt-6.1-terra | medium | Analysis/executor, no 6.2 fact for SEO |
| seo-cluster | EXECUTOR | gpt-6.1-terra | medium | Same |
| seo-content | EXECUTOR | gpt-6.1-terra | medium | Same |
| seo-geo | EXECUTOR | gpt-6.1-terra | medium | Same |
| seo-images | EXECUTOR | gpt-6.1-terra | medium | Mechanical (E§1) |
| seo-local | EXECUTOR | gpt-6.1-terra | medium | Same as seo-expert |
| seo-schema | EXECUTOR | gpt-6.1-terra | medium | Same |
| seo-sitemap | EXECUTOR | gpt-6.1-terra | medium | Mechanical (E§1) |
| seo-technical | EXECUTOR | gpt-6.1-terra | medium | Same as seo-expert |
| design-expert | VISUAL_GATE | gpt-6.1-terra | max | Terra max won every visual test (B1029); no Sol 6.2 vision/UI data (R§4); vendor frontend claims are for Astra only (R§4) |
| security-expert | SECURITY_GATE | gpt-6.1-terra | max | A5: tightened 6.2 cyber defaults (R§4) vs local attacker role; pilot-locked TOML |
| challenger | ADVERSARIAL_GATE | gpt-6.2-sol | max | Low volume, pure reasoning; AA 57 vs 51 at max and 7.9 vs 14.3 min per task at about the same cost per task (R§4) |
| sniper | JUDGE | gpt-6.2-sol | high | Judgment gate after every change; higher index (R§4); fewer output tokens offset the 2x price (R§4 "~39% fewer") |
| brainstorming | JUDGE | gpt-6.2-sol | high | Diverge/converge reasoning; R§4 index; low volume |
| prompt-engineer | JUDGE | gpt-6.2-sol | high | Authoring judgment; R§4 index; low volume |
| skill-creator | JUDGE | gpt-6.2-sol | high | Authoring judgment; R§4 index; low volume |
| solid-orchestrator | JUDGE | gpt-6.2-sol | high | Architecture audit judgment; R§4 index |
| research-expert | RESEARCH | gpt-6.2-sol | medium | Weighs sources (synthesis, not volume); GDPval v2 +5.3 over 6.1 Sol (R§4); kept at `medium`, its current effort |

Effort is unchanged for every agent (only the model moves for 7), so no tier goes up or down in reasoning budget, just in model.

## 3. Structural cleanup (value-neutral first)

Target shape of `scripts/lib/agent-toml.ts`:
- `type ModelId = string` validated against an `ALLOWED_MODELS` const (today `["gpt-6.1-terra"]`; Phase 2 adds `"gpt-6.2-sol"`), `type Effort = "low" | "medium" | "high" | "xhigh" | "max"` (no `ultra` in the type; R§2 lists all six, and leaving `ultra` out of the type makes the exclusion a compile error, not only a test).
- `type Tier = "EXECUTOR" | "VISUAL_GATE" | "SECURITY_GATE" | "JUDGE" | "ADVERSARIAL_GATE" | "RESEARCH"`.
- `export const TIER_PROFILES: Record<Tier, ModelProfile>` — **the only place a model id or effort appears**. Phase 1 values reproduce today exactly: EXECUTOR and RESEARCH = Terra/medium; JUDGE = Terra/high; VISUAL_GATE, SECURITY_GATE, ADVERSARIAL_GATE = Terra/max.
- `export const AGENT_TIERS: Record<string, Tier>` (40 entries, grouped by tier); `AGENT_MODEL_PROFILES` stays exported, derived from `AGENT_TIERS` + `TIER_PROFILES`, so existing consumers (`security-agent-pilot.test.ts:6`, `agent-tier-matrix.test.ts:24`) keep working.
- `FALLBACK_TIER = "EXECUTOR"`.
- JSDoc: dated decision lines stay (the dated-citation test needs them, `agent-tier-matrix.test.ts:103-115`); the policy prose moves to a link to `docs/workflow/agents.md#model-policy` (lesson 2026-09-27: history lives in one place).

Tests, by role not by model id:
- `agent-toml.test.ts`: `EXPECTED_TIERS: Record<Tier, string[]>` (names per tier, explicit lists = the lock), expected `{model, effort}` read from `TIER_PROFILES[tier]`; keep `size === 40`, per-tier lengths, "every shipped model is in `ALLOWED_MODELS`" (replaces `!== "gpt-6.1-terra"` and `=== "gpt-6.1-sol"` and is at least as strict), zero `ultra`. Scenario test (lines 32-49) asserts tier → profile instead of literals; `future-agent` → `EXECUTOR`.
- `agent-tier-matrix.test.ts`: `byTier` keyed by `Tier`, disk profile must equal `TIER_PROFILES[tier]`; names renamed from `TERRA_MAX_NAMES`/`TERRA_HIGH_NAMES` to role names; map-vs-disk parity and the dated-citation test unchanged.
- Proof of neutrality for Phase 1: `bun run sync:agents` then `git diff --stat plugins/*/agents/*.toml` = empty; `env -u RALPH_MODE bun test` green; `bun run validate` green.

Phase 2 (after benchmark + owner go) = edit `TIER_PROFILES` values (and `ALLOWED_MODELS`), move `research-expert` key if needed, add dated JSDoc lines for the 7 moved agents, `bun run sync:agents`, update per-tier expected counts only where the tier set changes (it does not: tier membership is fixed in Phase 1, which is why `RESEARCH` exists as its own tier already).

### Executor lots (disjoint files)

| Lot | Agent (domain per rule 01) | Exclusive files | Depends on |
|---|---|---|---|
| A — encoding | `typescript-expert` | `scripts/lib/agent-toml.ts`, `scripts/lib/agent-toml.test.ts`, `scripts/lib/agent-tier-matrix.test.ts` | none |
| B — canonical docs | `prompt-engineer` (`.md` docs; avoids the design-expert `.toml` hook lesson) | `docs/workflow/agents.md` (policy paragraph rewritten around the tier table, stated once; inventory unchanged), `docs/reference/creating-skills-agents.md` (lines 45-46, 57-72: stale 38/30 replaced by a link to the policy), `docs/task-list.md:9` (×30 → link), `README.md:47` (catalog-dynamic wording) | A (tier names) |
| C — agent-creator skill | `prompt-engineer` (second named instance) | `plugins/ai-pilot/skills/agent-creator/SKILL.md` (94, 98-100, 184), `references/frontmatter.md` (73-80), `references/architecture.md:55-56`, `references/templates/agent-template.md` (138-139), `references/templates/agent-template-examples.md:121`, `references/required-sections.md` (check only, E§7) | A (tier names), B (anchor name) |
| D — security baseline drift | `typescript-expert` (second instance) | `docs/validation/security-agent-pilot/baseline.toml` (model line only, `gpt-6.1-sol` → the security tier's model, per the precedent at `CHANGELOG.md:186,212`), `docs/validation/security-agent-pilot/baseline.toml.sha256`, `docs/validation/security-agent-pilot.md:5,63` | none (independent) |
| E — Phase 2 values | owner of Lot A, re-dispatched | `scripts/lib/agent-toml.ts` values + 40 regenerated `plugins/*/agents/*.toml` (via `bun run sync:agents`) + the policy paragraph in `docs/workflow/agents.md` (handed from B's owner by SendMessage) | A, B, C, D done; benchmark passed; owner go recorded in `docs/decisions.md` (rule 12) |

Order: A ∥ D → B → C → (benchmark) → E. Lead-only: `docs/decisions.md`. Commit agent: `CHANGELOG.md`, `.agents/plugins/marketplace.json`, version bumps. Not touched: `docs/validation/agent-fleet-corrections.md:13`, `docs/GAP-HARNESS.md:94`, evidence JSON, CHANGELOG history (historical records, E§6.3, E§6.6).

Lot D note: the baseline is frozen; only the `model` line changes (merge, never replace — lesson 2026-11-10). No test checks the sha256 (E§6.2); adding one would touch Lot A's files, so it is listed as a suggestion (section 7).

## 4. Blind benchmark protocol (10 runs)

Method reused from `docs/workflow/agents.md:113-118` and B1029: each run is `codex exec` with `--ignore-user-config`, a fresh directory, explicit `-m` and `-c model_reasoning_effort=…`, hidden tests or rubric applied after the run, outputs anonymised before review (blind). Record: wall time, tokens, tool-call count from the rollout, any "model at capacity" error, exit code.

| Run | Target point | Arm | Task | Pass criterion |
|---|---|---|---|---|
| 1 | "no tools" | Sol 6.2 / max | Challenger-style: verdict on a claim given inline, brief says "no tools, answer from the text" | 0 tool calls, correct verdict |
| 2 | "no tools" | Sol 6.2 / high | Same task, judge tier | 0 tool calls, correct verdict |
| 3 | "no tools" | Sol 6.2 / high | Brainstorming-style read-only design brief with "no tools" | 0 tool calls, ≥6 distinct options |
| 4 | judgment quality | Sol 6.2 / high | The same blind Laravel review used on 2026-10-29 (scored /40) | ≥ 31/40 (B1029 score) |
| 5 | judgment quality | Terra 6.1 / high | Same review, same-day control | reference |
| 6 | UI/visual | Sol 6.2 / max | One visual test from 2026-10-29 | recorded; informative only |
| 7 | UI/visual | Terra 6.1 / max | Same, same-day control | Terra not beaten → `design-expert` stays Terra |
| 8 | obstacle disclosure (R§2 system card) | Sol 6.2 / max | Challenger task whose brief cites a file that does not exist | report names the missing file |
| 9 | research latency | Sol 6.2 / medium | Doc lookup with a known answer | correct + cited, wall ≤ 1.5x run 10 |
| 10 | research latency | Terra 6.1 / medium | Same, control | reference |

Capacity: no dedicated run; any "at capacity" error in runs 1-4, 6, 8, 9 fails the Sol placement for that tier (Sol 6.1 failed twice, B1029).

Placements safe without benchmark: the 33 Terra placements (unchanged values; B1029 still holds). Placements depending on it: `challenger` (runs 1, 8 + capacity), the 5 `JUDGE` agents (runs 2-4 + capacity), `research-expert` (runs 9-10). `design-expert` stays Terra whatever runs 6-7 show; a Sol win there is only a note for a later decision. A failed tier keeps its current Terra value: the encoding makes that a no-op.

## 5. Risks (one line each)

- Sol 6.2 repeats Sol 6.1's "no tools" failure → gated by runs 1-3; fallback = current Terra value.
- Capacity errors on a new model in launch week → gated; fallback per tier.
- System card: 6.2 omits obstacles more often (R§2) → run 8; existing rule "empty/truncated report is relaunched" (`agents.md:104-107`) still applies.
- 2x token price on 7 agents → offset by fewer output tokens (R§4), low-volume roles only; executors untouched.
- 6.2 drops reasoning items on prefix edits (R§2) → affects API callers that edit history; Codex agent briefs are appended, not edited; no change needed, noted.
- Lot D edits a frozen file → model line only, sha256 and doc re-recorded together, per precedent.
- Rename churn in tests could hide a dropped assertion → Phase 1 proof requires the same number of `expect` calls or more, checked by the sniper.

## 6. Regression test (explicit)

- Removes or restricts an owner rule, gate or context? **No.** Rule 12, zero-`ultra`, exact per-tier lists, total 40, map-vs-disk parity, dated JSDoc citations and the security pilot lock all stay; `ultra` exclusion gets stronger (type level). No agent loses effort. The owner's decision words stay quoted in `docs/workflow/agents.md` history.
- Adds friction? **No.** No new gate, prompt or approval; the next model switch gets cheaper (one table). The only extra step is the 10-run benchmark, which the owner's own method required on 2026-10-29 and which `docs/decisions.md:14` makes a precondition ("once the new matrix is grounded").

## 7. Suggestions (not built)

- Suggestion: one test asserting `baseline.toml.sha256` matches the file → gain: the frozen-baseline drift (E§6.2) cannot recur silently. Missing today: E§3 "No test verifies the sha256 file".
- Suggestion: a contract test asserting rule 12's sentence exists in `03-agent-teams.md` → gain: the tier-change gate cannot be deleted by an edit. Missing today: E§6.8.
- Suggestion: the benchmark runner as a committed script (`scripts/bench/`) reading tiers from `TIER_PROFILES` → gain: the next model release reruns the same 10 runs with one command. No such script exists today (no bench script in `package.json` scripts, E§9.10).
