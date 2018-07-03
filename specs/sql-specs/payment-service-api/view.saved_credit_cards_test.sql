BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql
    \i /specs/sql-support/clean_sets_helpers.sql

    select plan(18);

    select has_view('payment_service_api', 'credit_cards', 'check if has view');

    create or replace function test_credit_cards_with_platform()
    returns setof text language plpgsql as $$
		declare
			_result payment_service_api.credit_cards;
		begin
			set local role 'platform_user';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

			select * from payment_service_api.saved_credit_cards
				limit 1
				into _result;

			return next is (_result, null, 'should not found any card when not saved in process');
			perform clean_sets();

			update payment_service.credit_cards
				set saved_in_process = true
				where id = __seed_first_user_credit_card_id();

			set local role 'platform_user';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

			select * from payment_service_api.saved_credit_cards
				limit 1
				into _result;

			return next is(_result.user_id, __seed_first_user_id());
			return next is(_result.id, __seed_first_user_credit_card_id());
			return next ok(_result.gateway_data->>'id' is not null, 'can see gateway card_id');
			return next ok(_result.gateway_data->>'fingerprint' is not null, 'can see card fingerprint');
			return next is(_result.gateway_data->>'brand', 'visa');

			-- rollback card to not saved in process to next test
			perform clean_sets();
			update payment_service.credit_cards
				set saved_in_process = false
				where id = __seed_first_user_credit_card_id();
		end;
	$$;
	select * from test_credit_cards_with_platform();

    create or replace function test_credit_cards_with_scoped()
    returns setof text language plpgsql as $$
		declare
			_result payment_service_api.credit_cards;
		begin
			set local role 'scoped_user';
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

			select * from payment_service_api.saved_credit_cards
				limit 1
				into _result;

			return next is (_result, null, 'should not found any card when not saved in process');
			perform clean_sets();

			update payment_service.credit_cards
				set saved_in_process = true
				where id = __seed_first_user_credit_card_id();

			set local role 'scoped_user';
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

			select * from payment_service_api.saved_credit_cards
				limit 1
				into _result;

			return next is(_result.user_id, __seed_first_user_id());
			return next is(_result.id, __seed_first_user_credit_card_id());
			return next is(_result.gateway_data->>'id', null);
			return next is(_result.gateway_data->>'fingerprint', null);
			return next is(_result.gateway_data->>'brand', 'visa');

			-- try acess with another user that not have any card
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_second_user_id()||'''';

			select * from payment_service_api.credit_cards
				limit 1
				into _result;

			return next is(_result.user_id, null);
			return next is(_result.id, null);

			select * from payment_service_api.saved_credit_cards
				where user_id = __seed_first_user_id()
				limit 1
				into _result;

			return next is(_result.user_id, null);
			return next is(_result.id, null);
		end;
	$$;
	select * from test_credit_cards_with_scoped();

    create or replace function test_credit_cards_with_anon()
    returns setof text language plpgsql as $$
		declare
		begin
			set local role 'anonymous';
			EXECUTE 'set local "request.header.platform-code" to '''||__seed_platform_token()||'''';


			return next throws_like(
				'select * from payment_service_api.saved_credit_cards',
				'%permission denied%',
				'cant select on view using anonymous'
			);
		end;
	$$;
	select * from test_credit_cards_with_anon();

    select * from finish();
ROLLBACK;
