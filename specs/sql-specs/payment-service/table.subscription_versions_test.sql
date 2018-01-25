BEGIN;
    SELECT plan(12);

    -- check if table is present
    SELECT has_table('payment_service'::name, 'subscription_versions'::name);

    -- check primary key
    SELECT has_pk('payment_service', 'subscription_versions', 'should have primary key');

    -- check column defaults
    SELECT col_default_is( 'payment_service', 'subscription_versions', 'id', 'uuid_generate_v4()', 'should generate uuid for id' );
    SELECT col_default_is( 'payment_service', 'subscription_versions', 'data', '{}', 'should fill data with default json {}' );
    SELECT col_default_is( 'payment_service', 'subscription_versions', 'created_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'payment_service', 'subscription_versions', 'updated_at', 'now()', 'should fill created_at with now' );

    -- check not nulls
    SELECT col_not_null('payment_service', 'subscription_versions', 'id', 'id should be not null');
    SELECT col_not_null('payment_service', 'subscription_versions', 'subscription_id', 'subscription_id should be not null');
    SELECT col_not_null('payment_service', 'subscription_versions', 'data', 'data should be not null');
    SELECT col_not_null('payment_service', 'subscription_versions', 'created_at', 'created_at should be not null');
    SELECT col_not_null('payment_service', 'subscription_versions', 'updated_at', 'updated_at should be not null');

    -- check foreign keys
    SELECT fk_ok( 
        'payment_service', 'subscription_versions', 'subscription_id',
        'payment_service', 'subscriptions', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
