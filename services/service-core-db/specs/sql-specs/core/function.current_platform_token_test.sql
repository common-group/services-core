-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(4);

    -- with non anonymous role
    set local role platform_user;
    set local request.jwt.claim.platform_token to '6d870ed7-65c7-4419-b78b-3946e6f6e695';
    select is(core.current_platform_token(), '6d870ed7-65c7-4419-b78b-3946e6f6e695', 'should return platform_token from jwt when non anoymous role');

    set local request.jwt.claim.platform_token to DEFAULT;
    set local "request.header.platform-code" to '6d870ed7-65c7-4419-b78b-3946e6f6e695';
    select is(core.current_platform_token(), NULL, 'should be null whe non anonymous without platform_token on jwt claims');


    -- with anonymous role
    set local role anonymous;
    set local request.jwt.claim.platform_token to '6d870ed7-65c7-4419-b78b-3946e6f6e695';
    set local "request.header.platform-code" to DEFAULT;
    select is(core.current_platform_token(), NULL, 'should return NULL when platform token is not defined on header when using anonymous role');

    set local request.jwt.claim.platform_token to DEFAULT;
    set local "request.header.platform-code" to '6d870ed7-65c7-4419-b78b-3946e6f6e695';
    select is(core.current_platform_token(), '6d870ed7-65c7-4419-b78b-3946e6f6e695', 'should return platform token when defined on header using anonymous role');

    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
