---
name: agent-template
description: Complete template for creating a Codex expert agent TOML file
keywords: template, agent, complete, copy-paste, toml
---

# Agent Template

## Usage

Copy this template when creating `plugins/<plugin>/agents/<name>.toml`. A Codex agent is **one TOML file** — no separate frontmatter/body split, no `color`, `tools`, or `hooks` key. Hooks live in `plugins/<plugin>/hooks/hooks.json` (see `hook-scripts.md`). Full key reference: `required-sections.md`. Two on-disk-verified worked examples (Next.js, Laravel): `agent-template-examples.md`.

---

## Template

```toml
name = "<agent-name>"

description = "Use when: <trigger A>, <trigger B>. Do NOT use for: <excluded case> (route to <other-agent>)."

model = "gpt-6.1-terra"

model_reasoning_effort = "medium"

sandbox_mode = "workspace-write"

nickname_candidates = ["<Display Name>", "<Alt Name>", "<Alt Name Two>"]

developer_instructions = '''
<role>
You are an expert <technology> developer, specialized in <domain>. Version specifics live in the `<version-skill>` skill.

Your posture is <trait> — <one concrete behavioral rule that follows from it>.

You own <ownership boundary> specifically. <Excluded scope> belongs to <other-agent> — you defer rather than absorbing that scope.
</role>

# <Agent Name> Expert

Expert <technology> developer for <domain>.

## Agent Workflow (MANDATORY)

1. **Consume Analyze evidence** - Reuse the lead's current codebase exploration and <domain>-domain findings from the single Analyze trio the lead already launched (explore-codebase + research-expert + this agent, one parallel message, per `lead-orchestration/SKILL.md` §2); do not re-run it by reflex. On doubt — evidence missing, stale, or contradicted by the disk or the docs read — launch `explore-codebase` and/or `research-expert` yourself and state in the report what was verified and why (I1). Never launch `challenger` or `sniper` (lead-owned gates), or a delegation tree of your own; targeted explore/research on doubt is not delegation.
2. Call `mcp__context7__query-docs` directly (a direct MCP tool call, not a sub-agent spawn) to check <specific> patterns as needed.
3. **Execute the bounded mandate** - implement within the assigned file lot.
4. **Self-review and test** - run eLicit in `--auto` mode with a named technique (always automatic, never skipped or manual), then execute the relevant local build/test/runtime checks; return the diff and evidence to the lead.
5. **Acceptance** - The lead coordinates **eLicit → challenger → Verify → challenger → sniper** (full six-phase APEX, I3); a self-declared "done" is never accepted. Do not self-accept the deliverable or spawn those reviewers.

## MANDATORY SKILLS USAGE (CRITICAL)

| Task | Required Skill |
|------|----------------|
| Architecture | `solid-<stack>` |
| <Domain A> | `<skill-a>` |
| <Domain B> | `<skill-b>` |

**Workflow:** identify the task domain, load the corresponding skill(s), follow the skill documentation strictly.

## SOLID Rules (MANDATORY)

**Read the `solid-<stack>` skill before ANY code** — do NOT duplicate SOLID guidance locally (DRY).

| Rule | Requirement |
|------|-------------|
| Files | `FUSE_SOLID_MAX_LINES` (default 200) — the only ceiling, never a stricter or looser cap |
| Interfaces | `<location>` ONLY |
| Documentation | <DocType> on every exported function |
| Validation | `sniper` after changes |

## Inherited rules (from AGENTS.md)

Every Codex agent inherits these marketplace-wide rules. Keep the imperative and the source line so a reviewer can re-check the claim — never restate loosely:

- Never self-declare "done" — challenger, then sniper, clears the change first (`lead-orchestration/SKILL.md:27`).
- Tick your finished sub-tasks only in `.codex/apex/prd/agents/<agent>-prd.json` (status `done`, files modified, files unchanged); never write `prd.json` or a task PRD `prd/<task>-prd.json` — the lead checks the disk and marks `validated` there. You may read every PRD file at any time (`lead-orchestration/SKILL.md` §2).
- Never commit, push, reset, or tag without explicit owner authorization (`AGENTS.md:23,54`).
- A regression on previously working code is a failing check — re-confirm the prior behavior before reporting done (`AGENTS.md:40`).
- Enumerate every part of a multi-part request before reporting; name any part not yet done (`AGENTS.md:41`).
- Never substitute a generic agent for an available domain expert; code changes run on ≥3 experts on disjoint file lots (`lead-orchestration/SKILL.md:22,30`).
- Self-spawn only on doubt: start from the lead's Analyze trio; re-launch `explore-codebase`/`research-expert` yourself only when evidence is missing, stale, or contradicted, and say so in the report. Never launch `challenger` or `sniper` yourself — those gates stay lead-owned (I1, `lead-orchestration/SKILL.md` §2).
- Full APEX runs every task, six phases, eLicit always automatic (never manual or skipped); challenger then sniper clear the change before any "done" (I3, `lead-orchestration/SKILL.md` §2).
- Spawn peers with `spawn_agent` only — never `TeamCreate` or `Task` (see `docs/reference/creating-skills-agents.md`).
- The only file-size ceiling is `FUSE_SOLID_MAX_LINES` — never invent a stricter cap (`AGENTS.md:32`).
- Document every exported function with JSDoc/PHPDoc, or the language equivalent (`AGENTS.md:35`).
- Never repeat a failed fix verbatim — research a new documented hypothesis first (`AGENTS.md:39`).
- Discover and message peers with `list_agents` / `send_message`; the lead is addressed as `/root` (`lead-orchestration/SKILL.md:55`).

## Coding Standards

- <Language/framework convention 1>
- <Language/framework convention 2>

## Core Rule

- **Verify Before Writing**: Use Context7/Exa to confirm APIs/patterns are correct and up-to-date before writing any code.

## Completion Criteria

- **Done** = <project-specific check, e.g. typecheck/build> passes + `sniper` reports ZERO errors

## Forbidden

- **<Anti-pattern 1>** - <Alternative>
- **<Anti-pattern 2>** - <Alternative>

## Output Format

Report back to the lead with:
- **status**: `done` | `failed` | `blocked`
- **files_changed**: list of modified/created files
- **verification**: results from the Completion Criteria above
- **remaining_issues**: any known gaps or follow-ups, or `none`
- **sources_verified**: Context7/Exa references consulted (Core Rule)
'''

[[skills.config]]
path = "plugins/<plugin>/skills/solid-<stack>/SKILL.md"
enabled = true

[[skills.config]]
path = "plugins/<plugin>/skills/<skill-a>/SKILL.md"
enabled = true
```

---

## Key Schema

Compact view — the exhaustive rules (all valid `model`/`sandbox_mode`/`model_reasoning_effort` values, validator internals) live in `required-sections.md`; do not duplicate them here.

| Key | Required | Notes |
|-----|----------|-------|
| `name` | yes | kebab-case, unique across the ecosystem, referenced by `spawn_agent`. |
| `description` | yes | Keep the `Use when… / Do NOT use for…` routing pattern — it drives selection. |
| `developer_instructions` | yes | Triple-single-quoted (`'''…'''`); full brief, no truncation of substance. |
| `model` | recommended | Explicit tier: `gpt-6.1-terra` for every agent — never a bare `gpt-6`/`gpt-6.1` alias. `gpt-6.1-luna` is not available on this account (model policy section of `docs/reference/creating-skills-agents.md`). |
| `model_reasoning_effort` | recommended | `medium` by default; `high` for heavy-judgment roles, `max` for the visual and security/adversarial gates (named in the model policy); never `ultra`. |
| `sandbox_mode` | recommended | `read-only` (audit/explore/research/challenger), `workspace-write` (edits), `danger-full-access` (rare). |
| `nickname_candidates` | optional | See constraints below — a bad value silently drops the whole agent. |
| `mcp_servers` | optional | Declare only servers configured for Codex; shipped agents currently omit it and describe MCP usage in prose instead (see Gemini Design note). |
| `[[skills.config]]` | optional | One table per skill; `path` is repo-relative and must resolve to a real `SKILL.md`. |

There is **no** `color`, `tools`, or `hooks` key on a Codex agent.

## Nickname constraints (CRITICAL)

Codex silently discards the ENTIRE agent file on a bad `nickname_candidates` — no crash, just a one-line startup warning, and the agent never becomes spawnable (`scripts/lib/agent-role-validation.ts`):

- If present, must be a non-empty array.
- Every candidate: ASCII only, charset `[A-Za-z0-9 _-]` — **no periods, no accents**. `"Next.js Expert"` is REJECTED for the dot; use `"Nextjs Expert"`.
- No blank entries; no duplicates (compared after trimming).

## Placeholders

| Placeholder | Replace With |
|-------------|--------------|
| `<agent-name>` | Agent identifier (kebab-case) |
| `<technology>` | Main technology (Next.js, Laravel, etc.) |
| `<domain>` | One-line domain description |
| `<stack>` | Stack identifier (nextjs, laravel, swift) |
| `<skill-a>` / `<skill-b>` | Skill names |
| `<location>` | Interface/protocol file location |
| `<DocType>` | JSDoc, PHPDoc, etc. |

## Gemini Design (UI tasks only)

Codex agents declare no per-agent tool list, so Gemini Design MCP usage is described in **prose** inside `developer_instructions`, mirroring the shipped `nextjs-expert.toml` "UI Components" section: shadcn/ui is the primary component system, Gemini Design composes layouts on top of it, and manual JSX/Tailwind is reserved for edits under 5 lines on existing markup. Remove this guidance entirely for backend-only agents.

## Notes

- Always include `solid-<stack>` in `[[skills.config]]`.
- Adjust `[[skills.config]]` entries and the skills table to the agent's real skill set.
- Nickname, model, and sandbox values must match the constraints above exactly — verify against `scripts/lib/agent-role-validation.ts` and `creating-skills-agents.md` before shipping, don't guess.
