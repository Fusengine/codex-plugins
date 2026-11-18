# Hooks System

Automatic enforcement of APEX, SOLID, safety, and notification behavior through
Codex plugin hooks.

## Overview

The hooks system helps agents:
1. Consult relevant skills before risky changes.
2. Follow APEX where it is useful.
3. Validate SOLID/DRY rules.
4. Surface blocking feedback through Codex hook output.

## Architecture

```
~/.codex/config.toml
       |
       v
plugins/*/hooks/hooks.json
       |
       v
@fusengine/harness hook codex [scope]
```

Every configured command handler uses a canonical Harness route. There is no
legacy-command exception path: an unregistered plugin/event/matcher tuple is
rejected by validation and skipped by generation.

To bump the installed `@fusengine/harness` version, run `bun run update-harness`
(`--check` for a read-only report). It reinstalls, then automatically exercises
all 11 `HARNESS_SCOPES` against the installed binary — with a negative-control
probe run first — before rewriting the `HARNESS_VERSION` tripwire in
`harness-hook-policy.ts` — never by hand, and never on a failed audit. See
`plugins/ai-pilot/commands/update-harness.md`.

#### Automatic update (inside the commands you already run)

The pin in `package.json` is always an exact `X.Y.Z` (never a caret). The audited
update (`scripts/harness-auto-update.ts` flow) runs best-effort at the end of
`bun run sync:agents` and the installer (`./setup.sh`); nothing runs in the background and
nothing extra is installed. It maintains `~/.codex` and **never touches your
working repo**. Set `FUSE_HARNESS_AUTO_UPDATE=0` (or `false` / `off`) to skip it. If
the registry is unreachable or the audit/validate/tests fail, the command logs one
warning line (naming the resolved codex home) and carries on with its normal work:
the sync or install never fails because of the update.

1. If `~/.codex` already holds the latest release: log "up to date", stop (and
   note when the repo pin trails: "repo pin X behind ~/.codex Y — bump at next
   commit cycle"; bump it yourself at your next commit cycle).
2. Otherwise take a PID lock (`~/Library/Caches/fusengine-harness-auto-update.lock`,
   stale if the PID is dead or the lock is older than 24 h) so two runs (sync,
   install, manual) never overlap. Then clean leftovers of a killed run: in the codex home
   only `.harness-staging-<stamp>` and `node_modules.old-<stamp>` (if the live
   `node_modules` is missing, the newest parked one is restored instead), and in
   the system temp dir only this job's own `harness-auto-update-*` worktree dirs
   (plus `git worktree prune`).
3. Check out `HEAD` into a throwaway `git worktree` under the system temp dir and
   there run `bun install`, `bun run update-harness <latest>` (audit of all 11
   scopes, `validate`, `bun test`; any failure rolls back `package.json`,
   `bun.lock` and `HARNESS_VERSION` in that worktree), then the job's **own**
   `validate`, `bun test` and scope audit, so every codex-home write is audited,
   validated and tested by this very run, even when `update-harness` reports
   "already" (HEAD already pinned, codex home lagging). The worktree is always
   removed.
4. Only if everything passed: stage the new runtime in a side directory
   (`<codexHome>/.harness-staging-*`) and verify it; then, right before the swap,
   back up `<codexHome>/package.json` and `<codexHome>/bun.lock` as
   `<codexHome>/package.json.bak-<YYYY-MM-DDTHHMMSS>` (and `bun.lock.bak-…`); swap
   into `node_modules` by two directory renames and verify again. Any failure
   restores `node_modules`, `package.json` and `bun.lock` and re-runs `bun install`
   in the codex home, then logs FAILED. On success only the last 3 backup pairs
   are kept.

Residual window: between the two renames (microseconds) `node_modules/@fusengine/harness`
does not exist; an already-running Codex is never waited on or stopped.

Paths: by default the codex home is `~/.codex`, the log `~/Library/Logs/…` and the
lock `~/Library/Caches/…`. With a custom `CODEX_HOME` (e.g. a test run) the log
(`<codexHome>/fusengine-harness-auto-update.log`) and the lock
(`<codexHome>/.fusengine-harness-auto-update.lock`) live inside that directory, so
a test can never write the real log or contend for the real lock. Log messages
print the resolved codex-home path.

- Trigger: end of `bun run sync:agents` and of the installer (`./setup.sh`). The check compares
  `~/.codex` against the latest release, so the next run catches up on anything
  missed.
- Log (append-only, ISO timestamps): `~/Library/Logs/fusengine-harness-auto-update.log`.
- Manual run: `bun run harness:auto-update` (`--dry-run` prints the decision and
  writes nothing).
- Skip: `FUSE_HARNESS_AUTO_UPDATE=0` in the environment of the command.
- Registry lookup (`bun pm view`) is bounded to 15 s (`FUSE_HARNESS_REGISTRY_TIMEOUT_SEC`
  to change it); on timeout the command logs one warning and carries on.
- Lock held by another run: one warning ("auto-update skipped: another run holds the lock").
- The installer keeps a valid `~/.codex` harness runtime that is newer than the repo pin
  (one info line) instead of reinstalling the pin and then climbing back.

### Harness 0.1.79 Runtime Limits

Harness-only wiring guarantees that the handler enters Harness; it does not
claim complete Codex behavior parity in the installed 0.1.79 runtime. Inspection
of that published bundle shows these remaining compatibility limits:

- design-agent lifecycle handling runs only for `id === "claude-code"`.
- core session, rules, cartography, and failure paths still contain Claude roots
  such as `CLAUDE_PLUGIN_ROOT`, `.claude`, and `CLAUDE.md`.
- lifecycle dispatch includes Claude-only names such as `TaskCompleted`,
  `PostToolUseFailure`, and `SessionEnd`; Codex does not emit those events.

These are Harness runtime gaps, not reasons to wire direct plugin scripts.

Plugin hooks require:

```toml
[features]
hooks = true
```

## Installation

### macOS / Linux

```bash
~/.codex/.tmp/marketplaces/fusengine-codex/setup.sh
```

### Windows

```powershell
~/.codex/.tmp/marketplaces/fusengine-codex/setup.ps1
```

The installer writes Codex configuration under `${CODEX_HOME:-~/.codex}` and
caches local plugins under:

```
~/.codex/plugins/cache/fusengine-codex/<plugin>/<version>/
```

## Stable Hook Events

Register only stable Codex plugin hook events:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `SessionStart` | Session starts | Load context and cleanup state |
| `UserPromptSubmit` | User sends a message | Detect project type and inject guidance |
| `PreToolUse` | Before tool execution | Block unsafe or invalid actions |
| `PostToolUse` | After tool execution | Validate results and track changes |
| `PermissionRequest` | Permission prompt shown | Notify user |
| `Stop` | Turn finishes | Cleanup and completion notification |

Do not register `PreCompact` for plugin hooks until Codex stabilizes it.

## Adding Hooks To A Plugin

1. Create the hook directory:

```bash
mkdir -p plugins/my-plugin/hooks
```

2. Create `hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "apply_patch",
        "hooks": [
          {
            "type": "command",
            "command": "bun \"${CODEX_HOME:-$HOME/.codex}/node_modules/@fusengine/harness/dist/cli/bin.mjs\" hook codex core"
          }
        ]
      }
    ]
  }
}
```

Use only the route registered for the exact plugin/event/matcher tuple. Unknown
scopes are unsafe because the CLI can fall back silently. Do not wire a new
direct script; port its behavior to Harness and add parity tests first.

Optional per-handler keys accepted by the validator: `timeout`, `async`,
`statusMessage`, `commandWindows` and `additionalContextLimit` (approximate
token threshold above which Codex spills the handler's `additionalContext` to
disk; default 2,500; `0` disables spilling; only on SessionStart,
SubagentStart, PreToolUse, PostToolUse and UserPromptSubmit). `codex-rules`
sets 6000 because its 9 rule files total ≈ 18.6 KB.

## Harness Input

Hooks receive JSON input through stdin:

```json
{
  "tool_name": "apply_patch",
  "tool_input": {
    "file_path": "/path/to/file.ts"
  }
}
```

## Harness Output

Allow:

```bash
exit 0
```

Harness emits native structured Codex output, including `hookSpecificOutput`
for permission decisions. Do not teach legacy stderr/`exit 2` protocols.

## Legacy Script Removal

Plugin `scripts/` directories may still contain source or migration artifacts,
but hook configuration must not invoke them. Remove an artifact only after no
source, bundle, generator, test, or documentation references it.

## Troubleshooting

Check feature flags:

```bash
codex features list | rg '^hooks'
```

Check installed cache:

```bash
find ~/.codex/plugins/cache/fusengine-codex -maxdepth 3 -name hooks.json
```

Run validation from the source repository:

```bash
bun run validate
```

This includes the exhaustive Harness route gate.
