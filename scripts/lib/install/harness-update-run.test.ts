/**
 * harness-update-run.test.ts — `runHarnessUpdate` failure semantics: a failing
 * `validate` or `bun test` after the audit must roll the repo back (package.json,
 * bun.lock AND the HARNESS_VERSION tripwire), never leave it on the new version.
 * Subprocesses are injected (`UpdateSteps`) so no network / real install runs.
 */
import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readAuditedVersion, takeSnapshot } from "./harness-update";
import { runHarnessUpdate, type UpdateSteps } from "./harness-update-flow";

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { force: true, recursive: true })));

const OLD = "0.1.90";
const NEW = "0.1.91";
const OLD_PKG = `{\n\t"dependencies": {\n\t\t"@fusengine/harness": "${OLD}"\n\t}\n}\n`;
const NEW_PKG = OLD_PKG.replace(OLD, NEW);

/** Repo already bumped to NEW (package.json, node_modules) with the tripwire still at OLD, snapshot taken before the bump. */
function bumpedRepo(): { root: string; snapshot: ReturnType<typeof takeSnapshot> } {
	const root = mkdtempSync(join(tmpdir(), "harness-run-"));
	roots.push(root);
	mkdirSync(join(root, "scripts", "lib"), { recursive: true });
	writeFileSync(join(root, "scripts", "lib", "harness-hook-policy.ts"), `export const HARNESS_VERSION = "${OLD}";\n`);
	writeFileSync(join(root, "package.json"), OLD_PKG);
	const snapshot = takeSnapshot(root);
	writeFileSync(join(root, "package.json"), NEW_PKG);
	const pkgDir = join(root, "node_modules", "@fusengine", "harness");
	mkdirSync(join(pkgDir, "dist", "cli"), { recursive: true });
	writeFileSync(join(pkgDir, "package.json"), JSON.stringify({ version: NEW }));
	writeFileSync(join(pkgDir, "dist", "cli", "bin.mjs"), 'if (process.argv.at(-1) !== "core") { process.stderr.write("unknown scope"); }\n');
	return { root, snapshot };
}

function steps(validateCode: number, testFail: string, calls: string[][]): UpdateSteps {
	return {
		exec: (args) => {
			calls.push(args);
			return args[2] === "validate" ? validateCode : 0;
		},
		tests: () => ({ pass: "10", fail: testFail }),
	};
}

function run(root: string, snapshot: ReturnType<typeof takeSnapshot>, s: UpdateSteps): number {
	const scratch = mkdtempSync(join(tmpdir(), "harness-run-home-"));
	roots.push(scratch);
	const log = spyOn(console, "log").mockImplementation(() => {});
	const err = spyOn(console, "error").mockImplementation(() => {});
	try {
		return runHarnessUpdate(root, NEW, ["core"], scratch, snapshot, OLD, s);
	} finally {
		log.mockRestore();
		err.mockRestore();
	}
}

describe("runHarnessUpdate failure semantics", () => {
	test("validate failure rolls back package.json AND HARNESS_VERSION, reinstalls frozen", () => {
		const { root, snapshot } = bumpedRepo();
		const calls: string[][] = [];

		expect(run(root, snapshot, steps(1, "0", calls))).toBe(1);

		expect(readFileSync(join(root, "package.json"), "utf8")).toBe(OLD_PKG);
		expect(readAuditedVersion(root)).toBe(OLD);
		expect(calls.some((c) => c.includes("--frozen-lockfile"))).toBe(true);
	});

	test("test failure rolls back package.json AND HARNESS_VERSION", () => {
		const { root, snapshot } = bumpedRepo();

		expect(run(root, snapshot, steps(0, "2", []))).toBe(1);

		expect(readFileSync(join(root, "package.json"), "utf8")).toBe(OLD_PKG);
		expect(readAuditedVersion(root)).toBe(OLD);
	});

	test("replay after a failure never reports a stale 'already' state (repo is back on OLD)", () => {
		const { root, snapshot } = bumpedRepo();
		run(root, snapshot, steps(1, "0", []));

		expect(readFileSync(join(root, "package.json"), "utf8")).toContain(OLD);
		expect(readAuditedVersion(root)).not.toBe(NEW);
	});

	test("full success keeps the bump and advances HARNESS_VERSION", () => {
		const { root, snapshot } = bumpedRepo();

		expect(run(root, snapshot, steps(0, "0", []))).toBe(0);

		expect(readFileSync(join(root, "package.json"), "utf8")).toBe(NEW_PKG);
		expect(readAuditedVersion(root)).toBe(NEW);
	});
});
