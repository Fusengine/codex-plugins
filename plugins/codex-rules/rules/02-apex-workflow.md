## APEX Auto-Trigger

**USE APEX:** create, implement, add, build, refactor, migrate, new component, multi-file, architecture changes
**SKIP APEX:** none — every task runs the full APEX workflow, no exceptions (AGENTS.md "Always-on orchestration"); the edit is always made by one delegated agent, never by the lead (sole exception: the 2-failed-delegations rule in `$ai-pilot:lead-orchestration` Follow).
**Debug/Investigation:** "why", "not working", "bug", "crash", "doesn't load" → ALWAYS use Analyze (explore-codebase + research-expert + domain-expert), never straight to a fix

**Shortcuts:** `/apex-quick` command (fast path — Brainstorm may be skipped; Analyze and sniper eXamine are NEVER skipped) | `--skip-elicit` is IGNORED: no option may skip eLicit, Verify or sniper (AGENTS.md "Mandatory skill routes": eLicit and sniper routes) — eXamine/sniper itself is NEVER skippable (00-critical-rules)

## Full APEX Flow

```
Brainstorm → Analyze → Plan → Execute (TDD) → eLicit → Verify → eXamine
```

| Phase | Skill | When |
|-------|-------|------|
| **Brainstorm** | `brainstorming` | New features, major changes. Skip for trivial fixes, bug fixes with clear repro |
| **Analyze** | explore-codebase + research-expert + domain-expert | Always (parallel trio) |
| **Plan** | update_plan + a written mandate per task (one agent per task: files it owns, expected output, criteria) | Always. Two tasks that must edit the same file are merged or sequenced; files stay within `FUSE_SOLID_MAX_LINES` (default 200) lines |
| **Execute** | Domain expert + `tdd` | Write test FIRST (RED), then code (GREEN), then refactor |
| **eLicit** | Elicitation techniques | Expert self-review |
| **Verify** | `verification` | Run the actual build/tests — a Verify without execution is a guess |
| **eXamine** | sniper | Code quality validation (ZERO errors) |

## sniper 7 Phases (aligned with `plugins/ai-pilot/agents/sniper.toml`)
explore-codebase ∥ research-expert (parallel) -> grep usages -> jscpd DRY scan -> [react-effects-audit if `.tsx`/`.jsx`] -> run linters -> apply fixes -> re-run ALL checks = **ZERO errors**

## eLicit Modes
eLicit is always automatic — no manual or skip mode exists (I3, `lead-orchestration/SKILL.md` §2; `elicitation/SKILL.md`).
- `--auto`: Auto-detect code type -> select elicitation techniques (the only live path)
- `--manual`: legacy flag, IGNORED — superseded by `--auto`, never presents techniques to the user
- `--skip-elicit`: legacy flag, IGNORED — see line 7 above (no option may skip eLicit, Verify or sniper)
