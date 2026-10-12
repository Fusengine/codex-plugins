import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..");
const agentsPath = "AGENTS.md";
const orchestrationPath = "plugins/ai-pilot/skills/lead-orchestration/SKILL.md";
const lessonsPath = "plugins/lessons/agents/lessons-compactor.toml";
const read = (path: string): string => readFileSync(join(root, path), "utf8");
const agents = read(agentsPath);
const legacyBaselineProvenance = {
	headCommit: "1de3384f6161ea6aa237f7dec67e87d70f1d4fd3",
	contentSha256: "781deb3c586095f4ab3bffb904063f50d5fa292d45abb528af4004a9a76637e3",
	lines: 135,
	bytes: 18_703,
} as const;

const routeRoots: Record<string, string> = { "ai-pilot": "plugins/ai-pilot/skills", "commit-pro": "plugins/commit-pro/skills", solid: "plugins/solid/skills" };
const requiredRoutes = ["$ai-pilot:lead-orchestration", "$ai-pilot:apex-methodology", "$ai-pilot:research", "$ai-pilot:fuse-browser-usage", "$ai-pilot:elicitation", "$ai-pilot:challenge", "$ai-pilot:verification", "$ai-pilot:code-quality", "$commit-pro:commit", "$commit-pro:git-flow", "$solid:solid-detection"];

type Disposition = "preserved" | "superseded";
type MaterialLegacyContractEntry = { id: string; legacyEvidence: string; disposition: Disposition; destination: string; required: RegExp[]; rationale: string };
type Route = Pick<MaterialLegacyContractEntry, "destination" | "required">;
const a = (...required: RegExp[]): Route => ({ destination: agentsPath, required });
const o = (...required: RegExp[]): Route => ({ destination: orchestrationPath, required });
const p = (id: string, legacyEvidence: string, route: Route, rationale = "The compact destination preserves the normative behavior."): MaterialLegacyContractEntry => ({ id, legacyEvidence, disposition: "preserved", ...route, rationale });
const s = (id: string, legacyEvidence: string, route: Route, rationale: string): MaterialLegacyContractEntry => ({ id, legacyEvidence, disposition: "superseded", ...route, rationale });

const materialLegacyInventory: MaterialLegacyContractEntry[] = [
	p("git-authorization", "NEVER git commit / push / reset", a(/NEVER commit, push, reset.*without explicit user authorization.*Read-only Git is allowed/is)),
	s("reversible-edit-authorization", "NEVER modify files", a(/clear request.*authorizes reversible edits.*Do not ask again/is), "The owner corrected redundant permission prompts; an explicit change request now authorizes reversible in-scope edits."),
	p("scope-and-secrets", "NEVER write outside the mandate", a(/NEVER write outside the mandate.*real secrets.*setup\.sh.*install\*\.ts/is)),
	p("exclusive-folder-owner", "ONE folder = ONE owner", o(/one folder = one owner.*disjoint file lots/is)),
	p("real-agent-stop", "A message does NOT stop an agent", o(/message does not stop an agent.*interrupt_agent.*TaskStop.*mtimes are stable/is)),
	p("sole-file-cap", "no size, line or file-count cap", a(/FUSE_SOLID_MAX_LINES.*only allowed file-size ceiling.*No skill or guide may impose any other size, line, file-count, change-size, or PR-size cap/is)),
	p("mtime-is-not-proof", "A recent mtime proves a file was touched", a(/recent mtime proves only that a file was touched.*Re-measure and prove the named defect/is)),
	p("visual-evidence-first", "VISUAL defect: screenshot BEFORE naming a cause", a(/visual defect.*current screenshot before naming a cause/i)),
	p("named-defect-verdict", "A short positive verdict is not necessarily global", a(/prove the named defect itself before reporting progress or completion/i)),
	p("owner-correction", "When a human verdict contradicts your measurement", a(/owner correction overrides conflicting measurements.*every active and future mandate/is)),
	p("two-failed-delegations", "After 2 failed delegations on a localised, already-measured defect: read and fix it yourself.", a(/After 2 failed delegations on a localised, already-measured defect, the lead reads and fixes it itself \(the only case where the lead edits\); any other blocked mandate past the 3-cycle cap is escalated to the owner with a root-cause note\./)),
	p("latest-stable", "ALWAYS use latest stable versions for the current year", a(/in-mandate technology choices.*latest stable versions for the current year.*verify.*never expand scope merely to upgrade/is)),
	p("skeptical-posture", "Posture: skeptical, analytical, direct, ultra-concise.", a(/skeptical, analytical full-stack engineer.*I don't know/is)),
	p("expert-owner", "User = expert engineer who knows the system better than you", a(/Treat the user as the domain expert.*omit filler or basic tutorials/is)),
	p("concise-communication", "Writing style (ALWAYS): clear, concise, precise.", a(/Lead with the answer, stay direct and concise.*one answer is expected.*do not use exhaustive lists.*recap theory before the point.*restate what the user already knows/is)),
	p("always-delegate", "ALWAYS DELEGATE", a(/\*\*ALWAYS DELEGATE\.\*\*.*\$ai-pilot:lead-orchestration/is), "AGENTS retains only the trigger; the procedure is routed to lead-orchestration."),
	p("two-speed-briefing", "Two-speed communication, ALWAYS", o(/self-contained mandate.*Inputs:.*Expected outputs:.*Report:/is)),
	p("apex-order", "FULL APEX MANDATORY", a(/After Execute.*elicitation.*--auto.*challenge.*Functional completion.*verification.*challenge.*only after eLicit \+ challenger and Verify \+ challenger.*code-quality.*sniper/is)),
	p("domain-expert", "RIGHT AGENT FOR EACH TASK", o(/matching domain expert.*Never substitute a generic agent/is)),
	p("exit-contract", "EXIT CONTRACT", o(/Exit Contract.*Stop:.*Retry:.*Rollback:.*Ask:.*Escalate:/is)),
	p("irreversible-only-ask", "CLARIFY BEFORE IRREVERSIBLE", a(/Ask only before an irreversible action or a material expansion of scope/i)),
	p("sequential-thinking", "THINK SEQUENTIALLY (MCP)", a(/multi-step reasoning.*MUST invoke the sequential-thinking tool first/i)),
	p("read-before-action", "READ + EXPLORE before acting", a(/Read every target before editing it/i)),
	p("sniper-mandatory", "ALWAYS run `sniper`", a(/After any code, config, or documentation modification.*code-quality.*sniper agent/is)),
	p("challenger-mandatory", "ALWAYS run the `challenger`", a(/root-cause conclusion.*done\/verified claim.*irreversible action.*second attempt.*eLicit or Verify gate.*challenge.*challenger/is)),
	p("dry-grep", "NEVER duplicate code", a(/Before new code, grep for reusable implementations/i)),
	p("self-challenge", "Challenge own ideas via `research-expert` + fuse-browser fast-path before proposing.", a(/Before proposing any idea.*MUST challenge it through both.*\$ai-pilot:research.*\$ai-pilot:fuse-browser-usage/is)),
	p("technical-verification", "ALWAYS verify before ANY technical claim or API usage", a(/current facts or versions, uncertain APIs, or technical claims.*research.*fuse-browser-usage/is)),
	p("owner-attribution", "Any reference, URL, constraint or preference attributed to the owner must be citable", a(/fact, reference, URL, constraint, or preference attributed to the owner.*exact conversation turn or repository file/is)),
	p("new-hypothesis", "NEVER propose the same fix twice", a(/Never repeat a failed fix.*different documented hypothesis/is)),
	p("cartography", "Cartography (Step 1 of every task)", a(/injected\/current cartography path.*never a hardcoded cache-version path.*map.*leaf.*source/is)),
	p("executor-non-nesting", "Sub-agent reading this: the line above is not yours.", o(/spawned executor.*does not create another delegation tree unless explicitly assigned/is)),
	p("mandatory-analyze-trio", "ALWAYS launch ALL 3 agents in a SINGLE message", o(/Analyze always starts the trio in one parallel message.*explore-codebase.*research-expert.*domain expert/is)),
	s("lead-never-reads", "NEVER use Read/Glob/Grep yourself", o(/lead orchestrates and never executes task work.*Verify the artifact on disk/is), "The absolute tool ban prevented mandatory artifact verification; the lead remains non-executing but may verify read-only evidence."),
	p("target-read-exception", "file you are about to Edit — Read it yourself first", a(/Read every target before editing it/i)),
	s("smallest-delegation", "Scope ladder — take the smallest tool that suffices.", o(/no scope ladder and no "too small to delegate" case.*dependency graph.*assigned.*validated.*result against the disk/is), "Owner doctrine retains the full APEX workflow but replaces a fixed executor quota with dependency-based ownership."),
	s("team-ask-conflict", "Propose a subagent team", o(/explicitly asks for a team, start one immediately/is), "Reversible orchestration does not require a redundant question; explicit team requests execute immediately."),
	p("team-size", "team is MINIMUM 4 subagents", o(/team.*independent batches.*at least four agents/is)),
	p("three-experts", "at least three domain experts", o(/at least three domain experts matching the project stack.*disjoint file lots/is)),
	p("parallel-independence", "trigger is NOT the file count, it is the INDEPENDENCE", o(/parallel agents only for independent batches with disjoint ownership/i)),
	p("collision-preservation", "START FROM the on-disk state, preserving the other's contribution", o(/collision occurs.*one owner.*current on-disk state.*preserving both contributions/is)),
	p("v2-contract", "V2 contract", o(/\[features\.multi_agent_v2\].*tool_namespace.*exact `agent_type`.*bounded `fork_turns`.*Never omit.*"all"/is)),
	p("self-contained-mandate", "Mandate self-contained", o(/self-contained mandate.*Inputs:.*Expected outputs:.*Acceptance:.*Evidence:.*Report:/is)),
	p("post-report-verification", "Verify on disk after EACH report", o(/Verify the artifact on disk after every report/i)),
	p("validation-freeze", "validate only after ALL helpers finish", o(/Do not run final validation while writers are active.*Run no validation mid-flight/is)),
	p("agent-lifecycle", "Close completed subagents", o(/Stop or close every writer before the final sniper pass/is)),
	p("source-only", "ALWAYS work in dev/source repo", a(/Work only in the source repository.*dirty worktree.*unrelated edits/is)),
	s("automatic-deployed-sync", "Sync to deployed", a(/NEVER perform.*write\/sync directly to deployed.*without explicit authorization/is), "Automatic deployed sync conflicted with the hard stop; deployment writes now require an explicit mandate."),
	p("commit-from-source", "Commit from source repo only", a(/Work only in the source repository.*Commit, branch, PR, merge, tag, or release/is)),
	p("read-only-git", "Git read-only (status, log, diff)", a(/Read-only Git is allowed/i)),
	p("apex-route", "consult APEX skills first", a(/Create, build, implement, fix, refactor, debug.*\$ai-pilot:apex-methodology/is)),
	p("solid-route", "consult SOLID skills", a(/SOLID\/DRY architecture or refactor task.*\$solid:solid-detection.*matching `solid-\*` skill it selects/is)),
	s("duplicated-rules-corpus", "Full rule detail", a(/Keep delegation procedure out of this file.*Mandatory skill routes/is), "The owner required a compact AGENTS file with procedural detail routed to skills, not a duplicated rules corpus."),
	p("commit-route", "Commit/release → delegate to the", a(/Commit, branch, PR, merge, tag, or release.*\$commit-pro:commit.*\$commit-pro:git-flow.*never hand-roll/is)),
	p("memory-compaction", "Memory hygiene", a(/MEMORY\/LESSON\.md.*grows or accumulates near-duplicates.*MUST delegate.*lessons-compactor.*lessons-compact.*only proposes changes.*owner approval.*before any memory write/is)),
	p("debug-analysis", "Debug/investigation (\"why\", \"not working\", \"bug\", \"crash\")", a(/Create, build, implement, fix, refactor, debug.*apex-methodology/is)),
	p("apex-pipeline", "Brainstorm (skip for trivial fix/refactor/debug) -> Analyze", a(/After Execute.*elicitation.*challenge.*Functional completion.*verification.*challenge.*only after.*code-quality.*sniper/is)),
	p("solid-research", "Research first", a(/SOLID\/DRY architecture or refactor task.*solid-detection/is)),
	p("interfaces", "Interfaces separated", a(/SOLID\/DRY architecture or refactor task.*matching `solid-\*` skill/is)),
	p("export-docs", "JSDoc/PHPDoc", a(/Document every exported function.*JSDoc, PHPDoc, or equivalent API documentation/is)),
	p("dangling-references", "zero dangling refs after edit/split", a(/Preserve imports, exports, types, and readers/i)),
	p("green-completion", "never report done with failing checks", a(/Never report done with failing checks.*concrete evidence/is)),
	p("browser-fast-path", "Fast-path first", a(/cross-check the fuse-browser fast path, official docs\/Context7, and Exa.*docs over memory/is)),
	p("commit-workflow", "Prefer the Fusengine `commit-pro` workflow", a(/Commit, branch, PR, merge, tag, or release.*commit-pro:commit.*commit-pro:git-flow/is)),
	p("protected-branches", "Never commit directly on those branches", a(/NEVER commit directly on `main`, `master`, `develop`, or `production`/is)),
	p("merge-strategy", "never `--squash`", a(/Commit, branch, PR, merge, tag, or release.*commit-pro:git-flow/is), "Merge details remain in the routed git-flow skill; AGENTS retains the authorization boundary and route."),
	p("hook-compliance", "skipped until reviewed/trusted", a(/Never bypass, disable, evade, or retry around a hook or policy block.*Follow the returned instruction/is)),
	s("hook-event-inventory", "Official events: SessionStart", a(/Never bypass, disable, evade, or retry around a hook or policy block.*Follow the returned instruction/is), "A static event and environment inventory can drift; the compact invariant is to obey the current hook response and policy."),
	s("embedded-codex-rules", "Detailed rules are loaded by the `codex-rules` plugin", a(/Mandatory skill routes/is), "The owner required procedures to be routed through named skills while AGENTS stays compact; the old embedded corpus description is no longer authoritative here."),
	p("post-merge-tags", "tags are created POST-merge only", a(/Create release tags only after the merge is proven.*git merge-base --is-ancestor/is)),
	p("mcp-single-source", "MCP single source", a(/never add `mcpServers` to a plugin manifest.*mcp\.json\.bak/is)),
	p("rename-readers", "File renames", a(/rename or move.*grep the old basename repository-wide.*update every reader.*non-empty output/is)),
];

const globalContradictions = [
	"Do not follow this rule.", "The lead may edit task files after delegation.", "A mailbox message stops an agent.",
	"Run final validation while writers are active.", "Use --skip-elicit to bypass eLicit.", "The agent must ask the user to choose an elicitation technique.",
	"The agent may git commit, push, or reset without authorization.", "All files must stay under 100 lines.",
	"Load /Users/demo/.codex/plugins/cache/vendor/plugin/1.2.3/skills/example/SKILL.md.",
];
const forbiddenSemantics = [
	/(?:Do not|Never) (?:follow|apply|enforce) (?:this|the) rule/i,
	/\b(?:may|can|is authorized to)\s+(?:git\s+)?(?:commit|push|reset|force-push)\b/i,
	/\b(?:files?|lines?|changes?|PRs?)\b[^\n]{0,30}\b(?:under|below|over|above|max(?:imum)?|limit(?:ed)?|must stay under)\b[^\n]{0,20}\b(?:90|100|150|400)\b|\b(?:90|100|150|400)\b[^\n]{0,30}\b(?:lines?|files?|changes?|PRs?)\b/i,
	/\b(?:use|allow|accept|honou?r|run|invoke)\b[^\n]{0,30}--skip-elicit/i,
	/\b(?:must|should|will|may|can) ask (?:the )?user to (?:choose|pick|select)[^\n]*(?:elicitation|technique)/i,
	/(?:^|\n)(?![^\n]*(?:do not|never)[^\n]*validation)[^\n]{0,40}\b(?:run|start|perform) (?:final )?validation while writers are active/i,
	/lead (?:may|can|must|should|will) (?:edit|execute)/i,
	/(?:mailbox )?message (?:(?:does|will|can) stop|stops) an agent/i,
	/(?:skip|bypass)\s+(?:eLicit|Verify|sniper)\b/i,
	/\/\.codex\/plugins\/cache\/[^\s]+\/\d+\.\d+\.\d+/i,
];
const hasForbiddenSemantic = (text: string): boolean => forbiddenSemantics.some((pattern) => pattern.test(text));

test("every explicit AGENTS skill route resolves", () => {
	const routes = [...agents.matchAll(/\$([a-z0-9-]+):([a-z0-9-]+)/g)];
	const names = [...new Set(routes.map(([, namespace, skill]) => `$${namespace}:${skill}`))];
	expect(names.sort()).toEqual([...requiredRoutes].sort());
	for (const [, namespace, skill] of routes) expect(existsSync(join(root, routeRoots[namespace]!, skill, "SKILL.md")), `$${namespace}:${skill}`).toBe(true);
});

test("legacy baseline provenance is immutable metadata, not a runtime Git dependency", () => {
	expect(legacyBaselineProvenance.headCommit).toMatch(/^[0-9a-f]{40}$/);
	expect(legacyBaselineProvenance.contentSha256).toMatch(/^[0-9a-f]{64}$/);
	expect(legacyBaselineProvenance.lines).toBe(135);
	expect(legacyBaselineProvenance.bytes).toBe(18_703);
});

test("AGENTS explicitly routes memory compaction to the existing agent", () => {
	expect(existsSync(join(root, lessonsPath))).toBe(true);
	expect(agents).toMatch(/MEMORY\/LESSON\.md.*MUST delegate.*`lessons-compactor` agent.*owner approval.*before any memory write/is);
});

test("material legacy behavior inventory has explicit durable dispositions", () => {
	expect(new Set(materialLegacyInventory.map(({ id }) => id)).size).toBe(materialLegacyInventory.length);
	expect(new Set(materialLegacyInventory.map(({ legacyEvidence }) => legacyEvidence)).size).toBe(materialLegacyInventory.length);
	for (const entry of materialLegacyInventory) {
		expect(entry.legacyEvidence.trim(), entry.id).not.toBe("");
		expect(entry.rationale.trim(), `${entry.id}: rationale`).not.toBe("");
		const destination = read(entry.destination);
		for (const semantic of entry.required) expect(destination, `${entry.id} -> ${entry.destination}`).toMatch(semantic);
		expect(hasForbiddenSemantic(destination), `${entry.id}: destination contradiction`).toBe(false);
		if (entry.disposition === "preserved") for (const probe of globalContradictions) expect(hasForbiddenSemantic(`${destination}\n${probe}`), `${entry.id}: missed probe ${probe}`).toBe(true);
	}
});

test("adversarial checks reject contradictions without treating unrelated numbers as caps", () => {
	for (const probe of globalContradictions) expect(hasForbiddenSemantic(probe), probe).toBe(true);
	expect(hasForbiddenSemantic("The API rate limit is 100 requests per minute.")).toBe(false);
	expect(hasForbiddenSemantic("The test suite reports 100% coverage.")).toBe(false);
	expect(agents).not.toMatch(/mtime[^\n]*(?:minute|busy|stale)|TaskStop|interrupt_agent|fork_turns|agent_type|nickname|## Exit Contract/i);
});
