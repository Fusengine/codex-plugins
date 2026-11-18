import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { acquireLock } from "./harness-auto-update-lock";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

function lockPath(): string {
	const dir = mkdtempSync(join(tmpdir(), "harness-lock-"));
	dirs.push(dir);
	return join(dir, "sub", "auto.lock");
}

describe("acquireLock", () => {
	test("acquires a free lock, writes the PID, release removes it", () => {
		const file = lockPath();
		const release = acquireLock(file, 4242, () => true);
		expect(release).not.toBeNull();
		expect(readFileSync(file, "utf8").trim()).toBe("4242");
		release?.();
		expect(existsSync(file)).toBe(false);
	});

	test("refuses (null) while a live PID holds the lock — concurrent run", () => {
		const file = lockPath();
		acquireLock(file, 111, () => true);
		expect(acquireLock(file, 222, (pid) => pid === 111)).toBeNull();
		expect(readFileSync(file, "utf8").trim()).toBe("111");
	});

	test("takes over a stale lock whose PID is dead", () => {
		const file = lockPath();
		acquireLock(file, 111, () => true);
		const release = acquireLock(file, 222, () => false);
		expect(release).not.toBeNull();
		expect(readFileSync(file, "utf8").trim()).toBe("222");
	});

	test("release never deletes a lock another run has since taken over (compare-and-delete)", () => {
		const file = lockPath();
		const releaseA = acquireLock(file, 111, () => true);
		const releaseB = acquireLock(file, 222, () => false);
		expect(releaseB).not.toBeNull();
		releaseA?.();
		expect(readFileSync(file, "utf8").trim()).toBe("222");
	});

	test("leaves no temp file next to the lock", () => {
		const file = lockPath();
		acquireLock(file, 111, () => true);
		acquireLock(file, 222, (pid) => pid === 111);
		expect(readdirSync(dirname(file))).toEqual(["auto.lock"]);
	});

	test("a lock older than 24h is stale even when its PID is alive (PID reuse / hung run)", () => {
		const file = lockPath();
		acquireLock(file, 111, () => true);
		const stale = acquireLock(file, 222, () => true, Date.now() + 25 * 3600 * 1000);
		expect(stale).not.toBeNull();
		expect(readFileSync(file, "utf8").trim()).toBe("222");
	});

	test("a fresh lock with a live PID is still honoured", () => {
		const file = lockPath();
		acquireLock(file, 111, () => true);
		expect(acquireLock(file, 222, () => true, Date.now() + 23 * 3600 * 1000)).toBeNull();
	});

	test("treats a garbage lock file as stale", () => {
		const file = lockPath();
		acquireLock(file, 111, () => true);
		writeFileSync(file, "not-a-pid");
		expect(acquireLock(file, 222, () => true)).not.toBeNull();
	});
});
