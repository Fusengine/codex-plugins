import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addWorktree, cleanupOrphanWorktrees, WORKTREE_PREFIX, worktreeTempPrefix } from "./harness-auto-update-worktree";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };

function git(cwd: string, ...args: string[]): string {
	return Bun.spawnSync(["git", ...args], { cwd, env: GIT_ENV, stdout: "pipe", stderr: "pipe" }).stdout.toString("utf8");
}

function tempDir(prefix: string): string {
	const dir = mkdtempSync(join(tmpdir(), prefix));
	dirs.push(dir);
	return dir;
}

function tempRepo(): string {
	const repo = tempDir("harness-orphan-repo-");
	git(repo, "init", "-q");
	writeFileSync(join(repo, "f"), "x");
	git(repo, "add", ".");
	git(repo, "commit", "-q", "-m", "init");
	return repo;
}

describe("cleanupOrphanWorktrees", () => {
	test("removes the job's own leftover temp dirs and their worktree registrations, nothing else", () => {
		const repo = tempRepo();
		const tmpRoot = tempDir("harness-orphan-tmp-");
		const orphan = join(tmpRoot, `${WORKTREE_PREFIX}abc123`);
		mkdirSync(orphan);
		addWorktree(repo, join(orphan, "worktree"));
		const foreign = join(tmpRoot, "someone-elses-dir");
		mkdirSync(foreign);
		writeFileSync(join(foreign, "keep"), "x");

		cleanupOrphanWorktrees(repo, tmpRoot);

		expect(existsSync(orphan)).toBe(false);
		expect(existsSync(join(foreign, "keep"))).toBe(true);
		expect(git(repo, "worktree", "list").trim().split("\n")).toHaveLength(1);
	});

	test("never deletes a LIVE run's temp dir (another lock, same temp root) nor prefix-matching files or odd names", () => {
		const repo = tempRepo();
		const tmpRoot = tempDir("harness-orphan-tmp-");
		const live = join(tmpRoot, `${worktreeTempPrefix(111)}AbC123`);
		const dead = join(tmpRoot, `${worktreeTempPrefix(222)}XyZ789`);
		mkdirSync(live);
		addWorktree(repo, join(live, "worktree"));
		mkdirSync(dead);
		const file = join(tmpRoot, `${WORKTREE_PREFIX}notes.txt`);
		writeFileSync(file, "x");
		const odd = join(tmpRoot, `${WORKTREE_PREFIX}my-scratch`);
		mkdirSync(odd);

		cleanupOrphanWorktrees(repo, tmpRoot, (pid) => pid === 111);

		expect(existsSync(join(live, "worktree", "f"))).toBe(true);
		expect(existsSync(dead)).toBe(false);
		expect(existsSync(file)).toBe(true);
		expect(existsSync(odd)).toBe(true);
		expect(git(repo, "worktree", "list").trim().split("\n")).toHaveLength(2);
	});

	test("prunes a registration whose directory vanished", () => {
		const repo = tempRepo();
		const tmpRoot = tempDir("harness-orphan-tmp-");
		const wt = join(tmpRoot, "gone");
		addWorktree(repo, wt);
		rmSync(wt, { recursive: true, force: true });

		cleanupOrphanWorktrees(repo, tmpRoot);

		expect(git(repo, "worktree", "list").trim().split("\n")).toHaveLength(1);
	});
});
