CREATE TABLE "in_app_notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"round_id" uuid NOT NULL,
	"reminder_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "in_app_notifications" ADD CONSTRAINT "in_app_notifications_owner_id_round_id_interview_rounds_owner_id_id_fk" FOREIGN KEY ("owner_id","round_id") REFERENCES "public"."interview_rounds"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "in_app_notification_reminder_unique" ON "in_app_notifications" USING btree ("owner_id","round_id","reminder_at");--> statement-breakpoint
CREATE INDEX "in_app_notification_owner_created" ON "in_app_notifications" USING btree ("owner_id","created_at","id");