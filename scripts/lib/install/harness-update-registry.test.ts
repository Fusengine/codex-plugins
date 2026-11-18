import { describe, expect, test } from "bun:test";
import { registryTimeoutMs, runPmView } from "./harness-registry";

type Spawned = { success: boolean; exitedDueToTimeout?: boolean; stdout: Buffer; stderr: Buffer };

function fake(result: Partial<Spawned>, seen: { cmd?: string[]; timeout?: number } = {}) {
	return (cmd: string[], opts: { timeout: number }) => {
		seen.cmd = cmd;
		seen.timeout = opts.timeout;
		return { success: true, stdout: Buffer.from("0.1.127\n"), stderr: Buffer.from(""), ...result };
	};
}

describe("registryTimeoutMs", () => {
	test("defaults to 15 s", () => {
		expect(registryTimeoutMs({})).toBe(15_000);
	});

	test("FUSE_HARNESS_REGISTRY_TIMEOUT_SEC overrides it; garbage and non-positive values fall back", () => {
		expect(registryTimeoutMs({ FUSE_HARNESS_REGISTRY_TIMEOUT_SEC: "3" })).toBe(3_000);
		for (const bad of ["abc", "0", "-5", ""]) {
			expect(registryTimeoutMs({ FUSE_HARNESS_REGISTRY_TIMEOUT_SEC: bad })).toBe(15_000);
		}
	});
});

describe("runPmView", () => {
	test("passes the timeout (ms) to the spawn and returns stdout", () => {
		const seen: { cmd?: string[]; timeout?: number } = {};
		expect(runPmView(fake({}, seen), {})).toBe("0.1.127\n");
		expect(seen.timeout).toBe(15_000);
		expect(seen.cmd).toEqual(["bun", "pm", "view", "@fusengine/harness", "version"]);
	});

	test("uses the env-configured timeout", () => {
		const seen: { timeout?: number } = {};
		runPmView(fake({}, seen), { FUSE_HARNESS_REGISTRY_TIMEOUT_SEC: "2" });
		expect(seen.timeout).toBe(2_000);
	});

	test("a timed-out spawn (silent registry) throws a timeout error naming the limit", () => {
		const spawn = fake({ success: false, exitedDueToTimeout: true });
		expect(() => runPmView(spawn, {})).toThrow(/timed out after 15s/);
	});

	test("a plain failure still throws with stderr", () => {
		const spawn = fake({ success: false, stderr: Buffer.from("ENOTFOUND") });
		expect(() => runPmView(spawn, {})).toThrow(/ENOTFOUND/);
	});
});
