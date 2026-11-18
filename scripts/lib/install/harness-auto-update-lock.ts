/**
 * harness-auto-update-lock.ts — PID lockfile so the launchd job and a manual
 * `bun run harness:auto-update` never overlap. A lock whose PID is dead (or
 * whose content is not a PID) is stale and is taken over.
 */
import { linkSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

/** True when a process with `pid` exists (EPERM means it exists but is not ours). */
export function pidAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch (err) {
		return (err as NodeJS.ErrnoException).code === "EPERM";
	}
}

function holderPid(file: string): number | null {
	try {
		const pid = Number.parseInt(readFileSync(file, "utf8").trim(), 10);
		return Number.isInteger(pid) && pid > 0 ? pid : null;
	} catch {
		return null;
	}
}

/** A lock older than this is stale whatever its PID says (PID reuse, hung run). */
export const LOCK_MAX_AGE_MS = 24 * 3600 * 1000;

function lockExpired(file: string, nowMs: number): boolean {
	try {
		return nowMs - statSync(file).mtimeMs > LOCK_MAX_AGE_MS;
	} catch {
		return false;
	}
}

/** Remove `file` only while it still holds `expected` (compare-and-delete): never drop a lock another run just took. */
function removeIfHeldBy(file: string, expected: number | null): void {
	if (holderPid(file) === expected) rmSync(file, { force: true });
}

/**
 * Try to take the lock at `file`. Returns a release function, or `null` when a
 * live process already holds it. The PID is written to a private temp file and
 * hard-linked into place (`link` fails with EEXIST), so the lock never exists
 * without its PID — a concurrent reader never sees an empty file and mistakes a
 * live lock for a stale one. One stale takeover retry is attempted; takeover
 * and release are compare-and-delete on the PID.
 */
export function acquireLock(
	file: string,
	pid: number = process.pid,
	isAlive: (pid: number) => boolean = pidAlive,
	nowMs: number = Date.now(),
): (() => void) | null {
	mkdirSync(dirname(file), { recursive: true });
	const tmp = `${file}.${pid}.tmp`;
	writeFileSync(tmp, `${pid}\n`);
	try {
		for (let attempt = 0; attempt < 2; attempt++) {
			try {
				linkSync(tmp, file);
				return () => removeIfHeldBy(file, pid);
			} catch (err) {
				if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
				const holder = holderPid(file);
				if (holder !== null && isAlive(holder) && !lockExpired(file, nowMs)) return null;
				removeIfHeldBy(file, holder);
			}
		}
		return null;
	} finally {
		rmSync(tmp, { force: true });
	}
}
