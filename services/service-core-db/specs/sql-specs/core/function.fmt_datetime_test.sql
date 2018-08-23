BEGIN;
    select plan(1);

    select is(
        core.fmt_datetime('2016-12-21 19:00:00'::timestamp),
        '21/12/2016 17:00:00',
        'should format date in local platform timezone'
    );

    SELECT * FROM finish();
ROLLBACK;
