BEGIN;

    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(2);

    select has_function('payment_service', 'trigger_update_search_index_on_subscription', 'check if trigger function exists');

    create or replace function test_trigger()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
            (status, created_at, platform_id, user_id, project_id, checkout_data) 
            values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb)
            returning * into _subscription;

            return next is(_subscription.search_index is not null, true, 'shoud generate a search index when create subscription');

        end;
    $$;

    select * from test_trigger();
ROLLBACK;
