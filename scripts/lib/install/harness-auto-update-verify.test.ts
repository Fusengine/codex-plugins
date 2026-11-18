/**
 * harness-auto-update-verify.test.ts — every ~/.codex write must be audited +
 * validated + tested by THIS run: `verifyWorktree` runs the scope audit on every
 * path, including when `update-harness` reports "already" (HEAD pinned, codexHome
 * lagging). All subprocesses/audit are injected.
 */
import { describe, expect, test } from "bun:test";
import { type VerifyDeps, verifyWorktree } from "./harness-auto-update-verify";

function deps(overrides: Partial<VerifyDeps> = {}, calls: string[] = []): VerifyDeps {
	return {
		bun: (args) => {
			calls.push(`bun ${args.join(" ")}`);
			return null;
		},
		audit: () => {
			calls.push("audit");
			return [{ scope: "core", ok: true, detail: "ok" }];
		},
		installed: () => "0.1.126",
		declared: () => "0.1.126",
		...overrides,
	};
}

describe("verifyWorktree", () => {
	test("runs install, update-harness, validate, test AND the audit, audit before success", () => {
		const calls: string[] = [];
		expect(verifyWorktree("/wt", "0.1.126", deps({}, calls))).toBeNull();
		expect(calls).toEqual(["bun install", "bun run update-harness 0.1.126", "bun run validate", "bun test", "audit"]);
	});

	test("audits even when update-harness is a no-op 'already' (exit 0)", () => {
		const calls: string[] = [];
		// update-harness exits 0 without auditing; the job's own audit must still run.
		verifyWorktree("/wt", "0.1.126", deps({}, calls));
		expect(calls.filter((c) => c === "audit")).toHaveLength(1);
	});

	test("a failing audit scope blocks (returns a message naming the scope)", () => {
		const failure = verifyWorktree("/wt", "0.1.126", deps({ audit: () => [{ scope: "seo", ok: false, detail: "unknown scope" }] }));
		expect(failure).toContain("audit failed");
		expect(failure).toContain("seo");
	});

	test("a failing step stops early and skips the audit", () => {
		const calls: string[] = [];
		const failure = verifyWorktree("/wt", "0.1.126", deps({ bun: (args) => (args[1] === "validate" ? "validate exit 1" : (calls.push(args.join(" ")), null)) }, calls));
		expect(failure).toBe("validate exit 1");
		expect(calls).not.toContain("audit");
	});

	test("refuses a worktree not settled on the exact pin", () => {
		expect(verifyWorktree("/wt", "0.1.126", deps({ declared: () => "^0.1.126" }))).toContain("not settled");
		expect(verifyWorktree("/wt", "0.1.126", deps({ installed: () => "0.1.125" }))).toContain("not settled");
	});
});
