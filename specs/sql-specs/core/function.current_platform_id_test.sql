-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(2);

    -- demo platform
    insert into platform_service.platforms(id, name, token)
    values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'demo platform', 'a28be766-bb36-4821-82ec-768d2634d78b');


    set local request.jwt.claim.platform_token to '6d870ed7-65c7-4419-b78b-3946e6f6e695';
    select is(core.current_platform_id(), NULL, 'should return NULL when platform not exist');

    set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';
    select is(core.current_platform_id(), '8187a11e-6fa5-4561-a5e5-83329236fbd6', 'should return platform_id when platform exist');

    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
