import { describe, expect, test } from "bun:test";
import { installCodex } from "./install-codex";

describe("installCodex", () => {
	test("runs the setup, then the best-effort auto-update, in that order", async () => {
		const calls: string[] = [];
		await installCodex({
			projectRoot: "/tmp/never-the-real-repo",
			codexHome: "/tmp/never-the-real-codex",
			argv: ["--skip-env"],
			intro: () => {},
			outro: () => {},
			runSetup: async (opts) => {
				calls.push(`setup skipEnv=${opts.skipEnv} home=${opts.codexHome}`);
			},
			autoUpdate: async () => {
				calls.push("auto-update");
			},
		});
		expect(calls).toEqual(["setup skipEnv=true home=/tmp/never-the-real-codex", "auto-update"]);
	});

	test("a failing setup propagates and the auto-update never runs", async () => {
		const calls: string[] = [];
		await expect(
			installCodex({
				projectRoot: "/tmp/x",
				codexHome: "/tmp/y",
				argv: [],
				intro: () => {},
				outro: () => {},
				runSetup: async () => {
					throw new Error("setup failed");
				},
				autoUpdate: async () => {
					calls.push("auto-update");
				},
			}),
		).rejects.toThrow("setup failed");
		expect(calls).toEqual([]);
	});
});
