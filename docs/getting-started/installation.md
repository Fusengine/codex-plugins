# Installation

## Prerequisites

- **Codex CLI / Codex app**
- **Bun** - install from [bun.sh](https://bun.sh)

## 1. Add Marketplace

When the installed Codex CLI supports plugin marketplace commands:

```bash
codex plugin marketplace add https://github.com/fusengine/codex.git
```

## 2. Install Plugins

Install the required Fusengine plugins with the Codex plugin command when
available:

```bash
codex plugin add ai-pilot@fusengine-codex
codex plugin add codex-rules@fusengine-codex
```

If the local CLI does not support plugin installation yet, run the marketplace
checkout installer. It caches local plugin bundles and enables them in Codex
config.

## 3. Run Setup

### macOS / Linux

```bash
~/.codex/.tmp/marketplaces/fusengine-codex/setup.sh
```

### Windows

```powershell
~/.codex/.tmp/marketplaces/fusengine-codex/setup.ps1
```

The setup writes configuration under `${CODEX_HOME:-~/.codex}` and installs:

- Codex feature flags for hooks and multi-agent support
- plugin cache entries under `~/.codex/plugins/cache/`
- AGENTS.md rules
- optional MCP configuration
- shell environment helpers

Hook execution is Harness-only. Every configured command handler invokes its
registered `@fusengine/harness` Codex route; setup installs Harness `^0.1.90`.
Generation skips an unregistered tuple instead of preserving or synthesizing a
direct plugin-script command.

## 4. Enable Required Features

The installer should set these flags automatically:

```toml
[features]
hooks = true
multi_agent = true

[features.multi_agent_v2]
enabled = true
max_concurrent_threads_per_session = 4
tool_namespace = "fusengine_agents"
hide_spawn_agent_metadata = false
```

Setup prompts for `max_concurrent_threads_per_session` with `4`, `6`, `8`,
`12`, or `16`; skipping preserves any existing value. The limit includes the
root, so `4` allows the root plus three sub-agents.

The namespace/metadata pair enables exact custom-agent selection through
`agent_type`. With Codex 0.144.1, calls must set `fork_turns = "none"` (a
numeric value is accepted but means full history, codex rust-v0.169.0
`multi_agents_v2/spawn.rs`; use `"none"` for a brief-only child); the
default/`"all"` rejected role/model/reasoning
overrides in the tested runtime. These V2 settings are runtime-proven internal
knobs, not a stable public API.

Manual configuration lives in:

```bash
${CODEX_HOME:-$HOME/.codex}/config.toml
```

## 5. Verify Installation

```bash
codex features list | rg 'hooks|multi_agent'
bun run validate
```

Expected:

- `hooks` enabled
- `multi_agent` and `multi_agent_v2` enabled
- validation passes
- every command handler matches its exact Harness route

## Manual API Keys

If you skipped API keys during setup, configure the environment expected by the
MCP server you enabled, then restart Codex.

Common keys:

```bash
export CONTEXT7_API_KEY="ctx7sk-xxx"
export EXA_API_KEY="xxx"
export MAGIC_API_KEY="xxx"
export GEMINI_DESIGN_API_KEY="xxx"
```

## Troubleshooting

### Bun Not Found

```bash
curl -fsSL https://bun.sh/install | bash
```

### Hooks Not Working

```bash
codex features list | rg 'hooks|multi_agent'
bun run validate
```

### Check Config

```bash
sed -n '/\\[features\\]/,/^\\[/p' "${CODEX_HOME:-$HOME/.codex}/config.toml"
```
