DROP INDEX "account_acceptance_owner_document_time";--> statement-breakpoint
ALTER TABLE "account_acceptances" ADD COLUMN "sequence" bigserial NOT NULL;--> statement-breakpoint
CREATE INDEX "account_acceptance_owner_document_sequence" ON "account_acceptances" USING btree ("owner_id","document","sequence");--> statement-breakpoint
ALTER TABLE "account_acceptances" ADD CONSTRAINT "account_acceptances_sequence_unique" UNIQUE("sequence");