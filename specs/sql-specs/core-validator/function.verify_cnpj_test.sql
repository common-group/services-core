-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(3);

    SELECT function_returns(
        'core_validator', 'verify_cnpj', ARRAY['text'], 'boolean' 
    );

    select ok(
        core_validator.verify_cnpj('53967102000147'),
        'should return true when is a valid CNPJ'
    );

    select is(
        core_validator.verify_cnpj('53265102000142'),
        false,
        'should return false when is invalid CNPJ'
    );

    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
