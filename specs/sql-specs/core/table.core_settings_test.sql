BEGIN;
SELECT plan(7);

-- check table presence
SELECT has_table('core'::name, 'core_settings'::name);

-- check column defaults
SELECT col_default_is( 'core', 'core_settings', 'id', 'uuid_generate_v4()', 'should generate uuid fo users(id)' );

-- check not nulls
SELECT col_not_null('core', 'core_settings', 'name', 'name should be not null');
SELECT col_not_null('core', 'core_settings', 'value', 'value should be not null');
SELECT col_not_null('core', 'core_settings', 'created_at', 'created_at should be not null');
SELECT col_not_null('core', 'core_settings', 'updated_at', 'updated_at should be not null');

-- check column constraints / indexes
SELECT col_is_unique('core', 'core_settings', 'name', 'name should be unique');


-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
