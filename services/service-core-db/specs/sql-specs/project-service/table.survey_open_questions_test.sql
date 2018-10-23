BEGIN;
    SELECT plan(3);

    -- check if table is present
    SELECT has_table('project_service'::name, 'survey_open_questions'::name);

    -- check primary key
    SELECT has_pk('project_service', 'survey_open_questions', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'survey_open_questions', 'survey_id',
        'project_service', 'surveys', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
