# .cartographer (v1.0.5)

├── agents/
│   └── [security-expert](./agents/security-expert.md) — Security vulnerability detection and remediation s
├── skills/
│   ├── [agentic-security](./skills/agentic-security/index.md) — Use when auditing the security of an AI-coding-agent setup in a repository: Clau
│   ├── [auth-audit](./skills/auth-audit/index.md) — Audit authentication and authorization patterns. Checks JWT, sessions, OAuth2, P
│   ├── [cve-research](./skills/cve-research/index.md) — Research CVEs and security advisories for project dependencies. Uses Exa, NVD AP
│   ├── [dependency-audit](./skills/dependency-audit/index.md) — Audit project dependencies for known vulnerabilities using ecosystem-specific to
│   ├── [security-headers](./skills/security-headers/index.md) — Verify and configure HTTP security headers (CSP, HSTS, CORS, X-Frame-Options, et
│   └── [security-scan](./skills/security-scan/index.md) — Main security scanning orchestration. Detects language, runs OWASP Top 10 patter
├── commands/
│   └── [/scan](./commands/scan.md) — Launch a comprehensive security audit on the curre
└── hooks: PostToolUse, PreToolUse
