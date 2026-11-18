#!/usr/bin/env bun
/**
 * install-codex.ts — Codex CLI installer entry point.
 * Conforme doc Codex: developers.openai.com/codex/plugins/build,
 * developers.openai.com/codex/cli/reference.
 * After the setup it runs the audited harness auto-update, best-effort
 * (skip with FUSE_HARNESS_AUTO_UPDATE=0; a failure never fails the install).
 */
import { dirname } from "node:path";
import * as p from "@clack/prompts";
import { type HostCommandDeps, realHostCommandDeps } from "./lib/install/host-command-deps";
import { runCodexSetup, type SetupOptions } from "./lib/install/runner";

const PROJECT_ROOT = dirname(import.meta.dir);

/** Injectable collaborators of {@link installCodex} (real ones by default, mocks in tests). */
export interface InstallCodexDeps extends HostCommandDeps {
	projectRoot: string;
	argv: string[];
	runSetup: (opts: SetupOptions) => Promise<void>;
}

function realDeps(): InstallCodexDeps {
	return {
		...realHostCommandDeps(PROJECT_ROOT),
		projectRoot: PROJECT_ROOT,
		argv: process.argv,
		runSetup: runCodexSetup,
	};
}

/**
 * Run the Codex setup, then the best-effort harness auto-update.
 *
 * @param deps - Collaborators; defaults to the real ones.
 * @returns Promise resolved when the setup and the auto-update attempt completed
 * @throws Whatever the setup throws (the auto-update never runs then)
 */
export async function installCodex(deps: InstallCodexDeps = realDeps()): Promise<void> {
	deps.intro("Fusengine Codex Plugins Setup");
	await deps.runSetup({
		projectRoot: deps.projectRoot,
		codexHome: deps.codexHome,
		marketplaceName: "fusengine-codex",
		skipPluginInstall: deps.argv.includes("--skip-install"),
		skipEnv: deps.argv.includes("--skip-env"),
	});
	await deps.autoUpdate();
	deps.outro("Setup complete. Restart Codex CLI to apply.");
}

if (import.meta.main) {
	installCodex().catch((e) => {
		p.log.error(e.message);
		process.exit(1);
	});
}
