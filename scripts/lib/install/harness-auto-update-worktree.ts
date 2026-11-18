/**
 * harness-auto-update-worktree.ts — isolated `git worktree` of `HEAD` so the
 * unattended job never mutates (or runs tests on) the owner's working tree.
 */
import { lstatSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pidAlive } from "./harness-auto-update-lock";

function git(repoRoot: string, args: string[]): { ok: boolean; out: string } {
	const proc = Bun.spawnSync(["git", "-C", repoRoot, ...args], { stdout: "pipe", stderr: "pipe" });
	return { ok: proc.exitCode === 0, out: `${proc.stdout.toString("utf8")}${proc.stderr.toString("utf8")}`.trim() };
}

/** Check out `HEAD` (detached) of `repoRoot` into `dir` (must not exist or be empty). Throws on failure. */
export function addWorktree(repoRoot: string, dir: string): void {
	const result = git(repoRoot, ["worktree", "add", "--detach", dir, "HEAD"]);
	if (!result.ok) throw new Error(`git worktree add failed: ${result.out}`);
}

/** Prefix of every temp dir this job creates (and the only ones `cleanupOrphanWorktrees` may delete). */
export const WORKTREE_PREFIX = "harness-auto-update-";

/** `mkdtemp` prefix for run `pid`: the owner PID is in the dir name, so a cleanup can tell a live run from an orphan. */
export function worktreeTempPrefix(pid: number = process.pid): string {
	return `${WORKTREE_PREFIX}${pid}-`;
}

// mkdtemp appends >= 6 random [A-Za-z0-9] chars (BSDs may append more). Legacy dirs carry no PID.
const OWNED_RE = new RegExp(`^${WORKTREE_PREFIX}(\\d+)-[A-Za-z0-9]{6,}$`);
const LEGACY_RE = new RegExp(`^${WORKTREE_PREFIX}[A-Za-z0-9]{6,}$`);

/** True for an exact-shape job temp DIRECTORY whose owner run is gone; live owners, files and foreign names are kept. */
function isOrphan(tmpRoot: string, entry: string, isAlive: (pid: number) => boolean): boolean {
	const owned = entry.match(OWNED_RE);
	if (!owned && !LEGACY_RE.test(entry)) return false;
	if (owned && isAlive(Number(owned[1]))) return false;
	try {
		return lstatSync(join(tmpRoot, entry)).isDirectory();
	} catch {
		return false;
	}
}

/**
 * Remove leftovers of a killed run: each `<tmpRoot>/harness-auto-update-<pid>-XXXXXX` dir whose
 * PID is dead (plus PID-less legacy dirs) has its worktree unregistered and is deleted; then
 * `git worktree prune`. A still-running job's dir is never touched, even one holding another
 * lock (a custom `CODEX_HOME` locks inside itself but shares this temp root).
 */
export function cleanupOrphanWorktrees(repoRoot: string, tmpRoot: string, isAlive: (pid: number) => boolean = pidAlive): void {
	for (const entry of readdirSync(tmpRoot)) {
		if (!isOrphan(tmpRoot, entry, isAlive)) continue;
		const dir = join(tmpRoot, entry);
		removeWorktree(repoRoot, join(dir, "worktree"));
		rmSync(dir, { recursive: true, force: true });
	}
	git(repoRoot, ["worktree", "prune"]);
}

/** Remove the worktree (force), delete the directory if git left it, prune stale metadata. Never throws. */
export function removeWorktree(repoRoot: string, dir: string): void {
	git(repoRoot, ["worktree", "remove", "--force", dir]);
	rmSync(dir, { recursive: true, force: true });
	git(repoRoot, ["worktree", "prune"]);
}
