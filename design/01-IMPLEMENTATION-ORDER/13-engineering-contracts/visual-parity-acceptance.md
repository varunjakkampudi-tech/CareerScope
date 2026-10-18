# Visual Parity Acceptance

For each approved page:

1. Implement from the canonical reference, not from memory.
2. Use real product data/state; no hard-coded fake metrics or unavailable capabilities.
3. Capture implementation screenshots at the exact agreed desktop/mobile viewports.
4. Compare reference vs implementation using image overlay/pixel-diff tooling.
5. Correct layout geometry, typography, line-height, spacing, radii, borders, shadows, colors, icons, imagery and responsive behavior.
6. Repeat until the visual-diff threshold is accepted.
7. Verify keyboard navigation, focus states, semantic labels, reflow and screen-reader structure separately; visual parity must not reduce accessibility.
8. Verify loading, validation, disabled, error, rate-limit, network and session-expired states.

Pixel-level fidelity is an acceptance process, not a claim made from a single screenshot implementation.
