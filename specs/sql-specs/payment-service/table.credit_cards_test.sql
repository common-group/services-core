BEGIN;
    SELECT plan(18);

    -- check if table is present
    SELECT has_table('payment_service'::name, 'credit_cards'::name);

    -- check primary key
    SELECT has_pk('payment_service', 'credit_cards', 'should have primary key');

    -- check column defaults
    SELECT col_default_is( 'payment_service', 'credit_cards', 'id', 'uuid_generate_v4()', 'should generate uuid for id' );
    SELECT col_default_is( 'payment_service', 'credit_cards', 'gateway_data', '{}', 'should fill gateway_data with default json {}' );
    SELECT col_default_is( 'payment_service', 'credit_cards', 'data', '{}', 'should fill data with default json {}' );
    SELECT col_default_is( 'payment_service', 'credit_cards', 'created_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'payment_service', 'credit_cards', 'updated_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'payment_service', 'credit_cards', 'saved_in_process', 'false', 'default value for saved_in_process should be false' );

    -- check not nulls
    SELECT col_not_null('payment_service', 'credit_cards', 'id', 'id should be not null');
    SELECT col_not_null('payment_service', 'credit_cards', 'platform_id', 'platform_id should be not null');
    SELECT col_not_null('payment_service', 'credit_cards', 'user_id', 'user_id should be not null');
    SELECT col_not_null('payment_service', 'credit_cards', 'gateway', 'gateway should be not null');
    SELECT col_not_null('payment_service', 'credit_cards', 'gateway_data', 'gateway_data should be not null');
    SELECT col_not_null('payment_service', 'credit_cards', 'data', 'data should be not null');
    SELECT col_not_null('payment_service', 'credit_cards', 'created_at', 'created_at should be not null');
    SELECT col_not_null('payment_service', 'credit_cards', 'updated_at', 'updated_at should be not null');

    -- check foreign keys
    SELECT fk_ok( 
        'payment_service', 'credit_cards', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'credit_cards', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
