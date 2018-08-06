-- Start transaction and plan the tests.
BEGIN;
    -- insert seed data for basic user/platform/project/reward
    \i /specs/sql-support/insert_platform_user_project.sql

    SELECT plan(3);

    SELECT function_returns(
        'payment_service', 'is_confirmed', ARRAY['payment_service.contributions'], 'boolean'
    );

    CREATE OR REPLACE FUNCTION test_is_confirmed()
    returns setof text language plpgsql
    as $$
        declare
            _contribution payment_service.contributions;
            _unconfirmed_contribution payment_service.contributions;
            _transition payment_service.payment_status_transitions;
        begin
            -- generate contribution
            insert into payment_service.contributions
                (platform_id, user_id, project_id, value, payer_email) 
                values (__seed_platform_id(), __seed_first_user_id(), __seed_project_id(), 100, 'foo@bar.com')
                returning * into _contribution;

            insert into payment_service.contributions
                (platform_id, user_id, project_id, value, payer_email) 
                values (__seed_platform_id(), __seed_first_user_id(), __seed_project_id(), 100, 'foo@bar.com')
                returning * into _unconfirmed_contribution;
            -- generate payment
            insert into payment_service.catalog_payments
                (gateway, contribution_id, platform_id, user_id, project_id, status, data) 
                values ('pagarme', _contribution.id, __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), 'paid', '{}');

            insert into payment_service.catalog_payments
                (gateway, contribution_id, platform_id, user_id, project_id, status, data) 
                values ('pagarme', _unconfirmed_contribution.id, __seed_platform_id(), __seed_first_user_id(), __seed_project_id(), 'refunded', '{}');

            return next ok(payment_service.is_confirmed(_contribution.*) is true, 'expect to be true when payment was paid');
            return next ok(payment_service.is_confirmed(_unconfirmed_contribution.*) is false, 'expect to be false if payment is refunded');
        end;
    $$;

    select test_is_confirmed();

    SELECT * FROM finish();
ROLLBACK;
