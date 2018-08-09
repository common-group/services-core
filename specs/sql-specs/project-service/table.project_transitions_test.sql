BEGIN;
    SELECT plan(14);

    -- check if table is present
    SELECT has_table('project_service'::name, 'project_transitions'::name);

    -- check primary key
    SELECT has_pk('project_service', 'project_transitions', 'should have primary key');

    -- check column defaults
    SELECT col_default_is( 'project_service', 'project_transitions', 'id', 'uuid_generate_v4()', 'should generate uuid for id' );
    SELECT col_default_is( 'project_service', 'project_transitions', 'metadata', '{}', 'should fill data with default json {}' );
    SELECT col_default_is( 'project_service', 'project_transitions', 'created_at', 'now()', 'should fill created_at with now' );
    SELECT col_default_is( 'project_service', 'project_transitions', 'updated_at', 'now()', 'should fill updated_at with now' );

    -- check not nulls
    SELECT col_not_null('project_service', 'project_transitions', 'id', 'id should be not null');
    SELECT col_not_null('project_service', 'project_transitions', 'project_id', 'project_id should be not null');
    SELECT col_not_null('project_service', 'project_transitions', 'metadata', 'data should be not null');
    SELECT col_not_null('project_service', 'project_transitions', 'created_at', 'created_at should be not null');
    SELECT col_not_null('project_service', 'project_transitions', 'updated_at', 'updated_at should be not null');
    SELECT col_not_null('project_service', 'project_transitions', 'sort_key', 'sort_key should be not null');
    SELECT col_not_null('project_service', 'project_transitions', 'most_recent', 'most_recent should be not null');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'project_transitions', 'project_id',
        'project_service', 'projects', 'id'
    );

    SELECT * FROM finish();
ROLLBACK;
