/**
 * harness-auto-update-verify.ts — the gate every `~/.codex` write must pass IN THIS
 * RUN: install, `update-harness <latest>`, `validate`, `bun test`, then the scope
 * audit (reusing `auditHarnessScopes`). The audit runs on every path, including when
 * `update-harness` is a no-op "already" (HEAD pinned, codexHome lagging), because that
 * path never audits by itself. Subprocess/audit seams are injected for tests.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HARNESS_SCOPES } from "../harness-hook-policy";
import { auditHarnessScopes, installedHarnessVersion, type ScopeAuditResult } from "./harness-update";
import { declaredHarnessSpec } from "./harness-update-flow";

/** Injectable seams of the verification gate. */
export interface VerifyDeps {
	/** Run `bun <args>` in `cwd`; `null` on success, else a failure summary. */
	bun: (args: string[], cwd: string) => string | null;
	audit: (root: string) => ScopeAuditResult[];
	installed: (root: string) => string;
	declared: (root: string) => string;
}

/** Real audit under a scratch CODEX_HOME (never the real one), always cleaned. */
function auditWithScratchHome(root: string): ScopeAuditResult[] {
	const scratch = mkdtempSync(join(tmpdir(), "harness-audit-"));
	try {
		return auditHarnessScopes(root, HARNESS_SCOPES, scratch);
	} finally {
		rmSync(scratch, { recursive: true, force: true });
	}
}

/** Build the real deps around a `bun` runner. */
export function realVerifyDeps(bun: VerifyDeps["bun"]): VerifyDeps {
	return { bun, audit: auditWithScratchHome, installed: installedHarnessVersion, declared: declaredHarnessSpec };
}

/** Update + validate + test + audit inside the worktree; returns a failure message or `null` when fully verified. */
export function verifyWorktree(wt: string, latest: string, deps: VerifyDeps): string | null {
	for (const step of [["install"], ["run", "update-harness", latest], ["run", "validate"], ["test"]]) {
		const failure = deps.bun(step, wt);
		if (failure) return failure;
	}
	const installed = deps.installed(wt);
	const declared = deps.declared(wt);
	if (installed !== latest || declared !== latest) return `worktree not settled on ${latest} (installed ${installed}, declared ${declared})`;
	const failed = deps.audit(wt).filter((r) => !r.ok);
	if (failed.length > 0) return `audit failed (${failed.length}): ${failed.map((f) => `${f.scope}: ${f.detail}`).join("; ")}`;
	return null;
}
