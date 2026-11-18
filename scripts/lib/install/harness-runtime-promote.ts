/**
 * harness-runtime-promote.ts — stage the harness runtime from a validated source
 * root into a side directory, swap it into `~/.codex`, verify it, and roll
 * everything back (node_modules, package.json, bun.lock, then a reinstall) on any
 * failure after the swap. The live `~/.codex` is untouched until the staged tree
 * is itself verified; running Codex processes are never waited on.
 *
 * Residual window: between the two renames of `swapRuntime` (microseconds)
 * `node_modules/@fusengine/harness` does not exist; a hook fired in that instant
 * fails open/closed per Codex's own hook-error handling.
 */
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { installPluginDeps } from "./fs-helpers";
import { backupCodexFiles, commitSwap, pruneBackups, type RuntimeSwap, restoreCodexFiles, rollbackSwap, stamp, swapRuntime } from "./harness-runtime-swap";
import { installedHarnessVersion } from "./harness-update";
import { installRuntimeDeps } from "./runtime-deps";

/** Injectable seams (real installer / reinstall / clock by default). */
export interface PromoteDeps {
	install: (projectRoot: string, dir: string) => Promise<void>;
	reinstall: (codexHome: string) => Promise<boolean>;
	now: Date;
}

const defaultDeps = (): PromoteDeps => ({ install: installRuntimeDeps, reinstall: installPluginDeps, now: new Date() });

function assertStaged(dir: string, version: string): void {
	const found = installedHarnessVersion(dir);
	if (found !== version) throw new Error(`staged harness is ${found}, expected ${version}`);
}

function assertLive(codexHome: string, version: string): void {
	assertStaged(codexHome, version);
	const bin = join(codexHome, "node_modules", "@fusengine", "harness", "dist", "cli", "bin.mjs");
	if (!existsSync(bin)) throw new Error(`harness bin missing after swap: ${bin}`);
}

/**
 * Install `version` of the harness (spec read from `sourceRoot/package.json`) into `codexHome`.
 * Resolves on success; throws after restoring the previous runtime on any failure.
 */
export async function promoteRuntime(sourceRoot: string, codexHome: string, version: string, overrides: Partial<PromoteDeps> = {}): Promise<void> {
	const deps = { ...defaultDeps(), ...overrides };
	const staging = join(codexHome, `.harness-staging-${stamp(deps.now)}`);
	mkdirSync(staging, { recursive: true });
	try {
		await deps.install(sourceRoot, staging);
		assertStaged(staging, version);
		// Backups only now (right before the swap): a failed staging install leaves no .bak behind.
		const backups = backupCodexFiles(codexHome, deps.now);
		let swap: RuntimeSwap;
		try {
			swap = swapRuntime(staging, codexHome, deps.now);
		} catch (err) {
			// swapRuntime already put node_modules back; it may have copied package.json before failing.
			restoreCodexFiles(codexHome, backups);
			throw err;
		}
		try {
			assertLive(codexHome, version);
		} catch (err) {
			rollbackSwap(swap);
			restoreCodexFiles(codexHome, backups);
			await deps.reinstall(codexHome);
			throw err;
		}
		commitSwap(swap);
		pruneBackups(codexHome, 3);
	} finally {
		rmSync(staging, { recursive: true, force: true });
	}
}
