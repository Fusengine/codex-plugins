/**
 * harness-runtime-retention.test.ts — backup retention (last 3 pairs), backups
 * taken only right before the swap, and orphan cleanup (`node_modules.old-*`,
 * `.harness-staging-*`) of the target codexHome. Temp dirs only.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promoteRuntime } from "./harness-runtime-promote";
import { cleanupOrphans, pruneBackups } from "./harness-runtime-swap";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

function tempHome(): string {
	const dir = mkdtempSync(join(tmpdir(), "harness-retention-"));
	dirs.push(dir);
	return dir;
}

function writeHarness(base: string, version: string): void {
	const pkg = join(base, "node_modules", "@fusengine", "harness");
	mkdirSync(join(pkg, "dist", "cli"), { recursive: true });
	writeFileSync(join(pkg, "package.json"), JSON.stringify({ version }));
	writeFileSync(join(pkg, "dist", "cli", "bin.mjs"), "// bin");
}

const installing = (staged: string) => async (_root: string, dir: string): Promise<void> => {
	writeHarness(dir, staged);
	writeFileSync(join(dir, "package.json"), `pkg-${staged}`);
	writeFileSync(join(dir, "bun.lock"), `lock-${staged}`);
};

const stampAt = (minute: number): string => `2026-11-18T09${String(minute).padStart(2, "0")}00`;

describe("pruneBackups", () => {
	test("keeps the 3 newest pairs, deletes older ones, never touches unrelated files", () => {
		const home = tempHome();
		for (let m = 1; m <= 5; m++) {
			writeFileSync(join(home, `package.json.bak-${stampAt(m)}`), "x");
			writeFileSync(join(home, `bun.lock.bak-${stampAt(m)}`), "x");
		}
		writeFileSync(join(home, "package.json"), "live");
		writeFileSync(join(home, "package.json.bak-manual"), "mine");

		pruneBackups(home, 3);

		const left = readdirSync(home).sort();
		expect(left).toEqual(
			[
				"bun.lock.bak-" + stampAt(3),
				"bun.lock.bak-" + stampAt(4),
				"bun.lock.bak-" + stampAt(5),
				"package.json",
				"package.json.bak-" + stampAt(3),
				"package.json.bak-" + stampAt(4),
				"package.json.bak-" + stampAt(5),
				"package.json.bak-manual",
			].sort(),
		);
	});
});

describe("cleanupOrphans", () => {
	test("removes only exact-pattern orphans when the live node_modules exists", () => {
		const home = tempHome();
		writeHarness(home, "0.1.91");
		mkdirSync(join(home, `node_modules.old-${stampAt(1)}`));
		mkdirSync(join(home, `.harness-staging-${stampAt(2)}`));
		mkdirSync(join(home, "node_modules.old-keepme"));
		mkdirSync(join(home, ".harness-staging"));
		mkdirSync(join(home, "sessions"));

		cleanupOrphans(home);

		expect(readdirSync(home).sort()).toEqual([".harness-staging", "node_modules", "node_modules.old-keepme", "sessions"]);
	});

	test("restores the newest parked tree when a killed run left no live node_modules", () => {
		const home = tempHome();
		mkdirSync(join(home, `node_modules.old-${stampAt(1)}`, "a"), { recursive: true });
		mkdirSync(join(home, `node_modules.old-${stampAt(2)}`, "b"), { recursive: true });

		cleanupOrphans(home);

		expect(existsSync(join(home, "node_modules", "b"))).toBe(true);
		expect(readdirSync(home)).toEqual(["node_modules"]);
	});
});

describe("promoteRuntime backups", () => {
	test("no backup is taken when the staging install fails (before the swap)", async () => {
		const home = tempHome();
		writeHarness(home, "0.1.90");
		writeFileSync(join(home, "package.json"), "pkg-0.1.90");
		const boom = async (): Promise<void> => {
			throw new Error("install failed");
		};

		await expect(promoteRuntime("/unused", home, "0.1.91", { install: boom, reinstall: async () => true, now: new Date("2026-11-18T09:01:00Z") })).rejects.toThrow();

		expect(readdirSync(home).filter((n) => n.includes(".bak-"))).toEqual([]);
	});

	test("after 5 successful promotes only the last 3 backup pairs remain", async () => {
		const home = tempHome();
		writeHarness(home, "0.1.90");
		writeFileSync(join(home, "package.json"), "pkg-0.1.90");
		writeFileSync(join(home, "bun.lock"), "lock-0.1.90");

		for (let m = 1; m <= 5; m++) {
			await promoteRuntime("/unused", home, "0.1.91", { install: installing("0.1.91"), reinstall: async () => true, now: new Date(`2026-11-18T09:0${m}:00Z`) });
		}

		const backups = readdirSync(home).filter((n) => n.includes(".bak-"));
		expect(backups.filter((n) => n.startsWith("package.json"))).toHaveLength(3);
		expect(backups.filter((n) => n.startsWith("bun.lock"))).toHaveLength(3);
		expect(readFileSync(join(home, "package.json"), "utf8")).toBe("pkg-0.1.91");
	});
});
