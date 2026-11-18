#!/usr/bin/env bun
/**
 * harness-auto-update.ts — unattended `@fusengine/harness` updater, run daily
 * by the launchd job `scripts/launchd/com.fusengine.harness-auto-update.plist`.
 *
 * It maintains the codex home (`CODEX_HOME`, default `~/.codex`), never the
 * owner's working repo: when the codex home lags behind the latest release it
 * takes a PID lock, cleans leftovers of a killed run, checks out `HEAD` into a
 * throwaway `git worktree` under the system temp dir, and there runs
 * `bun install` -> `bun run update-harness <latest>` -> `validate` -> `bun test` ->
 * its OWN scope audit (verifyWorktree: every write is audited by this run) -> then
 * stages the runtime from the worktree and swaps it into the codex home with
 * backups and rollback (harness-runtime-promote.ts). The worktree is always
 * removed; a failure anywhere leaves the codex home and the working repo untouched.
 * A custom `CODEX_HOME` keeps its log and lock inside it (resolveJobPaths).
 * `--dry-run` prints the decision and writes nothing (no log, no lock, no worktree).
 */
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { appendLog, decideAutoUpdate, repoPinNote, resolveJobPaths } from "./lib/install/harness-auto-update";
import { acquireLock } from "./lib/install/harness-auto-update-lock";
import { realVerifyDeps, verifyWorktree } from "./lib/install/harness-auto-update-verify";
import { addWorktree, cleanupOrphanWorktrees, removeWorktree, worktreeTempPrefix } from "./lib/install/harness-auto-update-worktree";
import { promoteRuntime } from "./lib/install/harness-runtime-promote";
import { cleanupOrphans } from "./lib/install/harness-runtime-swap";
import { checkHarnessStatus } from "./lib/install/harness-update-flow";

const root = dirname(import.meta.dir);
const { codexHome, logFile, lockFile } = resolveJobPaths(process.env, homedir());
const dryRun = process.argv.includes("--dry-run");

function log(message: string): void {
	// Under launchd stdout is the log file itself: only echo interactively to avoid duplicate lines.
	if (dryRun || process.stdout.isTTY) console.log(message);
	if (!dryRun) appendLog(logFile, message);
}

/** Run `bun <args>` in `cwd`; `null` on success, else a one-line failure summary. */
function bun(args: string[], cwd: string): string | null {
	const proc = Bun.spawnSync([process.execPath, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
	if (proc.exitCode === 0) return null;
	const tail = `${proc.stdout.toString("utf8")}${proc.stderr.toString("utf8")}`.trim().split("\n").slice(-3).join(" | ");
	return `bun ${args.join(" ")} exit ${proc.exitCode}: ${tail}`;
}

async function update(latest: string, declared: string): Promise<number> {
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

async function main(): Promise<number> {
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
		return 0;
	}
	try {
		if (existsSync(codexHome)) cleanupOrphans(codexHome);
		cleanupOrphanWorktrees(root, tmpdir());
		log(`updating ${codexHome} ${report.codexHomeInstalled} -> ${decision.latest} (isolated worktree of HEAD)`);
		return await update(decision.latest, report.declared);
	} finally {
		release();
	}
}

let exitCode: number;
try {
	exitCode = await main();
} catch (err) {
	log(`FAILED: ${err instanceof Error ? err.message : String(err)}`);
	exitCode = 1;
}
process.exit(exitCode);
