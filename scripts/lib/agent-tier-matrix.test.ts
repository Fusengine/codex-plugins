/**
 * agent-tier-matrix.test.ts — Locks the shipped model/effort tier matrix
 * against silent drift. Exists because an earlier lead pass reverted
 * `security-expert` from Sol/medium back to Sol/high on 2026-09-07,
 * overwriting the owner's same-day request recorded in
 * `.codex/apex/task.json` task `security-local-medium`, and no test caught
 * the wrong revert until the owner did.
 *
 * Three checks: (a) every `plugins/*\/agents/*.toml` on disk sums to the
 * exact 30 medium / 5 high / 3 max tier counts with no agent outside those
 * three buckets, zero Sol and zero `ultra` (GPT-6.1 Terra fleet since
 * 2026-10-29, see `agent-toml.ts`'s JSDoc for the owner decision; earlier
 * policies are in docs/workflow/agents.md § History); (b) `agent-toml.ts`'s `AGENT_MODEL_PROFILES`
 * map matches what is actually shipped on disk, 0 mismatches; (c) any agent
 * whose tier has drifted from its frozen v1.0.50 baseline carries a dated
 * citation in `agent-toml.ts`'s JSDoc.
 */
import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "smol-toml";
import { AGENT_MODEL_PROFILES } from "./agent-toml";

type ShippedProfile = { model: string; effort: string };

const TERRA_MAX_NAMES = ["design-expert", "challenger", "security-expert"];
const TERRA_HIGH_NAMES = ["sniper", "brainstorming", "prompt-engineer", "skill-creator", "solid-orchestrator"];
const AGENT_TOML_SOURCE = "scripts/lib/agent-toml.ts";
/** Frozen v1.0.50 Sol/high set (pre-GPT-6, gpt-5.6-sol/high) — kept distinct
 *  from {@link TERRA_MAX_NAMES} (today's actual tier) so `security-expert`'s
 *  2026-09-07 move to `medium`, and the fleet-wide moves (GPT-6 2026-09-23,
 *  Sol-only 2026-09-27, Terra 2026-10-29, see `agent-toml.ts`'s JSDoc), still
 *  count as divergences the JSDoc-citation test below must catch. */
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
 * historical group membership for every one of the 38 agents.
 */
function baselineV1_0_50(): Record<string, ShippedProfile> {
	return Object.fromEntries(
		Object.entries(AGENT_MODEL_PROFILES).map(([name, profile]) => [
			name,
			V1_0_50_SOL_HIGH_NAMES.includes(name) ? { model: "gpt-5.6-sol", effort: "high" } : { model: profile.model, effort: profile.effort },
		]),
	);
}

test("shipped agent TOMLs match the exact 30/5/3 Terra tier matrix", () => {
	const profiles = shippedProfiles();
	const byTier: Record<string, string[]> = { "gpt-6.1-terra|max": [], "gpt-6.1-terra|high": [], "gpt-6.1-terra|medium": [] };
	const outsideMatrix: string[] = [];
	for (const [name, profile] of profiles) {
		const key = `${profile.model}|${profile.effort}`;
		if (key in byTier) byTier[key]!.push(name);
		else outsideMatrix.push(`${name}: ${key}`);
	}

	expect(byTier["gpt-6.1-terra|max"]!.sort()).toEqual([...TERRA_MAX_NAMES].sort());
	expect(byTier["gpt-6.1-terra|high"]!.sort()).toEqual([...TERRA_HIGH_NAMES].sort());
	expect(byTier["gpt-6.1-terra|medium"]).toHaveLength(30);
	expect(outsideMatrix).toEqual([]);
	expect([...profiles.values()].filter((profile) => profile.model === "gpt-6.1-sol" || profile.effort === "ultra")).toEqual([]);
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

	expect(mismatches).toEqual([]);
});

test("agent-toml.ts JSDoc cites a dated owner decision for every tier that diverges from the v1.0.50 baseline", () => {
	const source = readFileSync(AGENT_TOML_SOURCE, "utf8");
	const jsdoc = source.slice(0, source.indexOf("export const AGENT_MODEL_PROFILES"));
	const datedLine = /20\d\d-\d\d-\d\d/;
	const baseline = baselineV1_0_50();

	for (const [name, profile] of Object.entries(AGENT_MODEL_PROFILES)) {
		const base = baseline[name];
		if (!base || (base.model === profile.model && base.effort === profile.effort)) continue;
		const mentionsAgent = new RegExp(`\`${name}\``).test(jsdoc);
		expect(mentionsAgent && datedLine.test(jsdoc), `${name}: tier diverges from v1.0.50 baseline without a dated JSDoc citation`).toBe(true);
	}
});
