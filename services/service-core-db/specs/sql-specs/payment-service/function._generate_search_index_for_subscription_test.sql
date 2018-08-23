BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql

    select plan(5);

    select has_function('payment_service', '_generate_search_index_for_subscription', 'check is function exists');

    create or replace function test_function()
    returns setof text language plpgsql as $$
        declare
            _subscription payment_service.subscriptions;
            _old_generated_tsvector tsvector;
            _gen_tsvector tsvector;

            _search_result payment_service.subscriptions;
        begin
            insert into payment_service.subscriptions
            (status, created_at, platform_id, user_id, project_id, checkout_data) 
            values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), __json_data_payment('{"payment_method": "credit_card", "anonymous": true}'::json)::jsonb)
            returning * into _subscription;

            _old_generated_tsvector := _subscription.search_index;
            _subscription.search_index := null;

            return next is(_subscription.search_index, null, 'empty generated search index via trigger');

            _gen_tsvector := payment_service._generate_search_index_for_subscription(_subscription);

            return next is(_gen_tsvector, _old_generated_tsvector, 'should generate the same tsvector');

            select * from payment_service.subscriptions
                where search_index @@ plainto_tsquery('portuguese', (select data->>'name'::text from  community_service.users where id = __seed_first_user_id()))
            into _search_result;

            return next is(_search_result.id, _subscription.id, 'should find subscription searching by user name');

            select * from payment_service.subscriptions
                where search_index @@ plainto_tsquery('portuguese', (select email from  community_service.users where id = __seed_first_user_id()))
            into _search_result;
            return next is(_search_result.id, _subscription.id, 'should find subscription searching by user email');
        end;
    $$;
    select * from test_function();

ROLLBACK;
