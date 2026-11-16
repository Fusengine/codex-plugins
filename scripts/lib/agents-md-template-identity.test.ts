import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..", "..");
const agentsPath = "AGENTS.md";
const templatePath = "plugins/codex-rules/templates/AGENTS.md.template";
/**
 * Read a repo-relative file as raw bytes.
 * @param path - Path relative to the repository root.
 * @returns The file content as a Buffer.
 */
const readBytes = (path: string): Buffer => readFileSync(join(root, path));

test("AGENTS.md and its installable template are byte-identical", () => {
	const agents = readBytes(agentsPath);
	const template = readBytes(templatePath);
	expect(template.length).toBe(agents.length);
	expect(template.equals(agents)).toBe(true);
});
