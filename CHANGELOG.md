# Changelog

## [1.0.58] - 2026-10-12

- build(deps): bump `@fusengine/harness` ^0.1.97 -> ^0.1.108 (`HARNESS_VERSION` tripwire advanced after the 11/11 scope audit of `bun run update-harness`); root deps refreshed (@types/bun 1.4.3, smol-toml 1.9.1, chrome-launcher 1.2.2, fast-xml-parser 5.11.2, lighthouse 13.5.0); core-guards statusline deps refreshed (zod 4.6.6, @biomejs/biome 2.5.15, @types/bun 1.4.3)
- feat(agents): port claude-plugins parity to Codex and sweep size caps — Codex rules (AGENTS.md + byte-identical template + codex-rules/rules): a mid-task owner refinement amends the mandate, never hand the owner a step, guarantee don't hedge, always delegate every edit with the owner's 2-failed-delegations rule as sole exception; lead-orchestration 9-step rewrite (+ brief-template, worked-examples); verification/sniper/challenger/explore-codebase/commit agents refreshed; new `skill-creator` agent (38 agents, `gpt-6.1-sol` medium); `lessons-compact` command; commit-pro release watch; solid-detection stacks; swift HIG references and gate; design-expert platform references; TeamCreate wording -> `spawn_agent`; self-set size caps replaced by `FUSE_SOLID_MAX_LINES` (owner exceptions kept: Zustand store max 40 lines, PR < 400 lines guideline)
- chore(release): bump 20 touched plugins + suite to 1.0.58 — ai-pilot 1.2.59 -> 1.2.60, astro-expert 1.0.23 -> 1.0.24, codex-rules 1.0.35 -> 1.0.36, commit-pro 1.2.36 -> 1.2.37, core-guards 1.1.55 -> 1.1.56, design-expert 2.1.50 -> 2.1.51, go-expert 1.0.20 -> 1.0.21, laravel-expert 1.2.24 -> 1.2.25, lessons 1.0.10 -> 1.0.11, nextjs-expert 1.1.40 -> 1.1.41, php-expert 1.0.20 -> 1.0.21, prompt-engineer 1.1.22 -> 1.1.23, react-expert 1.0.36 -> 1.0.37, rust-expert 1.0.20 -> 1.0.21, shadcn-expert 1.0.33 -> 1.0.34, solid 1.0.30 -> 1.0.31, swift-apple-expert 1.1.36 -> 1.1.37, tailwindcss 1.1.26 -> 1.1.27, tanstack-start-expert 1.0.20 -> 1.0.21, typescript-expert 1.0.20 -> 1.0.21; mirrored in `.agents/plugins/marketplace.json`

## [1.0.57] - 2026-09-30

- feat(agents): move all 37 Codex agents to `gpt-6.1-sol` — reasoning efforts unchanged (36 medium, design-expert high); `scripts/lib/agent-toml.ts` and its tests aligned with no assertion loosened; security-agent-pilot baseline model line and sha256 re-recorded (scorecard keeps the original run hash); docs state the 6.1 policy with verified pricing ($2.00 input / $0.10 cached / $10.00 output per 1M tokens, <=272K input) and mark the all-`gpt-6-sol` history as superseded
- chore(release): bump 22 touched plugins + suite to 1.0.57 — ai-pilot 1.2.58 -> 1.2.59, astro-expert 1.0.22 -> 1.0.23, cartographer 1.0.24 -> 1.0.25, changelog-watcher 1.0.26 -> 1.0.27, commit-pro 1.2.35 -> 1.2.36, design-expert 2.1.49 -> 2.1.50, go-expert 1.0.19 -> 1.0.20, laravel-expert 1.2.23 -> 1.2.24, lessons 1.0.9 -> 1.0.10, nextjs-expert 1.1.39 -> 1.1.40, php-expert 1.0.19 -> 1.0.20, prompt-engineer 1.1.21 -> 1.1.22, react-expert 1.0.35 -> 1.0.36, rust-expert 1.0.19 -> 1.0.20, security-expert 1.0.29 -> 1.0.30, seo 1.0.23 -> 1.0.24, shadcn-expert 1.0.32 -> 1.0.33, solid 1.0.29 -> 1.0.30, swift-apple-expert 1.1.35 -> 1.1.36, tailwindcss 1.1.25 -> 1.1.26, tanstack-start-expert 1.0.19 -> 1.0.20, typescript-expert 1.0.19 -> 1.0.20; mirrored in `.agents/plugins/marketplace.json`

## [1.0.56] - 2026-09-27

- fix(rules): let the owner re-authorize a blocked approval and an install run — the "never retry around a hook/policy block" rule (AGENTS.md, AGENTS.md.template, 08-subagent-conduct.md) allows one unchanged rerun when the block asked for approval (or failed for a missing approval token) and the owner then explicitly authorizes that exact command in their own chat message (never an agent relay); the `setup.sh`/`install*.ts` hard stop allows that exact run when the owner explicitly orders it in their own chat message
- chore(release): bump codex-rules 1.0.34 -> 1.0.35 + suite to 1.0.56; mirrored in `.agents/plugins/marketplace.json`

## [1.0.55] - 2026-09-27

- docs(skills): refresh skills and agent guidance across 18 plugins to current stable versions — TypeScript 7.0, Bun 1.4, Node 26 LTS, Astro 7.3.5, Next.js 16.3, React 19.3, Prisma 7.10, Tailwind 4.3, Laravel 13.33, Go 1.27, Rust 1.98, Swift 6.4, shadcn CLI 4.21 with Base UI as default; fixes wrong Astro `output: 'hybrid'`, `@astrojs/db` status and Sanctum ^5.0 guidance
- chore(i18n): translate remaining French content to English — design references, design scripts, statusline strings
- chore(release): bump 18 touched plugins + suite to 1.0.55 — astro-expert 1.0.21 -> 1.0.22, cartographer 1.0.23 -> 1.0.24, codex-rules 1.0.33 -> 1.0.34, core-guards 1.1.54 -> 1.1.55, design-expert 2.1.48 -> 2.1.49, go-expert 1.0.18 -> 1.0.19, laravel-expert 1.2.22 -> 1.2.23, nextjs-expert 1.1.38 -> 1.1.39, php-expert 1.0.18 -> 1.0.19, react-expert 1.0.34 -> 1.0.35, rust-expert 1.0.18 -> 1.0.19, seo 1.0.22 -> 1.0.23, shadcn-expert 1.0.31 -> 1.0.32, solid 1.0.28 -> 1.0.29, swift-apple-expert 1.1.34 -> 1.1.35, tailwindcss 1.1.24 -> 1.1.25, tanstack-start-expert 1.0.18 -> 1.0.19, typescript-expert 1.0.18 -> 1.0.19; mirrored in `.agents/plugins/marketplace.json`

## [1.0.54] - 2026-09-27

- feat(agents): move the 18 gpt-6-luna/medium agents to gpt-6-sol/medium — fleet is now 36 gpt-6-sol/medium + 1 gpt-6-sol/high (design-expert), zero Luna; owner decision 2026-09-27, knowingly overriding the 2026-09-23 benchmark that favoured Luna on cost/speed
- chore(scripts): agent-toml.ts profiles (Luna constant and union member removed); agent-toml.test.ts and agent-tier-matrix.test.ts aligned to 1/36 — assertions tightened, none loosened
- docs: current matrix in all policy docs (`docs/GAP-HARNESS.md`, `docs/reference/creating-skills-agents.md`, `docs/task-list.md`, `docs/workflow/agents.md`, agent-creator skill + references); the 2026-09-23 Sol/Luna split recorded once as superseded history in `docs/workflow/agents.md`
- chore(release): bump 16 touched plugins + suite to 1.0.54 — ai-pilot 1.2.57 -> 1.2.58, astro-expert 1.0.20 -> 1.0.21, cartographer 1.0.22 -> 1.0.23, commit-pro 1.2.34 -> 1.2.35, go-expert 1.0.17 -> 1.0.18, laravel-expert 1.2.21 -> 1.2.22, nextjs-expert 1.1.37 -> 1.1.38, php-expert 1.0.17 -> 1.0.18, react-expert 1.0.33 -> 1.0.34, rust-expert 1.0.17 -> 1.0.18, seo 1.0.21 -> 1.0.22, shadcn-expert 1.0.30 -> 1.0.31, swift-apple-expert 1.1.33 -> 1.1.34, tailwindcss 1.1.23 -> 1.1.24, tanstack-start-expert 1.0.17 -> 1.0.18, typescript-expert 1.0.17 -> 1.0.18; mirrored in `.agents/plugins/marketplace.json`

## [1.0.53] - 2026-09-24

- feat(agents): switch all 37 Codex agents to the GPT-6 tier matrix — gpt-6-luna/medium x18 (code/framework experts, sniper-faster, websearch, cartographer, commit-detector, seo-images, seo-sitemap), gpt-6-sol/medium x18 (ai-pilot judgment/validation agents, research, explore, security, prompt-engineer, seo core, solid-orchestrator, lessons-compactor, changelog-watcher), gpt-6-sol/high x1 (design-expert); no gpt-6-astra (cost); owner decision 2026-09-23 backed by measured benchmarks (greenfield + debug: Luna/medium 100% hidden-test pass on debug tasks at ~1/50 of Sol cost)
- chore(scripts): agent-toml.ts profiles + agent-toml.test.ts + agent-tier-matrix.test.ts aligned to 1/18/18 (no test loosened)
- docs: agent policy docs, agent-creator skill references, lead-orchestration + codex-rules attribution; single canonical GPT-5.6 history in `docs/workflow/agents.md`; task-list/GAP-HARNESS current-state fixes
- docs(validation): security-agent-pilot baseline.toml model line updated to gpt-6-sol with its sha256 re-recorded (`baseline.toml.sha256`, `security-agent-pilot.md`); scorecard keeps the original run hash
- chore(release): bump 23 touched plugins + suite to 1.0.53 — ai-pilot 1.2.56 -> 1.2.57, astro-expert 1.0.19 -> 1.0.20, cartographer 1.0.21 -> 1.0.22, changelog-watcher 1.0.25 -> 1.0.26, codex-rules 1.0.32 -> 1.0.33, commit-pro 1.2.33 -> 1.2.34, design-expert 2.1.47 -> 2.1.48, go-expert 1.0.16 -> 1.0.17, laravel-expert 1.2.20 -> 1.2.21, lessons 1.0.8 -> 1.0.9, nextjs-expert 1.1.36 -> 1.1.37, php-expert 1.0.16 -> 1.0.17, prompt-engineer 1.1.20 -> 1.1.21, react-expert 1.0.32 -> 1.0.33, rust-expert 1.0.16 -> 1.0.17, security-expert 1.0.28 -> 1.0.29, seo 1.0.20 -> 1.0.21, shadcn-expert 1.0.29 -> 1.0.30, solid 1.0.27 -> 1.0.28, swift-apple-expert 1.1.32 -> 1.1.33, tailwindcss 1.1.22 -> 1.1.23, tanstack-start-expert 1.0.16 -> 1.0.17, typescript-expert 1.0.16 -> 1.0.17; mirrored in `.agents/plugins/marketplace.json`

## [1.0.52] - 2026-09-21

- chore(hooks): remove dead native-hook layer and codex-hooks package — 135 files: every `plugins/*/scripts/**/*.native.ts`, `plugins/seo/scripts/validate-seo.ts`, the 10 deleted co-located `*.test.ts` under `plugins/*/scripts` that imported them, `scripts/build-hooks.ts`, `packages/codex-hooks/package.json`, `.gitignore`, `scripts/lib/install/{runtime-deps,plugin-cache}.ts` (+ new `plugin-cache.test.ts`), `scripts/tests/runtime-shared.test.mts`, `scripts/lib/hooks-rewrite.ts`, `scripts/lib/install/{agents-resync,merge-agents-md}.ts`
- chore(scripts): purge orphaned plugin lib modules (90 files) — every remaining deleted file under `plugins/*/scripts/**`: ai-pilot lib/cache/apex trees (incl. `package.json`/`tsconfig.json`), core-guards `_shared/**` + `sound/play.ts`, design-expert lib + `pipeline_state.ts`, seo `cannibalization-audit.ts`/`track-rank.ts`, `plugins/_shared/scripts/*`, the 4 `*-triggers.ts`, memory-neural `lib/neural.ts`
- docs: drop native-hook and plugin-script references — `docs/GAP-HARNESS.md`, `docs/plugins/ai-pilot.md`, `docs/reference/cache-system.md`, `docs/reference/architecture.md`, `README.md`, `plugins/ai-pilot/skills/agent-creator/{SKILL.md,references/hooks.md,references/templates/hook-scripts*.md}` (3), `plugins/shadcn-expert/skills/shadcn-detection/references/templates/detection-script.md`
- chore(release): bump 16 touched plugins + suite to 1.0.52 — ai-pilot 1.2.55 -> 1.2.56, cartographer 1.0.20 -> 1.0.21, changelog-watcher 1.0.24 -> 1.0.25, codex-rules 1.0.31 -> 1.0.32, core-guards 1.1.53 -> 1.1.54, design-expert 2.1.46 -> 2.1.47, laravel-expert 1.2.19 -> 1.2.20, memory-neural 1.0.9 -> 1.0.10, nextjs-expert 1.1.35 -> 1.1.36, react-expert 1.0.31 -> 1.0.32, security-expert 1.0.27 -> 1.0.28, seo 1.0.19 -> 1.0.20, shadcn-expert 1.0.28 -> 1.0.29, solid 1.0.26 -> 1.0.27, swift-apple-expert 1.1.31 -> 1.1.32, tailwindcss 1.1.21 -> 1.1.22; mirrored in `.agents/plugins/marketplace.json`

## [1.0.51] - 2026-09-16

- chore(agents): doubt rule and tier matrix across the 37 agent TOMLs — every `plugins/*/agents/*.toml` (ai-pilot 8, seo 4, 19 single-agent plugins incl. security-expert medium per owner decision 2026-09-07) gains the executor doubt rule and tier-matrix wording; `scripts/lib/security-agent-pilot-run.ts` + `.test.ts` add the pilot-run harness; new `docs/validation/` (agent fleet corrections, security-agent-pilot baseline/cases/evidence with sha256 manifests)
- docs(doctrine): restore delegation floors, PRD roll-up and executor doubt rule — `AGENTS.md`, `plugins/ai-pilot/skills/**` (lead-orchestration, agent-creator + templates, apex-methodology, brainstorming, challenge, code-quality, elicitation, research), `plugins/ai-pilot/commands/{apex,apex-quick}.md`, `plugins/codex-rules/rules/{02,03,08}` + `templates/AGENTS.md.template`, `plugins/design-expert/skills/design-review`, `docs/workflow/{agents,apex}.md`, `docs/reference/creating-skills-agents.md`, `docs/plugins/{astro,laravel,react,swift}.md`
- test(contracts): lock the 1/16/15/5 tier matrix and orchestration floors — `scripts/lib/agent-toml.ts` + `.test.ts`, `agents-md-routing.test.ts`, new `agent-orchestration-contract.test.ts` and `agent-tier-matrix.test.ts`
- fix(hooks): check-solid-compliance reads FUSE_SOLID_MAX_LINES — `plugins/ai-pilot/scripts/check-solid-compliance.native.ts` resolves the file-size ceiling from the env var (default 200) instead of the hard-coded 100/90 pair
- chore(deps): harness 0.1.97 with 11-scope audit, minor dependency bumps — root `package.json`/`bun.lock` (`@fusengine/harness` 0.1.90 -> 0.1.97, `@types/bun`, `yaml`, `@clack/prompts`, `fast-xml-parser`), `scripts/lib/harness-hook-policy.ts` tripwire 0.1.90 -> 0.1.97, `plugins/ai-pilot/scripts/package.json` (`@types/bun`), `plugins/core-guards/statusline/{package.json,src/services/oauth.service.ts}` biome format only
- chore(release): bump 23 touched plugins + suite to 1.0.51 — ai-pilot 1.2.54 -> 1.2.55, astro-expert 1.0.18 -> 1.0.19, cartographer 1.0.19 -> 1.0.20, changelog-watcher 1.0.23 -> 1.0.24, codex-rules 1.0.30 -> 1.0.31, commit-pro 1.2.32 -> 1.2.33, core-guards 1.1.52 -> 1.1.53, design-expert 2.1.45 -> 2.1.46, go-expert 1.0.15 -> 1.0.16, laravel-expert 1.2.18 -> 1.2.19, nextjs-expert 1.1.34 -> 1.1.35, php-expert 1.0.15 -> 1.0.16, prompt-engineer 1.1.19 -> 1.1.20, react-expert 1.0.30 -> 1.0.31, rust-expert 1.0.15 -> 1.0.16, security-expert 1.0.26 -> 1.0.27, seo 1.0.18 -> 1.0.19, shadcn-expert 1.0.27 -> 1.0.28, solid 1.0.25 -> 1.0.26, swift-apple-expert 1.1.30 -> 1.1.31, tailwindcss 1.1.20 -> 1.1.21, tanstack-start-expert 1.0.15 -> 1.0.16, typescript-expert 1.0.15 -> 1.0.16; mirrored in `.agents/plugins/marketplace.json`

## [1.0.50] - 2026-09-04

- feat(scripts): update-harness with automated 11-scope audit and rollback — `bun run update-harness [--check|<version>]` resolves the latest `@fusengine/harness` via `bun pm view`, snapshots package.json + bun.lock, bumps the caret range (exact pin only when a version is given), reinstalls, audits the 11 hook scopes with a fail-closed control probe, updates the `HARNESS_VERSION` tripwire, and restores the snapshot on any failure; `--check` exits 1 on drift; `engines.bun` tightened to `>=1.2.15`; `harness-hook-validation.ts` imports `installedHarnessVersion` from the new module
- docs(doctrine): three-level PRD hierarchy and empty-report relaunch rule — router `.codex/apex/prd.json` -> task PRD `prd/<task>-prd.json` (coordinator-only, `validated` after disk check) -> agent report `prd/agents/<agent>-prd.json` (agent-only `done`); reads free for all, one writer per file, compaction never merges two agents; a research/exploration agent whose final report is empty or truncated is relaunched immediately (Terra tier, codex#32389); line citations re-anchored
- chore(agents): Sol effort medium by default, research trio on Terra medium — final matrix Sol/high 2 (design-expert from xhigh, security-expert), Sol/medium 15 (challenger and prompt-engineer moved from high), Terra/medium 15 (12 framework experts + explore-codebase, research-expert, websearch, owner decision, not benchmarked), Luna/max 5; totals 17/15/5 = 37; `SOL_XHIGH` profile retired
- chore(release): bump 4 touched plugins + suite to 1.0.50 — ai-pilot 1.2.53 -> 1.2.54, codex-rules 1.0.29 -> 1.0.30, design-expert 2.1.44 -> 2.1.45, prompt-engineer 1.1.18 -> 1.1.19; mirrored in `.agents/plugins/marketplace.json`

## [1.0.49] - 2026-09-02

- chore(agents): Terra medium executors, always-delegate doctrine, Codex-format agent-creator — AGENTS.md + lead-orchestration now always delegate the full APEX route (trio, >=3 domain experts on disjoint lots, PRD in `.codex/apex/prd.json` + `prd/<agent>.json`, challenger then sniper on every deliverable), no scope ladder, sub-agents may delegate and message each other; `codex-rules` 01/02/03/06/08 rewritten to the doctrine (no rule removed), 00 gains the lead-side challenger rule, `hooks.json` `additionalContextLimit` 6000 on the 3 rule handlers, hooks validator now accepts `additionalContextLimit` (non-negative integer, context-producing events only) with tests and docs; model policy moves the 12 framework experts to `gpt-5.6-terra`/medium after a 21-run `codex exec` 0.152.1 benchmark (all hidden tests passed on every tier, Terra medium 1.7x faster and half the cost of Sol medium), sniper to Sol/medium, challenger/security-expert/prompt-engineer stay Sol/high, design-expert Sol/xhigh, 5 mechanical agents Luna/max, coordinator stays Sol/high — matrix 20 Sol / 12 Terra / 5 Luna encoded in `agent-toml.ts`, tests, docs and the agent-creator skill; agent-creator skill rewritten to the Codex TOML agent format with inherited AGENTS.md rules and split reference files; `apex-quick` = full APEX minus Brainstorm (Analyze trio, delegated execute, eLicit, Verify, challenger, full sniper), 4 docs aligned, `--skip-elicit` documented as ignored; Gemini Design MCP made optional everywhere (4 expert TOMLs, design rules, agent-creator templates), design-expert owner-verdict precedence + taste-first skill, commit-pro post-commit tag note, 3 pre-existing failing tests fixed
- chore(release): bump 18 touched plugins + suite to 1.0.49 — ai-pilot 1.2.52 -> 1.2.53, astro-expert 1.0.17 -> 1.0.18, codex-rules 1.0.28 -> 1.0.29, commit-pro 1.2.31 -> 1.2.32, design-expert 2.1.43 -> 2.1.44, go-expert 1.0.14 -> 1.0.15, laravel-expert 1.2.17 -> 1.2.18, lessons 1.0.7 -> 1.0.8, nextjs-expert 1.1.33 -> 1.1.34, php-expert 1.0.14 -> 1.0.15, react-expert 1.0.29 -> 1.0.30, rust-expert 1.0.14 -> 1.0.15, shadcn-expert 1.0.26 -> 1.0.27, solid 1.0.24 -> 1.0.25, swift-apple-expert 1.1.29 -> 1.1.30, tailwindcss 1.1.19 -> 1.1.20, tanstack-start-expert 1.0.14 -> 1.0.15, typescript-expert 1.0.14 -> 1.0.15; mirrored in `.agents/plugins/marketplace.json`

## [1.0.48] - 2026-08-18

- chore(repo): sync agent policy and runtime pins
- chore(release): bump 17 touched plugins + suite to 1.0.48 — ai-pilot 1.2.51 -> 1.2.52, astro-expert 1.0.16 -> 1.0.17, changelog-watcher 1.0.22 -> 1.0.23, codex-rules 1.0.27 -> 1.0.28, design-expert 2.1.42 -> 2.1.43, go-expert 1.0.13 -> 1.0.14, laravel-expert 1.2.16 -> 1.2.17, nextjs-expert 1.1.32 -> 1.1.33, php-expert 1.0.13 -> 1.0.14, react-expert 1.0.28 -> 1.0.29, rust-expert 1.0.13 -> 1.0.14, seo 1.0.17 -> 1.0.18, shadcn-expert 1.0.25 -> 1.0.26, swift-apple-expert 1.1.28 -> 1.1.29, tailwindcss 1.1.18 -> 1.1.19, tanstack-start-expert 1.0.13 -> 1.0.14, typescript-expert 1.0.13 -> 1.0.14; mirrored in `.agents/plugins/marketplace.json`

## [1.0.47] - 2026-08-13

- fix(design-expert): accept Codex-sanitized MCP tool names in hooks — Codex sanitizes `-` -> `_` in MCP tool ids, so hooks matching `mcp__gemini-design__*` never fired; `hooks.json` + `scripts/lib/harness-hook-routes.json` dual-form `[-_]` matchers (byte-identical mirror), new `scripts/lib/mcp-names.ts` helper (`isMcpTool`, `mcpServerMatches`) used by `pipeline-gate`, `check-inspiration-read`, `validate-design-system` and `track-mcp-research`, core-guards `GEMINI_PREFIX_RE` accepts `[-_]`, changelog-watcher `fuse_browser` keyword (design-expert 2.1.42, core-guards 1.1.52, changelog-watcher 1.0.22)
- chore(deps): bump `@fusengine/harness` `^0.1.89` -> `^0.1.90` and align `HARNESS_VERSION` (0.1.87 -> 0.1.90, all 11 hook scopes audited on 0.1.90); root `fast-xml-parser` `^5.10.1`, `lighthouse` `^13.4.1`, `smol-toml` `^1.8.0`, `@types/bun` `^1.3.14`; core-guards/statusline `@clack/prompts` `^1.7.0`, `terminal-kit` `^3.1.4`, `zod` `^4.4.3`, `@biomejs/biome` `^2.5.8`, `typescript` `^7.0.2`; `bun.lock` regenerated
- chore(release): bump suite to 1.0.47 (design-expert 2.1.42, core-guards 1.1.52, changelog-watcher 1.0.22 shipped with the fix commit)

## [1.0.46] - 2026-08-03

- chore(design-expert): anonymize source-site references in the design refs corpus — replace identifying mentions of three third-party sites (used as design references) with neutral wording ("the source page" / "the source", "la page source" / "la source") across 11 files under `refs-design/{dispatch,parley,stash}-recode`, 22 occurrences, pure substitution, no measured value or technical detail lost
- chore(deps): bump `@fusengine/harness` `^0.1.87` -> `^0.1.89` and regenerate `bun.lock` (diff scoped to the harness entry, no other dependency drift)
- chore(release): bump design-expert 2.1.40 -> 2.1.41 + suite to 1.0.46

## [1.0.45] - 2026-08-02

- refactor(agents): enforce strict 3-tier model/effort matrix across 37 agent TOMLs — `gpt-5.6-sol`+`high` for judgment/refutation/security (sniper, challenger, research-expert, brainstorming, security-expert, solid-orchestrator, prompt-engineer), `gpt-5.6-terra`+`medium` for business/framework experts and explorers, `gpt-5.6-luna`+`max` for mechanical agents (commit, sniper-faster, cartographer, commit-detector, lessons-compactor, seo-images, seo-sitemap); `scripts/lib/agent-toml.ts` replaces two independent model/effort constants with a single `TIERS` object so no out-of-matrix pairing can be produced; `scripts/lib/install/config-options.ts` `FALLBACK_EFFORTS` extended 5 -> 8 values to match the full Codex `ReasoningEffort` enum (Rust source ahead of the public config-reference docs); fixtures and docs (`docs/workflow/agents.md`, `docs/GAP-HARNESS.md`, `docs/reference/creating-skills-agents.md`) updated accordingly
- feat(design-expert): port 5 upstream reference designs (`dispatch`, `mosa`, `parley`, `stash`, `stripe` — 48 files), growing the reference corpus from 10 to 15 pages, with the 7 dependent skill files recounted accordingly; adds `scripts/layout-check/` (30 ported files: contrast, hidden-text, overlap, document-overflow, text-overflow, cta-wrap probes) and `_artistic/elysian/` (23 files); `rules/gemini-design.md` merged section by section — **Gemini Design MCP becomes an OPTIONAL path, direct HTML/CSS generation becomes the default** — while keeping the target-only `MULTI-STACK RULES` and `FONT VERIFICATION (BLOCKING)` sections intact
- fix(design-expert): type the `layout-check` browser probes with their own DOM tsconfig — they run inside the page via Playwright `page.evaluate()`, so the root tsconfig (`lib: ["ESNext"]`, no DOM) failed them; excluded at the root (same pattern as `plugins/core-guards/statusline/**`) and given a local config extending the root with DOM
- refactor(codex-rules): stop paying the rules corpus twice — it was BOTH merged into `$CODEX_HOME/AGENTS.md` at install (245 lines between the `fusengine:codex-rules` fences) AND injected by the hook on `SessionStart`/`SubagentStart`/`UserPromptSubmit` (18 078 bytes measured). `runner.ts` now calls `syncAgentsMdRules()`, which prunes by default; the merge stays available via `FUSE_RULES_MERGE_AGENTS_MD=1`. Since `AGENTS.md` is not an inherited sub-agent setting, every spawned agent reloaded it from disk — the corpus was billed twice per agent
- refactor(agents-md): amend `AGENTS.md` from an analysis of real Codex sessions, then compact it 144 -> 135 lines with no rule lost (verified by `comm` on backticked tokens, numbers and NEVER/ALWAYS counts) — `Before ANY Action` is now **LEAD ONLY** with an explicit firing condition (the ANALYZE trio fires on need or owner request, never by reflex); `>10 min` with no fresh mtime means dead, not busy (`TaskStop` then relaunch); `Ask` is reserved for irreversible actions and a settled instruction is never re-opened as a question or a menu; the no-invention rule now covers **conversational facts** (any reference attributed to the owner must be citable) and sub-agent claims must be verified on the artefact before being relayed
- docs(readme): fix stale version badge (1.0.43, unsynced since the 1.0.44 release) and align with 1.0.45
- chore(release): bump 20 touched plugins (ai-pilot 1.2.51, astro-expert 1.0.16, cartographer 1.0.19, changelog-watcher 1.0.21, commit-pro 1.2.31, design-expert 2.1.40, go-expert 1.0.13, laravel-expert 1.2.16, lessons 1.0.7, nextjs-expert 1.1.32, php-expert 1.0.13, react-expert 1.0.28, rust-expert 1.0.13, seo 1.0.17, shadcn-expert 1.0.25, swift-apple-expert 1.1.28, tailwindcss 1.1.18, tanstack-start-expert 1.0.13, typescript-expert 1.0.13, codex-rules 1.0.27) + suite to 1.0.45

## [1.0.44] - 2026-08-01

- feat(codex-rules): restore AGENTS.md template fidelity and reactivate runtime rules injection — root `AGENTS.md` realigned with the Claude template (Critical Rules 8-rule section and Directives restored verbatim, Identity/Non-Negotiables/SOLID de-condensed, `SessionEnd` added for 11 hook events, 13501 -> 17257 bytes), `plugins/codex-rules/scripts/inject-rules.native.ts` is no longer a no-op: it serves the concatenated `rules/*.md` corpus via `hookSpecificOutput.additionalContext` (parity with the Kimi ecosystem) with a `FUSE_RULES_INJECT=0` kill switch, `plugins/codex-rules/templates/AGENTS.md.template` regenerated as the mirror, and the `scripts/lib/install/merge-agents-md.ts` doc header updated (install-time merge and runtime injection coexist)
- docs(readme): align badges with the 1.0.43 release (commit carried over from the unmerged `docs/readme-badges-1.0.43` branch)
- chore(release): bump codex-rules 1.0.26 + suite to 1.0.44

## [1.0.43] - 2026-08-01

- feat(codex): restore the full verbatim Claude -> Codex port — 37 agent TOMLs rewritten with the integral verbatim body (`<role>` restored) plus the new `lessons-compactor` agent, 196 skills re-ported verbatim (frontmatter name/description, objective blocks restored, mechanical adaptations only: `fuse-*:` prefixes -> bare names, `.claude` -> `.codex`, `Task` -> `spawn_agent`), `plugins/codex-rules/rules/*.md` restored in full (5855 -> 17663 bytes), root `AGENTS.md` HARD STOPS + RECURRING TRAPS sections restored, `templates/AGENTS.md.template` regenerated as its mirror
- feat(design-expert): add the `taste-first` skill (brand generate/redesign pipeline) with its hook library (`scripts/lib/taste-first.ts` + contract/ownership/unit tests), the `body-sequence-bank.md` (ten body sequences; `macrostructure-bank.md` re-scoped to hero treatments), the `design-web/references/refs-design/` recode corpus, a taste-first bypass across the design hook scripts, an agent-id stack in `design-agent-flag`, register+move routing in the `/prompts:design*` commands, and `scripts/env-shell/` installer updates (owner work, separate commit)
- chore(deps): bump `@fusengine/harness` 0.1.83 -> 0.1.87 and align `HARNESS_VERSION`; new `scripts/sync-agents.ts` + `sync:agents` script; Codex hook wiring for `spawn_agent`/`update_plan` matchers (`plugins/ai-pilot/hooks/hooks.json`, `harness-hook-routes.json`, `inject-apex-context.native.ts`)
- chore(release): bump 23 touched plugins (ai-pilot 1.2.50, astro-expert 1.0.15, cartographer 1.0.18, changelog-watcher 1.0.20, codex-rules 1.0.25, commit-pro 1.2.30, design-expert 2.1.39, go-expert 1.0.12, laravel-expert 1.2.15, lessons 1.0.6, nextjs-expert 1.1.31, php-expert 1.0.12, prompt-engineer 1.1.18, react-expert 1.0.27, rust-expert 1.0.12, security-expert 1.0.26, seo 1.0.16, shadcn-expert 1.0.24, solid 1.0.24, swift-apple-expert 1.1.27, tailwindcss 1.1.17, tanstack-start-expert 1.0.12, typescript-expert 1.0.12) + suite to 1.0.43

## [1.0.42] - 2026-07-25

- feat(codex): wire the 4 missing Codex 0.145 hook events the harness already implements (7 -> 11) — `PreCompact` (`saveApexState`, core), `PostCompact` (`postCompactContext`, core, scope-gated), `SessionEnd` on two disjoint carriers (core `cleanupSession`, aipilot `cacheAnalyticsSave`, 3s timeout cap), and `PermissionRequest` (core); routes declared in `harness-hook-routes.json` (87 -> 92) and `SessionEnd` added to the validation allowlist
- chore(deps): bump `@fusengine/harness` to `^0.1.83` and align `HARNESS_VERSION`
- refactor(rules): compress the instruction corpus 31624 -> 13201 bytes (-58%) by deduplication (APEX pipeline, Code Error Prevention, Cartography/Mandate Quality/Git flow/fuse-browser were duplicated), no rule lost; add 5 efficiency thresholds (sniper sized to diff, challenger bounded in-task, research gate conditioned on API surface, 3-column scope table with tie-breaker, on-demand skill reads); fix `gh pr merge --squash` contradiction in the template (squash orphans the post-merge release tag, AGENTS.md already forbade it)
- fix(apex): replace the `jq ... > f.tmp && mv` idiom across 56 APEX procedure files — it tripped the "Shell redirect to file detected" guard-rail, which hard-DENYs under `codex exec`; `jq` now prints to STDOUT with persistence via the native write tool. Migrate the APEX state path `.codex/apex` -> `.harness/apex` (237 sites) and harden the `doc_consulted` schema
- feat(installer): add the hooks-trust workstream (`hook-hash*`, `hooks-trust*`) — canonical hashing and cryptographic/canonical validation of hooks before execution, plus `mcp-configurator`/`runner`/`toml-helpers` install-side changes
- chore(release): bump ai-pilot 1.2.49, codex-rules 1.0.24, core-guards 1.1.51 + suite to 1.0.42

## [1.0.41] - 2026-07-22

- refactor(mcp): `mcp.json.bak` is now the single MCP config source — all 20 `plugins/*/.mcp.json` renamed to `mcp.json.bak`, `mcp-configurator.ts` reads it directly, `mcp.ts` + `plugin-scanner.ts` aligned; the now-redundant `mcpServers` field dropped from `manifest.ts`, `types.ts`, and all 20 `plugin.json` files; obsolete `scripts/migrate-mcp.ts` + `scripts/normalize-mcp.ts` removed (0 references)
- docs: `AGENTS.md` compacted 147 -> 143 lines, with a new `## Code Review Rules` section (standard from developers.openai.com/blog/custom-code-review-rules-for-codex); `plugins/codex-rules/rules/*.md` corpus deduplicated 258 -> 126 lines, installed merge output 413 -> 278 lines
- chore(release): bump ai-pilot 1.2.48, changelog-watcher 1.0.19, codex-rules 1.0.23, commit-pro 1.2.29, design-expert 2.1.38, go-expert 1.0.11, laravel-expert 1.2.14, memory-neural 1.0.9, nextjs-expert 1.1.30, php-expert 1.0.11, prompt-engineer 1.1.17, react-expert 1.0.26, rust-expert 1.0.11, security-expert 1.0.25, seo 1.0.15, shadcn-expert 1.0.23, solid 1.0.23, swift-apple-expert 1.1.26, tailwindcss 1.1.16, tanstack-start-expert 1.0.11, typescript-expert 1.0.11 + suite to 1.0.41

## [1.0.40] - 2026-07-20

- fix(installer): the harness env toggles were only ever proposed once per machine — a `_FUSENGINE_HARNESS_ASKED` marker blocked the prompt block for life after the first install. The marker is removed from the code and actively purged from existing `.env` files (`purgeLegacyAskedMarker`), so machines that already installed repair themselves on the next setup run
- fix(installer): `FUSE_HARNESS_MARKETPLACES=fusengine-codex` is now written unconditionally. Without it, the harness filtered the plugin cache on the default allowlist `fusengine-plugins` and saw none of our skills — the SOLID-read gate stayed off
- fix(installer): `~/.codex/.env` is no longer rewritten wholesale. Writes are now a targeted upsert — comments, blank lines, unexported `KEY=value` lines, empty values, and line order are all preserved; an updated key keeps its position; file mode 600 is re-applied explicitly (`writeFileSync`'s `mode` is a no-op on an existing file). Previously a line without `export` — typically a hand-pasted API key — was destroyed on every setup
- fix(installer): custom values are no longer overwritten. A key present with a value different from the preset (e.g. `FUSE_MCP_TTL_SEC=3600`) is now recognized as active and its value preserved; previously a plain Enter on the multiselect deleted it
- feat(installer): drop the umbrella confirm before the SOLID / debug / sound / tuning toggles — they are now presented directly, aligned with `claude-plugins` behavior
- feat(installer): add `--skip-env` to skip the env prompt block as an interactive-install shortcut (not a non-TTY/CI mode — `promptPerfEnv` still has no non-TTY guard and would hang without a terminal; that fix is deferred)
- test(installer): +17 tests, including `--skip-env` path coverage and a TTY-simulated test that reaches the prompt block itself
- chore(release): bump suite to 1.0.40 (no plugin touched — installer-only change under `scripts/`)

## [1.0.39] - 2026-07-20

- fix(installer): the harness SOLID-read gate was silently disabled on every machine running only this Codex marketplace — `@fusengine/harness` filters `~/.claude`/`~/.codex` skill caches by `FUSE_HARNESS_MARKETPLACES` (default `"fusengine-plugins"`), and our marketplace is named `fusengine-codex`, so it was excluded from the default allowlist (0 references found, gate off with no refs per the harness's own JSDoc). `ensureHarnessMarketplace()` now writes `FUSE_HARNESS_MARKETPLACES=fusengine-codex` into `~/.codex/.env` unconditionally, ahead of both the non-TTY guard and the `_FUSENGINE_HARNESS_ASKED` marker guard, so already-installed machines pick it up on next run too
- feat(installer): expose 9 more harness runtime toggles (6 -> 15) — `FUSE_HARNESS_MARKETPLACES`, `FUSE_SOLID_MAX_LINES`, `FUSE_LESSONS_THROTTLE_MIN`, `FUSENGINE_CACHE_TTL_MIN`, `FUSE_HARNESS_DEBUG`, `FUSE_HARNESS_SOUND`, `FUSE_HARNESS_SOUND_STOP`, `FUSE_HARNESS_SOUND_PERMISSION`, `FUSE_HARNESS_SOUND_HUMAN`, ported from `claude-plugins/scripts/src/` and adapted to `<codexHome>/.env`; only `FUSE_HARNESS_SOUND` is a boolean opt-out, the three `_STOP`/`_PERMISSION`/`_HUMAN` vars are absolute audio-file path overrides
- test(installer): shared `clack-prompts-mock.ts` helper replaces 8 incomplete inline `@clack/prompts` stubs, fixing cross-file test failures caused by Bun's process-global `mock.module` leaking between files
- chore(release): bump suite to 1.0.39 (no plugin touched — installer-only change under `scripts/`)

## [1.0.38] - 2026-07-20

- fix(nextjs-expert): `nickname_candidates` contained dots (`"Next.js Expert"`, `"Next.js Expert Agent"`) — outside the ASCII charset Codex's agent-role loader enforces (`codex-rs/core/src/config/agent_roles.rs`, tag `rust-v0.144.6`), so Codex 0.144.6 discarded the entire role file at startup with a one-line warning and `nextjs-expert` became silently non-spawnable. Nicknames trimmed of dots.
- test(scripts): new `scripts/lib/agent-role-validation.ts` (`agentRoleViolations()`) guards the fatal agent-role load conditions — required non-blank `name`/`description`/`developer_instructions`, and the 4 `nickname_candidates` rules (non-empty array, no blank entries, no case-sensitive duplicates, ASCII `[A-Za-z0-9 _-]` charset); new guardrail test asserts every shipped agent TOML survives it
- chore(release): bump nextjs-expert 1.1.29 + suite to 1.0.38

## [1.0.37] - 2026-07-20

- feat(harness): auto-deposit Codex execpolicy rules on install — new `exec-policy{,-generator,-approval}.ts` generate the Starlark ruleset via the local harness `codex-rules` command and deposit `$CODEX_HOME/rules/fusengine.rules` idempotently (head marker, foreign files untouched), then guarantee `approval_policy = "on-request"` post-hoc; bump `@fusengine/harness` ^0.1.67 -> ^0.1.79 (0.1.78 makes the injected APEX template target-aware for Codex, `update_plan` replaces `TaskCreate`/`TaskUpdate`; 0.1.79 ships `codex-rules`)
- fix(installer): `toml-helpers` `hasKey`/`getRootKey`/`setRootKey` scoped to the file head before the first `[table]` (`splitHead()`) — previously matched a same-named key inside any TOML table, so `setRootKey` could clobber a `[profiles.*]` entry instead of creating a root key; 6 new tests
- feat(agents): rebalance agent model tiers per owner decision — 23 `gpt-5.6-sol` / 13 `gpt-5.6-terra` (36 agents total), `model_reasoning_effort = "high"` on all
- refactor(ai-pilot): remove dead APEX task-tracking code superseded by `update_plan` (`task-helpers.ts`, `sync-task-tracking.ts`)
- chore(release): bump 16 touched plugins (ai-pilot 1.2.47, codex-rules 1.0.22, commit-pro 1.2.28, core-guards 1.1.50, design-expert 2.1.37, go-expert 1.0.10, laravel-expert 1.2.13, nextjs-expert 1.1.28, php-expert 1.0.10, prompt-engineer 1.1.16, rust-expert 1.0.10, shadcn-expert 1.0.22, swift-apple-expert 1.1.25, tailwindcss 1.1.15, tanstack-start-expert 1.0.10, typescript-expert 1.0.10) + suite to 1.0.37

## [1.0.36] - 2026-07-18

- feat(agents): re-port claude-plugins agents and skills to native Codex format — 36 agent `.toml` (Codex closed schema), 197 skill `SKILL.md` (frontmatter reduced to name+description), `AGENTS.md`/templates/`docs/reference/creating-skills-agents.md` rewritten to the real Codex shape, mechanism translation (`TeamCreate`/`Task`->`spawn_agent`, `Skill`->`$skill`, `CLAUDE.md`->`AGENTS.md`, `fuse-x:y`->bare names, `TaskCreate`/`TaskUpdate`/`TaskList`/`EnterPlanMode`->`update_plan`), 254 previously-emptied references restored, orphan `plugins/lessons/skills/lessons/` removed
- chore(release): bump 21 touched plugins (ai-pilot 1.2.46, astro-expert 1.0.14, cartographer 1.0.17, changelog-watcher 1.0.18, commit-pro 1.2.27, design-expert 2.1.36, go-expert 1.0.9, laravel-expert 1.2.12, nextjs-expert 1.1.27, php-expert 1.0.9, prompt-engineer 1.1.15, react-expert 1.0.25, rust-expert 1.0.9, security-expert 1.0.24, seo 1.0.14, shadcn-expert 1.0.21, solid 1.0.22, swift-apple-expert 1.1.24, tailwindcss 1.1.14, tanstack-start-expert 1.0.9, typescript-expert 1.0.9) + suite to 1.0.36

## [1.0.35] - 2026-07-12

- feat(agents): align `AGENTS.md`, its installation template, all 34 agent profiles, and 234 skills with the current Claude-plugin guidance while preserving Codex V2 identity, Sol/Terra model selection, high reasoning, and exact reference metadata
- fix(commit-pro): unify command, skill, GitHub Flow, and tag timing on merge commits with FULL/LOCAL/DEGRADED handling, explicit Codex authorization boundaries, and `mergedAt` proof before tag publication
- chore(release): bump 22 touched plugins + suite to 1.0.35

## [1.0.34] - 2026-07-11

- refactor(hooks): route all 86 command handlers across 22 plugin hook manifests exclusively through their canonical `@fusengine/harness` Codex routes; zero direct legacy, exception, or sound handlers remain. Harness 0.1.67 still has documented Codex compatibility gaps, so full functional parity is not claimed
- chore(release): bump 22 touched plugins + suite to 1.0.34

## [1.0.33] - 2026-07-11

- fix(core-guards 1.1.48): kill the permanent "Missing step: sniper" false positive under Codex — 30-min freshness window (AGENT_TTL_MS on changes.lastCheck) before the Stop gate counts modifications, and V2 spawn credit now reads tool_input.agent_type and matches the no-separator namespaced tool name (fusengine_agentsspawn_agent) like harness 0.1.67; 5 new tests
- feat(installer): multi_agent_v2 configured with tool_namespace="fusengine_agents" and hide_spawn_agent_metadata=false for exact custom-agent selection (Codex-authored; source-verified: the backend 400 is the separate model-dependent #26753 bug, unrelated to this flag) — docs refreshed (README, installation, workflow/agents, 03-agent-teams rule)
- chore(deps): bump @fusengine/harness to ^0.1.67 (Codex V2 custom agents credited as APEX agent evidence)
- chore(release): bump core-guards 1.1.48, ai-pilot 1.2.43, codex-rules 1.0.19 + suite to 1.0.33

## [1.0.32] - 2026-07-11

- feat(agents): migrate all 34 agent TOMLs across 21 plugins to gpt-5.6 models (opus tier -> gpt-5.6-sol, sonnet/haiku tiers and default -> gpt-5.6-terra; gpt-5.5 now legacy-remapped); reasoning effort forced to "high" for all agents (EFFORT_MAP flattening removed)
- feat(installer): model picker driven by the live model-catalog RPC with per-model reasoning efforts (config-model-options.ts); configured model kept when discovery fails
- fix(installer): max_concurrent_threads_per_session preserved when already configured; native V2 tools moved from the failing collaboration namespace to fusengine_agents with spawn metadata exposed for exact custom-agent selection; TOML table edits split into toml-table-helpers.ts with dedicated tests
- chore(release): bump 21 touched plugins + suite to 1.0.32

## [1.0.31] - 2026-07-10

- chore(deps): bump @fusengine/harness to ^0.1.66 — plain git push now auto-approved under Codex approval_policy=never (destructive forms still deny); .gitignore aligned on harness conventions (.harness/, /MEMORY/)
- chore(release): bump suite to 1.0.31

## [1.0.30] - 2026-07-10

- feat(installer): enable MultiAgentV2 by default, migrate incompatible legacy agent limits, and remove the obsolete thread prompt
- chore(release): bump suite to 1.0.30

## [1.0.29] - 2026-07-10

- fix(hooks): every plugin hooks.json command now uses a quoted `"${CODEX_HOME:-$HOME/.codex}"` (22 plugins) — hooks no longer break when CODEX_HOME is unset or the path contains spaces; hooks-rewrite/validate updated + new hooks-validation checks with tests
- feat(install): dynamic Codex model catalog fetched over RPC (scripts/lib/install/model-catalog.ts, replaces the hardcoded model list), config choices extracted to config-options.ts, config-prompt takes an injectable model loader — with tests
- chore(deps): @fusengine/harness ^0.1.65 (approval_policy=never handling, .codex config/rules write-protection, visible deny notices, Linux stdin fix)
- chore(release): bump 22 plugin versions + suite to 1.0.29

## [1.0.28] - 2026-07-09

- feat(core-guards): SessionStart hook resyncs agent TOMLs (and repairs command symlinks) from the latest cached plugin version at every startup/resume/clear — silent, fail-open, fingerprint fast-path, inter-process lock (core-guards 1.1.46)
- chore(deps): typescript ^7.0.2, @fusengine/harness ^0.1.62
- chore(release): bump core-guards + suite to 1.0.28

## [1.0.27] - 2026-07-08

- feat(agents): reference fuse-browser alongside Context7/Exa across agent tooling (21 plugins)
- chore(release): bump 21 plugin versions + suite to 1.0.27

## [1.0.26] - 2026-07-08

### Added
- feat(ai-pilot): port Codex plugin agents and skills (ai-pilot 1.2.39)
- feat(astro-expert): port Codex plugin agents and skills (astro-expert 1.0.10)
- feat(cartographer): port Codex plugin agents and skills (cartographer 1.0.11)
- feat(changelog-watcher): port Codex plugin agents and skills (changelog-watcher 1.0.13)
- feat(codex-rules): port Codex plugin agents and skills (codex-rules 1.0.16)
- feat(commit-pro): port Codex plugin agents and skills (commit-pro 1.2.23)
- feat(core-guards): port Codex plugin agents and skills (core-guards 1.1.45)
- feat(design-expert): port Codex plugin agents and skills (design-expert 2.1.30)
- feat(go-expert): port Codex plugin agents and skills (go-expert 1.0.3)
- feat(laravel-expert): port Codex plugin agents and skills (laravel-expert 1.2.6)
- feat(lessons): port Codex plugin agents and skills (lessons 1.0.3)
- feat(memory-neural): port Codex plugin agents and skills (memory-neural 1.0.6)
- feat(nextjs-expert): port Codex plugin agents and skills (nextjs-expert 1.1.21)
- feat(php-expert): port Codex plugin agents and skills (php-expert 1.0.3)
- feat(prompt-engineer): port Codex plugin agents and skills (prompt-engineer 1.1.11)
- feat(react-expert): port Codex plugin agents and skills (react-expert 1.0.19)
- feat(rust-expert): port Codex plugin agents and skills (rust-expert 1.0.3)
- feat(security-expert): port Codex plugin agents and skills (security-expert 1.0.18)
- feat(seo): port Codex plugin agents and skills (seo 1.0.8)
- feat(shadcn-expert): port Codex plugin agents and skills (shadcn-expert 1.0.15)
- feat(solid): port Codex plugin agents and skills (solid 1.0.16)
- feat(swift-apple-expert): port Codex plugin agents and skills (swift-apple-expert 1.1.18)
- feat(tailwindcss): port Codex plugin agents and skills (tailwindcss 1.1.8)
- feat(tanstack-start-expert): port Codex plugin agents and skills (tanstack-start-expert 1.0.3)
- feat(typescript-expert): port Codex plugin agents and skills (typescript-expert 1.0.3)

### Fixed
- fix(agents): source agent TOMLs use portable skill paths; installer materializes `~/.codex/agents` with paths resolved from the currently installed plugin cache

All notable changes to the Fusengine Codex plugin ecosystem will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.27] - 2026-07-07

### Fixed
- fix(installer): drop the stale `$CODEX_HOME/bun.lock` before `bun install` — bun honors the lock over the regenerated manifest range, so setups kept serving the previous `@fusengine/harness` after a new release (proven live: 0.1.60 kept after 0.1.61 shipped); every setup now resolves fresh against the registry

## [1.2.26] - 2026-07-07

### Fixed
- fix(core-guards/ai-pilot): Codex sends `tool_input.command` as an array — 8 hooks read it as a string and crashed (TypeError, "PreToolUse hook failed") or mis-tracked; new shared `normalize-command.ts` helper, string behavior unchanged (core-guards 1.1.44, ai-pilot 1.2.35)
- fix(codex-rules/core-guards): the rules corpus and AGENTS.md are no longer echoed into the terminal at SessionStart (Codex always displays hook context, openai/codex#21696); the installer now merges the rules into `~/.codex/AGENTS.md` (fenced idempotent section, `project_doc_max_bytes=65536`), which Codex loads natively and silently (codex-rules 1.0.13)

## [1.2.25] - 2026-07-07

### Maintenance
- chore(deps): bump @clack/prompts 1.7.0, smol-toml 1.7.0, fast-xml-parser 5.9.3, lighthouse 13.4.0 (lockfile regenerated, 104 hook bundles rebuilt against the new versions)

## [1.2.24] - 2026-07-07

### Added
- feat(core-guards): shared guards converge on @fusengine/harness ^0.1.60 — one `hook codex core` call for Bash, harness gate on apply_patch; ask fail-open closed (deny), env-prefix bypass closed (PR #1)
- installer: self-healing root `bun install`, harness env toggles (RALPH_MODE, FUSE_* TTLs) persisted in `~/.codex/.env`, MCP key prompts scoped to selected MCPs (PR #2, #4)

### Fixed
- hook runtime shipped via local @fusengine/codex-hooks package installed into `~/.codex/node_modules` (git-clone installs had no dist → every native hook failed module-not-found); content-hashed tarball lives in CODEX_HOME, zero tmpdir (PR #2, #3)
- passing hooks are silent (Codex rejects bare permissionDecision:allow), per-prompt AGENTS.md/rules re-injection removed (exactly-once per session), stack/TS gating on validators, seo/validate-seo bundled (was raw-source, crashed exit 1 on cheerio) (PR #3, #5)

### Changed
- zero-python purge: orphaned cartographer wrappers and dead runtimeSharedOk chain removed; promptApiKeys fossil deleted — MCP flow owns key prompts (PR #4)

## [1.2.23] - 2026-06-03

### Fixed

- fix(core-guards 1.1.40): APEX research validation no longer false-blocks in Codex. The subagent-research recorder measured `String(tool_response).length`; since Codex delivers MCP results as content-block objects, `String()` produced `"[object Object]"` (length 15 < 50 threshold) → every real research call recorded `quality:"insufficient"`, leaving the cacheHit path as the only way to pass the Stop validator. Now uses the canonical `extractText()` helper to normalize content blocks before measuring (verified: 108 chars → sufficient). Threshold and cacheHit fallback unchanged.

## [1.2.22] - 2026-06-03

### Fixed

- fix(core-guards 1.1.39): close a critical inline-write bypass in bash-write-guard. The SAFE_PREFIXES short-circuit (env/npx/bunx/bun run/npm run/cp/mv, or any `;`/`&&` chaining after a safe prefix) ran before the interpreter inline-write check, so `env node -e ...` and `cp a b; node -e ...` slipped through. The check now runs first. Coverage widened (Bun.write, Deno.write*, appendFile(), writeSync(), fs.cp/truncate, outputFile, perl `open '>'`, osascript); dead NODE_WRITES/RUBY_WRITES exports removed; ai-pilot detect-bash-write (1.2.33) probe synced to the same set.

## [1.2.21] - 2026-06-03

### Changed

- feat(design-expert 2.1.25): migrate browser-automation MCP from playwright to fuse-browser (@fusengine/browser-mcp). Registered in design-expert + ai-pilot (1.2.32) .mcp.json and the installer catalog; hooks.json matchers + gating scripts now key on `mcp__fuse-browser__browser_navigate` / `browser_screenshot`, scroll detection uses native `browser_scroll`. Tool mapping: `browser_take_screenshot`→`browser_screenshot`, `browser_evaluate` scroll hack→`browser_scroll`, `browser_resize`→`browser_screenshot` viewports. Skills/rules/docs + seo (1.0.4) SERP updated; `@playwright/test` E2E references preserved.

### Fixed

- fix(core-guards 1.1.38): block interpreter inline file-writes that bypassed the gated apply_patch/Write/Edit tools. Agents escaped via `node <<'EOF' … writeFileSync … EOF`, `bun -e`, `python3 <<PY`, etc.; the guard only matched narrow `node -e`/`python -c` forms. Added INLINE_INTERPRETER + INLINE_WRITES probes and a DENY branch in bash-write-guard, mirrored in ai-pilot detect-bash-write. Read-only inline and script-file execution unaffected.

## [1.2.20] - 2026-06-01

### Changed

- Repo-wide Python to TS/Bun hook migration COMPLETE: all 14 remaining plugins' hooks (ai-pilot, cartographer, changelog-watcher, codex-rules, design-expert, laravel-expert, memory-neural, nextjs-expert, react-expert, security-expert, shadcn-expert, solid, swift-apple-expert, tailwindcss) are native TS bundles - no more Bun->python wrappers. Shared expert-skill libs consolidated to one canonical set in core-guards/_shared; validate.ts test suite is 100% bun test.

### Removed

- All Python purged (205 files): every _legacy_py tree, all python-spawning wrappers, and plugins/_shared/scripts/*.py. plugins/ is now ZERO-PYTHON - every hook runs native bundled TS.

## [1.2.19] - 2026-06-01

### Fixed

- `require-apex-agents` (core-guards 1.1.36, ai-pilot 1.2.30) now has a rollout ground-truth fallback (`apexAgentsInTranscript` in `ai-pilot/lib/apex/rollout-agents.ts`). It was state-only and depended on PostToolUse track-* hooks that fire unreliably in Codex code_mode (openai/codex#19385), so it false-blocked edits after the model had already explored/researched — and the model then tried to write its APEX state by hand (denied by bash-write-guard), a friction loop. The gate now detects explore (Glob/Grep/explore-bash/list_dir/explore-codebase) and research (Context7/Exa/WebSearch/WebFetch/research-expert) from the current turn's rollout, mirroring the fallbacks `require-solid-read` and `enforce-apex-phases` already had. Verified: rollout with evidence → allow (no state write needed); empty rollout → deny.

## [1.2.18] - 2026-06-01

### Removed

- `core-guards` 1.1.35 — final purge: `tests/test-sessions-pattern.ts` rewritten from a Bun→python wrapper into a real `bun test` (8/8), the redundant python invocation dropped from `scripts/validate.ts`, and the entire `_legacy_py` tree removed. `plugins/core-guards/scripts` now contains **zero Python files** — the Python→TS/Bun migration is 100% complete.

## [1.2.17] - 2026-06-01

### Changed

- `core-guards` 1.1.34 — Lot E: the 11 remaining wired Bun→python wrapper hooks (session-start ×3, session-end, subagent-start/stop, user-prompt ×2, instructions-loaded, teammate-idle, post enforce-file-size) are now native TS bundles. hooks.json is fully native (only `sound/play.ts`, a native Bun mp3 player, is a non-bundle entry).

### Removed

- Lot D purge: removed all dead Python wrapper hooks, the snake_case `_shared` stubs, dead non-hook wrappers (validate-setup, save-apex-state), and the dead `_legacy_py` hook tree (86 files, ~4.8k lines). Kept `_legacy_py/{tests,_shared}` (still used by `scripts/validate.ts`). The Python→TS/Bun hook migration is complete — every core-guards hook runs as a bundled native TS hook.

## [1.2.16] - 2026-06-01

### Changed

- `core-guards` 1.1.33 — Lot C of the Python→TS/Bun migration: the 6 direct-`python3` hooks (mcp-cache-lookup, limit-mcp-verbosity, webfetch-cache-lookup, webfetch-cache-store, cleanup-old-caches, validate-apex-workflow) are now native TS bundles. `hooks.json` has ZERO python3 references — every Lot A/B/C hook runs native. Webfetch cache key verified byte-identical across implementations (cross-impl store↔lookup round-trip HIT), so cache survives. Remaining: Lot D — purge `_legacy_py` + the few non-A/B/C wrappers (e.g. post-tool-use/enforce-file-size).

## [1.2.15] - 2026-06-01

### Changed

- `core-guards` 1.1.32 — Python→TS/Bun hook migration completed for Lot A (8 security/blocking guards: security, git, install, bash-write, enforce-interfaces, enforce-file-size, enforce-gemini-mcp, pre-commit) and Lot B (9 tracking post-hooks: track-agent-calls/solid-reads/subagent-research/session-changes, auto-document-reads, cache-mcp-result, log-tool-failure, post-edit-typescript, validate-task-solid). All run as bundled native TS via `hooks.json`; strict parity verified vs the Python (Lot A 104 cases incl. adversarial, Lot B decisions + session-state). `state-manager.ts` now honors `CODEX_HOME`. Python wrappers retained pending the purge phase. Remaining: Lot C (6 direct-python cache/cleanup hooks) + Lot D (purge `_legacy_py`).

## [1.2.14] - 2026-06-01

### Changed

- `require-solid-read` migrated from a Bun→python wrapper to native TS (`core-guards` 1.1.31): reuses the canonical ai-pilot ref-router and a new `solidRefRead`/`readPathsInTranscript` added to the shared `rollout-evidence` (`ai-pilot` 1.2.29). Keeps the unconditional SOLID-read policy and writes `state.target`; deny output preserved (routed ref list now from the single TS router — DRY, guardrail unchanged). Bundle runs via `hooks.json`.

## [1.2.13] - 2026-06-01

### Changed

- Install: `scripts/build-hooks.ts` now exports `buildPlugin` (CLI guarded by `import.meta.main`) and `installPluginCache` runs it per plugin before copying into the Codex cache, so `@hook-entry` bundles are regenerated at install. Bundled `dist/` is gitignored and untracked (no committed build artifacts). No plugin behaviour change.

## [1.2.12] - 2026-06-01

### Added

- Hook bundler `scripts/build-hooks.ts`: bundles any `@hook-entry`-marked hook source into a self-contained file (`Bun.build` target bun, `splitting:false`) so shared-lib imports are inlined for the isolated install layout. Foundation for the Python→TS/Bun hook migration.

### Changed

- `core-guards` 1.1.30: `require-apex-agents` ported from a Bun→python wrapper to native TS (`require-apex-agents.native.ts` + `_shared/apex-agents.ts`, reusing the TS `state-manager`); `hooks.json` runs the bundle. Parity verified byte-for-byte vs the Python across 5 cases including the 180-char `systemMessage` truncation. Guardrail behaviour unchanged.

## [1.2.11] - 2026-06-01

### Fixed

- APEX/SOLID gate (`core-guards` 1.1.29, `ai-pilot` 1.2.28): the gate proved compliance by scanning a fixed 512 KB rollout tail within a 120/180 s TTL — a noisy command (e.g. `rg` over rollouts) evicted the read/agent evidence out of the window, and the TTL expired during the very reads the gate demanded, producing an unwinnable re-deny loop. Evidence is now scoped to the current task turn: `tail_lines`/`readTail` slice from the last `user_message` (fallback `task_started` for subagent child rollouts) and match both compact (Codex/Rust) and spaced (Python) JSON. The wall-clock cutoff is dropped (turn boundary supersedes it), state-path TTLs raised to 1800 s, and two `break`→`continue` fixed in the stale-agent scan. Removed the dead `_within_ttl` helper and its `datetime` import.

## [1.2.10] - 2026-05-30

### Added

- Installer (`scripts/lib/install/config-prompt.ts`): new `agents.max_threads` prompt (6/8/12/16) to raise the concurrent sub-agent cap and avoid `agent thread limit reached`. New `toml-helpers.ts` module extracts `hasKey`/`setRootKey` (previously duplicated with `features.ts`) and adds table-scoped `setAgentsThreads`.

### Changed

- Installer `approval_policy` choices: dropped the deprecated `on-failure` value, added hints (`on-request` recommended — the model decides when to ask). README config table updated.

## [1.2.9] - 2026-05-29

### Added

- SEO plugin 2026 overhaul (seo 1.0.3): new seo-entity skill (entity/semantic SEO, Knowledge Graph, salience, schema about/sameAs/knowsAbout); local vs global intent (5 layers) with intent/CTA mapping; buyer-state long-tail (L1-L4) and citation eligibility; per-H2 answer capsules; conversion levers; quantified GEO impacts; AI-crawler allowlist in robots-default.

### Fixed

- SEO plugin (seo 1.0.3): wired the validate-seo PostToolUse hook (previously dead), corrected the Serper MCP tool name, repointed dead skill paths to real sibling skills, de-hardcoded localities to placeholders; sub-agents now consult their skill and seo-expert gained a script toolbox plus request routing.
- codex-rules (codex-rules 1.0.8): inject-rules now emits a dynamic hookEventName (SessionStart vs UserPromptSubmit) so per-prompt rule re-injection is no longer rejected, plus a non-dict stdin guard.
- Invalid model gpt-5.3-codex-spark replaced with gpt-5.4-mini (solid 1.0.11, ai-pilot 1.2.27); verified against the codex 0.135 binary model list.

### Changed

- AGENTS.md: dropped the redundant discovery meta line (Codex already embeds the AGENTS.md spec in its base instructions).

## [1.2.8] - 2026-05-28

### Fixed

- Codex check-skill gates (laravel/react/nextjs/swift/tailwind/shadcn/design) could block edits forever in code_mode: deny hints pointed at non-versioned skill folders absent from the cache, and skill-consultation evidence was read from state that per-tool hooks never write in code_mode (openai/codex#19385).
- `skill_paths.skill_md` resolves the cache version segment (semantic) so hints point at the real SKILL.md; `check_skill_common` falls back to the session rollout tree (main + child subagent rollouts) for base and specific skill consultation; `rollout_evidence` gains `skill_read`.
- `bash-write-guard` closes shell write evasions of the gated edit tools: the built-in patch shim, `git apply`, and in-place stream editors with combined flags (e.g. `perl -0pi`).
- Proven via real `codex exec`: laravel controller created, no infinite loop (15 → 5 transient blocks).

## [1.2.7] - 2026-05-28

### Fixed

- Codex code_mode "tourne en rond": per-tool Pre/PostToolUse hooks do not fire in code_mode (openai/codex#19385), so the APEX gates never saw the Context7/Exa consultation or SOLID reads done by subagents and blocked edits forever. Gates now fall back to the session rollout tree (main + child subagent rollouts, linked via session_id).
- `enforce-apex-phases` doc gate, `mcp_research` (all per-framework check-skill gates) and `require-solid-read` read evidence from the rollout when state is empty (ai-pilot 1.2.26, core-guards 1.1.28, suite 1.0.2).
- `bash-write-guard`: allow reads of APEX state/cache, block only mutations (fixes the "session state tampering" false-positive on `sed -n`/`cat` reads).
- Proven end-to-end via real `codex exec` runs (file created, no infinite loop).

## [1.2.6] - 2026-05-28

### Fixed

- Codex 0.134 hook read false-positives: `detect-bash-write`/`bash-write-guard` now deny only real writes to code files and allow reads (incl. the `context/mcp` doc cache)
- doc-gate consultation loop: `track-doc-consultation` matcher broadened to Codex tool ids (`web_search_exa`), resolving the infinite re-block on code writes
- MCP cache scripts use substring tool matching; `cache-doc-from-transcript` parses the Codex rollout format so the research doc cache survives `code_mode`
- `track-agent-calls` reads `spawn_agent` `message`/`task` fields
- `memory-neural` ships an empty `.mcp.json` (lab) with the backend config preserved as `.mcp.json.example`
- installer persists `bypass_hook_trust` so re-synced hooks run without an interactive re-trust prompt
- APEX agents/SOLID read TTL raised to 180s; `.ruff_cache` gitignored; README model list aligned (gpt-5.5/5.4)

Bumped: ai-pilot 1.2.25, core-guards 1.1.27, memory-neural 1.0.1 (suite 1.0.1).

## [1.2.5] - 2026-05-17

### Fixed
- `plugins/core-guards/hooks/hooks.json` : 2 références cassées vers fichiers renommés lors de la migration Claude → Codex.
  - `scripts/session-start/inject-codex-md.ts` → `scripts/session-start/inject-agents-md.ts`
  - `scripts/user-prompt/read-codex-md.ts` → `scripts/user-prompt/read-agents-md.ts`
- Conséquence : les hooks `SessionStart` et `UserPromptSubmit` exitaient code 1 (`Module not found "scripts/session-start/inject-codex-md.ts"`) à chaque démarrage de session Codex. Diagnostic reproduit en lançant manuellement `bun scripts/session-start/inject-codex-md.ts` depuis le cache plugin.

## [1.2.5] - 2026-05-17

### Fixed
- **Hook matchers + scripts adaptés pour Codex apply_patch internal tool** :
  - 15 plugin `hooks.json` : `${CODEX_PLUGIN_ROOT}` (n'existe pas dans Codex) → `${PLUGIN_ROOT}` (natif binaire 0.130) via `scripts/fix-plugin-root.ts`.
  - 12 plugin `hooks.json` : matcher `"apply_patch"` → `"Write|Edit|apply_patch"` (anticipation PR #18391 + alias fusengine/codex-agent) via `scripts/fix-apply-patch-matcher.ts`.
  - 5 scripts core-guards adaptés au format V4A apply_patch : `enforce-file-size.py`, `enforce-interfaces.py`, `enforce-gemini-mcp.py`, `require-apex-agents.py`, `require-solid-read.py` parsent désormais `tool_input.command` (raw patch body avec `*** Add/Update/Delete File:` markers) en plus du format Claude `tool_input.file_path`.
- **Renames cassés post-migration Claude → Codex** dans `core-guards/hooks/hooks.json` :
  - `scripts/session-start/inject-codex-md.ts` → `scripts/session-start/inject-agents-md.ts`
  - `scripts/user-prompt/read-codex-md.ts` → `scripts/user-prompt/read-agents-md.ts`
  - Corrige les "SessionStart hook (failed) exit code 1" + "UserPromptSubmit hook (failed) exit code 1" loggés à chaque session start.
- `codex-rules/scripts/inject-rules.ts` : wrapper Bun→Python forward maintenant `process.argv.slice(2)` (avant : args droppés → "Missing plugin root argument"). Fallback `PLUGIN_ROOT` env si argv vide.

### Notes
- **Codex 0.130 ne fire toujours PAS PreToolUse/PostToolUse sur apply_patch** (issue #16732, PR #18391 merged à main mais absente de cette release). Les 5 scripts enforce/require sont prêts à intercepter dès qu'une release contient le fix. Vérifiable via `~/.codex/fusengine/logs/enforce-file-size.log` (créé au premier fire réel).
- Référence : `fusengine/codex-agent` utilise matcher `Write|Edit` standalone → **aussi affecté par #16732 en 0.130** (vérifié empirique : leur `check-solid-from-transcript.py` filtre `name in ("Write","Edit")`, skip aussi le nom Codex `apply_patch`).

## [1.2.4] - 2026-05-17

### Fixed
- `~/.codex/.env` est désormais l'**unique source de vérité** pour les clés API MCP. Drop du fallback `process.env` à 3 endroits :
  - `mcp-select.ts:hasKey()` : ne checke plus que `env[apiKeyEnv]` → un MCP avec clé absente de `.env` montre `⚠ no key` même si exporté dans le shell.
  - `mcp-key-prompt.ts:missing filter` : prompt déclenché si clé absente de `.env`, même si shell l'a → toutes les clés finissent saisies et sauvegardées dans `.codex/.env` (chmod 600).
  - `mcp-configurator.ts:resolveStr()` : `${VAR}` résolus uniquement depuis `.env` → garantit que les valeurs écrites dans `config.toml` viennent de la source persistée, pas d'un shell volatile.
- Conséquence : les clés exportées dans `~/.codex/.env` (ou `~/.config/fish/config.fish`, etc.) ne **leakent plus** dans la config Codex via process.env. Migration : à la première install après v1.2.4, l'installeur prompt pour toutes les clés et les sauve dans `~/.codex/.env`.

## [1.2.3] - 2026-05-17

### Fixed
- **12 plugin `.mcp.json` alignés byte-identique sur `claude-plugins/scripts/mcp/mcp.json`** (single source of truth, vérifié via `jq` lignes 86-136). Plugins concernés : ai-pilot, design-expert, nextjs-expert, react-expert, tailwindcss, laravel-expert, prompt-engineer, security-expert, shadcn-expert, solid, swift-apple-expert, changelog-watcher.
- **context7** : `${CONTEXT7_API_KEY}` passé en flag CLI `--api-key` dans `args` (forme prioritaire d'après doc context7.com), drop `env` block.
- **exa** : `${EXA_API_KEY}` inline dans l'URL `&exaApiKey=…`, drop `env_http_headers` (match claude-plugins HTTP form).
- **magic** : env var interne `API_KEY` → `MAGIC_API_KEY` (= claude reference + nom attendu par `@21st-dev/magic`).
- **gemini-design** (5 plugins, déjà v1.2.2 catalog) : env interne `GEMINI_API_KEY` → `API_KEY`, shell ref `${GEMINI_API_KEY}` → `${GEMINI_DESIGN_API_KEY}` (= claude reference + ce que `gemini-design-mcp` lit).

### Notes
- `promptMissingKeys` (v1.2.1) demande désormais `GEMINI_DESIGN_API_KEY` au lieu de `GEMINI_API_KEY`. Si tu avais déjà exporté `GEMINI_API_KEY` dans ton shell, renomme-la (ou laisse l'installeur t'en redemander une dans `~/.codex/.env`).

## [1.2.2] - 2026-05-17

### Fixed
- `scripts/lib/install/mcp-catalog.ts` : alignement byte-identique avec `claude-plugins/scripts/mcp/mcp.json` (référence).
  - Drop `graphiti` + `qdrant` du catalogue installable (absents de claude-plugins ; ils crashaient au démarrage de Codex avec `empty host` car les `${URL_*}` n'étaient jamais résolus depuis `memory-neural/.mcp.json`).
  - `gemini-design` : `apiKeyEnv` `GEMINI_API_KEY` → `GEMINI_DESIGN_API_KEY`, `apiKeyUrl` → `https://gemini-design-mcp.com`.
  - Catalogue final : **22 MCPs** (= claude-plugins 1:1), au lieu de 24.

## [1.2.1] - 2026-05-17

### Fixed
- `scripts/lib/install/mcp-key-prompt.ts` : **ajouté pour de vrai** (le v1.2.0 prétendait l'avoir mais le fichier n'avait jamais été écrit). Port direct de `claude-plugins/scripts/src/services/mcp-key-prompt.ts` — prompt uniquement les clés des MCPs sélectionnés, après la multiselect.
- `scripts/lib/install/runner-finalize.ts` : enchaîne maintenant `selectMcpServers` → `promptMissingKeys(selected)` → `configureMcpServers`. Avant : configure direct sans demander les clés manquantes du subset choisi.
- `scripts/lib/install/runner.ts` : drop l'appel `promptApiKeys` upfront (et son import). Avant : l'installeur demandait TOUTES les clés API du catalogue avant même que l'utilisateur ait choisi quels MCPs activer — exactement l'inverse du flow claude-plugins.

## [1.2.0] - 2026-05-17

### Added — parity with claude-plugins installer

- `scripts/lib/install/backup.ts` + `fs-helpers.ts` : snapshot `~/.codex/config.toml` + `~/.codex/.env` + `~/.codex/AGENTS.md` avant modification, restoration on failure.
- `scripts/lib/install/setup-plugins.ts` : orchestration centralisée des étapes plugin par plugin (manifest validation, agents.toml install, hooks wiring, MCP merge), pilotée par `runner.ts`.
- `scripts/lib/install/mcp-catalog.ts` : +12 serveurs MCP au catalogue installable (`astro-docs`, `filesystem`, `playwright`, `postgres`, `github`, `supabase`, `slack`, `sentry`, `stripe`, `notion`, `brave-search`, `replicate`) — total 24 MCPs.
- `scripts/lib/install/env-shell.ts` (+ helpers fish/zsh/bash/pwsh) : installateurs shell auto-loader extraits du runner, idempotents avec markers.
- `scripts/lib/install/perf-env.ts` : prompt interactif `@clack/prompts` pour les toggles env Codex **binary-verified** (`RUST_LOG=error`, `CODEX_TUI_ROUNDED=1`, `GIT_OPTIONAL_LOCKS=0`) persistés dans `~/.codex/.env`. Marqueur `_FUSENGINE_PERF_ASKED` pour skip re-prompt. **Pas d'équivalent Codex** pour `CLAUDE_CODE_FORK_SUBAGENT` / `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` / `DISABLE_AUTOUPDATER` — vérifié via `strings $(which codex)` 0.130.0.
- `scripts/lib/install/plugin-scanner.ts` : scan `plugins/*/hooks/hooks.json` + `.mcp.json` + manifest, retourne `PluginInfo[]` (counts events / handlers / mcp servers / skills / agents). Rapport diagnostic affiché en fin de `runner.ts` après `reportMcp`.
- `plugins/core-guards/statusline/dist/` : build statusline préservée pour quand/si le runtime Codex ajoutera le support des statuslines custom (suivi : issue #17827, parent open, aucun PR — statusline custom NON supporté par Codex 0.130).

### Changed

- `scripts/lib/install/runner.ts` : ajout étape `promptPerfEnv` (entre shell-install et MCP) et rapport `scanPlugins` en fin de pipeline après `reportMcp`.
- `plugins/core-guards/statusline/_shared/` : analyse de doublons effectuée — seul `apex_constants.ts` est un vrai doublon de `apex-constants.ts` (renommage snake/kebab). Les 4 autres fichiers snake_case (`cache_compactor.ts`, `cache_io.ts`, `mcp_response.ts`, `state_manager.ts`) sont uniques, pas de doublon. Aucune suppression effectuée (action bloquée).
- `plugins/commit-pro/` : restauration des assets perdus à la migration claude→codex initiale — `commands/` (10 fichiers), `CHANGELOG.md`, `LICENSE`, `README.md`. Pas de hooks restaurés à ce stade.
- README v1.2.0 : section « Manques connus » → tout coché, liste des 12 MCPs ajoutés (24 total), exemple output `plugin-scanner`.

### Notes

- Codex CLI n'a **aucun** équivalent des perf vars Claude Code (`CLAUDE_CODE_FORK_SUBAGENT`, `CLAUDE_CODE_ATTRIBUTION_HEADER`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `DISABLE_AUTOUPDATER`) — confirmé via `strings $(which codex)` 0.130.0. Pas de toggle telemetry ni autoupdate côté CLI (telemetry server-side / account settings). `perf-env.ts` se limite donc aux 3 vars Codex réellement reconnues par le binaire : `RUST_LOG`, `CODEX_TUI_ROUNDED`, `GIT_OPTIONAL_LOCKS`.

## [1.1.2] - 2026-05-17

### Fixed
- `swift-apple-expert/skills/tvos/SKILL.md` : force rewrite pour invalider un inode stale chez Codex CLI (warning "No such file or directory" sur fichier existant et valide après `Bun.write` qui fait unlink+create).

## [1.1.1] - 2026-05-17

### Fixed
- `runner.ts` : skip `codex plugin marketplace add` quand le marketplace est déjà registered dans `~/.codex/config.toml` (conflit `source_type git` vs `local` quand setup.sh est lancé depuis le path tmp auto-cloné par Codex après install via TUI).

## [1.1.0] - 2026-05-17

### Added
- `scripts/lib/install/config-prompt.ts` : prompt interactif `@clack/prompts` pour `model`, `model_reasoning_effort`, `personality`, `approval_policy`, `sandbox_mode`. Auto-set `suppress_unstable_features_warning = true` à la racine de `config.toml`.
- `scripts/fix-warnings.ts` : quote le frontmatter `description`/`when-to-use`/`keywords` dans 186 SKILL.md et purge 5 manifests pointant sur des fichiers/dossiers manquants. Applique au repo + cache `~/.codex/plugins/cache/`.

### Changed
- `marketplace.json` : aligne les 18 plugin names sur folder name (drop préfixe `fuse-`) conformément à la doc Codex (*"Outer folder name and plugin.json name are always the same"*). Drop `$schema`.
- `scripts/fix-conformance.ts:fixMarketplace()` : dérive `name` depuis `source.path` au lieu de garder `p.name` (alignement idempotent).
- `scripts/lib/install/features.ts` : auto-injecte `suppress_unstable_features_warning = true` via nouvel helper `ensureRootKey()`.
- `scripts/lib/install/runner.ts` : wire `promptCodexConfig` entre `maybeInstallPlugins` et `promptApiKeys`.
- README : bump v1.1.0, table d'inventaire à 19 plugins, section « Config Codex » documentée.

### Removed
- Plugin `memory-neural` (encore en dev) — retiré de `marketplace.json`, `CATEGORY_OF`, et `~/.codex/config.toml`.

## [1.0.0] - 2026-05-15

### Added
- Initial migration from `claude-plugins/` → `codex-plugins/` (19 plugins).
- `.codex-plugin/plugin.json` manifests for all 19 plugins (folder name = manifest `name`).
- `agents/<name>.toml` Codex subagent definitions (TOML, model + sandbox_mode + developer_instructions).
- `skills/<name>/SKILL.md` skills with strict frontmatter (`name`, `description` only — per Codex spec).
- `hooks/hooks.json` per plugin with 6 Codex official events (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PermissionRequest`, `Stop`).
- `.mcp.json` per plugin (14 plugins) — Codex format (direct map, no `type` field, `http_headers` for HTTP servers).
- `.agents/plugins/marketplace.json` Codex marketplace registry with object-form `source: {source:"local", path}`, `policy.installation`, `policy.authentication`, `category`, `interface`.
- `AGENTS.md` global rules (Codex equivalent of `AGENTS.md`, auto-loaded at session start).
- `setup.sh` + `scripts/install-codex.ts` (Bun + `@clack/prompts`) interactive installer.
- Installer steps: marketplace registration, `[features] hooks=true, plugin_hooks=true`, AGENTS.md copy, auto-enable 19 plugins, MCP report.
- 134 Bun → Python wrappers in `plugins/*/scripts/` for hook scripts that couldn't be fully transpiled.
- Original Python source preserved under `plugins/*/scripts/_legacy_py/`.
- `core-guards/statusline/` + `core-guards/song/` directories preserved for future Codex statusline support (issue #20244).

### Changed
- Variable `${PLUGIN_ROOT}` → `${PLUGIN_ROOT}` (Codex native, with `PLUGIN_ROOT` alias preserved by Codex runtime).
- Hook event mapping: `SubagentStart` → `SessionStart`, `SubagentStop`/`SessionEnd`/`TaskCompleted` → `Stop`, `PostToolUseFailure` → `PostToolUse`, `InstructionsLoaded` → `SessionStart`.
- Path conventions: `~/.codex/` → `~/.codex/`, `AGENTS.md` → `AGENTS.md`, `.claude-plugin/` → `.codex-plugin/`.
- Agent models migrated to documented Codex model names (`gpt-5.3-codex-spark`, `gpt-5.4`, `gpt-5.4-mini`).
- 137 Python scripts converted to Bun TypeScript stubs (regex-based transpilation), then 134 replaced with Bun→Python wrappers when syntax was incompatible.
- MCP servers `headers` → `http_headers`, no `type: "stdio"` field (inferred by Codex from `command`/`url`).

### Removed
- All "Claude" string references in active plugin files (except `ClaudeBot` user-agent in `seo/templates/robots/robots-saas.txt` which is a legitimate web crawler identifier).
- Invented manifest interface fields (`cli`, `ide`) replaced with documented `{displayName, shortDescription, developerName}`.
- Invalid `SessionStart` matchers (`"sniper"`, `"explore-codebase"`) replaced with empty matcher (Codex matches source = `startup`/`resume`/`clear` only).

### Validated against binary `codex-aarch64-apple-darwin` 0.130.0
- `VALID_AUTH_POLICIES = {"ON_INSTALL", "ON_USE"}` — our value `"ON_INSTALL"` is default.
- `VALID_INSTALL_POLICIES = {"NOT_AVAILABLE", "AVAILABLE", "INSTALLED_BY_DEFAULT"}` — our value `"AVAILABLE"` is default.
- Hook event enum const includes `PreCompact` / `PostCompact`, but plugins now register only stable events: `SessionStart`, `PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `PermissionRequest`, `Stop`.
- SessionStart matcher values: `startup, resume, clear` — our hooks use these.
- Env vars `PLUGIN_ROOT, PLUGIN_DATA, PLUGIN_ROOT, CLAUDE_PLUGIN_DATA` confirmed.
- Manifest paths `.codex-plugin/plugin.json` AND `.claude-plugin/plugin.json` both accepted (legacy compat).

### Tested in production (user's `~/.codex/`)
- `codex exec --skip-git-repo-check "say only OK"` → exit 0, session id, model `gpt-5.3-codex`, no warning, no schema reject.
- Marketplace `fusengine-codex` registered in `~/.codex/config.toml`.
- 19 plugins `[plugins."NAME@fusengine-codex"] enabled = true`.
- SOLID `enforce-file-size` hook emits valid `{"hookSpecificOutput": {"permissionDecision": "deny", ...}}` on 150-line file.
- APEX `require-apex-agents` hook emits valid deny output when explore-codebase/research-expert not invoked.
