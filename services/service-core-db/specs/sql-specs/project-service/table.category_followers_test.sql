BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('project_service'::name, 'category_followers'::name);

    -- check primary key
    SELECT has_pk('project_service', 'category_followers', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'category_followers', 'category_id',
        'project_service', 'categories', 'id'
    );

    SELECT fk_ok(
        'project_service', 'category_followers', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
