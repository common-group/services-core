-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(2);


    select is(
        core.weekdays_from(
            2,
            '2017-12-04 18:00'::timestamp
        ),
        '2017-12-06 18:00'::timestamp,
        'should return only week bussiness days'
    );

    select is(
        core.weekdays_from(
            2,
            '2017-12-08 18:00'::timestamp
        ),
        '2017-12-12 18:00'::timestamp,
        'should skip sunday/saturday'
    );


    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
