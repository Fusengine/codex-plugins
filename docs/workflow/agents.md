# Agents

38 specialized Codex agents across all plugins.

## Model Policy

**Current, since 2026-10-29 (owner decision).** Every shipped agent runs on
`gpt-6.1-terra` — no agent stays on Sol. `gpt-6.1-luna` is not available on
this account; `ultra` is never used (it adds automatic sub-agent delegation
and was not part of the decision). The coordinator (the owner's own Codex
session) is not a shipped agent TOML and stays outside this policy.

Groups (30 + 5 + 3 = 38): `max` (3) — `design-expert`, `challenger`,
`security-expert` (visual and security/adversarial gates); `high` (5) —
`sniper`, `brainstorming`, `prompt-engineer`, `skill-creator`,
`solid-orchestrator` (heavy judgment); `medium` (30) — every other agent in
the Inventory below, including the code executors and `commit`. New agents
default to `gpt-6.1-terra` / `medium`; any other model or effort needs a new
owner decision. No verified Terra price is recorded. Rationale (owner's
blind benchmark, 2026-10-29): Terra medium equals Sol medium on code
executors (27/27 hidden tests, same blind Laravel review 31/40, 1.5x faster,
3x cheaper); Terra max won every visual test; Sol won no test (it ignored
"no tools" instructions, cost 3-10x more, twice failed "model at capacity").

### History (all gpt-6.1-sol, superseded 2026-10-29)

The 2026-09-30 owner decision ("okay passe les tous en v 6.1") put every
shipped agent on `gpt-6.1-sol`: `design-expert` alone at `high`, every other
agent at `medium` (`skill-creator` joined 2026-10-12 at that default).
`gpt-6.1-sol` price: $2.00 / $0.10 / $10.00 per 1M tokens (standard, ≤272K
input). Superseded by the 2026-10-29 Terra matrix above.

### History (all gpt-6-sol, superseded 2026-09-30)

The 2026-09-27 owner decision ("je pense plus pertinent sol medium" · "je
dirais les luna medium => sol medium") put all 37 agents on `gpt-6-sol` (36
`medium`, `design-expert` `high`) and retired Luna, knowingly overriding the
2026-09-23 cost/speed measurements below. `gpt-6-sol` price: $2.00 / $0.20 /
$10.00 per 1M tokens. Superseded by the 2026-09-30 move to `gpt-6.1-sol`.

### History (GPT-6 Sol/Luna split, superseded 2026-09-27)

The 2026-09-23 owner decision ("supprime astra il coute chere" · "j'ai
trouvé luna medium plus performant" · "donc on répartie comment les model
et raisonnement sur luna le high on oublie je pense non?" · "appliquer")
moved the fleet from GPT-5.6 to GPT-6 and split it by role shape: 18
`gpt-6-sol` / `medium` (judgment, validation, exploration, research,
release, SEO analysis), `design-expert` on `gpt-6-sol` / `high`, and 18
`gpt-6-luna` / `medium` (the 12 framework/language experts plus
`sniper-faster`, `websearch`, `cartographer`, `commit-detector`,
`seo-images`, `seo-sitemap`). Measured basis at the time: debug bench —
Luna/medium 100% hidden-test pass at ~1/50 of Sol's cost, total wall 205 s
vs 1 158 s over 6 runs each;
semver task — Luna 0.931 vs Sol 1.000 (Sol the only arm with zero
edge-case misses). Luna/high was dropped (slow, erratic) and Sol/low
dropped (no better than Luna medium). Luna price: $0.10 / $0.01 / $0.50
per 1M tokens. Superseded by the 2026-09-27 all-Sol decision above.

### History (GPT-5.6 policy, superseded 2026-09-23)

The 37-agent policy (revised 2026-09-07, building on the 15-run `codex exec`
0.152.1 benchmark below) assigned model/effort by named role: 15 agents (the
12 framework/language experts plus `explore-codebase`, `research-expert`,
`websearch`) on `gpt-5.6-terra` / `medium` — fastest/cheapest at equal
measured quality on bounded, briefed executor work; 16 on `gpt-5.6-sol` /
`medium`; `design-expert` alone on `gpt-5.6-sol` / `high`; 5 bounded,
strictly-contracted mechanical roles (`sniper-faster`, `commit-detector`,
`cartographer`, `seo-images`, `seo-sitemap`) on `gpt-5.6-luna` / `max`.
Totals: 17 Sol, 15 Terra, 5 Luna. Sol `xhigh` retired fleet-wide as of
2026-09-02 (0 agents).

Timeline of owner decisions that produced this state (all 2026-09-02 unless
noted): `sniper`/`prompt-engineer` moved Sol/high → Sol/medium ("il est
assez intelligent"; benchmark showed medium equal to high); "seul le
designer en high" moved `design-expert` xhigh→high and
`challenger`/`security-expert` high→medium, retiring Sol `xhigh`
fleet-wide; a same-day correction ("security-expert en high") reinstated
`security-expert` at high; "passe en terra medium" moved
`research-expert`/`websearch`/`explore-codebase` to Terra/medium,
unbenchmarked (risk below); the 12 framework experts moved Sol medium →
Terra medium, benchmark-backed (equal quality, 1.7× faster, ~half cost);
`brainstorming`/`solid-orchestrator` moved Sol high → medium (57→56, within
threshold); `lessons-compactor` moved Luna max → Sol medium (52→56, a
quality increase). 2026-09-07: owner request `security-local-medium`
(`.codex/apex/task.json`, quoted verbatim) — "security-expert medium et il
doit ce comporter comme un hacker local qui sert exclusivement en local a
tester les securité si on le demande de le faire en dehors du
developpement local il refusera" — moved `security-expert` to Sol/medium
for good (a same-day lead revert to `high` was itself reverted once this
citation was found), leaving Sol/high (1) as `design-expert` only.
`seo-technical`/`seo-schema` stayed Sol medium over Luna max (56→52, over
threshold); `commit` stayed Sol medium over Terra (an irreversible git flow
isn't the bounded-executor shape the benchmark covered). Rationale index
(artificialanalysis.ai/models/gpt-5-6-luna and the Sol launch article, July
2026): Sol low 51, medium 56, high 57, xhigh 59, Luna max 52 (Sol max
unused, not asserted here) — no comparable Terra score exists, so the
Terra move was benchmark-evidenced, not index-evidenced.

Known Terra risk, kept for the record: openai/codex#32389 ("GPT-5.6 Terra
intermittently returns an empty successful final response after tool use,
prematurely ending agent loops", medium effort) — not reproduced in 12
Terra runs across the benchmark below. Mitigated by doctrine (coordinator
PRD check + challenger/sniper gates → retry, never a silent bad merge); for
the 3 unbenchmarked volume agents, mitigation was procedural — an
empty/truncated research/exploration report is relaunched with the same
brief, never accepted as "nothing found" (see
`plugins/ai-pilot/skills/lead-orchestration/SKILL.md`,
`plugins/codex-rules/rules/03-agent-teams.md`). The earlier "worst of both
worlds" field-report characterization of Terra was not reproduced here.

### Benchmark 2026-09-02

15-run `codex exec` 0.152.1 benchmark: 3 bounded coding tasks (bug fix vs a
documented contract; spec-driven feature; 3-file CLI change with a
byte-identical output constraint) × 5 configs (Terra medium/high, Sol
medium/high, Luna max), each run isolated (`--ignore-user-config`, fresh
directory, hidden tests copied in after the run). Every run passed every
hidden test, never altered a visible test.

| Task | Terra medium | Terra high | Sol medium | Sol high | Luna max |
|---|---|---|---|---|---|
| bug fix (7 hidden) | 7/7, 83s | 7/7, 65s | 7/7, 170s | 7/7, 151s | 7/7, 163s |
| spec feature (25 hidden) | 25/25, 48s | 25/25, 79s | 25/25, 82s | 25/25, 115s | 25/25, 124s |
| 3-file CLI (8 hidden) | 8/8, 79s | 8/8, 81s | 8/8, 101s | 8/8, 104s | 8/8, 140s |

Totals: Terra medium 210s, Sol medium 353s, Luna max 427s. Estimated
3-task cost (Sol $4/$0.40/$20, Terra $2/$0.20/$12, Luna $0.20/$0.02/$1.20
per 1M tokens in/cached/out): Terra medium $0.31, Sol medium $0.64, Luna
max $0.04. A 6-run repeat of Terra medium on the feature + CLI tasks passed
6/6, stable at 41-51s and 73-78s. Every agent defines identity-based
`nickname_candidates` (no generic placeholder pools) and lists its skills
via `[[skills.config]]` entries pointing at installed cache `SKILL.md`
files under `/Users/<username>/.codex/plugins/cache/fusengine-codex/
<plugin>/<version>/`.

## Inventory

| Plugin | Agents |
|--------|--------|
| `ai-pilot` | `brainstorming`, `challenger`, `commit`, `explore-codebase`, `research-expert`, `skill-creator`, `sniper`, `sniper-faster`, `websearch` |
| `astro-expert` | `astro-expert` |
| `cartographer` | `cartographer` |
| `changelog-watcher` | `changelog-watcher` |
| `commit-pro` | `commit-detector` |
| `design-expert` | `design-expert` |
| `go-expert` | `go-expert` |
| `laravel-expert` | `laravel-expert` |
| `lessons` | `lessons-compactor` |
| `nextjs-expert` | `nextjs-expert` |
| `php-expert` | `php-expert` |
| `prompt-engineer` | `prompt-engineer` |
| `react-expert` | `react-expert` |
| `rust-expert` | `rust-expert` |
| `security-expert` | `security-expert` |
| `seo` | `seo-cluster`, `seo-content`, `seo-expert`, `seo-geo`, `seo-images`, `seo-local`, `seo-schema`, `seo-sitemap`, `seo-technical` |
| `shadcn-expert` | `shadcn-ui-expert` |
| `solid` | `solid-orchestrator` |
| `swift-apple-expert` | `swift-expert` |
| `tailwindcss` | `tailwindcss-expert` |
| `tanstack-start-expert` | `tanstack-start-expert` |
| `typescript-expert` | `typescript-expert` |

## Agent Teams

Agents can work in parallel when the active Codex runtime exposes a subagent or
team capability. Fusengine configures the Codex 0.144.1 native V2 tool under the
project-specific `fusengine_agents` namespace with spawn metadata visible. These
are runtime-proven internal knobs, not a stable public API. Keep file ownership
exclusive per teammate. See [Agent Teams](agent-teams.md) for delegation rules,
anti-patterns, and examples.

## Usage

Agents are launched automatically based on project detection, or manually:

```text
User: "Use nextjs-expert to fix the routing"
```

Or via the available subagent tool:

```typescript
fusengine_agents.spawn_agent({
  agent_type: "nextjs-expert",
  message: "Fix the routing issue",
  task_name: "fix_routing",
  fork_turns: "none",
})
```

`agent_type` selects the exact custom TOML. It must be paired with
`fork_turns = "none"` or a bounded positive history; the default/`"all"`
rejected role/model/reasoning overrides in the tested runtime. A returned
configured nickname is identity evidence — a task path is not.

## Hook Runtime

Agent lifecycle evidence is routed through `@fusengine/harness`. The migration has no direct-command exception path: every configured command handler invokes its canonical Harness route. Harness 0.1.79 still has Codex compatibility gaps for design lifecycle, Claude-rooted state, and events Codex does not emit — see [Hooks System](../reference/hooks.md#harness-0179-runtime-limits).
