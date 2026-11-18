# Model fleet 6.2 — final challenge (2026-11-18)

VERDICT: REFUTED (overall). The repo half of the claim holds; the "ready for the sync to ~/.codex/agents" half fails.

Claim challenged: "the uncommitted diff fully and correctly applies the approved matrix recorded in docs/decisions.md (2026-11-18 entries) and is ready for a WIP commit, then a sync to ~/.codex/agents and a real Codex test."

## Per point

| # | Point | Verdict |
|---|---|---|
| 1 | Completeness, no stale model/effort statement | CONFIRMED (one wording issue, correction 3) |
| 2 | Security pilot `baseline.toml` model line | CONFIRMED: it mirrors the shipped agent and does not corrupt the pilot |
| 3 | `FALLBACK_EFFORTS` keeps max/ultra | CONFIRMED: consistent with the owner rule, not a leftover |
| 4 | Docs single source, sourced numbers | CONFIRMED in part. The max-effort figures were checked live. The low–xhigh rows could not be checked against the source |
| 5 | Ready for sync | REFUTED |
| 6 | Product lens | RUN: Coherence OK, Usability same, Consistency ISSUE |

### 1. Completeness
- All 40 shipped TOMLs match decisions.md:16 exactly: 25 DEFAULT `gpt-6.2-sol`/medium, 7 JUDGE `gpt-6.2-sol`/high, 7 NON_CORE `gpt-6.1-terra`/medium, 1 SECURITY `gpt-6.1-terra`/high. Measured by reading the `model`/`model_reasoning_effort` lines of `plugins/*/agents/*.toml` (40 files).
- No TOML uses `max` or `ultra`. `scripts/lib/agent-toml.ts:8-11` makes both values impossible at the type level, and `TIER_PROFILES` (:36-41) is the only place that defines them.
- Whole-repo grep, excluding CHANGELOG, docs/archive, docs/reports, portage and History sections, for `gpt-6.1-sol`, `Terra fleet`, `all … terra`, `38/37 agents` and `"max"`. Every remaining hit is one of these:
  - a dated historical run report: `docs/real-conditions-*-2026-11-1{4,5,6}.md`, which record the `-m gpt-6.1-sol` used at that time. These are correct as history;
  - a History block: `docs/workflow/agents.md:79-160` or the `docs/GAP-HARNESS.md:94` bracket, which now ends on the 2026-11-18 supersession;
  - something unrelated: statusline subscription "max", docker `mode = "max"`, i18n.
- The rules, `AGENTS.md`, lead-orchestration and apex skills carry no model statement.
- Every model/effort pair used exists in the account catalog: `~/.codex/models_cache.json` lists `gpt-6.2-sol` and `gpt-6.1-terra` with medium and high.

### 2. `docs/validation/security-agent-pilot/baseline.toml`
The diff is not a corruption. Proof:
- The runner reads each arm's model and effort from its own TOML (`scripts/lib/security-agent-pilot-run.ts:8-9,29,137`). Baseline = `baseline.toml`, candidate = the shipped `security-expert.toml`.
- The pilot contract requires the same model and effort on both arms (`security-agent-pilot.md:7`).
- Mirroring keeps both arms on `gpt-6.1-terra`/high. Freezing the baseline would make a rerun compare different models (Sol vs Terra).
- The recorded runs keep their original hash `1df21743…e22a` and their `gpt-5.6-sol` condition, so the historical comparison is unaffected.
- `sha256(baseline.toml)` = `249960a9…6d13`. This matches both `baseline.toml.sha256` and the doc (:63).
- The commits 9766047a and 92f1adc4 updated the model line the same way. Precedent is split, though: 1706bc47 (2026-10-29 Terra switch) left the baseline on `gpt-6.1-sol` and removed `model` from the equality check (`security-agent-pilot.test.ts:71-81`). For about three weeks the arms were mismatched (`gpt-6.1-sol`/high vs `gpt-6.1-terra`/max). The current diff repairs that mismatch.

### 3. `scripts/lib/install/config-options.ts:15` `FALLBACK_EFFORTS`
This list is consistent with the owner rule:
- It is the installer's chooser for the user's own session `config.toml`. It is used only when the catalog has no `supportedReasoningEfforts` (`config-model-options.ts:19`).
- The owner rule covers shipped agents ("fleet-wide", decisions.md:15), and the coordinator session is outside the policy (`docs/workflow/agents.md:18-19`).
- Removing `max` there would cut an option from the user's own session without an owner decision.

### 4. Docs and numbers
- The canonical source is `docs/workflow/agents.md` § Model Policy. `creating-skills-agents.md`, `task-list.md`, `GAP-HARNESS.md` and `README.md:47` now link to it instead of restating it.
- Checked live today (fuse-browser `browser_fetch` on artificialanalysis.ai/models/gpt-6-2-sol and /gpt-6-1-terra):
  - max effort: Sol 57, 7.9 min, $1.01, 60.9M output tokens; Terra 51, 14.3 min, $0.96, 99.4M;
  - prices: $2/$10 and $1/$5, cache discount 95%;
  - index version v5.0.1.
- Not checked: the low/medium/high/xhigh rows (`agents.md:49-52`). They are rendered by the page's charts and are not in the static text. They rest only on `docs/reports/model-fleet-6.2-challenge.md:46-50`.

### 5. Readiness for sync: REFUTED
Concrete failure scenario, measured at 01:34 today:
- `~/.codex/agents/` was already rewritten at 01:26:24 (`ls -lT`: 40 files, same second). `~/.codex/prompts/` was rewritten at the same time: 35 symlinks, now pointing into this source repo.
- The installed agents carry the old models:

  | Agent | Installed model / effort |
  |---|---|
  | `sniper` | `gpt-6.1-terra` / high |
  | `design-expert` | `gpt-6.1-terra` / max |
  | `security-expert` | `gpt-6.1-terra` / max |

  The source TOMLs were rewritten afterwards (mtime 01:27:08).
- The managed header and skill paths now point into the source repo, for example `source: …/codex-plugins/plugins/ai-pilot/agents/sniper.toml` and `path = "…/codex-plugins/plugins/ai-pilot/skills/code-quality/SKILL.md"`.
- The previous full install used the plugin cache: `runner.ts:95-97`, cache `ai-pilot/1.2.66`, mtime Nov 17 15:02.
- No backup of the agents folder was found in `~/.codex` or `/tmp`. The only backups are `config.toml.bak*` from Nov 17.
- In short: a write outside the repo has already happened, without the "backup first" that decisions.md:17 requires, and the owner's installed fleet is on a mixed old matrix with `max` right now.
- `bun run sync:agents` (`scripts/sync-agents.ts:24-26`) materializes with `pluginsRoot = <repo>/plugins`. That gives source-repo skill paths, which contradicts decisions.md:17 ("absolute plugin-cache skill paths") and `docs/workflow/agents.md:206-209`. Consequences of source-pointing: installed agents follow the working tree (uncommitted or other-branch skills) and break if the repo moves.
- It also runs `installCommands`, which re-symlinks `~/.codex/prompts/*.md` to the source repo. This is a second write outside the repo that the sync mandate ("only `~/.codex/agents/`") does not cover.
- A cache-path sync is feasible:
  - `materializeAgentFiles(sourceFiles, <cache root>, ~/.codex/agents)` resolves portable `plugins/<p>/skills/...` paths through the cache (`agent-materializer.ts:8,16-21`);
  - every skill path referenced by the 40 source TOMLs exists in cache 1.2.66 (0 missing; the only miss is the literal placeholder `plugins/<plugin>/skills/<name>/SKILL.md`);
  - limit: the managed header line would still name the source TOML as its source.

### 6. Product lens: RUN
The change alters which model and effort every spawned agent runs on, by design.
1. **Coherence: OK.** There is one tier source (`agent-toml.ts:36-89`), the fallback is `DEFAULT` (:97), and no second mechanism exists (checked by grepping `AGENT_TIERS` / `TIER_PROFILES`).
2. **Usability: OK.** Spawning an agent is 1 step before and 1 step after. Creating an agent: before, pick 1 of 3 effort rows; after, pick 1 of 4 role tiers, with the default implicit. Same effort for the user.
3. **Consistency: ISSUE.** `docs/workflow/agents.md:7-8` says "every other doc, skill and code comment links here". But the full per-agent tier lists are repeated in:
   - `plugins/ai-pilot/skills/agent-creator/SKILL.md:94-99`;
   - `references/frontmatter.md:75-80`;
   - the Inventory table of `agents.md:211+`.

   No test checks these copies: the tests read only the TOMLs and the `agent-toml.ts` JSDoc (`agent-tier-matrix.test.ts:68,135-142`).
   Suggestion: add a contract test that parses the tier tables in SKILL.md, frontmatter.md and the agents.md Inventory and compares them with `AGENT_TIERS` → gain: the copies the skill needs (the skill ships without `docs/`) can no longer drift silently.

## Required corrections (numbered)
1. Before any further write to `~/.codex`, identify who ran the 01:26:24 sync and stop it. That write produced 40 agents and 35 prompt symlinks, pointing at source, with stale `max` models. Report it to the owner as an unauthorized write that happened before the sync and without a backup.
2. Back up the current `~/.codex/agents/` and `~/.codex/prompts/`. Then sync agents only, with `materializeAgentFiles` and the plugin-cache root as `pluginsRoot`, as decisions.md:17 requires. Do not use `bun run sync:agents`: it targets the source repo and also rewrites the prompts. The alternative is to record an owner decision accepting source-repo paths. Either way, restore the prompt symlinks to the cache (as `runner.ts:97` does) unless the owner accepts source-pointing.
3. Fix `docs/workflow/agents.md:7-8`: say the per-agent lists are also mirrored in the agent-creator skill and frontmatter.md and must match. Alternatively, add the contract test from lens point 3.
4. Either flag the low–xhigh rows at `docs/workflow/agents.md:49-52` as "read from AA charts 2026-11-18, not machine-verifiable", or drop them in favour of the verified max-effort figures.
5. After the sync, verify the installed result itself: `grep -h '^model' ~/.codex/agents/*.toml | sort | uniq -c` must show 32 Sol and 8 Terra lines with zero `max`, and every `path =` must exist. Tests alone are not proof.

## Sources
- Code read:
  - `scripts/lib/agent-toml.ts:1-137`
  - `scripts/sync-agents.ts:1-35`
  - `scripts/lib/install/install-agents.ts`
  - `scripts/lib/install/agent-materializer.ts:1-80`
  - `scripts/lib/install/runner.ts:60-110`
  - `scripts/lib/install/config-options.ts`
  - `scripts/lib/security-agent-pilot.test.ts:1-90`
  - `scripts/lib/security-agent-pilot-run.ts`
  - `docs/decisions.md:14-17`
  - `docs/workflow/agents.md:1-100,195-215`
  - `docs/validation/security-agent-pilot.md`
- Git: `git diff`; `git log`/`git show` on 1706bc47, 9766047a, 92f1adc4.
- Runtime state: `~/.codex/agents`, `~/.codex/prompts` (`ls -lT`), `~/.codex/models_cache.json`.
- fuse-browser: AA model pages for gpt-6-2-sol and gpt-6-1-terra.
- Context7/Exa: not needed; there is no library API in scope.
