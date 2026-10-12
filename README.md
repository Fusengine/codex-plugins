# Fusengine Codex Plugins

![version](https://img.shields.io/badge/version-1.0.58-blue?style=flat-square)
![plugins](https://img.shields.io/badge/plugins-25-brightgreen?style=flat-square)
![runtime](https://img.shields.io/badge/runtime-Bun-black?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

> **Codex CLI plugin marketplace.** 25 expert plugins for APEX workflow,
> SOLID/DRY enforcement, framework specialists, and MCP integrations. The
> implementation follows the official Codex CLI documentation at
> `developers.openai.com/codex`.

## Installation

```bash
codex plugin marketplace add https://github.com/fusengine/codex.git
~/.codex/.tmp/marketplaces/fusengine-codex/setup.sh
```

Windows PowerShell:

```powershell
codex plugin marketplace add https://github.com/fusengine/codex.git
~/.codex/.tmp/marketplaces/fusengine-codex/setup.ps1
```

That is all. The script runs from the temporary Codex marketplace checkout,
installs dependencies, registers the marketplace, enables hooks, copies
`AGENTS.md`, enables the 19 plugins, prompts for Codex configuration (model,
reasoning effort, personality, approval policy, sandbox mode) and MCP API keys,
installs a shell autoloader (`~/.config/fish/conf.d/codex-env.fish`,
`~/.zshrc`, `~/.bashrc`, or the PowerShell profile), and resolves plugin
`${VAR}` placeholders into static values in `~/.codex/config.toml`.

**Prerequisites:** [Bun](https://bun.sh) and the current stable
[Codex CLI](https://developers.openai.com/codex/cli).

### Codex Config

The setup prompts for base `~/.codex/config.toml` keys and MultiAgentV2
concurrency, then configures required features. `(skip)` preserves an existing
prompted value.

| Key | Values | Docs |
|---|---|---|
| `model` | dynamic visible Codex model catalog | [config-sample](https://developers.openai.com/codex/config-sample) |
| `model_reasoning_effort` | dynamic per selected model (Sol includes `ultra`) | same |
| `personality` | none, friendly, pragmatic | same |
| `approval_policy` | untrusted, on-request (recommended — model decides when to ask), never | `on-failure` dropped (deprecated by Codex) |
| `sandbox_mode` | read-only, workspace-write, danger-full-access | same |
| `features.multi_agent` | auto-set `true` | enables stable multi-agent support |
| `features.multi_agent_v2.enabled` | auto-set `true` | enables the V2 agent lifecycle |
| `features.multi_agent_v2.tool_namespace` | auto-set `"fusengine_agents"` | project namespace used for native V2 agent tools |
| `features.multi_agent_v2.hide_spawn_agent_metadata` | auto-set `false` | exposes `agent_type` for exact custom-agent selection |
| `features.multi_agent_v2.max_concurrent_threads_per_session` | 4 (default), 6, 8, 12, 16 | total concurrency slots; `4` means root + 3 sub-agents |
| `suppress_unstable_features_warning` | auto-set `true` | silences the MultiAgentV2 under-development warning |

The namespace/metadata pair is runtime-proven on Codex 0.144.1 but remains V2
internal behavior, not a stable public API. Exact custom selection uses
`agent_type` with `fork_turns = "none"` (or bounded positive history); omitted
or `"all"` history rejected role/model/reasoning overrides in that tested runtime.
The returned configured nickname is identity evidence; the task path alone is
not.

### MCP API Keys

The setup prompts key by key. Empty input skips a key. Signup URLs are shown as
placeholders. Values are stored in `~/.codex/.env` with `chmod 600` and are
loaded by the shell autoloader.

| Variable | MCP server | Signup |
|---|---|---|
| `CONTEXT7_API_KEY` | context7 documentation lookup | https://context7.com |
| `EXA_API_KEY` | exa web search and research | https://exa.ai |
| `MAGIC_API_KEY` | 21st.dev magic UI generation | https://21st.dev |
| `GEMINI_DESIGN_API_KEY` | gemini-design AI frontend | https://aistudio.google.com/apikey |
| `GITHUB_TOKEN` | GitHub MCP | https://github.com/settings/tokens |

You can pre-export keys before running `setup.sh`; existing environment values
are detected and the prompt is skipped.

### What `setup.sh` Does

1. `bun install` - installer dependencies
2. `codex plugin marketplace add https://github.com/fusengine/codex.git` (or
   direct `~/.codex/config.toml` patch when Codex CLI is unavailable)
3. Enables hooks and MultiAgentV2 in `~/.codex/config.toml`, removing incompatible legacy agent limits
4. Copies `AGENTS.md` to `~/.codex/AGENTS.md` with overwrite prompt
5. Enables the 19 plugins (`[plugins."NAME@fusengine-codex"] enabled = true`)
6. Prompts for Codex config and auto-sets `suppress_unstable_features_warning`
7. Prompts for API keys and writes `~/.codex/.env` with `chmod 600`
8. Installs the shell autoloader
9. Resolves `${VAR}` placeholders from plugin `mcp.json.bak` files into static
   `[mcp_servers.X]` blocks in `~/.codex/config.toml`
10. Prints the final MCP report and missing environment variables

> **Why resolve variables during setup?** Codex CLI 0.130.x does not interpolate
> `${VAR}` in plugin `mcp.json.bak` files
> ([openai/codex#19582](https://github.com/openai/codex/issues/19582)). The
> configurator resolves values during installation so Codex receives static
> config entries.

## Plugin Inventory

The marketplace `name` matches the folder name (kebab-case, no prefix). Codex
docs require the outer folder name and `plugin.json` name to be the same
normalized plugin name.

| Folder | Manifest name | Version | Description |
|---|---|---|---|
| `ai-pilot` | `ai-pilot` | 1.2.58 | APEX workflow, sniper, research-expert, explore-codebase, websearch |
| `astro-expert` | `astro-expert` | 1.0.22 | Astro 7: Islands, Content Layer, Actions, Server Islands |
| `cartographer` | `cartographer` | 1.0.24 | Auto-generated plugin and project maps |
| `changelog-watcher` | `changelog-watcher` | 1.0.26 | Codex CLI changelog watcher and breaking-change detection |
| `codex-rules` | `codex-rules` | 1.0.35 | Global APEX / SOLID / DRY rules injection |
| `commit-pro` | `commit-pro` | 1.2.35 | Conventional commits, security check, version bump, tag, push |
| `core-guards` | `core-guards` | 1.1.55 | Pre-tool-use safety, SOLID enforcement hooks, statusline |
| `design-expert` | `design-expert` | 2.1.49 | Design director for web, web apps, iOS and Android; OKLCH tokens, Gemini Design MCP |
| `go-expert` | `go-expert` | 1.0.19 | Go 1.27: idioms, concurrency, backend services, golangci-lint v2, govulncheck |
| `laravel-expert` | `laravel-expert` | 1.2.23 | Laravel 13, PHP 8.5, Eloquent, Livewire, Reverb, AI SDK, Stripe |
| `lessons` | `lessons` | 1.0.9 | Project memory hooks for never-reproduce lessons in MEMORY/LESSON.md |
| `memory-neural` | `memory-neural` | 1.0.10 | Persistent neural memory with Graphiti and Qdrant |
| `nextjs-expert` | `nextjs-expert` | 1.1.39 | Next.js 16, React 19.3, RSC, Server Actions, Prisma 7, Better Auth |
| `php-expert` | `php-expert` | 1.0.19 | PHP 8.5 for non-Laravel projects: Symfony components, PER-CS 3.1, PHPStan, Pest |
| `prompt-engineer` | `prompt-engineer` | 1.1.21 | Prompt and agent design, A/B testing, guardrails |
| `react-expert` | `react-expert` | 1.0.35 | React 19.3, TanStack Router, Zustand, Testing Library, shadcn/ui |
| `rust-expert` | `rust-expert` | 1.0.19 | Rust 1.98, 2024 edition, async/tokio, axum, cargo tooling |
| `security-expert` | `security-expert` | 1.0.29 | OWASP Top 10, CVE research, dependency audit, security headers |
| `seo` | `seo` | 1.0.23 | SEO / SEA / GEO 2026, AI Overviews, structured data |
| `shadcn-expert` | `shadcn-expert` | 1.0.32 | shadcn/ui with Base UI (default), Radix and React Aria; theming, registries |
| `solid` | `solid` | 1.0.29 | Multi-language SOLID orchestrator |
| `swift-apple-expert` | `swift-apple-expert` | 1.1.35 | Swift 6.4 and SwiftUI for iOS 27 and all Apple platforms |
| `tailwindcss` | `tailwindcss` | 1.1.25 | Tailwind v4.3, Oxide engine, OKLCH, container queries |
| `tanstack-start-expert` | `tanstack-start-expert` | 1.0.19 | TanStack Start: file-based routing, server functions, selective SSR, Nitro |
| `typescript-expert` | `typescript-expert` | 1.0.19 | TypeScript 7 for CLIs, libraries and backends on Node or Bun |

## Codex CLI Conventions

| Concept | Implementation | Docs |
|---|---|---|
| Plugin manifest | `.codex-plugin/plugin.json` | `developers.openai.com/codex/plugins/build` |
| Plugin name = folder name | enforced via `fix-conformance.ts` | same |
| Marketplace registry | `.agents/plugins/marketplace.json` (`source: {source:"local", path}`) | same |
| Skill | `skills/<name>/SKILL.md` with strict `name` and `description` frontmatter | `developers.openai.com/codex/skills` |
| Subagent | `agents/<name>.toml` with `sandbox_mode` and `developer_instructions` | `developers.openai.com/codex/subagents` |
| Hooks | `hooks/hooks.json` with 6 stable events | `developers.openai.com/codex/hooks` |
| Hook env vars | `${PLUGIN_ROOT}`, `${PLUGIN_DATA}` | same |
| MCP servers | `mcp.json.bak` direct map (installer source; written to `config.toml`) | PR #18780 |
| AGENTS.md | Auto-loaded from `~/.codex/AGENTS.md` plus Git root to CWD walk | `developers.openai.com/codex/guides/agents-md` |

### 6 Codex Hook Events

- `SessionStart` - session boot (`startup`, `resume`, `clear`)
- `UserPromptSubmit` - user prompt submission
- `PreToolUse` - before tool execution (matcher = regex on tool name)
- `PostToolUse` - after tool execution
- `PermissionRequest` - when approval is required
- `Stop` - end of turn

Do not register `PreCompact` for plugin hooks until Codex stabilizes it.

### 22 Bundled MCP Servers

**Originals (12):** `exa`, `sequential-thinking`, `context7`, `gemini-design`,
`shadcn`, `magic`, `memory`, `next-devtools`, `graphiti`, `qdrant`,
`XcodeBuildMCP`, `apple-docs`.

**Added in v1.2.0 (+12):** `astro-docs`, `filesystem`, `fuse-browser`,
`postgres`, `github`, `supabase`, `slack`, `sentry`, `stripe`, `notion`,
`brave-search`, `replicate`. They are installable through the interactive
`mcp-select` prompt during setup.

## Layout

```text
codex-plugins/
├── AGENTS.md                          # global Codex rules
├── setup.sh                           # install entry point
├── package.json                       # Bun, type: module
├── tsconfig.json                      # Bun strict
├── .agents/plugins/marketplace.json   # 19-plugin registry
├── plugins/                           # 19 plugins
│   └── <plugin>/
│       ├── .codex-plugin/plugin.json
│       ├── skills/<name>/SKILL.md
│       ├── agents/<name>.toml
│       ├── hooks/hooks.json
│       ├── mcp.json.bak               # MCP defs (installer source for config.toml)
│       ├── scripts/                   # agent-invoked CLI tools only (design-expert
│       │                              #   layout-check/, seo parse/validate/audit tools,
│       │                              #   a few core-guards test helpers) — no hook scripts
│       └── .cartographer/             # generated maps
└── scripts/                           # Bun tooling
    ├── migrate.ts                     # claude-plugins to codex-plugins
    ├── install-codex.ts               # installer entry
    ├── convert-py-to-bun.ts           # regex-based .py to .ts converter
    ├── fix-conformance.ts             # align manifests/models/marketplace
    ├── fix-real-issues.ts             # fix interfaces/matchers after audit
    ├── fix-legacy-py-paths.ts         # patch ~/.claude to ~/.codex in _legacy_py
    ├── final-conformance.ts           # SKILL.md cleanup and wrappers
    └── lib/
        └── install/                   # runner, marketplace, features, agents-md, enable-plugins, mcp
```

## Known Limitations (Codex CLI 0.130.x)

| Limit | Status |
|---|---|
| `codex plugin add NAME@MARKETPLACE` | Not available in 0.130.0; fallback patches `config.toml` directly |
| Command-backed statusline (`["bun", "/path"]`) | Removed from runtime since PR #10546; feature request open (issue #20244). Statusline code is preserved in `core-guards/statusline/` for future support |

> **`@fusengine/harness` guard on Codex — `git commit`/`git add` and installs
> are hard-denied outside Ralph mode.** Codex has no interactive approval
> channel and does not honor `permissionDecision: "ask"` (it fails open —
> Codex's own `pre_tool_use.rs` test `unsupported_permission_decision_fails_open`),
> so the harness downgrades every `ask` to an explicit deny. As a result
> `git commit`, `git add`, `git checkout -b` (and every `git push` / `checkout` /
> `reset` / `merge` / … confirmation gate) plus project installs (`bun install`,
> `npm install`, `pip install`, …) are **denied** on Codex unless `RALPH_MODE=1`
> is set. Ralph mode exempts only the safe set (`git add`, `git commit`,
> `git checkout -b`, `git status` / `diff` / `log`) and project installs; system
> installs (`brew`, `apt`, …) stay denied even then, and destructive git
> (`push --force`, `reset --hard`, `branch -D`) is always blocked.

## Known Gaps (claude-plugins to codex-plugins parity)

All gaps identified in the v1.1.x parity diff are closed in v1.2.0:

- [x] Codex file backups before modification (`fs-helpers.ts` + `backup.ts`)
- [x] `setup-plugins.ts`: centralized per-plugin install orchestration
- [x] Expanded MCP catalog: +12 servers (`mcp-catalog.ts`, 24 total)
- [x] Dedicated shell environment installers (conf.d / rc append / PowerShell profile)
- [x] Built `dist/` statusline (custom statusline not supported by Codex 0.130; tracked in issue #17827)
- [~] `_shared/`: duplicate `apex_constants.ts` identified versus `apex-constants.ts`; four other snake_case files are confirmed unique. Manual cleanup remains.
- [x] `commit-pro`: assets restored from claude-plugins (`commands/`, `CHANGELOG.md`, `LICENSE`, `README.md`). Hooks were not restored.
- [x] `perf-env.ts`: binary-verified Codex environment prompt (`RUST_LOG`, `CODEX_TUI_ROUNDED`, `GIT_OPTIONAL_LOCKS`)
- [x] `plugin-scanner.ts`: post-install diagnostic report (manifest / hooks / MCP / skills / agents per plugin)

> There is no Codex equivalent for Claude Code performance variables
> (`CLAUDE_CODE_FORK_SUBAGENT`, `CLAUDE_CODE_ATTRIBUTION_HEADER`,
> `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `DISABLE_AUTOUPDATER`). This was
> verified with `strings $(which codex)` on 0.130.0; those symbols do not exist
> in the binary. Codex has no CLI telemetry toggle or autoupdate toggle
> equivalent; telemetry is server-side and upgrades use `codex --upgrade`.
> `perf-env.ts` is limited to the three recognized environment variables.

### `plugin-scanner` Output

```text
Plugin diagnostic (19 plugins scanned):
  ai-pilot              manifest OK  hooks 4 evt / 12 hdl  mcp 2  skills 6  agents 5
  astro-expert          manifest OK  hooks 2 evt /  4 hdl  mcp 1  skills 12 agents 1
  ...
Issues: 0 missing manifest, 0 malformed hooks.json, 0 malformed mcp.json.bak.
```

## Dev Tools

```bash
bun run migrate                         # regenerate plugins/* from ../claude-plugins/
bun run scripts/convert-py-to-bun.ts    # batch py to ts conversion
bun run scripts/fix-conformance.ts      # align manifests/models/marketplace
```

## License

MIT. See [LICENSE](LICENSE) when available.
