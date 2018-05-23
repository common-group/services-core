# Generate scoped user api key

**POST** `/rpc/create_scoped_user_session` | **required roles:** `platform_user` 


### data payload json

+ id (uuid) **required** - User uuid

### example request

```bash
curl -X POST https://sandbox.api.community.comum.io/rpc/create_scoped_user_session \
    -H 'authorization: Bearer API_KEY' \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' \
    -d '{
        "id": "USER_UUID"
    }'
```

### example result

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2NvcGVkX3VzZXIiLCJ1c2VyX2lkIjoiZTVkMTlkNzQtNWFkNC00NzZmLWFhMmEtZDcxYTc4YTliYWMwIiwicGxhdGZvcm1fdG9rZW4iOiJhMjhiZTc2Ni1iYjM2LTQ4MjEtODJlYy03NjhkMjYzNGQ3OGIiLCJleHAiOjE1MTAzMzI5ODV9.znXIG-d2UMMtzdjFBR-hp9K9f4fwPAzOdj9aOxxbPx8"
}
```

## function source

```sql
CREATE OR REPLACE FUNCTION community_service_api.create_scoped_user_session(id uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _platform platform_service.platforms;
            _user community_service.users;
            _jwt text;
            _result json;
            _scopes text[];
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

            select array_agg(role_name) from community_service.user_roles
                where user_id = _user.id
                    and platform_id = core.current_platform_id()
                into _scopes;


            select token from core.gen_jwt_token(json_build_object(
                'role', 'scoped_user',
                'user_id', _user.id,
                'platform_token', core.current_platform_token(),
                'exp', extract(epoch from now())::integer + (60*60)*2,
                'iat', extract(epoch from now())::integer,
                'scopes', coalesce(_scopes, '{}'::text[])
            )) into _jwt;

            select json_build_object(
                'token', _jwt
            ) into _result;

            return _result;
        end;
    $function$;
```



