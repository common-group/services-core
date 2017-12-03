BEGIN;
SELECT plan(3);

SELECT has_table('platform_service'::name, 'platform_api_keys'::name);
SELECT col_default_is( 'platform_service', 'platform_api_keys', 'id', 'uuid_generate_v4()', 'should generate uuid fo platform_api_keys(id)');

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
