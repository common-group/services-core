-- Your SQL goes here
create or replace function project_service._serialize_project_basic_data(json) returns json
  immutable
  language plpgsql
as
$$
declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'name', core_validator.raise_when_empty(($1->>'name')::text, 'name'),
                'status', ($1->>'status'::text),
                'permalink', core_validator.raise_when_empty(($1->>'permalink')::text, 'permalink'),
                'mode', core_validator.raise_when_empty((($1->>'mode')::project_service.project_mode)::text, 'mode'),
                'about_html', ($1->>'about_html')::text,
                'budget_html', ($1->>'budget_html')::text,
                'online_days', ($1->>'online_days')::integer,
                'service_fee', ($1->>'service_fee')::float,
                'cover_image_versions', ($1->>'cover_image_versions')::json,
                'card_info', json_build_object(
                    'image_url', ($1->'card_info'->>'image_url')::text,
                    'title', ($1->'card_info'->>'title')::text,
                    'description', ($1->'card_info'->>'description')::text
                ),
                'video_info', json_build_object(
                    'id', ($1->'video'->>'id')::text,
                    'provider', ($1->'video'->>'provider')::text,
                    'embed_url', ($1->'video'->>'embed_url')::text,
                    'thumb_url', ($1->'video'->>'cover_url')::text
                ),
                'address', json_build_object(
                    'state', ($1->'address'->>'state')::text,
                    'city', ($1->'address'->>'city')::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
$$;

create or replace function project_service._serialize_project_basic_data(json, with_default json) returns json
  immutable
  language plpgsql
as
$$
declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip'),
                'name', core_validator.raise_when_empty(coalesce(($1->>'name')::text, ($2->>'name')::text), 'name'),
                'status', coalesce(($1->>'status'::text), ($2->>'status'::text)),
                'permalink', core_validator.raise_when_empty(coalesce(($1->>'permalink')::text, ($2->>'permalink')::text), 'permalink'),
                'mode', core_validator.raise_when_empty(coalesce((($1->>'mode')::project_service.project_mode)::text,(($2->>'mode')::project_service.project_mode)::text), 'mode'),
                'about_html', coalesce(($1->>'about_html')::text, ($2->>'about_html')::text),
                'budget_html', coalesce(($1->>'budget_html')::text, ($2->>'budget_html')::text),
                'online_days', coalesce(($1->>'online_days')::integer, ($2->>'online_days')::integer),
                'cover_image_versions', coalesce(($1->>'cover_image_versions'), ($2->>'cover_image_versions'))::json,
                'card_info', json_build_object(
                    'image_url', coalesce(($1->'card_info'->>'image_url'), ($2->'card_info'->>'image_url'))::text,
                    'title', coalesce(($1->'card_info'->>'title'), ($2->'card_info'->>'title'))::text,
                    'description', coalesce(($1->'card_info'->>'description'), ($2->'card_info'->>'description'))::text
                ),
                'video_info', json_build_object(
                    'id', coalesce(($1->'video'->>'id'), ($2->'video'->>'id'))::text,
                    'provider', coalesce(($1->'video'->>'provider'), ($2->'video'->>'provider'))::text,
                    'embed_url', coalesce(($1->'video'->>'embed_url'), ($2->'video'->>'embed_url'))::text,
                    'thumb_url', coalesce(($1->'video'->>'cover_url'), ($2->'video'->>'cover_url'))::text
                ),
                'address', json_build_object(
                    'state', coalesce(($1->'address'->>'state'), ($2->'address'->>'state'))::text,
                    'city', coalesce(($1->'address'->>'city'), ($2->'address'->>'city'))::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
$$;
