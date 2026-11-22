## Frontend Tasks

### UI Workflow (MANDATORY: route through `design-expert`)
**Executor (ZERO TOLERANCE):** any web deliverable with a UI — page, site, screen, component styling — is EXECUTED by `design-expert`: it is the named writer of the markup and styling (HTML/CSS, or the framework's component markup and styles). A framework or language expert (per `01-project-detection`) only wires logic, data and state, after or alongside, in files or blocks design-expert does not own; it never writes the styling. `design-expert` "consulted", reviewing, or advising someone else's markup never counts as this route. The design side of the method lives in `plugins/design-expert/**`. Verify bar: `02-apex-workflow` Full APEX Flow "Verify" row.
1. **`design-method` skill first** — 4-question brief, signature element, two-pass critique, anti-slop clusters, then routes to the target skill (web/webapp/ios/android)
2. **Direct HTML/CSS generation is the default and primary path** — same method as Anthropic's `frontend-design` skill (commit to a point of view, verify with tools not vibes)
3. **Gemini Design MCP, Magic/21st.dev, shadcn MCP are optional fallback tools, NEVER a requirement** — native direct generation is always the fallback if any is unavailable
4. **Mobile (iOS/Android)** — tokens + HTML device-framed mockup + handoff spec ONLY, NEVER SwiftUI/Compose code (implementation stays with `swift-expert` / the Android developer)

### Optional Tools (never required)

| Tool | Usage |
|------|-------|
| `create_frontend` / `modify_frontend` / `snippet_frontend` (Gemini) | Fast first draft or surgical redesign |
| `shadcn-ui-expert` | Component registry, installation, patterns (`nextjs-shadcn` / `react-shadcn`) when shadcn is actually used |

**FORBIDDEN:** raw JSX/Tailwind/SwiftUI/Compose styling that skips the design-expert brief + tokens + verification pass
**ALLOWED without design-expert:** text changes, JS/Swift logic, data wiring, state management
