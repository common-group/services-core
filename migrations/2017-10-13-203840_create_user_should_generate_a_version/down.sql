-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION community_service_api.create_user(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _platform platform_service.platforms;
            _refined json;
            _result json;
        begin
            -- generate user basic data structure with received json
            select community_service._serialize_user_basic_data($1)
                into _refined;

            -- insert user in current platform
            insert into community_service.users (platform_id, email, password, data, created_at, updated_at)
                values (core.current_platform_id(),
                        lower(($1)->>'email'::text),
                        crypt(($1->>'password')::text,
                        gen_salt('bf')),
                        _refined::jsonb,
                        coalesce(($1->>'created_at')::timestamp, now()),
                        coalesce(($1->>'updated_at')::timestamp, now())
                    )
                    returning * into _user;

            -- build result with user id
            select json_build_object(
                'id', _user.id
            ) into _result;

            return _result;
        end;
    $function$
;