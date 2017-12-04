-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(4);

    SELECT function_returns(
        'core_validator', 'is_empty', ARRAY['text'], 'boolean' 
    );

    select ok(
        core_validator.is_empty(''),
        'should be true when text is a empty text'
    );

    select ok(
        core_validator.is_empty('  '),
        'should be true when text is a whitespaced text'
    );

    select is(
        core_validator.is_empty('foo'),
        false,
        'should be false when text is not empty'
    );

    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
