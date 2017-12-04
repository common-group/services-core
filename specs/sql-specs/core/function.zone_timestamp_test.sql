-- Start transaction and plan the tests.
BEGIN;
    SELECT plan(2);


    select is(
        core.zone_timestamp('2016-12-21 19:00:00'::timestamp),
        '2016-12-21 17:00:00'::timestamp,
        'should convert to default America/Sao_Paulo'
    );

    select is(
        core.zone_timestamp('2016-12-21 19:00:00'::timestamp, 'PST'),
        '2016-12-21 11:00:00'::timestamp,
        'should convert to PST time'
    );

    -- Finish the tests and clean up.
    SELECT * FROM finish();
ROLLBACK;
