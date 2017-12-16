BEGIN;
    SELECT plan(10);

    -- check table presence
    SELECT has_table('platform_service'::name, 'users'::name);

    -- check column defaults
    SELECT col_default_is( 'platform_service', 'users', 'id', 'uuid_generate_v4()', 'should generate uuid fo users(id)' );
    SELECT col_default_is( 'platform_service', 'users', 'created_at', 'now()', 'should fill created_at with now' );

    -- check not nulls
    SELECT col_not_null('platform_service', 'users', 'email', 'email should be not null');
    SELECT col_not_null('platform_service', 'users', 'name', 'name should be not null');
    SELECT col_not_null('platform_service', 'users', 'password', 'password should be not null');
    SELECT col_not_null('platform_service', 'users', 'created_at', 'created_at should be not null');
    SELECT col_not_null('platform_service', 'users', 'updated_at', 'updated_at should be not null');

    -- check column constraints / indexes
    SELECT col_is_unique('platform_service', 'users', 'email', 'email should be unique');

    -- test invalid inserts
    PREPARE invalid_email_error AS insert into platform_service.users(name, email, password) values ('Demo platform account', 'inva@lid@email', crypt('123456', gen_salt('bf')));
    SELECT throws_like(
        'invalid_email_error',
        '%"users_email_check"',
        'Should error when email is invalid'
    );


    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
