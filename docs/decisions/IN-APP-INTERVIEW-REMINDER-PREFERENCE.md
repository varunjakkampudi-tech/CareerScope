# In-app interview reminder preference

Status: implemented as a narrow interpretation of approved v12 §4.15; not a
new owner approval of the remaining notification roadmap.

## Decision

- New owners default to in-app interview reminders enabled, preserving current
  behavior. No preference row is required until the candidate changes it.
- The preference is stored in a dedicated owner-keyed table, not the candidate
  profile or matching snapshot.
- Disabling the preference prevents future reminder rows from being materialized.
  It does not delete, retire, or hide already materialized reminders.
- If re-enabled, a due reminder may be materialized once only while its interview
  remains scheduled and in the future. Existing publisher idempotency keys
  prevent duplicate rows. An interview that has started does not receive a late
  reminder.
- This control governs only the in-app interview-reminder type. It does not opt
  the candidate into or out of email, push, security, or marketing messages.
- The existing `/settings` Account Security surface is reused. Its approved
  Phase 0 parent design is
  `design/01-IMPLEMENTATION-ORDER/04-candidate-core/08-settings-resume.png`;
  this small addition is `DESIGN_PARTIAL_NON_BLOCKING`, not a new screen or
  visual redesign.

## Rationale and safeguards

Preserving the existing on-by-default behavior avoids silently suppressing
reminders for current candidates. A preference is separated from matching data
and is writable only through the authenticated session owner, with the existing
Origin/CSRF boundary and an owner-keyed rate limit. The publisher checks the
preference both when selecting and inserting a due notification, so a disable
that commits before insertion is honored. No title, contact, resume, or note is
copied into the notification.

## Boundaries

This implements one local preference only. Per-channel/type matrices, quiet
hours, daily caps/digests, localization, email/push delivery, suppression and
deliverability management remain open under `INTERVIEW-REMINDER-DELIVERY`.
Read-row/tombstone retention remains unimplemented because no approved retention
period or deletion policy exists; this change adds no purge.

## Recovery

The schema change is additive. Code rollback must not drop the preference table
or any candidate data. A forward corrective migration is required if the stored
setting needs alteration after deployment. Production migration has not been
applied or tested.
