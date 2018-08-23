-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(2);

    set local request.jwt.claim.user_id to '6d870ed7-65c7-4419-b78b-3946e6f6e695';
    select is(core.current_user_id(), '6d870ed7-65c7-4419-b78b-3946e6f6e695', 'should return user_id from local config');

    set local request.jwt.claim.user_id to DEFAULT;
    select is(core.current_user_id(), NULL, 'should return NULL when not not set');

    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
