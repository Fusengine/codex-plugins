---
name: registration
description: How to register skills with the plugin manifest and the owning Codex agent
when-to-use: After creating a skill, to make it available
keywords: registration, agent, plugin.json, toml, skills.config, commands
priority: high
related: architecture.md
---

# Skill Registration

## Overview

A skill is exposed in TWO places:
1. The plugin manifest loads every skill folder under `skills/`
2. The owning agent `.toml` enables it with a `[[skills.config]]` entry

---

## Step 1: Plugin Manifest

The manifest points at the whole `skills/` directory, so a new folder `skills/<skill-name>/SKILL.md` is picked up without listing it:

**Location**: `plugins/<plugin>/.codex-plugin/plugin.json`

```json
{
  "name": "<plugin>",
  "skills": "./skills/"
}
```

### Important

| Rule | Reason |
|------|--------|
| Folder under `skills/` | The manifest loads that directory |
| `SKILL.md` at folder root | Entry file of the skill |
| Never list skills individually | `"skills": "./skills/"` already covers them |

---

## Step 2: Owning Agent `.toml`

Append a `[[skills.config]]` table to the agent that should use the skill:

**Location**: `plugins/<plugin>/agents/<agent>.toml`

```toml
[[skills.config]]
path = "plugins/<plugin>/skills/NEW-SKILL-NAME/SKILL.md"
enabled = true
```

### Important

| Rule | Reason |
|------|--------|
| `path` is repo-relative | Same form as every sibling entry: `plugins/<plugin>/skills/<name>/SKILL.md` |
| Points at `SKILL.md` | Not the folder |
| `enabled = true` | Entry is ignored otherwise |
| One table per skill | `[[...]]` is a TOML array of tables |

---

## Commands

Commands need no registration: every `plugins/<plugin>/commands/*.md` is auto-discovered and copied as a Codex custom prompt (`scripts/lib/commands.ts`).

---

## Verification

After registration, verify:

| Check | Command |
|-------|---------|
| TOML parses | `bun -e "Bun.TOML.parse(await Bun.file('<agent>.toml').text())"` |
| Path exists | `test -f plugins/<plugin>/skills/<name>/SKILL.md` |
| Skill loads | Invoke `$<plugin>:<skill-name>` in a session |

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Skill not found | Folder not under `skills/` or no `SKILL.md` | Move it / add `SKILL.md` |
| Agent does not use it | No `[[skills.config]]` entry | Add the entry to the agent `.toml` |
| Entry ignored | Wrong `path` or `enabled` missing | Fix the repo-relative path, set `enabled = true` |

---

## Example Registration

### For a new `tanstack-query` skill in `react-expert`:

**1. Skill folder**: `plugins/react-expert/skills/tanstack-query/SKILL.md` (loaded by `"skills": "./skills/"`).

**2. Agent** (`plugins/react-expert/agents/react-expert.toml`):
```toml
[[skills.config]]
path = "plugins/react-expert/skills/tanstack-query/SKILL.md"
enabled = true
```

---

## Related Skills Registration

If skill has `related-skills:` in frontmatter:

```yaml
related-skills: skill-a, skill-b
```

Ensure those skills exist under `skills/` and are enabled on the agents that need them.

---

## Checklist

- [ ] Folder `skills/<name>/SKILL.md` exists under the plugin
- [ ] `[[skills.config]]` entry added to the owning agent `.toml`
- [ ] `path` matches the folder exactly, `enabled = true`
- [ ] Related skills are registered
- [ ] Agent TOML parses and the skill loads
