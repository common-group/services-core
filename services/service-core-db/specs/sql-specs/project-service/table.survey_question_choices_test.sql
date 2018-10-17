BEGIN;
    SELECT plan(3);

    -- check if table is present
    SELECT has_table('project_service'::name, 'survey_question_choices'::name);

    -- check primary key
    SELECT has_pk('project_service', 'survey_question_choices', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'survey_question_choices', 'survey_multiple_choice_question_id',
        'project_service', 'survey_multiple_choice_questions', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
