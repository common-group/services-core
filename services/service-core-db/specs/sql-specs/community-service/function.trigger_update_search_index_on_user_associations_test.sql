BEGIN;

    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(2);

    select has_function('community_service', 'trigger_update_search_index_on_user_associations', 'check if trigger function exists');

    create or replace function test_trigger()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _current_subscription_search_index tsvector;
        begin
            -- generate subscription
            insert into payment_service.subscriptions
            (status, created_at, platform_id, user_id, project_id, checkout_data) 
            values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb)
            returning * into _subscription;

            _current_subscription_search_index := _subscription.search_index;

            update community_service.users as u
                set email = 'new_email@email.com'
            where u.id = __seed_first_user_id();
            -- reload subscription
            select * from payment_service.subscriptions where id = _subscription.id
            into _subscription;

            return next is(_subscription.search_index <> _current_subscription_search_index, true, 'should update search_index when update user');

        end;
    $$;

    select * from test_trigger();
ROLLBACK;
