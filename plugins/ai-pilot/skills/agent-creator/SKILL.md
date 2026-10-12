---
name: agent-creator
description: Use when creating expert agents. Generates agent.toml (model tier, sandbox_mode, developer_instructions with required sections) and wires skill references.
---

<objective>
Agent Creator scaffolds a complete Codex expert agent: `plugins/<plugin>/agents/<name>.toml` (`name`, `description`, `model` tier + `model_reasoning_effort`, `sandbox_mode`, `nickname_candidates`, `developer_instructions`), the mandatory Agent Workflow section inside `developer_instructions`, and skill wiring via `[[skills.config]]`. It covers three flows -- creating a brand-new domain/framework expert, adapting an existing agent to a new stack, and updating an agent's skills or model tier -- each ending with `bun test scripts/lib/agent-toml.test.ts` and a `sniper` pass.

It does not create the skills an agent references -- for that, use `skill-creator`; agent-creator only wires the agent TOML and workflow around skills that already exist or are created alongside it. It also does not define hooks -- those live in the plugin's `hooks/hooks.json`, never in the agent file.
</objective>

# Agent Creator

## Agent Workflow (MANDATORY)

Before ANY agent creation, delegate via `spawn_agent` — spawn 2 agents in parallel (single message, two `spawn_agent` calls). A Codex agent TOML has no tool-list field of its own — tool access is governed by `sandbox_mode`, not a per-agent list — so any internal delegation a generated agent performs must itself read as `spawn_agent` by bare agent name, never a Claude-style team-spawn primitive:

1. **explore-codebase** - Check existing agents, analyze patterns
2. **research-expert** - Fetch latest agent conventions

`mcp__context7__query-docs` is a direct MCP call, not a spawned agent — invoke it directly (alongside the 2 `spawn_agent` calls) to get examples from existing agents.

After creation, run `bun test scripts/lib/agent-toml.test.ts` then **sniper** for validation.

---

## Overview

| Action | When to Use |
|--------|-------------|
| **New Agent** | New domain/framework expert needed |
| **Adapt** | Copy from similar agent (Next.js → React) |
| **Update** | Add skills, change model tier |

---

## Critical Rules

1. **Unique kebab-case `name`** - matches the filename, is what `spawn_agent` targets
2. **Complete TOML** - `name`; `description` with a `Use when… / Do NOT use for…` routing pattern; `model` as an explicit tier from the Model Tier Matrix below (never the bare `gpt-6` alias) with a matching `model_reasoning_effort`; `sandbox_mode`; `nickname_candidates` ASCII-only, non-empty, no duplicates (Codex silently drops the whole agent otherwise — it never becomes spawnable); `developer_instructions` covering every section in [required-sections.md](references/required-sections.md), including the "Inherited rules (from AGENTS.md)" block
3. **Hooks belong to the plugin, not the agent** - `plugins/<plugin>/hooks/hooks.json`; there is no hooks field on a Codex agent
4. **Validate** - `bun test scripts/lib/agent-toml.test.ts` (checks the model matrix and `agentRoleViolations`), then **sniper**
5. **Internal delegation** - every `developer_instructions` describes delegation as `spawn_agent` calls by name; never a generic agent when a domain expert exists

---

## Architecture

```
plugins/<plugin-name>/
├── agents/
│   └── <agent-name>.toml    # Agent definition (TOML, not Markdown)
├── skills/
│   ├── skill-a/
│   └── solid-[stack]/
├── hooks/
│   └── hooks.json           # Plugin-level Pre/Post tool validation
└── .codex-plugin/
    └── plugin.json
```

→ See [architecture.md](references/architecture.md) for details

---

## Reference Guide

### Concepts

| Topic | Reference | When to Consult |
|-------|-----------|-----------------|
| **Architecture** | [architecture.md](references/architecture.md) | Understanding agent structure |
| **Frontmatter / TOML fields** | [frontmatter.md](references/frontmatter.md) | `name`, `description`, `model`, `model_reasoning_effort`, `sandbox_mode`, `nickname_candidates`, `[[skills.config]]` |
| **Required Sections** | [required-sections.md](references/required-sections.md) | Mandatory `developer_instructions` content, incl. Inherited rules |
| **Hooks** | [hooks.md](references/hooks.md) | `plugins/<plugin>/hooks/hooks.json` Pre/Post tool validation |
| **Registration** | [registration.md](references/registration.md) | Adding a brand-new plugin to the marketplace — not a per-agent step, `agents/*.toml` is auto-discovered |

### Templates

| Template | When to Use |
|----------|-------------|
| [agent-template.md](references/templates/agent-template.md) | Creating a new agent (TOML format) |
| [agent-template-examples.md](references/templates/agent-template-examples.md) | Worked Codex TOML agent examples (Next.js, Laravel) — abbreviated from the real shipped files |
| [hook-scripts.md](references/templates/hook-scripts.md) | How `hooks.json` wires to the canonical Harness route — adding a new event/matcher, where hook logic actually lives (harness repo) |
| [hook-scripts-reference.md](references/templates/hook-scripts-reference.md) | Historical check-logic reference scripts (SOLID size/interface rules) — illustration only, not a porting target |
| [hook-scripts-reference-2.md](references/templates/hook-scripts-reference-2.md) | Check-logic reference scripts (Swift SOLID, skill-read tracker) — continued from hook-scripts-reference.md |

---

## Model Tier Matrix

Choose the tier explicitly — never a bare `gpt-6`/`gpt-6.1` alias. Full rationale: `docs/reference/creating-skills-agents.md` (model policy section).

**Current, since 2026-09-30** (owner decision, verbatim: "okay passe les tous en v 6.1"). Every shipped agent runs on `gpt-6.1-sol`; `gpt-6-luna` is not used in this fleet, no GPT-6.1 Luna or Astra id is published, `gpt-6-astra` is excluded on cost, and GPT-6 has no `terra` tier.

| Profile | Use for | Reasoning effort |
|---------|---------|-------------------|
| `gpt-6.1-sol` | Every agent except `design-expert` (37) — the default for any new agent | `medium` |
| `gpt-6.1-sol` | Highest-judgment gate (`design-expert` only) | `high` |

Valid efforts: the Codex catalog lists `low` through `ultra` for `gpt-6.1-sol` — this fleet uses only Sol medium (plus `design-expert` at Sol high); any other model or effort needs a new owner decision. Prices per 1M tokens (input/cached/output, standard ≤272K input, developers.openai.com/api/docs/pricing): `gpt-6.1-sol` $2.00/$0.10/$10.00.

### History

Superseded policies (the 2026-09-27 all-GPT-6-Sol fleet, the 2026-09-23 GPT-6 Sol/Luna split and its measurements, and the GPT-5.6 Sol/Terra/Luna tiers) live only in [`docs/workflow/agents.md` § Model Policy](../../../../docs/workflow/agents.md#model-policy) — not reproduced here, to avoid the copies drifting.

---

## Quick Reference

### Create New Agent

```bash
# 1. Research existing agents
→ explore-codebase + research-expert

# 2. Create the TOML
touch plugins/<plugin>/agents/<agent-name>.toml

# 3. Add/confirm plugins/<plugin>/hooks/hooks.json (never inside the agent TOML)

# 4. Validate
bun test scripts/lib/agent-toml.test.ts
→ sniper
```

### Adapt Existing Agent

```bash
# 1. Copy similar agent
cp plugins/nextjs-expert/agents/nextjs-expert.toml plugins/new-plugin/agents/new-expert.toml

# 2. Adapt with sed
sed -i '' "s/nextjs/newstack/g; s/Next\.js/NewStack/g" agents/new-expert.toml

# 3. Update skills.config paths, model tier, nickname_candidates
```

---

## Validation Checklist

- [ ] `name` unique, kebab-case, matches the filename
- [ ] `description` follows `Use when… / Do NOT use for…`
- [ ] `model` is an explicit tier from the Model Tier Matrix, with a matching `model_reasoning_effort`
- [ ] `sandbox_mode` set (`read-only` / `workspace-write` / `danger-full-access`)
- [ ] `nickname_candidates` non-empty, ASCII, no duplicates
- [ ] `developer_instructions` covers every [required-sections.md](references/required-sections.md) section, incl. Inherited rules (from AGENTS.md)
- [ ] No hooks, tool-list, or display-color key on the agent TOML
- [ ] Every `[[skills.config]]` `path` resolves on disk
- [ ] `bun test scripts/lib/agent-toml.test.ts` passes
- [ ] `sniper` reports zero errors

---

## Related: Skill Creator

**When creating an agent, you often need to create skills too.**

Use **`skill-creator`** to create skills for the agent:

| Scenario | Action |
|----------|--------|
| New agent needs skills | Create skills with skill-creator first |
| Agent references skills | Ensure skills exist in skills/ |
| Adapting agent | Adapt related skills too |

---

## Best Practices

### DO
- Use skill-creator for associated skills
- Reference the solid-[stack] skill for SOLID rules
- Include Gemini Design guidance inside `developer_instructions` for UI agents
- Pick model + reasoning effort from the Model Tier Matrix, never guess

### DON'T
- Write in French (English only)
- Skip the Agent Workflow section inside `developer_instructions`
- Put a hooks table, a tool list, or a display color on the agent TOML
- Create an agent without its skills
- Assign a bare `gpt-6`/`gpt-6.1` alias, any model other than `gpt-6.1-sol` (Luna is not used for shipped agents), or `high` effort to any agent other than `design-expert`
