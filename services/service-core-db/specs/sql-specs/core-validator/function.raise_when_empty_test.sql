-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(5);

    SELECT function_returns(
        'core_validator', 'raise_when_empty', ARRAY['text', 'text'], 'text' 
    );

    prepare throw_when_null_str as
        select core_validator.raise_when_empty(null::text, 'field_name');
    select throws_like(
        'throw_when_null_str',
        '%field_name',
        'should raise exception with field_name when null text'
    );

    prepare throw_when_empty_str as
        select core_validator.raise_when_empty('', 'field_name');
    select throws_like(
        'throw_when_empty_str',
        '%field_name',
        'should raise exception with field_name when empty string'
    );

    prepare throw_when_whitespaced_str as
        select core_validator.raise_when_empty('  ', 'whitespaced_name');
    select throws_like(
        'throw_when_whitespaced_str',
        '%whitespaced_name',
        'should raise exception when text is a whitespaced text'
    );

    select is(
        core_validator.raise_when_empty('filled', 'filled_name'),
        'filled',
        'should return same text when is present'
    );



    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
