import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { autoUpdateBestEffort } from "./lib/install/harness-auto-update-hook";
import { syncAgents } from "./sync-agents";

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { force: true, recursive: true })));

function deps(calls: string[], autoUpdate: () => Promise<unknown>) {
	return {
		codexHome: "/tmp/never-the-real-codex",
		projectRoot: "/tmp/never-the-real-repo",
		quiet: true,
		intro: () => {},
		outro: () => {},
		installAgents: async () => {
			calls.push("agents");
		},
		installCommands: async () => {
			calls.push("commands");
		},
		autoUpdate: async () => {
			calls.push("auto-update");
			await autoUpdate();
		},
	};
}

describe("syncAgents", () => {
	test("does its normal work, then runs the auto-update", async () => {
		const calls: string[] = [];
		await syncAgents(deps(calls, async () => "ok"));
		expect(calls).toEqual(["agents", "commands", "auto-update"]);
	});

	test("with the real best-effort wrapper and an unreachable registry, the sync still completes", async () => {
		const codexHome = mkdtempSync(join(tmpdir(), "sync-agents-"));
		dirs.push(codexHome);
		const calls: string[] = [];
		await syncAgents(
			deps(calls, () =>
				autoUpdateBestEffort({
					root: "/tmp/never-the-real-repo",
					home: "/nowhere",
					env: { CODEX_HOME: codexHome },
					run: async () => {
						throw new Error("ENOTFOUND registry.npmjs.org");
					},
					warn: () => {},
				}),
			),
		);
		expect(calls).toEqual(["agents", "commands", "auto-update"]);
	});
});
