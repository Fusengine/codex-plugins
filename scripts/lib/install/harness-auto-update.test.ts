import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendLog, decideAutoUpdate, formatLogLine, repoPinNote, resolveJobPaths } from "./harness-auto-update";
import type { HarnessCheckReport } from "./harness-update-flow";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

function tempDir(): string {
	const dir = mkdtempSync(join(tmpdir(), "harness-auto-"));
	dirs.push(dir);
	return dir;
}

function report(overrides: Partial<HarnessCheckReport>): HarnessCheckReport {
	return {
		installed: "0.1.126",
		declared: "0.1.126",
		audited: "0.1.126",
		latest: "0.1.126",
		codexHomeInstalled: "0.1.126",
		upToDate: true,
		...overrides,
	};
}

const NOW = new Date("2026-11-18T09:00:00.000Z");

describe("decideAutoUpdate", () => {
	test("up-to-date when ~/.codex already holds latest", () => {
		expect(decideAutoUpdate(report({}))).toEqual({ action: "up-to-date" });
	});

	test("the working repo's state never matters: a behind repo + current ~/.codex is up to date", () => {
		const decision = decideAutoUpdate(report({ installed: "0.1.120", declared: "^0.1.120", audited: "0.1.120", upToDate: false }));
		expect(decision).toEqual({ action: "up-to-date" });
	});

	test("update when ~/.codex lags behind latest", () => {
		const decision = decideAutoUpdate(report({ latest: "0.1.127", codexHomeInstalled: "0.1.126" }));
		expect(decision).toEqual({ action: "update", latest: "0.1.127" });
	});

	test("update when ~/.codex has no harness install", () => {
		expect(decideAutoUpdate(report({ codexHomeInstalled: "not installed" })).action).toBe("update");
	});
});

describe("resolveJobPaths", () => {
	test("default home: real ~/.codex, ~/Library/Logs log, ~/Library/Caches lock", () => {
		expect(resolveJobPaths({}, "/Users/me")).toEqual({
			codexHome: "/Users/me/.codex",
			logFile: "/Users/me/Library/Logs/fusengine-harness-auto-update.log",
			lockFile: "/Users/me/Library/Caches/fusengine-harness-auto-update.lock",
		});
	});

	test("CODEX_HOME equal to the default is still the real home", () => {
		expect(resolveJobPaths({ CODEX_HOME: "/Users/me/.codex" }, "/Users/me").logFile).toBe("/Users/me/Library/Logs/fusengine-harness-auto-update.log");
	});

	test("a non-normalized spelling of the default home shares the REAL lock (no second lock -> no concurrent runs)", () => {
		for (const spelling of ["/Users/me/.codex/", "/Users/me/.codex/.", "/Users/me/x/../.codex"]) {
			expect(resolveJobPaths({ CODEX_HOME: spelling }, "/Users/me")).toEqual(resolveJobPaths({}, "/Users/me"));
		}
	});

	test("a custom CODEX_HOME (test run) gets its log and lock INSIDE it, never the real ones", () => {
		const paths = resolveJobPaths({ CODEX_HOME: "/tmp/x" }, "/Users/me");
		expect(paths).toEqual({
			codexHome: "/tmp/x",
			logFile: "/tmp/x/fusengine-harness-auto-update.log",
			lockFile: "/tmp/x/.fusengine-harness-auto-update.lock",
		});
	});
});

describe("repoPinNote", () => {
	test("null when the repo pin already equals the ~/.codex version", () => {
		expect(repoPinNote("0.1.126", "0.1.126")).toBeNull();
	});

	test("tells the owner to bump the repo pin at the next commit cycle", () => {
		expect(repoPinNote("0.1.126", "0.1.127")).toBe("repo pin 0.1.126 behind ~/.codex 0.1.127 — bump at next commit cycle");
	});
});

describe("formatLogLine / appendLog", () => {
	test("prefixes an ISO timestamp and ends with a newline", () => {
		expect(formatLogLine("up to date", NOW)).toBe("2026-11-18T09:00:00.000Z up to date\n");
	});

	test("appends (never truncates) and creates the parent directory", () => {
		const file = join(tempDir(), "logs", "auto.log");
		appendLog(file, "first", NOW);
		appendLog(file, "second", NOW);
		expect(readFileSync(file, "utf8")).toBe("2026-11-18T09:00:00.000Z first\n2026-11-18T09:00:00.000Z second\n");
	});
});
