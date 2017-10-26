-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION community_service_api.create_user(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _platform platform_service.platforms;
            _refined jsonb;
            _result json;
            _passwd text;
            _version community_service.user_versions;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user}');
            
            -- insert current_ip into refined
            _refined := jsonb_set($1::jsonb, '{current_ip}'::text[], to_jsonb(coalesce(($1->>'current_ip')::text, core.force_ip_address())));

            -- generate user basic data structure with received json
            _refined := community_service._serialize_user_basic_data($1);

            -- check if password already encrypted
            _passwd := (case when ($1->>'password_encrypted'::text) = 'true' then 
                            ($1->>'password')::text  
                        else 
                            crypt(($1->>'password')::text, gen_salt('bf')) 
                        end);

            -- insert user in current platform
            insert into community_service.users (platform_id, email, password, data, created_at, updated_at)
                values (core.current_platform_id(),
                        ($1)->>'email',
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
    $function$
;
CREATE OR REPLACE FUNCTION community_service_api.update_user(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _user_id bigint;
            _user community_service.users;
            _platform platform_service.platforms;
            _version community_service.user_versions;
            _refined json;
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');

            -- platform user can update any project inside the platform
            if current_role = 'platform_user' then
                _user_id := ($1->>'id')::bigint;
            else -- scoped_user can only update they records
                _user_id := core.current_user_id();
            end if;

            select * from community_service.users 
                where id = _user_id
                    and platform_id = core.current_platform_id()
            into _user;

            -- check if user exists on platform
            if _user.id is null then
                raise 'user not found';
            end if;

            -- put current ip inside jsonb
            _refined := jsonb_set($1::jsonb, '{current_ip}'::text[], to_jsonb(core.force_ip_address()));

            -- generate user basic data structure with received json
            _refined := community_service._serialize_user_basic_data($1, _user.data::json);

            -- insert old user data to version
            insert into community_service.user_versions(user_id, data)
                values (_user.id, _user.data)
                returning * into _version;

            update community_service.users
                set data = _refined,
                    email = _refined->>'email'
            where id = _user.id;

            -- build result with user id
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;

            return _result;
        end;
    $function$
;