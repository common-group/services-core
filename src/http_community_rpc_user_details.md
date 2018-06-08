# Get user details

| **GET** `/rpc/user_details` | **required roles:** `platform_user/scoped_user` |
| :--- | :--- |


### data payload

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| id | uuid | **required** | user uuid |

###

### example request

```curl
curl -X GET https://sandbox.api.community.comum.io/rpc/user_details?id=USER_UUID \
-H 'cache-control: no-cache' \
-H 'content-type: application/json' \
-H 'authorization: Bearer API_TOKEN'
```

### example result

```json
{
    "id": "233479d5-2158-4e7e-a7f3-8d0e7a39a22b", 
    "address": {
        "city": "City", 
        "state": "ST", 
        "street": "Street Name", 
        "country": "Country Name", 
        "zipcode": "12345-123", 
        "neighborhood": "Neighborhood name", 
        "complementary": "Additional info", 
        "street_number": "123"
    }, 
    "external_id": "1"
}
```

### function source

```sql
CREATE OR REPLACE FUNCTION community_service_api.user_details(id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _user_id uuid;
            _exists_user_relation boolean;
            _ret jsonb;
        begin
        
            _user_id := id;
            _exists_user_relation := false;
            
            select 
                true
            from 
                project_service.projects project
            inner join 
                payment_service.catalog_payments payment 
            on 
                payment.user_id = _user_id
            where
                project.user_id = core.current_user_id()
            limit 1
            into
                _exists_user_relation;
                
            select
                u.id,
                u.platform_id,
                u.external_id,
                u.email,
                u.password,
                u.created_at,
                u.updated_at,
                (CASE
                    WHEN (core.is_owner_or_admin(u.id) or _exists_user_relation::boolean) THEN u.data
                    ELSE null::jsonb
                END) as data,
                u.key
            from
                community_service.users as u
            where
                u.id = _user_id
            limit 1
            into _user;
                
            select json_build_object(
                'id', _user.id,
                'external_id', _user.external_id,
                'address', (_user.data->>'address'::text)::jsonb
            )
            into _ret;
            
            return _ret;
        end;
$function$
```
