-- Start transaction and plan the tests.
BEGIN;
SELECT plan(11);

-- check tables
SELECT has_table('platform_service'::name, 'users'::name);
SELECT has_table('platform_service'::name, 'platforms'::name);
SELECT has_table('platform_service'::name, 'platform_users'::name);
SELECT has_table('platform_service'::name, 'platform_api_keys'::name);

-- check for defaults
SELECT col_default_is( 'platform_service', 'platforms', 'id', 'uuid_generate_v4()', 'should generate uuid for platforms(id)' );
SELECT col_default_is( 'platform_service', 'users', 'id', 'uuid_generate_v4()', 'should generate uuid fo users(id)' );
SELECT col_default_is( 'platform_service', 'platform_users', 'id', 'uuid_generate_v4()', 'should generate uuid for platform_users(id)' );
SELECT col_default_is( 'platform_service', 'platform_api_keys', 'id', 'uuid_generate_v4()', 'should generate uuid fo platform_api_keys(id)');

-- check all indexes
SELECT col_is_unique('platform_service', 'platforms', 'token',  'platform token should be unique');
SELECT col_is_unique('platform_service', 'platform_users', '{user_id, platform_id}'::text[],  'platform user should be unique via user_id/platform_id');

-- check all foreign keys on platform tables
SELECT fk_ok( 
    'platform_service',
    'platform_api_keys',
    'platform_id',
    'platform_service',
    'platforms',
    'id'
);
-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
