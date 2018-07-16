BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('project_service'::name, 'cancelations'::name);

    -- check primary key
    SELECT has_pk('project_service', 'cancelations', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'cancelations', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok(
        'project_service', 'cancelations', 'project_id',
        'project_service', 'projects', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
