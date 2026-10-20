CREATE TABLE "email_change_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"current_email_hash" text NOT NULL,
	"new_email" text NOT NULL,
	"current_challenge_id" uuid NOT NULL,
	"current_digest" text NOT NULL,
	"current_attempts" integer DEFAULT 0 NOT NULL,
	"current_verified_at" timestamp with time zone,
	"new_challenge_id" uuid NOT NULL,
	"new_digest" text NOT NULL,
	"new_attempts" integer DEFAULT 0 NOT NULL,
	"new_verified_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_change_requests_current_challenge_id_unique" UNIQUE("current_challenge_id"),
	CONSTRAINT "email_change_requests_new_challenge_id_unique" UNIQUE("new_challenge_id"),
	CONSTRAINT "email_change_current_hash_hex" CHECK ("email_change_requests"."current_email_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "email_change_current_digest_hex" CHECK ("email_change_requests"."current_digest" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "email_change_new_digest_hex" CHECK ("email_change_requests"."new_digest" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "email_change_current_attempts_bounded" CHECK ("email_change_requests"."current_attempts" BETWEEN 0 AND 5),
	CONSTRAINT "email_change_new_attempts_bounded" CHECK ("email_change_requests"."new_attempts" BETWEEN 0 AND 5),
	CONSTRAINT "email_change_address_present" CHECK (length(btrim("email_change_requests"."new_email")) BETWEEN 3 AND 254),
	CONSTRAINT "email_change_expiry_after_creation" CHECK ("email_change_requests"."expires_at" > "email_change_requests"."created_at")
);
--> statement-breakpoint
ALTER TABLE "email_change_requests" ADD CONSTRAINT "email_change_requests_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_change_owner" ON "email_change_requests" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "email_change_expiration" ON "email_change_requests" USING btree ("expires_at");
