/**
 * harness-update-flow.ts — orchestration for `scripts/update-harness.ts`.
 * Keeps the entry point thin: this module owns subprocess calls (`bun
 * install`, `bun run validate`, `bun test`), the audit-or-restore decision,
 * and result formatting. Pure version/audit primitives live in
 * harness-update.ts; this file has no module-level mutable state.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { HarnessScope } from "../harness-hook.types";
import {
	auditHarnessScopes,
	type HarnessSnapshot,
	installedHarnessVersion,
	latestHarnessVersion,
	needsUpdate,
	readAuditedVersion,
	restoreSnapshot,
	writeAuditedVersion,
} from "./harness-update";

/** Report shape for `--check` mode: read-only, no writes. */
export interface HarnessCheckReport {
	installed: string;
	declared: string;
	audited: string;
	latest: string;
	codexHomeInstalled: string;
	upToDate: boolean;
}

/** Read the raw declared `@fusengine/harness` semver range from `root/package.json`. */
export function declaredHarnessSpec(root: string): string {
	const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
		dependencies?: Record<string, string>;
	};
	return pkg.dependencies?.["@fusengine/harness"] ?? "(none)";
}

/**
 * Build the `--check` report; never writes anything. `upToDate` reflects
 * `needsUpdate` (installed + audited tripwire + declared spec all matching
 * `latest`), not just the installed/latest comparison, so `--check` also
 * catches tripwire and declared-range drift. `fetchLatest` is forwarded to
 * `latestHarnessVersion` for tests (defaults to the real `bun pm view`).
 */
export function checkHarnessStatus(root: string, codexHome: string, fetchLatest?: () => string): HarnessCheckReport {
	const installed = installedHarnessVersion(root);
	const declared = declaredHarnessSpec(root);
	const audited = readAuditedVersion(root);
	const latest = latestHarnessVersion(fetchLatest);
	let codexHomeInstalled = "not installed";
	try {
		codexHomeInstalled = installedHarnessVersion(codexHome);
	} catch {
		/* ~/.codex has no harness install yet — report only, never write there. */
	}
	const upToDate = !needsUpdate(installed, audited, declared, latest);
	return { installed, declared, audited, latest, codexHomeInstalled, upToDate };
}

function run(args: string[], root: string): number {
	return Bun.spawnSync(args, { cwd: root, stdio: ["ignore", "inherit", "inherit"] }).exitCode ?? 1;
}

/** Subprocess seam of the update flow (injectable in tests): command runner + `bun test` summary. */
export interface UpdateSteps {
	exec(args: string[], root: string): number;
	tests(root: string): { pass: string; fail: string };
}

function runTests(root: string): { pass: string; fail: string } {
	const result = Bun.spawnSync(["bun", "test"], { cwd: root, stdout: "pipe", stderr: "pipe" });
	process.stdout.write(result.stdout);
	process.stderr.write(result.stderr);
	const out = result.stdout.toString("utf8") + result.stderr.toString("utf8");
	return { pass: out.match(/(\d+)\s+pass/)?.[1] ?? "?", fail: out.match(/(\d+)\s+fail/)?.[1] ?? "?" };
}

const defaultSteps: UpdateSteps = { exec: run, tests: runTests };

/**
 * Restore both snapshotted files, then reinstall with `--frozen-lockfile` so
 * a `package.json`/`bun.lock` mismatch fails loudly instead of silently
 * re-resolving. The recovery install's own exit code is folded into the
 * abort message so a failed rollback is never mistaken for a clean one.
 * Exported so the `update-harness.ts` entry point's own `catch` (an
 * unexpected throw from `runHarnessUpdate` itself) reinstalls too, instead of
 * restoring files and leaving `node_modules` stale.
 */
export function recoverFromSnapshot(
	root: string,
	snapshot: HarnessSnapshot,
	reason: string,
	exec: UpdateSteps["exec"] = run,
): number {
	restoreSnapshot(root, snapshot);
	const recoveryExit = exec(["bun", "install", "--frozen-lockfile"], root);
	console.error(`harness: update aborted — ${reason} (recovery bun install exit=${recoveryExit})`);
	return 1;
}

/**
 * Reinstall, audit, and (only on 11/11 success) advance the tripwire. Caller
 * must have already taken `snapshot` (via `takeSnapshot`) and called
 * `bumpHarnessSpec(root, target)` before invoking this. Any failure —
 * including an unexpected throw while reading the post-install version, a
 * failing `bun run validate` or a failing `bun test` after the audit —
 * restores `package.json`, `bun.lock` AND the `HARNESS_VERSION` tripwire from
 * `snapshot` and reinstalls: the repo never stays on an unvalidated version.
 */
export function runHarnessUpdate(
	root: string,
	target: string,
	scopes: readonly HarnessScope[],
	codexHome: string,
	snapshot: HarnessSnapshot,
	before: string,
	steps: UpdateSteps = defaultSteps,
): number {
	const recover = (reason: string): number => recoverFromSnapshot(root, snapshot, reason, steps.exec);
	if (steps.exec(["bun", "install"], root) !== 0) return recover(`bun install failed for ${target}`);

	let after: string;
	try {
		after = installedHarnessVersion(root);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return recover(`install verify threw: ${message}`);
	}
	if (after !== target) return recover(`install verify failed: got ${after}, expected ${target}`);

	const results = auditHarnessScopes(root, scopes, codexHome);
	const failed = results.filter((r) => !r.ok);
	if (failed.length > 0) {
		const detail = failed.map((f) => `${f.scope}: ${f.detail}`).join("; ");
		return recover(`audit failed (${failed.length}/${scopes.length}): ${detail}`);
	}

	writeAuditedVersion(root, target);
	const validate = steps.exec(["bun", "run", "validate"], root);
	const { pass, fail } = steps.tests(root);
	console.log(`harness: ${before} -> ${target}, audited scopes ${results.length}/${results.length}, validate=${validate}, tests=${pass}/${fail}`);
	if (validate !== 0 || fail !== "0") return recover(`validate=${validate} tests=${pass}/${fail} after audit`);
	return 0;
}
