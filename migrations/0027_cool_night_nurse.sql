CREATE TABLE "interview_round_documents" (
	"owner_id" uuid NOT NULL,
	"round_id" uuid NOT NULL,
	"upload_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_rounds" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"title" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"time_zone" text NOT NULL,
	"format" text NOT NULL,
	"status" text NOT NULL,
	"contacts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"reminder_at" timestamp with time zone,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interview_round_title_bounded" CHECK (length(btrim("interview_rounds"."title")) BETWEEN 1 AND 120),
	CONSTRAINT "interview_round_timezone_bounded" CHECK (length("interview_rounds"."time_zone") BETWEEN 1 AND 128),
	CONSTRAINT "interview_round_format_valid" CHECK ("interview_rounds"."format" IN ('video', 'phone', 'onsite', 'other')),
	CONSTRAINT "interview_round_status_valid" CHECK ("interview_rounds"."status" IN ('scheduled', 'completed', 'cancelled')),
	CONSTRAINT "interview_round_contacts_array" CHECK (jsonb_typeof("interview_rounds"."contacts") = 'array'),
	CONSTRAINT "interview_round_checklist_array" CHECK (jsonb_typeof("interview_rounds"."checklist") = 'array'),
	CONSTRAINT "interview_round_notes_bounded" CHECK (length("interview_rounds"."notes") <= 10000),
	CONSTRAINT "interview_round_revision_positive" CHECK ("interview_rounds"."revision" > 0),
	CONSTRAINT "interview_round_reminder_before_start" CHECK ("interview_rounds"."reminder_at" IS NULL OR "interview_rounds"."reminder_at" < "interview_rounds"."starts_at")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "interview_round_owner_id" ON "interview_rounds" USING btree ("owner_id","id");--> statement-breakpoint
ALTER TABLE "interview_round_documents" ADD CONSTRAINT "interview_round_documents_owner_id_round_id_interview_rounds_owner_id_id_fk" FOREIGN KEY ("owner_id","round_id") REFERENCES "public"."interview_rounds"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_round_documents" ADD CONSTRAINT "interview_round_documents_owner_id_upload_id_resume_uploads_owner_id_id_fk" FOREIGN KEY ("owner_id","upload_id") REFERENCES "public"."resume_uploads"("owner_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_rounds" ADD CONSTRAINT "interview_rounds_owner_id_lead_id_saved_leads_owner_id_id_fk" FOREIGN KEY ("owner_id","lead_id") REFERENCES "public"."saved_leads"("owner_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "interview_round_document_unique" ON "interview_round_documents" USING btree ("owner_id","round_id","upload_id");--> statement-breakpoint
CREATE INDEX "interview_document_owner_upload" ON "interview_round_documents" USING btree ("owner_id","upload_id");--> statement-breakpoint
CREATE INDEX "interview_round_owner_lead_start" ON "interview_rounds" USING btree ("owner_id","lead_id","starts_at");
