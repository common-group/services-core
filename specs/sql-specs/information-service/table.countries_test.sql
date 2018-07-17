BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('information_service'::name, 'countries'::name);

    -- check primary key
    SELECT has_pk('information_service', 'countries', 'should have primary key');

    -- check not nulls
    SELECT col_not_null('information_service', 'countries', 'name', 'name should be not null');

    -- check foreign keys
    SELECT fk_ok(
        'information_service', 'countries', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
