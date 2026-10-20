CREATE TABLE "account_acceptances" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"document" text NOT NULL,
	"version" text NOT NULL,
	"accepted" boolean NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_acceptance_document_valid" CHECK ("account_acceptances"."document" IN ('terms', 'privacy_notice', 'marketing')),
	CONSTRAINT "account_acceptance_version_nonempty" CHECK (length(btrim("account_acceptances"."version")) BETWEEN 1 AND 128),
	CONSTRAINT "account_acceptance_required_grant" CHECK ("account_acceptances"."document" = 'marketing' OR "account_acceptances"."accepted")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD COLUMN "intent" text DEFAULT 'sign-in' NOT NULL;--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD COLUMN "terms_version" text;--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD COLUMN "privacy_version" text;--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD COLUMN "marketing_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD COLUMN "marketing_version" text;--> statement-breakpoint
ALTER TABLE "account_acceptances" ADD CONSTRAINT "account_acceptances_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_acceptance_owner_document_time" ON "account_acceptances" USING btree ("owner_id","document","recorded_at");--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD CONSTRAINT "email_otp_intent_valid" CHECK ("email_otp_challenges"."intent" IN ('sign-in', 'sign-up'));--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD CONSTRAINT "email_otp_signup_acceptance_complete" CHECK (("email_otp_challenges"."intent" = 'sign-in' AND "email_otp_challenges"."terms_version" IS NULL AND "email_otp_challenges"."privacy_version" IS NULL AND NOT "email_otp_challenges"."marketing_opt_in") OR ("email_otp_challenges"."intent" = 'sign-up' AND "email_otp_challenges"."terms_version" IS NOT NULL AND "email_otp_challenges"."privacy_version" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD CONSTRAINT "email_otp_marketing_version_required" CHECK (NOT "email_otp_challenges"."marketing_opt_in" OR "email_otp_challenges"."marketing_version" IS NOT NULL);