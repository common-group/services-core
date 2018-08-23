BEGIN;
SELECT plan(3);

SELECT has_table('platform_service'::name, 'platforms'::name);
SELECT col_default_is( 'platform_service', 'platforms', 'id', 'uuid_generate_v4()', 'should generate uuid for platforms(id)' );
SELECT col_is_unique('platform_service', 'platforms', 'token',  'platform token should be unique');

SELECT * FROM finish();
ROLLBACK;
