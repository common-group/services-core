BEGIN;
    SELECT plan(5);

    -- check if table is present
    SELECT has_table('project_service'::name, 'reports'::name);

    -- check primary key
    SELECT has_pk('project_service', 'reports', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'reports', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok(
        'project_service', 'reports', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT fk_ok(
        'project_service', 'reports', 'project_id',
        'project_service', 'projects', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
