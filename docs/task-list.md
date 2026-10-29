# Task List

## Current — Claude Markdown parity for Codex plugins

Status: in progress.

- Use `claude-plugins/plugins` as the read-only content reference.
- Improve Codex `AGENTS.md`, its template, rules, agent TOML instructions, skills, and Markdown references.
- Preserve the verified Codex V2 contract, all-`gpt-6.1-terra` model matrix (2026-10-29: `medium` ×30, `high` ×5, `max` ×3, never `ultra`; see `docs/workflow/agents.md` § Model Policy), nicknames, and intentional critical redundancy.
- When unsupported skill frontmatter keys are removed, preserve every original `references:` and `related-skills:` line textually in the skill body.
- Required proof: `LOST_EXACT=0`, 234/234 skills valid, all TOML parsable, links valid, full tests, validation, and final isolated Sniper.
- No commit until every writer is stopped and the final checks pass.

## Next — Harness 0.1.79 as the exclusive Codex hook entrypoint

Status: queued; do not start before the current task is validated and committed.

Repository scope: `codex-plugins` only. Never modify `fuse-harness` or `~/.codex`.
The Codex agent performs the established branch/commit/release workflow under owner supervision.

### Phase 0 — Source parity

- Verify from official Codex 0.144.x documentation or source, not memory, the exact emitted names and payloads for `SessionStart`, `Stop`, `TeammateIdle`, and `PostToolUse` after `apply_patch`.
- Do not wire an event Codex does not emit; document the contradiction and stop.
- Exhaustively inventory every `hooks.json` command that does not invoke Harness.

### Phase 1 — Dependency

- Bump `@fusengine/harness` to `^0.1.79`.
- Run `bun install` and resolve the lockfile.

### Phase 2 — Exclusive wiring

- Route every surviving hook command through:

  ```sh
  bun "${CODEX_HOME:-$HOME/.codex}/node_modules/@fusengine/harness/dist/cli/bin.mjs" hook codex [scope]
  ```

- Route verified `SessionStart`, `Stop`, and `TeammateIdle` events to scope `core`.
- Verify that `apply_patch` emits the expected post-tool event and routes through Harness `handlePost`.
- Remove all local `afplay`/sound commands; Harness `assets/song` is the only sound source.
- Rebuild bundles through the repository build script; never edit bundles manually.

### Phase 3 — Dead code and Harness gaps

- Delete every local hook script whose behavior is now routed through Harness, after proving zero remaining references.
- Keep no local compatibility script.
- If Harness does not cover a behavior, omit the local script and record a separate `GAP HARNESS` item with behavior, event, and original source to port into `fuse-harness` later.

### Phase 4 — Gates and runtime proof

- Gate every `hooks.json`: Harness command only, emitted Codex event only, mandatory `CODEX_HOME` fallback.
- Runtime-smoke-test each newly wired event against the installed binary:
  - `SessionStart` → real agent/command resync;
  - `Stop` → validation and cleanup;
  - `TeammateIdle` → Harness sound;
  - post-`apply_patch` → Harness `handlePost`.
- Run `env -u RALPH_MODE bun test`, `bun run validate`, bundle rebuild, and documentation checks with zero failures.
- Update installation and workflow/agents documentation.

### Phase 5 — Release

- Bump every touched plugin and suite version.
- Update `CHANGELOG.md` with command-proven claims only.
- Follow the Marketplace Path tag convention.
- Commit, push, PR/check, merge, and tag only through the established supervised workflow.

### Required final report

- Event parity table with authoritative evidence.
- `hooks.json` before/after inventory.
- Separate `GAP HARNESS` report.
- Confirmation that Harness is the exclusive sound source.
- Verbatim test/build/validation output.
- Explicit confirmation: zero non-Harness hook commands remain.
