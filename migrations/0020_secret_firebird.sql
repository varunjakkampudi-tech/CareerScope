CREATE TABLE "email_otp_challenges" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email_hash" text NOT NULL,
	"code_digest" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	CONSTRAINT "email_otp_attempts_valid" CHECK ("email_otp_challenges"."attempts" BETWEEN 0 AND 5)
);
--> statement-breakpoint
CREATE TABLE "legal_acceptances" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"terms_version" text NOT NULL,
	"privacy_version" text NOT NULL,
	"accepted_at" timestamp with time zone NOT NULL,
	"privacy_acknowledged_at" timestamp with time zone NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"marketing_recorded_at" timestamp with time zone,
	CONSTRAINT "legal_acceptance_versions_valid" CHECK (length(btrim("legal_acceptances"."terms_version")) BETWEEN 1 AND 80 AND length(btrim("legal_acceptances"."privacy_version")) BETWEEN 1 AND 80),
	CONSTRAINT "legal_marketing_timestamp_valid" CHECK (("legal_acceptances"."marketing_opt_in" = false AND "legal_acceptances"."marketing_recorded_at" IS NULL) OR ("legal_acceptances"."marketing_opt_in" = true AND "legal_acceptances"."marketing_recorded_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "marketing_consent_events" (
	"sequence" bigserial PRIMARY KEY NOT NULL,
	"id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"opted_in" boolean NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marketing_consent_events_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_consent_events" ADD CONSTRAINT "marketing_consent_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_otp_email_hash_unique" ON "email_otp_challenges" USING btree ("email_hash");--> statement-breakpoint
CREATE INDEX "email_otp_expires" ON "email_otp_challenges" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "legal_acceptance_user_time" ON "legal_acceptances" USING btree ("user_id","accepted_at");--> statement-breakpoint
CREATE INDEX "marketing_consent_user_sequence" ON "marketing_consent_events" USING btree ("user_id","sequence");