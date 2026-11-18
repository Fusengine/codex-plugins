/**
 * harness-auto-update.ts — pure, testable helpers for `scripts/harness-auto-update.ts`
 * (the audited update that keeps the `~/.codex` runtime on the latest
 * `@fusengine/harness`, triggered from sync:agents / install). Companions: harness-auto-update-lock.ts (PID lock),
 * harness-auto-update-worktree.ts (isolated worktree), harness-runtime-promote.ts
 * (staged, rollback-safe ~/.codex install).
 */
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { HarnessCheckReport } from "./harness-update-flow";

/** Outcome of comparing `~/.codex` against the latest published release. */
export type AutoUpdateDecision = { action: "up-to-date" } | { action: "update"; latest: string };

/**
 * The job maintains `~/.codex`, never the working repo: up to date exactly when
 * `~/.codex` already holds `latest`, whatever state the repo checkout is in.
 */
export function decideAutoUpdate(report: HarnessCheckReport): AutoUpdateDecision {
	if (report.codexHomeInstalled === report.latest) return { action: "up-to-date" };
	return { action: "update", latest: report.latest };
}

/** Resolved locations used by the job. */
export interface JobPaths {
	codexHome: string;
	logFile: string;
	lockFile: string;
}

/**
 * Real home (default `~/.codex`) logs to `~/Library/Logs` and locks in `~/Library/Caches`.
 * A custom `CODEX_HOME` (e.g. a test run) keeps its log and lock INSIDE that dir, so it can
 * never write the real log or contend for the real lock.
 */
export function resolveJobPaths(env: Record<string, string | undefined>, home: string): JobPaths {
	const defaultHome = resolve(home, ".codex");
	// Normalized: `~/.codex/` or `~/.codex/.` must share the real lock, never get a second one inside the home.
	const codexHome = env.CODEX_HOME ? resolve(env.CODEX_HOME) : defaultHome;
	if (codexHome === defaultHome) {
		return {
			codexHome,
			logFile: join(home, "Library", "Logs", "fusengine-harness-auto-update.log"),
			lockFile: join(home, "Library", "Caches", "fusengine-harness-auto-update.lock"),
		};
	}
	return {
		codexHome,
		logFile: join(codexHome, "fusengine-harness-auto-update.log"),
		lockFile: join(codexHome, ".fusengine-harness-auto-update.lock"),
	};
}

/** Log note when the repo's declared pin trails `~/.codex` (the job never edits the repo); `null` when aligned. */
export function repoPinNote(declared: string, codexVersion: string, codexHome = "~/.codex"): string | null {
	if (declared === codexVersion) return null;
	return `repo pin ${declared} behind ${codexHome} ${codexVersion} — bump at next commit cycle`;
}

/** One log line: ISO timestamp, a space, the message, a newline. */
export function formatLogLine(message: string, now: Date = new Date()): string {
	return `${now.toISOString()} ${message}\n`;
}

/** Append one timestamped line to `file`, creating its parent directory if needed. */
export function appendLog(file: string, message: string, now: Date = new Date()): void {
	mkdirSync(dirname(file), { recursive: true });
	appendFileSync(file, formatLogLine(message, now));
}
