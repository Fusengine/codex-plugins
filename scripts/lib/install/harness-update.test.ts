import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertReleaseVersion, auditHarnessScopes, bumpHarnessSpec, latestHarnessVersion, writeAuditedVersion } from "./harness-update";

const roots: string[] = [];
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { force: true, recursive: true })));

function tempRoot(): string {
	const root = mkdtempSync(join(tmpdir(), "harness-update-"));
	roots.push(root);
	return root;
}

describe("bumpHarnessSpec", () => {
	function pkgWith(spec: string): string {
		return ["{", '\t"dependencies": {', '\t\t"@clack/prompts": "^1.7.0",', `\t\t"@fusengine/harness": "${spec}",`, '\t\t"cheerio": "^1.2.0"', "\t}", "}", ""].join(
			"\n",
		);
	}

	test("writes a bare X.Y.Z pin (never a caret), byte-for-byte elsewhere", () => {
		const root = tempRoot();
		const original = pkgWith("^0.1.90");
		writeFileSync(join(root, "package.json"), original);

		bumpHarnessSpec(root, "0.1.99");
		const lines = readFileSync(join(root, "package.json"), "utf8").split("\n");

		expect(lines[3]).toBe('\t\t"@fusengine/harness": "0.1.99",');
		expect(lines[2]).toBe(original.split("\n")[2]);
		expect(lines[4]).toBe(original.split("\n")[4]);
		expect(lines.length).toBe(original.split("\n").length);
	});

	test("overwrites a previously-exact pin", () => {
		const root = tempRoot();
		writeFileSync(join(root, "package.json"), pkgWith("0.1.90"));

		bumpHarnessSpec(root, "0.1.99");
		const lines = readFileSync(join(root, "package.json"), "utf8").split("\n");

		expect(lines[3]).toBe('\t\t"@fusengine/harness": "0.1.99",');
	});

	test("throws when no @fusengine/harness line exists", () => {
		const root = tempRoot();
		writeFileSync(join(root, "package.json"), '{\n\t"dependencies": {}\n}\n');
		expect(() => bumpHarnessSpec(root, "0.1.99")).toThrow();
	});
});

describe("assertReleaseVersion", () => {
	test("accepts a bare X.Y.Z release", () => {
		expect(() => assertReleaseVersion("0.1.91")).not.toThrow();
	});

	test("refuses a prerelease tag", () => {
		expect(() => assertReleaseVersion("0.1.91-beta.1")).toThrow('harness: prerelease/invalid version "0.1.91-beta.1" refused');
	});

	test("refuses build metadata", () => {
		expect(() => assertReleaseVersion("0.1.91+build.5")).toThrow();
	});
});

describe("writeAuditedVersion", () => {
	test("rewrites only the HARNESS_VERSION line, byte-for-byte elsewhere", () => {
		const root = tempRoot();
		mkdirSync(join(root, "scripts", "lib"), { recursive: true });
		const original = [
			'import routesJson from "./harness-hook-routes.json";',
			"",
			'export const HARNESS_VERSION = "0.1.90";',
			'export const HARNESS_SCOPES = ["core"];',
			"",
		].join("\n");
		writeFileSync(join(root, "scripts", "lib", "harness-hook-policy.ts"), original);

		writeAuditedVersion(root, "0.1.99");
		const lines = readFileSync(join(root, "scripts", "lib", "harness-hook-policy.ts"), "utf8").split("\n");

		expect(lines[2]).toBe('export const HARNESS_VERSION = "0.1.99";');
		expect(lines[0]).toBe(original.split("\n")[0]);
		expect(lines[3]).toBe(original.split("\n")[3]);
	});

	test("throws when HARNESS_VERSION line is missing", () => {
		const root = tempRoot();
		mkdirSync(join(root, "scripts", "lib"), { recursive: true });
		writeFileSync(join(root, "scripts", "lib", "harness-hook-policy.ts"), "export const X = 1;\n");
		expect(() => writeAuditedVersion(root, "0.1.99")).toThrow();
	});
});

describe("auditHarnessScopes", () => {
	function fakeBinRoot(): string {
		const root = tempRoot();
		const binDir = join(root, "node_modules", "@fusengine", "harness", "dist", "cli");
		mkdirSync(binDir, { recursive: true });
		writeFileSync(
			join(binDir, "bin.mjs"),
			[
				"const scope = process.argv.at(-1);",
				'const known = ["core", "solid"];',
				"if (!known.includes(scope)) {",
				'\tprocess.stderr.write(`harness: unknown scope "${scope}", falling back to "core"\\n`);',
				"\tprocess.exit(1);",
				"}",
				"process.exit(0);",
			].join("\n"),
		);
		return root;
	}

	test("reports ok for known scopes and failing for an unknown one", () => {
		const root = fakeBinRoot();
		const codexHome = mkdtempSync(join(tmpdir(), "harness-audit-home-"));
		roots.push(codexHome);

		const results = auditHarnessScopes(root, ["core", "solid", "bogus" as never], codexHome);

		expect(results.find((r) => r.scope === "core")?.ok).toBe(true);
		expect(results.find((r) => r.scope === "solid")?.ok).toBe(true);
		const bogus = results.find((r) => r.scope === "bogus");
		expect(bogus?.ok).toBe(false);
		expect(bogus?.detail).toContain("unknown scope");
	});
});

describe("latestHarnessVersion", () => {
	test("returns the injected version, no network call", () => {
		expect(latestHarnessVersion(() => "0.1.99\n")).toBe("0.1.99");
	});

	test("throws on unexpected output", () => {
		expect(() => latestHarnessVersion(() => "not-a-version")).toThrow();
	});

	test("refuses a prerelease version (would defeat HARNESS_DEP_RE/HARNESS_VERSION_RE)", () => {
		expect(() => latestHarnessVersion(() => "0.1.91-beta.1\n")).toThrow('harness: prerelease/invalid version "0.1.91-beta.1" refused');
	});
});
