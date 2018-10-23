BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('project_service'::name, 'survey_open_question_answers'::name);

    -- check primary key
    SELECT has_pk('project_service', 'survey_open_question_answers', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'survey_open_question_answers', 'survey_open_question_id',
        'project_service', 'survey_open_questions', 'id'
    );

    SELECT fk_ok(
        'project_service', 'survey_open_question_answers', 'contribution_id',
        'payment_service', 'contributions', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
