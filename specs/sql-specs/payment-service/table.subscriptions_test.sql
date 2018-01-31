BEGIN;
    SELECT plan(21);

    -- check if table is present
    SELECT has_table('payment_service'::name, 'subscriptions'::name);

    -- check primary key
    SELECT has_pk('payment_service', 'subscriptions', 'should have primary key');

    -- check column defaults
    SELECT col_default_is( 'payment_service', 'subscriptions', 'id', 'uuid_generate_v4()', 'should generate uuid for subscriptions(id)' );
    SELECT col_default_is( 'payment_service', 'subscriptions', 'status', 'started', 'should default value for status is started' );
    SELECT col_default_is( 'payment_service', 'subscriptions', 'created_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'payment_service', 'subscriptions', 'updated_at', 'now()', 'should fill updated_at with now' );
    SELECT col_default_is( 'payment_service', 'subscriptions', 'checkout_data', '{}', 'should fill checkout_data with {}' );


    -- check not nulls
    SELECT col_not_null('payment_service', 'subscriptions', 'id', 'id should be not null');
    SELECT col_not_null('payment_service', 'subscriptions', 'platform_id', 'platform_id should be not null');
    SELECT col_not_null('payment_service', 'subscriptions', 'project_id', 'project_id should be not null');
    SELECT col_not_null('payment_service', 'subscriptions', 'user_id', 'user_id should be not null');
    SELECT col_not_null('payment_service', 'subscriptions', 'status', 'status should be not null');
    SELECT col_not_null('payment_service', 'subscriptions', 'checkout_data', 'checkout_data should be not null');
    SELECT col_not_null('payment_service', 'subscriptions', 'created_at', 'created_at should be not null');
    SELECT col_not_null('payment_service', 'subscriptions', 'updated_at', 'updated_at should be not null');


    -- check foreign keys
    SELECT fk_ok( 
        'payment_service', 'subscriptions', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'subscriptions', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'subscriptions', 'project_id',
        'project_service', 'projects', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'subscriptions', 'reward_id',
        'project_service', 'rewards', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'subscriptions', 'credit_card_id',
        'payment_service', 'credit_cards', 'id'
    );

    select has_trigger(
        'payment_service',
        'subscriptions',
        'subscription_update_search_index',
        'should have a trigger to set search index on insert or update'
    );

    SELECT * FROM finish();
ROLLBACK;
