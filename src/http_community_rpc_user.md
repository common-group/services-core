# Create / Update user

**POST** `/rpc/user` | **required roles:** `platform_user/soped_user` 

### data payload json

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| external\_id | string | not required, default is null | only avaiable when creating a user with platform\_user, this is a reference for a external source |
| name | string | **required** | user full name |
| email | string | **required** | user email |
| password | string | **required** | user password |
| password\_encrypted | boolean | not required, default false | set true when password is already encrypted using bcrypt |
| document\_type | string | not required | CPF / CNPJ |
| document\_number | string | not required | valid CPF/CNPJ number |
| born\_at | date | not required | birth date \(YYYY-MM-DD\) |
| address.street | string | not required | address street |
| address.street\_number | numeric | not required | address street number |
| address.neighborhood | string | not required | address neighborhood |
| address.zipcode | string | not required | address zipcode |
| address.country | string | not required | address country name |
| address.state | string | not required | address state |
| address.city | string | not required | address city |
| address.complementary | string | not required | address complement |
| phone.ddi | string | not required | ddi phone number |
| phone.ddd | string | not required | ddd phone number |
| phone.number | string | not required | phone number |
| bank\_account.bank\_code | string | not required | bank code |
| bank\_account.account | string | not required | bank account number |
| bank\_account.account\_digit | string | not required | bank account digit |
| bank\_account.agency | string | not required | bank account agency |
| bank\_account.agency\_digit | string | not required | bank account agency digit |

###

### example request

```bash
curl -X POST https://sandbox.api.community.comum.io/rpc/user \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/json' \
    -H 'authorization: Bearer API_TOKEN' \
    -d '{
        "data": {
            "external_id": "some_internal_id",
            "name": "Usuario de teste",
            "email": "test24@email.com",
            "password": "123456",
            "document_number": "38442866167",
            "document_type": "CPF",
            "born_at": "1990-12-09",
            "address": {
                "street": "Rua lorem ipsum",
                "street_number": 200,
                "neighborhood": "bairro",
                "zipcode": "34569000",
                "country": "Brasil",
                "state": "MG",
                "city": "lorem",
                "complementary": "comple"
            },
            "phone": {
                "ddi": "55",
                "ddd": "21",
                "number": "933448877"
            },
            "bank_account": {
                "bank_code": 237,
                "account": 22345,
                "account_digit": 5,
                "agency": 1644,
                "agency_digit": 4
            },
            "metadata": {
                "my_custom_field": "custom_valu"e
            }
        }
    }'
```

### example result

```json
{
    "id": "4e10c661-03bc-4949-a6af-5481783e90cc",
    "old_version_id": "e2f09578-8d70-4e8a-9498-dbf90fc22fb5",
    "data": {
        "name": "Usuario de teste",
        "email": "test24@email.com",
        "phone": {
            "ddd": "21",
            "ddi": "55",
            "number": "933448877"
        },
        "address": {
            "city": "lorem",
            "state": "MG",
            "street": "Rua lorem ipsum",
            "country": "Brasil",
            "zipcode": "34569000",
            "neighborhood": "bairro",
            "complementary": "comple",
            "street_number": "200"
        },
        "born_at": "1990-12-09",
        "metadata": {
            "myexternalid": 10
        },
        "current_ip": null,
        "bank_account": {
            "agency": "1644",
            "account": "22345",
            "bank_code": "237",
            "agency_digit": "4",
            "account_digit": "5"
        },
        "document_type": "CPF",
        "document_number": "38442866167",
        "legal_account_type": null
    }
}
```

## function source

```sql
CREATE OR REPLACE FUNCTION community_service_api."user"(data json)
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
            perform core.force_any_of_roles('{platform_user,scoped_user}');
            
            -- get user if id is provided or scoped_user
            if current_role = 'platform_user' and ($1->>'id')::uuid is not null then
                select * from community_service.users
                    where id = ($1->>'id')::uuid
                        and platform_id = core.current_platform_id()
                    into _user;
                if _user.id is null then
                    raise 'user not found';
                end if;                    
            elsif current_role = 'scoped_user' then
                select * from community_service.users
                    where id = core.current_user_id()
                        and platform_id = core.current_platform_id()
                    into _user;
                    
                if _user.id is null then
                    raise 'user not found';
                end if;
            end if;

            -- insert current_ip into refined
            _refined := jsonb_set($1::jsonb, '{current_ip}'::text[], to_jsonb(coalesce(($1->>'current_ip')::text, core.force_ip_address())));

            -- generate user basic data structure with received json
            if _user.id is not null then
                _refined := community_service._serialize_user_basic_data($1, _user.data::json);

                -- insert old user data to version
                insert into community_service.user_versions(user_id, data)
                    values (_user.id, row_to_json(_user.*)::jsonb)
                    returning * into _version;

                -- update user data
                update community_service.users
                    set data = _refined,
                        email = _refined->>'email'
                    where id = _user.id
                    returning * into _user;
            else
                -- geenrate user basic data
                _refined := community_service._serialize_user_basic_data($1);
                
                -- check if password already encrypted
                _passwd := (case when ($1->>'password_encrypted'::text) = 'true' then 
                                ($1->>'password')::text  
                            else 
                                crypt(($1->>'password')::text, gen_salt('bf')) 
                            end);

                -- insert user in current platform
                insert into community_service.users (external_id, platform_id, email, password, data, created_at, updated_at)
                    values (($1->>'external_id')::text,
                            core.current_platform_id(),
                            ($1)->>'email',
                            _passwd,
                            _refined::jsonb,
                            coalesce(($1->>'created_at')::timestamp, now()),
                            coalesce(($1->>'updated_at')::timestamp, now())
                        )
                        returning * into _user;
                -- insert user version
                insert into community_service.user_versions(user_id, data)
                    values (_user.id, row_to_json(_user.*)::jsonb)
                returning * into _version;
            end if;
            
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;
            
            return _result;
        end;
    $function$;
```



