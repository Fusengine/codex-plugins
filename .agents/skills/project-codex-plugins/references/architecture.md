# Architecture

## Top-level layout

| Path | Role |
|---|---|
| `plugins/` | Source of truth: 27 Codex plugins, one per directory, each with `.codex-plugin/plugin.json` and any of `agents/*.toml`, `skills/`, `hooks/` |
| `plugins/codex-rules/` | Shared rules `rules/00-08-*.md` + `templates/AGENTS.md.template` (byte-identical to root `AGENTS.md`, locked by `agents-md-template-identity.test.ts`) |
| `.agents/plugins/marketplace.json` | Marketplace manifest: suite version + per-plugin versions (the release mirror) |
| `.agents/skills/` | Project skills auto-discovered by Codex (this skill) |
| `scripts/` | Entry points: `migrate.ts`, `sync-agents.ts`, `validate.ts`, `final-conformance.ts`, `update-harness.ts`, `install-codex.ts`, historical `fix-*.ts` |
| `scripts/lib/` | Generators, validators, `harness-hook-policy.ts`, `harness-hook-routes.json`, colocated `*.test.ts` |
| `scripts/lib/install/` | Installer internals: config prompt, model catalog, TOML upsert, AGENTS.md merge, hooks trust, exec policy, harness update |
| `scripts/tests/` | Harness env/runtime tests (`*.test.mts`) |
| `portage/` | Gitignored Claude-side snapshot — read only, never edit |
| `docs/` | `workflow/agents.md` (canonical model policy), `reference/`, `validation/`, `reports/`, real-condition reports, `decisions.md`, `roadmap.md`, `task-list.md`, `GAP-HARNESS.md` |
| `MEMORY/LESSON.md` | Gitignored lessons log |
| `setup.sh` / `setup.ps1` | End-user install entry, run from the Codex marketplace checkout |

## Agent TOML pipeline

1. Claude-style source agent → `buildAgentToml` in `scripts/lib/agent-toml.ts`.
2. Model and effort come only from the name-keyed `AGENT_TIERS` map (tiers `DEFAULT`, `JUDGE`, `NON_CORE`, `SECURITY` in `TIER_PROFILES`, combined into `AGENT_MODEL_PROFILES`); the source `model:` frontmatter is ignored; unknown names fall back to `DEFAULT`.
3. Output: `plugins/<plugin>/agents/<name>.toml` (40 files).
4. Install / `sync:agents`: the materializer writes `~/.codex/agents/*.toml` with a "Managed by fusengine-codex" header and absolute skill paths into this repo, plus `~/.codex/prompts` symlinks.

## Hooks

Every hook command routes through `@fusengine/harness`. A hook entry is valid only when it exists in three places: the plugin `hooks/hooks.json`, the `EVENTS` allowlist in `scripts/lib/hooks-validation.ts`, and the canonical route in `scripts/lib/harness-hook-routes.json`. `HARNESS_VERSION` in `scripts/lib/harness-hook-policy.ts` must equal the installed harness version.

## Contract tests that lock behaviour

- `agent-toml.test.ts`, `agent-tier-matrix.test.ts` — the 40-agent model/effort matrix, counts, titles and JSDoc.
- `security-agent-pilot.test.ts` + `docs/validation/security-agent-pilot/baseline.toml` — pilot-locked `security-expert`.
- `agents-md-routing.test.ts`, `agents-md-template-identity.test.ts` — AGENTS.md wording and template identity.
- `harness-hook-validation.test.ts` — the real `plugins/` tree against the route registry.
