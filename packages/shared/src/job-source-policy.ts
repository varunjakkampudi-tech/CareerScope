import { z } from 'zod';
import { type SourceId } from './constants.js';

/**
 * D14 launch discovery is limited to these ATS board integrations. Candidate-
 * supplied links are not provider collection and are not implemented by this
 * source catalog. They require their own candidate-owned product contract.
 * Other providers remain unavailable for launch.
 */
export const LAUNCH_JOB_SOURCE_CANDIDATES = [
  'greenhouse',
  'lever',
  'ashby',
  'workable',
] as const satisfies readonly SourceId[];

export const jobSourcePermissionProfileSchema = z
  .object({
    source: z.enum(LAUNCH_JOB_SOURCE_CANDIDATES),
    approvalRef: z.string().min(8).max(120),
    evidenceRef: z.string().min(3).max(240),
    approvedAt: z.string().datetime(),
    reviewBy: z.string().datetime(),
    rights: z
      .object({
        collection: z.boolean(),
        storage: z.boolean(),
        transformation: z.boolean(),
        candidateDisplay: z.boolean(),
        aiProcessing: z.boolean(),
        publicDisplay: z.boolean(),
        redistribution: z.boolean(),
      })
      .strict(),
  })
  .strict()
  .refine((profile) => Date.parse(profile.reviewBy) > Date.parse(profile.approvedAt));

export type JobSourcePermissionProfile = z.infer<typeof jobSourcePermissionProfileSchema>;

/**
 * No source has owner-recorded rights evidence in the current repository.
 * Adding a profile requires a reviewed, source-specific permission record;
 * credentials or full provider terms must never be stored here.
 */
export const APPROVED_JOB_SOURCE_PROFILES: readonly JobSourcePermissionProfile[] =
  jobSourcePermissionProfileSchema.array().parse([]);

export const JOB_SOURCE_PERMISSION_PENDING_MESSAGE =
  'Job discovery is unavailable until the selected source has an approved, current permission profile.';

export function isJobSourcePermittedForCandidateDiscovery(
  source: SourceId,
  profiles: readonly JobSourcePermissionProfile[] = APPROVED_JOB_SOURCE_PROFILES,
  now = Date.now(),
): boolean {
  if (!(LAUNCH_JOB_SOURCE_CANDIDATES as readonly string[]).includes(source)) return false;
  const profile = profiles.find((candidate) => candidate.source === source);
  if (!profile || Date.parse(profile.approvedAt) > now || Date.parse(profile.reviewBy) <= now)
    return false;
  return (
    profile.rights.collection &&
    profile.rights.storage &&
    profile.rights.transformation &&
    profile.rights.candidateDisplay
  );
}

export function permittedCandidateDiscoverySources(
  profiles: readonly JobSourcePermissionProfile[] = APPROVED_JOB_SOURCE_PROFILES,
  now = Date.now(),
) {
  return LAUNCH_JOB_SOURCE_CANDIDATES.filter((source) =>
    isJobSourcePermittedForCandidateDiscovery(source, profiles, now),
  );
}

export function unpermittedCandidateDiscoverySources(
  sources: readonly SourceId[],
  profiles: readonly JobSourcePermissionProfile[] = APPROVED_JOB_SOURCE_PROFILES,
  now = Date.now(),
) {
  return sources.filter(
    (source) => !isJobSourcePermittedForCandidateDiscovery(source, profiles, now),
  );
}
