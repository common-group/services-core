-- Start transaction and plan the tests.
BEGIN;
SELECT plan(2);

-- throw error
PREPARE subject_force_any_of_roles AS select core.force_any_of_roles('{platform_user}');
set local role anonymous;
select throws_like(
    'subject_force_any_of_roles',
    '%insufficient_privilege',
    'Should raise error when role is not in requested roles'
);

set local role platform_user;
select lives_ok(
    'subject_force_any_of_roles',
    'Should not raise error when role is in requested roles'
);

-- Finish the tests and clean up.
SELECT * FROM finish();
ROLLBACK;
