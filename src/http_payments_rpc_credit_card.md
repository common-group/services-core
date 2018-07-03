# Create credit card

Catalog a new credit card generation request

| **POST** `/rpc/credit_card` | **required roles:**`platform_user/scoped_user` |
| :--- | :--- |


### data payload json

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| card_hash | string | **required** | credit card hash |
| save | boolean | optinal (default false) | saved cards will be listed on saved_cards endpoint |

###

### example request

```curl
curl -X POST https://sandbox.api.payment.comum.io/rpc/credit_card \
-H 'cache-control: no-cache' \
-H 'content-type: application/json' \
-H 'authorization: Bearer API_TOKEN' \
-d '{ 
        "card_hash": "CARD_HASH",
        "save": true
    }'
```

### example result

```json
{
  "id": "a5d918d3-6dda-4e95-a910-38362b1ed08d",
}
```

### function source

```sql
CREATE OR REPLACE FUNCTION payment_service_api.credit_card(data json)
 RETURNS json
 LANGUAGE plpgsql
 volatile
AS $function$
    declare
        _user community_service.users;
        _card payment_service.credit_cards;
    begin
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user,scoped_user}');

        -- get user if id is provided or scoped_user
        if current_role = 'platform_user' then
            select * from community_service.users
                where id = ($1->>'user_id')::uuid
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

        if core_validator.is_empty(($1->>'card_hash')::text) or ($1->>'card_hash')::text is null then
            raise 'mising_card_hash';
        end if;

        if exists(
            select true from payment_service.credit_cards c
            where user_id = _user.id
                and (c.data ->> 'card_hash')::text = ($1->>'card_hash')::text
        ) then
            raise 'card_hash_should_be_unique';
        end if;

        insert into payment_service.credit_cards (platform_id, user_id, gateway, data, saved_in_process)
            values (_user.platform_id, _user.id, 'pagarme', json_build_object(
                'card_hash', ($1->>'card_hash')::text
            )::jsonb, coalesce(($1->>'save')::boolean, false))
        returning * into _card;

        perform pg_notify('payment_stream', json_build_object(
            'action', 'generate_card',
            'id', _card.id,
            'created_at', _card.created_at
        )::text);

        return json_build_object(
            'id', _card.id
        );
    end;
$function$;

```
