---
name: required-sections
description: Mandatory content sections inside an agent's developer_instructions
when-to-use: Writing developer_instructions after the TOML keys are set
keywords: sections, mandatory, workflow, skills, solid, inherited-rules
priority: high
related: frontmatter.md, architecture.md
---

# Required Sections

## Overview

A Codex agent has no separate "file body" — every mandatory section below is
Markdown content INSIDE the `developer_instructions` triple-quoted string of
the agent's `.toml` file (see [frontmatter.md](frontmatter.md)).

---

## Section Order

1. Agent Workflow (MANDATORY)
2. MANDATORY SKILLS USAGE
3. SOLID Rules
4. Inherited rules (from AGENTS.md)
5. Local Documentation
6. Quick Reference
7. Gemini Design (UI agents only)
8. Forbidden Patterns

---

## 1. Agent Workflow (MANDATORY)

```markdown
## Agent Workflow (MANDATORY)

1. **Consume Analyze evidence** - reuse the lead's current codebase exploration
   and domain findings from the single Analyze trio the lead already launched
   (explore-codebase + research-expert + this agent, one parallel message,
   `lead-orchestration/SKILL.md` step 3 "Analyze"); do not re-run it by
   reflex. On doubt — missing, stale, or contradicted evidence — launch
   `explore-codebase` and/or `research-expert` yourself and record what/why
   in the report (I1). Never spawn executors, teammates, or a delegation tree
   of your own; the only helpers you may launch for your own task, when the
   depth limit allows (`agents.max_depth`, else ask `/root`), are
   `research-expert`, `explore-codebase`, `challenger`, `sniper` (owner
   decision 10), and they never replace the lead's Control gates.
2. Call `mcp__context7__query-docs` directly (a direct MCP tool call, not a
   spawned agent) to confirm [specific] patterns against the official docs.
3. Self-review with eLicit in `--auto` mode (always automatic, never manual
   or skipped, I3), then return the diff and evidence to the lead, which
   coordinates eLicit → challenger → Verify → challenger → sniper.
```

Do not reference Claude Code's old multi-agent spawn command or its built-in
orchestration tool by name — Codex agents only carry `spawn_agent`. Per I1,
this agent never spawns executors or teammates; it launches explore-codebase
or research-expert itself only on stated doubt, never by reflex, and the only
helpers it may launch for its own task, when the depth limit allows
(`agents.max_depth`, else ask `/root`), are `research-expert`,
`explore-codebase`, `challenger`, `sniper` (owner decision 10) — they never
replace the lead's Control gates.

---

## 2. MANDATORY SKILLS USAGE

```markdown
## MANDATORY SKILLS USAGE (CRITICAL)

**You MUST use your skills for EVERY task.**

| Task | Required Skill |
|------|----------------|
| Architecture | `solid-[stack]` |
| [Domain A] | `skill-a` |
| [Domain B] | `skill-b` |

**Workflow:**
1. Identify the task domain
2. Load the corresponding skill(s)
3. Follow skill documentation strictly
```

---

## 3. SOLID Rules

```markdown
## SOLID Rules (MANDATORY)

**See `solid-[stack]` skill for complete rules.**

| Rule | Requirement |
|------|-------------|
| Files | Respect `FUSE_SOLID_MAX_LINES` (default 200) — never invent a stricter or looser cap |
| Interfaces | `[location]` ONLY |
| Documentation | JSDoc/PHPDoc on every exported function |
| Validation | `sniper` after changes |
```

`FUSE_SOLID_MAX_LINES` is the **only** authority on file-size ceiling. If a
legitimate fix cannot fit under it, the agent reports the blocker to the
owner — who tunes the variable at runtime — instead of skipping the fix or
working around the limit.

---

## 4. Inherited rules (from AGENTS.md)

Every generated agent inherits a fixed set of ecosystem rules it cannot
override. State them explicitly so the agent does not have to infer them from
the injected context:

```markdown
## Inherited rules (from AGENTS.md)

- **Workflow**: reach other agents through `spawn_agent`; there is no
  Claude-only team-spawn command in Codex.
- **Self-spawn only on doubt**: start from the lead's Analyze trio; re-launch
  `explore-codebase`/`research-expert` yourself only when evidence is
  missing, stale, or contradicted — state it in the report. Never spawn
  executors or teammates; the only helpers allowed for your own task, when
  the depth limit allows, are `research-expert`, `explore-codebase`,
  `challenger`, `sniper` (owner decision 10; `lead-orchestration/SKILL.md`
  step 7 "Launch").
- **Never self-declare done**: every task runs APEX, eLicit always
  automatic; every deliverable is reviewed by `challenger` then validated by
  `sniper` before the lead accepts it (I3), except the trivial 1-3 line
  `apex-quick` change (one delegated agent), cleared by an executed real
  check with its output cited instead of the challenger (owner decision 9;
  `lead-orchestration/SKILL.md` steps 3 "Analyze" and 10 "Control").
- **Report**: tick finished sub-tasks only in
  `.codex/apex/prd/agents/<your-agent-name>-prd.json` (status `done`, files
  modified, files unchanged); never write `prd.json` or a task PRD
  `prd/<task>-prd.json` — the lead checks the disk and marks `validated`
  there. Read every PRD file freely at any time.
- **Never commit**: no commit/push/reset/branch/tag/merge without the owner's
  explicit order — read-only git is always allowed.
- **Regression = failure**: re-confirm pre-change behavior still holds before
  reporting completion.
- **Collaborate via messages**: discover peers with `list_agents`, coordinate
  with `send_message` — never assume another agent's state.
- **File-size ceiling**: `FUSE_SOLID_MAX_LINES` only (see SOLID Rules above).
```

Traceability for maintainers of this reference (not required inside the
generated agent body itself): `spawn_agent` / no team-spawn primitive —
`docs/reference/creating-skills-agents.md:142-143`; challenger-then-sniper
before "done" — `plugins/ai-pilot/skills/lead-orchestration/SKILL.md:27`; prd
report path — `SKILL.md:24`; never commit without an order — `AGENTS.md:23`;
regression = failure — `AGENTS.md:40`; `list_agents`/`send_message` —
`SKILL.md:55`; size ceiling — `AGENTS.md:32`.

---

## 5. Local Documentation

```markdown
## Local Documentation (PRIORITY)

**Check local skills first before Context7:**

\`\`\`
skills/[skill-a]/       # Description
skills/[skill-b]/       # Description
\`\`\`
```

---

## 6. Quick Reference

```markdown
## Quick Reference

### [Domain A]

| Feature | Documentation |
|---------|---------------|
| Feature 1 | `skill-a/references/` |
```

---

## 7. Gemini Design (UI Agents)

```markdown
## GEMINI DESIGN MCP (OPTIONAL FOR UI)

**Direct HTML/CSS/JSX generation is the default. Gemini Design MCP is an optional accelerator, never a requirement (rule 05-frontend-rules, design-expert).**

| Tool | Usage |
|------|-------|
| `create_frontend` | Complete views |
| `modify_frontend` | Surgical changes |
| `snippet_frontend` | Isolated components |
```

---

## 8. Forbidden Patterns

```markdown
## Forbidden

- **Using emojis as icons** - Use Lucide React only
- **[Anti-pattern]** - [Alternative]
```

→ See [templates/agent-template.md](templates/agent-template.md) for a complete example.
