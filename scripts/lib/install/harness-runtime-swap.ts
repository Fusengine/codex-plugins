/**
 * harness-runtime-swap.ts — primitives to replace `~/.codex/node_modules` with a
 * pre-staged tree by directory rename (the window where
 * `node_modules/@fusengine/harness/dist/cli/bin.mjs` is missing is two
 * back-to-back `renameSync` calls, not a whole `bun install`), plus timestamped
 * backups of the manifest and lockfile for rollback.
 */
import { copyFileSync, existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

/** One backed-up `~/.codex` file. */
export interface CodexBackup {
	source: string;
	backup: string;
}

/** Result of a swap: the live tree and where the previous one was parked (`null` if none). */
export interface RuntimeSwap {
	live: string;
	old: string | null;
}

const BACKED_UP = ["package.json", "bun.lock"] as const;

/** `YYYY-MM-DDTHHMMSS` (UTC) — date AND time so two runs on one day never collide. */
export function stamp(now: Date): string {
	return now.toISOString().slice(0, 19).replaceAll(":", "");
}

/** Copy `package.json` and `bun.lock` (those that exist) to `<file>.bak-<stamp>`. */
export function backupCodexFiles(codexHome: string, now: Date = new Date()): CodexBackup[] {
	const backups: CodexBackup[] = [];
	for (const name of BACKED_UP) {
		const source = join(codexHome, name);
		if (!existsSync(source)) continue;
		const backup = `${source}.bak-${stamp(now)}`;
		copyFileSync(source, backup);
		backups.push({ source, backup });
	}
	return backups;
}

/**
 * Put every backed-up file back over its source, and delete a `package.json` / `bun.lock`
 * that had no backup (it did not exist before the swap copied the staged one in): otherwise
 * the rollback reinstall would resolve the rejected version from the leftover manifest.
 */
export function restoreCodexFiles(codexHome: string, backups: readonly CodexBackup[]): void {
	for (const name of BACKED_UP) {
		const source = join(codexHome, name);
		const saved = backups.find((b) => b.source === source);
		if (saved) copyFileSync(saved.backup, source);
		else rmSync(source, { force: true });
	}
}

/**
 * Park the live `node_modules` as `node_modules.old-<stamp>`, rename the staged one
 * into place and copy the staged manifest + lockfile. Any failure puts the
 * previous tree back and rethrows, leaving `codexHome` as it was.
 */
export function swapRuntime(stagingDir: string, codexHome: string, now: Date = new Date()): RuntimeSwap {
	const live = join(codexHome, "node_modules");
	const old = existsSync(live) ? `${live}.old-${stamp(now)}` : null;
	if (old) renameSync(live, old);
	try {
		renameSync(join(stagingDir, "node_modules"), live);
		for (const name of BACKED_UP) {
			const staged = join(stagingDir, name);
			if (existsSync(staged)) copyFileSync(staged, join(codexHome, name));
		}
	} catch (err) {
		rollbackSwap({ live, old });
		throw err;
	}
	return { live, old };
}

/** Discard the new tree and restore the parked one. */
export function rollbackSwap(swap: RuntimeSwap): void {
	rmSync(swap.live, { recursive: true, force: true });
	if (swap.old) renameSync(swap.old, swap.live);
}

const STAMP = String.raw`\d{4}-\d{2}-\d{2}T\d{6}`;
const BACKUP_RE = new RegExp(`^(package\\.json|bun\\.lock)\\.bak-(${STAMP})$`);
const OLD_RE = new RegExp(`^node_modules\\.old-${STAMP}$`);
const STAGING_RE = new RegExp(`^\\.harness-staging-${STAMP}$`);

/** Keep only the `keep` newest `.bak-<stamp>` files per backed-up file (exact pattern only; other files are never touched). */
export function pruneBackups(codexHome: string, keep = 3): void {
	const byFile = new Map<string, string[]>();
	for (const name of readdirSync(codexHome)) {
		const match = name.match(BACKUP_RE);
		if (match?.[1]) byFile.set(match[1], [...(byFile.get(match[1]) ?? []), name]);
	}
	for (const names of byFile.values()) {
		for (const name of names.sort().slice(0, Math.max(0, names.length - keep))) rmSync(join(codexHome, name), { force: true });
	}
}

/**
 * Clean leftovers of a killed run in `codexHome`: `.harness-staging-<stamp>` dirs and
 * `node_modules.old-<stamp>` dirs (exact patterns only). If the live `node_modules`
 * is missing, the newest parked tree is restored instead of deleted.
 */
export function cleanupOrphans(codexHome: string): void {
	const names = readdirSync(codexHome);
	for (const name of names.filter((n) => STAGING_RE.test(n))) rmSync(join(codexHome, name), { recursive: true, force: true });
	const parked = names.filter((n) => OLD_RE.test(n)).sort();
	const live = join(codexHome, "node_modules");
	if (!existsSync(live) && parked.length > 0) renameSync(join(codexHome, parked.pop() as string), live);
	for (const name of parked) rmSync(join(codexHome, name), { recursive: true, force: true });
}

/** The swap is verified: drop the parked previous tree. */
export function commitSwap(swap: RuntimeSwap): void {
	if (swap.old) rmSync(swap.old, { recursive: true, force: true });
}
