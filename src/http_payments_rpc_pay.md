# New payment / subscription

| **POST** `/rpc/pay` | **required roles:** `scoped_user` or `platform_user` |
| :--- | :--- |


### data payload json

| name | type | required | description |
| :--- | :--- | :--- | :--- |
| subscription | boolean | not required, default is false | set true if payment is a subscription. |
| is\_international | boolean | not required, default is false | set true if payment is not from brazil card |
| save\_card | boolean | not required, default is false | set true to save the credit card on user \(one click\) |
| user\_id | uuid | **required** when`platform_user` | set the user of payment |
| project\_id | uuid | **required** | id of project that is receiving the payment |
| reward\_id | uuid | not required | id of reward from project |
| amount | numeric \(13540 = 135,40\) | **required** | amount of payment |
| payment\_method | `credit_card` or `boleto` | **required** | method of payment |
| card\_id | uuid | not required | id of saved card of from user \(one click\) |
| card\_hash | hash string | **required **if payment\_method is credit\_card and not have a credit\_id | encrypted card data which expires in 5 minutes after generated |
| credit\_card\_owner\_document | string | not required | credit card owner document number |
| customer.name | string | **required** | customer name |
| customer.email | string | **required** | customer email |
| customer.document\_number | string | **required** | customer document number \(should be a valid CPF / CNPJ\) |
| customer.address.street | string | **required** | customer address street |
| customer.address.street\_number | numeric | **required** | customer address street number |
| customer.address.neighborhood | string | **required** | customer address neighborhood |
| customer.address.zipcode | string | **required** | customer address zipcode |
| customer.address.country | string | **required** | customer address country name |
| customer.address.state | string | **required** | customer address state |
| customer.address.city | string | **required** | customer address city |
| customer.address.complementary | string | not required | customer address complement |
| customer.phone.ddi | string | **required** | customer ddi phone number |
| customer.phone.ddd | string | **required** | customer ddd phone number |
| customer.phone.number | string | **required** | customer phone number |

###

### example request

```curl
curl -X POST https://sandbox.api.payment.comum.io/rpc/pay \
  -H 'authorization: Bearer API_TOKEN' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "data": {
      "subscription": false,
      "is_international": false,
      "save_card": false,
      "user_id": "USER_UUID",
      "project_id": "PROJECT_UUID",
      "reward_id": "REWARD_UUID",
      "amount": 2400,
      "payment_method": "credit_card",
      "card_hash": "CARD_HASH",
      "customer": {
        "name": "Teste da silva",
        "email": "notpersisted@email.com",
        "document_number": "88985122878",
        "address": {
          "street": "Rua lorem ipsum",
          "street_number": 200,
          "neighborhood": "bairro",
          "zipcode": "33600000",
          "country": "Brasil",
          "state": "MG",
          "city": "lorem",
          "complementary": "comple"
        },
        "phone": {
          "ddi": "55",
          "ddd": "21",
          "number": "933448877"
        }
      }
    }
  }'
```

### example result

```json
{
  "id": "c6a3dd4e-bc57-48f7-a78b-d5daa83e40af",
  "subscription_id": "c34198c5-f17a-4b0f-a6dd-1eae2a58fdcc",
  "old_version_id": "9846fe57-604e-4a04-93b8-8c224f05cb33"
}
```

### function source

```sql
CREATE OR REPLACE FUNCTION payment_service_api.pay(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _project project_service.projects;
            _result json;
            _payment payment_service.catalog_payments;
            _user_id uuid;
            _user community_service.users;
            _version payment_service.catalog_payment_versions;
            _credit_card payment_service.credit_cards;
            _subscription payment_service.subscriptions;
            _reward project_service.rewards;
            _refined jsonb;
            _external_id text;
            _is_international boolean default false;
        begin
            -- check if is foreign payment
            _is_international := coalesce(nullif(($1->>'is_international'), '')::boolean, false);

            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');

            -- ensure that foreign payment can't generate a boleto
            if _is_international and ($1->>'payment_method')::text = 'boleto' then
                raise 'invalid_payment_method';
            end if;

            -- check if is repaying a error payment
            if ($1->>'payment_id')::uuid is not null then
                select * from payment_service.catalog_payments cp
                    where cp.id = ($1->>'payment_id')::uuid
                        and core.is_owner_or_admin(cp.user_id)
                        and platform_id = core.current_platform_id()
                        and cp.status = 'error'
                    into _payment;

                if _payment.subscription_id is not null then
                    select * from payment_service.subscriptions
                        where id = _payment.subscription_id
                        into _subscription;
                end if;

                if _payment.id is null then
                    raise exception 'cant pay this payment';
                end if;
            end if;
            
            -- check roles to define how user_id is set
            if current_role = 'platform_user' then
                _user_id := ($1 ->> 'user_id')::uuid;
                _external_id := ($1 ->> 'external_id')::text;
            else
                _user_id := core.current_user_id();
            end if;

            -- check if project exists on platform
            if ($1->>'project_id')::uuid is null 
                OR not core.project_exists_on_platform(($1->>'project_id')::uuid, core.current_platform_id()) then
                raise exception 'project not found on platform: %, platform: %', ($1->>'project_id'), core.current_platform_id();
            end if;

            -- -- get project
            select * from project_service.projects p
                where p.id = ($1->>'project_id')::uuid
                    and p.platform_id = core.current_platform_id()
                into _project;

            -- only sub projects can use this route
            if _project.mode <> 'sub' then
                raise 'only_sub_projects';
            end if;

            if _project.status <> 'online' then
                raise 'project_not_online';
            end if;

            -- set user into variable
            select * 
            from community_service.users 
            where id = _user_id
                and platform_id = core.current_platform_id()
            into _user;
            -- check if user exists on current platform
            if _user.id is null then
                raise exception 'missing user';
            end if;

            -- get and check if reward exists
            if ($1->>'reward_id')::uuid is not null then
                select * from project_service.rewards
                    where project_id = ($1->>'project_id')::uuid
                        and id = ($1->>'reward_id')::uuid
                    into _reward;
                    
                if _reward.id is null then
                    raise 'reward not found: %', ($1->>'reward_id');
                end if;
                
                if ($1->>'amount')::decimal < (_reward.data->>'minimum_value')::decimal then
                    raise 'payment amount is bellow of reward minimum %', (_reward.data->>'minimum_value')::decimal;
                end if;
            end if;

            -- fill ip address to received params
            _refined := jsonb_set(($1)::jsonb, '{current_ip}'::text[], to_jsonb(core.force_ip_address()::text));

            -- if user already has filled document_number/name/email should use then
            if not core_validator.is_empty((_user.data->>'name')::text) then
                _refined := jsonb_set(_refined, '{customer,name}', to_jsonb(_user.data->>'name'::text));
            end if;

            if not core_validator.is_empty((_user.data->>'email')::text) then
                _refined := jsonb_set(_refined, '{customer,email}', to_jsonb(_user.data->>'email'::text));
            end if;

            if not core_validator.is_empty((_user.data->>'document_number')::text) then
                _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb(_user.data->>'document_number'::text));
            end if;
            
            -- fill with anonymous
            _refined := jsonb_set(_refined, '{anonymous}'::text[], to_jsonb(coalesce(($1->>'anonymous')::boolean, false)));
            
            -- fill with is_international
            _refined := jsonb_set(_refined, '{is_international}'::text[], to_jsonb(_is_international));
            
            -- generate a base structure to payment json
            _refined := (payment_service._serialize_payment_basic_data((_refined)::json))::jsonb;

             -- if payment_method is credit_card should check for card_hash or card_id
            if _refined->>'payment_method'::text = 'credit_card' then
                -- fill with credit_card_owner_document
                _refined := jsonb_set(
                    _refined, 
                    '{credit_card_owner_document}'::text[], 
                    to_jsonb(
                        coalesce(
                            replace(replace(replace(($1->> 'credit_card_owner_document')::text, '.', ''), '/', ''), '-', '')::text
                            , ''
                        )
                    )
                );

                -- fill with save_card
                _refined := jsonb_set(_refined, '{save_card}'::text[], to_jsonb(coalesce(($1->>'save_card')::boolean, false)));

                -- check if card_hash or card_id is present
                if core_validator.is_empty((($1)->>'card_hash')::text) 
                    and core_validator.is_empty((($1)->>'card_id')::text) then
                    raise 'missing card_hash or card_id';
                end if;

                -- if has card_id check if user is card owner
                if not core_validator.is_empty((($1)->>'card_id')::text) then
                    select cc.* from payment_service.credit_cards cc 
                    where cc.user_id = _user_id and cc.id = (($1)->>'card_id')::uuid
                    into _credit_card;

                    if _credit_card.id is null then
                        raise 'invalid card_id';
                    end if;

                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb(_credit_card.id::text));

                elsif not core_validator.is_empty((($1)->>'card_hash')::text) then
                    _refined := jsonb_set(_refined, '{card_hash}'::text[], to_jsonb($1->>'card_hash'::text));
                end if;

            end if;

            -- check if document_number is a valid format if is not international
            if not _is_international then
                if not core_validator.verify_cpf(_refined -> 'customer' ->> 'document_number'::text) 
                    and not core_validator.verify_cnpj(_refined -> 'customer' ->> 'document_number'::text) then
                    raise 'invalid_document';
                end if;


                if not core_validator.is_empty((_refined->>'credit_card_owner_document')::text)
                    and not core_validator.verify_cpf(_refined->>'credit_card_owner_document') 
                    and not core_validator.verify_cnpj(_refined->>'credit_card_owner_document') 
                then
                    raise 'invalid_card_owner_document';
                end if;
            end if;

            if _payment.id is not null then
                update payment_service.catalog_payments
                    set data = _refined
                    where id = _payment.id
                    returning * into _payment;

                perform payment_service.transition_to(_payment, 'pending', row_to_json(_payment));
            else
                -- insert payment in table
                insert into payment_service.catalog_payments (
                    external_id, platform_id, project_id, user_id, reward_id, data, gateway
                ) values (
                    _external_id,
                    core.current_platform_id(),
                    ($1->>'project_id')::uuid,
                    _user_id,
                    _reward.id,
                    _refined,
                    coalesce(($1->>'gateway')::text, 'pagarme')
                ) returning * into _payment;

                -- check if payment is a subscription to create one
                if nullif(($1->>'subscription'), '') is not null and ($1->>'subscription')::boolean  then
                    insert into payment_service.subscriptions (
                        platform_id, credit_card_id, project_id, user_id, reward_id, checkout_data
                    ) values (_payment.platform_id, _credit_card.id, _payment.project_id, _payment.user_id, _reward.id, payment_service._serialize_subscription_basic_data(_payment.data::json)::jsonb)
                    returning * into _subscription;

                    update payment_service.catalog_payments
                        set subscription_id = _subscription.id
                        where id = _payment.id;
                end if;

            end if;

            -- insert first payment version
            insert into payment_service.catalog_payment_versions (
                catalog_payment_id, data
            ) values ( _payment.id, _payment.data )
            returning * into _version;

            -- build result json with payment_id and subscription_id
            select json_build_object(
                'id', _payment.id,
                'subscription_id', _subscription.id,
                'old_version_id', _version.id
            ) into _result;

            -- notify to backend processor via listen
            PERFORM pg_notify('payment_stream',
                json_build_object(
                    'action', 'process_payment',
                    'id', _payment.id,
                    'subscription_id', _subscription.id,
                    'created_at', _payment.created_at::timestamp,
                    'sent_to_queue_at', now()::timestamp
                )::text
            );

            return _result;
        end;
    $function$
```
