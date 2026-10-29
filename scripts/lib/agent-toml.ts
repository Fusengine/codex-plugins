import { parseFrontmatter } from "./yaml.ts";
import { adaptAgentDescription, adaptAgentInstructions } from "./agent-adapter.ts";
import { identityNicknames, normalizeSkillNames } from "./agent-names.ts";
import { skillConfigLines, tomlArray, tomlMultiline, tomlString } from "./agent-toml-format.ts";
import type { AgentTomlOptions } from "./agent.types.ts";

/** A supported Codex model and reasoning-effort pair (Terra 6.1 only since 2026-10-29). */
type ModelProfile = {
	model: "gpt-6.1-terra";
	effort: "medium" | "high" | "max";
};

const TERRA_MEDIUM: ModelProfile = { model: "gpt-6.1-terra", effort: "medium" };
const TERRA_HIGH: ModelProfile = { model: "gpt-6.1-terra", effort: "high" };
const TERRA_MAX: ModelProfile = { model: "gpt-6.1-terra", effort: "max" };

/**
 * Canonical shipped-agent policy (38 agents, GPT-6.1 Terra fleet, applied
 * 2026-10-29): 30 `gpt-6.1-terra` `medium` + 5 `high` + 3 `max`, zero Sol,
 * no `ultra`.
 *
 * Owner decision (verbatim, 2026-10-29): "That is 30 + 5 + 3 = 38 agents. No
 * agent stays on Sol. Do not use `ultra`, which adds automatic sub-agent
 * delegation and was not part of the decision."
 * Rationale (blind benchmark, 2026-10-29): Terra medium equals Sol medium on
 * code executors (27/27 hidden tests, same blind Laravel review 31/40, 1.5x
 * faster, 3x cheaper); Terra max won every visual test; Sol won no test.
 *
 * Resulting matrix: `max` (3) is `design-expert`, `challenger`,
 * `security-expert`. `high` (5) is `sniper`, `brainstorming`,
 * `prompt-engineer`, `skill-creator`, `solid-orchestrator`. `medium` (30) is
 * every other agent, including the code executors and `commit`.
 *
 * Superseded policies (GPT-5.6 tiers; the 2026-09-23 GPT-6 Sol/Luna split and
 * its benchmark; the 2026-09-27 all-`gpt-6-sol` state; the 2026-09-30
 * all-`gpt-6.1-sol` state) live only in docs/workflow/agents.md § History.
 */
export const AGENT_MODEL_PROFILES: Record<string, ModelProfile> = {
	"astro-expert": TERRA_MEDIUM,
	"go-expert": TERRA_MEDIUM,
	"laravel-expert": TERRA_MEDIUM,
	"nextjs-expert": TERRA_MEDIUM,
	"php-expert": TERRA_MEDIUM,
	"react-expert": TERRA_MEDIUM,
	"rust-expert": TERRA_MEDIUM,
	"shadcn-ui-expert": TERRA_MEDIUM,
	"swift-expert": TERRA_MEDIUM,
	"tailwindcss-expert": TERRA_MEDIUM,
	"tanstack-start-expert": TERRA_MEDIUM,
	"typescript-expert": TERRA_MEDIUM,
	"sniper-faster": TERRA_MEDIUM,
	websearch: TERRA_MEDIUM,
	cartographer: TERRA_MEDIUM,
	"commit-detector": TERRA_MEDIUM,
	"seo-images": TERRA_MEDIUM,
	"seo-sitemap": TERRA_MEDIUM,
	brainstorming: TERRA_HIGH,
	"solid-orchestrator": TERRA_HIGH,
	commit: TERRA_MEDIUM,
	"explore-codebase": TERRA_MEDIUM,
	"research-expert": TERRA_MEDIUM,
	"changelog-watcher": TERRA_MEDIUM,
	"lessons-compactor": TERRA_MEDIUM,
	"seo-expert": TERRA_MEDIUM,
	"seo-content": TERRA_MEDIUM,
	"seo-geo": TERRA_MEDIUM,
	"seo-local": TERRA_MEDIUM,
	"seo-cluster": TERRA_MEDIUM,
	"seo-technical": TERRA_MEDIUM,
	"seo-schema": TERRA_MEDIUM,
	sniper: TERRA_HIGH,
	"prompt-engineer": TERRA_HIGH,
	challenger: TERRA_MAX,
	"security-expert": TERRA_MAX,
	"skill-creator": TERRA_HIGH,
	"design-expert": TERRA_MAX,
};

/** New agents default to the standard execution profile until explicitly classified. */
const FALLBACK_PROFILE = TERRA_MEDIUM;

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
