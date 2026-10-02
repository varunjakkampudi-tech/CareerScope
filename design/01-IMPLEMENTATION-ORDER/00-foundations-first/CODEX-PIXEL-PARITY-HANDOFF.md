# CareerScope — Codex Pixel-Parity Handoff

## Source-of-truth order
1. `canonical/` — primary implementation references.
2. `page-references/` — individual crops extracted from approved composite boards.
3. `approved-images/` — approved full boards/screens.
4. `references/` — duplicate handoff/reference copies.
5. `foundations/` + `assets/` — tokens, icon mapping, asset requirements.
6. Production truth and existing application behavior always override illustrative text/data inside generated mockups.

## Required visual-diff loop
For every route/state:
1. Render at the reference viewport.
2. Capture a screenshot.
3. Compare side-by-side and with an overlay/diff.
4. Fix geometry first: page frame, sidebar, header, columns, cards.
5. Fix typography: family, weight, size, line-height, letter spacing.
6. Fix spacing/radii/borders/shadows.
7. Fix icons and imagery.
8. Fix responsive states.
9. Repeat until visual differences are negligible without breaking accessibility or real data behavior.

## Canonical app references
- Dashboard: `canonical/app/careerscope-dashboard-desktop-expanded.png`
- Jobs: `canonical/app/careerscope-jobs-desktop-final.png`
- Jobs sidebar states: expanded + collapsed canonical references.
- Applications: `canonical/app/careerscope-applications-desktop.png`
- Application details, AI Apply, Settings/Resume: corresponding canonical boards and individual crops under `page-references/`.

## Canonical auth/onboarding references
- Sign in: `canonical/auth/careerscope-auth-sign-in.png`
- Recovery/verification: `canonical/auth/careerscope-auth-account-recovery-verification-system.png`
- Onboarding: `canonical/onboarding/careerscope-onboarding-flow.png`

## Canonical public/marketing references
Individual page references are under `canonical/marketing/`:
Home, Features, How It Works, About, Resources, Contact/Feedback, Privacy, Terms.

## Critical product-truth guardrail
Generated screenshots can contain illustrative copy/data. Do not hard-code fabricated counts, testimonials, ratings, prices, user data, employer outcomes, or unsupported live capabilities. Bind real data and preserve the visual structure.

## Applications truth
CareerScope must not imply that employer lifecycle outcomes are automatically known. Application status/outcome information is user-controlled unless a future authorized integration provides an explicit verified signal.

## AI/resume match
Where AI Apply or resume-match UI is implemented, show it only when the corresponding real capability is enabled. Do not fake AI output.

## Responsive behavior
Desktop canonical target is 1440px-class layout. Preserve the approved collapsible sidebar. Implement sensible intermediate/tablet/mobile behavior rather than scaling the desktop screenshot.

## Icons
Follow `assets/icons/PRODUCTION-ICON-MAP.md`. Use one icon family and official brand marks where applicable.

## Background artwork
The approved screenshots contain mountain/path artwork, but the package still does not contain true isolated vector/source exports for all artwork. Do not claim exact source-asset parity until those isolated assets exist. CSS/vector recreation should be visually diffed against the references.
