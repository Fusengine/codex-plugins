# Real-conditions test: apple-skills-27 change through the real Codex CLI (2026-11-14)

Scope: the uncommitted working tree of branch `docs/apple-skills-27` (change under test: 4 new swift-apple-expert skills, new references, 6 new design-ios references, updated `swift-expert.toml`), installed with the real `scripts/install-codex.ts` into a disposable `CODEX_HOME` and queried through the real `codex exec`. Raw logs stay in the scratchpad (see Isolation).

## Header

| Item | Value |
|---|---|
| CLI | `codex-cli 0.169.0` (session meta of every rollout) |
| Harness loaded | `@fusengine/harness` **0.1.119** in `$A/codex-home/node_modules`; `fusengine.rules` header `harness@0.1.119` |
| Models | lead `gpt-6.1-sol` (`-m`); spawned children `gpt-6.1-terra` (T1, T2, from agent TOML). Read from rollout `turn_context` |
| Mode | `--dangerously-bypass-approvals-and-sandbox`; every rollout shows `approval_policy: never`, `sandbox_policy: danger-full-access` (lead and children) |
| Installed | 27 plugins scanned, `plugin installation verified`, 40 agents, 35 commands, **94 plugin hooks trusted** (`[hooks.state]` entries in config.toml = 94), swift-apple-expert cache version `1.1.40`, ai-pilot `1.2.63` |
| Date | 2026-11-14, 22:21 to 22:27 CET |

`$A` = `/private/tmp/claude-501/-Users-brunoazoulay-Labo-docker-lab-dev-local-Dev-ai-codex-codex-plugins/1806af80-4ee7-4c63-961a-217c6489fa4a/scratchpad/apple27`

## Method and deviations

1. **Installer run from a copy**, as in the 2026-11-11 run: `scripts/install-codex.ts` runs `bun install` inside plugin dirs and writes into the repo, so it ran from `$A/repo` (rsync of the dirty working tree, excluding `.git`, `node_modules`, `portage`; `node_modules` symlinked). The copy contains the uncommitted change (new files verified present in the install cache, below). The real repo was not written by the test.
2. **Disposable `CODEX_HOME`** = `$A/codex-home`; `auth.json` copied with `cp` (mode 600), never read or printed.
3. Installer driven through a pty (`$A/drive-install.py`) with `--skip-env` (avoids writing the owner's shell rc and `~/.codex/.env`). Answers: native re-confirmation = No, trust all hooks = Yes, perf env = No, others skip. MCP servers are therefore not configured (`--skip-env` skips that step); these cases are read-only questions and do not need them.
4. **Run 1 was invalid on one point and was redone.** My driver answered "No" to "Trust all 94 plugin hooks" (config.toml had 0 `[hooks.state]` entries). I fixed the driver (answer `y`), re-ran the installer (config.toml now 94 trusted hooks, `bypass_hook_trust` absent), and re-ran every case. The verdicts below are from run 2 (hooks trusted). Run 1 gave the same answers (kept in `$A/logs/run1-hooks-untrusted/`).
5. Cases run in parallel, each its own `codex exec --json`, in an empty project dir `$A/work`, clean env (`env -i`, `CODEX_HOME` set to the disposable dir for every command; `codex` was never started on a case without it).
6. Command used per case (`$A/cx.sh`): `env -i HOME USER LANG TERM PATH CODEX_HOME=$A/codex-home FUSE_HARNESS_MARKETPLACES=fusengine-codex timeout 900 codex exec --json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -m gpt-6.1-sol -C $A/work -o $A/logs/<case>.last "<prompt>"`.

## Verdicts

| # | Case | Result | Evidence |
|---|---|---|---|
| T1 | StoreKit offer-code sheet from UIKit, iOS 27 | **PASS** | Answer: `AppStore.presentOfferCodeRedeemSheet(from:options:)`, iOS 27.0, full declaration `from viewController: UIViewController, options: Set<RedeemOption> = []`, returns `VerificationResult<Transaction>`; notes `presentOfferCodeRedeemSheet(in: UIWindowScene)` deprecated. Source read from the disposable cache (command_execution, exit 0): `.../codex-home/plugins/cache/fusengine-codex/swift-apple-expert/1.1.40/skills/build-distribution/references/storekit-2026-updates.md`. The file line 37 holds the exact signature. exit=0 |
| T2 | macOS Developer ID certificates | **PASS** | Answer: certificates from the original Sub-CA must be replaced by **Developer ID Certification Authority (G2)** (choose G2 Sub-CA) by **February 1, 2027**; G2 renewed annually; `.pkg` re-sign. Source read (exit 0): `.../swift-apple-expert/1.1.40/skills/macos/references/notarization.md`, which says "stop working on **2027-02-01**; renew from **Developer ID Certification Authority (G2)**" (line 95). exit=0 |
| T3 | Connect Codex to Xcode 27 MCP | **PASS** | Answer: Xcode > Settings > Intelligence > Model Context Protocol > allow external agents (Always / While Xcode is Open), then `codex mcp add xcode -- xcrun mcpbridge`, verify with `codex mcp list`, open the project in Xcode. It noted `mcp-server enable` is a separate beta preview. Source read (exit 0): `.../skills/mcp-tools/SKILL.md` (line 95 holds the codex command). exit=0 |
| T4 | Install proof | **PASS** | See below |
| T5 | Negative control, invented `QuantumSync` framework | **PASS** | Answer: "The swift-apple-expert skills do not cover `QuantumSync` or SwiftData synchronization over Bluetooth mesh. They provide no API name or Swift signature for it". It ran `rg` over the cache (last `rg` exit 1 = no match), invented nothing. exit=0 |

Notes: in T1 and T2 the lead first read `ai-pilot/1.2.63/skills/lead-orchestration/SKILL.md` (AGENTS.md HARD STOP 0) and spawned one child (`gpt-6.1-terra`); T3 and T5 did not spawn. In every case the answer text came from files under the disposable `CODEX_HOME` plugin cache path (no read under `~/.codex`).

## T4 install proof (disposable cache `$A/codex-home/plugins/cache/fusengine-codex`)

- Installer output: `Scanned 27 plugins`, `plugin installation verified`, `Installed 40 agent(s)`, `Symlinked 35 command(s)`, `Trusted 94 plugin hooks`.
- swift-apple-expert `1.1.40/skills` holds **15** skills: apple-frameworks, apple-intelligence, build-distribution, graphics-games, ios, ipados, macos, mcp-tools, media-vision, solid-swift, swift-core, swiftui-core, tvos, visionos, watchos.
- design-expert `design-ios/references` holds the **6 new** files, all present: `app-icons.md`, `app-store-assets.md`, `apple-design-tools.md`, `bars-menus-scroll.md`, `generative-ai.md`, `system-surfaces.md` (11 pre-existing: dynamic-type, handoff-swiftui, ipados-iphone-duo, liquid-glass, macos, mockup, semantic-colors, touch-targets, type-scales-other, viewports, watch-tv-vision).
- Installed agent `$A/codex-home/agents/swift-expert.toml` contains the 4 new skills in two forms: routing lines 102-105 (`apple-intelligence`, `apple-frameworks`, `graphics-games`, `media-vision`) and `[[skills.config]]` entries (lines 187, 191, 195, 199) whose `path` points at the disposable cache `.../swift-apple-expert/1.1.40/skills/<skill>/SKILL.md`. It also carries the `mcpbridge` Xcode 27 block.

## Not verified

- Hooks firing on this change: the cases are read-only Q&A, no write/guard was exercised (guards were covered by the 2026-11-11 run). Hook trust was recorded (94) but no hook output was inspected per case.
- MCP servers (fuse-browser, Context7, Exa, apple-docs, XcodeBuildMCP) were not configured (`--skip-env`), so no live Xcode connection and no Apple-docs lookup was tested.
- Content correctness against Apple's live documentation (the cases prove the installed text is what the model reads and returns, not that Apple's pages match).
- The installer ran from a copy of the working tree, not in place; the in-repo `node_modules` was shared by symlink.
- Behaviour on a machine without the Claude marketplace or with another `HOME` (harness `.env` resolves via `homedir()`, finding F1 of 2026-11-11, not re-tested).
- Findings F1 to F8 of the 2026-11-11 report not re-measured.

## Isolation proofs

- `~/.codex/{config.toml, AGENTS.md, .env, auth.json}` mtimes before vs after (`stat`): identical.
  `config.toml` 2026-11-13 22:05:51, `AGENTS.md` 2026-11-10 14:24:35, `.env` 2026-11-10 14:25:33, `auth.json` 2026-11-13 22:03:08.
- Top-level `ls -lT ~/.codex` before/after differs only in files the running Codex desktop app maintains (`logs_2.sqlite*`, `state_5.sqlite*`, `thread_history_1.sqlite`, `models_cache*.json`, `thread-writer-locks`; the desktop app was running during the test). I did not write those.
- One artifact is probably mine: `~/.codex/tmp/arg0-macos/codex-arg0yWkR7z` (born 22:21:13, `.lock`, `apply_patch`, `applypatch`), created by one `codex --version` I ran at the start without `CODEX_HOME` exported (the mistake the brief warned about). Two sibling dirs from 22:03 and one from 14:09 predate the test. Left in place (no deletion).
- Secrets: `auth.json` was copied with `cp` and never printed, grepped or logged.
- Real repo: no repo file written by the test other than this report; no git write.
- Cleanup: disposable dir `$A` moved to `~/.Trash/` at the end of the mandate; proof (`ls ~/.Trash | grep`, `ls <old path>` failing) is in the lead report.
