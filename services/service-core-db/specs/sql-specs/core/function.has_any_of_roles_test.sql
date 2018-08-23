-- Start transaction and plan the tests.
BEGIN;
SELECT plan(3);

set local role anonymous;
select is(
    core.has_any_of_roles('{platform_user, scoped_user}'),
    false,
    'Should be false when not have any of roles'
);

set local role platform_user;
select is(
    core.has_any_of_roles('{platform_user, scoped_user}'),
    true,
    'Should be false when not have any of roles'
);

set local role scoped_user;
select is(
    core.has_any_of_roles('{platform_user, scoped_user}'),
    true,
    'Should be false when not have any of roles'
);

-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;


