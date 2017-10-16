-- Your SQL goes here
drop function community_service_api.generate_scoped_user_key(user_key uuid);
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
            if current_role != 'platform_user' then
                RAISE insufficient_privilege;
            end if;

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
    $function$;
comment on function community_service_api.create_scoped_user_session(bigint) is 'Create a token for scoped user in community';
grant execute on function community_service_api.create_scoped_user_session(bigint) to platform_user;
