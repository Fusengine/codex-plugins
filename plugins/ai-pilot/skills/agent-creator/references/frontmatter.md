---
name: frontmatter
description: Codex agent TOML top-level keys
when-to-use: Configuring agent identity, model, sandbox, skills, nicknames
keywords: toml, frontmatter, model, sandbox_mode, nickname_candidates, skills.config
priority: high
related: hooks.md, architecture.md
---

# Agent Frontmatter (TOML)

## Overview

A Codex agent is one TOML file at `plugins/<plugin>/agents/<name>.toml`. There
is no YAML frontmatter block inside a Markdown file — the whole file IS the
configuration, and the agent's full prompt lives in the `developer_instructions`
string.

There is **no** `color`, `tools`, or `hooks` key on a Codex agent. Tool access
is governed by `sandbox_mode` and the runtime, not a per-agent tool list.
Hooks live in the plugin's `hooks/hooks.json`, never in the agent TOML — see
[hooks.md](hooks.md).

---

## Complete Example

```toml
name = "sniper"
description = "Elite code error detection and correction. Use after ANY code modification. Do NOT use for: new features, read-only analysis."
model = "gpt-6.2-sol"
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"
nickname_candidates = ["Sniper", "Code Sniper", "Sniper Agent"]
developer_instructions = '''
# Sniper Agent

Full instruction body — same substance as the source, Codex idioms.
'''

[[skills.config]]
path = "plugins/ai-pilot/skills/code-quality/SKILL.md"
enabled = true
```

Real reference: `plugins/typescript-expert/agents/typescript-expert.toml`.

---

## Field Reference

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | kebab-case, unique across the ecosystem, referenced by `spawn_agent`. Blank/missing drops the whole file at Codex startup (one-line warning only — the agent silently never becomes spawnable). |
| `description` | Yes | Keep the "Use when… / Do NOT use for…" routing pattern — it drives agent selection. |
| `developer_instructions` | Yes | Triple-quoted (`'''…'''`) string holding the full agent brief. No truncation of source substance. |
| `model` | Recommended | Full model id only: `gpt-6.2-sol` by default, `gpt-6.1-terra` only for the agents named in Model Selection below. Never a bare alias. |
| `model_reasoning_effort` | Recommended | `medium` by default; `high` only for the agents named in Model Selection below; never `max` or `ultra`. |
| `sandbox_mode` | Recommended | One of `read-only`, `workspace-write`, `danger-full-access`. See `sandbox_mode` Guidance below. |
| `nickname_candidates` | Optional | Array of display names, identity evidence when spawning. See rules below. |
| `mcp_servers` | Optional | MCP servers this agent may reach; declare only servers configured for Codex. |
| `[[skills.config]]` | Optional | One table per attached skill: `path` (repo-relative `SKILL.md`) + `enabled = true`. |

No other top-level key is meaningful to the agent loader. Unknown keys are not
fatal (they are silently absorbed by the flattened config), but do not rely on
that — never add `color`, a `tools` list, or a `hooks` table here.

---

## Model Selection

Four role tiers (25 + 7 + 7 + 1 = 40), mirroring the Model Tier Matrix in
`SKILL.md`:

| Tier | `model` / effort | Agents |
|------|-------------------|--------|
| `DEFAULT` (25) | `gpt-6.2-sol` / `medium` | Every agent not listed below, incl. code executors and `commit` — the default for any new agent |
| `JUDGE` (7) | `gpt-6.2-sol` / `high` | `sniper`, `challenger`, `brainstorming`, `prompt-engineer`, `skill-creator`, `solid-orchestrator`, `design-expert` |
| `NON_CORE` (7) | `gpt-6.1-terra` / `medium` | `commit-detector`, `cartographer`, `seo-images`, `seo-sitemap`, `sniper-faster`, `websearch`, `changelog-watcher` |
| `SECURITY` (1) | `gpt-6.1-terra` / `high` | `security-expert` |

Never `max` or `ultra` effort, never a model other than `gpt-6.2-sol` /
`gpt-6.1-terra`, never a bare alias; any other model or effort needs a new
owner decision. Rationale, decision dates and every superseded policy live
only in [`docs/workflow/agents.md` § Model
Policy](../../../../../docs/workflow/agents.md#model-policy) — not
reproduced here, to avoid the copies drifting.

---

## `sandbox_mode` Guidance

| Value | When to use |
|-------|-------------|
| `read-only` | Audit, explore, research, challenger agents — never write |
| `workspace-write` | Agents that edit files (implementation, sniper, commit) |
| `danger-full-access` | Only when a task genuinely needs it |

---

## `nickname_candidates`

```toml
nickname_candidates = ["Sniper", "Code Sniper", "Sniper Agent"]
```

Codex trims every candidate, then rejects the array if any candidate is:

- an empty array (must contain at least one name),
- blank after trimming,
- a duplicate of another candidate (case-sensitive),
- outside the ASCII charset `[A-Za-z0-9 _-]` — a stray `.` (e.g. "Next.js
  Expert") is illegal and has broken a shipped agent's nicknames before.

Validate with `scripts/lib/agent-role-validation.ts` before shipping — it
implements all four checks, not just the charset one.

---

## `[[skills.config]]`

```toml
[[skills.config]]
path = "plugins/ai-pilot/skills/code-quality/SKILL.md"
enabled = true

[[skills.config]]
path = "plugins/typescript-expert/skills/ts-config/SKILL.md"
enabled = true
```

Each table's `path` must resolve to a real `SKILL.md` on disk — check with
`ls <path>` before shipping.

---

## Description Best Practices

| Good | Bad |
|------|-----|
| "Use when: tsconfig.json present but NO framework config... Do NOT use for: React/Next.js/Astro apps (framework experts)." | "TypeScript developer" |

**Pattern**: "Use when: [trigger]. Do NOT use for: [overlap it must not claim]."

→ See [templates/agent-template.md](templates/agent-template.md) for a full worked example.
