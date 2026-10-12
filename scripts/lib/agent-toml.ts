import { parseFrontmatter } from "./yaml.ts";
import { adaptAgentDescription, adaptAgentInstructions } from "./agent-adapter.ts";
import { identityNicknames, normalizeSkillNames } from "./agent-names.ts";
import { skillConfigLines, tomlArray, tomlMultiline, tomlString } from "./agent-toml-format.ts";
import type { AgentTomlOptions } from "./agent.types.ts";

/** A supported Codex model and reasoning-effort pair (Sol 6.1 only since 2026-09-30). */
type ModelProfile = {
	model: "gpt-6.1-sol";
	effort: "medium" | "high";
};

const SOL_MEDIUM: ModelProfile = { model: "gpt-6.1-sol", effort: "medium" };
const SOL_HIGH: ModelProfile = { model: "gpt-6.1-sol", effort: "high" };

/**
 * Canonical shipped-agent policy (38 agents, GPT-6.1 fleet, applied
 * 2026-09-30): 37 `gpt-6.1-sol` `medium` + 1 `gpt-6.1-sol` `high`, zero Luna.
 * 2026-10-12: `skill-creator` added at the new-agent default (`medium`).
 *
 * Owner decision (verbatim, 2026-09-30): "okay passe les tous en v 6.1".
 * Every agent moves from `gpt-6-sol` to `gpt-6.1-sol`; efforts are unchanged.
 *
 * Resulting matrix: `high` is `design-expert` only (1 agent) —
 * one-shot-correctness gate, unchanged. `medium` (37) is every other
 * agent, including `security-expert`, `challenger`, `commit`, and `sniper`.
 *
 * Superseded policies (GPT-5.6 tiers; the 2026-09-23 GPT-6 Sol/Luna split and
 * its benchmark; the 2026-09-27 all-`gpt-6-sol` state) live only in
 * docs/workflow/agents.md § History.
 */
export const AGENT_MODEL_PROFILES: Record<string, ModelProfile> = {
	"astro-expert": SOL_MEDIUM,
	"go-expert": SOL_MEDIUM,
	"laravel-expert": SOL_MEDIUM,
	"nextjs-expert": SOL_MEDIUM,
	"php-expert": SOL_MEDIUM,
	"react-expert": SOL_MEDIUM,
	"rust-expert": SOL_MEDIUM,
	"shadcn-ui-expert": SOL_MEDIUM,
	"swift-expert": SOL_MEDIUM,
	"tailwindcss-expert": SOL_MEDIUM,
	"tanstack-start-expert": SOL_MEDIUM,
	"typescript-expert": SOL_MEDIUM,
	"sniper-faster": SOL_MEDIUM,
	websearch: SOL_MEDIUM,
	cartographer: SOL_MEDIUM,
	"commit-detector": SOL_MEDIUM,
	"seo-images": SOL_MEDIUM,
	"seo-sitemap": SOL_MEDIUM,
	brainstorming: SOL_MEDIUM,
	"solid-orchestrator": SOL_MEDIUM,
	commit: SOL_MEDIUM,
	"explore-codebase": SOL_MEDIUM,
	"research-expert": SOL_MEDIUM,
	"changelog-watcher": SOL_MEDIUM,
	"lessons-compactor": SOL_MEDIUM,
	"seo-expert": SOL_MEDIUM,
	"seo-content": SOL_MEDIUM,
	"seo-geo": SOL_MEDIUM,
	"seo-local": SOL_MEDIUM,
	"seo-cluster": SOL_MEDIUM,
	"seo-technical": SOL_MEDIUM,
	"seo-schema": SOL_MEDIUM,
	sniper: SOL_MEDIUM,
	"prompt-engineer": SOL_MEDIUM,
	challenger: SOL_MEDIUM,
	"security-expert": SOL_MEDIUM,
	"skill-creator": SOL_MEDIUM,
	"design-expert": SOL_HIGH,
};

/** New agents default to the standard execution profile until explicitly classified. */
const FALLBACK_PROFILE = SOL_MEDIUM;

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
