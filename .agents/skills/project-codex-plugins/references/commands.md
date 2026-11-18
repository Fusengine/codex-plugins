# Commands

All `bun run` commands below are `package.json` scripts; `bun install` and `bun test` are Bun built-ins (there is no `test` script).

## Install (repo dev)

| Command | Effect |
|---|---|
| `bun install` | Install repo deps (respects the exact harness pin) |

End users install through `setup.sh` / `setup.ps1` from the Codex marketplace checkout (README § Installation); never run them from an agent without an owner mandate naming them.

## Validate and test

| Command | Effect |
|---|---|
| `bun run validate` | `scripts/validate.ts`: deprecated-flag cleanup, hook config, harness hook wiring, sub-checks. Mandatory proof for any `hooks.json`, `plugin.json` or manifest change |
| `bun test` | Every colocated `scripts/lib/**/*.test.ts` and `scripts/tests/*.test.mts` |
| `bun test scripts/lib/agent-toml.test.ts` | Model/effort matrix after an agent change |

Run `bun run validate` as the full gate: its hook check runs `validateHarnessHookWiring` before `validateHooksConfig` (`scripts/lib/hook-config-validation.ts`), so testing one sub-validator alone can give a false green.

## Generate

| Command | Effect |
|---|---|
| `bun run migrate` | Regenerate `plugins/*` from `../claude-plugins/` (`scripts/migrate.ts`) |
| `bun run conformance:fix` | `scripts/final-conformance.ts` conformance pass |

## Harness

| Command | Effect |
|---|---|
| `bun run update-harness -- --check` | Report installed / declared / audited / latest / `~/.codex` versions, exit 1 if not up to date; writes nothing |
| `bun run update-harness -- <X.Y.Z>` | Exact pin to `X.Y.Z`, reinstall, audit all scopes, advance `HARNESS_VERSION` |
| `bun run update-harness` | Same with the latest version; always writes an exact pin and rewrites a `^X` spec |
| `bun run harness:auto-update` | `scripts/harness-auto-update.ts`: never touches the working repo; audits, validates and tests `<latest>` in a temporary `git worktree` of HEAD, then swaps the harness atomically into `~/.codex` (3 backups, rollback on failure, PID lock, stale after 24 h) |
| `bun run harness:auto-update -- --dry-run` | Prints the decision only: no log, no lock, no worktree, no write |

### Daily launchd job

- LaunchAgent `com.fusengine.harness-auto-update`, template `scripts/launchd/com.fusengine.harness-auto-update.plist`: runs `harness-auto-update.ts` daily at 09:00 (next wake if asleep), `RunAtLoad` false.
- Log: `~/Library/Logs/fusengine-harness-auto-update.log` (lock under `~/Library/Caches`). The job logs when the repo pin is behind `~/.codex`; the repo pin is bumped at the next commit cycle.
- Disable: `launchctl bootout gui/$(id -u)/com.fusengine.harness-auto-update`.

## Writes outside the repo (owner mandate only)

| Command | Effect |
|---|---|
| `bun run sync:agents` | Materializes `~/.codex/agents/*.toml` and `~/.codex/prompts` symlinks. Never as a "regen" step; back up both folders first |

## Release

Every commit, push, PR, merge, tag and release goes through the `commit` agent (`$commit-pro:commit` + `$commit-pro:git-flow`): WIP commits on the working branch, then at the commit cycle push, PR, CI, merge (never squash), tag. It bumps `.codex-plugin/plugin.json` versions, mirrors them in `.agents/plugins/marketplace.json` and appends `CHANGELOG.md`.
