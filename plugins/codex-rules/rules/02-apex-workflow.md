## APEX — backbone of every code request

APEX is the AGENTS.md COORDINATOR PATH applied to code. The full methodology lives in `$ai-pilot:apex-methodology`, not here.

**USE APEX:** create, implement, add, build, refactor, migrate, fix, new component, multi-file, architecture changes
**Trivial 1-3 line change:** `/apex-quick` — one delegated agent; it skips Brainstorm, the Analyze trio and the team split, but still runs eLicit, a real functional check (an executed build/test/run, not linter-only) and sniper (owner decision 2026-11-08).
**No APEX:** questions, read-only lookups (`explore-codebase` alone), simple read-only git. Every edit is still made by one delegated agent, never by the lead (sole exception: the 2-failed-delegations rule in `$ai-pilot:lead-orchestration` Follow).
**Debug/Investigation:** "why", "not working", "bug", "crash", "doesn't load" → ALWAYS use Analyze (explore-codebase + research-expert + domain-expert), never straight to a fix

**Shortcuts:** `--skip-elicit` is IGNORED: no option may skip eLicit, Verify or sniper (AGENTS.md "Mandatory skill routes": eLicit and sniper routes) — eXamine/sniper itself is NEVER skippable (00-critical-rules)

## Full APEX Flow

```
Brainstorm → Analyze → Plan → Execute (TDD) → eLicit → Verify → eXamine
```

| Phase | Skill / owner | When |
|-------|---------------|------|
| **Brainstorm** | `brainstorming` | New features, major changes. Skip for trivial fixes, bug fixes with clear repro |
| **Analyze** | explore-codebase + research-expert + domain-expert | Every code request except `/apex-quick` (parallel trio, COORDINATOR PATH 3) |
| **Plan** | update_plan + decompose, distribute, brief (COORDINATOR PATH 4-6; `03-agent-teams`) | Always. Two tasks that must edit the same file are merged or sequenced; files stay within `FUSE_SOLID_MAX_LINES` (default 200) lines |
| **Execute** | Domain expert + `tdd` | Write test FIRST (RED), then code (GREEN), then refactor |
| **eLicit** | Elicitation techniques, by the executing agent | Expert self-review |
| **Verify** | `verification`, checked by the lead with proof by type (COORDINATOR PATH 9) | Run the actual build/tests — a Verify without execution is a guess |
| **eXamine** | sniper, then challenger | ZERO errors; sniper timing per `00-critical-rules` rule 7; challenger before any "done" on a consequential change; a trivial 1-3 line `/apex-quick` change is proven by an executed real check instead |

## sniper 7 Phases (aligned with `plugins/ai-pilot/agents/sniper.toml`)
explore-codebase ∥ research-expert (parallel) -> grep usages -> jscpd DRY scan -> [react-effects-audit if `.tsx`/`.jsx`] -> run linters -> apply fixes -> re-run ALL checks = **ZERO errors**

## eLicit Modes
eLicit is always automatic — no manual or skip mode exists (I3, `lead-orchestration/SKILL.md` §2; `elicitation/SKILL.md`).
- `--auto`: Auto-detect code type -> select elicitation techniques (the only live path)
- `--manual`: legacy flag, IGNORED — superseded by `--auto`, never presents techniques to the user
- `--skip-elicit`: legacy flag, IGNORED — see the Shortcuts line above (no option may skip eLicit, Verify or sniper)
