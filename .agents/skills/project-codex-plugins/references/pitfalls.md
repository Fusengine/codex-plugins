# Pitfalls

Traps and how to avoid them. Incident history stays in `MEMORY/LESSON.md`.

| Trap | Avoid it |
|---|---|
| `bun run sync:agents` run as a "regen" step overwrote `~/.codex/agents` and `~/.codex/prompts` | Agent TOMLs regenerate from `scripts/lib/agent-toml.ts` inside the repo. Every brief that touches agents says "never run bun run sync:agents (writes ~/.codex)"; sync only on an owner mandate, backup first |
| Raw `cp`/`rsync` of `plugins/*/agents/*.toml` into `~/.codex/agents` | Installed TOMLs carry a managed header and absolute skill paths; use the materializer (`sync:agents`) only |
| A hook entry added only in `hooks.json` is silently inactive or fails validate | Edit three places: plugin `hooks.json`, `EVENTS` in `scripts/lib/hooks-validation.ts`, route in `scripts/lib/harness-hook-routes.json`; then `bun run validate` + `bun test`. A new entry is a new trust key: untrusted until the hooks-trust prompt runs |
| A key accepted by Codex is rejected by our validator (e.g. `additionalContextLimit`) | Check both sides: Codex source and our allowlists (`HANDLER_KEYS`, `EVENTS`). Proof = `bun run validate`, never a generic JSON parse |
| `^X` harness spec resolves a newer `0.1.x` and breaks the installed == target check | Pin exact `"X.Y.Z"`. `bun run update-harness` without a version writes `^latest` today — pass the version explicitly or fix the spec |
| `HARNESS_VERSION` bumped without installing (or the reverse) | It is compared by strict equality with the installed harness; bump both together via `update-harness` |
| Agent count or tier change breaks contract tests on titles/JSDoc | Update `agent-toml.test.ts` and `agent-tier-matrix.test.ts` including test titles and the dated policy JSDoc above `export const AGENT_TIERS` (must cite `docs/decisions.md` and the decision date) |
| Replacing `security-expert.toml` content | It is pilot-locked against `baseline.toml`: merge source content, never replace |
| New skill dir under a plugin whose `.cartographer` index is force-tracked | `git add -f` every `index.md` level, never `.enriched.json` |
| Editing `portage/` | Gitignored Claude snapshot; `plugins/` is the source of truth |
| `migratePlugin` on a new expert plugin fails on manifest, unresolved skill refs and missing hook routes | Hand-port manifest/agent/hooks from a sibling (e.g. `go-expert`), strip the extra blank line after frontmatter, diff bodies vs source |
| Commit agent assumes `.claude-plugin/` | This repo uses `.codex-plugin/plugin.json` + `.agents/plugins/marketplace.json`; say so in the commit brief |
| Managed-block writer duplicates `[hooks.state.*]` / `[mcp_servers.*]` tables and Codex refuses to start | Dedupe by table header, never trust marker pairs; test on a real broken file and assert idempotence |
| `process.exit` inside `try`/`catch` skips `finally` | Capture the exit code, let `finally` run, exit once after the block |
| Line-number citations into `lead-orchestration/SKILL.md` drift after an insertion | Recompute the citing lines in `agent-creator` references by grepping content, same mandate |
| `design-expert` hook-blocked from writing `.toml`; design-pipeline gate needs `design-system.md` at the cwd root | Route `.toml` edits to a non-design agent; run design work in a cwd where `design-system.md` can live at the root |
| Fix verified in the repo but not in the deployed cache | Codex reads `~/.codex/plugins/cache/fusengine-codex/<plugin>/<version>/`; report a source fix as "not deployed" until the release reaches the cache |
| Owner's direct observation vs an older benchmark | The owner's observation wins; never re-gate an owner model decision behind a new benchmark |
