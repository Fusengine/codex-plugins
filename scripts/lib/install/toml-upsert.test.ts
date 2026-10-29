/**
 * toml-upsert.test.ts — upsertManagedBlock / dropTables: idempotent marker-block upsert that
 * repairs damaged markers and NEVER deletes a table outside the managed header set.
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
import { parse } from "smol-toml";
import { dropTables, upsertManagedBlock } from "./toml-helpers";
import { assertSafeUpsert } from "./toml-scan";

const HS = "# >>> hooks >>>";
const HE = "# <<< hooks <<<";
const MS = "# >>> mcp >>>";
const ME = "# <<< mcp <<<";
const HOOK_HEADERS = ['hooks.state."a@m:h.json:e:0:0"', 'hooks.state."b@m:h.json:e:0:0"'];
const MCP_HEADERS = ["mcp_servers.alpha", "mcp_servers.beta"];
const HOOK_BODY = HOOK_HEADERS.map((h) => `[${h}]\ntrusted_hash = "sha256:new"`).join("\n\n");
const MCP_BODY = '[mcp_servers.alpha]\ncommand = "a"\n[mcp_servers.alpha.env]\nK = "v"\n\n[mcp_servers.beta]\nurl = "https://b"';
const BROKEN = [
	'model = "gpt-5.6"', "", HS,
	'[hooks.state."a@m:h.json:e:0:0"]', 'trusted_hash = "sha256:old"', "",
	'[hooks.state."b@m:h.json:e:0:0"]', 'trusted_hash = "sha256:old"', "",
	"[mcp_servers.alpha]", 'command = "old"', "[mcp_servers.alpha.env]", 'K = "old"', "",
	'[projects."/x"]', 'trust_level = "trusted"', "", ME, "",
].join("\n");

/** Both upserts, in installer order (hooks-trust then mcp-configurator). */
function upsertBoth(src: string): string {
	return upsertManagedBlock(upsertManagedBlock(src, HS, HE, HOOK_BODY, HOOK_HEADERS), MS, ME, MCP_BODY, MCP_HEADERS);
}

/** Table headers (`[x]`) of `text`, in order. */
function headersOf(text: string): string[] {
	return [...text.matchAll(/^\[([^\]]+)\]/gm)].map((m) => m[1] ?? "");
}

test("upsert: orphan START + stale tables + user tables + orphan END -> parses, no duplicate header, keeps projects", () => {
	const out = upsertBoth(BROKEN);
	const parsed = parse(out) as {
		model: string;
		projects: Record<string, unknown>;
		mcp_servers: Record<string, unknown>;
		hooks: { state: Record<string, unknown> };
	};
	const headers = headersOf(out);
	expect(new Set(headers).size).toBe(headers.length);
	expect(parsed.projects["/x"]).toEqual({ trust_level: "trusted" });
	expect(parsed.mcp_servers.alpha).toEqual({ command: "a", env: { K: "v" } });
	expect(parsed.model).toBe("gpt-5.6");
	expect(parsed.hooks.state["a@m:h.json:e:0:0"]).toEqual({ trusted_hash: "sha256:new" });
	expect(out).toContain('[projects."/x"]\ntrust_level = "trusted"');
});

test("upsert: second run is byte-identical (idempotent)", () => {
	const once = upsertBoth(BROKEN);
	expect(upsertBoth(once)).toBe(once);
});

test("upsert: healthy paired blocks and no-marker input keep the previous output shape", () => {
	const first = upsertBoth('model = "x"\n');
	expect(first).toBe(`model = "x"\n\n${HS}\n${HOOK_BODY}\n${HE}\n\n${MS}\n${MCP_BODY}\n${ME}\n`);
	expect(upsertBoth(first)).toBe(first);
	expect(upsertManagedBlock("", MS, ME, MCP_BODY, MCP_HEADERS)).toBe(`\n\n${MS}\n${MCP_BODY}\n${ME}\n`);
});

test("(a) a user table inside a healthy marker pair survives", () => {
	const src = `model = "x"\n\n${MS}\n${MCP_BODY}\n\n[projects."/a/new"]\ntrust_level = "trusted"\n${ME}\n`;
	const out = upsertManagedBlock(src, MS, ME, MCP_BODY, MCP_HEADERS);
	expect(out).toContain('[projects."/a/new"]\ntrust_level = "trusted"');
	expect(headersOf(out).filter((h) => h === "mcp_servers.alpha")).toHaveLength(1);
	expect(upsertManagedBlock(out, MS, ME, MCP_BODY, MCP_HEADERS)).toBe(out);
});

test("(b) orphan START, then [features], [projects], then END: both user tables survive", () => {
	const src = `${MS}\n[features]\nhooks = true\n[projects."/b"]\ntrust_level = "trusted"\n${ME}\n`;
	const out = upsertManagedBlock(src, MS, ME, MCP_BODY, MCP_HEADERS);
	const parsed = parse(out) as { features: unknown; projects: Record<string, unknown> };
	expect(parsed.features).toEqual({ hooks: true });
	expect(parsed.projects["/b"]).toEqual({ trust_level: "trusted" });
	expect(upsertManagedBlock(out, MS, ME, MCP_BODY, MCP_HEADERS)).toBe(out);
});

test("upsert: a RegExp managed matcher also drops stale keys that are no longer emitted", () => {
	const stale = '[hooks.state."gone@fusengine-codex:h.json:e:0:0"]\ntrusted_hash = "x"\n[hooks.state."mine@other:h:e:0:0"]\ntrusted_hash = "y"\n';
	const out = upsertManagedBlock(stale, HS, HE, HOOK_BODY, [...HOOK_HEADERS, /^hooks\.state\."[^"]*@fusengine-codex:/]);
	expect(out).not.toContain("gone@fusengine-codex");
	expect(out).toContain('[hooks.state."mine@other:h:e:0:0"]\ntrusted_hash = "y"');
});

test("dropTables: drops header and sub-tables only, keeps unrelated tables verbatim", () => {
	const src = "[mcp_servers.alpha]\nx = 1\n[mcp_servers.alpha.env]\nK = 1\n[mcp_servers.alphabet]\ny = 2\n[other]\nz = 3\n";
	expect(dropTables(src, ["mcp_servers.alpha"])).toBe("[mcp_servers.alphabet]\ny = 2\n[other]\nz = 3\n");
});

test("upsert: a stray managed table never swallows the next block's START marker or a user comment", () => {
	const stray = `[mcp_servers.alpha]\ncommand = "user"\n# mine\n\n${HS}\n${HOOK_BODY}\n${HE}\n`;
	const out = upsertBoth(stray);
	expect(out).toContain(`# mine\n\n${HS}\n${HOOK_BODY}\n${HE}`);
	expect(out.match(/^\[mcp_servers\.alpha\]$/gm)).toHaveLength(1);
	expect(upsertBoth(out)).toBe(out);
});

test("upsert: CRLF file with a commented managed header and a trailing comment -> no duplicate, comment kept", () => {
	const src = '[mcp_servers.alpha] # mine\r\ncommand = "old"\r\n# keep me\r\n[other]\r\nz = 1\r\n';
	const out = upsertManagedBlock(src, MS, ME, MCP_BODY, MCP_HEADERS);
	expect(out.match(/^\[mcp_servers\.alpha\]/gm)).toHaveLength(1);
	expect(out).toContain("# keep me\r\n[other]");
	expect(() => parse(out)).not.toThrow();
});

test.each(['"""', "'''"])("upsert: a %s multi-line string containing managed-looking lines survives byte-for-byte", (q) => {
	const str = `note = ${q}\n[mcp_servers.alpha]\ncommand = "inside"\n${MS}\n${ME}\n${q}\n`;
	const src = `[a]\n${str}\n[projects."/k"]\ntrust_level = "trusted"\n`;
	const out = upsertManagedBlock(src, MS, ME, MCP_BODY, MCP_HEADERS);
	expect(out).toContain(str);
	const parsed = parse(out) as { a: { note: string }; mcp_servers: { alpha: { command: string } } };
	expect(parsed.a.note).toContain('command = "inside"');
	expect(parsed.mcp_servers.alpha.command).toBe("a");
	expect(upsertManagedBlock(out, MS, ME, MCP_BODY, MCP_HEADERS)).toBe(out);
});

test("upsert: a string opened and closed on one line does not hide the next header", () => {
	const src = 'x = """one"""\n[mcp_servers.alpha]\ncommand = "old"\n[other]\nz = 1\n';
	const out = upsertManagedBlock(src, MS, ME, MCP_BODY, MCP_HEADERS);
	expect(out.match(/^\[mcp_servers\.alpha\]$/gm)).toHaveLength(1);
	expect(out).toContain("[other]\nz = 1");
});

test("upsert: a multi-line array of arrays in a managed table is dropped whole, not read as headers", () => {
	const src = `${MS}\n[mcp_servers.alpha]\ncommand = "x"\nargs = [\n  ["a"], # [not.a.header]\n  [\n    "b]",\n  ]\n]\nenv_x = 1\n${ME}\n[other]\nz = [\n[1]\n]\n`;
	const out = upsertManagedBlock(src, MS, ME, MCP_BODY, MCP_HEADERS);
	const parsed = parse(out) as { mcp_servers: { alpha: Record<string, unknown> }; other: { z: number[][] } };
	expect(parsed.mcp_servers.alpha).toEqual({ command: "a", env: { K: "v" } });
	expect(parsed.other.z).toEqual([[1]]);
	expect(upsertManagedBlock(out, MS, ME, MCP_BODY, MCP_HEADERS)).toBe(out);
});

test("guard: throws (so callers never write) when the result would not parse or a user table is lost", () => {
	expect(() => assertSafeUpsert("a = 1\n", "a = [\n", () => false)).toThrow(/not valid TOML/);
	expect(() => assertSafeUpsert("[keep]\na = 1\n", "x = 1\n", () => false)).toThrow(/would be lost/);
});

const REAL = join(homedir(), ".codex", "config.toml.broken-2026-10-29");
const HS_REAL = "# >>> fusengine-codex hooks trust >>>";
const HE_REAL = "# <<< fusengine-codex hooks trust <<<";
const MS_REAL = "# >>> fusengine-codex mcp servers >>>";
const ME_REAL = "# <<< fusengine-codex mcp servers <<<";

test.skipIf(!existsSync(REAL))("(c) replay of the real broken config: parses, 0 duplicate headers, 10 projects, idempotent", () => {
	const src = readFileSync(REAL, "utf8"); // read-only
	const uniq = (re: RegExp): string[] => [...new Set([...src.matchAll(re)].map((m) => m[1] ?? ""))];
	const hookHeaders = uniq(/^\[(hooks\.state\."[^"]+")\]/gm);
	const mcpNames = uniq(/^\[mcp_servers\.([^.\]]+)/gm);
	const hookBody = hookHeaders.map((h) => `[${h}]\ntrusted_hash = "sha256:new"`).join("\n\n");
	const mcpBody = mcpNames.map((n) => `[mcp_servers.${n}]\ncommand = "x"`).join("\n\n");
	const stale = /^hooks\.state\."[^"]*@fusengine-codex:/;
	const run = (s: string): string =>
		upsertManagedBlock(
			upsertManagedBlock(s, HS_REAL, HE_REAL, hookBody, [...hookHeaders, stale]),
			MS_REAL, ME_REAL, mcpBody, mcpNames.map((n) => `mcp_servers.${n}`),
		);
	const out = run(src);
	const headers = headersOf(out);
	expect(new Set(headers).size).toBe(headers.length);
	const parsed = parse(out) as { projects: Record<string, unknown> };
	expect(Object.keys(parsed.projects)).toHaveLength(10);
	expect(run(out)).toBe(out);
});
