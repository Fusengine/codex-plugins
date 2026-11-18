/**
 * harness-update.ts — pure, testable primitives for bumping the shared
 * `@fusengine/harness` dependency and auditing the installed binary before
 * the tripwire (`HARNESS_VERSION` in harness-hook-policy.ts) is advanced.
 *
 * Empirical audit signal (measured against the installed 0.1.90 binary,
 * 2026-09-02): `bun bin.mjs hook codex <scope>` ALWAYS exits 0, even for an
 * unrecognized scope — it silently falls back to `"core"` and only signals
 * the problem via stderr: `harness: unknown scope "<scope>", falling back to
 * "core"`. A scope is therefore audited as failing when either the process
 * exits non-zero (covers a future/older harness that hard-fails) OR stderr
 * contains "unknown scope" (covers the current silent-fallback behavior).
 *
 * Negative control: because the whole signal rests on stderr text matching,
 * `auditHarnessScopes` first probes a deliberately bogus scope
 * (`AUDIT_CONTROL_SCOPE`). If that probe is NOT flagged unknown, the signal
 * itself is unavailable (a future harness could accept anything silently and
 * this audit would report 11/11 green) — the whole audit is failed rather
 * than trusting any individual scope result.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { HarnessScope } from "../harness-hook.types";

/** Result of auditing one Harness scope against the installed binary. */
export interface ScopeAuditResult {
	scope: string;
	ok: boolean;
	detail: string;
}

/** Snapshot of the two files a harness update can mutate, for atomic restore. */
export interface HarnessSnapshot {
	packageJson: string;
	/** `null` means `bun.lock` did not exist before the update. */
	bunLock: string | null;
	/** `harness-hook-policy.ts` (carries the `HARNESS_VERSION` tripwire); `null` when absent. */
	hookPolicy: string | null;
}

/** Read the RESOLVED `@fusengine/harness` version installed under `root/node_modules`. */
export function installedHarnessVersion(root: string): string {
	const file = join(root, "node_modules", "@fusengine", "harness", "package.json");
	return (JSON.parse(readFileSync(file, "utf8")) as { version: string }).version;
}

/** Capture `package.json`, `bun.lock` and the tripwire file (if present) so a failed update can be reverted. */
export function takeSnapshot(root: string): HarnessSnapshot {
	const bunLockFile = join(root, "bun.lock");
	const policyFile = harnessHookPolicyPath(root);
	return {
		packageJson: readFileSync(join(root, "package.json"), "utf8"),
		bunLock: existsSync(bunLockFile) ? readFileSync(bunLockFile, "utf8") : null,
		hookPolicy: existsSync(policyFile) ? readFileSync(policyFile, "utf8") : null,
	};
}

/** Restore `package.json`, `bun.lock` and `HARNESS_VERSION` from a snapshot taken by `takeSnapshot`. */
export function restoreSnapshot(root: string, snapshot: HarnessSnapshot): void {
	writeFileSync(join(root, "package.json"), snapshot.packageJson);
	if (snapshot.hookPolicy !== null) writeFileSync(harnessHookPolicyPath(root), snapshot.hookPolicy);
	const bunLockFile = join(root, "bun.lock");
	if (snapshot.bunLock === null) {
		if (existsSync(bunLockFile)) rmSync(bunLockFile);
	} else {
		writeFileSync(bunLockFile, snapshot.bunLock);
	}
}

/**
 * True unless the repo is already fully settled on `target`: installed
 * package, audited tripwire, and declared range must all match — else a
 * stale `HARNESS_VERSION` or declared spec would dead-end `--check` even
 * though `node_modules` already holds the target (the reinstall is then a
 * safe no-op). `declared` must be the exact pin `X.Y.Z` (see
 * `bumpHarnessSpec`): a caret/range spec counts as drift even when its
 * version equals `target`, so the next update normalises it to an exact pin.
 */
export function needsUpdate(installed: string, audited: string, declared: string, target: string): boolean {
	return !(installed === target && audited === target && declared === target);
}

function runPmView(): string {
	const proc = Bun.spawnSync(["bun", "pm", "view", "@fusengine/harness", "version"], {
		stdout: "pipe",
		stderr: "pipe",
	});
	if (!proc.success) throw new Error(`bun pm view @fusengine/harness failed: ${proc.stderr.toString().trim()}`);
	return proc.stdout.toString("utf8");
}

const RELEASE_VERSION_RE = /^\d+\.\d+\.\d+$/;

/** Throws unless `version` is a bare `X.Y.Z` release (no prerelease/build tag — those defeat `HARNESS_DEP_RE`/`HARNESS_VERSION_RE`, both `[\d.]+`). */
export function assertReleaseVersion(version: string): void {
	if (!RELEASE_VERSION_RE.test(version)) throw new Error(`harness: prerelease/invalid version "${version}" refused`);
}

/** Resolve the latest published `@fusengine/harness` version (`bun pm view`, injectable for tests). */
export function latestHarnessVersion(fetchLatest: () => string = runPmView): string {
	const version = fetchLatest().trim();
	assertReleaseVersion(version);
	return version;
}

const HARNESS_DEP_RE = /^(\s*"@fusengine\/harness":\s*")\^?[\d.]+("[,]?\s*)$/;

/** Rewrite only the `"@fusengine/harness"` dependency line in `root/package.json`, always as a bare exact pin `X.Y.Z` (never a caret range). */
export function bumpHarnessSpec(root: string, version: string): void {
	const file = join(root, "package.json");
	const lines = readFileSync(file, "utf8").split("\n");
	const spec = version;
	let matched = false;
	const next = lines.map((line) => {
		const match = line.match(HARNESS_DEP_RE);
		if (!match) return line;
		matched = true;
		return `${match[1]}${spec}${match[2]}`;
	});
	if (!matched) throw new Error(`bumpHarnessSpec: no "@fusengine/harness" dependency line found in ${file}`);
	writeFileSync(file, next.join("\n"));
}

const HARNESS_VERSION_RE = /^(export const HARNESS_VERSION = ")([\d.]+)(";)$/;

function harnessHookPolicyPath(root: string): string {
	return join(root, "scripts", "lib", "harness-hook-policy.ts");
}

/** Rewrite only the `HARNESS_VERSION` constant line in `harness-hook-policy.ts` (post-audit). */
export function writeAuditedVersion(root: string, version: string): void {
	const file = harnessHookPolicyPath(root);
	const lines = readFileSync(file, "utf8").split("\n");
	let matched = false;
	const next = lines.map((line) => {
		const match = line.match(HARNESS_VERSION_RE);
		if (!match) return line;
		matched = true;
		return `${match[1]}${version}${match[3]}`;
	});
	if (!matched) throw new Error(`writeAuditedVersion: HARNESS_VERSION line not found in ${file}`);
	writeFileSync(file, next.join("\n"));
}

/** Read the current `HARNESS_VERSION` tripwire value from `harness-hook-policy.ts`. */
export function readAuditedVersion(root: string): string {
	const file = harnessHookPolicyPath(root);
	const lines = readFileSync(file, "utf8").split("\n");
	for (const line of lines) {
		const match = line.match(HARNESS_VERSION_RE);
		if (match) return match[2];
	}
	throw new Error(`readAuditedVersion: HARNESS_VERSION line not found in ${file}`);
}

/** Deliberately bogus scope used as a negative control before trusting any audit result. */
export const AUDIT_CONTROL_SCOPE = "fusengine-audit-control-bogus";

function probeHarnessScope(bin: string, scope: string, codexHome: string, stdin: string): ScopeAuditResult {
	const proc = Bun.spawnSync(["bun", bin, "hook", "codex", scope], {
		stdin: Buffer.from(stdin),
		stdout: "pipe",
		stderr: "pipe",
		cwd: codexHome,
		env: { ...process.env, CODEX_HOME: codexHome },
	});
	const stderr = proc.stderr.toString("utf8");
	const unknown = stderr.includes("unknown scope");
	const ok = proc.exitCode === 0 && !unknown;
	const detail = ok ? "ok" : unknown ? stderr.trim() : `exit ${proc.exitCode}: ${stderr.trim()}`;
	return { scope, ok, detail };
}

/**
 * Exercise the installed harness binary for every scope with a minimal
 * `SessionStart` stdin, isolated under `codexHome` (never the real
 * `~/.codex`). See module doc for the audit signal this relies on, and for
 * the `AUDIT_CONTROL_SCOPE` negative control run before any real scope.
 */
export function auditHarnessScopes(
	root: string,
	scopes: readonly HarnessScope[],
	codexHome: string,
): ScopeAuditResult[] {
	const bin = join(root, "node_modules", "@fusengine", "harness", "dist", "cli", "bin.mjs");
	const stdin = JSON.stringify({ hook_event_name: "SessionStart", cwd: codexHome });
	const control = probeHarnessScope(bin, AUDIT_CONTROL_SCOPE, codexHome, stdin);
	if (control.ok) {
		const detail = "audit signal unavailable: unknown scope accepted silently";
		return [
			{ scope: "(control)", ok: false, detail },
			...scopes.map((scope) => ({ scope, ok: false, detail })),
		];
	}
	return scopes.map((scope) => probeHarnessScope(bin, scope, codexHome, stdin));
}
