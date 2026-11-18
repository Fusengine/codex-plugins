/**
 * agent-tier-matrix.test.ts — Locks the shipped model/effort tier matrix
 * against silent drift. Exists because an earlier lead pass reverted
 * `security-expert` from Sol/medium back to Sol/high on 2026-09-07,
 * overwriting the owner's same-day request recorded in
 * `.codex/apex/task.json` task `security-local-medium`, and no test caught
 * the wrong revert until the owner did.
 *
 * Four checks, all against LITERAL tables written in this file (never derived
 * from `agent-toml.ts`, so a changed tier value or an extra allowed model in
 * the source turns a test red): (a) every `plugins/*\/agents/*.toml` on disk
 * sums to the exact 25 default / 7 judge / 7 non-core / 1 security counts
 * (40 agents) with no agent outside those four buckets, zero `max` and zero
 * `ultra` (Sol 6.2 fleet, owner decisions 2026-11-18 in docs/decisions.md;
 * earlier policies are in docs/workflow/agents.md § History); (b)
 * `agent-toml.ts`'s `TIER_PROFILES` equals the literal {model, effort} per
 * tier, and its `AGENT_MODEL_PROFILES` map matches what is actually shipped
 * on disk, 0 mismatches; (c) any agent whose tier has drifted from its frozen
 * v1.0.50 baseline carries a dated citation in `agent-toml.ts`'s JSDoc, and
 * that citation test fails if its anchor text disappears.
 */
import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "smol-toml";
import { AGENT_MODEL_PROFILES, TIER_PROFILES } from "./agent-toml";

type ShippedProfile = { model: string; effort: string };

const DEFAULT_NAMES = [
	"astro-expert", "commit", "devops-expert", "explore-codebase", "go-expert", "hermes-expert", "laravel-expert",
	"lessons-compactor", "nextjs-expert", "php-expert", "react-expert", "research-expert", "rust-expert",
	"seo-cluster", "seo-content", "seo-expert", "seo-geo", "seo-local", "seo-schema", "seo-technical",
	"shadcn-ui-expert", "swift-expert", "tailwindcss-expert", "tanstack-start-expert", "typescript-expert",
];
const JUDGE_NAMES = ["sniper", "challenger", "brainstorming", "prompt-engineer", "skill-creator", "solid-orchestrator", "design-expert"];
const NON_CORE_NAMES = ["commit-detector", "cartographer", "seo-images", "seo-sitemap", "sniper-faster", "websearch", "changelog-watcher"];
const SECURITY_NAMES = ["security-expert"];
/** Literal tier → profile table, deliberately duplicated from the source's `TIER_PROFILES`. */
const EXPECTED_TIER_PROFILES = {
	DEFAULT: { model: "gpt-6.2-sol", effort: "medium" },
	JUDGE: { model: "gpt-6.2-sol", effort: "high" },
	NON_CORE: { model: "gpt-6.1-terra", effort: "medium" },
	SECURITY: { model: "gpt-6.1-terra", effort: "high" },
};
const AGENT_TOML_SOURCE = "scripts/lib/agent-toml.ts";
/** End of the policy JSDoc region in `agent-toml.ts`: everything before this anchor is the cited text. */
const JSDOC_END_ANCHOR = "export const AGENT_TIERS";
/** Frozen v1.0.50 Sol/high set (pre-GPT-6, gpt-5.6-sol/high) — kept distinct
 *  from today's tiers so `security-expert`'s 2026-09-07 move to `medium`, and
 *  the fleet-wide moves (GPT-6 2026-09-23, Sol-only 2026-09-27, Terra
 *  2026-10-29, Sol 6.2 2026-11-18, see `agent-toml.ts`'s JSDoc), still count
 *  as divergences the JSDoc-citation test below must catch. */
const V1_0_50_SOL_HIGH_NAMES = ["design-expert", "security-expert"];

/** Every `plugins/*\/agents/*.toml` on disk, keyed by its declared `name`. */
function shippedProfiles(): Map<string, ShippedProfile> {
	const profiles = new Map<string, ShippedProfile>();
	for (const plugin of readdirSync("plugins")) {
		const agentsDir = join("plugins", plugin, "agents");
		let files: string[];
		try {
			files = readdirSync(agentsDir).filter((name) => name.endsWith(".toml"));
		} catch {
			continue;
		}
		for (const file of files) {
			const config = parse(readFileSync(join(agentsDir, file), "utf8")) as Record<string, unknown>;
			profiles.set(String(config.name), { model: String(config.model), effort: String(config.model_reasoning_effort) });
		}
	}
	return profiles;
}

/**
 * Frozen v1.0.50 baseline: Sol/high was `design-expert` + `security-expert`.
 * Every other agent's baseline is asserted "as today" because this lock only
 * needs to catch a divergence from that specific floor, not reproduce full
 * historical group membership for every one of the 40 agents.
 */
function baselineV1_0_50(): Record<string, ShippedProfile> {
	return Object.fromEntries(
		Object.entries(AGENT_MODEL_PROFILES).map(([name, profile]) => [
			name,
			V1_0_50_SOL_HIGH_NAMES.includes(name) ? { model: "gpt-5.6-sol", effort: "high" } : { model: profile.model, effort: profile.effort },
		]),
	);
}

test("shipped agent TOMLs match the exact 25/7/7/1 Sol 6.2 tier matrix", () => {
	const profiles = shippedProfiles();
	const byTier: Record<string, string[]> = { "gpt-6.2-sol|medium": [], "gpt-6.2-sol|high": [], "gpt-6.1-terra|medium": [], "gpt-6.1-terra|high": [] };
	const outsideMatrix: string[] = [];
	for (const [name, profile] of profiles) {
		const key = `${profile.model}|${profile.effort}`;
		if (key in byTier) byTier[key]!.push(name);
		else outsideMatrix.push(`${name}: ${key}`);
	}

	expect(profiles.size).toBe(40);
	expect(byTier["gpt-6.2-sol|medium"]!.sort()).toEqual([...DEFAULT_NAMES].sort());
	expect(byTier["gpt-6.2-sol|high"]!.sort()).toEqual([...JUDGE_NAMES].sort());
	expect(byTier["gpt-6.1-terra|medium"]!.sort()).toEqual([...NON_CORE_NAMES].sort());
	expect(byTier["gpt-6.1-terra|high"]!.sort()).toEqual([...SECURITY_NAMES].sort());
	expect(DEFAULT_NAMES).toHaveLength(25);
	expect(JUDGE_NAMES).toHaveLength(7);
	expect(NON_CORE_NAMES).toHaveLength(7);
	expect(SECURITY_NAMES).toHaveLength(1);
	expect(outsideMatrix).toEqual([]);
	expect([...profiles.values()].filter((profile) => profile.effort === "ultra" || profile.effort === "max")).toEqual([]);
});

test("agent-toml.ts TIER_PROFILES equals the literal tier table (no extra model or effort)", () => {
	expect<Record<string, ShippedProfile>>(TIER_PROFILES).toEqual(EXPECTED_TIER_PROFILES);
	expect(new Set(Object.values(TIER_PROFILES).map((profile) => profile.model))).toEqual(new Set(["gpt-6.2-sol", "gpt-6.1-terra"]));
	expect(new Set(Object.values(TIER_PROFILES).map((profile) => profile.effort))).toEqual(new Set(["medium", "high"]));
});

test("every agent-toml.ts profile matches its shipped TOML on disk (0 mismatches)", () => {
	const profiles = shippedProfiles();
	const mismatches = Object.entries(AGENT_MODEL_PROFILES).flatMap(([name, profile]) => {
		const shipped = profiles.get(name);
		if (!shipped) return [`${name}: no shipped TOML found`];
		if (shipped.model !== profile.model || shipped.effort !== profile.effort) {
			return [`${name}: map=${profile.model}/${profile.effort} toml=${shipped.model}/${shipped.effort}`];
		}
		return [];
	});

	expect(Object.keys(AGENT_MODEL_PROFILES)).toHaveLength(40);
	expect(mismatches).toEqual([]);
});

test("agent-toml.ts JSDoc cites a dated owner decision for every tier that diverges from the v1.0.50 baseline", () => {
	const source = readFileSync(AGENT_TOML_SOURCE, "utf8");
	const anchorIndex = source.indexOf(JSDOC_END_ANCHOR);
	// Anchor guard: a vanished anchor must fail loudly, never slice the whole file and pass vacuously.
	expect(anchorIndex, `anchor "${JSDOC_END_ANCHOR}" missing from ${AGENT_TOML_SOURCE}`).toBeGreaterThan(0);
	const jsdoc = source.slice(0, anchorIndex);
	expect(jsdoc, "JSDoc must cite docs/decisions.md").toContain("docs/decisions.md");
	expect(jsdoc, "JSDoc must cite the 2026-11-18 owner decision").toContain("2026-11-18");
	expect(jsdoc, "JSDoc must link docs/workflow/agents.md § Model Policy").toContain("docs/workflow/agents.md");
	const datedLine = /20\d\d-\d\d-\d\d/;
	const baseline = baselineV1_0_50();
	let checked = 0;

	for (const [name, profile] of Object.entries(AGENT_MODEL_PROFILES)) {
		const base = baseline[name];
		if (!base || (base.model === profile.model && base.effort === profile.effort)) continue;
		checked += 1;
		const mentionsAgent = new RegExp(`\`${name}\``).test(jsdoc);
		expect(mentionsAgent && datedLine.test(jsdoc), `${name}: tier diverges from v1.0.50 baseline without a dated JSDoc citation`).toBe(true);
	}
	expect(checked, "at least the two frozen-baseline agents must have been checked").toBeGreaterThanOrEqual(2);
});
