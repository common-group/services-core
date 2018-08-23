-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service_api.credit_card(data json)
 RETURNS json
 LANGUAGE plpgsql
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

        insert into payment_service.credit_cards (platform_id, user_id, gateway, data)
            values (_user.platform_id, _user.id, 'pagarme', json_build_object(
                'card_hash', ($1->>'card_hash')::text
            )::jsonb)
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
