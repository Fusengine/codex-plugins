import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "smol-toml";
import { buildAgentToml } from "./agent-toml";
import { agentRoleViolations } from "./agent-role-validation";

/** Literal expected matrix, written out here on purpose: independent of `agent-toml.ts`. */
const DEFAULT_TIER = [
	"astro-expert", "commit", "devops-expert", "explore-codebase", "go-expert", "hermes-expert", "laravel-expert",
	"lessons-compactor", "nextjs-expert", "php-expert", "react-expert", "research-expert", "rust-expert",
	"seo-cluster", "seo-content", "seo-expert", "seo-geo", "seo-local", "seo-schema", "seo-technical",
	"shadcn-ui-expert", "swift-expert", "tailwindcss-expert", "tanstack-start-expert", "typescript-expert",
];
const JUDGE_TIER = ["sniper", "challenger", "brainstorming", "prompt-engineer", "skill-creator", "solid-orchestrator"];
const DESIGN_TIER = ["design-expert"];
const NON_CORE_TIER = ["commit-detector", "cartographer", "seo-images", "seo-sitemap", "sniper-faster", "websearch", "changelog-watcher"];
const SECURITY_TIER = ["security-expert"];

const EXPECTED_PROFILES: Record<string, readonly [string, string]> = Object.fromEntries([
	...DEFAULT_TIER.map((name) => [name, ["gpt-6.2-sol", "medium"]]),
	...JUDGE_TIER.map((name) => [name, ["gpt-6.2-sol", "high"]]),
	...DESIGN_TIER.map((name) => [name, ["gpt-6.2-sol", "max"]]),
	...NON_CORE_TIER.map((name) => [name, ["gpt-6.1-terra", "medium"]]),
	...SECURITY_TIER.map((name) => [name, ["gpt-6.1-terra", "high"]]),
]);

function agentSource(name: string, model?: string): string {
	const metadata = [`name: ${name}`, "description: Test agent"];
	if (model) metadata.push(`model: ${model}`);
	return `---\n${metadata.join("\n")}\n---\nTest instructions.`;
}

test("selects name-specific profiles over Claude source model tiers", () => {
	const scenarios = [
		{ name: "design-expert", input: "sonnet", expectedModel: "gpt-6.2-sol", expectedEffort: "max" },
		{ name: "challenger", input: "opus", expectedModel: "gpt-6.2-sol", expectedEffort: "high" },
		{ name: "sniper", input: "opus", expectedModel: "gpt-6.2-sol", expectedEffort: "high" },
		{ name: "security-expert", input: "opus", expectedModel: "gpt-6.1-terra", expectedEffort: "high" },
		{ name: "commit", input: "opus", expectedModel: "gpt-6.2-sol", expectedEffort: "medium" },
		{ name: "sniper-faster", input: "haiku", expectedModel: "gpt-6.1-terra", expectedEffort: "medium" },
		{ name: "typescript-expert", input: "sonnet", expectedModel: "gpt-6.2-sol", expectedEffort: "medium" },
		{ name: "future-agent", input: "opus", expectedModel: "gpt-6.2-sol", expectedEffort: "medium" },
	];

	for (const scenario of scenarios) {
		const toml = buildAgentToml(agentSource(scenario.name, scenario.input));
		expect(toml).toContain(`model = "${scenario.expectedModel}"`);
		expect(toml).toContain(`model_reasoning_effort = "${scenario.expectedEffort}"`);
	}
});

/** Every agent TOML the repo ships, keyed by the `name` it declares. */
function shippedAgentConfigs(): Map<string, Record<string, unknown>> {
	const configs = new Map<string, Record<string, unknown>>();
	for (const plugin of readdirSync("plugins")) {
		const agentsDir = join("plugins", plugin, "agents");
		try {
			for (const file of readdirSync(agentsDir).filter((name) => name.endsWith(".toml"))) {
				const config = parse(readFileSync(join(agentsDir, file), "utf8"));
				configs.set(String(config.name), config);
			}
		} catch { /* plugin has no agents */ }
	}
	return configs;
}

test("ships the exact 40-agent (25 default / 6 judge / 1 design / 7 non-core / 1 security) model and reasoning-effort matrix", () => {
	const configs = shippedAgentConfigs();

	expect(configs.size).toBe(40);
	expect([...configs.keys()].sort()).toEqual(Object.keys(EXPECTED_PROFILES).sort());
	for (const [name, [model, effort]] of Object.entries(EXPECTED_PROFILES)) {
		expect(configs.get(name)?.model).toBe(model);
		expect(configs.get(name)?.model_reasoning_effort).toBe(effort);
	}

	expect(DEFAULT_TIER).toHaveLength(25);
	expect(new Set(DEFAULT_TIER).size).toBe(25);
	expect(JUDGE_TIER).toHaveLength(6);
	expect(DESIGN_TIER).toHaveLength(1);
	expect(NON_CORE_TIER).toHaveLength(7);
	expect(SECURITY_TIER).toHaveLength(1);
	expect([...configs.values()].filter((config) => !["gpt-6.2-sol", "gpt-6.1-terra"].includes(String(config.model)))).toEqual([]);
	expect([...configs.values()].filter((config) => !["medium", "high", "max"].includes(String(config.model_reasoning_effort)))).toEqual([]);
	expect([...configs.values()].filter((config) => String(config.model_reasoning_effort) === "ultra")).toEqual([]);
	// `max` is a named exception (owner decision 2026-11-19): design-expert only.
	expect([...configs].filter(([, config]) => String(config.model_reasoning_effort) === "max").map(([name]) => name)).toEqual(DESIGN_TIER);
});

test("every shipped agent survives Codex agent role validation", () => {
	const violations = [...shippedAgentConfigs()].flatMap(([agent, config]) => agentRoleViolations(agent, config));

	expect(violations).toEqual([]);
});
