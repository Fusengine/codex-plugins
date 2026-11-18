import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addWorktree, removeWorktree } from "./harness-auto-update-worktree";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" };

function git(cwd: string, ...args: string[]): string {
	const proc = Bun.spawnSync(["git", ...args], { cwd, env: GIT_ENV, stdout: "pipe", stderr: "pipe" });
	return proc.stdout.toString("utf8");
}

function tempRepo(): string {
	const dir = mkdtempSync(join(tmpdir(), "harness-wt-repo-"));
	dirs.push(dir);
	git(dir, "init", "-q");
	writeFileSync(join(dir, "package.json"), "committed\n");
	git(dir, "add", ".");
	git(dir, "commit", "-q", "-m", "init");
	return dir;
}

describe("addWorktree / removeWorktree", () => {
	test("checks out HEAD in an isolated dir; the working repo's dirty files stay untouched", () => {
		const repo = tempRepo();
		writeFileSync(join(repo, "package.json"), "dirty WIP\n");
		const wt = join(mkdtempSync(join(tmpdir(), "harness-wt-")), "wt");
		dirs.push(wt);

		addWorktree(repo, wt);
		expect(readFileSync(join(wt, "package.json"), "utf8")).toBe("committed\n");
		writeFileSync(join(wt, "package.json"), "mutated in worktree\n");
		expect(readFileSync(join(repo, "package.json"), "utf8")).toBe("dirty WIP\n");

		removeWorktree(repo, wt);
		expect(existsSync(wt)).toBe(false);
		expect(git(repo, "worktree", "list").trim().split("\n")).toHaveLength(1);
		expect(git(repo, "status", "--porcelain").trim()).toBe("M package.json");
	});

	test("addWorktree throws when git fails (not a repo)", () => {
		const notRepo = mkdtempSync(join(tmpdir(), "harness-wt-none-"));
		dirs.push(notRepo);
		expect(() => addWorktree(notRepo, join(notRepo, "wt"))).toThrow();
	});
});
