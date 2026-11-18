/**
 * harness-runtime-promote.test.ts — `promoteRuntime` stages the harness into a
 * side directory, swaps it into ~/.codex, and rolls back (node_modules +
 * package.json + bun.lock, then a reinstall) on any failure. The installer is
 * injected, so no network / real bun install runs.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promoteRuntime } from "./harness-runtime-promote";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

function tempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), "harness-promote-"));
	dirs.push(dir);
	return dir;
}

function writeHarness(base: string, version: string): void {
	const pkg = join(base, "node_modules", "@fusengine", "harness");
	mkdirSync(join(pkg, "dist", "cli"), { recursive: true });
	writeFileSync(join(pkg, "package.json"), JSON.stringify({ version }));
	writeFileSync(join(pkg, "dist", "cli", "bin.mjs"), "// bin");
}

function liveHome(version: string): string {
	const home = tempDir();
	writeHarness(home, version);
	writeFileSync(join(home, "package.json"), `pkg-${version}`);
	writeFileSync(join(home, "bun.lock"), `lock-${version}`);
	return home;
}

const NOW = new Date("2026-11-18T09:05:07.000Z");
const version = (home: string): string => JSON.parse(readFileSync(join(home, "node_modules", "@fusengine", "harness", "package.json"), "utf8")).version;

/** Fake installer that stages `staged` into the staging dir. */
const installing = (staged: string) => async (_root: string, dir: string): Promise<void> => {
	writeHarness(dir, staged);
	writeFileSync(join(dir, "package.json"), `pkg-${staged}`);
	writeFileSync(join(dir, "bun.lock"), `lock-${staged}`);
};

/** Stages 0.1.91 with the right version but no bin.mjs -> the post-swap check fails. */
const brokenBin = async (root: string, dir: string): Promise<void> => {
	await installing("0.1.91")(root, dir);
	rmSync(join(dir, "node_modules", "@fusengine", "harness", "dist"), { recursive: true });
};

describe("promoteRuntime", () => {
	test("success: new version live, backups kept with date+time suffix, staging + old tree cleaned", async () => {
		const home = liveHome("0.1.90");
		await promoteRuntime("/unused", home, "0.1.91", { install: installing("0.1.91"), reinstall: async () => true, now: NOW });

		expect(version(home)).toBe("0.1.91");
		expect(readFileSync(join(home, "package.json.bak-2026-11-18T090507"), "utf8")).toBe("pkg-0.1.90");
		expect(readFileSync(join(home, "bun.lock.bak-2026-11-18T090507"), "utf8")).toBe("lock-0.1.90");
		expect(readdirSync(home).filter((n) => n.includes("staging") || n.includes(".old-"))).toEqual([]);
	});

	test("install throws: ~/.codex untouched, error propagates", async () => {
		const home = liveHome("0.1.90");
		const boom = async (): Promise<void> => {
			throw new Error("bun install failed");
		};
		await expect(promoteRuntime("/unused", home, "0.1.91", { install: boom, reinstall: async () => true, now: NOW })).rejects.toThrow("bun install failed");

		expect(version(home)).toBe("0.1.90");
		expect(readFileSync(join(home, "package.json"), "utf8")).toBe("pkg-0.1.90");
	});

	test("staged version mismatch: ~/.codex untouched, throws", async () => {
		const home = liveHome("0.1.90");
		await expect(promoteRuntime("/unused", home, "0.1.91", { install: installing("0.1.89"), reinstall: async () => true, now: NOW })).rejects.toThrow(/0\.1\.89/);

		expect(version(home)).toBe("0.1.90");
	});

	test("swap fails after copying package.json: node_modules, package.json, bun.lock all restored", async () => {
		const home = liveHome("0.1.90");
		// Staged bun.lock is a directory -> copyFileSync throws after package.json was already copied.
		const halfCopy = async (_root: string, dir: string): Promise<void> => {
			writeHarness(dir, "0.1.91");
			writeFileSync(join(dir, "package.json"), "pkg-0.1.91");
			mkdirSync(join(dir, "bun.lock"));
		};
		await expect(promoteRuntime("/unused", home, "0.1.91", { install: halfCopy, reinstall: async () => true, now: NOW })).rejects.toThrow();

		expect(version(home)).toBe("0.1.90");
		expect(readFileSync(join(home, "package.json"), "utf8")).toBe("pkg-0.1.90");
		expect(readFileSync(join(home, "bun.lock"), "utf8")).toBe("lock-0.1.90");
	});

	test("fresh home (no manifest, no lock, no node_modules) + post-swap failure: the staged manifest + lock are removed, not left for the reinstall", async () => {
		const home = tempDir();
		const reinstallSaw: boolean[] = [];
		const reinstall = async (codexHome: string): Promise<boolean> => {
			reinstallSaw.push(existsSync(join(codexHome, "package.json")));
			return true;
		};

		await expect(promoteRuntime("/unused", home, "0.1.91", { install: brokenBin, reinstall, now: NOW })).rejects.toThrow();

		expect(reinstallSaw).toEqual([false]);
		expect(readdirSync(home)).toEqual([]);
	});

	test("post-swap verification failure: node_modules, package.json, bun.lock restored and bun install re-run", async () => {
		const home = liveHome("0.1.90");
		let reinstalled = 0;

		await expect(
			promoteRuntime("/unused", home, "0.1.91", {
				install: brokenBin,
				reinstall: async () => {
					reinstalled += 1;
					return true;
				},
				now: NOW,
			}),
		).rejects.toThrow();

		expect(version(home)).toBe("0.1.90");
		expect(existsSync(join(home, "node_modules", "@fusengine", "harness", "dist", "cli", "bin.mjs"))).toBe(true);
		expect(readFileSync(join(home, "package.json"), "utf8")).toBe("pkg-0.1.90");
		expect(readFileSync(join(home, "bun.lock"), "utf8")).toBe("lock-0.1.90");
		expect(reinstalled).toBe(1);
	});
});
