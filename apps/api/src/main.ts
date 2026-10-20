import {
  Database,
  configuration,
  configuredFileResumeStorage,
  logger,
  rateLimiter,
  shutdownSignal,
  testAccessConfiguration,
  otpSecretFromHex,
} from '@careerscope/core';
import { createResendOtpSender } from '@careerscope/providers';
import { createApp } from './app.js';

const env = configuration();
const database = new Database(env.DATABASE_URL);
const limiter = await rateLimiter(env.REDIS_URL);
const resumeStorage = await configuredFileResumeStorage();
const otp =
  env.AUTH_OTP_ENABLED === 'true'
    ? {
        secret: otpSecretFromHex(env.OTP_HMAC_SECRET!),
        sender: createResendOtpSender({
          apiKey: env.RESEND_API_KEY!,
          from: env.RESEND_FROM_EMAIL!,
        }),
        registrationEnabled: env.REGISTRATION_ENABLED === 'true',
        termsVersion: env.LEGAL_TERMS_VERSION,
        privacyVersion: env.LEGAL_PRIVACY_VERSION,
      }
    : undefined;
const app = await createApp(database, env.APP_ORIGIN, limiter.consume, {
  registrationEnabled: otp?.registrationEnabled === true,
  testAccess: testAccessConfiguration(process.env, env.APP_ORIGIN),
  readinessCheck: async () => {
    await limiter.client.ping();
  },
  otp,
  legalLinks:
    otp?.registrationEnabled === true
      ? { terms: env.LEGAL_TERMS_URL!, privacy: env.LEGAL_PRIVACY_URL! }
      : undefined,
  resumeStorage: resumeStorage
    ? {
        bucket: resumeStorage.bucket,
        initialize: resumeStorage.initialize.bind(resumeStorage),
        put: resumeStorage.put.bind(resumeStorage),
        get: resumeStorage.get.bind(resumeStorage),
        recoverVersion: resumeStorage.recoverVersion.bind(resumeStorage),
        delete: resumeStorage.delete.bind(resumeStorage),
      }
    : undefined,
});
const shutdown = shutdownSignal();
try {
  // This process is the only object writer, so nothing it owns is in flight yet.
  if (resumeStorage) {
    const reclaimed = await resumeStorage.reclaimTemporariesAtStartup(shutdown.signal);
    if (reclaimed.removed)
      logger.warn(reclaimed, 'Reclaimed resume temporaries from a dead writer');
  }
  await app.listen({ host: '127.0.0.1', port: 5390 });
  // Ties a running process to the source it was built from. Deliberately not on
  // /api/health, which is unauthenticated.
  logger.info(
    { port: 5390, revision: process.env.CAREERSCOPE_REVISION ?? 'unknown' },
    'API listening',
  );
  if (!shutdown.signal.aborted)
    await new Promise<void>((resolve) =>
      shutdown.signal.addEventListener('abort', () => resolve(), { once: true }),
    );
} finally {
  await app.close();
  await limiter.close();
  await database.close();
  resumeStorage?.close();
  shutdown.close();
}
