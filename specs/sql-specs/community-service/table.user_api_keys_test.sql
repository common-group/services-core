BEGIN;
SELECT plan(8);

-- check table presence
SELECT has_table('community_service'::name, 'user_api_keys'::name);

-- check column defaults
SELECT col_default_is( 'community_service', 'user_api_keys', 'id', 'uuid_generate_v4()', 'should generate uuid' );

-- check not nulls
SELECT col_not_null('community_service', 'user_api_keys', 'platform_id', 'platform id');
SELECT col_not_null('community_service', 'user_api_keys', 'user_id', 'user id');
SELECT col_not_null('community_service', 'user_api_keys', 'token', 'token');
SELECT col_not_null('community_service', 'user_api_keys', 'created_at', 'created_at');

-- check fk
SELECT fk_ok(
    'community_service', 'user_api_keys', 'platform_id',
    'platform_service', 'platforms', 'id'
);

SELECT fk_ok(
    'community_service', 'user_api_keys', 'user_id',
    'community_service', 'users', 'id'
);


-- check column constraints / indexes
-- SELECT col_is_unique('core', 'core_settings', 'name', 'name should be unique');


-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
