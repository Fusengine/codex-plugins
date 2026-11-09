## APEX — backbone of every code request

APEX is the AGENTS.md COORDINATOR PATH applied to code. The full methodology lives in `$ai-pilot:apex-methodology`, not here.

**USE APEX:** create, implement, add, build, refactor, migrate, fix, new component, multi-file, architecture changes
**Trivial 1-3 line change:** `/apex-quick` — one delegated agent; it skips Brainstorm, the Analyze trio and the team split, but still runs eLicit, a real functional check (an executed build/test/run, not linter-only) and sniper (owner decision 2026-11-08).
**No APEX:** questions, read-only lookups (`explore-codebase` alone), simple read-only git. Every edit is still made by one delegated agent, never by the lead (sole exception: the 2-failed-delegations rule in `$ai-pilot:lead-orchestration` Follow).
**Debug/Investigation:** "why", "not working", "bug", "crash", "doesn't load" → ALWAYS use Analyze (explore-codebase + research-expert + domain-expert), never straight to a fix

**Shortcuts:** `--skip-elicit` is IGNORED: eLicit, Verify and sniper cannot be skipped by any option ("Mandatory skill routes" below: eLicit and sniper routes) — eXamine/sniper itself is NEVER skippable (00-critical-rules)

## Mandatory skill routes
Lead-orchestration and commit routes: AGENTS.md HARD STOPS 0-1. SOLID route: `04-solid-dry-rules`. Memory route: `06-tooling-rules`.
- Create, build, implement, fix, refactor, debug, or any other non-trivial change: MUST fully read and follow `$ai-pilot:apex-methodology`.
- Before proposing any idea, and for current facts or versions, uncertain APIs, or technical claims: MUST challenge it through both `$ai-pilot:research` and `$ai-pilot:fuse-browser-usage` and consult documentation afresh for the current mandate; cross-check the fuse-browser fast path, official docs/Context7, and Exa; cached or prior research is not a substitute; docs over memory; unresolved means say "I don't know."
- After Execute: MUST fully read and run `$ai-pilot:elicitation` in `--auto` mode, then `$ai-pilot:challenge`; never ask the user to choose a technique, and ignore `--skip-elicit` or any option skipping eLicit, Verify, or sniper.
- Before any root-cause conclusion, done/verified claim on a consequential change (several files or a behaviour change), irreversible action, second attempt, and at every eLicit or Verify gate of full APEX: MUST fully read and follow `$ai-pilot:challenge` and run the challenger.
- Functional completion: MUST fully read and follow `$ai-pilot:verification`, execute the relevant checks, then run `$ai-pilot:challenge`.
- After any code, config, or documentation modification: only after eLicit + challenger and Verify + challenger, MUST fully read and follow `$ai-pilot:code-quality` and run the sniper agent; no routed option may skip these gates. Timing: a single-agent change gets sniper right after that change; several agents get one sniper pass, after all of them have finished and their deliverables are verified on disk.
- Trivial 1-3 line `apex-quick` change (owner decision 9): only for its done/verified claim and its eLicit and Verify gates, the challenger is replaced by an executed real check (an actual test, build, or launch) with its output cited. A root-cause claim, an irreversible action, a second attempt, or the change turning out consequential still requires the challenger. `--skip-elicit` stays ignored, and eLicit `--auto` and sniper are still mandatory. Full APEX keeps the challenger at eLicit and Verify.

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
- `--skip-elicit`: legacy flag, IGNORED — see the Shortcuts line above (eLicit, Verify and sniper cannot be skipped by any option)
