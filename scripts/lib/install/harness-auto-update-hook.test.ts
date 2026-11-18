import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type AutoUpdateHookOptions, autoUpdateBestEffort, isAutoUpdateEnabled } from "./harness-auto-update-hook";
import { AUTO_UPDATE_LOCK_HELD, type AutoUpdateRunOptions } from "./harness-auto-update-run";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

function tempHome(): string {
	const dir = mkdtempSync(join(tmpdir(), "harness-hook-"));
	dirs.push(dir);
	return dir;
}

/** Run the enabled hook against a fresh temp CODEX_HOME, collecting every warning. */
async function runEnabled(run: AutoUpdateHookOptions["run"]) {
	const codexHome = tempHome();
	const warnings: string[] = [];
	const status = await autoUpdateBestEffort({
		root: "/repo",
		home: "/nowhere",
		env: { CODEX_HOME: codexHome },
		run,
		warn: (m) => warnings.push(m),
	});
	return { codexHome, status, warnings };
}

describe("isAutoUpdateEnabled", () => {
	test("on by default", () => {
		expect(isAutoUpdateEnabled({})).toBe(true);
		expect(isAutoUpdateEnabled({ FUSE_HARNESS_AUTO_UPDATE: "1" })).toBe(true);
	});

	test("FUSE_HARNESS_AUTO_UPDATE=0/false/off (any case) disables it", () => {
		for (const value of ["0", "false", "FALSE", "off", "Off"]) {
			expect(isAutoUpdateEnabled({ FUSE_HARNESS_AUTO_UPDATE: value })).toBe(false);
		}
	});
});

describe("autoUpdateBestEffort", () => {
	test("disabled: never calls the run", async () => {
		let calls = 0;
		const status = await autoUpdateBestEffort({
			root: "/repo",
			home: "/nowhere",
			env: { FUSE_HARNESS_AUTO_UPDATE: "0" },
			run: async () => {
				calls++;
				return 0;
			},
		});
		expect(status).toBe("skipped");
		expect(calls).toBe(0);
	});

	test("enabled: runs a real (non dry) update with the resolved codexHome", async () => {
		const codexHome = tempHome();
		let seen: AutoUpdateRunOptions | undefined;
		const status = await autoUpdateBestEffort({
			root: "/repo",
			home: "/nowhere",
			env: { CODEX_HOME: codexHome },
			run: async (opts) => {
				seen = opts;
				return 0;
			},
		});
		expect(status).toBe("ok");
		expect(seen?.root).toBe("/repo");
		expect(seen?.codexHome).toBe(codexHome);
		expect(seen?.dryRun).toBe(false);
	});

	test("a throwing run (npm unreachable) never throws: one-line warning naming the codexHome + a log line", async () => {
		const { codexHome, status, warnings } = await runEnabled(async () => {
			throw new Error("getaddrinfo ENOTFOUND registry.npmjs.org");
		});
		expect(status).toBe("failed");
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toContain(codexHome);
		expect(warnings[0]).toContain("ENOTFOUND");
		expect(warnings[0]).toContain("continuing");
		expect(warnings[0]).not.toContain("\n");
		expect(readFileSync(join(codexHome, "fusengine-harness-auto-update.log"), "utf8")).toContain("ENOTFOUND");
	});

	test("a non-zero run (audit/test failure) warns once and reports failed, without throwing", async () => {
		const { codexHome, status, warnings } = await runEnabled(async () => 1);
		expect(status).toBe("failed");
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toContain(codexHome);
	});

	test("lock already held: one warning, status skipped (never a silent ok)", async () => {
		const { status, warnings } = await runEnabled(async () => AUTO_UPDATE_LOCK_HELD);
		expect(status).toBe("skipped");
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toContain("auto-update skipped: another run holds the lock");
	});

	test("an unwritable log inside the warning path is swallowed", async () => {
		const status = await autoUpdateBestEffort({
			root: "/repo",
			home: "/nowhere",
			env: { CODEX_HOME: "/dev/null/not-a-dir" },
			run: async () => {
				throw new Error("boom");
			},
			warn: () => {},
		});
		expect(status).toBe("failed");
	});
});
