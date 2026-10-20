ALTER TABLE "lead_history" DROP CONSTRAINT "lead_history_status_valid";--> statement-breakpoint
ALTER TABLE "saved_leads" DROP CONSTRAINT "lead_status_valid";--> statement-breakpoint
ALTER TABLE "lead_history" ADD COLUMN "previous_status" text;--> statement-breakpoint
ALTER TABLE "lead_history" ADD COLUMN "application_evidence_changed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_history" ADD COLUMN "application_evidence" jsonb;--> statement-breakpoint
ALTER TABLE "saved_leads" ADD COLUMN "application_evidence" jsonb;--> statement-breakpoint
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_previous_status_valid" CHECK ("lead_history"."previous_status" IS NULL OR "lead_history"."previous_status" IN ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn', 'archived'));--> statement-breakpoint
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_application_evidence_valid" CHECK ("lead_history"."application_evidence" IS NULL OR (
        jsonb_typeof("lead_history"."application_evidence") = 'object'
        AND "lead_history"."application_evidence" ?& ARRAY['method', 'appliedAt', 'confirmation', 'source', 'confidence']
        AND ("lead_history"."application_evidence" - ARRAY['method', 'appliedAt', 'confirmation', 'source', 'confidence']::text[]) = '{}'::jsonb
        AND jsonb_typeof("lead_history"."application_evidence"->'method') = 'string'
        AND length(btrim("lead_history"."application_evidence"->>'method')) BETWEEN 1 AND 120
        AND jsonb_typeof("lead_history"."application_evidence"->'appliedAt') = 'string'
        AND jsonb_typeof("lead_history"."application_evidence"->'confirmation') = 'string'
        AND "lead_history"."application_evidence"->>'confirmation' IN ('unknown', 'received', 'not_received')
        AND jsonb_typeof("lead_history"."application_evidence"->'source') = 'string'
        AND length(btrim("lead_history"."application_evidence"->>'source')) <= 160
        AND jsonb_typeof("lead_history"."application_evidence"->'confidence') = 'string'
        AND "lead_history"."application_evidence"->>'confidence' IN ('unknown', 'low', 'medium', 'high')
      ));--> statement-breakpoint
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_status_valid" CHECK ("lead_history"."status" IN ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn', 'archived'));--> statement-breakpoint
ALTER TABLE "saved_leads" ADD CONSTRAINT "lead_application_evidence_valid" CHECK ("saved_leads"."application_evidence" IS NULL OR (
        jsonb_typeof("saved_leads"."application_evidence") = 'object'
        AND "saved_leads"."application_evidence" ?& ARRAY['method', 'appliedAt', 'confirmation', 'source', 'confidence']
        AND ("saved_leads"."application_evidence" - ARRAY['method', 'appliedAt', 'confirmation', 'source', 'confidence']::text[]) = '{}'::jsonb
        AND jsonb_typeof("saved_leads"."application_evidence"->'method') = 'string'
        AND length(btrim("saved_leads"."application_evidence"->>'method')) BETWEEN 1 AND 120
        AND jsonb_typeof("saved_leads"."application_evidence"->'appliedAt') = 'string'
        AND jsonb_typeof("saved_leads"."application_evidence"->'confirmation') = 'string'
        AND "saved_leads"."application_evidence"->>'confirmation' IN ('unknown', 'received', 'not_received')
        AND jsonb_typeof("saved_leads"."application_evidence"->'source') = 'string'
        AND length(btrim("saved_leads"."application_evidence"->>'source')) <= 160
        AND jsonb_typeof("saved_leads"."application_evidence"->'confidence') = 'string'
        AND "saved_leads"."application_evidence"->>'confidence' IN ('unknown', 'low', 'medium', 'high')
      ));--> statement-breakpoint
ALTER TABLE "saved_leads" ADD CONSTRAINT "lead_status_valid" CHECK ("saved_leads"."status" IN ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn', 'archived'));
