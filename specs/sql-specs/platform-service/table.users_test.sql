BEGIN;
SELECT plan(3);

SELECT has_table('platform_service'::name, 'users'::name);
SELECT col_default_is( 'platform_service', 'users', 'id', 'uuid_generate_v4()', 'should generate uuid fo users(id)' );
SELECT col_is_unique('platform_service', 'users', 'email', 'email should be unique');
-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
