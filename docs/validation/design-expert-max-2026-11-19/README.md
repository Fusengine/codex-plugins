# Real-run proof: design-expert on gpt-6.2-sol `max` (2026-11-19)

Owner-authorized real sync after commit `1f085dac`
(`chore(agents): run design-expert on gpt-6.2-sol max (named exception)`).

## Sync into `~/.codex`

- `bun run sync:agents` exited 0 at ~01:28 on 2026-11-19 (`sync.out`).
- 40 agents installed into `~/.codex/agents` (40 replaced), 35 commands symlinked
  into `~/.codex/prompts`; harness runtime already up to date (0.1.126).
- `model-effort-before.txt` (taken from the pre-sync backup) vs
  `model-effort-after.txt`: the only diff is

  ```
  < design-expert.toml|model = "gpt-6.2-sol"|model_reasoning_effort = "high"
  > design-expert.toml|model = "gpt-6.2-sol"|model_reasoning_effort = "max"
  ```

- `grep -l max` over the installed agents returns `design-expert` only.

## Codex side: `gpt-6.2-sol` accepts `max` (codex-cli 0.169.0)

Owner test run on 2026-11-19 at 00:16:
`codex exec -m gpt-6.2-sol --config model_reasoning_effort=max` — the run header
showed `reasoning effort: max` and the run completed (black-hole HTML page,
~202k tokens).

## Files

| File | Content |
|------|---------|
| `sync.out` | Full output of the real `bun run sync:agents` run |
| `model-effort-before.txt` | `model` + `model_reasoning_effort` of the 40 installed agents before the sync |
| `model-effort-after.txt` | Same, after the sync |
