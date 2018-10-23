BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('project_service'::name, 'survey_address_answers'::name);

    -- check primary key
    SELECT has_pk('project_service', 'survey_address_answers', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'survey_address_answers', 'contribution_id',
        'payment_service', 'contributions', 'id'
    );

    SELECT fk_ok(
        'project_service', 'survey_address_answers', 'address_id',
        'community_service', 'addresses', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
