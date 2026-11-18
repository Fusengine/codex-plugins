---
name: project-codex-plugins
description: "Use when working in the codex-plugins project: the Fusengine plugin suite ported to the Codex CLI (27 plugins, 40 agent TOMLs, codex-rules, installer, @fusengine/harness hooks). Read before exploring, editing agents/skills/hooks, bumping the harness or preparing a release."
---

# Project: codex-plugins

Ports the Claude plugin suite `Fusengine/claude-plugins` to the Codex CLI as the `fusengine-codex` marketplace.
`plugins/` is the source of truth; `scripts/` generates, validates and installs it into a user's `~/.codex`.

**Stack:** Bun (>= 1.2.15) + TypeScript ES modules, `@fusengine/harness` (exact pin) for every hook, `bun test` colocated tests.

## Key commands

| Command | Use |
|---|---|
| `bun run validate` | Repo gate: manifests, hooks, harness routes (required after any `hooks.json` / `plugin.json` edit) |
| `bun test` | All tests (no `test` script; bun built-in) |
| `bun run update-harness` | Bump `@fusengine/harness` + audit scopes (`--check` = report only) |
| `bun run sync:agents` | Writes `~/.codex/agents` + `~/.codex/prompts` — only on an owner mandate naming it, backup first |

## Need → reference

| Need | Read |
|---|---|
| Where things live, data flow, agent TOML pipeline | `references/architecture.md` |
| Versions, deps, model fleet policy | `references/stack.md` |
| Every command, test, release flow | `references/commands.md` |
| Naming, file layout, docs, language, git | `references/conventions.md` |
| Known traps and how to avoid them | `references/pitfalls.md` |

Owner decisions: `docs/decisions.md`. Status: `docs/roadmap.md`. History of incidents: `MEMORY/LESSON.md`.
