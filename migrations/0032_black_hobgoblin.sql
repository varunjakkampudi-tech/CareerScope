CREATE UNIQUE INDEX "job_owner_id" ON "search_jobs" USING btree ("owner_id","id");--> statement-breakpoint
CREATE TABLE "job_feedback" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_feedback_reason_valid" CHECK ("job_feedback"."reason" IN ('irrelevant', 'duplicate', 'incorrect', 'unavailable', 'suspicious'))
);
--> statement-breakpoint
ALTER TABLE "job_feedback" ADD CONSTRAINT "job_feedback_owner_id_job_id_search_jobs_owner_id_id_fk" FOREIGN KEY ("owner_id","job_id") REFERENCES "public"."search_jobs"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_feedback_owner_job" ON "job_feedback" USING btree ("owner_id","job_id");--> statement-breakpoint
CREATE INDEX "job_feedback_created" ON "job_feedback" USING btree ("created_at");--> statement-breakpoint
