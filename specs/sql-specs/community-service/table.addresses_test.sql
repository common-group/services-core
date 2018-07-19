BEGIN;
    SELECT plan(5);

    -- check if table is present
    SELECT has_table('community_service'::name, 'addresses'::name);

    -- check primary key
    SELECT has_pk('community_service', 'addresses', 'should have primary key');

    -- check foreign keys
    SELECT fk_ok(
        'community_service', 'addresses', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok(
        'community_service', 'addresses', 'country_id',
        'information_service', 'countries', 'id'
    );

    SELECT fk_ok(
        'community_service', 'addresses', 'state_id',
        'information_service', 'states', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
