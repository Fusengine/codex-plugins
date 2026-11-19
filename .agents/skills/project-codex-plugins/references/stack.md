# Stack

## Runtime and language

- Bun, `engines.bun >= 1.2.15` (installed locally: 1.4.4); `"type": "module"`.
- TypeScript (`typescript ^7.0.2`, `tsconfig.json` at the root); no build step — scripts run with `bun run`.
- Target: Codex CLI (real-condition runs on `codex-cli 0.169.0`).

## Key dependencies (`package.json`)

| Package | Spec | Why |
|---|---|---|
| `@fusengine/harness` | `0.1.126` (exact pin) | Runs every plugin hook; version mirrored in `HARNESS_VERSION` |
| `smol-toml`, `@iarna/toml` | caret | TOML parse/emit for agents and `config.toml` |
| `yaml` | caret | Frontmatter parsing |
| `@clack/prompts` | caret | Installer prompts |
| `cheerio`, `fast-xml-parser`, `lighthouse`, `chrome-launcher` | caret | SEO plugin tooling |

Pins of `@fusengine/harness` are always exact (`"X.Y.Z"`): on a `0.x` package `^0.1.85` resolves any `0.1.x`.

## Model fleet (since 2026-11-18)

| Tier | Model / effort | Count |
|---|---|---|
| `DEFAULT` | `gpt-6.2-sol` / `medium` | 25 |
| `JUDGE` | `gpt-6.2-sol` / `high` | 6 |
| `DESIGN` | `gpt-6.2-sol` / `max` | 1 (`design-expert`, since 2026-11-19) |
| `NON_CORE` | `gpt-6.1-terra` / `medium` | 7 |
| `SECURITY` | `gpt-6.1-terra` / `high` | 1 (`security-expert`) |

`max` only for `design-expert` (named exception, `docs/decisions.md` 2026-11-19), retired for the other 39 agents; never `ultra`. Coordinator (owner's own session): `gpt-6.2-sol` / `medium`, outside the TOML policy. Canonical text and agent names: `docs/workflow/agents.md` § Model Policy; code of record: `AGENT_TIERS` + `TIER_PROFILES` in `scripts/lib/agent-toml.ts`. Any tier change needs a dated owner decision quoted in the task PRD (`codex-rules` rule 03, rule 12).

## Versions of record

- Suite and per-plugin versions: `.agents/plugins/marketplace.json` and each `plugins/<p>/.codex-plugin/plugin.json`.
- Release history: `CHANGELOG.md` (append-only).
