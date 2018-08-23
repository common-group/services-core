BEGIN;
    select plan(23);

    -- check if table is present
    SELECT has_table('payment_service'::name, 'contributions'::name);

    -- check primary key
    SELECT has_pk('payment_service', 'contributions', 'should have primary key');

    -- check column defaults
    SELECT col_default_is( 'payment_service', 'contributions', 'id', 'uuid_generate_v4()', 'should generate uuid for contributions(id)' );
    SELECT col_default_is( 'payment_service', 'contributions', 'created_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'payment_service', 'contributions', 'updated_at', 'now()', 'should fill updated_at with now' );
    SELECT col_default_is( 'payment_service', 'contributions', 'delivery_status', 'undelivered', 'should fill delivery_status with undelivered' );
    SELECT col_default_is( 'payment_service', 'contributions', 'anonymous', false, 'should fill anonymous with false' );
    SELECT col_default_is( 'payment_service', 'contributions', 'notified_finish', false, 'should fill notified_finish with false' );

    -- check not nulls
    SELECT col_not_null('payment_service', 'contributions', 'id', 'id should be not null');
    SELECT col_not_null('payment_service', 'contributions', 'platform_id', 'platform_id should be not null');
    SELECT col_not_null('payment_service', 'contributions', 'project_id', 'project_id should be not null');
    SELECT col_not_null('payment_service', 'contributions', 'user_id', 'user_id should be not null');
    SELECT col_not_null('payment_service', 'contributions', 'data', 'data should be not null');
    SELECT col_not_null('payment_service', 'contributions', 'created_at', 'created_at should be not null');
    SELECT col_not_null('payment_service', 'contributions', 'updated_at', 'updated_at should be not null');
    SELECT col_not_null('payment_service', 'contributions', 'value', 'value should be not null');

    -- check foreign keys
    SELECT fk_ok( 
        'payment_service', 'contributions', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'contributions', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'contributions', 'project_id',
        'project_service', 'projects', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'contributions', 'reward_id',
        'project_service', 'rewards', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'contributions', 'address_id',
        'community_service', 'addresses', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'contributions', 'shipping_fee_id',
        'project_service', 'shipping_fees', 'id'
    );

    SELECT fk_ok( 
        'payment_service', 'contributions', 'origin_id',
        'analytics_service', 'origins', 'id'
    );

    select * from finish();
ROLLBACK;
