BEGIN;
    SELECT plan(5);

    -- check if table is present
    SELECT has_table('information_service'::name, 'cities'::name);

    -- check primary key
    SELECT has_pk('information_service', 'cities', 'should have primary key');

    -- check not nulls
    SELECT col_not_null('information_service', 'cities', 'name', 'name should be not null');

    -- check foreign keys
    SELECT fk_ok(
        'information_service', 'cities', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok(
        'information_service', 'cities', 'state_id',
        'information_service', 'states', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
