begin;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql
    \i /specs/sql-support/payment_json_build_helpers.sql
    \i /specs/sql-support/clean_sets_helpers.sql

    select plan(7);

    select function_returns('project_service_api', 'cancel_project', '{uuid}', 'json', 'should be defined');

    prepare cancel_project as select * from project_service_api.cancel_project($1::uuid);

    create or replace function test_cancel_project()
    returns setof text language plpgsql
    as $$
        declare
            _project project_service.projects;
            _subscription payment_service.subscriptions;
            _result json;
        begin
            select * from project_service.projects
                where id = __seed_project_id()
                into _project;

            insert into payment_service.subscriptions
                (status, created_at, platform_id, user_id, project_id, checkout_data) 
                values ('active', (now() - '1 month'::interval), __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), '{}'::jsonb)
                returning * into _subscription;

            -- test cancel project with anonymous
            set local role anonymous;
            set local "request.header.platform-code" to 'a28be766-bb36-4821-82ec-768d2634d78b';

            return next throws_matching(
                'EXECUTE cancel_project('''||_project.id||''')',
                'insufficient_privilege',
                'anon cant call cancel_project'
            );
            perform clean_sets();

            -- test cancel project with scoped user
            set local role scoped_user;
            set local "request.header.x-forwarded-for" to '127.0.0.1'; -- ip header should be found
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';
            EXECUTE 'set local "request.jwt.claim.user_id" to '''||__seed_first_user_id()||'''';

            return next throws_matching(
                'EXECUTE cancel_project('''||_project.id||''')',
                'insufficient_privilege',
                'anon cant call cancel_project'
            );
            perform clean_sets();

            -- test cancel project with platform_user
            set local role platform_user;
            set local "request.header.x-forwarded-for" to '127.0.0.1'; -- ip header should be found
            EXECUTE 'set local "request.jwt.claim.platform_token" to '''||__seed_platform_token()||'''';

            _result := project_service_api.cancel_project(_project.id);

            return next is((_result->>'id')::uuid, _project.id, 'should have project id on return json');
            return next is((_result->>'total_canceled_subscriptions')::integer, 1, 'should have a count of canceled subscriptions');
            perform clean_sets();

            select * from payment_service.subscriptions s
                where s.id = _subscription.id
            into _subscription;

            return next is(_subscription.status, 'canceled', 'subscription should be canceled');
            return next is((
                    select count(1) 
                    from notification_service.notifications n
                        join notification_service.notification_global_templates ngt on ngt.label = 'canceled_subscription' and ngt.id = n.notification_global_template_id
                    where n.user_id = _subscription.user_id
                        and (n.data->'relations'->>'subscription_id')::uuid = _subscription.id
            )::integer, 0::integer, 'should not deliver canceled notification to subscriber when project is refused');
        end;
        $$;
    select test_cancel_project();

    select * from finish();
rollback;
