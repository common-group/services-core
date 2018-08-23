BEGIN;
    SELECT plan(6);

    -- check if table is present
    SELECT has_table('community_service'::name, 'direct_messages'::name);

    -- check primary key
    SELECT has_pk('community_service', 'direct_messages', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'community_service', 'direct_messages', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok(
        'community_service', 'direct_messages', 'user_id',
        'community_service', 'users', 'id'
    );


    SELECT fk_ok(
        'community_service', 'direct_messages', 'to_user_id',
        'community_service', 'users', 'id'
    );

    SELECT fk_ok(
        'community_service', 'direct_messages', 'project_id',
        'project_service', 'projects', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
