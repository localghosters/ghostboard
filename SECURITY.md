# Security Policy

GhostBoard is a client-only, local-first app with no backend, no accounts,
and no server-side data storage in V1 — the attack surface is intentionally
small. Still, if you find a security issue, please report it responsibly.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security reports.**

Instead:

- Use GitHub's [private vulnerability reporting](../../security/advisories/new)
  for this repository, if enabled, **or**
- Contact the maintainers directly (see the organization profile for
  `localghosters` for current contact details).

Please include:

- A description of the issue and its potential impact
- Steps to reproduce (a minimal repro is ideal)
- The version/commit you tested against

We'll acknowledge reports as promptly as we can and keep you updated as
the issue is investigated and, if applicable, fixed.

## Supported versions

GhostBoard is pre-1.0 and moving quickly. Security fixes will target the
latest version on the `main` branch rather than maintaining older release
branches, unless that changes as the project matures.

## Scope notes

Things that are **in scope**:

- XSS or code execution triggered by importing a malicious `.json` board
  file
- Any way for one part of the app to escape its intended sandboxing (e.g.
  the sticky-note text editor)
- Supply-chain concerns in dependencies

Things that are generally **out of scope** for now, given the app has no
backend or accounts in V1:

- Server-side issues (there is no server)
- Social engineering
- Denial of service against your own local browser tab
