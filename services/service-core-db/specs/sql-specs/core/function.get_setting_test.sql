BEGIN;
    select plan(3);

    insert into core.core_settings(name, value)
        values ('jwt_secret', 'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C'),
        ('subscription_interval', '1 month');

    select is(
        core.get_setting('jwt_secret'),
        'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C',
        'should return jwt secret'
    );

    select is(
        core.get_setting('subscription_interval'),
        '1 month',
        'should return subscription_interval value'
    );

    select is(
        core.get_setting('not_recorded'),
        NULL,
        'should return NULL when setting is not present'
    );
    select * from finish();
ROLLBACK;
