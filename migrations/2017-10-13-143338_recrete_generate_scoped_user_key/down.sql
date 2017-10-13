-- This file should undo anything in `up.sql`
drop function community_service_api.create_scoped_user_session(bigint);
CREATE OR REPLACE FUNCTION community_service_api.generate_scoped_user_key(user_key uuid)
 RETURNS core.jwt_token
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _platform platform_service.platforms;
            _user community_service.users;
            _result core.jwt_token;
        begin
            select * from platform_service.platforms p 
                where p.token = core.current_platform_token()
                into _platform;

            if _platform is null then
                raise exception 'invalid platform';
            end if;

            select * from community_service.users cu
                where cu.platform_id = _platform.id
                    and cu.key = $1
                into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;


            select core.gen_jwt_token(json_build_object(
                'role', 'scoped_user',
                'user_id', _user.id,
                'platform_token', core.current_platform_token(),
                'exp', extract(epoch from now())::integer + (60*60)*2
            )) into _result;

            return _result;
        end;
    $function$
