# Production Content Guardrails

- No dummy/sample user data in production UI.
- No fabricated job counts, company counts, active-user counts, ratings or testimonials.
- No claim that a job is verified unless the product has evidence for that state.
- Do not expose AI-powered capability copy when runtime AI is disabled/unavailable.
- Google sign-in must reflect actual deployment state; if unavailable, do not present it as a functioning production action.
- Unknown data remains unknown rather than inferred.
- Auth errors must not leak account existence or sensitive security details.
