import { expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { parse } from "smol-toml";
import { AGENT_MODEL_PROFILES } from "./agent-toml";
import { materializeAgentFiles } from "./install/agent-materializer";
import { agentProfile, command } from "./security-agent-pilot-run";

const AGENT_PATH = "plugins/security-expert/agents/security-expert.toml";
const BASELINE_PATH = "docs/validation/security-agent-pilot/baseline.toml";
const CASES_PATH = "docs/validation/security-agent-pilot/cases.json";
const AGENT_SOURCE = resolve(AGENT_PATH);

type AgentConfig = Record<string, unknown>;
type SkillConfig = { enabled?: unknown; path?: unknown };

function parsedConfig(path: string): AgentConfig {
	return parse(readFileSync(path, "utf8")) as AgentConfig;
}

function skillConfigs(config: AgentConfig): SkillConfig[] {
	const skills = config.skills;
	if (!skills || typeof skills !== "object") return [];
	const entries = (skills as AgentConfig).config;
	if (!Array.isArray(entries)) return [];
	return entries.filter((entry: unknown): entry is SkillConfig => Boolean(entry) && typeof entry === "object");
}

function normalizedSkills(config: AgentConfig): SkillConfig[] {
	return skillConfigs(config).map((skill) => ({
		enabled: skill.enabled,
		path: typeof skill.path === "string" ? relative(resolve("."), skill.path) : skill.path,
	}));
}

async function materializedConfig(): Promise<{ config: AgentConfig; cleanup: () => void }> {
	const root = mkdtempSync(join(tmpdir(), "security-agent-pilot-"));
	await materializeAgentFiles([{ plugin: "security-expert", file: "security-expert.toml", src: AGENT_SOURCE }], resolve("plugins"), root, { quiet: true });
	return { config: parsedConfig(join(root, "security-expert.toml")), cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

// Security plugin refresh port, claude-plugins v1.39.47, 2026-11-10: three routing triggers added to the description and skill `agentic-security` inserted after `auth-audit`.
const AGENTIC_SECURITY_SKILL: SkillConfig = { enabled: true, path: "plugins/security-expert/skills/agentic-security/SKILL.md" };
const AGENTIC_SECURITY_INDEX = 5;
const PORTED_DESCRIPTION =
	"Use when: security audit requested (whole repository or a change vs its merge base), scanning for OWASP Top 10, CVE research, dependency audit, secrets detection, auth hardening, agent-configuration review (.claude/, .mcp.json, hooks, plugins, skills). Do NOT use for: fixing the audited code (the caller dispatches the domain expert + sniper with this agent's findings), general code quality (use sniper), feature implementation.";
const DESCRIPTION_PORT_DELTA: ReadonlyArray<readonly [string, string]> = [
	["security audit requested,", "security audit requested (whole repository or a change vs its merge base),"],
	["auth hardening.", "auth hardening, agent-configuration review (.claude/, .mcp.json, hooks, plugins, skills)."],
	["Do NOT use for: ", "Do NOT use for: fixing the audited code (the caller dispatches the domain expert + sniper with this agent's findings), "],
];

function portedSkills(baseline: AgentConfig): SkillConfig[] {
	const skills = [...skillConfigs(baseline)];
	skills.splice(AGENTIC_SECURITY_INDEX, 0, AGENTIC_SECURITY_SKILL);
	return skills;
}

test("the v1.39.47 description port delta applies exactly once to the captured baseline description", () => {
	let description = String(parsedConfig(BASELINE_PATH).description);
	for (const [from, to] of DESCRIPTION_PORT_DELTA) {
		expect(description.split(from)).toHaveLength(2);
		description = description.replace(from, to);
	}
	expect(description).toEqual(PORTED_DESCRIPTION);
});

test("materialized security agent preserves the captured metadata and seven skills (six captured + agentic-security)", async () => {
	const baseline = parsedConfig(BASELINE_PATH);
	const { config, cleanup } = await materializedConfig();
	try {
		for (const field of ["name", "sandbox_mode", "nickname_candidates"]) {
			expect(config[field]).toEqual(baseline[field]);
		}
		expect(config.description).toEqual(PORTED_DESCRIPTION);
		expect(skillConfigs(baseline)[AGENTIC_SECURITY_INDEX - 1]?.path).toBe("plugins/security-expert/skills/auth-audit/SKILL.md");
		expect(config.model).toEqual(AGENT_MODEL_PROFILES["security-expert"]?.model);
		expect(config.model).toEqual(parsedConfig(AGENT_PATH).model);
		expect(config.model_reasoning_effort).toEqual(AGENT_MODEL_PROFILES["security-expert"]?.effort);
		expect(config.model_reasoning_effort).toEqual(parsedConfig(AGENT_PATH).model_reasoning_effort);
		expect(normalizedSkills(config)).toEqual(portedSkills(baseline));
		expect(skillConfigs(config)).toHaveLength(7);
		for (const skill of skillConfigs(config)) {
			expect(skill.enabled).toBe(true);
			expect(typeof skill.path).toBe("string");
			expect(existsSync(String(skill.path))).toBe(true);
		}
	} finally {
		cleanup();
	}
});

test("STATIC: the prompt separates audit reporting from remediation authority", () => {
	const instructions = String(parsedConfig(AGENT_PATH).developer_instructions);

	expect(instructions).toMatch(/provisional|uncertain|unverified reachability/i);
	expect(instructions).toMatch(/contextual severity|severity rationale/i);
	expect(instructions).toMatch(/confirmed.*dismissed.*unresolved|dismissed.*unresolved.*confirmed/is);
	expect(instructions).toMatch(/complete.*partial.*scope|partial.*scope.*complete/is);
	expect(instructions).toMatch(/remediation.*hand-?off|recommend.*remediation/i);
	expect(instructions).toMatch(/do not.*(?:auto-?fix|directly fix|invoke sniper)/i);
	expect(instructions).toMatch(/do not.*vulnerability[- ]free/i);
});

test("STATIC: the prompt requires dated evidence without fabricating certainty", () => {
	const instructions = String(parsedConfig(AGENT_PATH).developer_instructions);

	expect(instructions).toMatch(/dated.*(?:CVE|advisory|evidence)|(?:CVE|advisory|evidence).*dated/i);
	expect(instructions).toMatch(/do not fabricate.*(?:CVE|API|version)|(?:CVE|API|version).*do not fabricate/i);
});

test("STATIC: partial coverage cannot stop without a source ledger", () => {
	const instructions = String(parsedConfig(AGENT_PATH).developer_instructions);

	expect(instructions).toMatch(/source_ledger/i);
	expect(instructions).toMatch(/partial coverage.*Escalate|Escalate.*partial coverage/is);
});

test("the runner's -c model_reasoning_effort argument follows the TOML actually being run, never a hardcoded constant", () => {
	const syntheticToml = 'model = "gpt-5.6-terra"\nmodel_reasoning_effort = "xhigh"\n';
	const syntheticProfile = agentProfile(syntheticToml);
	expect(syntheticProfile).toEqual({ model: "gpt-5.6-terra", effort: "xhigh" });
	const syntheticArgs = command(["exec", "--ephemeral", "--json"], syntheticProfile, "instr", "prompt");
	expect(syntheticArgs[syntheticArgs.indexOf("-m") + 1]).toBe("gpt-5.6-terra");
	expect(syntheticArgs).toContain(`model_reasoning_effort=${JSON.stringify("xhigh")}`);

	const baselineProfile = agentProfile(readFileSync(BASELINE_PATH, "utf8"));
	const candidateProfile = agentProfile(readFileSync(AGENT_PATH, "utf8"));
	const baselineConfig = parsedConfig(BASELINE_PATH);
	const candidateConfig = parsedConfig(AGENT_PATH);
	expect(baselineProfile.effort).toBe(String(baselineConfig.model_reasoning_effort));
	expect(candidateProfile.effort).toBe(String(candidateConfig.model_reasoning_effort));
	expect(command(["exec"], baselineProfile, "instr", "prompt")).toContain(`model_reasoning_effort=${JSON.stringify(baselineProfile.effort)}`);
	expect(command(["exec"], candidateProfile, "instr", "prompt")).toContain(`model_reasoning_effort=${JSON.stringify(candidateProfile.effort)}`);
});

test("supplemental runner groups reject unsafe paths before model execution", () => {
	const result = Bun.spawnSync([
		"bun", "scripts/lib/security-agent-pilot-run.ts", "candidate", "10",
		"--cases", CASES_PATH, "--group", "../escape",
	], { cwd: resolve("."), stdout: "pipe", stderr: "pipe" });

	expect(result.exitCode).not.toBe(0);
	expect(new TextDecoder().decode(result.stderr)).toContain("Supplemental mode requires");
});
