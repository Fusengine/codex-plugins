/**
 * toml-helpers.ts — Minimal regex-based TOML upsert utilities (no parser).
 *
 * Root-level keys only: every lookup/rewrite below is confined to the file's
 * "head" — the span before the first table-header line (`^\[`, e.g.
 * `[profiles.yolo]`). This prevents a same-named key inside any `[table]`
 * from being read or overwritten as if it were a root key.
 *
 * Known limitation (not resolved here, not hit by current callers): a
 * continuation line of a multi-line array value that itself starts with `[`
 * would be misread as a table header, truncating the head early.
 */

import { ANY_TABLE_HEADER, assertSafeUpsert, startsInsideValue } from "./toml-scan";

const TABLE_HEADER = /^\[/m;

/** Splits `src` into the root-level head (before the first `[table]` header) and the rest. */
function splitHead(src: string): { head: string; tail: string } {
	const match = src.match(TABLE_HEADER);
	if (match?.index === undefined) return { head: src, tail: "" };
	return { head: src.slice(0, match.index), tail: src.slice(match.index) };
}

/** Whether a root-level key is present (root scope only — before the first `[table]`). */
export function hasKey(src: string, key: string): boolean {
	return new RegExp(`^${key}\\s*=`, "m").test(splitHead(src).head);
}

/**
 * Read a root-level key's value (root scope only — before the first
 * `[table]`; surrounding double-quotes stripped), or `undefined` if absent
 * from that scope. Assumes simple values (enums, booleans, quoted strings
 * with no embedded `#` or `"`); a `#` inside a quoted value is treated as the
 * start of a trailing comment — fine for every current call site (Codex
 * config enums), not TOML-spec-complete.
 */
export function getRootKey(src: string, key: string): string | undefined {
	const match = splitHead(src).head.match(new RegExp(`^${key}\\s*=\\s*(.*?)\\s*(?:#.*)?$`, "m"));
	return match?.[1].replace(/^"(.*)"$/, "$1");
}

/**
 * Upsert a root-level key (quoted string or raw value), keeping any trailing
 * `# comment`. Matching and rewriting are confined to the root scope (before
 * the first `[table]`), so a same-named key inside `[profiles.*]` or any
 * other table is never read or clobbered; if absent from the root scope, the
 * key is prefixed at the very top of the file, ahead of any table. Same
 * simple-value assumption as {@link getRootKey}: a `#` inside an existing
 * quoted value would be misread as a comment on rewrite — safe for all
 * current callers (Codex config enums), not TOML-spec-complete.
 */
export function setRootKey(src: string, key: string, value: string, quoted = true): string {
	const line = quoted ? `${key} = "${value}"` : `${key} = ${value}`;
	const { head, tail } = splitHead(src);
	const pattern = new RegExp(`^${key}\\s*=.*$`, "m");
	const existingLine = head.match(pattern)?.[0];
	if (existingLine === undefined) return `${line}\n${src}`;
	const comment = existingLine.match(/(\s*#.*)$/)?.[1] ?? "";
	return head.replace(pattern, line + comment) + tail;
}

/**
 * Removes every line that is exactly the `start` or `end` marker (trimmed), wherever it is —
 * healthy pair, orphan START, orphan END, END before START, stale copies. Only marker lines
 * are removed; nothing between markers is ever deleted by range (Codex / the desktop app
 * insert user tables such as `[projects.*]` inside our marker region).
 */
function removeMarkerLines(src: string, start: string, end: string): string {
	const out: string[] = [];
	let removed = false;
	const lines = src.split("\n");
	const inValue = startsInsideValue(lines);
	for (const [i, line] of lines.entries()) {
		const t = line.trim();
		if (!inValue[i] &&(t === start || t === end)) {
			removed = true;
			continue;
		}
		// a marker removed between two blank lines must not leave a double gap
		if (removed && t === "" && (out.length === 0 || out[out.length - 1]?.trim() === "")) continue;
		removed = false;
		out.push(line);
	}
	return out.join("\n");
}

/** Whether `lines` is empty or ends with a blank line. */
const endsBlank = (lines: readonly string[]): boolean => lines.length === 0 || lines[lines.length - 1]?.trim() === "";

const BLANK_OR_COMMENT = /^\s*(?:#.*)?\s*$/;

/**
 * Drops every table section whose header is one of `headers` or a sub-table of one
 * (`mcp_servers.foo` also removes `mcp_servers.foo.env`, but not `mcp_servers.foobar`).
 * A section runs from its header line to its last non-comment line; the trailing run of
 * blank/comment lines before the next header (or EOF) is kept, because it belongs to what
 * follows (a user comment, or another managed block's START marker). Every other table is
 * kept verbatim. `headers` are the dotted header paths exactly as emitted (no surrounding
 * brackets). Lines inside a multi-line string or a not-yet-closed array are never read as
 * headers.
 */
export function dropTables(src: string, headers: readonly (string | RegExp)[]): string {
	if (headers.length === 0) return src;
	const managed = managedMatcher(headers);
	let skipping = false;
	let trailing: string[] = [];
	const kept: string[] = [];
	/** Re-attaches the dropped section's trailing lines, without doubling an existing blank gap. */
	const flush = (): void => {
		let from = 0;
		while (endsBlank(kept) && from < trailing.length && trailing[from]?.trim() === "") from++;
		kept.push(...trailing.slice(from));
		trailing = [];
	};
	const lines = src.split("\n");
	const inValue = startsInsideValue(lines);
	for (const [i, line] of lines.entries()) {
		const path = inValue[i] ? undefined : line.match(ANY_TABLE_HEADER)?.[1];
		if (path !== undefined) {
			flush();
			skipping = managed(path);
		}
		if (!skipping) kept.push(line);
		else if (path === undefined) trailing = BLANK_OR_COMMENT.test(line) ? [...trailing, line] : [];
	}
	flush();
	return kept.join("\n");
}

/**
 * Idempotently (re)writes one marker-delimited block at the end of `src`: removes every START
 * and END marker line, drops every table in the managed set (`headers`), then appends
 * `start`/`body`/`end`. Never deletes by marker range: every table outside the managed set
 * survives verbatim even when it sits between markers (e.g. user `[projects.*]` trust tables).
 * After this call each managed header appears exactly once.
 * @param src - current `config.toml` text
 * @param start - START marker line
 * @param end - END marker line
 * @param body - fresh TOML for the block
 * @param headers - managed set: dotted header paths emitted by `body` (sub-tables matched by
 *   prefix) and/or RegExps tested against the header path to also drop stale managed keys
 * @returns the new `config.toml` text
 */
export function upsertManagedBlock(src: string, start: string, end: string, body: string, headers: readonly (string | RegExp)[]): string {
	const base = dropTables(removeMarkerLines(src, start, end), headers).trimEnd();
	const out = `${base}\n\n${start}\n${body}\n${end}\n`;
	assertSafeUpsert(src, out, managedMatcher(headers)); // throws BEFORE any caller writes
	return out;
}

/** Predicate: is a header path in the managed set (exact / sub-table for strings, test() for RegExps). */
function managedMatcher(headers: readonly (string | RegExp)[]): (path: string) => boolean {
	// `[mcp_servers."ctx"]` and `[mcp_servers.ctx]` are the same table: unquote bare-safe segments first
	const bare = (path: string): string => path.replace(/"([A-Za-z0-9_-]+)"|'([A-Za-z0-9_-]+)'/g, (_, a: string, b: string) => a ?? b);
	return (raw) => {
		const path = bare(raw);
		return headers.some((h) => (typeof h === "string" ? path === h || path.startsWith(`${h}.`) : h.test(path)));
	};
}
