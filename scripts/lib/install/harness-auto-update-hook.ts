/**
 * harness-auto-update-hook.ts — best-effort trigger of the audited harness update from
 * commands the owner already runs (`bun run sync:agents`, `./setup.sh`). Nothing runs
 * in the background; set `FUSE_HARNESS_AUTO_UPDATE=0` to skip it. Any failure (registry
 * unreachable, audit/test failure) becomes a one-line warning: the host command carries on.
 */
import { homedir } from "node:os";
import { appendLog, resolveJobPaths } from "./harness-auto-update";
import { AUTO_UPDATE_LOCK_HELD, type AutoUpdateRunOptions, runAutoUpdate } from "./harness-auto-update-run";

/** `ok` ran clean, `skipped` disabled by env or lock held (warned), `failed` degraded to a warning. */
export type AutoUpdateHookStatus = "ok" | "skipped" | "failed";

/** Inputs of the best-effort hook; every collaborator is injectable for tests. */
export interface AutoUpdateHookOptions {
	/** Source repo whose `HEAD` feeds the audited worktree. */
	root: string;
	env?: Record<string, string | undefined>;
	home?: string;
	run?: (opts: AutoUpdateRunOptions) => Promise<number>;
	echo?: (message: string) => void;
	warn?: (message: string) => void;
}

/** True unless `FUSE_HARNESS_AUTO_UPDATE` is `0`, `false` or `off` (any case). */
export function isAutoUpdateEnabled(env: Record<string, string | undefined>): boolean {
	return !["0", "false", "off"].includes((env.FUSE_HARNESS_AUTO_UPDATE ?? "").trim().toLowerCase());
}

/**
 * Run the audited harness update and never throw: on any failure log one line, warn once, return `failed`.
 *
 * @param opts - Repo root plus injectable env/home/run/echo/warn.
 * @returns `skipped` when disabled by env, `ok` on exit code 0, else `failed`.
 */
export async function autoUpdateBestEffort(opts: AutoUpdateHookOptions): Promise<AutoUpdateHookStatus> {
	const env = opts.env ?? process.env;
	if (!isAutoUpdateEnabled(env)) return "skipped";
	const { codexHome, logFile, lockFile } = resolveJobPaths(env, opts.home ?? homedir());
	const run = opts.run ?? runAutoUpdate;
	const warn = opts.warn ?? ((m: string) => console.warn(m));
	try {
		const code = await run({ root: opts.root, codexHome, logFile, lockFile, dryRun: false, echo: opts.echo });
		if (code === 0) return "ok";
		if (code === AUTO_UPDATE_LOCK_HELD) {
			warn(`harness auto-update skipped: another run holds the lock (${codexHome}) — continuing`);
			return "skipped";
		}
		warn(`harness auto-update did not complete for ${codexHome} (see ${logFile}) — continuing`);
		return "failed";
	} catch (err) {
		const reason = (err instanceof Error ? err.message : String(err)).split("\n")[0];
		const line = `harness auto-update skipped for ${codexHome}: ${reason} — continuing`;
		try {
			appendLog(logFile, line);
		} catch {
			// The warning below is enough; an unwritable log must never break the host command.
		}
		warn(line);
		return "failed";
	}
}
