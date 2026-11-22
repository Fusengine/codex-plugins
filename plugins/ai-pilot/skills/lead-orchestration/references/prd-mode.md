---
name: prd-mode
description: Harness PRD mode for a write mandate with 2+ agents -- router, task PRDs, per-agent report files, prd init/status/validate/compact, and the PRD Check of step 5
when-to-use: MUST read at lead-orchestration step 5 for every WRITE mandate (Layers) and its harness PRD mode (2 or more agents), before any executor spawn_agent; also on resume or after a compaction of such a mandate
keywords: prd, router, task prd, prd init, prd status, prd validate, prd compact, agent report, PRD mode
priority: high
related: brief-template.md
---

# Harness PRD Mode (step 5 Distribute)

Moved verbatim from `SKILL.md` step 5; `SKILL.md` keeps a short summary and the pointer. "Layers" applies to every write mandate, PRD mode on or off, whatever the agent count (as before the move); "Activation and commands" applies only to a WRITE mandate with 2+ agents. A read-only mandate runs no `harness prd` command.

## Layers

- The coordinator alone writes two PRD layers before spawning. The router `<project>/.codex/apex/prd.json` holds one key per task pointing at its task PRD: `{ "task-1": { "prd": "prd/task-1-prd.json", "status": "assigned" } }`. For each task, the coordinator alone writes the task PRD `<project>/.codex/apex/prd/<task>-prd.json`: one sub-key per assigned executor holding its target files and sub-tasks, with `assigned` moving to `validated` only after the coordinator checks the result against the disk.
- Each agent reports only in its own file `<project>/.codex/apex/prd/agents/<agent>-prd.json`, keyed by task name, then by the sub-task keys the task PRD assigns to that agent, and ticks each finished sub-task `done` with the files it modified and the files left unchanged; it never writes `prd.json`, a task PRD, or another agent's report file, so no write can overwrite another.
- The coordinator reads every agent report, checks every task against the disk, marks each verified sub-task `validated` in the task PRD, and rolls the task's status up into the router. Every agent may read the router, every task PRD, and every agent report at any time to know exactly what is done, in progress, or untouched — that shared read is the collaboration channel alongside messages; only the owner of each file writes it. As a task closes, the coordinator compacts its task PRD: each validated agent's entry collapses to one line (agent, files, validated-at) — never merging multiple agents of the same task into a single line — and collapses the router's line for that task, so every file stays small and every later reader sees the current state without the history. The coordinator rolls the router up at every `validated` mark and keeps `task.json` `current_task` in step — never at session end; a router that lags the task PRDs is a defect.

## Activation and commands

**Harness PRD mode** applies only to a WRITE mandate with 2 or more agents, and its activation is the harness's own answer, never a grep of `.env` files (a shell can export `FUSE_PRD` that the hooks do not see):

1. The lead itself runs `prd init --id codex --task <task> --root <project>`, a coordinator harness command like `status`/`validate`/`compact` — no agent is spawned for it and nothing waits on it; `init` creates only the router `<project>/.codex/apex/prd.json`. No executor `spawn_agent` happens before the lead holds that `init` output and, when it is on, has written the task PRD.
2. PRD mode is on only if `init` exits 0 printing `created …` or `exists` (router already on disk, nothing written; older harnesses print `router already present`) AND `<project>/.codex/apex/prd.json` exists; any other output (`requires FUSE_PRD=1`, unknown sub-command, error) means off for the whole mandate, and nothing else changes (no extra spawn, no wait).
3. Every brief, PRD-off and read-only ones included, carries the line `PRD mode: on` or `PRD mode: off` (read-only -> `off`), and every executor or helper brief (`sniper`, `research-expert`, `explore-codebase`, `challenger` included) carries verbatim "never run `prd init`".
4. With `PRD mode: on`, each executor brief carries its absolute report path `<project>/.codex/apex/prd/agents/<key>-prd.json` (`<key>` = its task-PRD key); harness 0.1.122+ also injects that absolute path at SubagentStart (older harnesses showed it relative to `<project>/.codex/apex/`) and denies a `*-prd.json` written under `<project>/prd/agents` or `<cwd>/prd/agents`.
5. PRD mode off -> nobody runs `prd status`, `prd validate` or `prd compact`, no other brief mentions them, and the "Layers" bullets above apply unchanged. A read-only multi-agent mandate (audit / analyse / explain / check, WRITE: none) never runs `prd init` nor any other `harness prd` command.
6. The harness runs from the plugin install path, `$CODEX_HOME/node_modules/@fusengine/harness/dist/cli/bin.mjs` (or `$CODEX_HOME/node_modules/.bin/harness`), never a global `harness` binary, which may predate `prd init`.
7. PRD mode on -> the lead then writes the task PRD `<project>/.codex/apex/prd/<task>-prd.json` itself with `apply_patch`, still before any executor is spawned (the harness denies every Bash write under `apex/prd/`), one key per executor named after its `agent_type` (`<agent_type>`, then `<agent_type>-2` for a second executor of the same type): Codex enforces ownership by identity, and a key that matches no `agent_type` blocks that agent's report.
8. Executors are launched only after both the router and the task PRD exist on disk: the harness hands a sub-agent its PRD slice and absolute report path only when both files exist before that sub-agent is spawned. No executor or helper ever runs any `harness prd` command or writes the router or a task PRD; each writes only its own `<project>/.codex/apex/prd/agents/<key>-prd.json`.
9. The coordinator commands are the lead's own: on resume or after a compaction, the lead runs `prd status --root <project>` first (read-only) and relaunches only the agents with sub-tasks not done; before "done", the lead runs `prd validate <task> --root <project>`, which marks `validated` and promotes the router (exit 0 is required, any violation keeps the task open: resume that agent to write its report); then the lead runs `prd compact <task> --root <project>`, which replaces the hand compaction.

<example>
prd.json: { "task-1": { "prd": "prd/task-1-prd.json", "status": "in-progress" } }
prd/task-1-prd.json (before validation): { "agent-1": { "files": ["src/a.ts"], "sub-tasks": { "sub-1": { "status": "assigned" } } }, "agent-2": { "files": ["src/b.ts"], "sub-tasks": { "sub-2": { "status": "assigned" } } } }
prd/agents/agent-1-prd.json: { "task-1": { "sub-1": { "status": "done", "modified": ["src/a.ts"], "unchanged": [] } } }
prd/agents/agent-2-prd.json: { "task-1": { "sub-2": { "status": "done", "modified": ["src/b.ts"], "unchanged": [] } } }
prd/task-1-prd.json (after validation, compacted): { "agent-1": { "status": "validated", "files": ["src/a.ts"], "validated-at": "2026-09-02T14:10:00Z" }, "agent-2": { "status": "validated", "files": ["src/b.ts"], "validated-at": "2026-09-02T14:12:00Z" } }
</example>

## Launch gate (step 7)

Write mandate, 2+ agents: no executor `spawn_agent` before the lead's own `prd init` output is in hand (no agent is spawned for it) and, PRD mode on, the task PRD is written — PRD on or off, the init answer decides it, never an assumption; a read-only mandate runs no PRD step at all.

## Check (part of step 5 Check)

Every brief carries `PRD mode: on|off` from the `prd init` result; PRD mode off -> no `prd status/validate/compact` in any brief or run; a read-only mandate -> no `harness prd` command at all; in harness PRD mode, the router came from the lead's own `prd init`, the lead held its output and the task PRD existed before the first executor `spawn_agent`, every executor and helper brief carries "never run `prd init`", `prd init/status/validate/compact` ran only in the lead's own calls, every task PRD key matches an executor's `agent_type`, and no task is reported done before `prd validate` exits 0.
