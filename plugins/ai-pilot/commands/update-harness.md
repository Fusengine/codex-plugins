---
description: Update the shared @fusengine/harness to the latest published version — bumps the repo's package.json, reinstalls, audits all 11 scopes against the installed binary, and only then advances the HARNESS_VERSION tripwire.
argument-hint: "[target-version] [--check]"
---

# Update Harness

Bump and audit the single shared `@fusengine/harness` install every plugin hook runs (`scripts/lib/harness-hook-policy.ts` → `HARNESS_BIN`).

## Report only (no writes)

```bash
bun run update-harness --check
```

Prints `installed=<repo> declared=<range> audited=<HARNESS_VERSION> latest=<npm> ~/.codex=<installed>` and exits 1 if the repo is behind on any of installed/audited tripwire/declared range vs latest.

## Update

```bash
bun run update-harness            # target = latest published
bun run update-harness 0.1.99     # pin to a specific version
```

Both paths (explicit target and auto-detected latest) write an **exact pin** (`"0.1.99"`, never a caret) to `package.json` — on a `0.x` package a caret range still floats to the newest `0.1.x` on `bun install`, which would silently resolve past the pin. A leftover caret spec counts as drift (re-pinned on the next run). A prerelease/build-tagged version (e.g. `0.1.99-beta.1`) is refused before any write, for either path — see step 1.

Steps (all in `scripts/lib/install/harness-update.ts` + `harness-update-flow.ts`):

1. Resolve the target: an explicit CLI argument must match `X.Y.Z` exactly or the run aborts with `harness: prerelease/invalid version "<v>" refused`; otherwise the target is the latest published version (same check applied to `bun pm view`'s output).
2. Stop only if installed, audited `HARNESS_VERSION`, AND the declared spec (exact pin only) all already equal the target. **Re-audit path**: if `node_modules` already holds the target but the tripwire or spec lags, the full path still runs as a no-op reinstall that self-corrects the drift — no manual edit needed.
3. Snapshot `package.json` AND `bun.lock` (if present), bump the `"@fusengine/harness"` line, `bun install`.
4. Verify the resolved install actually moved to the target.
5. **Automated audit** — run `bun bin.mjs hook codex <scope>` for all 11 `HARNESS_SCOPES` (core, solid, rules, carto, security, changelog, aipilot, lessons, seo, memory, tailwindcss) with a minimal `SessionStart` stdin, under a scratch `CODEX_HOME` (never the real `~/.codex`). A scope fails if the process exits non-zero OR stderr contains `unknown scope` (the installed binary silently falls back to `"core"` on an unrecognized scope instead of erroring). **Negative control**: a deliberately bogus scope is probed first — if it is NOT flagged unknown, the whole audit fails closed (signal unavailable) instead of reporting a false 11/11.
6. **Any failure** (incl. the control, or an unexpected throw from the update itself) → restore `package.json`/`bun.lock` from the snapshot, reinstall with `bun install --frozen-lockfile` (exit code folded into the abort message), exit 1. `HARNESS_VERSION` untouched.
7. **11/11 pass** → rewrite `HARNESS_VERSION` in `harness-hook-policy.ts` to the target (the only line touched), then run `bun run validate` and `bun test`. If either fails, the tree IS rolled back like any other failure: `package.json`, `bun.lock` AND `HARNESS_VERSION` are restored from the snapshot, `bun install --frozen-lockfile` re-runs, exit 1 — the repo never stays on an unvalidated version, so a replay cannot report a false "already" state.
8. Prints `harness: <old> -> <new>, audited scopes 11/11, validate=<code>, tests=<pass>/<fail>`.

`HARNESS_VERSION` is the tripwire `validateHarnessHookWiring` checks against the installed package — it is rewritten ONLY after the automated audit passes in full, never by hand.

**Notes**: never runs `npm publish` (publishing happens in the harness repo); also bump `plugins/package.json` separately if that marketplace mirror needs to match.

**Arguments**:
- `$ARGUMENTS` — optional target version (e.g. `0.1.99`), or `--check` for a read-only report.
