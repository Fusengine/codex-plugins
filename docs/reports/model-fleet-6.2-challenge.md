# Model fleet 6.2 — challenge of the design (2026-11-18)

Author: challenger. Read-only. Target: `docs/reports/model-fleet-6.2-design.md` (mtime 01:15:16).

Context: the owner corrected the draft afterwards, recorded at `docs/decisions.md:15` (mtime 01:17:56). Owner verbatim: « oui mais terra est pas efficace j'ai vue on doit le garder pour d'autre tache et le max on oubli on remplace par high ». What the journal records:
- `gpt-6.2-sol` becomes the fleet default.
- Terra is kept only for a minority of non-core tasks.
- `max` becomes `high` fleet-wide.
- No benchmark gate.

## Verdict

**REFUTED** overall. Its matrix, its `max` tiers and its benchmark gate are superseded by the owner. Of what remains, the facts hold with one false line. The installer impact is nil. But the test redesign weakens the anti-drift lock, and the lots miss files.

Claim challenged: "the design doc is a correct, non-regressive answer to the owner's request".

| Point | Verdict |
|---|---|
| 1. Facts | CONFIRMED, except one false statement |
| 2. Matrix | Agent list CONFIRMED (40, exact). Placement: superseded by owner |
| 3. Structural cleanup | Installer CONFIRMED safe (removing `max` and `ultra` from the type). Test redesign REFUTED (weakens the lock) |
| 4. Lots | Disjointness and order CONFIRMED. Coverage REFUTED (missing files) |
| 5. Benchmark gate | Superseded by owner |
| 6. Regression test | REFUTED (adds friction; weakens a contract test) |

## 1. Facts — CONFIRMED, one false line

Re-fetched today, all match the research report:
- `gpt-6.2-sol` id and price ($2 input / $0.10 cached / $10 output; over 272K input: input ×2, output ×1.5). Source: https://developers.openai.com/api/docs/models/gpt-6.2-sol.md
- The launch post names only Astra and Sol, so there is no Terra 6.2. It says "GPT‑6.2 Sol keeps GPT‑6.1 Sol's API token prices". It confirms FrontierCode "within 0.5 points… about one-fifth the cost (both at max)" and GDPval v2 "+5.3". Source: https://openai.com/index/introducing-gpt-6-2-astra-sol/
- Artificial Analysis at max effort:
  - Sol 6.2: 57, 7.9 min, $1.01 per task, 60.9M output tokens.
  - Terra 6.1: 51, 14.3 min, $0.96 per task, 99.4M output tokens.
  - That is 38.7% fewer output tokens for Sol 6.2, so the design's "~39%" is right.
  - Sources: https://artificialanalysis.ai/models/gpt-6-2-sol and https://artificialanalysis.ai/models/gpt-6-1-terra
- System card:
  - "tightened default restrictions on higher-risk cybersecurity assistance".
  - 6.2 scored "lower on Cyber Utility… potentially less useful for cyber work".
  - Both models are "more likely to omit known obstacles".
  - Source: https://deploymentsafety.openai.com/gpt-6-2-astra-sol

**False statement:** design §1 option 5 says "no 6.2 low-effort data". It inherits this from research §4 ("AA figures are max effort"). Artificial Analysis publishes per-effort rows:

| Effort | Sol 6.2 (index, min per task) | Terra 6.1 (index, min per task) |
|---|---|---|
| Low | 41, 1.4 | 29, 1.2 |
| Medium | 53, 3.1 | 38, 2.8 |
| High | 55, 4.2 | 42, 4.2 |
| Xhigh | 56, 5.1 | 45, 6.5 |
| Max | 57, 7.9 | 51, 14.3 |

Sol 6.2 scores higher at every effort for about the same time from medium up. This supports the owner's correction. The research report should carry this table, and the policy rationale should cite it.

## 2. Matrix — agent list CONFIRMED; placement superseded by owner

- I diffed design lines 62-102 against `git ls-files 'plugins/*/agents/*.toml'` (40 files): the names are identical, with no missing or duplicate agent.
- The placements (33 Terra / 7 Sol, three `max` tiers) are replaced by `docs/decisions.md:15`.

### Credible non-core Terra candidates (one line each)

| Agent | Credible? | Reason |
|---|---|---|
| `commit-detector` | Yes | Read-only intent classifier; in every past low-cost group (GPT-5.6 Luna max, 2026-09-23 Luna medium: `docs/workflow/agents.md:49-51,67-68`). |
| `cartographer` | Yes | Mechanical map generation; same two low-cost groups (`agents.md:50,67`). |
| `seo-images` | Yes | Read-only checklist audit; same two groups (`agents.md:51,68`). |
| `seo-sitemap` | Yes | Read-only, mechanical; same two groups (`agents.md:51,68`). |
| `sniper-faster` | Yes | Applies already-identified fixes only (TOML description); same two groups (`agents.md:50,67`). |
| `websearch` | Yes | Description says "speed > depth"; 2026-09-23 Luna group (`agents.md:50`). Sol 6.2 low (41, 1.4 min) would also fit, but Terra is the owner's stated home for such work. |
| `security-expert` | Yes, but flag | Grounded at source: lower Cyber Utility and tightened cyber defaults on 6.2. It is a gate, not "non-core", so the lead must label it as a capability exception, not a cost one. |
| `commit` | No | The irreversible git and release flow already stayed off Terra in 2026-09 because it "isn't the bounded-executor shape" (`agents.md:92-93`). It runs under HARD STOP 1; it is core. |
| `lessons-compactor` | No | Was moved *up* (Luna max → Sol medium, "a quality increase", `agents.md:83-84`). Its job (dedupe without dropping not/never) is judgment over owner rules. |
| `changelog-watcher` | Weak | It was never in a low-cost group; 2026-09-23 kept it on Sol (`agents.md:47-48`). Only "monitoring" argues for Terra. |

## 3. Structural cleanup

### Installer impact of removing `ultra` and `max` from the effort type: CONFIRMED safe

- The effort type is local to `scripts/lib/agent-toml.ts:8-11` and is not exported.
- Nothing imports it. The importers of `agent-toml.ts` are only `agents.ts:3`, `agent-toml.test.ts:5`, `agent-tier-matrix.test.ts:24` and `security-agent-pilot.test.ts:6`.
- The installer's `FALLBACK_EFFORTS` (`scripts/lib/install/config-options.ts:15`) is a separate list of strings, used only by `config-model-options.ts:1,19`. Live models take their efforts from the catalog (`config-model-options.ts:16-18`).
- So the owner's coordinator prompt still offers `max` and `ultra`. The policy restricts shipped agents only, which is correct (the coordinator stays outside the policy: `agents.md:10-11`).
- `README.md:47` (the installer table) needs no change.

### Test redesign: REFUTED (weakens the lock)

- Design §3 reads the expected `{model, effort}` from `TIER_PROFILES[tier]` and the whitelist from `ALLOWED_MODELS`, both in the source under test. Today the expected values are independent literals in the tests (`agent-toml.test.ts:20-24,80-82`; `agent-tier-matrix.test.ts:74,82-86`).
- Failure scenario: change `TIER_PROFILES.JUDGE` to `medium`, or add `"gpt-6.1-sol"` to `ALLOWED_MODELS` and assign it, then run `sync:agents`. All tests stay green.
- That is the silent drift `agent-tier-matrix.test.ts:1-8` exists to catch: the 2026-09-07 `security-expert` revert.

### Fragile anchor in the dated-citation test

- `agent-tier-matrix.test.ts:105` slices the source at the literal `export const AGENT_MODEL_PROFILES`. If the derived map is declared differently, `indexOf` returns -1 and the slice becomes the whole file, so the test passes vacuously.
- The test also only checks `design-expert` and `security-expert`: for every other agent the baseline is "as today" (`:63-69`). So the design's "dated JSDoc lines for moved agents" are not enforced by any test.

### Under the owner correction

- Zero `max` must become a lock, alongside zero `ultra`.
- The three `max` gate tiers (VISUAL_GATE / SECURITY_GATE / ADVERSARIAL_GATE) become dead encodings of a retired effort.

## 4. Lots

- **Disjointness and order: CONFIRMED.** A, B, C and D own disjoint files, and the order A ∥ D → B → C → E holds.
- **Coverage: REFUTED.** These lines become false once Sol is the default and `max` is retired, and no lot owns them:
  - `plugins/ai-pilot/skills/agent-creator/references/frontmatter.md`:
    - :57 says "`gpt-6.1-terra` for every shipped agent".
    - :58 says "`high` or `max`".
    - :82 is the `ultra` note.
    - :90-92 is the superseded-policies list, which needs the Terra entry.
  - `references/templates/agent-template.md`:
    - :138 says "`gpt-6.1-terra` for every agent".
    - :139 says "`max` for the visual… gates".
  - `agent-creator/SKILL.md`:
    - :40 and :92 are tier wording.
    - :102 is the `ultra` line.
    - :106 is the history pointer.
  - `docs/reference/creating-skills-agents.md`: :46 (`max`) and :76-83 (history links; a new anchor is needed).
  - `docs/workflow/agents.md`: no lot creates "History (all gpt-6.1-terra, superseded 2026-11-18)". Lot E owns only the policy paragraph.
- **Grep check.** Outside the TOMLs, `gpt-6.1-terra|gpt-6.1-sol|gpt-6-sol` hits are all inside lots A–D or are history (CHANGELOG, `GAP-HARNESS.md`, `real-conditions-*`). The stale "38" / "(30)" / "×30" are at `creating-skills-agents.md:57`, `task-list.md:9`, `SKILL.md:94,98` and `frontmatter.md:73,78`, all in lots B and C.
- Lot D (the baseline model line) stays valid: `security-expert`'s model is unchanged if it stays on Terra.

## 5. Benchmark gate — superseded by owner

The owner says "no benchmark gate before applying" (`docs/decisions.md:15`). Its residual risks (Sol 6.1 ignoring "no tools", capacity errors, obstacle omission per system card item 3) go to the existing mandatory real-condition run (`docs/decisions.md:11`), not to a new gate.

## 6. Regression test (lesson 2026-10-29) — REFUTED

- **Friction added:** the benchmark gate and an owner go on the numbers (A1, Lot E). The owner has now rejected both. The design's §6 "Adds friction? No" is false.
- **Restriction:** it kept `max` and kept Terra as the majority, against the owner's correction.
- **Removed contract strength:** the tests now take their expected values from the source they check (point 3).

## Required corrections

1. Rebuild the matrix on `docs/decisions.md:15`:
   - `gpt-6.2-sol` is the default.
   - The Terra minority comes from the "Yes" rows in §2.
   - `security-expert` is labelled as a cyber-capability exception.
2. Retire `max`: move all three current `max` agents to `high`. Add a "zero `max`" assertion next to "zero `ultra`" in both test files. Remove `max` and `ultra` from the agent effort type; the installer is unaffected (§3).
3. Collapse the tiers to what the decision implies, for example `DEFAULT` (Sol medium), `JUDGE` (Sol high, including the former gates), `NON_CORE` (Terra medium) and `SECURITY` (Terra high). Delete the benchmark (§4) and the owner-go step. Phases 1 and 2 ship as one mandate. Rule 12 (`03-agent-teams.md:23`) is satisfied by quoting `docs/decisions.md:14-15` in the task PRD entry.
4. Keep the expected values independent in the tests: a test-local literal `EXPECTED_TIER_PROFILES` and a test-local allowed-model list. A model switch then means one table in source plus one in the test.
5. Keep the literal `export const AGENT_MODEL_PROFILES` anchor, or make `agent-tier-matrix.test.ts:105` fail when `indexOf` returns -1.
6. Add the missing lines from §4 to Lots B and C, and give someone the new `agents.md` History section.
7. In A5, drop "pilot-locked TOML" as a reason for keeping the model. `security-agent-pilot.test.ts:78-81` reads the model from `AGENT_MODEL_PROFILES`, so the lock follows whatever is chosen. Keep the Cyber Utility citation.
8. Replace "no 6.2 low-effort data" with the Artificial Analysis per-effort table (§1) in the design, the research report and the policy rationale.

## Untested hypotheses (remaining)

- Sol 6.2 obeys "no tools" briefs.
- Sol 6.2 hits no capacity errors in launch week.
- Sol 6.2 vision/UI is at least Terra-level (`design-expert`).
- The Artificial Analysis cost per task at medium is unpublished.

All four are to be observed in the real-condition run, not gated before applying.

## Sources checked

- fuse-browser: the 4 Artificial Analysis / OpenAI / API URLs above, plus the system card with a cyber and obstacle focus.
- Code read:
  - `scripts/lib/agent-toml.ts:7-94`
  - `scripts/lib/agent-toml.test.ts:8-82`
  - `scripts/lib/agent-tier-matrix.test.ts:1-115`
  - `scripts/lib/security-agent-pilot.test.ts:78-81`
  - `scripts/lib/install/config-options.ts:15`
  - `scripts/lib/install/config-model-options.ts:1-20`
  - `plugins/codex-rules/rules/03-agent-teams.md:23`
  - `docs/decisions.md:11,14,15`
  - `docs/workflow/agents.md:7-93`
  - The description and sandbox lines of the candidate agents' TOMLs.
- Greps:
  - Model ids and stale counts across the repo.
  - Model, effort and `ultra` across the agent-creator skill, `creating-skills-agents.md` and `README.md`.
- Disk diff: the 40 TOMLs vs the design matrix.

**Recommendation:** block the design as written. Revise it per corrections 1-8, then apply in one mandate with the real-condition run as the only check.

## Product lens: RUN

This is a behaviour change (models and efforts) plus a new encoding.

1. **Coherence: OK.** The role tiers replace `TERRA_MEDIUM/HIGH/MAX` (`agent-toml.ts:13-15`) rather than adding a second table. A grep of `scripts/lib` found no other profile table.
2. **Usability: ISSUE — as designed, applying the decision goes from 2 steps to 4 (harder).**
   - Before: edit the matrix, then `sync:agents` and the tests.
   - As designed: cleanup, benchmark, owner go, values.
   - A future switch becomes simpler: about 9 files of literals before, 1 source table + 1 test table + the policy paragraph after.
   - Suggestion: one mandate (cleanup + values) with the real-condition run as the only check → gain: the owner's decision applies with no extra owner step.
3. **Consistency: ISSUE.**
   - The upper-case tier names match `agent-toml.ts:13-15`.
   - But three tiers encode a `max` the owner retired (`docs/decisions.md:15`).
   - Suggestion: the collapsed role tiers in correction 3 → gain: no dead tier, and the names match the policy wording in `agents.md`.
