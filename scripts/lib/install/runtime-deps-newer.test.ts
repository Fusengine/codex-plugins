import { afterEach, describe, expect, mock, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const roots: string[] = [];
afterEach(async () => {
	mock.restore();
	await Promise.all(roots.splice(0).map((root) => rm(root, { force: true, recursive: true })));
});

function temp(prefix: string): string {
	const root = mkdtempSync(join(tmpdir(), prefix));
	roots.push(root);
	return root;
}

function repo(pin: string): string {
	const root = temp("runtime-newer-repo-");
	writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { "@fusengine/harness": pin } }));
	return root;
}

function codexHomeWith(version: string | null, withBin = true): string {
	const home = temp("runtime-newer-home-");
	if (version === null) return home;
	const dir = join(home, "node_modules", "@fusengine", "harness");
	mkdirSync(join(dir, "dist", "cli"), { recursive: true });
	writeFileSync(join(dir, "package.json"), JSON.stringify({ version }));
	if (withBin) writeFileSync(join(dir, "dist", "cli", "bin.mjs"), "");
	return home;
}

describe("newerInstalledRuntime", () => {
	test("returns installed + pin when the codex home holds a newer valid harness", async () => {
		const { newerInstalledRuntime } = await import("./runtime-deps");
		expect(newerInstalledRuntime(repo("0.1.126"), codexHomeWith("0.1.127"))).toEqual({ installed: "0.1.127", pin: "0.1.126" });
		expect(newerInstalledRuntime(repo("^0.1.126"), codexHomeWith("0.1.127"))).toEqual({ installed: "0.1.127", pin: "0.1.126" });
		expect(newerInstalledRuntime(repo("0.1.99"), codexHomeWith("0.1.126"))).not.toBeNull();
	});

	test("null when equal, older, not installed, or the binary is missing (not valid)", async () => {
		const { newerInstalledRuntime } = await import("./runtime-deps");
		expect(newerInstalledRuntime(repo("0.1.126"), codexHomeWith("0.1.126"))).toBeNull();
		expect(newerInstalledRuntime(repo("0.1.126"), codexHomeWith("0.1.125"))).toBeNull();
		expect(newerInstalledRuntime(repo("0.1.126"), codexHomeWith(null))).toBeNull();
		expect(newerInstalledRuntime(repo("0.1.126"), codexHomeWith("0.1.200", false))).toBeNull();
	});
});

describe("installRuntimeDeps with a newer runtime already installed", () => {
	test("skips the downgrade: no manifest rewrite, no bun install", async () => {
		let installs = 0;
		mock.module("./fs-helpers", () => ({
			installPluginDeps: mock(async () => {
				installs++;
				return true;
			}),
		}));
		const { installRuntimeDeps } = await import("./runtime-deps");
		const home = codexHomeWith("0.1.127");
		await installRuntimeDeps(repo("0.1.126"), home);
		expect(installs).toBe(0);
		expect(existsSync(join(home, "package.json"))).toBe(false);
	});
});
