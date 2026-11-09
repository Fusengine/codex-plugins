import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..");
const read = (path: string): string => readFileSync(join(root, path), "utf8");

const policy = {
	agents: read("AGENTS.md"),
	orchestration: read("plugins/ai-pilot/skills/lead-orchestration/SKILL.md"),
	teams: read("plugins/codex-rules/rules/03-agent-teams.md"),
	quick: read("plugins/ai-pilot/commands/apex-quick.md"),
	// AGENTS.md "Mandatory skill routes" moved here on 2026-11-09 (docs/archive/2026-11-09-agents-v2/README.md).
	apex: read("plugins/codex-rules/rules/02-apex-workflow.md"),
} as const;

// Owner decision 2026-11-08: "Version Claude" — the Claude scope ladder replaces the Codex
// ≥3-experts / team-of-4 / no-scope-ladder floors; concurrency is capped at 6 ("on plafone a 6 alors").
const supersededFloors = /at least three domain experts|≥\s?3 (?:domain )?experts|no scope ladder|too small to delegate|at least four agents|team floor/i;
const policyTrees = ["plugins/ai-pilot", "plugins/codex-rules"];

/** List every markdown or TOML file (repo-relative) under the given repo-relative directories. */
const listPolicyFiles = (dirs: string[]): string[] =>
	dirs.flatMap((dir) =>
		(readdirSync(join(root, dir), { recursive: true }) as string[])
			.filter((file) => /\.(?:md|toml)$/.test(file))
			.map((file) => join(dir, file)),
	);
const concurrencyCap = /At most 6 agents run concurrently(?:\*\*)? — a ceiling, never a minimum/i;

test("code changes require the Analyze trio; read-only goes to explore-codebase alone", () => {
	expect(policy.agents).toMatch(/read-only question goes to `explore-codebase` alone.*anything that touches code starts Analyze with the trio `explore-codebase` \+ `research-expert` \+ the domain expert in one parallel message/is);
	expect(policy.orchestration).toMatch(/explore-codebase.*research-expert.*domain expert/is);
	expect(policy.teams).toMatch(/\$ai-pilot:lead-orchestration/i);
	expect(policy.teams).toMatch(/read-only question → `explore-codebase` alone.*touches code → the Analyze trio/is);
});

test("a trivial 1-3 line change goes to apex-quick with one delegated agent", () => {
	for (const source of [policy.agents, policy.orchestration, policy.teams]) {
		expect(source).toMatch(/trivial 1-3 line change (?:goes to|->|→) `\/?apex-quick`, one (?:delegated )?agent/i);
	}
	expect(policy.quick).toMatch(/trivial 1-3 line change runs here with one delegated domain expert: no Brainstorm, no Analyze trio, no team split/i);
	expect(policy.quick).not.toMatch(/trio always runs|even for a 1-line fix/i);
});

test("writers follow the dependency graph, one agent per task, capped at 6 concurrent", () => {
	expect(policy.orchestration).toMatch(/coupled.*one writer|one writer.*coupled/is);
	expect(policy.orchestration).toMatch(/independent.*(?:disjoint|ownership)|(?:disjoint|ownership).*independent/is);
	expect(policy.quick).toMatch(/\$ai-pilot:lead-orchestration/i);
	for (const source of [policy.agents, policy.orchestration, policy.teams]) {
		expect(source).toMatch(concurrencyCap);
		expect(source).toMatch(/waves of up to 6/i);
	}
	expect(policy.quick).toMatch(/at most 6 agents concurrently — a ceiling, never a minimum/i);
	for (const source of Object.values(policy)) expect(source).not.toMatch(supersededFloors);
});

test("no markdown or TOML policy file under ai-pilot or codex-rules restates a superseded floor", () => {
	const files = listPolicyFiles(policyTrees);
	expect(files.length).toBeGreaterThan(0);
	for (const file of files) expect(read(file), file).not.toMatch(supersededFloors);
});

test("an owner-requested team starts immediately, one named agent per task, up to 6 per wave", () => {
	expect(policy.agents).toMatch(/owner says "team", start one named agent per task immediately, up to 6 per wave, no debate/i);
	expect(policy.orchestration).toMatch(/explicitly asks for a team, start one immediately: one named agent per task, up to 6 per wave, no debate/i);
	expect(policy.teams).toMatch(/Owner says "team"\*\* → start one named agent per task immediately, up to 6 per wave/i);
});

test("APEX gates remain mandatory after execution", () => {
	for (const source of [policy.apex, policy.quick]) {
		expect(source).toMatch(/elicitation.*--auto.*challeng/is);
		expect(source).toMatch(/verification.*challeng/is);
		expect(source).toMatch(/sniper/is);
		expect(source).toMatch(/--skip-elicit.*ignored|ignore.*--skip-elicit/is);
	}
});
