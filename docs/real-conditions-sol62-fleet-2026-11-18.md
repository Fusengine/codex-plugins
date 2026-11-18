# Real-conditions test: Sol 6.2 fleet matrix on the installed `~/.codex`, 2026-11-18

Scope: the owner's REAL `~/.codex` (not a disposable `CODEX_HOME`), `codex-cli 0.169.0`, no `-m` flag so the config default is exercised. Artifacts: `docs/validation/sol62-real-run/`.

## Setup

| Item | Value |
|---|---|
| Config | `~/.codex/config.toml`: `model = "gpt-6.2-sol"`, `model_reasoning_effort = "medium"` (read, not written) |
| Installed fleet | `~/.codex/agents/*.toml` = new matrix (25 sol/medium, 7 sol/high, 7 terra/medium, 1 terra/high) per lead |
| Command | `codex exec --json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -C <dir> -o <run>.last "<prompt>"` via `sol62-real-run/run.sh <name> <dir>` (prompt in `<name>.prompt`) |
| Models | read from each rollout's `turn_context` under `~/.codex/sessions/2026/11/18/` (`r1.turn_context.jsonl`, `r2.turn_context.jsonl`) |
| Concurrency caveat | the owner's live Codex session (parent thread `01a1e9da`, agents `support_style_pair`, `style_pair_check`) was working in `support-app` during R2; its rollouts and writes are excluded below |

## R1 fleet load (dir = codex-plugins repo, read-only)

Prompt `r1.prompt`: spawn `explore-codebase`, `challenger`, `cartographer` in parallel, list 3 files under `scripts/lib`, no writes.

| Agent | Tier | Expected | Observed (turn_context) | Tokens in / cached / out |
|---|---|---|---|---|
| parent (coordinator) | config default | gpt-6.2-sol / medium | gpt-6.2-sol / medium | 761,338 / 681,088 / 1,170 |
| explore-codebase | DEFAULT | gpt-6.2-sol / medium | gpt-6.2-sol / medium | 158,954 / 105,216 / 111 |
| challenger | JUDGE | gpt-6.2-sol / high | gpt-6.2-sol / high | 108,330 / 53,888 / 153 |
| cartographer | NON_CORE | gpt-6.1-terra / medium | gpt-6.1-terra / medium | 101,778 / 50,688 / 82 |

Wall time 62 s, exit 0, no "capacity" string in `r1.jsonl`/`r1.stderr`. Only warnings: `[features].multi_agent` deprecated, and `bypass_hook_trust` ignored in `~/.codex/config.toml`. All three children listed 3 files (`agent-adapter.ts`, `agent.types.ts`, `py-rules.ts`). No file written. **Verdict: PASS (4/4 model+effort match).**

## R2 design (design-expert, support-workbench redo)

Four attempts' worth of evidence, three runs (`r2`, `r2b`, `r2c`):

| Run | cwd | Wall | Parent in/cached/out | design-expert (sol/high) in/cached/out | Outcome |
|---|---|---|---|---|---|
| r2 | `support-app` (read-only) | 596 s | 4,259,601 / 4,138,496 / 5,900 | 2,987,796 / 2,823,296 / 23,225 | No HTML. Harness design-pipeline gate: "cannot write ...sol62.html before the design-system pipeline is complete (phase 1/3, design-system.md not validated, not found on disk)" |
| r2b | `support-app` (read-only), design-system.md allowed in output folder | 198 s | 1,709,480 / 1,613,184 / 3,580 | 1,279,151 / 1,171,840 / 4,846 | No files. The gate looked for `design-system.md` at the root of `support-app`, which the mandate forbids writing; design-expert stopped |
| r2c | scratch copy `sol62-real-run/workdir` (design inputs copied: `docs/design`, both `design-system.md`, `src/styles.css`, the 2 "before" PNGs) | 1340 s | 8,121,674 / 7,979,520 / 7,378 | 10,954,481 / 10,711,552 / 34,968 | design-system.md validated, HTML written, offline Chromium QA done by the agent |

Models (r2c, from rollout): parent gpt-6.2-sol/medium; design-expert gpt-6.2-sol/high (2 turn_contexts, both high); children `challenger` gpt-6.2-sol/high (978,152 in / 905,472 cached / 3,116 out) and `sniper` gpt-6.2-sol/high (986,453 / 910,720 / 4,247) were spawned by the coordinator on its own. r2 and r2b design-expert also gpt-6.2-sol/high. No capacity errors in any run (`grep -ci capacity` = 0 on `r2.jsonl`, `r2.stderr`; `r2b`/`r2c` stderr clean apart from the deprecation warnings).

Deliverables:
- `sol62-real-run/support-workbench-sol62.html` (36,041 bytes; copy of `workdir/support-workbench-sol62.html`) and `design-system.md`.
- Captures rendered by me with headless Chrome (`--headless=new --screenshot --window-size=1366,900`, URL hash `#inbox-light`, `#overview-dark`; the hash routing works): `after-inbox-light.png`, `after-overview-dark.png`. "Before" copies: `before-inbox-light.png`, `before-overview-dark.png` (from `support-app/docs/previews/support-workbench-{inbox-light,overview-dark}.png`).

Visual read of the two "after" captures (I opened them): layered surfaces (raised detail card with shadow, recessed tabs/search, tinted selected row linked to the detail pane by a connector line, which is the "Ticket Lens" signature), a 38px title scale, big "4 / 2" counters with accent in the dark overview. It has visibly more depth than a flat page, but the final judgement of "no longer flat" is the owner's; I did not compare pixel by pixel against the "before".

## Deviations and errors

1. R2 was specified with cwd = `support-app`; two runs in that cwd failed on the design-pipeline gate that demands `design-system.md` at the cwd root. R2c used a scratch copy of the design inputs as cwd (inside `sol62-real-run/workdir`). The model/effort proof is unaffected; the "uses the project's existing tokens" part is true only for the copied files.
2. `support-app` was NOT written by my runs. Its git status was 33 entries before R2 and 34 after because another live Codex session wrote `docs/directions-support/**`, `.codex/apex/prd/support-design-comparison-prd.json`, `docs/decisions.md` (parent thread `01a1e9da`). Harness side effects of my r2/r2b runs in that cwd: `.harness/cache/*`, `.cartographer/project/**` (mtime 01:41-01:44). I cannot separate `.codex/apex/prd.json` (mtime 01:42:43) with certainty. Nothing was deleted.
3. In R2c the agent reported that a cleanup hook blocked deleting its QA captures; they remain in `workdir/workbench-review-tmp/` (8 PNGs).
4. Each design-expert hook-gated flow is expensive: r2c = 10.95M input tokens (97.8% cached) for the design-expert alone, about 21 M total for the run; R1 trivial fan-out cost 1.13M input tokens, mostly parent context (761k).

## Not verified

- That the redo is judged not flat by the owner; only my own look at two captures.
- Light/dark and inbox/overview hashes other than the two captured (agent reports checking all four, I rendered two).
- Responsive layouts (only 1366x900 captured).
- Model attribution for Codex's Desktop-app-spawned rollouts at `01-43-00` and `01-50-06` (belong to the other session, excluded).
- Whether the design-pipeline gate should honour the cwd or an explicit output folder (harness behaviour, not changed).

## Files written

`docs/validation/sol62-real-run/`: `run.sh`, `r1.{prompt,jsonl,last,stderr,rc,turn_context.jsonl}`, `r2.*`, `r2b.*`, `r2c.*` (same pattern), `r2.turn_context.jsonl`, `support-workbench-sol62.html`, `design-system.md`, `{before,after}-*.png`, `workdir/**`; and this report. No secrets: `.jsonl` event logs contain prompts and tool output only, no env/auth values were requested; not grepped for tokens beyond that.
