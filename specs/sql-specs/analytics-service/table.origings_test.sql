BEGIN;
    SELECT plan(2);

    -- check if table is present
    SELECT has_table('analytics_service'::name, 'origins'::name);

    -- check primary key
    SELECT has_pk('analytics_service', 'origins', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'analytics_service', 'origins', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
