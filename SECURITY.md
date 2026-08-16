# Security policy

Nightmare 404 is a static, local-first PWA. It has no backend, accounts, analytics or external runtime dependencies.

## Supported version

Security fixes target the latest published release. Imported backups are validated and limited to 1 MB.

## Reporting a vulnerability

Do not publish secrets, personal data or exploit payloads in a public issue. Open a private GitHub security advisory for the repository when available, or contact the repository owner through their normal private channel.

## Scope

Relevant reports include persistent script injection, unsafe backup import, service-worker scope/cache isolation, data-loss bugs and unintended external network requests.
