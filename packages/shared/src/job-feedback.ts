import { z } from 'zod';

export const jobFeedbackReasons = [
  'irrelevant',
  'duplicate',
  'incorrect',
  'unavailable',
  'suspicious',
] as const;

export const jobFeedbackReasonSchema = z.enum(jobFeedbackReasons);
export type JobFeedbackReason = z.infer<typeof jobFeedbackReasonSchema>;
