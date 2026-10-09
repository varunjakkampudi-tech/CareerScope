# Phase 3.25 portable independent reviewer

Phase 3.25 content-bound specification receipts may be issued by the canonical
read-only reviewer identity `careerscope-independent-reviewer`. A portable
receipt must declare:

- `reviewerRole: PHASE325_INDEPENDENT_REVIEWER`
- `reviewScope: WHOLE_SPECIFICATION` or `AC_BINDING`
- `writerIdentity: phase325-spec-writer`
- `reviewPolicyVersion: PHASE3.25-PORTABLE-1`

The validator recomputes the current specification or binding digest and checks
that the digest appears in the review artifact. The writer identity must differ
from the reviewer identity. A receipt with a missing role, wrong scope, unknown
reviewer, stale digest, `REVISE` verdict, or self-approval is rejected.

The historical aliases `/root/phase325_review` and `/root/cs78_review` remain
valid for receipts already recorded under the earlier process. They are not a
permission to impersonate the portable reviewer and new portable receipts must
use the canonical identity and fields above.

This is process evidence, not cryptographic identity proof. The canonical
reviewer remains read-only and independent of the specification writer; the
repository does not treat a writer-authored review as independent merely
because a reviewer string was changed.
