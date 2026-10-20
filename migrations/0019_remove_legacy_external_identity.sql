DO $retire_legacy_identity$
BEGIN
  LOCK TABLE "users" IN ACCESS EXCLUSIVE MODE;

  IF EXISTS (
    SELECT 1
    FROM "users"
    WHERE "external_subject" IS NOT NULL OR "phone" IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Cannot remove legacy external identity fields while values remain; owner-reviewed disposition is required';
  END IF;

  DROP INDEX IF EXISTS "users_external_subject_unique";
  DROP INDEX IF EXISTS "users_phone_unique";
  ALTER TABLE "users"
    DROP COLUMN "external_subject",
    DROP COLUMN "phone";
END
$retire_legacy_identity$;
