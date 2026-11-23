import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Contract: the shadcn/ui + Lucide web-stack doctrine and its headless default
 * (TanStack Start via its official CLI; owner decisions docs/decisions.md 2026-11-22 and 2026-11-23)
 * must stay present in the rule, the start-core recipe, the design skills and the design-expert agent.
 * Regexes are tolerant (case-insensitive, short fragments): rewording passes, deleting a clause fails.
 */
const root = join(import.meta.dir, "..", "..");
const read = (path: string): string => readFileSync(join(root, path), "utf8");

type Clause = { id: string; file: string; patterns: RegExp[] };

const frontendRules = "plugins/codex-rules/rules/05-frontend-rules.md";
const projectDetection = "plugins/codex-rules/rules/01-project-detection.md";
const startCore ="plugins/tanstack-start-expert/skills/start-core/SKILL.md";
const designWeb = "plugins/design-expert/skills/design-web/SKILL.md";
const designWebapp = "plugins/design-expert/skills/design-webapp/SKILL.md";
const designAgent = "plugins/design-expert/agents/design-expert.toml";

const pointer = /05-frontend-rules\.md`?\s+rule\s+3[\s\S]{0,120}headless/i;

/** Every doctrine clause that must survive, with the file that carries it. */
const clauses: Clause[] = [
	{ id: "rule3-shadcn-lucide", file: frontendRules, patterns: [/shadcn\/ui/i, /Lucide/i, /3\.\s+\*\*Web stack/i] },
	{ id: "rule3-ask-once-interactive", file: frontendRules, patterns: [/ask the owner once/i] },
	{ id: "rule3-headless-tanstack-cli", file: frontendRules, patterns: [/headless[\s\S]{0,300}TanStack Start[\s\S]{0,120}CLI/i] },
	{ id: "start-core-create", file: startCore, patterns: [/@tanstack\/cli@latest create \./i] },
	{ id: "start-core-alias-removal", file: startCore, patterns: [/remove the `"#\/\*"[^\n]*alias/i] },
	{ id: "start-core-shadcn-init", file: startCore, patterns: [/shadcn@latest init -t start -b radix -p nova/i] },
	{ id: "start-core-proof", file: startCore, patterns: [/components\.json[\s\S]{0,40}"iconLibrary": "lucide"/i] },
	{ id: "rule3-headless-definition", file: frontendRules, patterns: [/headless run[\s\S]{0,160}codex exec/i, /never end on a question/i] },
	{ id: "routing-empty-folder-headless", file: projectDetection, patterns: [/empty folder[^\n]{0,80}no stack[^\n]{0,80}headless[^\n]{0,40}tanstack-start-expert/i] },
	{ id: "start-core-new-app-cli", file: startCore, patterns: [/new app is scaffolded with the CLI/i] },
	{ id: "start-core-alias-check", file: startCore, patterns: [/grep -c '"#\/\\\*"' tsconfig\.json/i, /Exit 0 of `init` alone is NOT success/i] },
	{ id: "design-web-pointer", file: designWeb, patterns: [pointer] },
	{ id: "design-webapp-pointer", file: designWebapp, patterns: [pointer] },
	{ id: "design-agent-headless-default", file: designAgent, patterns: [/headless default\s*=\s*TanStack Start/i] },
];

/**
 * Returns the patterns that the given text fails to match.
 * @param text - File content to check.
 * @param patterns - Required tolerant regexes.
 */
function missingPatterns(text: string, patterns: RegExp[]): RegExp[] {
	return patterns.filter((p) => !p.test(text));
}

/**
 * Removes every match of a pattern from a text (in-memory mutation, never written to disk).
 * @param text - Source content.
 * @param pattern - Clause fragment to delete.
 */
function withoutClause(text: string, pattern: RegExp): string {
	return text.replace(new RegExp(pattern.source, `${pattern.flags.replace("g", "")}g`), "");
}

for (const clause of clauses) {
	test(`doctrine clause present: ${clause.id}`, () => {
		expect(missingPatterns(read(clause.file), clause.patterns).map(String)).toEqual([]);
	});

	test(`doctrine clause removal is detected: ${clause.id}`, () => {
		const text = read(clause.file);
		for (const pattern of clause.patterns) {
			expect(missingPatterns(withoutClause(text, pattern), [pattern])).toHaveLength(1);
		}
	});
}
