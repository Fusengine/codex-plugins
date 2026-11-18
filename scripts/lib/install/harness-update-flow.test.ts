/**
 * harness-update-flow.test.ts — split off `harness-update.test.ts` (which
 * covers the original primitives) to stay under the 200-line file ceiling.
 * Covers the defect-fix primitives added to `harness-update.ts`: snapshot
 * round-trip, the `needsUpdate` re-audit gate, `readAuditedVersion`, and the
 * `auditHarnessScopes` negative control.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	AUDIT_CONTROL_SCOPE,
	auditHarnessScopes,
	needsUpdate,
	readAuditedVersion,
	restoreSnapshot,
	takeSnapshot,
} from "./harness-update";

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { force: true, recursive: true })));

function tempRoot(): string {
	const root = mkdtempSync(join(tmpdir(), "harness-update-flow-"));
	roots.push(root);
	return root;
}

describe("takeSnapshot / restoreSnapshot", () => {
	test("restores package.json and bun.lock byte-for-byte", () => {
		const root = tempRoot();
		const pkgOriginal = '{\n\t"dependencies": {\n\t\t"@fusengine/harness": "^0.1.90"\n\t}\n}\n';
		const lockOriginal = "# lockfile v1\n";
		writeFileSync(join(root, "package.json"), pkgOriginal);
		writeFileSync(join(root, "bun.lock"), lockOriginal);

		const snapshot = takeSnapshot(root);
		writeFileSync(join(root, "package.json"), '{\n\t"dependencies": {}\n}\n');
		writeFileSync(join(root, "bun.lock"), "# lockfile v2\n");
		restoreSnapshot(root, snapshot);

		expect(readFileSync(join(root, "package.json"), "utf8")).toBe(pkgOriginal);
		expect(readFileSync(join(root, "bun.lock"), "utf8")).toBe(lockOriginal);
	});

	test("deletes bun.lock on restore when it did not exist before the snapshot", () => {
		const root = tempRoot();
		writeFileSync(join(root, "package.json"), "{}\n");

		const snapshot = takeSnapshot(root);
		expect(snapshot.bunLock).toBeNull();
		writeFileSync(join(root, "bun.lock"), "# created during update\n");
		restoreSnapshot(root, snapshot);

		expect(existsSync(join(root, "bun.lock"))).toBe(false);
	});
});

describe("needsUpdate", () => {
	test("true when declared is a caret range even if its version equals target (exact pin enforced)", () => {
		expect(needsUpdate("0.1.91", "0.1.91", "^0.1.91", "0.1.91")).toBe(true);
	});

	test("false when declared is an exact pin matching target", () => {
		expect(needsUpdate("0.1.91", "0.1.91", "0.1.91", "0.1.91")).toBe(false);
	});

	test("true when installed matches target but audited tripwire is behind", () => {
		expect(needsUpdate("0.1.91", "0.1.90", "^0.1.91", "0.1.91")).toBe(true);
	});

	test("true when installed matches target but declared range is behind", () => {
		expect(needsUpdate("0.1.91", "0.1.91", "^0.1.90", "0.1.91")).toBe(true);
	});

	test("true when declared exact pin is behind target", () => {
		expect(needsUpdate("0.1.91", "0.1.91", "0.1.90", "0.1.91")).toBe(true);
	});

	test("true when installed itself is behind target", () => {
		expect(needsUpdate("0.1.90", "0.1.90", "^0.1.90", "0.1.91")).toBe(true);
	});
});

describe("readAuditedVersion", () => {
	test("reads the current HARNESS_VERSION value", () => {
		const root = tempRoot();
		mkdirSync(join(root, "scripts", "lib"), { recursive: true });
		writeFileSync(
			join(root, "scripts", "lib", "harness-hook-policy.ts"),
			'export const HARNESS_VERSION = "0.1.90";\n',
		);
		expect(readAuditedVersion(root)).toBe("0.1.90");
	});

	test("throws when HARNESS_VERSION line is missing", () => {
		const root = tempRoot();
		mkdirSync(join(root, "scripts", "lib"), { recursive: true });
		writeFileSync(join(root, "scripts", "lib", "harness-hook-policy.ts"), "export const X = 1;\n");
		expect(() => readAuditedVersion(root)).toThrow();
	});
});

describe("auditHarnessScopes negative control", () => {
	function fakeBinRoot(script: string): string {
		const root = tempRoot();
		const binDir = join(root, "node_modules", "@fusengine", "harness", "dist", "cli");
		mkdirSync(binDir, { recursive: true });
		writeFileSync(join(binDir, "bin.mjs"), script);
		return root;
	}

	test("fails every scope when the control is silently accepted", () => {
		const root = fakeBinRoot("process.exit(0);\n");
		const codexHome = mkdtempSync(join(tmpdir(), "harness-audit-home-"));
		roots.push(codexHome);

		const results = auditHarnessScopes(root, ["core", "solid"], codexHome);

		expect(results.find((r) => r.scope === "(control)")?.ok).toBe(false);
		expect(results.every((r) => !r.ok)).toBe(true);
		expect(results.every((r) => r.detail.includes("audit signal unavailable"))).toBe(true);
	});

	test("proceeds normally when only the control scope is rejected as unknown", () => {
		const root = fakeBinRoot(
			[
				"const scope = process.argv.at(-1);",
				`if (scope === ${JSON.stringify(AUDIT_CONTROL_SCOPE)}) {`,
				'\tprocess.stderr.write(`harness: unknown scope "${scope}", falling back to "core"\\n`);',
				"\tprocess.exit(1);",
				"}",
				"process.exit(0);",
			].join("\n"),
		);
		const codexHome = mkdtempSync(join(tmpdir(), "harness-audit-home-"));
		roots.push(codexHome);

		const results = auditHarnessScopes(root, ["core", "solid"], codexHome);

		expect(results.find((r) => r.scope === "core")?.ok).toBe(true);
		expect(results.find((r) => r.scope === "solid")?.ok).toBe(true);
	});
});
