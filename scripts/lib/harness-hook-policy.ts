import routesJson from "./harness-hook-routes.json";
import type { HarnessHookRoute, HarnessScope } from "./harness-hook.types";

export const HARNESS_VERSION = "0.1.108";
export const HARNESS_SCOPES: readonly HarnessScope[] = [
	"core", "solid", "rules", "carto", "security", "changelog",
	"aipilot", "lessons", "seo", "memory", "tailwindcss",
];

export const HARNESS_ROUTES = routesJson as HarnessHookRoute[];

const HARNESS_BIN =
	'bun "${CODEX_HOME:-$HOME/.codex}/node_modules/@fusengine/harness/dist/cli/bin.mjs" hook codex';

/** Return the only accepted Harness command for a covered plugin. */
export function canonicalHarnessCommand(plugin: string, event: string, matcher: string): string | undefined {
	const route = HARNESS_ROUTES.find((item) =>
		item.plugin === plugin && item.event === event && item.matcher === matcher
	);
	if (!route) return undefined;
	const scope = route.scope;
	return scope ? `${HARNESS_BIN} ${scope}` : HARNESS_BIN;
}
