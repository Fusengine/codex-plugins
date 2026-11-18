#!/usr/bin/env bun
/**
 * update-harness.ts — bump the shared `@fusengine/harness` dep to the
 * latest published version, reinstall, audit all 11 scopes, then advance
 * `HARNESS_VERSION`. `--check` only reports (no writes). See
 * scripts/lib/install/harness-update{,-flow}.ts for the logic.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { HARNESS_SCOPES } from "./lib/harness-hook-policy";
import {
	assertReleaseVersion,
	bumpHarnessSpec,
	installedHarnessVersion,
	latestHarnessVersion,
	needsUpdate,
	readAuditedVersion,
	takeSnapshot,
} from "./lib/install/harness-update";
import { checkHarnessStatus, declaredHarnessSpec, recoverFromSnapshot, runHarnessUpdate } from "./lib/install/harness-update-flow";

const root = process.cwd();
const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");

if (process.argv.includes("--check")) {
	const report = checkHarnessStatus(root, codexHome);
	console.log(
		`installed=${report.installed} declared=${report.declared} audited=${report.audited} latest=${report.latest} ~/.codex=${report.codexHomeInstalled}`,
	);
	process.exit(report.upToDate ? 0 : 1);
}

const arg = process.argv[2];
const explicit = arg !== undefined && !arg.startsWith("--");
if (explicit) assertReleaseVersion(arg);
const target = explicit ? arg : latestHarnessVersion();
const before = installedHarnessVersion(root);
const declared = declaredHarnessSpec(root);
const audited = readAuditedVersion(root);
if (!needsUpdate(before, audited, declared, target)) {
	console.log(`harness: already ${target}`);
	process.exit(0);
}

const snapshot = takeSnapshot(root);
bumpHarnessSpec(root, target);
const scratchCodexHome = mkdtempSync(join(tmpdir(), "harness-audit-"));
// `process.exit()` inside a `try`/`catch` skips `finally` on both Node and
// Bun — the exit code is captured here and applied AFTER the try/finally so
// the scratch CODEX_HOME cleanup below always runs.
let exitCode: number;
try {
	exitCode = runHarnessUpdate(root, target, HARNESS_SCOPES, scratchCodexHome, snapshot, before);
} catch (err) {
	const message = err instanceof Error ? err.message : String(err);
	exitCode = recoverFromSnapshot(root, snapshot, message);
} finally {
	rmSync(scratchCodexHome, { recursive: true, force: true });
}
process.exit(exitCode);
