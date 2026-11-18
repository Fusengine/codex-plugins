/**
 * host-command-deps.ts — collaborators shared by the CLI entries the owner runs
 * (`scripts/install-codex.ts`, `scripts/sync-agents.ts`): codex home, clack
 * intro/outro and the best-effort harness auto-update that ends both commands.
 */
import { homedir } from "node:os";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { autoUpdateBestEffort } from "./harness-auto-update-hook";

/** Collaborators every host command injects (real ones by default, mocks in tests). */
export interface HostCommandDeps {
	codexHome: string;
	intro: (title: string) => void;
	outro: (message: string) => void;
	autoUpdate: () => Promise<unknown>;
}

/**
 * Build the real host-command collaborators.
 *
 * @param projectRoot - Source repo whose `HEAD` feeds the audited harness update.
 * @returns `CODEX_HOME` (or `~/.codex`), clack intro/outro and the best-effort auto-update.
 */
export function realHostCommandDeps(projectRoot: string): HostCommandDeps {
	return {
		codexHome: process.env.CODEX_HOME || join(homedir(), ".codex"),
		intro: (title) => p.intro(title),
		outro: (message) => p.outro(message),
		autoUpdate: () => autoUpdateBestEffort({ root: projectRoot, echo: (m) => p.log.info(m), warn: (m) => p.log.warn(m) }),
	};
}
