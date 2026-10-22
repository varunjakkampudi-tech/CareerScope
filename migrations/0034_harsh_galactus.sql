ALTER TABLE "lead_history" ADD COLUMN "tags_changed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_history" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_leads" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.careerscope_valid_lead_tags(tag_values text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
SET search_path = pg_catalog
AS $function$
  SELECT cardinality(tag_values) <= 12
    AND coalesce(array_ndims(tag_values), 0) <= 1
    AND array_position(tag_values, NULL) IS NULL
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(tag_values) AS item(tag)
      WHERE item.tag IS NULL
        OR char_length(item.tag) NOT BETWEEN 1 AND 32
        OR item.tag <> btrim(
          item.tag,
          U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF'
        )
        OR position(',' IN item.tag) > 0
        OR item.tag ~ '[[:cntrl:]]'
    )
    AND (
      SELECT count(*) = count(DISTINCT lower(item.tag))
      FROM unnest(tag_values) AS item(tag)
    )
$function$;--> statement-breakpoint
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_tags_valid" CHECK (public.careerscope_valid_lead_tags("lead_history"."tags"));--> statement-breakpoint
ALTER TABLE "saved_leads" ADD CONSTRAINT "lead_tags_valid" CHECK (public.careerscope_valid_lead_tags("saved_leads"."tags"));
