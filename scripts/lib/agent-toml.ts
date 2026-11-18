import { parseFrontmatter } from "./yaml.ts";
import { adaptAgentDescription, adaptAgentInstructions } from "./agent-adapter.ts";
import { identityNicknames, normalizeSkillNames } from "./agent-names.ts";
import { skillConfigLines, tomlArray, tomlMultiline, tomlString } from "./agent-toml-format.ts";
import type { AgentTomlOptions } from "./agent.types.ts";

/** Codex model ids the fleet may use. `max` and `ultra` efforts are deliberately not representable. */
export type AgentModel = "gpt-6.2-sol" | "gpt-6.1-terra";

/** Reasoning efforts the fleet may use (`max` retired fleet-wide, `ultra` excluded). */
export type AgentEffort = "medium" | "high";

/** A supported Codex model and reasoning-effort pair. */
export type ModelProfile = {
	model: AgentModel;
	effort: AgentEffort;
};

/** Role-named tiers: a tier says what an agent is for, never which model it runs. */
export type AgentTier = "DEFAULT" | "JUDGE" | "NON_CORE" | "SECURITY";

/**
 * The model and effort of each role tier, defined once. Owner decisions
 * (dated, docs/decisions.md): 2026-11-18 "Sol 6.2 fleet" made the Sol 6.2
 * model the fleet default, kept the Terra 6.1 model only for a minority of
 * non-core tasks, and retired effort `max` in favour of `high` (`ultra` stays
 * excluded); 2026-11-18 "Sol 6.2 matrix approved" fixed the 40-agent split:
 * `DEFAULT` (25 agents, the code executors, `commit`, explorers, SEO), `JUDGE`
 * (7: `sniper`, `challenger`, `brainstorming`, `prompt-engineer`,
 * `skill-creator`, `solid-orchestrator`, `design-expert`), `NON_CORE` (7:
 * utility agents such as `websearch` and `sniper-faster`) and `SECURITY` (1:
 * `security-expert`, a capability exception that stays on the Terra model).
 * Superseded policies and their rationale live only in docs/workflow/agents.md
 * § Model Policy.
 */
export const TIER_PROFILES: Record<AgentTier, ModelProfile> = {
	DEFAULT: { model: "gpt-6.2-sol", effort: "medium" },
	JUDGE: { model: "gpt-6.2-sol", effort: "high" },
	NON_CORE: { model: "gpt-6.1-terra", effort: "medium" },
	SECURITY: { model: "gpt-6.1-terra", effort: "high" },
};

/**
 * Shipped-agent classification (40 agents: 25 DEFAULT, 7 JUDGE, 7 NON_CORE,
 * 1 SECURITY; owner decisions 2026-11-18, docs/decisions.md). Counts live in
 * the contract tests too, which keep their own literal tables.
 */
export const AGENT_TIERS: Record<string, AgentTier> = {
	"astro-expert": "DEFAULT",
	commit: "DEFAULT",
	"devops-expert": "DEFAULT",
	"explore-codebase": "DEFAULT",
	"go-expert": "DEFAULT",
	"hermes-expert": "DEFAULT",
	"laravel-expert": "DEFAULT",
	"lessons-compactor": "DEFAULT",
	"nextjs-expert": "DEFAULT",
	"php-expert": "DEFAULT",
	"react-expert": "DEFAULT",
	"research-expert": "DEFAULT",
	"rust-expert": "DEFAULT",
	"seo-cluster": "DEFAULT",
	"seo-content": "DEFAULT",
	"seo-expert": "DEFAULT",
	"seo-geo": "DEFAULT",
	"seo-local": "DEFAULT",
	"seo-schema": "DEFAULT",
	"seo-technical": "DEFAULT",
	"shadcn-ui-expert": "DEFAULT",
	"swift-expert": "DEFAULT",
	"tailwindcss-expert": "DEFAULT",
	"tanstack-start-expert": "DEFAULT",
	"typescript-expert": "DEFAULT",
	sniper: "JUDGE",
	challenger: "JUDGE",
	brainstorming: "JUDGE",
	"prompt-engineer": "JUDGE",
	"skill-creator": "JUDGE",
	"solid-orchestrator": "JUDGE",
	"design-expert": "JUDGE",
	"commit-detector": "NON_CORE",
	cartographer: "NON_CORE",
	"seo-images": "NON_CORE",
	"seo-sitemap": "NON_CORE",
	"sniper-faster": "NON_CORE",
	websearch: "NON_CORE",
	"changelog-watcher": "NON_CORE",
	"security-expert": "SECURITY",
};

/** Per-agent {model, effort}, derived from {@link AGENT_TIERS} and {@link TIER_PROFILES}. */
export const AGENT_MODEL_PROFILES: Record<string, ModelProfile> = Object.fromEntries(
	Object.entries(AGENT_TIERS).map(([name, tier]) => [name, TIER_PROFILES[tier]]),
);

/** New agents default to the DEFAULT tier until explicitly classified. */
const FALLBACK_PROFILE = TIER_PROFILES.DEFAULT;

const WRITE_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

/** Resolve the configured Codex profile for a named source agent. */
function resolveModelProfile(name: string): ModelProfile {
	return AGENT_MODEL_PROFILES[name] ?? FALLBACK_PROFILE;
}

function sandboxFor(tools: string[] | undefined): string {
	if (!tools || tools.length === 0) return "read-only";
	return tools.some((tool) => WRITE_TOOLS.has(tool)) ? "workspace-write" : "read-only";
}

/** Convert one YAML-frontmatter agent source into Codex custom agent TOML. */
export function buildAgentToml(raw: string, options?: AgentTomlOptions): string {
	const { data, body } = parseFrontmatter(raw);
	const name = String(data.name ?? "unnamed");
	const description = adaptAgentDescription(String(data.description ?? ""));
	const profile = resolveModelProfile(name);
	const nicknames = identityNicknames(name, data.nickname_candidates);
	const declaredSkills = normalizeSkillNames(data.skills);
	const skillNames = declaredSkills.length > 0 ? declaredSkills : options?.fallbackSkillNames ?? [];
	const skillPaths = options?.resolveSkillPaths(skillNames) ?? [];
	const tools = Array.isArray(data.tools) ? data.tools : data.tools ? [String(data.tools)] : [];
	const sandbox = sandboxFor(tools);
	const instructions = adaptAgentInstructions(body.trim());

	const lines = [
		`name = ${tomlString(name)}`,
		`description = ${tomlString(description)}`,
		`model = ${tomlString(profile.model)}`,
		`model_reasoning_effort = ${tomlString(profile.effort)}`,
		`nickname_candidates = ${tomlArray(nicknames)}`,
		`sandbox_mode = ${tomlString(sandbox)}`,
		...tomlMultiline("developer_instructions", instructions),
		...skillConfigLines(skillPaths),
		"",
	];
	return lines.join("\n");
}
