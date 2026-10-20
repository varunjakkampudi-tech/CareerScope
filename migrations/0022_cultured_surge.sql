CREATE TABLE "session_refresh_tokens" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_refresh_hash_hex" CHECK ("session_refresh_tokens"."token_hash" ~ '^[a-f0-9]{64}$')
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "access_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "created_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "last_used_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "device_label" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "revoked_at" timestamp with time zone;--> statement-breakpoint
-- Preserve existing opaque sessions only for their original remaining lifetime.
-- Their original absolute expiry is not extended and they receive no refresh token.
UPDATE "sessions"
SET "id" = gen_random_uuid(), "access_expires_at" = "expires_at";--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "access_expires_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "session_refresh_tokens" ADD CONSTRAINT "session_refresh_tokens_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_refresh_family" ON "session_refresh_tokens" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "session_refresh_expiry" ON "session_refresh_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_family_expiry" ON "sessions" USING btree ("expires_at");
