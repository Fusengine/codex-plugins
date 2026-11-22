# Doctrine coherence: real A/B, baseline vs new (2026-11-22)

Real Codex CLI runs (`codex-cli 0.171.0`, `gpt-6.2-sol`, effort `medium`, `approval_policy never`), real hooks (94 trusted), 40 agents, each doctrine installed with the real `scripts/install-codex.ts` into its own throwaway `CODEX_HOME`. Project under test: a `cp -c` clone of fiduplex per run. `~/.codex` was never written: `ls -lT` of `config.toml`, `AGENTS.md`, `auth.json`, `agents/` identical before and after (`GUARD OK`).

- **baseline** = `main` at `94691750` (`git archive`, immune to the writers' edits).
- **new** = worktree `docs/doctrine-coherence` (AGENTS.md identical to `plugins/codex-rules/templates/AGENTS.md.template`, rules 00/02/03/06/07/08, lead-orchestration split into SKILL.md + 4 references).
- Reproduce: `BENCH_ROOT=<scratch> bench.sh prepare <label> git:<rev>|dir:<path>`, `bench.sh run <label> <case>`, `results-table.sh <scratch>` (all in this folder; cases in `cases.tsv`).

## Table (1 run per cell)

| case | run | secs | tokens (M) | spawns | challenger | any SKILL.md reads (trunc) | lead-orchestration reads (trunc) | files changed | typo left | final says blocked | stop-words |
|---|---|---|---|---|---|---|---|---|---|---|---|
| T1 | baseline | 492 | 7.6 | astro-expert:1 explore-codebase:3 research-expert:2 sniper:1 | 0 | 8 (1) | 3 (0) | 1 | 0 | false | false |
| T1 | new | 361 | 6.7 | astro-expert:1 commit:1 sniper:1 | 0 | 4 (0) | 1 (0) | 4 | 0 | false | false |
| T2 | baseline | 235 | 4.5 | astro-expert:1 | 0 | 5 (1) | 3 (1) | 0 | -1 | false | false |
| T2 | new | 244 | 3.2 | explore-codebase:1 | 0 | 2 (0) | 1 (0) | 0 | -1 | false | false |
| T3 | baseline | 154 | 3.0 | challenger:1 explore-codebase:1 | 1 | 3 (1) | 2 (1) | 0 | -1 | false | false |
| T3 | new | 254 | 5.6 | astro-expert:1 challenger:2 explore-codebase:1 research-expert:1 | 2 | 2 (0) | 1 (0) | 0 | -1 | false | false |
| T4 | baseline | 976 | 23.8 | astro-expert:1 brainstorming:2 challenger:2 commit:1 design-expert:1 explore-codebase:1 research-expert:1 sniper:1 | 2 | 9 (2) | 3 (2) | 22 | -1 | false | false |
| T4 | new | 972 | 30.6 | astro-expert:3 challenger:3 commit:1 design-expert:1 explore-codebase:1 research-expert:1 sniper:1 | 3 | 5 (0) | 1 (0) | 15 | -1 | false | false |
| T5 | baseline | 150 | 1.4 | explore-codebase:1 | 0 | 2 (1) | 1 (1) | 0 | -1 | false | false |
| T5 | new | 158 | 2.1 | explore-codebase:1 | 0 | 1 (0) | 1 (0) | 0 | -1 | false | false |
| T6* | baseline | 1602 | 49.4 | astro-expert:1 brainstorming:2 challenger:4 commit:1 design-expert:1 explore-codebase:4 research-expert:3 sniper:1 | 4 | 9 (1) | 2 (0) | 27 | -1 | false | false |
| T6* | new | 1270 | 45.4 | astro-expert:1 challenger:4 commit:1 design-expert:2 explore-codebase:1 research-expert:1 sniper:1 | 4 | 8 (1) | 2 (0) | 40 | -1 | false | false |
| T7* | baseline | 851 | 23.6 | astro-expert:1 challenger:2 commit:1 design-expert:2 explore-codebase:1 research-expert:1 sniper:2 | 2 | 6 (2) | 5 (2) | 17 | -1 | false | true |
| T7* | new | 883 | 26.5 | astro-expert:2 brainstorming:2 challenger:1 commit:1 design-expert:1 explore-codebase:1 research-expert:1 sniper:1 | 1 | 6 (1) | 1 (0) | 23 | -1 | false | true |
| T8 | baseline | 281 | 6.2 | astro-expert:1 explore-codebase:1 research-expert:1 sniper:1 | 0 | 6 (1) | 1 (1) | 1 | 0 | false | true |
| T8 | new | 413 | 7.5 | astro-expert:1 sniper:1 | 0 | 6 (0) | 2 (0) | 1 | 0 | false | false |
| T9 | baseline | 892 | 31.3 | astro-expert:1 challenger:3 design-expert:4 explore-codebase:3 research-expert:2 sniper:1 | 3 | 8 (3) | 3 (1) | 28 | -1 | false | false |
| T9 | new | 1129 | 41.5 | astro-expert:1 challenger:2 commit:2 design-expert:2 explore-codebase:1 research-expert:1 sniper:3 | 2 | 10 (2) | 1 (0) | 6 | -1 | false | false |

Totals over the 9 cases: tokens 150.8M baseline vs 169.1M new; wall time 5633 s vs 5684 s; challengers 12 vs 12; lead-orchestration SKILL.md reads 20 (9 truncated) vs 11 (0 truncated); runs with at least one truncated lead-orchestration read 7/9 vs 0/9; lead edits (heuristic) 0 vs 0; "bloqué" in the final answer 0 vs 0.

## Reading by metric

1. **D15 (truncated SKILL.md): confirmed and fixed for the file the doctrine controls.** Baseline lost part of `lead-orchestration/SKILL.md` in 7 of 9 runs; new: 0 of 9, and 11 reads instead of 20. Other skills still truncate in new (`apex-methodology/SKILL.md` and `design-method/SKILL.md` in T6/T7/T9, plus `project-fiduplex`): `apex-methodology` is in doc-skills' scope and still too long for one Codex read.
2. **T1 (apex-quick)**: baseline violated the route (3 explore + 2 research + sniper on a one-word fix); new = 1 astro-expert + sniper, no trio, 0 challenger. The new run also spawned the `commit` agent, which then declined ("catalogue not tracked by Git"): one wasted spawn.
3. **T3 (why = trio, WRITE none)**: baseline skipped the trio (explore + challenger only); new ran the trio, wrote nothing, but added 2 challengers on a read-only answer (cost 3.0M to 5.6M tokens).
4. **T4 / T6 (new feature)**: baseline launched `brainstorming` (2) and the design-expert then astro-expert chain; new launched **no brainstorming** in T4 and T6 (T7 did, 2). The AGENTS.md routing row still says "+ `brainstorming` for a new feature", so this is model variance at N=1, but it is a possible regression to re-run before release.
5. **T7 stop**: both stop (`Je m'arrête`), 0 spawns in turn 2. **T6 redirect (next-turn approximation)**: both redirected to Entreprises and removed the section from Fiduciaires; no stop.
6. **T8 ("je demande à Claude" after a delivery)**: baseline answered « je te laisse voir avec Claude » (mandate abandoned, the D16 defect); new kept the mandate active (reconfirmed the delivered fix, no stop words).
7. **T9 (owner-named reference fusengine.ch)**: both consulted fusengine.ch (11 tool calls baseline, 10 new), so the reference is compared in both; baseline changed 28 files, new 6 files, with 3 sniper and 2 commit agents (more gates, 41.5M vs 31.3M tokens).
8. **Challenger stacking (D4)**: totals equal (12 vs 12); distribution moved (T3 +1, T4 +1, T7 -1, T9 -1). No reduction measured.
9. **Cost**: no saving measured in tokens or time (+12% tokens, wall time flat). Concurrency of up to 9 simultaneous runs makes `secs` noisy.

## T10: owner-named folder, build a tool (loop, in progress)

Prompt: « Crée ici un site web en HTML qui vérifie les DNS au niveau mondial », real folder `/Users/brunoazoulay/Downloads/dossier sans titre/run-<n>/`, fresh `CODEX_HOME` per run from the current worktree doctrine. Evidence: `t10/run-<n>/` (screenshots, `report.json`), rollout under the bench scratch `new-t10-r1/home/sessions/`.

**run-1** (doctrine snapshot 13:23): 897 s, 36.0M tokens, spawns brainstorming 2, explore 1, research 1, design-expert 1, typescript-expert 1 (executor), challenger 2, sniper 1; lead-orchestration SKILL.md reads 2 (1 truncated). Produced `index.html`, `app.js`, `styles.css`, `world.png`. Working tool: real lookup `example.com` type A = « Mesure terminée · 6 sondes » (Globalping API), 6 rows, 6 continents, 0 console error, 0 failed request, desktop and mobile. Mechanical gaps: no `prefers-color-scheme` styles (dark captures identical to light), no test file, hard dependency on one third-party API without fallback, no Asia-South/Middle-East probe.

**Owner verdict on run-1: « mais design horrible ».** My first note ("visuel soigné") was a description of the screenshot, not a judgment, and is refuted by the owner: the design failed even though the gates passed (design-expert spawned, 2 challengers, sniper, a working lookup). Lesson recorded for the doctrine: process gates and a working tool do not prove a design the owner accepts; the audit (design + code) turns this into rules, then run-2 re-tests.

**run-5 (lead medium) vs run-6 (lead high)**, same doctrine (design never-do N1-N18, ledger gate, one independent design review). Evidence `t10/run-5/`, `t10/run-6/`.

| metric | run-5 medium | run-6 high |
|---|---|---|
| duration / tokens (total, lead) | 2131 s / 98.3M, 29.2M | 1871 s / 91.6M, 32.1M |
| spawns | design-expert 3, brainstorming 4, challenger 2, explore 1, research 1, skill-creator 1, sniper 1, typescript-expert 1 | design-expert 2, challenger 3, sniper 3, brainstorming 1, explore 1, research 1, typescript-expert 1 |
| executor report carries N1-N18 ledger | yes (`design-review.md`, all pass) | yes (in the report, 12 pass, 6 n.a.) |
| independent design review | yes; fail N14 (+1 P1), fixed, re-review pass | yes; fail N4/N17 P1, fixed (dated recorded example), re-review pass |
| tests | 7 pass / 0 fail | 8 pass / 0 fail |
| N13-N17 on my captures | pass x5 (consensus line, detail collapsed, no uniform status column, theme-consistent map, labelled example marker + example row at first paint) | N13, N14, N16, N17 pass (summary once, detail collapsed, continents labelled, dated recorded example); N15 doubtful: dark map panel in the light page (executor ledger calls it the cartographic instrument) |
| Verify matrix | invalid: message, no run; nonexistent: « Aucun enregistrement A obtenu (0/6) » + per-probe « Domaine inexistant »; keyboard OK | invalid: message; nonexistent: « Domaine introuvable · NXDOMAIN, 12 sondes »; keyboard OK |
| dark / light | manual toggle (default dark) | `prefers-color-scheme` |
| Globalping quota | no error | one 429 during my captures (shared IP quota); the site showed « Limite Globalping atteinte. Réessayez dans 16 min »; re-captured after the window |

Effort proof: rollout `turn_context.effort` = `medium` (run-5 lead) and `high` (run-6 lead).

## T11: complete app in 30 minutes (final live test)

Prompt: « Crée ici une application de gestion de litiges et de support client, en 30 minutes maximum : livre une application complète qui marche avant la fin. » Folder `/Users/brunoazoulay/Downloads/dossier sans titre/t11-app/`, run-6 home (lead effort high), hard cut 1800 s. Evidence `t11/` (captures + `report.json` from a COPY of the delivered app, run by me on port 3055).

Delivered at 1721 s (28.7 min), before the cut. 74.9M tokens (lead 26.0M). Spawns: explore 1, research 1, brainstorming 1, typescript-expert 2, design-expert 2 (executor + independent review), skill-creator 1, challenger 1, sniper 1. App « Accord » (French, Node 26 + built-in SQLite, no runtime dependency, 8 seeded cases). UI by design-expert, logic and 10 tests by typescript-expert. `node --test` = 10/10, ESLint and `tsc` clean per the lead. Flows clicked by me: create support ticket (201), create dispute (201), change status (200, `in_progress`), assign (200, `Camille Martin`), search « T11 » (2 rows), priority filter urgent (1 row), empty form blocked; 0 console or page errors; desktop and mobile, light and dark.

Gap: the design-expert **executor produced no final N1-N18 ledger** (no ledger or exit line in its messages, no file); the independent review wrote its own register (N10 fail on mobile, fixed, re-review pass, N12/N13/N18 n.a.) and states the executor ledger was not provided.

## 3x bench (T1-T9, old vs new doctrine): partial, stopped by owner commit cycle 22:58

Launched 22:57 with `bench-batch.sh` (3 runs per case per doctrine, both homes effort high + MCP, at most 2 Codex processes, 1800 s per run), aggregated by `bench-agg.sh`. Stopped by the owner's commit-cycle request after only the first pair (T1 run 1, old and new) had started: **no run finished, no 3x result exists**. The single-run baseline vs new comparison above (T1-T9, effort medium, no MCP) remains the only A/B data.

## Caveats (not hidden)

- N=1 per cell; model variance is not measured. Treat single-cell differences (T4 brainstorming, T3 challengers) as signals to re-run, not verdicts.
- T1/T8: the typo does not exist in the real project, so it is planted in the clone (`bench.sh` seed). A first unseeded baseline T1 (the model correctly found nothing to fix) was discarded.
- T2: the 404 does not reproduce in the clone (HTTP 200 on the 10 English pages); neither run exercises the executor path. Not a doctrine signal.
- T6/T7 are **approximations**: the amendment arrives as the next turn through `codex exec resume <thread id>`, not mid-turn (`codex exec` cannot receive input mid-turn).
- `tokens` = sum of the last `token_count` total of every rollout (cached input included); `lead_writes`, `lo_*`, `skill_*` are jq heuristics on rollouts (see `metrics.sh` header); `files changed` is a checksum compare of the clone against the pristine project (noise dirs excluded).
- Not measured: "write outside the workspace without echo", "wrong agent" beyond the spawn lists above.
- Contract tests on the worktree at snapshot time: `agents-md-routing`, `agent-orchestration-contract`, `agents-md-template-identity`, `agent-tier-matrix`, `security-agent-pilot` = 23 pass / 0 fail; full `bun test scripts/lib` = 307 pass / 2 skip / 0 fail.
