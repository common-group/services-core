BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql

    select plan(17);

    select function_returns(
        'payment_service_api', 'credit_card', ARRAY['json'], 'json'
    );

    prepare create_card as select * from payment_service_api.credit_card($1::json);

    create or replace function test_add_credit_card_as_platform()
    returns setof text language plpgsql as $$
        declare
            _card payment_service.credit_cards;
            _result json;
        begin
            set local role platform_user;
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            return next throws_like(
                'EXECUTE create_card(''{"card_hash": "", "user_id": "'||__seed_first_user_id()||'"}'')',
                'mising_card_hash',
                'raise error when card_hash is missing');

            return next throws_like(
                'EXECUTE create_card(''{"card_hash": "some_hash"}'')',
                'user not found',
                'raise error when user_id is missing');

            _result := payment_service_api.credit_card(json_build_object(
                'card_hash', 'some_card_hash_platform',
                'user_id', __seed_first_user_id()
            ));

            return next ok((_result->>'id')::uuid is not null, 'should generate new payment');
            select * from payment_service.credit_cards where id = (_result ->> 'id')::uuid
                into _card;

            return next is(_card.user_id, __seed_first_user_id());
            return next is(_card.data ->> 'card_hash', 'some_card_hash_platform');
            return next is(_card.platform_id, __seed_platform_id());
            return next is(_card.saved_in_process, false);

            return next throws_like(
                'EXECUTE create_card(''{"card_hash": "some_card_hash_platform", "user_id": "'||__seed_first_user_id()||'"}'')',
                'card_hash_should_be_unique',
                'cannot generate credit card with same card_hash');
        end;
    $$;
    select * from test_add_credit_card_as_platform();

    create or replace function test_add_credit_card_as_scoped()
    returns setof text language plpgsql as $$
        declare
            _card payment_service.credit_cards;
            _result json;
        begin
            set local role scoped_user;
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            return next throws_like(
                'select * from payment_service_api.credit_card(''{"card_hash": ""}'')',
                'mising_card_hash',
                'raise error when card_hash is missing');

            _result := payment_service_api.credit_card('{"card_hash": "some_card_hash", "save": "true"}');

            return next ok((_result->>'id')::uuid is not null, 'should generate new payment');
            select * from payment_service.credit_cards where id = (_result ->> 'id')::uuid
                into _card;

            return next is(_card.user_id, __seed_first_user_id());
            return next is(_card.data ->> 'card_hash', 'some_card_hash');
            return next is(_card.platform_id, __seed_platform_id());
            return next is(_card.saved_in_process, true);

            return next throws_like(
                'select * from payment_service_api.credit_card(''{"card_hash": "some_card_hash"}'')',
                'card_hash_should_be_unique',
                'cannot generate credit card with same card_hash');
        end;
    $$;
    select * from test_add_credit_card_as_scoped();

    create or replace function test_add_credit_card_as_anon()
    returns setof text language plpgsql as $$
        declare
            _card payment_service.credit_cards;
        begin
            set local role anonymous;
            EXECUTE 'set local "request.header.platform-code" to '''||__seed_platform_token()||'''';

            return next throws_like(
                'select * from payment_service_api.credit_card(''{"card_hash": "some_card_hash"}'')',
                '%insufficient_privilege',
                'anonymous cannot perform upgrade_subscription operation');
        end;
    $$;
    select * from test_add_credit_card_as_anon();

    select * from finish();
ROLLBACK;
