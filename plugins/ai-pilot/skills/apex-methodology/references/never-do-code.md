---
name: never-do-code
description: Generic code mistakes never to ship -- loaded at Execute, re-checked at eLicit and Verify
when-to-use: MUST read at 03-execution before writing code, and re-check every rule at 03.5-elicit and at Verify
keywords: never do, mistakes, tests, external API, untrusted data, validation, accessibility, CSP, verification, vacant gate
priority: high
related: 03-execution.md, 03.5-elicit.md, 04-validation.md
---

# Never Do — Code

Source: real-run audits (first: `docs/validation/doctrine-coherence/t10/run-1/audit-code.md`, 2026-11-22). Design mistakes are owned by `design-expert` skills, not restated here. Grow this file: each audited mistake that recurs becomes one generic line in the matching section (owner: « tu l'améliore au fur et à mesure »).

Each rule applies when its subject exists in the deliverable. At eLicit, report each applicable rule as `held` / `fixed` / `not applicable (why)`.

## Tests and proof

1. Never ship code with zero tests: one test per pure function that gates input or interprets data, plus one failure-path test per external call — written first (RED), then green.
2. Never treat "no console error on the happy path" or "local testing passed" as verification; run the unhappy paths (Verify matrix below) and every declared variant, viewport and theme.
3. Never report "zero errors" from a gate whose tool does not exist in the project (no linter, type check, test runner, or build): create a minimal check first, or report that gate "not verified".
4. Never count an empty capture or a zero-row / blank-status run as a pass; it is a failed run.

## External APIs and untrusted data

5. Never dereference external data without a shape guard at the boundary; one malformed item degrades that item only, never the whole view.
6. Never show `error.message` or any raw exception text to the end user; map it to a known, localized message and log the raw one.
7. Never accept input only because it parses: validate it against the domain's rules (reserved or special-use values, length, charset) before spending a paid or quota-limited call.
8. Never call a rate-limited third-party API without reading its limit/retry headers, honouring `Retry-After`, showing the remaining budget, and applying a cooldown after a 429.
9. Never depend on a single external provider without a defined degraded mode (time-to-retry message, cached last result, or second provider).
10. Never poll at a fixed interval: use backoff with jitter, honour `Retry-After`, check cancellation (`signal.aborted`) explicitly, and give the user a cancel action.
11. Never send user input to a third party, or spend quota on it, unless it is necessary and disclosed at the point of entry.

## Product claims and data presentation

12. Never claim a capability the design cannot deliver ("worldwide", "propagation", "real-time"): size the sample and make the sources comparable, or word the claim down.
13. Never present comparison data raw: normalize its order and lead with a summary of agreement and difference.

## Web output: accessibility and security

14. Never rebuild a live-updating region wholesale without a live-region announcement and deliberate focus management; errors use an alert role, progress a polite status region.
15. Never disable the control that holds focus; use `aria-disabled` or move focus deliberately.
16. Never make a tiny control (below the WCAG 2.5.8 target size) or a hover-only tooltip the sole affordance.
17. Never ship a web page without a Content-Security-Policy (`connect-src` pinned to the known API origins) and a referrer policy, even when output is escaped.

## Structure

18. Never mix validation, transport, state and rendering in one scope: keep pure logic importable (so it can be tested) and name and document its constants.

## Verify matrix — minimum for a web deliverable

Run and capture each line that applies; a line not run is "not verified", never "pass":

| Case | What proves it |
|------|----------------|
| Invalid input | the input gate rejects it with a user message; no external call made |
| Non-existent target (unknown domain, id, route) | handled message, no raw error |
| Offline / provider error (4xx, 429, 5xx, network down, timeout, malformed payload) | localized message, control re-enabled, healthy items still shown |
| Keyboard only | every action reachable and operable; focus visible and never lost to `<body>` |
| Each declared viewport × light and dark | one capture per combination showing a populated result; an empty or zero-row capture = failed run |
