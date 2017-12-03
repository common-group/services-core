-- Start transaction and plan the tests.
BEGIN;
SELECT plan(2);

-- check if user is on platform
insert into platform_service.users(id, name, email, password)
    values 
    ('6d870ed7-65c7-4419-b78b-3946e6f6e695', 'Demo platform account', 'demo@demo.com', crypt('123456', gen_salt('bf'))),
    ('6ba4e8df-8603-435d-aeb4-c6df4d52fd48', 'Demo platform account', 'demo2@demo.com', crypt('123456', gen_salt('bf')));
insert into platform_service.platforms(id, name, token)
    values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'demo platform', 'a28be766-bb36-4821-82ec-768d2634d78b');
insert into platform_service.platform_users(platform_id, user_id) values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', '6d870ed7-65c7-4419-b78b-3946e6f6e695');

select ok(
    platform_service.user_in_platform(
        '6d870ed7-65c7-4419-b78b-3946e6f6e695',
        '8187a11e-6fa5-4561-a5e5-83329236fbd6'
    ) = true
    , 'should be true when user exists on platform');

select ok(
    platform_service.user_in_platform(
        '6ba4e8df-8603-435d-aeb4-c6df4d52fd48',
        '8187a11e-6fa5-4561-a5e5-83329236fbd6'
    ) = false
    , 'should be false when user not exists on platform');
-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
