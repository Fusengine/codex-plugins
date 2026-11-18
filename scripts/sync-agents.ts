#!/usr/bin/env bun
/**
 * sync-agents.ts — Fast-path resync of agents and commands only.
 * Propague les edits de plugins/*\/agents/*.toml et plugins/*\/commands/*.md
 * vers $CODEX_HOME sans relancer le setup complet (runtime deps, config.toml,
 * MCP, hooks trust). Doc: developers.openai.com/codex/subagents.
 * Afterwards it runs the audited harness auto-update, best-effort
 * (skip with FUSE_HARNESS_AUTO_UPDATE=0; a failure never fails the sync).
 */
import { join, dirname } from "node:path";
import * as p from "@clack/prompts";
import { type HostCommandDeps, realHostCommandDeps } from "./lib/install/host-command-deps";
import { installAgents, installCommands } from "./lib/install/install-agents";

const PROJECT_ROOT = dirname(import.meta.dir);

/** Injectable collaborators of {@link syncAgents} (real ones by default, mocks in tests). */
export interface SyncAgentsDeps extends HostCommandDeps {
	projectRoot: string;
	quiet: boolean;
	installAgents: (codexHome: string, pluginsRoot: string, opts: { quiet: boolean }) => Promise<unknown>;
	installCommands: (codexHome: string, pluginsRoot: string, opts: { quiet: boolean }) => Promise<unknown>;
}

function realDeps(): SyncAgentsDeps {
	return {
		...realHostCommandDeps(PROJECT_ROOT),
		projectRoot: PROJECT_ROOT,
		quiet: process.argv.includes("--quiet"),
		installAgents,
		installCommands,
	};
}

/**
 * Resync agents and commands into the codex home, then run the best-effort harness auto-update.
 *
 * @param deps - Collaborators; defaults to the real ones.
 * @returns Promise resolved when both syncs and the auto-update attempt completed
 */
export async function syncAgents(deps: SyncAgentsDeps = realDeps()): Promise<void> {
	deps.intro(`Fusengine Codex Sync (agents + commands → ${deps.codexHome})`);
	const pluginsRoot = join(deps.projectRoot, "plugins");
	await deps.installAgents(deps.codexHome, pluginsRoot, { quiet: deps.quiet });
	await deps.installCommands(deps.codexHome, pluginsRoot, { quiet: deps.quiet });
	await deps.autoUpdate();
	deps.outro("Sync complete. Restart Codex CLI to apply.");
}

if (import.meta.main) {
	syncAgents().catch((e: Error) => {
		p.log.error(e.message);
		process.exit(1);
	});
}
