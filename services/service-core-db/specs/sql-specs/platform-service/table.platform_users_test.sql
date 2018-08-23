BEGIN;
SELECT plan(4);

SELECT has_table('platform_service'::name, 'platform_users'::name);
SELECT col_default_is( 'platform_service', 'platform_users', 'id', 'uuid_generate_v4()', 'should generate uuid fo platform_api_keys(id)');

SELECT fk_ok( 
    'platform_service',
    'platform_users',
    'platform_id',
    'platform_service',
    'platforms',
    'id'
);

SELECT fk_ok( 
    'platform_service',
    'platform_users',
    'user_id',
    'platform_service',
    'users',
    'id'
);

-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
