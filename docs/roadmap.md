# Roadmap

Read with `docs/decisions.md` at the start of every mandate. Done = shipped or applied; In progress = open mandate; Next = grounded open items, each with its source.

## Done

- v1.0.81 — `design-expert` on Sol 6.2 `max`, a named exception (owner « Oui, en max », `docs/decisions.md` 2026-11-19): new tier `DESIGN` `gpt-6.2-sol`/`max` (1 agent), `JUDGE` now 6; `max` stays retired for the other 39 agents. Code of record `TIER_PROFILES` + `AGENT_TIERS` in `scripts/lib/agent-toml.ts`; policy `docs/workflow/agents.md` § Model Policy.
- v1.0.80 — released (PR #66, tag `v1.0.80`): launchd job removed; the audited harness auto-update runs best-effort at the end of `bun run sync:agents` and the installer `./setup.sh` (skip with `FUSE_HARNESS_AUTO_UPDATE=0`; registry lookup bounded by `FUSE_HARNESS_REGISTRY_TIMEOUT_SEC`, default 15 s; setup keeps a `~/.codex` runtime newer than the repo pin instead of downgrading it).
- v1.0.79 — released (PR #65, tag `v1.0.79`): harness auto-update with exact pin (owner « oui met le but estq ue ca ce mette a jours tous seul », « lance la tache », `docs/decisions.md` 2026-11-18). `update-harness` always writes an exact pin `X.Y.Z` and rewrites a `^X` spec. `bun run harness:auto-update` audits, validates and tests `<latest>` in a temporary `git worktree` of HEAD, and only then swaps the harness atomically into `~/.codex`; 3 backups kept, rollback on failure, 24 h stale-lock limit, log `~/Library/Logs/fusengine-harness-auto-update.log`. The scheduled background trigger shipped in this release was removed afterwards (see v1.0.80).
- v1.0.78 — Sol 6.2 fleet + harness 0.1.126 commit cycle, merged as PR #64, tag `v1.0.78` (items below).
- 2026-11-18 — Sol 6.2 fleet reorganisation (owner « okay sol 6.2 est sorti on vas reorganisé tous propremet repense », `docs/decisions.md`). 40 agent TOMLs regenerated from `scripts/lib/agent-toml.ts`: `DEFAULT` `gpt-6.2-sol`/medium (25), `JUDGE` `gpt-6.2-sol`/high (7), `NON_CORE` `gpt-6.1-terra`/medium (7), `SECURITY` `gpt-6.1-terra`/high (1, `security-expert`). Effort `max` retired fleet-wide, `ultra` never used. Policy: `docs/workflow/agents.md` § Model Policy.
- 2026-11-18 — Fleet synced to `~/.codex/agents` through `bun run sync:agents` (backups in `docs/validation/sol62-sync-backup-2026-11-18/`); coordinator moved to `gpt-6.2-sol`/medium in `~/.codex/config.toml` (applied by the owner).
- 2026-11-18 — Real-condition run passed: R1 fleet load 4/4 model+effort match; R2c `design-expert` (sol/high) redid the support-workbench mockup (`docs/real-conditions-sol62-fleet-2026-11-18.md`).
- 2026-11-18 — `@fusengine/harness` 0.1.125 → 0.1.126, exact pin in `package.json`, `HARNESS_VERSION` = `0.1.126`; same version installed in `~/.codex/node_modules` (backup `docs/validation/harness-0.1.126-backup-2026-11-18/`).
- v1.0.77 — harness pinned 0.1.124 then bumped to 0.1.125 (PR #63).
- v1.0.76 — 10 shell templates marked executable; 2026-11-15 audit report added (PR #62).
- v1.0.75 — Harness PRD mode (Part B): the lead runs `prd init` itself, task PRD before any executor, lead runs `prd status` / `validate` / `compact`; harness 0.1.123 (PR #61).
- v1.0.74 — Per-project `docs/roadmap.md` and project skill `.agents/skills/project-<name>/` in lead-orchestration (Part A), harness 0.1.121 (PR #60).
- v1.0.73 — `brainstorming` launched at Analyze for new features and analyse/improve requests (PR #59).
- v1.0.72 — Port of claude-plugins 1.40.1-1.40.2: commit cycle, suggestions, product lens, ideas mode (PR #58).
- 2026-11-15 — Relayed-go owner decision recorded (PR #57).
- 2026-11-13 — Swift port from the coreyfloyd/agents fork into `solid-swift` (`state-machines.md`, `LoadState`).
- 2026-11-11 — MIT license, copyright holder "Fusengine Sàrl" (root and `plugins/commit-pro/LICENSE`).

## In progress

- 1.0.81 commit cycle (owner « OUI CYCLE COMPLET AVEC FUSION DES BRANCHE ET CLEAN DES BRANCHE ET RESIDU », `docs/decisions.md` 2026-11-19): release of `chore/design-expert-sol-max`, `bun run sync:agents` into `~/.codex` (backup first), then merged-branch and residue cleanup to the Trash.

## Next

- Harness design-pipeline gate should accept an explicit output folder: in R2/R2b it demanded `design-system.md` at the cwd root of a read-only project and stopped `design-expert` (`docs/real-conditions-sol62-fleet-2026-11-18.md`, Deviations 1 and Not verified).
- Redone support-workbench mockup lost content vs the "before": 5 of 7 sidebar nav items (Tickets, Messages, Clients, Équipe et rôles, Canaux), the message preview in each list row, and the System option of the Clair/Sombre/Système theme control (now a single dark-mode toggle) (`docs/validation/sol62-real-run/before-inbox-light.png` vs `after-inbox-light.png`).
- Harness auto-update: audit the staged runtime before the swap — the transitive deps of the promoted binary are not audited today.
- Harness auto-update: clean orphan `harness-audit-*` temp dirs.
- Commit agent post-commit step: support the Codex layout (`.codex-plugin/plugin.json` + `.agents/plugins/marketplace.json`) instead of `.claude-plugin/` only.
- Skill paths: `sync:agents` rewrites `~/.codex` agent skill paths cache→repo; align with the install mode.
