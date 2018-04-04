# List users

**GET** `/users` | **required roles:** `platform_user` 

### example request

```bash
curl -X GET 'https://sandbox.api.community.comum.io/users?limit=1' \
    -H 'authorization: Bearer API_KEY' \
    -H 'cache-control: no-cache'
```

### example result

```json
[
    {
        "external_id": "24354",
        "id": "e5d19d74-5ad4-476f-aa2a-d71a78a9bac0",
        "name": "Lorem Roberto",
        "public_name": null,
        "document_number": "05680310254",
        "document_type": "CPF",
        "legal_account_type": null,
        "email": "lorem@email.com",
        "address": {
            "city": null,
            "state": null,
            "street": null,
            "country": null,
            "zipcode": null,
            "neighborhood": null,
            "complementary": null,
            "street_number": null
        },
        "metadata": null,
        "bank_account": {
            "agency": "1235",
            "account": "21239",
            "bank_code": "237",
            "agency_digit": "3",
            "account_digit": "3"
        },
        "created_at": "2011-09-11T12:11:20.23",
        "updated_at": "2017-11-03T19:36:47.370375"
    }
]
```


## function source

```sql
CREATE OR REPLACE VIEW "community_service_api"."users" AS 
 SELECT u.external_id,
    u.id,
    (u.data ->> 'name'::text) AS name,
    (u.data ->> 'public_name'::text) AS public_name,
    (u.data ->> 'document_number'::text) AS document_number,
    (u.data ->> 'document_type'::text) AS document_type,
    (u.data ->> 'legal_account_type'::text) AS legal_account_type,
    u.email,
    ((u.data ->> 'address'::text))::jsonb AS address,
    ((u.data ->> 'metadata'::text))::jsonb AS metadata,
    ((u.data ->> 'bank_account'::text))::jsonb AS bank_account,
    u.created_at,
    u.updated_at
   FROM community_service.users u
  WHERE (u.platform_id = core.current_platform_id());
```
