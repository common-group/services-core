BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('project_service'::name, 'reminders'::name);

    -- check primary key
    SELECT has_pk('project_service', 'reminders', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'reminders', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT fk_ok(
        'project_service', 'reminders', 'project_id',
        'project_service', 'projects', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
