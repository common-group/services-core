BEGIN;
    SELECT plan(8);

    -- check if table is present
    SELECT has_table('community_service'::name, 'bank_accounts'::name);

    -- check primary key
    SELECT has_pk('community_service', 'bank_accounts', 'should have primary key');

    -- check not nulls
    SELECT col_not_null('community_service', 'bank_accounts', 'account', 'account should be not null');
    SELECT col_not_null('community_service', 'bank_accounts', 'agency', 'agency should be not null');
    SELECT col_not_null('community_service', 'bank_accounts', 'account_digit', 'account digit should be not null');

    -- check foreign keys
    SELECT fk_ok(
        'community_service', 'bank_accounts', 'platform_id',
        'platform_service', 'platforms', 'id'
    );

    SELECT fk_ok(
        'community_service', 'bank_accounts', 'user_id',
        'community_service', 'users', 'id'
    );

    SELECT fk_ok(
        'community_service', 'bank_accounts', 'bank_id',
        'information_service', 'banks', 'id'
    );
    SELECT * FROM finish();
ROLLBACK;
