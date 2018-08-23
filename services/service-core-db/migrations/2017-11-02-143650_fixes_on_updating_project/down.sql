-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION project_service_api.project(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
    declare
        _platform platform_service.platforms;
        _user community_service.users;
        _result json;
        _permalink text;
        _refined jsonb;
        _project project_service.projects;
        _version project_service.project_versions;
        _is_creating boolean default true;
        _external_id text;
    begin
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user,scoped_user}');
        
        -- get project if id on json
        if ($1->>'id')::uuid is not null then
            select * from project_service.projects
                where id = ($1->>'id')::uuid 
                    and platform_id = core.current_platform_id()
                into _project;
                
            -- check if user has permission to handle on project
            if _project.id is null then
                raise 'project not found';
            end if;
            if not core.is_owner_or_admin(_project.user_id) then
                raise insufficient_privilege;
            end if;
            
            _is_creating := false;
        end if;
        
        -- select and check if user is on same platform
        select * from community_service.users cu
            where cu.id = (case when current_role = 'platform_user' then 
                            coalesce(_project.user_id, ($1->>'user_id')::uuid)
                            else core.current_user_id() end)
                and cu.platform_id = core.current_platform_id()
            into _user;
        
        if _user.id is null or not core.is_owner_or_admin(_user.id) then
            raise exception 'invalid user';
        end if;        
            
        -- check if permalink is provided
        if core_validator.is_empty($1->>'permalink'::text) then
            _permalink := unaccent(replace(lower($1->>'name'),' ','_'));
        else
            _permalink := unaccent(replace(lower($1->>'permalink'),' ','_'));
        end if;

        -- put first status on project
        select jsonb_set($1::jsonb, '{status}'::text[], to_jsonb('draft'::text))
            into _refined;
        
        -- put generated permalink into refined json
        select jsonb_set(_refined, '{permalink}'::text[], to_jsonb(_permalink::text))
            into _refined;
        
        -- put current request ip into refined json
        select jsonb_set(_refined, '{current_ip}'::text[], to_jsonb(core.request_ip_address()))
            into _refined;

        -- check if is mode is provided and update when draft
        if not core_validator.is_empty($1->>'mode'::text) and _project.status = 'draft' then
            _refined := jsonb_set(_refined, '{mode}'::text[], to_jsonb($1->>'mode'::text));
        end if;

        if _is_creating then
            -- redefined refined json with project basic serializer
            select project_service._serialize_project_basic_data(_refined::json)::jsonb
                into _refined;
            
            if current_role = 'platform_user' then
                _external_id := ($1->>'external_id')::text;
            end if;

            -- insert project 
            insert into project_service.projects (
                external_id, platform_id, user_id, permalink, name, mode, data
            ) values (_external_id, core.current_platform_id(), _user.id, _permalink, ($1 ->> 'name')::text, ($1 ->> 'mode')::project_service.project_mode, _refined)
            returning * into _project;
            
            -- insert first version of project
            insert into project_service.project_versions (
                project_id, data
            ) values (_project.id, row_to_json(_project)::jsonb)
            returning * into _version;
        else
            -- generate basic struct with given data
            _refined := project_service._serialize_project_basic_data(_refined::json, _project.data::json)::jsonb;

            -- insert old version of project on new version
            insert into project_service.project_versions(project_id, data)
                values (_project.id, row_to_json(_project)::jsonb)
            returning * into _version;

            -- update project with new generated data
            update project_service.projects
                set mode = (_refined ->> 'mode')::project_service.project_mode, 
                name = (_refined ->> 'name')::text, 
                permalink = (_refined ->> 'permalink')::text,
                data = _refined
                where id = _project.id
                returning * into _project;
        end if;
        
        select json_build_object(
            'id', _project.id,
            'old_version_id', _version.id,
            'permalink', _project.permalink,
            'mode', _project.mode,
            'status', _project.status,
            'data', _project.data
        ) into _result;

        return _result;
    end;
$function$
;


CREATE OR REPLACE FUNCTION payment_service_api.pay(data json) RETURNS json
    LANGUAGE plpgsql
    AS $_$
        declare
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
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');
            
            -- check roles to define how user_id is set
            if current_role = 'platform_user' then
                _user_id := ($1 ->> 'user_id')::uuid;
                _external_id := ($1 ->> 'external_id')::uuid;
            else
                _user_id := core.current_user_id();
            end if;

            -- check if project exists on platform
            if ($1->>'project_id')::uuid is null 
                OR not core.project_exists_on_platform(($1->>'project_id')::uuid, core.current_platform_id()) then
                raise exception 'project not found on platform';
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
                        and id = ($1->>'project_id')::uuid
                    into _reward;
                    
                if _reward.id is null then
                    raise 'reward not found';
                end if;
                
                if ($1->>'amount'::decimal) < (_reward.data->>'minimum_value')::decimal then
                    raise 'payment amount is bellow of reward minimum %', (_reward.data->>'minimum_value')::decimal;
                end if;
            end if;

            -- fill ip address to received params
            _refined := jsonb_set(($1)::jsonb, '{current_ip}'::text[], to_jsonb(core.force_ip_address()::text));

            -- if user already has filled document_number/name/email should use then
            if not core_validator.is_empty((_user.data->>'name')::text) then
                _refined := jsonb_set(_refined, '{customer,name}', to_jsonb(_user.data->>'name'::text));
            else
                update community_service.users
                    set name = ($1->'customer'->>'name')::text
                    where id = _user.id;
            end if;

            if not core_validator.is_empty((_user.data->>'email')::text) then
                _refined := jsonb_set(_refined, '{customer,email}', to_jsonb(_user.data->>'email'::text));
            end if;

            if not core_validator.is_empty((_user.data->>'document_number')::text) then
                _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb(_user.data->>'document_number'::text));
            else
            select * from community_service.users;
                update community_service.users
                    set data = jsonb_set(data, '{document_number}'::text[], ($1->'customer'->>'document_number'))
                    where id = _user.id;            
            end if;
            
            -- fill with anonymous
            _refined := jsonb_set(_refined, '{anonymous}'::text[], to_jsonb(coalesce(($1->>'anonymous')::boolean, false)));

            -- generate a base structure to payment json
            _refined := (payment_service._serialize_payment_basic_data((_refined)::json))::jsonb;            
 -- if payment_method is credit_card should check for card_hash or card_id
            if _refined->>'payment_method'::text = 'credit_card' then
                -- fill with credit_card_owner_document
                _refined := jsonb_set(_refined, '{credit_card_owner_document}'::text[], to_jsonb(coalesce(($1->>'credit_card_owner_document')::text, '')));
                
                -- fill with is_international
                _refined := jsonb_set(_refined, '{is_international}'::text[], to_jsonb(coalesce(($1->>'is_international')::boolean, false)));

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

            -- insert payment in table
            insert into payment_service.catalog_payments (
                external_i, platform_id, project_id, user_id, reward_id, data, gateway
            ) values (
                _external_id,
                core.current_platform_id(),
                ($1->>'project_id')::uuid,
                _user_id,
                _reward.id,
                _refined,
                coalesce(($1->>'gateway')::text, 'pagarme')
            ) returning * into _payment;
            
            -- insert first payment version
            insert into payment_service.catalog_payment_versions (
                catalog_payment_id, data
            ) values ( _payment.id, _payment.data )
            returning * into _version;

            -- check if payment is a subscription to create one
            if ($1->>'subscription') is not null and ($1->>'subscription')::boolean  then
                insert into payment_service.subscriptions (
                    platform_id, project_id, user_id, checkout_data
                ) values (_payment.platform_id, _payment.project_id, _payment.user_id, payment_service._serialize_subscription_basic_data(_payment.data::json)::jsonb)
                returning * into _subscription;

                update payment_service.catalog_payments
                    set subscription_id = _subscription.id
                    where id = _payment.id;
            end if;

            -- build result json with payment_id and subscription_id
            select json_build_object(
                'id', _payment.id,
                'subscription_id', _subscription.id,
                'old_version_id', _version.id
            ) into _result;

            -- notify to backend processor via listen
            PERFORM pg_notify('process_payments_channel',
                json_build_object(
                    'id', _payment.id,
                    'subscription_id', _subscription.id,
                    'created_at', _payment.created_at::timestamp
                )::text
            );

            return _result;
        end;
    $_$;



