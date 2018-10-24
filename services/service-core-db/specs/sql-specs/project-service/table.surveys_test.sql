BEGIN;
    SELECT plan(3);

    -- check if table is present
    SELECT has_table('project_service'::name, 'surveys'::name);

    -- check primary key
    SELECT has_pk('project_service', 'surveys', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'surveys', 'reward_id',
        'project_service', 'rewards', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
