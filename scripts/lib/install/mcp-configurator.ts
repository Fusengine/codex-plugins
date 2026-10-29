/**
 * mcp-configurator.ts — Resolve ${VAR} placeholders in plugin mcp.json.bak using
 * values from ~/.codex/.env (or process.env), then write static
 * [mcp_servers.<name>] blocks to ~/.codex/config.toml between idempotent markers.
 * config.toml is the single MCP source Codex loads (learn.chatgpt.com/docs/extend/mcp).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { loadEnvFile } from "./env-file";
import { upsertManagedBlock } from "./toml-helpers";

const START = "# >>> fusengine-codex mcp servers >>>";
const END = "# <<< fusengine-codex mcp servers <<<";

interface ServerCfg {
	command?: string;
	args?: string[];
	env?: Record<string, string>;
	url?: string;
	http_headers?: Record<string, string>;
	env_http_headers?: Record<string, string>;
}

function resolveStr(s: string, env: Record<string, string>): string {
	return s.replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (_, v) => env[v] ?? "");
}

function resolveCfg(srv: ServerCfg, env: Record<string, string>): ServerCfg {
	const out: ServerCfg = { ...srv };
	if (out.args) out.args = out.args.map((a) => resolveStr(a, env));
	if (out.url) out.url = resolveStr(out.url, env);
	if (out.env) out.env = Object.fromEntries(Object.entries(out.env).map(([k, v]) => [k, resolveStr(v, env)]));
	if (out.http_headers) out.http_headers = Object.fromEntries(Object.entries(out.http_headers).map(([k, v]) => [k, resolveStr(v, env)]));
	if (out.env_http_headers) out.env_http_headers = Object.fromEntries(Object.entries(out.env_http_headers).map(([k, v]) => [k, resolveStr(v, env)]));
	return out;
}

function esc(s: string): string {
	return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toToml(name: string, cfg: ServerCfg): string {
	const lines = [`[mcp_servers.${name}]`];
	if (cfg.command) lines.push(`command = "${esc(cfg.command)}"`);
	if (cfg.args && cfg.args.length) lines.push(`args = [${cfg.args.map((a) => `"${esc(a)}"`).join(", ")}]`);
	if (cfg.url) lines.push(`url = "${esc(cfg.url)}"`);
	const headers = { ...(cfg.http_headers ?? {}), ...(cfg.env_http_headers ?? {}) };
	if (Object.keys(headers).length) {
		lines.push(`[mcp_servers.${name}.http_headers]`);
		for (const [k, v] of Object.entries(headers)) lines.push(`"${esc(k)}" = "${esc(v)}"`);
	}
	if (cfg.env && Object.keys(cfg.env).length) {
		lines.push(`[mcp_servers.${name}.env]`);
		for (const [k, v] of Object.entries(cfg.env)) lines.push(`${k} = "${esc(v)}"`);
	}
	return lines.join("\n");
}

export async function configureMcpServers(codexHome: string, pluginsRoot: string, selected?: Set<string>): Promise<void> {
	const env = loadEnvFile(codexHome);
	const servers = new Map<string, ServerCfg>();
	for (const e of await readdir(pluginsRoot, { withFileTypes: true })) {
		if (!e.isDirectory()) continue;
		const f = Bun.file(join(pluginsRoot, e.name, "mcp.json.bak"));
		if (!(await f.exists())) continue;
		const cfg = (await f.json()) as Record<string, ServerCfg>;
		for (const [name, srv] of Object.entries(cfg)) {
			if (selected && !selected.has(name)) continue;
			if (servers.has(name)) continue;
			const resolved = resolveCfg(srv, env);
			if (srv.url && !resolved.url) {
				p.log.warn(`Skip MCP '${name}': url placeholder unresolved (missing env var)`);
				continue;
			}
			servers.set(name, resolved);
		}
	}
	if (servers.size === 0) {
		p.log.info("No MCP servers selected");
		return;
	}
	const path = join(codexHome, "config.toml");
	const current = existsSync(path) ? readFileSync(path, "utf8") : "";
	const blocks = [...servers.entries()].map(([n, c]) => toToml(n, c)).join("\n\n");
	const next = upsertManagedBlock(current, START, END, blocks, [...servers.keys()].map((n) => `mcp_servers.${n}`));
	writeFileSync(path, next);
	p.log.success(`Wrote ${servers.size} [mcp_servers.*] blocks → ${path}`);
}
