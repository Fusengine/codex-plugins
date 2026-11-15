# Real-conditions test: port-claude-1-40-2 (commit cycle + suggestions), 2026-11-15

Scope: uncommitted working tree of `feat/port-claude-1-40-2` (base HEAD `5830946d`), installed with the real `scripts/install-codex.ts` into a disposable `CODEX_HOME` and run through the real `codex exec`. Raw logs: scratchpad `real1402/logs/` (moved to Trash with the dir at the end).

## Environment

| Item | Value |
|---|---|
| CLI / bun / macOS | `codex-cli 0.169.0`, bun 1.4.4, macOS 27.2.1 |
| Harness | `@fusengine/harness` 0.1.120 (`fusengine.rules`), 94 `[hooks.state]` trusted, `bypass_hook_trust` absent |
| Install | 27 plugins verified, 40 agents, 35 commands; ai-pilot 1.2.63, commit-pro 1.2.40, codex-rules 1.0.39 (cache holds the ported `Suggestion: ... -> gain:` line and the commit.toml real-run gate) |
| Mode | `--dangerously-bypass-approvals-and-sandbox`, `-m gpt-6.1-sol`, `env -i`, `CODEX_HOME` = disposable dir, `FUSE_HARNESS_MARKETPLACES=fusengine-codex` |
| Install method | installer run from an rsync copy of the working tree, pty-driven (`--skip-env`; hooks trusted = yes; others default). `auth.json` copied with `cp`, never read |

Deviations: (1) the installer's "base config" step wrote `approval_policy = "untrusted"` + `sandbox_mode = "read-only"` into the disposable config.toml; Codex 0.169 rejects it (`approval_policy = "untrusted" is no longer supported`, first attempt exit 1, no scenario ran). I set `approval_policy = "never"`, `sandbox_mode = "danger-full-access"`, `model_reasoning_effort = "high"` (owner's real values) in the disposable config only, then ran all three scenarios once. (2) Two earlier install attempts were aborted (pty width 0, then an unanswered model prompt) and trashed. (3) Scenario repos are local only (bare repo as `origin`), so PR/CI/merge via GitHub cannot be exercised.

## Commands

`env -i HOME USER LANG TERM PATH CODEX_HOME=<disposable> FUSE_HARNESS_MARKETPLACES=fusengine-codex timeout 1500 codex exec --json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -m gpt-6.1-sol -C <repo> -o <case>.last "<prompt>"`
Prompts: S1 `fais le cycle de commit` (repo s1), S1b `run the commit cycle` (repo s1b), S2 `analyse ce projet et propose des améliorations, ne modifie rien` (repo s2). S1 and S1b: branch `feat/clamp`, `origin` = local bare repo (only `main`), one uncommitted code change (`clamp()` added to `src/math.ts`, no test for it; an existing `add` test passes). S2: 3-file Node CLI (`index.js`, `package.json`, `README.md`).

## Verdicts

| Case | Verdict | Evidence |
|---|---|---|
| S1 (FR) | **FAIL** (criterion "no further confirmation question") | Lead read `lead-orchestration`, `commit`, `git-flow`, `challenge` skills, ran the existing test, checked `clamp`, then went for the full flow. Real-run gate applied: "Le cycle exige encore une preuve d'exécution via Codex CLI ; le hook a refusé la capture du journal" (the redirect capture was blocked by `bash-write-prompts.ts`, hook text "This shell redirect cannot be auto-approved"). Commit blocked: final message `Pour autoriser la commande bloquée, réponds **CONFIRM d7c7**` (commit command included deletion of its temp message file). Result: only `src/math.ts` staged, no commit, no push. `git log`: `148ded1 chore: init` only; bare origin refs: `main` only, no tags. Also said: "le remote local ne permet pas de PR GitHub". |
| S1b (EN) | **FAIL** (same criterion) | Same path. Quality review made the lead add a one-line JSDoc to `clamp` (reasonable, in scope). Final: `Reply CONFIRM e075 to authorize committing src/math.ts and deleting the temporary commit-message file. Automatic approval review rejected rm "$msg_file" under policy:ask; your AGENTS rules prohibit retrying without explicit approval. Release also remains blocked by missing Codex CLI end-to-end proof and an unresolved GitHub target.` Tree: ` M src/math.ts`, no commit, origin `main` only, no tags. |
| S2 | **FAIL** (format) / PASS (read-only, grounded) | Reply is a prioritised list of 4 grounded improvements (input validation: missing qty gives `NaN`, object instead of array gives `0`, both exit 0, `index.js:8`; no tests; float money `0.1 x 3 = 0.30000000000000004`; README/CLI help). It contains **zero** `Suggestion: ... -> gain: ...` lines. No `brainstorming` agent in the transcript (grep count 1 = only the skill file read). Tracked files unchanged (`git diff --exit-code HEAD` exit 0 inside the run) but `git status` shows untracked `.harness/` (hook cache `cache/<id>.md` + `index.json`, written by the installed harness). |

Partial passes: S1/S1b applied the real-run proof gate (named it, stopped before push/publish), did not use the word "release" in the prompt yet scoped the flow to commit, push, PR, release; no force-push, no protected-branch write. S2 modified nothing tracked.

## Failing causes (not fixed, per non-goals)

1. **Commit blocked by hook, owner confirmation requested.** Both runs: commit agent writes a temp message file and ends the command with `rm "$msg_file"`; the installed harness answered `policy:ask` ("Automatic approval review rejected `rm "$msg_file"`") and the lead relayed a `CONFIRM <code>` request to the owner. The `rm` is generated by the model (no `msg_file` string anywhere under `plugins/`), so the commit.toml / commit skill do not tell the agent to use `git commit -F -`/`-m` without a temp file, or to rename into a scratch dir. A non-interactive owner request therefore stalls at the first commit. Suggested direction for the lead: add to `commit.toml` Step on commit "never create or delete a temp file; pass the message with `-m` or stdin".
2. **Proof capture blocked by hook.** The real-run gate asks for the Codex CLI log; the lead's redirect (`> file`) was refused by `bash-write-prompts.ts` and its search for an alternative (`rg` on the cache, exit 1) found none. The gate therefore cannot be satisfied in a hook-guarded environment unless the commit skill states the allowed capture form (e.g. `-o <scratchpad path>` of `codex exec`, which my own run used successfully).
3. **S2 lead did not run ideas mode.** The installed `lead-orchestration` skill (read by the lead, line 60 and 177) and rule 02 say an "analyse / improve this project" request starts a `brainstorming` ideas pass and that suggestions use `Suggestion: <idea> -> gain: <benefit>`. The format string lives only in `08-subagent-conduct`, `brainstorming` agent/skill and `challenger`; root `AGENTS.md` (installed copy identical to repo, 13267 bytes) has 0 `gain:` occurrences, and the lead answered itself without spawning. Format is not enforced at the lead's final reply.
4. Pre-existing, unrelated to the port: installer default "approval_policy" choice produces a config Codex 0.169 refuses.

## Not verified

- A full commit, push, tag cycle to a bare remote (blocked before commit); PR, CI, merge, release on GitHub (local remote by design).
- Whether the commit passes once the owner types the `CONFIRM` code (not given, not an agent relay).
- Per-child behaviour of `commit` and `challenger` agents: child threads are not in the `--json` stream; only lead output and final messages were read.
- MCP servers not configured (`--skip-env`); models other than `gpt-6.1-sol`; a second run of S2 (output variance not measured, single run each as mandated).

## Isolation proofs

`ls -lT ~/.codex/{config.toml,AGENTS.md,auth.json}` identical before and after: config.toml `Nov 15 11:49:15 2026` (32031 B), AGENTS.md `Nov 10 14:24:35 2026` (12293 B), auth.json `Nov 13 22:03:08 2026` (4250 B); `~/.codex/tmp/arg0-macos` has 3 entries after the run (not counted before; every `codex` call carried `CODEX_HOME`). No `rm` used (trash via `mv`). No GitHub contact. No repo file written except this report. Cleanup of the disposable dir: see lead report.

---

# Run 2 (same day, after fixes: AGENTS.md literal `Suggestion:` line, commit.toml `git commit -F -`, real-run gate via `codex exec -o`)

Method as run 1, fresh disposable `CODEX_HOME` from the CURRENT working tree (rsync copy; installed `commit.toml` holds 2 `git commit -F -` hits, installed `AGENTS.md` holds 1 `gain:` line; 94 hooks trusted). Same installer defect (`approval_policy = "untrusted"` / read-only) fixed in the disposable config only (never, danger-full-access, high). Same `cx.sh` command; prompts S1 `fais le cycle de commit` (repo s1, same fixture), S2 as run 1. S1b not run (S1 did not pass quickly: about 10 min and only partial).

| Case | Verdict | Evidence |
|---|---|---|
| S1 (FR) | **PARTIAL** (improved, not a clean PASS) | No owner confirmation asked: the final message has no `CONFIRM`, no question (the 6 grep hits are the words CONFIRMED/REFUTED in the challenge skill text). Commit made without temp file or `rm`: `44baa25 feat(math): add clamp function` (1 file, +4), `.cartographer/` and `.harness/` excluded from it (they remain untracked; `docs/` also untracked after the run). Push, PR, CI, merge, release not done: origin refs `main` only, no tags, `feat/clamp` not pushed. Final message: "Cycle partiel : commit `44baa25` créé ... Push, PR, CI, fusion et release non effectués : le hook bloque la preuve exigée avant publication ; `origin` pointe aussi vers un dépôt local, non GitHub. Prochaine étape : résoudre ce blocage de validation". Intermediate: "La règle de release exige aussi une preuve d'exécution enregistrée sur disque ... Le push reste bloqué : le hook refuse la création du test temporaire nécessaire à cette preuve." Weak point: the proof need is stated only generically ("preuve d'exécution enregistrée sur disque"), not as the `codex exec -o <file>` command the gate now prescribes; the lead instead tried to create a temporary test file, which a hook refused. Also stopped at push although a push to the local bare origin was possible (the lead said "Le commit et le push ... restent possibles" then did not push). |
| S2 | **FAIL** (format unchanged) | Reply: 4 grounded improvements (`{}` gives 0, missing qty gives `NaN`, both exit 0 at `index.js:6`; float `0.30000000000000004`; targeted tests; usage docs + readable errors) and a recommendation line. Still **zero** `Suggestion: ... -> gain: ...` lines. Read-only respected: `git diff --exit-code HEAD` exit 0, `git status` clean (no `.harness/` this time). The lead read `lead-orchestration` 3 times, ran only `git`/`nl`, no `brainstorming` spawn visible; the literal line in `AGENTS.md` did not change the output shape. |

Cause S2 (observed, not fixed): the instruction is in the installed AGENTS.md but the lead answered in its own prose format; nothing ties the final reply of a read-only "analyse" request to the `Suggestion:` line (the template only says agents are "expected" to bring suggestions). Cause S1 gap: the gate wording reaches the lead but the allowed capture (`-o`) is not turned into an action; a proof that needs a Codex run inside a Codex run was not attempted.

Not verified (run 2): push to the bare origin, PR/CI/merge/release, behaviour of S1b, child-agent internals (not in `--json`), a second S2 sample.

Isolation (run 2): `ls -lT ~/.codex/{config.toml,AGENTS.md,auth.json}` identical before and after: `Nov 15 11:49:15 2026` (32031 B), `Nov 10 14:24:35 2026` (12293 B), `Nov 13 22:03:08 2026` (4250 B). `auth.json` copied with `cp` only. No `rm`; disposable dir moved to `~/.Trash/real1403-port-claude-1-40-2`.
