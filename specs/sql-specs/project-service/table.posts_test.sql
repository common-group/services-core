BEGIN;
    SELECT plan(17);

    -- check if table is present
    SELECT has_table('project_service'::name, 'posts'::name);

    -- check primary key
    SELECT has_pk('project_service', 'posts', 'should have primary key');

    -- check column defaults
    SELECT col_default_is( 'project_service', 'posts', 'id', 'uuid_generate_v4()', 'should generate uuid for id' );
    SELECT col_default_is( 'project_service', 'posts', 'data', '{}', 'should fill data with default json {}' );
    SELECT col_default_is( 'project_service', 'posts', 'created_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'project_service', 'posts', 'updated_at', 'now()', 'should fill updated_at with now' );
    SELECT col_default_is( 'project_service', 'posts', 'recipients', 'backers', 'should fill recipients with backers' );

    -- check not nulls
    SELECT col_not_null('project_service', 'posts', 'id', 'id should be not null');
    SELECT col_not_null('project_service', 'posts', 'project_id', 'project_id should be not null');
    SELECT col_not_null('project_service', 'posts', 'data', 'data should be not null');
    SELECT col_not_null('project_service', 'posts', 'created_at', 'created_at should be not null');
    SELECT col_not_null('project_service', 'posts', 'updated_at', 'updated_at should be not null');
    SELECT col_not_null('project_service', 'posts', 'title', 'title should be not null');
    SELECT col_not_null('project_service', 'posts', 'comment_html', 'comment_html should be not null');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'posts', 'project_id',
        'project_service', 'projects', 'id'
    );


    SELECT fk_ok(
        'project_service', 'posts', 'reward_id',
        'project_service', 'rewards', 'id'
    );

    SELECT fk_ok(
        'project_service', 'posts', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
