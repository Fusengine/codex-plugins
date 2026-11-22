## APEX — backbone of every code request

APEX is the AGENTS.md COORDINATOR PATH applied to code. The full methodology lives in `$ai-pilot:apex-methodology`, not here. Scope (read-only → `explore-codebase` alone, code → Analyze trio, trivial 1-3 line → `/apex-quick`) is owned by AGENTS.md ROUTING; every edit goes to a delegated agent (AGENTS.md "Total delegation", sole exception there).

**USE APEX:** create, implement, add, build, refactor, migrate, fix, new component, multi-file, architecture changes.
**Trivial 1-3 line change:** `/apex-quick` — one delegated agent; it skips Brainstorm, the Analyze trio and the team split, but still runs eLicit, a real functional check (an executed build/test/run, not linter-only) and sniper (owner « Version Claude », 2026-11-08; ported in commit 088e99f9). Its challenger replacement: "Mandatory skill routes" first line.
**No APEX:** questions, read-only lookups (`explore-codebase` alone), simple read-only git.
**Debug/Investigation:** "why", "not working", "bug", "crash", "doesn't load" → ALWAYS the Analyze trio (explore-codebase + research-expert + domain-expert), never straight to a fix. A diagnosis-only request runs the trio with WRITE: none and modifies no file until the owner uses a fix verb (fix, repair, change, implement…).

## Mandatory skill routes
Lead-orchestration and commit routes: AGENTS.md HARD STOPS 0-1. SOLID route: `04-solid-dry-rules`. Memory route: `06-tooling-rules`. This section is the single owner of the challenger and sniper gates; other files point here.
- Trivial 1-3 line `apex-quick` change (read this first — it is the only exception to the gates below): only for its done/verified claim and its eLicit and Verify gates, the challenger is replaced by an executed real check (an actual test, build, or launch) with its output cited. A root-cause claim, an irreversible action, a second attempt, or the change turning out consequential still requires the challenger. `--skip-elicit` stays ignored, and eLicit `--auto` and sniper are still mandatory. Full APEX keeps the challenger at eLicit and Verify (ported from the Claude template in commit 088e99f9, 2026-11-09; no dated entry in `docs/decisions.md`).
- Create, build, implement, fix, refactor, debug, or any other non-trivial change: MUST fully read and follow `$ai-pilot:apex-methodology`.
- Before proposing any idea, and for current facts or versions, uncertain APIs, or technical claims: MUST challenge it through both `$ai-pilot:research` and `$ai-pilot:fuse-browser-usage` and consult documentation afresh for the current mandate; cross-check the fuse-browser fast path, official docs/Context7, and Exa (tools: `06-tooling-rules`); cached or prior research is not a substitute; docs over memory; unresolved means say "I don't know."
- After Execute: MUST fully read and run `$ai-pilot:elicitation` in `--auto` mode, then `$ai-pilot:challenge`; never ask the user to choose a technique, and ignore `--skip-elicit` or any option meant to drop eLicit, Verify, or sniper.
- Before any root-cause conclusion, done/verified claim on a consequential change (several files or a behaviour change), irreversible action (commit/deploy/rm/push), second attempt, and at every eLicit or Verify gate of full APEX: MUST fully read and follow `$ai-pilot:challenge` and run the challenger in a fresh context; verdict CONFIRMED / REFUTED / UNCERTAIN, and a REFUTED is resolved or owner-accepted before the claim reaches the owner. On a new feature or behaviour change it also runs a product lens (coherence, usability, consistency) after the verdict, never changing it; skipped on bug fixes and refactors (`plugins/ai-pilot/agents/challenger.toml`).
- Functional completion: MUST fully read and follow `$ai-pilot:verification`, execute the relevant checks, then run `$ai-pilot:challenge`.
- After any code, config, or documentation modification: only after eLicit + challenger and Verify + challenger, MUST fully read and follow `$ai-pilot:code-quality` and run the sniper agent; no routed option may drop these gates. Timing: sniper runs ONCE per mandate, after every executor has finished and its deliverable is verified on disk (a single-agent change: right after that agent) — never one sniper per task, per gate, or per retry; a fix sniper itself applies is covered by its own re-run of all checks.
- **Gate order (stated once here):** Execute → writers frozen, deliverables verified on disk (`03-agent-teams` rule 16) → eLicit `--auto` → challenger → Verify (executed checks) → challenger → sniper → challenger before the done claim → challenger before any irreversible action. The lead runs each challenger in a fresh context. Every gate runs; none is merged away. The same lead-run challenger verdict on the same frozen diff (nothing edited since) is cited, never re-run; an executor's own self-challenge (`08-subagent-conduct`) never replaces the lead's fresh-context challenger. Any edit after a verdict invalidates it: the next gate re-runs. A read-only "why" question (WRITE: none) has no eLicit/Verify/sniper gate; its root-cause claim, and any second attempt, still get the challenger per the trigger list above. Commits: one WIP commit per verified task (`06-tooling-rules` "WIP mode"), never one per gate.

## Full APEX Flow

```
Brainstorm → Analyze → Plan → Execute (TDD) → eLicit → Verify → eXamine
```

| Phase | Skill / owner | When |
|-------|---------------|------|
| **Brainstorm** | agent `brainstorming` | Required for new features and major changes — a new feature, page, section, or component launches `brainstorming` (design mode) in the SAME message as the Analyze trio, no exception; ideas mode on any "analyse / improve this project" request. Skip only for trivial fixes and bug fixes with clear repro |
| **Analyze** | explore-codebase + research-expert + domain-expert | Every code request except `/apex-quick` (parallel trio, COORDINATOR PATH 3) |
| **Plan** | update_plan + decompose, distribute, brief (COORDINATOR PATH 4-6; `03-agent-teams`) | Always. Two tasks that must edit the same file are merged or sequenced; files stay within `FUSE_SOLID_MAX_LINES` (default 200) lines |
| **Execute** | Domain expert + `tdd` | Write test FIRST (RED), then code (GREEN), then refactor |
| **eLicit** | Elicitation techniques, by the executing agent | Expert self-review |
| **Verify** | `verification`, checked by the lead with proof by type (COORDINATOR PATH 9) | Run the actual build/tests — a Verify without execution is a guess. An owner-named reference (site, file, mockup) is compared section by section inside this same cycle; a gap goes back to the same executor as a targeted fix, never a new full cycle. A UI is verified against its reference bar before done — the owner-named reference, else 2 named same-domain references — by section-by-section screenshot comparison at the same viewport, light + dark; any section worse than the bar = not done (`05-frontend-rules`) |
| **eXamine** | sniper, then challenger | ZERO errors; order and exceptions: "Mandatory skill routes" above |

## sniper 7 Phases (aligned with `plugins/ai-pilot/agents/sniper.toml`)
explore-codebase ∥ research-expert -> grep usages -> jscpd DRY scan -> [react-effects-audit if `.tsx`/`.jsx`] -> run linters -> apply fixes -> re-run ALL checks = **ZERO errors**. Phase 1 reuses this mandate's Analyze evidence while it is fresh (`08-subagent-conduct` "Evidence reuse"); explore-codebase / research-expert are launched only when that evidence is missing, stale, or contradicted by the diff.

## eLicit Modes
eLicit is always automatic — no manual or skip mode exists (`$ai-pilot:elicitation`).
- `--auto`: Auto-detect code type -> select elicitation techniques (the only live path)
- `--manual`: legacy flag, IGNORED — superseded by `--auto`, never presents techniques to the user
- `--skip-elicit`: legacy flag, IGNORED — eLicit, Verify and sniper cannot be dropped by any option
