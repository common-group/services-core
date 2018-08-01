BEGIN;
    select plan(26);

    -- check if table is present
    SELECT has_table('payment_service'::name, 'catalog_payments'::name);

    -- check primary key
    SELECT has_pk('payment_service', 'catalog_payments', 'should have primary key');

    -- check column defaults
    SELECT col_default_is( 'payment_service', 'catalog_payments', 'id', 'uuid_generate_v4()', 'should generate uuid for catalog_payments(id)' );
    SELECT col_default_is( 'payment_service', 'catalog_payments', 'created_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'payment_service', 'catalog_payments', 'updated_at', 'now()', 'should fill updated_at with now' );
    SELECT col_default_is( 'payment_service', 'catalog_payments', 'common_contract_data', '{}', 'should fill common_contract_data with {}' );
    SELECT col_default_is( 'payment_service', 'catalog_payments', 'gateway_general_data', '{}', 'should fill gateway_general_data with {}' );
    SELECT col_default_is( 'payment_service', 'catalog_payments', 'status', 'pending', 'should fill status with pending' );

    -- check not nulls
    SELECT col_not_null('payment_service', 'catalog_payments', 'id', 'id should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'platform_id', 'platform_id should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'project_id', 'project_id should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'user_id', 'user_id should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'data', 'data should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'created_at', 'created_at should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'updated_at', 'updated_at should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'common_contract_data', 'common_contract_data should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'gateway_general_data', 'gateway_general_data should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'gateway', 'gateway should be not null');
    SELECT col_not_null('payment_service', 'catalog_payments', 'status', 'status should be not null');

    -- check unique indexes
    SELECT col_is_unique('payment_service', 'catalog_payments', ARRAY['platform_id', 'external_id'], 'external_id/platform_id should be unique');

    -- check foreign keys
    SELECT fk_ok( 
        'payment_service', 'catalog_payments', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'catalog_payments', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'catalog_payments', 'project_id',
        'project_service', 'projects', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'catalog_payments', 'reward_id',
        'project_service', 'rewards', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'catalog_payments', 'subscription_id',
        'payment_service', 'subscriptions', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'catalog_payments', 'contribution_id',
        'payment_service', 'contributions', 'id'
    );

    select * from finish();
ROLLBACK;
