# Testing

Use Node 24 and a sanitized `.env` for local checks.

## Fast checks

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:domain
npm run privacy:test
npm run privacy:check
npm run build
```

## Service-backed checks

Start PostgreSQL and Redis with `npm run services`, then run
`npm run test:integration`, `npm run test:ui` and the recovery/queue checks
that match the change. These checks are environment-dependent; a command not
run because services or browsers are unavailable is not evidence of success.

`check-ui.ts` retains the existing workspace/session/password-account
compatibility regressions using synthetic account fixtures. The removed signup
form is no longer exercised; fixture sessions enter through the selector.
Private test-access integration checks independently use the real two-account
allowlist and reject missing/forged staging assertions, unknown identities,
cross-owner reads and registration/password mutations in test mode.

## Security and release evidence

`npm run security:check` includes the privacy scan and production dependency
audit. GitHub Actions workflows are disabled; run checks locally. The deployment
decision tests remain available, but they do not prove hosted CI or deployment. Manual
accessibility, hosted provider, backup/restore and live smoke evidence remain
separate acceptance gates.
