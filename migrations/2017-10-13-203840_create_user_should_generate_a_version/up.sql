-- Your SQL goes here
CREATE OR REPLACE FUNCTION community_service_api.create_user(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _platform platform_service.platforms;
            _refined json;
            _result json;
            _passwd text;
            _version community_service.user_versions;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user}');

            -- generate user basic data structure with received json
            select community_service._serialize_user_basic_data($1)
                into _refined;

            -- check if password already encrypted
            select (case when ($1->>'password_encrypted'::text) = 'true' then ($1->>'password')::text  else crypt(($1->>'password')::text, gen_salt('bf')) end)
                into _passwd;

            -- insert user in current platform
            insert into community_service.users (platform_id, email, password, data, created_at, updated_at)
                values (core.current_platform_id(),
                        lower(($1)->>'email'::text),
                        _passwd,
                        _refined::jsonb,
                        coalesce(($1->>'created_at')::timestamp, now()),
                        coalesce(($1->>'updated_at')::timestamp, now())
                    )
                    returning * into _user;

            -- insert user version
            insert into community_service.user_versions(user_id, data)
                values (_user.id, _refined)
            returning * into _version;

            -- build result with user id
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;

            return _result;
        end;
    $function$;

CREATE OR REPLACE FUNCTION community_service_api.create_scoped_user_session(id bigint)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _platform platform_service.platforms;
            _user community_service.users;
            _jwt core.jwt_token;
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user}');


            select * from community_service.users cu
                where cu.platform_id = core.current_platform_id()
                    and cu.id = $1
                into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;


            select core.gen_jwt_token(json_build_object(
                'role', 'scoped_user',
                'user_id', _user.id,
                'platform_token', core.current_platform_token(),
                'exp', extract(epoch from now())::integer + (60*60)*2
            )) into _jwt;

            select json_build_object(
                'token', _jwt.token
            ) into _result;

            return _result;
        end;
    $function$
;