import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "smol-toml";
import { buildAgentToml } from "./agent-toml";
import { agentRoleViolations } from "./agent-role-validation";

const TERRA_MEDIUM = [
	"laravel-expert", "nextjs-expert", "react-expert", "typescript-expert", "php-expert", "astro-expert",
	"tanstack-start-expert", "swift-expert", "go-expert", "rust-expert", "tailwindcss-expert", "shadcn-ui-expert",
	"sniper-faster", "explore-codebase", "research-expert", "websearch", "cartographer", "changelog-watcher",
	"commit-detector", "commit", "lessons-compactor", "seo-cluster", "seo-content", "seo-expert", "seo-geo",
	"seo-images", "seo-local", "seo-schema", "seo-sitemap", "seo-technical",
];
const TERRA_HIGH = ["sniper", "brainstorming", "prompt-engineer", "skill-creator", "solid-orchestrator"];
const TERRA_MAX = ["design-expert", "challenger", "security-expert"];

const EXPECTED_PROFILES: Record<string, readonly [string, string]> = Object.fromEntries([
	...TERRA_MEDIUM.map((name) => [name, ["gpt-6.1-terra", "medium"]]),
	...TERRA_HIGH.map((name) => [name, ["gpt-6.1-terra", "high"]]),
	...TERRA_MAX.map((name) => [name, ["gpt-6.1-terra", "max"]]),
]);

function agentSource(name: string, model?: string): string {
	const metadata = [`name: ${name}`, "description: Test agent"];
	if (model) metadata.push(`model: ${model}`);
	return `---\n${metadata.join("\n")}\n---\nTest instructions.`;
}

test("selects name-specific profiles over Claude source model tiers", () => {
	const scenarios = [
		{ name: "design-expert", input: "sonnet", expectedModel: "gpt-6.1-terra", expectedEffort: "max" },
		{ name: "challenger", input: "opus", expectedModel: "gpt-6.1-terra", expectedEffort: "max" },
		{ name: "security-expert", input: "opus", expectedModel: "gpt-6.1-terra", expectedEffort: "max" },
		{ name: "commit", input: "opus", expectedModel: "gpt-6.1-terra", expectedEffort: "medium" },
		{ name: "sniper-faster", input: "haiku", expectedModel: "gpt-6.1-terra", expectedEffort: "medium" },
		{ name: "sniper", input: "opus", expectedModel: "gpt-6.1-terra", expectedEffort: "high" },
		{ name: "typescript-expert", input: "sonnet", expectedModel: "gpt-6.1-terra", expectedEffort: "medium" },
		{ name: "future-agent", input: "opus", expectedModel: "gpt-6.1-terra", expectedEffort: "medium" },
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

test("ships the exact 38-agent model and reasoning-effort matrix", () => {
	const configs = shippedAgentConfigs();

	expect(configs.size).toBe(38);
	expect([...configs.keys()].sort()).toEqual(Object.keys(EXPECTED_PROFILES).sort());
	for (const [name, [model, effort]] of Object.entries(EXPECTED_PROFILES)) {
		expect(configs.get(name)?.model).toBe(model);
		expect(configs.get(name)?.model_reasoning_effort).toBe(effort);
	}

	expect(TERRA_MEDIUM).toHaveLength(30);
	expect(new Set(TERRA_MEDIUM).size).toBe(30);
	expect(TERRA_HIGH).toHaveLength(5);
	expect(TERRA_MAX).toHaveLength(3);
	expect([...configs.values()].filter((config) => String(config.model) !== "gpt-6.1-terra")).toEqual([]);
	expect([...configs.values()].filter((config) => String(config.model) === "gpt-6.1-sol")).toEqual([]);
	expect([...configs.values()].filter((config) => String(config.model_reasoning_effort) === "ultra")).toEqual([]);
});

test("every shipped agent survives Codex agent role validation", () => {
	const violations = [...shippedAgentConfigs()].flatMap(([agent, config]) => agentRoleViolations(agent, config));

	expect(violations).toEqual([]);
});
