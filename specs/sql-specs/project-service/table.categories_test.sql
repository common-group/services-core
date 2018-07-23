BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('project_service'::name, 'categories'::name);

    -- check primary key
    SELECT has_pk('project_service', 'categories', 'should have primary key');

    -- check not nulls
    SELECT col_not_null('project_service', 'categories', 'name', 'name should be not null');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'categories', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
