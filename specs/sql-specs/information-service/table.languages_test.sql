BEGIN;
    SELECT plan(5);

    -- check if table is present
    SELECT has_table('information_service'::name, 'languages'::name);

    -- check primary key
    SELECT has_pk('information_service', 'languages', 'should have primary key');

    -- check not nulls
    SELECT col_not_null('information_service', 'languages', 'name', 'name should be not null');
    SELECT col_not_null('information_service', 'languages', 'code', 'code should be not null');

    -- check foreign keys
    SELECT fk_ok(
        'information_service', 'languages', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
