/**
 * @module runtime-deps
 * runtime-deps.ts — stage the harness runtime under `$CODEX_HOME/node_modules` so plugin
 * hooks resolve `@fusengine/harness` exactly like Node/Claude Code (from a root node_modules).
 *
 * A root `$CODEX_HOME/package.json` pins `@fusengine/harness` (registry) only; `bun install`
 * materialises it under `node_modules`. Each installed hook routes through `hooks.json` to
 * `@fusengine/harness`'s CLI (`hook codex core`) — there is no local package to build or pack
 * here anymore (the former `@fusengine/codex-hooks` tarball layer was removed; native per-plugin
 * `.ts` hooks are gone in favor of the harness binary).
 */
import { rm } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { installPluginDeps } from "./fs-helpers";
import { installedHarnessVersion } from "./harness-update";
import { compareVersionsDesc } from "./plugin-file-discovery";

/** Pinned `@fusengine/harness` range from the repo root manifest (single source of truth). */
export function harnessRange(projectRoot: string): string {
  const pkg = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
  const range = pkg.dependencies?.["@fusengine/harness"];
  if (!range) throw new Error("@fusengine/harness absent from repo package.json dependencies — cannot pin runtime");
  return range;
}

/**
 * A valid harness runtime (binary present) under `codexHome` that is NEWER than the repo pin
 * (e.g. left there by the audited auto-update while the repo pin lags), else `null`.
 */
export function newerInstalledRuntime(projectRoot: string, codexHome: string): { installed: string; pin: string } | null {
  const bin = join(codexHome, "node_modules", "@fusengine", "harness", "dist", "cli", "bin.mjs");
  if (!existsSync(bin)) return null;
  let installed: string;
  try {
    installed = installedHarnessVersion(codexHome);
  } catch {
    return null;
  }
  const pin = harnessRange(projectRoot).replace(/^[\^~]/, "");
  return compareVersionsDesc(installed, pin) < 0 ? { installed, pin } : null;
}

/**
 * Install `@fusengine/harness` into `$CODEX_HOME/node_modules`; hard-fail if it's absent afterwards.
 * Keeps (no downgrade, no reinstall) a valid runtime already newer than the repo pin.
 */
export async function installRuntimeDeps(projectRoot: string, codexHome: string): Promise<void> {
  const newer = newerInstalledRuntime(projectRoot, codexHome);
  if (newer) {
    p.log.info(`runtime kept: ${codexHome} holds harness ${newer.installed}, newer than the repo pin ${newer.pin} — no downgrade`);
    return;
  }
  const manifest = {
    name: "codex-home-runtime",
    private: true,
    dependencies: { "@fusengine/harness": harnessRange(projectRoot) },
  };
  await Bun.write(join(codexHome, "package.json"), JSON.stringify(manifest, null, 2) + "\n");
  // Drop the CODEX_HOME lockfile before installing: bun install honors the lock over the
  // manifest range, so a stale lock pins the previous harness forever (proven live: 0.1.60
  // kept after 0.1.61 shipped). The manifest is regenerated each setup; fresh resolution every setup.
  await rm(join(codexHome, "bun.lock"), { force: true });
  // One-time legacy prune: remove the pre-2026-09-19 `@fusengine/codex-hooks` tarball layer
  // (staged `node_modules/@fusengine/codex-hooks` + `codex-hooks-*.tgz`) — nothing reads it anymore.
  await rm(join(codexHome, "node_modules", "@fusengine", "codex-hooks"), { recursive: true, force: true });
  for (const tgz of new Bun.Glob("codex-hooks-*.tgz").scanSync(codexHome)) {
    await rm(join(codexHome, tgz), { force: true });
  }
  if (!(await installPluginDeps(codexHome))) {
    throw new Error(`bun install failed in ${codexHome} — runtime deps not staged`);
  }
  const harnessBin = join(codexHome, "node_modules", "@fusengine", "harness", "dist", "cli", "bin.mjs");
  if (!existsSync(harnessBin)) {
    throw new Error(`@fusengine/harness missing after install (${harnessBin}) — Bash/apply_patch guards would be off, aborting`);
  }
  await rm(join(codexHome, "fusengine-sys"), { recursive: true, force: true });
  p.log.success(`runtime staged → ${join(codexHome, "node_modules")} (harness); legacy fusengine-sys cleaned`);
}
