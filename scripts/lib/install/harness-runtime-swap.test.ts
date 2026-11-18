import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backupCodexFiles, commitSwap, restoreCodexFiles, rollbackSwap, swapRuntime } from "./harness-runtime-swap";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

function tempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), "harness-swap-"));
	dirs.push(dir);
	return dir;
}

function seedHome(home: string, tag: string): void {
	writeFileSync(join(home, "package.json"), `pkg-${tag}`);
	writeFileSync(join(home, "bun.lock"), `lock-${tag}`);
	mkdirSync(join(home, "node_modules", "@fusengine"), { recursive: true });
	writeFileSync(join(home, "node_modules", "@fusengine", "marker"), tag);
}

const NOW = new Date("2026-11-18T09:05:07.000Z");

describe("backupCodexFiles / restoreCodexFiles", () => {
	test("backs up package.json AND bun.lock with a date+time suffix, restores byte-for-byte", () => {
		const home = tempDir();
		seedHome(home, "old");
		const backups = backupCodexFiles(home, NOW);

		expect(backups.map((b) => b.backup)).toEqual([
			join(home, "package.json.bak-2026-11-18T090507"),
			join(home, "bun.lock.bak-2026-11-18T090507"),
		]);
		writeFileSync(join(home, "package.json"), "mutated");
		rmSync(join(home, "bun.lock"));
		restoreCodexFiles(home, backups);

		expect(readFileSync(join(home, "package.json"), "utf8")).toBe("pkg-old");
		expect(readFileSync(join(home, "bun.lock"), "utf8")).toBe("lock-old");
	});

	test("skips files that do not exist", () => {
		const home = tempDir();
		writeFileSync(join(home, "package.json"), "x");
		expect(backupCodexFiles(home, NOW)).toHaveLength(1);
	});
});

describe("swapRuntime", () => {
	test("renames staged node_modules into place and copies manifest + lock; commit drops the old tree", () => {
		const home = tempDir();
		const staging = tempDir();
		seedHome(home, "old");
		seedHome(staging, "new");

		const swap = swapRuntime(staging, home, NOW);

		expect(readFileSync(join(home, "node_modules", "@fusengine", "marker"), "utf8")).toBe("new");
		expect(readFileSync(join(home, "package.json"), "utf8")).toBe("pkg-new");
		expect(readFileSync(join(home, "bun.lock"), "utf8")).toBe("lock-new");
		expect(swap.old).not.toBeNull();
		commitSwap(swap);
		expect(existsSync(swap.old as string)).toBe(false);
	});

	test("rollbackSwap puts the previous node_modules back", () => {
		const home = tempDir();
		const staging = tempDir();
		seedHome(home, "old");
		seedHome(staging, "new");

		rollbackSwap(swapRuntime(staging, home, NOW));

		expect(readFileSync(join(home, "node_modules", "@fusengine", "marker"), "utf8")).toBe("old");
	});

	test("a failing swap (no staged node_modules) throws and leaves the live tree intact", () => {
		const home = tempDir();
		const staging = tempDir();
		seedHome(home, "old");

		expect(() => swapRuntime(staging, home, NOW)).toThrow();
		expect(readFileSync(join(home, "node_modules", "@fusengine", "marker"), "utf8")).toBe("old");
	});

	test("works when ~/.codex has no node_modules yet", () => {
		const home = tempDir();
		const staging = tempDir();
		seedHome(staging, "new");
		const swap = swapRuntime(staging, home, NOW);
		expect(swap.old).toBeNull();
		expect(readFileSync(join(home, "node_modules", "@fusengine", "marker"), "utf8")).toBe("new");
	});
});
