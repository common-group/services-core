BEGIN;
    select plan(12);

    SELECT function_returns(
        'payment_service_api', 'pay', ARRAY['json'], 'json' 
    );

    -- database seed data
    -- add platform
    insert into platform_service.platforms(id, name, token) values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'demo platform', 'a28be766-bb36-4821-82ec-768d2634d78b');

    -- add users to community
    insert into community_service.users(platform_id, id, email, password, key, data) values
        ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'd44378a2-3637-447c-9f57-dc20fff574db', 'test_community_user_01@test.com', crypt('123456', gen_salt('bf')), 'b58df795-56a1-4d16-9f83-fb33cfbddd6f', json_build_object('name', 'test community user 01')::jsonb), 
        ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'bb8f4478-df41-411c-8ed7-12c034044c0e', 'test_community_user_02@test.com', crypt('123456', gen_salt('bf')), 'ef6283de-32b7-4d92-91f7-8925d22a3c63', json_build_object('name', 'test community user 02')::jsonb);

    -- add project
    insert into project_service.projects(id, platform_id, user_id, name, mode, permalink, data) values ('52273d0a-1610-4f48-9239-e96e5861c3d3', '8187a11e-6fa5-4561-a5e5-83329236fbd6', 'bb8f4478-df41-411c-8ed7-12c034044c0e', 'test project 01', 'sub', 'test_project', json_build_object('name', 'test project 01'));

    -- add reward to project
    insert into project_service.rewards(id, project_id, platform_id, data) 
    values ('c73f7f8d-df29-45b1-87ee-cecd9dc2cc7d', '52273d0a-1610-4f48-9239-e96e5861c3d3', '8187a11e-6fa5-4561-a5e5-83329236fbd6', json_build_object('current_ip', '127.0.0.1',
            'minimum_value', 1200::decimal,
            'maximum_contributions', 0,
            'shipping_options', 'free'::project_service.shipping_options_enum,
            'deliver_at', ('2 months'::interval + now())::timestamp,
            'row_order',  1,
            'title', 'test title reward',
            'description', 'test reward description',
            'metadata', '{}'::json
    )::jsonb);

create or replace function _json_data_payment(json) returns json
language plpgsql as $$
declare
data json;
begin
    data := json_build_object(
        'subscription', false,
        'user_id', 'd44378a2-3637-447c-9f57-dc20fff574db',
        'project_id', '52273d0a-1610-4f48-9239-e96e5861c3d3',
        'amount', 2400,
        'payment_method', 'boleto',
        'customer', json_build_object(
            'name', 'Teste da silva',
            'email', 'test@test.com',
            'document_number', coalesce($1->>'customer_document_number'::text, '889.851.228-78'),
            'address', json_build_object(
                'street', 'Rua lorem ipsum',
                'street_number', '200',
                'neighborhood', 'bairro',
                'zipcode', '33600000',
                'city', 'Lorem ipsum',
                'state', 'MG',
                'country', 'Brasil',
                'complementary', 'complement'
            ),
            'phone', json_build_object(
                'ddi', '55',
                'ddd', '21',
                'number', '982402833'
            )
        )
    );

    data := (data::jsonb || $1::jsonb)::json;

    return data;
end;
$$;

prepare pay_with_data as select * from payment_service_api.pay(_json_data_payment($1::json));

savepoint init;

create or replace function test_pay_with_anon()
returns setof text language plpgsql as $$
declare
begin
    -- test with anonymous role
    set local role anonymous;
    set local "request.header.platform-code" to 'a28be766-bb36-4821-82ec-768d2634d78b';
    return next throws_like('EXECUTE pay_with_data(''{}'')', '%insufficient_privilege', 'anonymous cannot perform pay operation');
end;
$$;
select test_pay_with_anon();

create or replace function test_pay_with_platform_user()
returns setof text language plpgsql as $$
declare
    _count_expected numeric default 0;
begin
    set local role platform_user;
    set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';

    -- ip header should be found
    return next throws_matching('EXECUTE pay_with_data(''{}'')', '.+x-forwarded-for', 'should raise when ip header not found');
    set local "request.header.x-forwarded-for" to '127.0.0.1'; 

    -- test valid data with platform_user
    return next lives_ok('EXECUTE pay_with_data(''{"external_id": "1234"}'')', 'platform_user can call pay');

    -- test unique external_id payment
    return next throws_matching('EXECUTE pay_with_data(''{"external_id": "1234"}'')', '.+uniq_payments_ext_id' ,'platform_user cant use same external_id twice');

    -- test document cpf validation
    return next throws_matching('EXECUTE pay_with_data(''{"customer_document_number": "987.264.123-23"}'')', 'invalid_document' ,'should be error when document_number is invalid');

    -- check if payment has inserted
    select count(1) from payment_service.catalog_payments
        where user_id = 'd44378a2-3637-447c-9f57-dc20fff574db'
        and external_id = '1234'
        into _count_expected;
    return next ok(_count_expected = 1, 'should have inserted payment');
end;
$$;
select test_pay_with_platform_user();

create or replace function test_pay_with_scoped_user()
returns setof text language plpgsql as $$
declare
    _count_expected numeric default 0;
begin
    -- test valid data with scoped_user
    set local role scoped_user;
    set local request.jwt.claim.platform_token to 'a28be766-bb36-4821-82ec-768d2634d78b';
    set local request.jwt.claim.user_id to 'bb8f4478-df41-411c-8ed7-12c034044c0e';
    set local "request.header.x-forwarded-for" to '127.0.0.1'; -- ip header should be found

    -- test document cpf validation
    return next throws_matching('EXECUTE pay_with_data(''{"customer_document_number": "987.264.123-23"}'')', 'invalid_document' ,'should be error when document_number is invalid');

    -- should exeute pay
    return next lives_ok('EXECUTE pay_with_data(''{"external_id":"12345"}'')', 'scoped_user can call pay');

    -- check if payment for user is generated
    select count(1) from payment_service.catalog_payments
        where user_id = 'd44378a2-3637-447c-9f57-dc20fff574db'
            and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
    return next ok(_count_expected = 1, 'should add more payment to passed user_id when is not the same of scoped_user request');

    -- check if external id is ignored
    select count(1) from payment_service.catalog_payments
        where external_id = '12345'
            and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
    return next ok(_count_expected = 0, 'should ignore external_id when scoped_user');

    select count(1) from payment_service.catalog_payments
        where user_id = 'bb8f4478-df41-411c-8ed7-12c034044c0e'
            and platform_id = '8187a11e-6fa5-4561-a5e5-83329236fbd6'
        into _count_expected;
    return next ok(_count_expected = 1, 'should persist a payment to scoped_user');
end;
$$;
select test_pay_with_scoped_user();

select * from finish();

ROLLBACK;
