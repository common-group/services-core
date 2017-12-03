-- Your SQL goes here
CREATE OR REPLACE FUNCTION platform_service_api.sign_up(name text, email text, password text)
 RETURNS core.jwt_token
 LANGUAGE plpgsql
AS $function$
    declare
        _user platform_service.users;
        result core.jwt_token;
    begin
        -- ensure that only anonymous can call this function
        perform core.force_any_of_roles('{anonymous}');
        
        insert into platform_service.users(name, email, password)
            values (name, email, crypt(password, gen_salt('bf')))
            returning * into _user;

        select token from core.gen_jwt_token(json_build_object(
            'role', 'platform_user',
            'user_id', _user.id,
            'exp', extract(epoch from now())::integer + (60*60)*2
        )) 
        into result;

        return result;
    end;
$function$;

CREATE OR REPLACE FUNCTION platform_service_api.login(email text, password text)
 RETURNS core.jwt_token
 LANGUAGE plpgsql
AS $function$
declare
    _user platform_service.users;
    result core.jwt_token;
begin
    -- ensure that only anonymous can call this function
    perform core.force_any_of_roles('{anonymous}');
    
    select
        u.*
    from platform_service.users u
        where lower(u.email) = lower($1)
            and u.password = crypt($2, u.password)
        into _user;

    if _user is null then
        raise invalid_password using message = 'invalid user or password';
    end if;

    select token from core.gen_jwt_token(
        json_build_object(
            'role', 'platform_user',
            'user_id', _user.id,
            'exp', extract(epoch from now())::integer + (60*60)*2
        )
    ) into result;

    return result;
end;
$function$;