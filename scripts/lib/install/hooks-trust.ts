/**
 * hooks-trust.ts — opt-in "Trust all fusengine hooks" installer step. Writes
 * `[hooks.state."<key>"]` with a bit-exact `trusted_hash` (hook-hash.ts) so Codex runs our
 * plugin hooks without `--dangerously-bypass-hook-trust`. Idempotent marker block, rewritten
 * on every accepted run so a plugin version bump (which changes the hash) re-trusts
 * automatically. Same non-TTY/CI guard as harness-env.ts — never hangs an unattended install.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { discoverTrustableHooks } from "./hooks-trust-discovery";
import { upsertManagedBlock } from "./toml-helpers";

const START = "# >>> fusengine-codex hooks trust >>>";
const END = "# <<< fusengine-codex hooks trust <<<";

/** Matches any `hooks.state."<plugin>@<marketplace>:..."` header, so stale managed keys are dropped too. */
function staleManagedKey(marketplaceName: string): RegExp {
	return new RegExp(`^hooks\\.state\\."[^"]*@${marketplaceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:`);
}

function toToml(key: string, hash: string): string {
	return `[hooks.state."${key}"]\ntrusted_hash = "${hash}"`;
}

/**
 * Prompts once (opt-in, default No) to trust every discovered fusengine plugin hook, then
 * writes `[hooks.state.*]` blocks into `config.toml`.
 * @param codexHome - Codex home directory (`~/.codex` or `$CODEX_HOME`)
 * @param marketplaceName - marketplace name plugin ids are suffixed with (`"fusengine-codex"`)
 */
export async function promptHooksTrust(codexHome: string, marketplaceName: string): Promise<void> {
	if (!process.stdin.isTTY || process.env.CI) {
		p.log.info("Non-interactive run — skipping hooks-trust prompt (rerun interactively, or pass --dangerously-bypass-hook-trust to codex)");
		return;
	}
	const entries = await discoverTrustableHooks(codexHome, marketplaceName);
	if (entries.length === 0) {
		p.log.info("No plugin hooks discovered — nothing to trust");
		return;
	}
	const wants = await p.confirm({
		message: `Trust all ${entries.length} fusengine plugin hooks? (writes [hooks.state] trusted_hash entries to config.toml so Codex runs them without --dangerously-bypass-hook-trust)`,
		initialValue: false,
	});
	if (p.isCancel(wants) || !wants) return;

	const path = join(codexHome, "config.toml");
	const current = existsSync(path) ? readFileSync(path, "utf8") : "";
	const blocks = entries.map((e) => toToml(e.key, e.hash)).join("\n\n");
	const next = upsertManagedBlock(current, START, END, blocks, [...entries.map((e) => `hooks.state."${e.key}"`), staleManagedKey(marketplaceName)]);
	writeFileSync(path, next);
	p.log.success(`Trusted ${entries.length} plugin hooks → ${path}`);
}
