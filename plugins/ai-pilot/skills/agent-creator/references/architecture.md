---
name: architecture
description: Real agent/plugin file layout for Codex
when-to-use: Understanding how agents are organized in plugins
keywords: architecture, structure, directory, files, plugin, toml
priority: high
related: frontmatter.md, registration.md
---

# Agent Architecture

## Overview

Agents live in plugin directories as TOML files and reference skills for
domain knowledge. There is no Markdown agent file with a YAML frontmatter
block — see [frontmatter.md](frontmatter.md) for the real TOML schema.

---

## Directory Structure

```
plugins/<plugin-name>/
├── agents/
│   └── <agent-name>.toml    # name, description, developer_instructions (+ model, sandbox_mode, skills.config)
├── hooks/
│   └── hooks.json           # PreToolUse/PostToolUse/... routed through the shared harness CLI
├── skills/
│   ├── skill-a/              # Domain skill
│   │   ├── SKILL.md
│   │   └── references/
│   └── solid-[stack]/        # SOLID rules for this stack, if applicable
└── .codex-plugin/
    └── plugin.json          # Plugin manifest
```

---

## File Purposes

| File | Purpose |
|------|---------|
| `agents/<name>.toml` | Agent definition: identity, model/sandbox policy, full instructions, attached skills |
| `hooks/hooks.json` | Plugin-level hook wiring (event + matcher → harness command) |
| `skills/*/SKILL.md` | Skill entry points the agent can attach via `[[skills.config]]` |
| `.codex-plugin/plugin.json` | Plugin metadata: name, version, description, `skills` path, `hooks` path |

---

## Agent File Structure

```toml
name = "agent-name"
description = "Use when: ... . Do NOT use for: ..."
model = "gpt-6.1-terra"
model_reasoning_effort = "medium"
sandbox_mode = "workspace-write"
nickname_candidates = ["Agent Name"]

developer_instructions = '''
# Agent Title

## Agent Workflow (MANDATORY)
... (uses `spawn_agent`, never a Claude-only team-spawn primitive)

## MANDATORY SKILLS USAGE
...

## SOLID Rules
...

## Inherited rules (from AGENTS.md)
...

## Local Documentation
...

## Quick Reference
...
'''

[[skills.config]]
path = "plugins/<plugin-name>/skills/skill-a/SKILL.md"
enabled = true
```

→ See [required-sections.md](required-sections.md) for section details.

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Plugin folder | kebab-case | `typescript-expert` |
| Agent file | kebab-case.toml | `typescript-expert.toml` |
| Skill folder | kebab-case | `ts-config` |

---

## Plugin Manifest

`.codex-plugin/plugin.json`:

```json
{
  "name": "typescript-expert",
  "version": "1.0.14",
  "description": "Expert TypeScript for pure TS projects...",
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json"
}
```

`plugin.json` does not enumerate individual agent files — every
`agents/*.toml` in the plugin is picked up by the installer automatically,
copied into `~/.codex/agents/` on setup/update. See
[registration.md](registration.md) for the full registration flow.

---

## Best Practices

| DO | DON'T |
|----|-------|
| One agent per plugin (main) | Multiple competing agents with overlapping descriptions |
| Reference `solid-[stack]` skill via `[[skills.config]]` | Duplicate SOLID rules inline |
| Use repo-relative `path` values in `[[skills.config]]` | Hard-code absolute paths |
| Keep `developer_instructions` focused | Put all docs inline instead of in skills |
