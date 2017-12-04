-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(3);

    SELECT function_returns(
        'core_validator', 'verify_cpf', ARRAY['text'], 'boolean' 
    );

    select ok(
        core_validator.verify_cpf('55576530667'),
        'should return true when is a valid CPF'
    );

    select is(
        core_validator.verify_cpf('54576530667'),
        false,
        'should return false when is invalid CPF'
    );

    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
