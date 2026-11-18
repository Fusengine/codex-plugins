#!/usr/bin/env bun
/**
 * harness-auto-update.ts — manual entry (`bun run harness:auto-update [--dry-run]`) of the
 * audited `@fusengine/harness` updater. The same flow also runs best-effort at the end of
 * `bun run sync:agents` and the installer `./setup.sh` (skip with `FUSE_HARNESS_AUTO_UPDATE=0`).
 * Flow and guarantees: scripts/lib/install/harness-auto-update-run.ts.
 * A custom `CODEX_HOME` keeps its log and lock inside it (resolveJobPaths).
 */
import { homedir } from "node:os";
import { dirname } from "node:path";
import { appendLog, resolveJobPaths } from "./lib/install/harness-auto-update";
import { AUTO_UPDATE_LOCK_HELD, runAutoUpdate } from "./lib/install/harness-auto-update-run";

const root = dirname(import.meta.dir);
const { codexHome, logFile, lockFile } = resolveJobPaths(process.env, homedir());
const dryRun = process.argv.includes("--dry-run");

let exitCode: number;
try {
	const code = await runAutoUpdate({ root, codexHome, logFile, lockFile, dryRun, echo: (m) => console.log(m) });
	exitCode = code === AUTO_UPDATE_LOCK_HELD ? 0 : code;
} catch (err) {
	const message = `FAILED: ${err instanceof Error ? err.message : String(err)}`;
	console.log(message);
	if (!dryRun) appendLog(logFile, message);
	exitCode = 1;
}
process.exit(exitCode);
