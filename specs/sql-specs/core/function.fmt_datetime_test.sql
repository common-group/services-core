BEGIN
    select plan(2);

    SELECT function_returns(
        'core', 'fmt_datetime', ARRAY['timestamp'], 'text'
    );

    select is(
        core.fmt_datetime('2016-12-21 19:00:00'::timestamp),
        '21/12/2016 17:00',
        'should format date in local platform timezone'
    );


    SELECT * FROM finish();
ROLLBACK;
