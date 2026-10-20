CREATE TABLE "email_otp_challenges" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email_hash" text NOT NULL,
	"digest" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_otp_email_hash_hex" CHECK ("email_otp_challenges"."email_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "email_otp_digest_hex" CHECK ("email_otp_challenges"."digest" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "email_otp_attempts_bounded" CHECK ("email_otp_challenges"."attempts" BETWEEN 0 AND 5),
	CONSTRAINT "email_otp_expiry_after_creation" CHECK ("email_otp_challenges"."expires_at" > "email_otp_challenges"."created_at")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "email_otp_email_hash" ON "email_otp_challenges" USING btree ("email_hash");--> statement-breakpoint
CREATE INDEX "email_otp_expiration" ON "email_otp_challenges" USING btree ("expires_at");