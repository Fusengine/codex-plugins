/**
 * capture.ts — screenshots + one real lookup of a produced static site (T10 audit evidence).
 * Usage: bun capture.ts <site-dir> <out-dir> [domain] [domainInput] [submit] [resultRows]
 * Writes NOTHING into <site-dir>. Captures: initial page and result state, desktop (1440x900) and
 * mobile (390x844), light and dark (prefers-color-scheme), plus console/network failures to report.json.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const [site, out, domain = "example.com", domId = "#domain", submitId = "#run-button", rowsSel = "#result-rows > *"] = process.argv.slice(2);
if (!site || !out) throw new Error("usage: capture.ts <site-dir> <out-dir> [domain] [domainInput] [submit] [resultRows]");
mkdirSync(out, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const runs: unknown[] = [];

const profiles = [
	{ name: "desktop", width: 1440, height: 900, mobile: false },
	{ name: "mobile", width: 390, height: 844, mobile: true },
];
for (const scheme of ["light", "dark"] as const) {
	for (const p of profiles) {
		const page = await browser.newPage();
		const errors: string[] = [];
		const failed: string[] = [];
		page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
		page.on("pageerror", (e) => errors.push(String(e)));
		page.on("requestfailed", (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`));
		await page.setViewport({ width: p.width, height: p.height, isMobile: p.mobile, deviceScaleFactor: 1 });
		await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: scheme }]);
		await page.goto(`file://${join(site, "index.html")}`, { waitUntil: "networkidle2" });
		if (process.env.THEME_TOGGLE && scheme === "light") await page.click(process.env.THEME_TOGGLE).catch(() => undefined); // manual-toggle sites default to dark
		await page.screenshot({ path: join(out, `${p.name}-${scheme}-initial.png`), fullPage: true });
		let rows = 0;
		let status = "";
		if (scheme === "light" || p.name === "desktop") {
			await page.type(domId, domain);
			await page.click(submitId);
			try {
				await page.waitForSelector(rowsSel, { timeout: 60000 });
				await new Promise((r) => setTimeout(r, 8000)); // let late probes arrive
			} catch {
				/* recorded as rows = 0 */
			}
			rows = await page.$$eval(rowsSel, (n) => n.length).catch(() => 0);
			status = await page.$eval(process.env.STATUS_SEL ?? "#status", (n) => (n as HTMLElement).innerText).catch(() => "");
			await page.screenshot({ path: join(out, `${p.name}-${scheme}-result.png`), fullPage: true });
		}
		runs.push({ profile: p.name, scheme, rows, status, errors, failed });
		await page.close();
	}
}
// Verify matrix (desktop, light): invalid domain, non-existent domain, keyboard-only flow.
const matrix: Record<string, unknown> = {};
const visibleMessages = (): string =>
	Array.from(document.querySelectorAll("[role=alert], [aria-live], .error, [id*=error], [id*=status]"))
		.map((n) => (n as HTMLElement).innerText.trim())
		.filter(Boolean)
		.join(" | ");
for (const [name, value] of [
	["invalid", "not a domain!!"],
	["nonexistent", "zzqx-nonexistent-8842.com"],
] as const) {
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900 });
	await page.goto(`file://${join(site, "index.html")}`, { waitUntil: "networkidle2" });
	await page.type(domId, value);
	await page.click(submitId);
	await new Promise((r) => setTimeout(r, 15000));
	matrix[name] = { value, messages: await page.evaluate(visibleMessages), rows: await page.$$eval(rowsSel, (n) => n.length).catch(() => 0) };
	await page.screenshot({ path: join(out, `matrix-${name}.png`), fullPage: true });
	await page.close();
}
{
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900 });
	await page.goto(`file://${join(site, "index.html")}`, { waitUntil: "networkidle2" });
	const stops: unknown[] = [];
	let reached = false;
	for (let i = 0; i < 20 && !reached; i++) {
		await page.keyboard.press("Tab");
		const info = await page.evaluate((sel) => {
			const a = document.activeElement as HTMLElement | null;
			if (!a) return null;
			const s = getComputedStyle(a);
			return { tag: a.tagName, id: a.id, text: (a.innerText || "").slice(0, 30), outline: `${s.outlineStyle} ${s.outlineWidth}`, shadow: s.boxShadow.slice(0, 60), isDomain: a.matches(sel) };
		}, domId);
		stops.push(info);
		reached = Boolean((info as { isDomain?: boolean } | null)?.isDomain);
	}
	if (reached) {
		await page.keyboard.type(domain);
		await page.keyboard.press("Enter");
		await new Promise((r) => setTimeout(r, 15000));
	}
	matrix.keyboard = { reachedInputWithTab: reached, stops, rows: await page.$$eval(rowsSel, (n) => n.length).catch(() => 0) };
	await page.screenshot({ path: join(out, "matrix-keyboard.png"), fullPage: true });
	await page.close();
}
runs.push({ matrix });
const report = JSON.stringify({ domain, runs }, null, 2);
writeFileSync(join(out, "report.json"), report);
await browser.close();
console.log(report.slice(0, 2000));
