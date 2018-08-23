BEGIN;
    select plan(7);

    insert into core.core_settings(name, value)
        values ('jwt_secret', 'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C');


    PREPARE new_sign_up AS select * from platform_service_api.sign_up(
        'Lorem name',
        'lorem@lorem.com',
        '123456'
    );
    set local role scoped_user;
    select throws_ok('new_sign_up');

    set local role postgres;
    select is(
        (select count(1) from platform_service.users 
            where email = 'lorem@lorem.com'),
        0::bigint,
        'Should have not registered user when requesting as scoped_user'
    );

    set local role platform_user;
    select throws_ok('new_sign_up');

    set local role postgres;
    select is(
        (select count(1) from platform_service.users 
            where email = 'lorem@lorem.com'),
        0::bigint,
        'Should have not registered user when requesting as platform_user'
    );

    set local role anonymous;
    select lives_ok('new_sign_up');
    select matches(
        platform_service_api.sign_up(
            'Lorem name',
            'lorem2@lorem.com',
            '123456'
        )::text,
        '^\(ey',
        'should have token for login when anonymous requesting'
    );

    set local role postgres;
    select is(
        (select count(1) from platform_service.users 
            where email = 'lorem@lorem.com'),
        1::bigint,
        'Should have registered user when requesting as anonymous'
    );


    select * from finish();
ROLLBACK;
