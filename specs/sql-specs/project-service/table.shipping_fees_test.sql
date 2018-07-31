BEGIN;
    SELECT plan(4);

    -- check if table is present
    SELECT has_table('project_service'::name, 'shipping_fees'::name);

    -- check primary key
    SELECT has_pk('project_service', 'shipping_fees', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'project_service', 'shipping_fees', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok(
        'project_service', 'shipping_fees', 'reward_id',
        'project_service', 'rewards', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
