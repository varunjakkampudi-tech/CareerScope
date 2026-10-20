# Email OTP primitive implementation plan

Status: implemented on `codex/task/email-otp-auth`; not integrated into
`codex/dev` and not a complete authentication flow.

## Scope

Implement a dependency-free, deterministic-at-the-boundary core primitive for
creating and verifying six-digit email OTP values. This slice establishes safe
code generation, challenge binding, expiry and attempt-budget behavior before
API persistence or delivery is added.

## Requirements and evidence

- Generate a cryptographically random six-digit code; return it only to the
  caller responsible for delivery and return a keyed digest for persistence.
- Bind the digest to the canonical challenge UUID and a purpose-specific HMAC
  domain separator so the same code cannot be replayed against another
  challenge.
- Use a 10-minute validity period and a five-attempt maximum for this first
  implementation; consume and increment attempt state atomically in the future
  persistence layer.
- Compare valid-shape digests with `timingSafeEqual`; reject malformed or
  inconsistent input without exposing a detailed rejection reason to callers.
- Require an HMAC key of at least 32 bytes. The primitive cannot establish key
  entropy or provision it; callers must supply a securely generated key. No
  secret value is committed or read from the environment by this primitive.
- Verify positive, negative, expiry-boundary, challenge-binding and malformed
  metadata cases using synthetic data only.

## Verification performed for this slice

- Node 24.21.0 isolated-container test: `node --experimental-strip-types --test
./email-otp.test.mjs` — 9 passed, 0 failed, 0 skipped.
- Focused strict TypeScript check of `email-otp.ts` — passed.
- Focused ESLint check of the changed source/test/export files — passed.
- Focused Prettier check of the changed source/test/export and package manifest
  — passed.

The container had no network, read-only target/toolchain mounts, an empty
inherited environment populated with an explicit safe allowlist, and bounded
CPU, memory, process, open-file and file-size limits. The test execution saw
only the OTP source/test files; lint used the changed files, their read-only
configuration and read-only dependency toolchain. These results are not
evidence that the full repository suite passes.

## Explicit exclusions and follow-up

This slice does not persist challenges, send email, add API routes, change the
sign-in UI, issue or rotate sessions, implement recovery, or satisfy the
required fallback-provider integration. Those changes require coordinated
database/API/UI contracts and the full isolated Node 24 integration/browser
toolchain. No provider request or real communication is authorized.
