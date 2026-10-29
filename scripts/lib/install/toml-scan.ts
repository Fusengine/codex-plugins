/**
 * toml-scan.ts — line scanner that knows which lines start inside a TOML value spanning several
 * lines (a multi-line `"""`/`'''` string or a not-yet-closed `[` array), so line-wise header /
 * marker detection never fires on value content. Also the write guard used by
 * upsertManagedBlock (parse + no lost table).
 */
import { parse } from "smol-toml";

// trailing `\s*` absorbs the `\r` of CRLF files (`.` never matches `\r`, so `#.*` stops before it)
export const ANY_TABLE_HEADER = /^\s*\[\[?\s*(.+?)\s*\]\]?\s*(?:#.*)?\s*$/;

type Delim = '"""' | "'''" | null;
/** Scanner state at a line boundary: open multi-line string delimiter + open `[` nesting depth. */
type ScanState = { delim: Delim; depth: number };

/**
 * Advances through one line from `open`; returns the state at end of line. Brackets are counted
 * outside strings and comments only: a header line (`[a]`, `[[a]]`) is self-balanced, so a
 * positive depth at a line start can only mean an unfinished array value.
 */
function scanLine(line: string, open: ScanState): ScanState {
	let { delim, depth } = open;
	let i = 0;
	while (i < line.length) {
		if (delim !== null) {
			if (delim === '"""' && line[i] === "\\") i += 2;
			else if (line.startsWith(delim, i)) {
				delim = null;
				i += 3;
			} else i++;
			continue;
		}
		const c = line[i];
		if (c === "#") break;
		if (line.startsWith('"""', i) || line.startsWith("'''", i)) {
			delim = line.slice(i, i + 3) as Delim;
			i += 3;
			continue;
		}
		if (c === '"' || c === "'") {
			// single-line string: skip to its closing quote (basic strings honour backslash escapes)
			i++;
			while (i < line.length && line[i] !== c) i += c === '"' && line[i] === "\\" ? 2 : 1;
		} else if (c === "[") depth++;
		else if (c === "]") depth = Math.max(0, depth - 1);
		i++;
	}
	return { delim, depth };
}

/**
 * For each line, whether it STARTS inside a multi-line value: a multi-line basic (`"""`) or
 * literal (`'''`) string, or an array whose `[` is not yet closed. Such lines are value
 * content: never a header, never a marker.
 */
export function startsInsideValue(lines: readonly string[]): boolean[] {
	const flags: boolean[] = [];
	let state: ScanState = { delim: null, depth: 0 };
	for (const line of lines) {
		flags.push(state.delim !== null || state.depth > 0);
		state = scanLine(line, state);
	}
	return flags;
}

/** Header paths (`a.b`) of every real table header in `src`, multi-line value content excluded. */
function tableHeaderPaths(src: string): string[] {
	const lines = src.split("\n");
	const inValue = startsInsideValue(lines);
	const paths: string[] = [];
	lines.forEach((line, i) => {
		const path = inValue[i] ? undefined : line.match(ANY_TABLE_HEADER)?.[1];
		if (path !== undefined) paths.push(path);
	});
	return paths;
}

/**
 * Write guard: throws unless `out` parses as TOML and every non-managed table header of `src`
 * is still present in `out` (same or greater count). Callers write only after this returns.
 * @param src - input text
 * @param out - candidate output
 * @param managed - predicate for header paths the upsert is allowed to drop
 */
export function assertSafeUpsert(src: string, out: string, managed: (path: string) => boolean): void {
	const parses = (text: string): Error | null => {
		try {
			parse(text);
			return null;
		} catch (e) {
			return e instanceof Error ? e : new Error(String(e));
		}
	};
	// An already-invalid input (e.g. duplicated tables of ANOTHER block, fixed by a later pass) cannot be
	// blamed on this upsert: only a parsable input turned unparsable is an abort.
	const broke = parses(src) === null ? parses(out) : null;
	if (broke) throw new Error(`config.toml upsert aborted: result is not valid TOML (${broke.message}); file left untouched`);
	const count = (paths: string[]): Map<string, number> =>
		paths.reduce((m, p) => m.set(p, (m.get(p) ?? 0) + 1), new Map<string, number>());
	const after = count(tableHeaderPaths(out));
	for (const [path, n] of count(tableHeaderPaths(src))) {
		if (!managed(path) && (after.get(path) ?? 0) < n) {
			throw new Error(`config.toml upsert aborted: user table [${path}] would be lost; file left untouched`);
		}
	}
}
