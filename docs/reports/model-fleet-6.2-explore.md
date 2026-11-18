# Model fleet 6.2 — exhaustive inventory (read-only exploration)

Date: 2026-11-18. Repo: `/Users/brunoazoulay/Labo/docker-lab/dev.local/Dev/AI/Harness/codex-plugins` (branch `main`, only `docs/decisions.md` dirty). Thoroughness: very thorough. No matrix is recommended here (non-goal).

Paths below are relative to the repo root. `docs/workflow/agents.md` is also reachable as `docs/workflow/AGENTS.md` (case-insensitive FS; same file).

## 1. Agent TOMLs (`git ls-files 'plugins/*/agents/*.toml'` = 40 files)

All 40 have `model = "gpt-6.1-terra"` (line 3 of each file) and `model_reasoning_effort` on line 4. Distribution verified by script: medium 32, high 5, max 3.

| Path | name | effort | Role |
|---|---|---|---|
| plugins/ai-pilot/agents/brainstorming.toml | brainstorming | high | judgment (design/ideas) |
| plugins/ai-pilot/agents/challenger.toml | challenger | max | judgment gate (adversarial refutation) |
| plugins/ai-pilot/agents/commit.toml | commit | medium | executor (git commit/release flow, workspace-write) |
| plugins/ai-pilot/agents/explore-codebase.toml | explore-codebase | medium | research (read-only exploration) |
| plugins/ai-pilot/agents/research-expert.toml | research-expert | medium | research (docs/APIs) |
| plugins/ai-pilot/agents/skill-creator.toml | skill-creator | high | judgment/authoring |
| plugins/ai-pilot/agents/sniper-faster.toml | sniper-faster | medium | mechanical (small identified fixes) |
| plugins/ai-pilot/agents/sniper.toml | sniper | high | judgment gate (post-edit validation) |
| plugins/ai-pilot/agents/websearch.toml | websearch | medium | research (fast lookup) |
| plugins/astro-expert/agents/astro-expert.toml | astro-expert | medium | executor |
| plugins/cartographer/agents/cartographer.toml | cartographer | medium | mechanical (maps) |
| plugins/changelog-watcher/agents/changelog-watcher.toml | changelog-watcher | medium | research/monitoring |
| plugins/commit-pro/agents/commit-detector.toml | commit-detector | medium | mechanical (commit intent detector) |
| plugins/design-expert/agents/design-expert.toml | design-expert | max | visual |
| plugins/devops-expert/agents/devops-expert.toml | devops-expert | medium | executor (infra) |
| plugins/go-expert/agents/go-expert.toml | go-expert | medium | executor |
| plugins/hermes-expert/agents/hermes-expert.toml | hermes-expert | medium | executor (Hermes deploy) |
| plugins/laravel-expert/agents/laravel-expert.toml | laravel-expert | medium | executor |
| plugins/lessons/agents/lessons-compactor.toml | lessons-compactor | medium | mechanical (LESSON.md compaction) |
| plugins/nextjs-expert/agents/nextjs-expert.toml | nextjs-expert | medium | executor |
| plugins/php-expert/agents/php-expert.toml | php-expert | medium | executor |
| plugins/prompt-engineer/agents/prompt-engineer.toml | prompt-engineer | high | judgment/authoring |
| plugins/react-expert/agents/react-expert.toml | react-expert | medium | executor |
| plugins/rust-expert/agents/rust-expert.toml | rust-expert | medium | executor |
| plugins/security-expert/agents/security-expert.toml | security-expert | max | judgment gate (security/adversarial, pilot-locked) |
| plugins/seo/agents/seo-cluster.toml | seo-cluster | medium | research/analysis |
| plugins/seo/agents/seo-content.toml | seo-content | medium | research/analysis |
| plugins/seo/agents/seo-expert.toml | seo-expert | medium | executor/analysis |
| plugins/seo/agents/seo-geo.toml | seo-geo | medium | research/analysis |
| plugins/seo/agents/seo-images.toml | seo-images | medium | mechanical |
| plugins/seo/agents/seo-local.toml | seo-local | medium | research/analysis |
| plugins/seo/agents/seo-schema.toml | seo-schema | medium | research/analysis |
| plugins/seo/agents/seo-sitemap.toml | seo-sitemap | medium | mechanical |
| plugins/seo/agents/seo-technical.toml | seo-technical | medium | research/analysis |
| plugins/shadcn-expert/agents/shadcn-ui-expert.toml | shadcn-ui-expert | medium | executor |
| plugins/solid/agents/solid-orchestrator.toml | solid-orchestrator | high | judgment (SOLID audit) |
| plugins/swift-apple-expert/agents/swift-expert.toml | swift-expert | medium | executor |
| plugins/tailwindcss/agents/tailwindcss-expert.toml | tailwindcss-expert | medium | executor |
| plugins/tanstack-start-expert/agents/tanstack-start-expert.toml | tanstack-start-expert | medium | executor |
| plugins/typescript-expert/agents/typescript-expert.toml | typescript-expert | medium | executor |

Role labels come from each TOML `description = "Use when: ..."` line plus `docs/workflow/agents.md:13-17`.

## 2. `scripts/lib/agent-toml.ts` (the generator)

- Type, lines 7-11: `type ModelProfile = { model: "gpt-6.1-terra"; effort: "medium" | "high" | "max"; }` (literal-typed: a new model id needs this type widened).
- Constants, lines 13-15: `TERRA_MEDIUM`, `TERRA_HIGH`, `TERRA_MAX` = `{ model: "gpt-6.1-terra", effort: ... }`.
- Policy JSDoc, lines 17-42: "Canonical shipped-agent policy (40 agents, GPT-6.1 Terra fleet, applied 2026-10-29): 32 `gpt-6.1-terra` `medium` + 5 `high` + 3 `max`, zero Sol, no `ultra`" (lines 18-20), hermes/devops add history (20-25), owner decision quote "That is 30 + 5 + 3 = 38 agents. No agent stays on Sol..." (27-29), blind benchmark rationale (30-32), resulting matrix (34-37), pointer "live only in docs/workflow/agents.md § History" (39-41).
- Assignment, lines 43-84: `export const AGENT_MODEL_PROFILES: Record<string, ModelProfile>` keyed by agent `name`; 40 entries; value is one of the three constants. Key order is not grouped by tier (executors, then mechanical, then mixed).
- Fallback, line 87: `const FALLBACK_PROFILE = TERRA_MEDIUM;` ("New agents default to the standard execution profile"); `resolveModelProfile(name)` lines 92-94 = `AGENT_MODEL_PROFILES[name] ?? FALLBACK_PROFILE`.
- Emission, lines 118-119: `model = ${tomlString(profile.model)}`, `model_reasoning_effort = ${tomlString(profile.effort)}`. The Claude source `model:` frontmatter is ignored (tier is by name only; test proves it, see §3).
- Legacy remap tables: none in `agent-toml.ts` (the old gpt-5.x remap and opus/sonnet/haiku mapping were removed). The only remaining legacy remap is `scripts/fix-conformance.ts`: header line 6 "rename non-doc models (gpt-5.3-codex → gpt-5.4, gpt-5.3-codex-mini → gpt-5.4-mini)" and the regexes at lines 87-88. It is a historical conformance script, not part of the fleet policy, but it is a place where model ids are encoded.
- Consumers: `scripts/lib/security-agent-pilot.test.ts:6` and `scripts/lib/agent-tier-matrix.test.ts:24` import `AGENT_MODEL_PROFILES`. `scripts/lib/security-agent-pilot-run.ts` does not import it; it reads the model and effort from the TOML under test (lines 15-32, 75, 86, 153).
- No model/effort allow-list in `scripts/lib/agent-role-validation.ts` or `scripts/validate.ts` (grep for model/effort returned zero lines).

## 3. Tests that lock models, efforts, counts

### scripts/lib/agent-toml.test.ts
- 8-16 `TERRA_MEDIUM` array (32 names; lines 11-12 carry dated comments for hermes/devops); 17 `TERRA_HIGH` (5); 18 `TERRA_MAX` (3).
- 20-24 `EXPECTED_PROFILES` built with the literal `"gpt-6.1-terra"` and `"medium"|"high"|"max"`.
- 32-49 test "selects name-specific profiles over Claude source model tiers": 8 scenarios (design-expert, challenger, security-expert, commit, sniper-faster, sniper, typescript-expert, `future-agent` = fallback), each with `expectedModel: "gpt-6.1-terra"` and `expectedEffort` (lines 34-41); asserts at 46-47.
- 66 test title "ships the exact 40-agent model and reasoning-effort matrix"; 69 `expect(configs.size).toBe(40)`; 70 key-set equality; 71-74 per-agent model/effort; 76 `TERRA_MEDIUM` length 32; 77 unique 32; 78 `TERRA_HIGH` 5; 79 `TERRA_MAX` 3; 80 `model !== "gpt-6.1-terra"` must be empty; 81 `model === "gpt-6.1-sol"` must be empty; 82 `effort === "ultra"` must be empty.

### scripts/lib/agent-tier-matrix.test.ts
- JSDoc 1-19: "exact 32 medium / 5 high / 3 max" (10), 30/31 history (10-12), "GPT-6.1 Terra fleet since 2026-10-29" (14), "zero Sol and zero `ultra`" (13).
- 28-29 `TERRA_MAX_NAMES`, `TERRA_HIGH_NAMES`; 30 `AGENT_TOML_SOURCE`.
- 31-36 `V1_0_50_SOL_HIGH_NAMES = ["design-expert","security-expert"]` (frozen pre-GPT-6 baseline).
- 57-70 `baselineV1_0_50()` hardcodes `{ model: "gpt-5.6-sol", effort: "high" }` (line 67); line 61 comment "every one of the 40 agents".
- 72 title "shipped agent TOMLs match the exact 32/5/3 Terra tier matrix"; 74 `byTier` keys `"gpt-6.1-terra|max"`, `"|high"`, `"|medium"`; 82-84 lengths (`.toHaveLength(32)` at 84); 86 `profile.model === "gpt-6.1-sol" || profile.effort === "ultra"` must be empty.
- 89-101 map-vs-disk parity (0 mismatches).
- 103-115 test: for every agent whose profile differs from the v1.0.50 baseline, the JSDoc above `export const AGENT_MODEL_PROFILES` in `agent-toml.ts` must mention `` `name` `` and contain a `20\d\d-\d\d-\d\d` date. Any new matrix where an agent's tier differs from that baseline needs that agent name and a dated line kept in the JSDoc.

### scripts/lib/security-agent-pilot.test.ts (+ `docs/validation/security-agent-pilot/baseline.toml`)
- 6 imports `AGENT_MODEL_PROFILES`; 9-11 `AGENT_PATH`, `BASELINE_PATH = docs/validation/security-agent-pilot/baseline.toml`.
- 79-81 (in the "materialized" test): `config.model` equals `AGENT_MODEL_PROFILES["security-expert"].model` and the shipped TOML's model; 80-81 the same for effort. The baseline model/effort are NOT asserted here (only `name`, `sandbox_mode`, `nickname_candidates` are compared to the baseline, line ~74).
- 120-136 test "the runner's -c model_reasoning_effort argument follows the TOML actually being run": synthetic TOML `model = "gpt-5.6-terra"` / `effort "xhigh"` (121-126) is intentionally synthetic; 129-135 compares the runner profile to the parsed baseline/candidate effort (derived, not hardcoded).
- `docs/validation/security-agent-pilot/baseline.toml:3-4` = `model = "gpt-6.1-sol"`, `model_reasoning_effort = "high"`. `baseline.toml.sha256:1` = `bc027447a5e2b40482a22d070887288457858c335e96d6cae2c8a6bf3879975f  baseline.toml`; `shasum -a 256` of the file matches today. No test verifies the sha256 file.
- Frozen description (the TOML is pilot-locked): merge source content, never replace (project lesson 2026-11-10).

### Other model strings in tests (not fleet locks)
- `scripts/lib/install/config-prompt.test.ts:46-53`: select queue `"dynamic-model"`, `"medium"`; asserts `model_reasoning_effort = "medium"` is written. Not tied to the fleet.
- Fixtures using `gpt-5.5` / `gpt-5.6` / `gpt-5.4` / `gpt-9` strings only as arbitrary config values: `install/toml-helpers.test.ts` (11-89), `install/toml-upsert.test.ts` (22, 51), `install/merge-agents-md.test.ts` (26, 30, 46, 60), `install/sync-agents-md-rules.test.ts` (73, 77, 98), `install/hooks-trust.test.ts` (43, 48), `install/hooks-trust-accept.test.ts` (26, 29), `install/exec-policy.test.ts` (72). None need to change for a fleet switch.
- `scripts/lib/agents-md-routing.test.ts` and `agents-md-template-identity.test.ts` lock AGENTS.md wording; rule 12 of `plugins/codex-rules/rules/03-agent-teams.md:23` (below) is not asserted by any test I found (grep for the rule text in `scripts/lib/*.test.ts` = 0 hits).
- Test run: `bun test` (no `test` script in package.json). `docs/task-list.md:59`: `env -u RALPH_MODE bun test`. 44 test files under `scripts/lib` + 2 `.test.mts` under `scripts/tests`.

## 4. Installer / config code touching model or effort

- `scripts/install-codex.ts`: zero `model` / `effort` occurrences (grep). It calls the prompt module; it hardcodes no model.
- `scripts/lib/install/config-prompt.ts`: line 5 imports `APPROVALS, PERSONALITIES, SANDBOXES, V2_CONCURRENCY`; 7-8 imports `effortChoices, modelChoices` and `listCodexModels`; 29-34 builds model choices from the live catalog and `setRootKey(next, "model", model)` (line 33); 40 `["model_reasoning_effort", effortChoices(models, getRootKey(next, "model"))]`; every prompt has a `(skip)` that leaves the file untouched. Writes only to `~/.codex/config.toml` (`codexHome`), via `Bun.write(path, next)`.
- `scripts/lib/install/config-model-options.ts`: 4-11 `modelChoices` (hint "default" from `model.isDefault`); 14-20 `effortChoices` uses the catalog's `supportedReasoningEfforts`, else `FALLBACK_EFFORTS`.
- `scripts/lib/install/config-options.ts:3-15`: `export const FALLBACK_EFFORTS: Choice[] = ["none","minimal","low","medium","high","xhigh","max","ultra"]` (source of truth cited: `codex-rs/protocol/src/openai_models.rs`). Static; adding a new effort level (if Sol 6.2 adds one) matters only when the catalog lacks `supportedReasoningEfforts`.
- `scripts/lib/install/model-catalog.ts:2,78-83`: live `model/list` request to the Codex app server, hidden models filtered out. Catalog-driven, no id hardcoded.
- Coordinator default: nothing in the repo sets it. The coordinator is the owner's own Codex session, outside the TOML policy (`docs/workflow/agents.md:10-11`: "The coordinator (the owner's own Codex session) is not a shipped agent TOML and stays outside this policy"). Evidence of what it runs today: real-condition reports run it with `-m gpt-6.1-sol` ("installer default"): `docs/real-conditions-port-roadmap-prd-2026-11-16.md:9`, `docs/real-conditions-port-claude-1-40-2-2026-11-15.md:12`, `docs/real-conditions-apple-skills-27-2026-11-14.md:11` (lead `gpt-6.1-sol`, children `gpt-6.1-terra`). Those are test-run settings, not repo code. Whether `gpt-6.1-sol` is the live catalog default (`isDefault`) on the owner's machine: not verified.
- Decision `docs/decisions.md` 2026-11-16: the installer's `approval_policy = "untrusted"` offer stays unchanged (unrelated to model, do not re-propose).

## 5. Docs and skills stating the policy (file:line, exact statements)

### docs/workflow/agents.md (canonical)
- 3: "40 specialized Codex agents across all plugins."
- 7-11: "Current, since 2026-10-29 (owner decision). Every shipped agent runs on `gpt-6.1-terra` — no agent stays on Sol. `gpt-6.1-luna` is not available on this account; `ultra` is never used ... The coordinator ... stays outside this policy."
- 13-17: "Groups (32 + 5 + 3 = 40): `max` (3) — `design-expert`, `challenger`, `security-expert` ...; `high` (5) — `sniper`, `brainstorming`, `prompt-engineer`, `skill-creator`, `solid-orchestrator` ...; `medium` (32) — every other agent".
- 17-19: "New agents default to `gpt-6.1-terra` / `medium`; any other model or effort needs a new owner decision. No verified Terra price is recorded."
- 19-23: rationale (blind benchmark 2026-10-29). 25-31 History all-`gpt-6.1-sol` (price line 30); 33-39 all-`gpt-6-sol`; 41-57 GPT-6 Sol/Luna split; 59-109 GPT-5.6 policy; 111-134 Benchmark 2026-09-02. Inventory table from 136.
- Anchors referenced from other docs: `#history-all-gpt-61-sol-superseded-2026-10-29`, `#history-all-gpt-6-sol-superseded-2026-09-30`, `#history-gpt-6-solluna-split-superseded-2026-09-27`, `#history-gpt-56-policy-superseded-2026-09-23` (`docs/reference/creating-skills-agents.md:76-83`). A new "History (all gpt-6.1-terra, superseded ...)" section changes the anchor set.

### docs/reference/creating-skills-agents.md
- 23-24 example `model = "gpt-6.1-terra"` / `model_reasoning_effort = "high"`.
- 45 `model` row: "`gpt-6.1-terra` for every shipped agent ... never a bare alias. `gpt-6.1-luna` is not available on this account."
- 46 `model_reasoning_effort` row: "`medium` by default; `high` or `max` only for the agents named ...; never `ultra`."
- 57 "`gpt-6.1-terra` (30 + 5 + 3 = 38); no agent stays on Sol" (stale count, see §6); 58-60 fallback `gpt-6.1-terra` / `medium`.
- 62-66 matrix table (64: "30 — every agent not listed below" stale; 65 high list; 66 max list). 68-72 `ultra` note and "No verified Terra price is recorded here." 76-83 history links.

### docs/task-list.md
- 9: "all-`gpt-6.1-terra` model matrix (2026-10-29: `medium` ×30, `high` ×5, `max` ×3, never `ultra`; see `docs/workflow/agents.md` § Model Policy)" (stale ×30).

### docs/GAP-HARNESS.md
- 94: "Incohérence matrice modèle corrigée : astro/nextjs/react étaient en `sol` ... `changelog-watcher`+`commit` restent sol = choix délibéré, à confirmer owner." followed by a bracketed historical "20 sol / 12 terra / 5 luna" note. Historical entry.
- 96: struck-through item about CHANGELOG "12 sol/24 terra" (resolved, historical).

### plugins/ai-pilot/skills/agent-creator/**
- SKILL.md:7 "`model` tier + `model_reasoning_effort`"; 40 "`model` as an explicit tier from the Model Tier Matrix below (never the bare `gpt-6` alias)"; 92 "never a bare `gpt-6`/`gpt-6.1` alias. Full rationale: `docs/reference/creating-skills-agents.md`"; 94 "Every shipped agent runs on `gpt-6.1-terra` (30 + 5 + 3 = 38)"; 98-100 matrix rows (98 medium "(30)", 99 high "(5)", 100 max "(3)"); 106 pointer to superseded history in `docs/workflow/agents.md`; 146 checklist "`model` is an explicit tier from the Model Tier Matrix"; 184 "Assign a bare `gpt-6`/`gpt-6.1` alias, any model other than `gpt-6.1-terra`, or `ultra` effort to any agent".
- references/frontmatter.md:31-32 example `gpt-6.1-terra` / `high`; 57 `model` row; 58 `model_reasoning_effort` row; 73-74 "(30 + 5 + 3 = 38) ... `gpt-6.1-luna` is not available"; 78 "Every other agent (30)"; 79 high list; 80 max list; 90 superseded-policies pointer.
- references/architecture.md:55-56 example `gpt-6.1-terra` / `medium`.
- references/templates/agent-template.md:22 `model = "gpt-6.1-terra"`; 24 `model_reasoning_effort = "medium"`; 131 pointer to `required-sections.md`; 138 `model` row; 139 `model_reasoning_effort` row.
- references/templates/agent-template-examples.md:20,22 and 74,76 (two examples, `gpt-6.1-terra` / `medium`); 121 "Both examples use `gpt-6.1-terra` / `medium` — the fleet default ... per the model policy section".
- `required-sections.md`: line 131 of `agent-template.md` says it holds "all valid `model`/`sandbox_mode`/`model_reasoning_effort` values"; grep for gpt-/terra/effort in that file returned no hit (not opened in full, see §7).

### README.md
- 47: "| `model_reasoning_effort` | dynamic per selected model (Sol includes `ultra`) | same |" (installer prompt table, lines 40-50). Only model statement in README; no fleet count in README.

### AGENTS.md / template / codex-rules
- Root `AGENTS.md`: no model, effort, tier or 38/40 statement (grep clean). It only points to rules.
- `plugins/codex-rules/templates/AGENTS.md.template` (git-tracked, byte-identical to AGENTS.md per `agents-md-template-identity.test.ts`) and `.archive` / `.archives`: no model id (the only hit is "ultra-concise" in `AGENTS.md.template.archive:23`).
- `plugins/codex-rules/rules/03-agent-teams.md:23` (rule 12): "A model or effort tier of any agent TOML changes only on an owner decision quoted, with its date, in the task PRD entry that touches the file (`$ai-pilot:lead-orchestration` #2); a tier change without that citation is refused at Verify." Governs the switch itself: the executor's PRD entry must quote the owner's words and date (the 2026-11-18 decision line is in `docs/decisions.md:14`).
- `plugins/ai-pilot/skills/lead-orchestration/SKILL.md`: no tier/model statement beyond the rule-12 reference.

### Other docs
- `docs/decisions.md:14` (2026-11-18): the open decision, quote "okay sol 6.2 est sorti on vas reorganisé tous proprement repense"; names the scope: "agent TOMLs, `scripts/lib/agent-toml.ts`, contract tests, agent-creator skill and docs".
- `docs/validation/security-agent-pilot.md:5`: baseline "byte-for-byte except its `model` line, updated from `gpt-5.6-sol` to `gpt-6-sol` on 2026-09-23 ..., then to `gpt-6.1-sol` on 2026-09-30"; `:62-63` snapshot path and SHA-256 `bc027447...975f`; `:78` the valid comparison ran fixed `gpt-5.6-sol` / `high` (historical, runs predate).
- `docs/validation/security-agent-pilot/evidence/revised-candidate-scorecard.json:8-9` `gpt-5.6-sol`/`high`; `evidence/result-template.json:11` `"pending"`. Recorded evidence, not editable.
- `docs/validation/agent-fleet-corrections.md:13`: "`security-expert` now uses Sol/medium ..." (historical, stale vs `max`).
- `CHANGELOG.md`: 175 (2026-10-29 Terra move: "all 38 Codex agents ... medium (30) ... high (5) ... max (3)"), 186 (all 37 to `gpt-6.1-sol`, with baseline model line and sha256 re-recorded), 202/209/212 (GPT-6 history; 212 records the baseline.toml model line + sha256 re-record), 235/240/262/326/337/355 older. Append-only history; new matrix needs a new entry.
- Real-condition reports (`docs/real-conditions-*.md`): 40 agents / `gpt-6.1-sol` / `gpt-6.1-terra` mentions as dated evidence (see §4). Historical.
- `docs/reports/2026-11-15-codex-coordination-amnesia-audit.md`: cites "40 files" (lines 8, 19), not a model statement.
- Hermes/devops/design reference files that matched `sol`/`terra`/`gpt-` (e.g. `plugins/hermes-expert/skills/hermes-core/references/models-providers.md`, `plugins/devops-expert/**` `terraform`) concern user-project content or the word "terraform", not the fleet. Not opened in detail.

## 6. Drift found

1. Stale "38" / "30 medium" (the fleet is 40 / 32 medium): `docs/reference/creating-skills-agents.md:57` and `:64`; `plugins/ai-pilot/skills/agent-creator/SKILL.md:94` and `:98`; `plugins/ai-pilot/skills/agent-creator/references/frontmatter.md:73` and `:78`; `docs/task-list.md:9` ("×30"). Correct and consistent: `docs/workflow/agents.md:3,13`, `scripts/lib/agent-toml.ts:18-19`, both tests, disk (32/5/3). The hermes (2026-11-09) and devops (2026-11-10) additions updated code and tests but not these four docs. `CHANGELOG.md:175` "38" is historically right for 2026-10-29.
2. Frozen baseline model vs fleet: `docs/validation/security-agent-pilot/baseline.toml:3` is still `gpt-6.1-sol` although the fleet moved to Terra on 2026-10-29. The precedent (`CHANGELOG.md:186,212`; `security-agent-pilot.md:5`) re-records the baseline model line and sha256 at each fleet switch; this was not done at the Terra switch. No test asserts the baseline model or the sha256, so nothing fails. Any change to that file must also update `baseline.toml.sha256:1` and `security-agent-pilot.md:5,63`. The scorecard keeps the original run hash by design.
3. `docs/validation/agent-fleet-corrections.md:13` says security-expert is Sol/medium (stale; today Terra/max). Historical doc, not corrected.
4. `README.md:47` "(Sol includes `ultra`)": a static claim about catalog content; the catalog is dynamic. Unverified against the live catalog.
5. `scripts/lib/agent-tier-matrix.test.ts` constants named `TERRA_*` and keys `"gpt-6.1-terra|..."` (lines 28-29, 74, 82-84) plus `agent-toml.test.ts` (8-24) encode the model id in identifiers; a matrix change needs rename or parametrisation, not only value edits. `agent-toml.ts` `ModelProfile.model` is a single-literal type (line 9).
6. `docs/GAP-HARNESS.md:94` still carries the "`changelog-watcher`+`commit` restent sol = choix délibéré" note (historical, superseded).
7. `gpt-6.1-luna` "not available on this account" is stated in 4 places (`agents.md:8`, `creating-skills-agents.md:45,58`, `agent-creator/SKILL.md:94`, `frontmatter.md:57,74`, `agent-template.md:138`); no grounding recorded in the repo for Sol 6.2 availability.
8. Rule 12 (`03-agent-teams.md:23`) is not machine-asserted by a test.
9. No count mismatch between code and tests: both say 40 / 32 / 5 / 3; disk agrees.

Complete list of files to touch for a zero-leftover switch (model id, effort, count, tier names):
- Source of truth: `scripts/lib/agent-toml.ts` (type line 9, constants 13-15, JSDoc 17-42, map 43-84, fallback 87).
- All 40 TOMLs lines 3-4 (generated by `sync:agents` from the map; `bun run sync:agents`).
- Tests: `scripts/lib/agent-toml.test.ts` (8-24, 34-41, 66-82), `scripts/lib/agent-tier-matrix.test.ts` (1-19, 28-29, 61, 67, 72-86), optionally `security-agent-pilot.test.ts:120-126` (synthetic, leave).
- Frozen: `docs/validation/security-agent-pilot/baseline.toml` + `.sha256` + `security-agent-pilot.md:5,63` (see drift 2).
- Docs: `docs/workflow/agents.md` (3, 7-23, history anchor), `docs/reference/creating-skills-agents.md` (23-24, 45-46, 57-83), `docs/task-list.md:9`, `README.md:47` (if effort list changes), `docs/decisions.md` (record the decided matrix), `CHANGELOG.md` (new entry).
- Skill: `plugins/ai-pilot/skills/agent-creator/SKILL.md` (7, 40, 92-106, 146, 184), `references/frontmatter.md` (31-32, 57-58, 73-90), `references/architecture.md:55-56`, `references/templates/agent-template.md` (22, 24, 138-139), `references/templates/agent-template-examples.md` (20, 22, 74, 76, 121), and `required-sections.md` (unverified, see §7).
- Installer: `scripts/lib/install/config-options.ts:15` only if Sol 6.2 adds a new effort value absent from `FALLBACK_EFFORTS`.
- Release mirror (per `docs/decisions.md` / commit flow): `.agents/plugins/marketplace.json` versions of every touched plugin + suite version (currently suite `1.0.77`); the commit agent owns this.
- Not to touch: `portage/` (gitignored, `.gitignore:45`), `docs/archive/**`, `evidence/*.json`, real-conditions reports, CHANGELOG history lines.

## 7. Not verified

- `plugins/ai-pilot/skills/agent-creator/references/required-sections.md` (not opened; grep for `gpt-|terra|effort` over the skill dir did not list it).
- That `gpt-6.1-sol` is the live catalog default on the owner's machine; the existence, id, price and efforts of Sol 6.2 (research-sol62 owns this).
- Whether `ai-pilot`'s per-plugin `README.md`/`.codex-plugin/plugin.json` descriptions mention agent counts: grep for `38|40` near "agent" in plugin READMEs returned no model/count statement.
- `bun test` / `bun run validate` were not run (read-only mandate; no change made).

## 8. Project skill check

None. `ls .agents/skills` and `ls .claude/skills` both fail with "No such file or directory". No `docs/roadmap.md` either (`docs/` has `decisions.md`, `task-list.md`, `GAP-HARNESS.md`). Per AGENTS.md COORDINATOR PATH 3, a read-only mandate creates nothing; bootstrap at the next write mandate.

## 9. Architecture summary (for the later skill bootstrap)

1. Bun + TypeScript monorepo (`package.json`: `"type": "module"`, bun >= 1.2.15, installed bun 1.4.4) that ports the Claude plugin suite `Fusengine/claude-plugins` to the Codex CLI. Suite version `1.0.77` in `.agents/plugins/marketplace.json`.
2. `plugins/` (29 dirs): source of truth, one Codex plugin per dir with `.codex-plugin/plugin.json`, `agents/*.toml` (40 total), `skills/`, `hooks/`, plus `codex-rules` (rules `00-08`, `templates/AGENTS.md.template`).
3. `portage/` (25 dirs): gitignored Claude-side snapshot (`.gitignore:45`); never edit.
4. `scripts/`: migration and install tooling. `migrate.ts`, `sync-agents.ts`, `install-codex.ts`, `validate.ts`, `final-conformance.ts`, `update-harness.ts`, many `fix-*.ts`.
5. `scripts/lib/`: generators (`agent-toml.ts` is the model/effort source of truth, `agents.ts`, `skills.ts`, `hooks*.ts`, `runner.ts`), validators, `harness-hook-routes.json`, and colocated `*.test.ts`.
6. `scripts/lib/install/`: installer internals (config prompt, model catalog, TOML upsert, AGENTS.md merge, hooks trust, exec policy).
7. `scripts/tests/*.test.mts`: harness env/runtime tests. There is no top-level `tests/` dir; tests are colocated in `scripts/lib` (44 files) and `scripts/tests` (2).
8. `docs/`: `workflow/` (agents.md = canonical model policy), `reference/`, `plugins/`, `validation/` (security-agent-pilot, frozen baseline), `reports/`, `archive/`, `decisions.md`, `task-list.md`, `GAP-HARNESS.md`, real-condition run reports.
9. Runtime dependency `@fusengine/harness` pinned exact `0.1.125` (hooks route through it); `packages/` is empty.
10. Commands (package.json scripts): `bun run migrate`, `bun run sync:agents`, `bun run validate`, `bun run conformance:fix`, `bun run update-harness`. No `test` script.
11. Test command: `bun test` (docs use `env -u RALPH_MODE bun test`, `docs/task-list.md:59`). Validate: `bun run validate` (`scripts/validate.ts`: deprecated-flag cleanup, hook config validation, spawns sub-checks).
12. Agent TOML flow: Claude-style source agent -> `buildAgentToml` (name-keyed `AGENT_MODEL_PROFILES`, sandbox from tools, nicknames, skills) -> `plugins/<p>/agents/<name>.toml` -> `materializeAgentFiles` at install into the user's Codex home.
13. Governance: AGENTS.md HARD STOPS (always-delegate lead, WIP commits via `commit` agent, protected branches, never `~/.codex` writes), rule 12 gates tier changes on a quoted owner decision.
14. Release: commit agent bumps plugin + suite versions, mirrors them in `.agents/plugins/marketplace.json` and README badge, appends `CHANGELOG.md`, merges (never squash), tags.
15. Lessons to carry: `plugins/*/.cartographer` is gitignored but older indexes are force-tracked (`git add -f` every index level); security-expert TOML is pilot-locked (merge, never replace); new agents change counts in `agent-toml.test.ts` + `agent-tier-matrix.test.ts` including titles and JSDoc.
