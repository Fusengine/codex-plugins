/**
 * harness-registry.ts — bounded `bun pm view` lookup of the latest published `@fusengine/harness`.
 * Split from harness-update.ts: a silent registry must throw, never hang sync:agents / setup.
 */

const REGISTRY_TIMEOUT_DEFAULT_SEC = 15;

/** Registry timeout in ms: `FUSE_HARNESS_REGISTRY_TIMEOUT_SEC` (positive number) else 15 s. */
export function registryTimeoutMs(env: Record<string, string | undefined> = process.env): number {
	const sec = Number(env.FUSE_HARNESS_REGISTRY_TIMEOUT_SEC);
	return (Number.isFinite(sec) && sec > 0 ? sec : REGISTRY_TIMEOUT_DEFAULT_SEC) * 1000;
}

/** Subset of `Bun.spawnSync` used by {@link runPmView} (injectable for tests). */
export type PmViewSpawn = (
	cmd: string[],
	opts: { stdout: "pipe"; stderr: "pipe"; timeout: number },
) => { success: boolean; exitedDueToTimeout?: boolean; stdout: Buffer; stderr: Buffer };

/**
 * `bun pm view @fusengine/harness version`, bounded by {@link registryTimeoutMs}. Bun's `spawnSync`
 * `timeout` option (ms) kills the child with `killSignal` (default SIGTERM) and sets
 * `exitedDueToTimeout` on the result; a silent registry therefore throws instead of hanging.
 *
 * @param spawn - Spawn seam, defaults to `Bun.spawnSync`.
 * @param env - Environment read for the timeout override.
 * @returns Raw stdout (the version plus a newline).
 * @throws On timeout or a non-zero exit.
 */
export function runPmView(
	spawn: PmViewSpawn = (cmd, opts) => Bun.spawnSync(cmd, opts),
	env: Record<string, string | undefined> = process.env,
): string {
	const timeout = registryTimeoutMs(env);
	const proc = spawn(["bun", "pm", "view", "@fusengine/harness", "version"], { stdout: "pipe", stderr: "pipe", timeout });
	if (proc.exitedDueToTimeout) {
		throw new Error(`bun pm view @fusengine/harness timed out after ${timeout / 1000}s (registry unreachable?)`);
	}
	if (!proc.success) throw new Error(`bun pm view @fusengine/harness failed: ${proc.stderr.toString().trim()}`);
	return proc.stdout.toString("utf8");
}
