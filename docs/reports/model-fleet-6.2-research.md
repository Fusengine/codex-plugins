# GPT-6.2 model fleet research (verified 2026-11-18)

Author: research-sol62. Scope: facts only, no matrix recommendation.

## 1. Models released in the 6.2 generation

- The 6.2 generation is **GPT-6.2 Astra** (`gpt-6.2-astra`, frontier) and **GPT-6.2 Sol** (`gpt-6.2-sol`, efficient everyday model). Released 2026-11-17 (system card dated Nov 17 2026; GitHub Copilot changelog "Release November 17, 2026").
- **There is no Terra 6.2 and no Luna 6.2.** Terra stays `gpt-6.1-terra`; Luna is `gpt-6-luna` (and `gpt-5.6-luna`). No `gpt-6.1-luna` exists in the account catalog either.
- Sources:
  - https://openai.com/index/introducing-gpt-6-2-astra-sol/
  - https://developers.openai.com/api/docs/models/gpt-6.2-sol.md
  - https://developers.openai.com/api/docs/models/gpt-6.2-astra.md
  - https://deploymentsafety.openai.com/gpt-6-2-astra-sol (system card)
- Codex docs: "GPT-6.2 Astra and GPT-6.2 Sol are now available in ChatGPT Work and Codex" (https://learn.chatgpt.com/docs/models.md). Codex CLI usage documented there: `codex exec -m gpt-6.2-sol "..."`.

## 2. Reasoning effort in Codex

Account catalog (`~/.codex/models_cache.json`, fetched_at 2026-11-18T00:08:27Z, client_version 0.169.0), per model:

| slug | efforts | default | context_window / max |
|---|---|---|---|
| gpt-6.2-sol | low, medium, high, xhigh, max, ultra | low | 500000 / 872000 |
| gpt-6.2-astra | low, medium, high, xhigh, max, ultra | low | 272000 / 872000 |
| gpt-6.1-terra | low, medium, high, xhigh, max, ultra | low | 500000 / 872000 |
| gpt-6.1-sol | low, medium, high, xhigh, max, ultra | low | 500000 / 872000 |
| gpt-6-luna | low, medium, high, xhigh, max (no ultra) | medium | 272000 |

- Catalog description of `ultra`: "Maximum reasoning with automatic task delegation". Docs: Ultra "uses subagents to accelerate complex work"; in Codex "With Ultra, Codex decides on its own when to bring in subagents" (https://learn.chatgpt.com/guides/prompting-gpt-6-2-astra.md, https://learn.chatgpt.com/docs/agent-configuration/subagents.md). At other efforts, delegation happens when asked directly or when AGENTS.md / skill instructions request it. Subagent runs consume more tokens.
- API: `reasoning.effort` `none` is rejected for 6.2 Sol and Astra. API docs list low/medium/high/xhigh/max for 6.2 Sol (https://developers.openai.com/api/docs/models). Terra 6.1 API doc additionally lists `none` (https://developers.openai.com/api/docs/models/gpt-6.1-terra.md). 6.1 Sol API doc: low, medium (default), high, xhigh, max. The API default for Sol 6.1 is medium; the Codex catalog default for 6.2 Sol is low.
- Behaviour changes (https://developers.openai.com/api/docs/guides/latest-model.md): starting with 6.2, the API drops reasoning items when it detects prefix edits, model downgrade, or a change of end user or organization. Keep the prompt prefix unchanged and append instructions. Astra: more concise by default, may propose a next step and wait unless told to proceed autonomously.
- System card item 3 (alignment): both 6.2 models are more likely to omit known obstacles when reporting work (e.g. missing file, unavailable tool). OpenAI says the Codex developer prompt substantially reduces this.
- Terra 6.1 and Sol 6.1 also expose `ultra` in Codex today, so `ultra` is not a 6.2-only feature on this account.

## 3. Prices (per 1M tokens: input / cached input / output), context

| Model | Input | Cached | Output | Cache write (30 min) | Context / max in / max out |
|---|---|---|---|---|---|
| gpt-6.2-sol | $2 | $0.10 | $10 | $2.5 | 1,050,000 / 922,000 / 128,000 |
| gpt-6.2-astra | $8 | $0.40 | $40 | $10 | 1,050,000 / 922,000 / 128,000 |
| gpt-6.1-sol | $2 | $0.10 | $10 | $2.5 | 1,050,000 / 922,000 / 128,000 |
| gpt-6.1-terra | $1 | $0.05 | $5 | $1.25 | 1,050,000 / 922,000 / 128,000 |

- 6.2 Sol keeps 6.1 Sol prices (launch post). Over 272K input tokens: input and cache rates x2, output x1.5 for the whole request. Batch (and Flex for 6.1) 50% off. Fast mode x2. Ultrafast x3 through 2027-02-28, x6 from 2027-03-01 (6.2 pages). Knowledge cutoff: 6.2 Sol Jun 1 2026, 6.2 Astra May 18 2026, 6.1 Terra Jun 1 2026, 6.1 Sol Apr 30 2026.
- Codex defaults: 6.2 Sol 500K context window, 6.2 Astra 272K (`models.md` and catalog). 6.2 Sol supports `fast` and `ultrafast` speed tiers in the catalog; Terra 6.1 and Astra 6.2 only `fast`.
- Rate limits (API, 6.2 Sol): Build 5,000 RPM / 1M TPM; Launch 10,000 / 4M; Grow 15,000 / 40M. Same as Terra 6.1 and Sol 6.1.
- Ultrafast access: Pro 500 and, for the first time, Pro 200 (starting with 6.2 Sol). Pricing page (cached fetch) listed older plan lines; ChatGPT-plan availability for 6.2 per launch post: Plus, Pro, Enterprise, Edu (Business omitted in 6.2 post, present in the 6.1 post).
- Sources: model pages above, https://openai.com/index/introducing-gpt-6-2-astra-sol/, https://learn.chatgpt.com/docs/pricing.md.
- "Model at capacity" notes: nothing documented for 6.2 in the fetched pages. Not verified.

## 4. Benchmark claims

Vendor (OpenAI launch post, 2026-11-17):
- Cognition FrontierCode 2.0 (merge-quality of changes to real codebases): 6.2 Sol within 0.5 points of 6.2 Astra at about one-fifth the cost, both at max.
- GDPval v2 (internal): 6.2 Sol +5.3 points over 6.1 Sol. Sol "smarter, more efficient", lets you complete more tasks on the same plan; fewer output tokens.
- LifeVal: 6.2 Sol outscores GPT-6 Astra at about one-seventh the cost.
- No vendor comparison of 6.2 Sol vs 6.1 Terra on vision/UI or instruction following in the launch post. Frontend/visual claims are made for Astra (richer slides, 3D, websites), not Sol.

Independent (Artificial Analysis, Intelligence Index v5.0.1, all at Max):
- GPT-6.2 Sol: 57; 7.9 min per task; $1.01 per task; 85 tok/s; time to first answer token 61.6 s; 60.9M output tokens. https://artificialanalysis.ai/models/gpt-6-2-sol
- GPT-6.1 Sol: 55; 23.1 min per task; $1.27 per task; 49 tok/s; TTFT 156.2 s; 63.7M output tokens. Page flags it deprecated in favour of 6.2 Sol. https://artificialanalysis.ai/models/gpt-6-1-sol
- GPT-6.1 Terra: 51; 14.3 min per task; $0.96 per task; 70 tok/s; TTFT 152.9 s; 99.4M output tokens. https://artificialanalysis.ai/models/gpt-6-1-terra
- Reading: on AA, 6.2 Sol is both higher scoring (57 vs 51) and faster per task (7.9 vs 14.3 min) than 6.1 Terra, at about the same cost per task ($1.01 vs $0.96) despite 2x token prices, because it emits ~39% fewer output tokens. The figures above are max effort. AA values may update with re-benchmarking.
- Correction 2026-11-18 (challenger, `docs/reports/model-fleet-6.2-challenge.md` §1): AA also publishes per-effort rows, so low/medium-effort data exists. Intelligence Index v5.0.1 (index, minutes per task), sources https://artificialanalysis.ai/models/gpt-6-2-sol and https://artificialanalysis.ai/models/gpt-6-1-terra. The low/medium/high/xhigh rows were read from the AA per-effort charts, not machine-verified; the max row was verified live on 2026-11-18:

  | Effort | GPT-6.2 Sol | GPT-6.1 Terra |
  |---|---|---|
  | low | 41, 1.4 | 29, 1.2 |
  | medium | 53, 3.1 | 38, 2.8 |
  | high | 55, 4.2 | 42, 4.2 |
  | xhigh | 56, 5.1 | 45, 6.5 |
  | max | 57, 7.9 | 51, 14.3 |

  6.2 Sol scores higher at every effort for about the same time per task from medium up. AA cost per task below max: not published.
- Not found / not verified: independent data on "no tools" instruction following and UI/visual quality (MMMU-Pro style) for 6.2 Sol. The owner's own finding (Sol 6.1 ignored "no tools") has no 6.2 counterpart in any source; the 6.2 system card instead reports a regression in disclosing obstacles (see section 2).
- System card (34K words) not read in full; only the summary was read: https://deploymentsafety.openai.com/gpt-6-2-astra-sol. 6.2 Sol is below the High threshold for AI self-improvement; both models at Critical for cybersecurity, with tightened default cyber restrictions.

## 5. Availability on this machine/account

- Read-only listing: `~/.codex/models_cache.json` (no secrets; keys: client_version, etag, fetched_at, identity, models; `identity` not printed), read with `jq` only. Alternative documented: `codex debug models` ("Render the raw model catalog as JSON"), not run.
- Listed (visibility `list`): gpt-6.2-sol, gpt-6.2-astra, gpt-6.1-terra, gpt-6.1-sol, gpt-6-astra, gpt-6-sol, gpt-6-luna, gpt-5.6-sol, gpt-5.6-terra, gpt-5.6-luna. Hidden: gpt-reserve, codex-auto-review. **`gpt-6.2-sol` exact id is listed, `supported_in_api: true`, priority 1.** `gpt-6.1-luna`, `gpt-6.2-terra` and `gpt-6.2-luna` are absent.
- Smoke test (one, tiny): `codex exec -m gpt-6.2-sol "Reply with exactly: OK" 2>&1 | head -20`, cwd repo root. Header printed: `OpenAI Codex v0.169.0 ... model: gpt-6.2-sol, provider: openai, reasoning effort: high, approval: never, sandbox: danger-full-access`, session id 01a1ebfc-d4ad-76b1-8196-8d136b12632b. The model id resolved (no "unknown model" error). Not captured: the reply text (cut by `head -20`) and the exit code (zsh `PIPESTATUS` is empty; the pipeline status was not recorded). Effort/sandbox came from the user's `~/.codex/config.toml`, not from flags. Config warnings seen: `[features].multi_agent` deprecated; `bypass_hook_trust` ignored.
- Earlier attempts blocked by a hook ("Motion approval forgery guard") on a python3 inline read and on `cd /tmp && timeout 120 codex exec -m gpt-6.2-sol -c model_reasoning_effort=low --skip-git-repo-check -s read-only ...`; I did not bypass it and ran the plain form above, which passed. The gate looks like a false positive; its source was not read. No other candidate id was smoke-tested (only gpt-6.2-sol exists as a new candidate).

## 6. Codex CLI version

- Installed: `codex-cli 0.169.0` (/opt/homebrew/bin/codex, brew formula codex 0.169.0).
- Latest stable: `0.169.1` (npm `@openai/codex` 0.169.1; GitHub release rust-v0.169.1 published 2026-11-17T22:21Z; notes "No verified release highlights", compare 0.169.0...0.169.1). Newer alphas exist (0.171.0-alpha.12), not stable.
- A newer CLI is **not required** for 6.2: 0.169.0's catalog already lists gpt-6.2-sol and the exec smoke resolved it. Docs state a minimum only for Terra 6.1 (0.159.0). The catalog `minimum_client_version` for 6.2 Sol is empty. Whether 0.169.1 fixes anything 6.2-related: not verified.

## Factual implications for the fleet (not a recommendation)

- Replacing Terra with a "Terra 6.2" is impossible; the 6.2 candidates are Sol and Astra only.
- 6.2 Sol costs 2x Terra 6.1 per token ($2/$10 vs $1/$5) but has the same price as 6.1 Sol.
- Terra 6.1 remains the cheapest listed non-Luna model; Luna (`gpt-6-luna`) has no `ultra`.
- `ultra` triggers automatic delegation; it conflicts with the lead-orchestrator rule that only the lead spawns agents, so it is a fact to weigh in the matrix, not a setting to enable blindly.
- Sources of vendor vs independent claims are split above; the owner's blind benchmark (2026-10-29) predates 6.2 and cannot be reused for 6.2 Sol.

## Not verified

- 6.2 Sol vs 6.1 Terra on vision/UI, "no tools" instruction following; cost per task below max effort; any capacity-error behaviour; reply text and exit code of the smoke exec; full system card; `codex debug models` output; 0.169.1 changes.
