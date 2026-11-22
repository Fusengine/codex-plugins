# T10 run-1 — Code audit (Atlas DNS)

Scope: `/Users/brunoazoulay/Downloads/dossier sans titre/run-1/` (index.html 79 lines, app.js 198, styles.css 129). Read-only. Proof scripts live in the session scratchpad (`.../scratchpad/t10/{api,dom,timeout}.mjs`), never in the site.
Method: `node --check` (OK), live Globalping calls from Node (A, AAAA, MX, TXT, SRV, NXDOMAIN, invalid type, CORS preflight with `Origin: null`), jsdom harness running the real `app.js` against the real `index.html` with injected `fetch` (validation table, malformed payloads, XSS payloads, HTTP faults, stuck measurement, double submit), WCAG contrast computation.

## What is solid (verified, so not findings)
- XSS from DNS data: every dynamic string goes through `textContent` (app.js:95-99). Payload test (`<img onerror>`, `<script>` in city/network/resolver/TXT): 0 injected elements, `window.__x` never set.
- `file://` works: preflight with `Origin: null` returns `access-control-allow-origin: *`.
- Timeout works with a conforming `fetch` (25 s, 39 polls, status "délai dépassé", pending rows become "Mesure interrompue", button re-enabled). My first run looked stuck only because my mock ignored `signal`; not a defect.
- Double submit blocked (1 POST for 2 submits, app.js:169). HTTP faults 400/422/429/500/502-html/network-down/200-non-JSON all give a French message and re-enable the button.
- Contrast: muted text 5.9-6.3:1, badges 6.8-6.9:1, placeholder 5.1:1, disabled button 6.35:1. Input border 3.34:1 passes 1.4.11 (3:1).

## Findings, ranked by impact

### 1. HIGH — Quota is invisible and every lookup burns 6 credits; 429 handling is generic
- app.js:67 requests 6 locations x limit 1; live headers: `x-ratelimit-consumed: 6`, `x-ratelimit-limit: 250` per hour for an anonymous IP, so about 41 lookups per hour, shared with everyone behind the same IP (remaining was already 154 at test start).
- app.js:47 maps 429 to "Attendez avant de réessayer" without reading `Retry-After` / `X-RateLimit-Reset`, although the API lists both in `access-control-expose-headers`. The button is re-enabled at once (app.js:196), so the user can hammer a blocked API. No remaining-quota display, no cooldown, no fallback provider.
- Bench note confirmed: single point of failure, no degraded mode.

### 2. HIGH — No automated test, no toolchain at all
- No `package.json`, test file, linter, `tsconfig`/`@ts-check`, CI. `normalizeDomain` (app.js:24-36, the only input gate) and `describeResult` (app.js:83-93, DNS semantics) are pure functions that were never exercised by a test before delivery; the bench only ran the happy path (`example.com`/A). `report.json`: the 4th run (mobile-dark) has `rows: 0, status: ""`, i.e. no result was ever captured for it, and `errors: []` only means "no console error".

### 3. MEDIUM-HIGH — Third-party payload trusted blindly; one bad probe kills the whole render and leaks a raw engine error
- app.js:104-126 dereferences `probe.country`, `result.answers`, `answer.type` with no shape check. jsdom, real `app.js`:
  - probe missing -> status shows `Cannot read properties of undefined (reading 'country')`
  - `result: null` -> `Cannot read properties of null (reading 'answers')`, 0 rows rendered
  - `answers: [null]` -> `Cannot read properties of null (reading 'type')`
- app.js:186-192 prints `error.message` verbatim, so an English JS engine message reaches the user, and the 5 healthy probes are lost with the broken one.

### 4. MEDIUM — Domain validation accepts names that can never resolve and spends credits on them
- app.js:26-32, harness results: accepted and sent to the API: `example.c` (1-char TLD), `foo.local`, `foo.invalid`, `foo.test`, `foo.internal`, `192.168.1.1.example`, `ex_ample.com` (underscore allowed in every label, only valid for service labels like `_dmarc`). Each wastes 6 credits (finding 1) and discloses an internal hostname to a third party (only a one-line notice, index.html:38).
- Record-type list (index.html:31-32) omits types the API supports (verified from the 400 body: A, AAAA, ANY, CNAME, DNSKEY, DS, HTTPS, MX, NS, NSEC, PTR, RRSIG, SOA, TXT, SRV, SVCB); no PTR (and IPs are rejected by design, app.js:30), no DS/DNSKEY, so no DNSSEC check.

### 5. MEDIUM — The "worldwide DNS check" is weaker than it looks (correctness of the product claim)
- app.js:67: 6 probes total, 1 per continent, each using ITS OWN resolver. Measured `example.com` A: resolver `private` on 3/6 probes (others 1.1.1.1 / 8.8.8.8); MX: 4/6 private. The probes therefore do not query comparable resolvers, and none queries the authoritative server, so this is not a propagation check. The API accepts `measurementOptions.resolver` (verified: 202 with `resolver: "1.1.1.1"`), unused.
- Answers are shown in raw order: the SA probe returned the same two A records in reverse order (live run). Nothing is sorted or diffed, so a harmless RRset reordering looks like a regional discrepancy, and there is no "all probes agree / N differ" summary, which is the actual value of such a tool.

### 6. MEDIUM — Accessibility of the live result flow
- app.js:138-141: the whole table is destroyed and rebuilt on every poll; app.js:181-182,148: the `role="status"` region (index.html:67) changes only at start and end, so screen readers get "Mesure terminée · 6 sondes" but not the rows; focus is never moved to the results (app.js:196). `aria-busy` (app.js:180) sits on a wrapper that is not a live region.
- app.js:192 puts errors in the polite `role="status"` region instead of an alert.
- app.js:178: disabling the clicked submit button drops keyboard focus to `<body>` (use `aria-disabled` or keep focus).
- Targets and tooltips: example button padding `1px 3px` (styles.css:61) is far below the 24x24 CSS px minimum (WCAG 2.5.8); map markers are 8 px (styles.css:86) and their only name is a `title` (app.js:134) inside an `aria-hidden` map, i.e. mouse-only; several texts are 11-11.5 px (styles.css:30,70).

### 7. LOW-MEDIUM — No Content-Security-Policy (defense in depth)
- index.html:3-10 has no CSP and no referrer policy. The site is static with no inline script/style, so `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src https://api.globalping.io; base-uri 'none'; form-action 'none'` would fit as a `<meta>` and make finding 3-style regressions or a future `innerHTML` harmless. Third-party data is currently safe only because of discipline, not because of a control.

### 8. LOW — Polling and cancellation
- app.js:75-80: fixed 650 ms interval, no backoff or jitter, no honouring of `Retry-After`; a stuck measurement costs 39 requests. The 25 s budget (app.js:60) depends on `fetch` rejecting on abort; the loop never checks `signal.aborted` itself. No user "Annuler" action.

### 9. LOW — Maintainability
- One 198-line script mixes validation, transport, polling state machine, DNS semantics, rendering and event wiring (app.js:24-198); `ui` and `endpoint` are module-level globals, so nothing is importable for tests. Magic numbers undocumented: 650, 25000, and the projection constants `3.6`/`1.65`/`84` (app.js:132-133) coupled to the crop of `world.png`. All strings hard-coded in French (app.js:44-55,86-91,172). No JSDoc on any function, in conflict with the "JSDoc on every exported function" rule (nothing is exported, which is itself the point).
- Display: unbounded answer lists (google.com TXT returns many long values per probe) and raw rendering of `MX 0 .` (null MX) and quoted TXT; no copy/export; no shareable URL (`?domain=...&type=...`).

## Generic "never do" rules (derived from the findings)
1. Never ship a client of a rate-limited third-party API without reading its limit/retry headers, showing the remaining budget, and applying a cooldown after 429.
2. Never ship a feature that depends on a single external provider without a defined degraded mode (message with time-to-retry, cached last result, or second provider).
3. Never ship code with zero tests: at minimum one test per pure function that gates input or interprets data, plus one failure-path test per external call.
4. Never dereference external data without a shape guard at the boundary; one malformed item must degrade that item only, never the whole view.
5. Never display `error.message` (or any exception text) to the end user; map to a known, translated message and log the raw one.
6. Never accept input only because it parses; validate against the domain's rules (reserved/special-use TLDs, length, charset) before spending a paid or quota-limited call.
7. Never spend quota or send user input to a third party without it being necessary and disclosed at the point of entry.
8. Never claim a capability the design cannot deliver ("worldwide", "propagation", "real-time"); size the sample and fix comparability (same resolver, normalized/sorted records) or word the claim down.
9. Never present comparison data raw; normalize order and add a summary of agreement/difference.
10. Never rebuild a live-updating region wholesale without a live-region announcement and focus management; errors use an alert role, progress uses a polite region.
11. Never disable the control that holds focus; use `aria-disabled` or move focus deliberately.
12. Never let a custom or tiny control (below 24x24 px) or a hover-only tooltip be the sole affordance.
13. Never ship a web page without a CSP (`connect-src` pinned to the known API origin) and referrer policy, even when "safe by textContent".
14. Never poll at a fixed interval; use backoff with jitter, honour `Retry-After`, check `signal.aborted` explicitly, and give the user a cancel action.
15. Never put validation, transport, state and rendering in one file/scope; keep pure logic importable and constants named and documented.
16. Never treat "no console error on the happy path" as verification; run the unhappy paths (invalid input, nonexistent target, each record type, 4xx/5xx, offline, timeout) and every declared viewport/theme combination.
17. Never accept "zero errors" from a gate whose tools do not exist in the project (no linter, no type check, no build = vacuous pass); create the checks first or report "not verified".

## Which doctrine step should have caught each, and why it did not
Files read: `plugins/codex-rules/rules/02-apex-workflow.md`, `plugins/ai-pilot/skills/apex-methodology/{SKILL.md, references/03-execution.md, 03.5-elicit.md, 04-validation.md}`.

| Findings | Step that should catch | Why it did not (doctrine gap) |
|---|---|---|
| 3, 4, 7, 6 (partly) | eLicit (03.5) | The Auto-Detection Matrix selects techniques by code type: SEC-01/02/03 only for "Auth/Security", INT-01 only for "API Endpoints" (meaning an API you expose), PERF/CONC only for "Database". A browser app that CONSUMES a third-party API and renders its data has no row; it falls into "UI Components" = UX-01, TEST-01, ARCH-04 (file size). The "at least one named technique" floor (03.5 line 26) is satisfied by a trivial pick. So untrusted-input handling, quota, timeout, CSP and malformed-payload checks are never selected. |
| 1, 8, 5 | Plan (02) + eLicit | No planning or elicitation item forces an "external dependency checklist" (quota, retry, timeout, outage, schema drift, cost per call). Research (`$ai-pilot:research`) verifies APIs exist, not that their limits are honoured. Product lens (challenger) only runs on new features, and judges coherence and usability, not the "worldwide" claim against 6 probes. |
| 2, 16 | Execute (03-execution) + Verify | 02-apex-workflow line 32 says tests first (RED/GREEN), but 03-execution never says it: its checklist ends at "Local testing passed" (vague) with no test artifact required. Verify only needs "executed checks"; the happy-path capture passed it. `04-validation` Gate requires proof artefacts of eLicit/Verify existing, not what they cover (no minimum: invalid input, error path, each declared variant). report.json even carries an empty 4th run unnoticed. |
| 17 | sniper (04-validation) | Sniper = linters + type check + build + file size + JSDoc. The project has no `package.json`, linter, `tsconfig` or build; all of those checks are vacuously green, and "ZERO errors" is reachable without examining behaviour. The doctrine has no rule "no check available -> create one or report not verified". It also has no CSP/a11y/security gate for web output (security-expert is not in the route). |
| 6, 12 | Verify (UI) | UI proof = "capture opened and compared" (AGENTS COORDINATOR PATH 9). Nothing requires keyboard, screen-reader or target-size checks; a screenshot cannot show focus loss, live-region silence or tooltip-only affordances. |
| 9 | Maintainability (eLicit ARCH-01) | Rule "interfaces in `src/interfaces/`" and 200-line ceiling are satisfied by 198 lines; SOLID split triggers only on size, so a mixed-responsibility 198-line file passes. |

Executor note: the deliverable was a UI built by `typescript-expert`. `01-project-detection` routes by file indicators; a greenfield folder has none (no `tsconfig`), and AGENTS rule 05 sends UI to `design-expert` while allowing logic/data wiring without it. A mixed UI+logic deliverable was given to one language agent that then wrote plain JS: none of its own skills applied (`ts-config`, `ts-testing`, `ts-lint-format`, `tsc --noEmit` as completion criterion), so its "Done = typecheck + sniper" criterion was vacuous. Fix on the doctrine side: split UI and logic tasks (design-expert for the visual layer, language expert for logic with tests), and make a greenfield "HTML site" route explicit, so the logic owner must add a minimal toolchain (test runner, `@ts-check` or `tsc --checkJs`).

## Suggestions (not built)
- Suggestion: add an "External API consumer / untrusted data" row to the eLicit matrix (SEC-02 input, INT-01 contract + schema drift, CONC timeout/retry/rate-limit, SEC CSP) -> gain: findings 1, 3, 4, 7, 8 become auto-selected instead of luck.
- Suggestion: add a "vacuous gate" rule to sniper/verification: no linter/type/test tool in the project => create a minimal one or report "not verified" -> gain: kills finding 17 class of false "zero errors".
- Suggestion: add a Verify minimum matrix for UI/web deliverables (invalid input, nonexistent target, error/offline, every declared record/variant, keyboard-only pass, each declared viewport x theme result captured) -> gain: catches findings 2, 6 and the empty mobile-dark run.
- Suggestion: reuse this site as a regression benchmark: re-run the same prompt after doctrine edits and diff findings against this file -> gain: measurable doctrine improvement per iteration (the owner's "improve as you go").
