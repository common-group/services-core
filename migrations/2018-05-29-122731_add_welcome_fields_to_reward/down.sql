-- This file should undo anything in `up.sql`

CREATE OR REPLACE FUNCTION project_service._serialize_reward_basic_data(json)
 RETURNS json
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'minimum_value', core_validator.raise_when_empty((($1->>'minimum_value')::decimal)::text, 'minimum_value')::decimal,
                'maximum_contributions', core_validator.raise_when_empty((($1->>'maximum_contributions')::integer)::text, 'maximum_contributions')::integer,
                'shipping_options', core_validator.raise_when_empty((($1->>'shipping_options')::project_service.shipping_options_enum)::text, 'shipping_options')::project_service.shipping_options_enum,
                'deliver_at', ($1->>'deliver_at')::date,
                'row_order',  ($1->>'row_order')::integer,
                'title', ($1->>'title')::text,
                'description', ($1->>'description')::text,
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;    
    $function$
;
---

CREATE OR REPLACE FUNCTION project_service._serialize_reward_basic_data(json, with_default json)
 RETURNS json
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', coalesce(($1->>'current_ip')::text, ($2->>'current_ip')),
                'minimum_value', core_validator.raise_when_empty(
                    coalesce((($1->>'minimum_value')::decimal)::text, ($2->>'minimum_value')::text), 'minimum_value')::decimal,
                'maximum_contributions', core_validator.raise_when_empty(
                    coalesce((($1->>'maximum_contributions')::integer)::text, ($2->>'maximum_contributions')::text), 'maximum_contributions')::integer,
                'shipping_options', core_validator.raise_when_empty(
                    coalesce((($1->>'shipping_options')::project_service.shipping_options_enum)::text, ($2->>'shipping_options')::text), 'shipping_options')::project_service.shipping_options_enum,
                'deliver_at', coalesce(($1->>'deliver_at')::date, ($2->>'deliver_at')::date),
                'row_order',  coalesce(($1->>'row_order')::integer, ($2->>'row_order')::integer),
                'title',  coalesce(($1->>'title')::text, ($2->>'title')::text),
                'description', coalesce(($1->>'description')::text, ($2->>'description')::text),
                'metadata', coalesce(($1->>'metadata')::json, ($2->>'metadata')::json)
            ) into _result;

            return _result;
        end;    
    $function$
