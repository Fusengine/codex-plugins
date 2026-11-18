/**
 * harness-auto-update-run.ts — the audited worktree -> swap flow behind
 * `bun run harness:auto-update` and the best-effort hook wired into
 * `bun run sync:agents` / the installer (`./setup.sh`) (harness-auto-update-hook.ts).
 *
 * It maintains the codex home, never the owner's working repo: when the codex
 * home lags behind the latest release it takes a PID lock, cleans leftovers of a
 * killed run, checks out `HEAD` into a throwaway `git worktree` under the system
 * temp dir, and there runs `bun install` -> `bun run update-harness <latest>` ->
 * `validate` -> `bun test` -> its OWN scope audit (verifyWorktree) -> then stages
 * the runtime from the worktree and swaps it into the codex home with backups and
 * rollback (harness-runtime-promote.ts). The worktree is always removed; a failure
 * anywhere leaves the codex home and the working repo untouched.
 * `dryRun` prints the decision and writes nothing (no log, no lock, no worktree).
 */
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendLog, decideAutoUpdate, repoPinNote } from "./harness-auto-update";
import { acquireLock } from "./harness-auto-update-lock";
import { realVerifyDeps, verifyWorktree } from "./harness-auto-update-verify";
import { addWorktree, cleanupOrphanWorktrees, removeWorktree, worktreeTempPrefix } from "./harness-auto-update-worktree";
import { promoteRuntime } from "./harness-runtime-promote";
import { cleanupOrphans } from "./harness-runtime-swap";
import { checkHarnessStatus } from "./harness-update-flow";

/** `runAutoUpdate` result when another run holds the lock (the manual CLI still exits 0 on it). */
export const AUTO_UPDATE_LOCK_HELD = 3;

/** Inputs of one auto-update run. */
export interface AutoUpdateRunOptions {
	/** Source repo whose `HEAD` is checked out into the throwaway worktree. */
	root: string;
	/** Codex home maintained by the run (default `~/.codex`, or `CODEX_HOME`). */
	codexHome: string;
	logFile: string;
	lockFile: string;
	/** Print the decision only: no log, no lock, no worktree. */
	dryRun: boolean;
	/** Interactive echo of each message (the log file is written regardless, unless dry-run). */
	echo?: (message: string) => void;
}

/** Run `bun <args>` in `cwd`; `null` on success, else a one-line failure summary. */
function bun(args: string[], cwd: string): string | null {
	const proc = Bun.spawnSync([process.execPath, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
	if (proc.exitCode === 0) return null;
	const tail = `${proc.stdout.toString("utf8")}${proc.stderr.toString("utf8")}`.trim().split("\n").slice(-3).join(" | ");
	return `bun ${args.join(" ")} exit ${proc.exitCode}: ${tail}`;
}

async function update(opts: AutoUpdateRunOptions, log: (m: string) => void, latest: string, declared: string): Promise<number> {
	const { root, codexHome } = opts;
	const tmp = mkdtempSync(join(tmpdir(), worktreeTempPrefix()));
	const wt = join(tmp, "worktree");
	try {
		addWorktree(root, wt);
		const failure = verifyWorktree(wt, latest, realVerifyDeps(bun));
		if (failure) {
			log(`FAILED in worktree for ${latest}; ${codexHome} and the repo untouched — ${failure}`);
			return 1;
		}
		await promoteRuntime(wt, codexHome, latest);
		log(`updated ${codexHome} to ${latest} (audited + validated + tested by this run; previous package.json/bun.lock backed up, last 3 kept)`);
		const note = repoPinNote(declared, latest, codexHome);
		if (note) log(note);
		return 0;
	} catch (err) {
		log(`FAILED for ${latest}: ${err instanceof Error ? err.message : String(err)} (${codexHome} restored if it had been swapped)`);
		return 1;
	} finally {
		removeWorktree(root, wt);
		rmSync(tmp, { recursive: true, force: true });
	}
}

/**
 * Decide and, when `codexHome` lags behind the latest release, run the audited update.
 *
 * @param opts - Paths, dry-run flag and optional echo.
 * @returns 0 up to date / updated, {@link AUTO_UPDATE_LOCK_HELD} lock held by another run, 1 failure.
 * @throws When the registry status check itself fails (callers decide how to degrade).
 */
export async function runAutoUpdate(opts: AutoUpdateRunOptions): Promise<number> {
	const { root, codexHome, logFile, lockFile, dryRun } = opts;
	const log = (message: string): void => {
		opts.echo?.(message);
		if (!dryRun) appendLog(logFile, message);
	};
	const report = checkHarnessStatus(root, codexHome);
	const decision = decideAutoUpdate(report);
	if (decision.action === "up-to-date") {
		log(`up to date: latest ${report.latest} (${codexHome} ${report.codexHomeInstalled})`);
		const note = repoPinNote(report.declared, report.latest, codexHome);
		if (note) log(note);
		return 0;
	}
	if (dryRun) {
		log(`dry-run: would update ${codexHome} ${report.codexHomeInstalled} -> ${decision.latest} in an isolated worktree`);
		return 0;
	}
	const release = acquireLock(lockFile);
	if (!release) {
		log("skipped: another harness auto-update run holds the lock");
		return AUTO_UPDATE_LOCK_HELD;
	}
	try {
		if (existsSync(codexHome)) cleanupOrphans(codexHome);
		cleanupOrphanWorktrees(root, tmpdir());
		log(`updating ${codexHome} ${report.codexHomeInstalled} -> ${decision.latest} (isolated worktree of HEAD)`);
		return await update(opts, log, decision.latest, report.declared);
	} finally {
		release();
	}
}
