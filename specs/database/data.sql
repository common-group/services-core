-- test_login_user_01
insert into core.core_settings(name, value)
    values ('jwt_secret', 'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C'),
        ('subscription_interval', '1 month');

insert into platform_service.users(id, name, email, password)
    values ('6d870ed7-65c7-4419-b78b-3946e6f6e695', 'test login user 01', 'test_login_user_01@test.com', crypt('123456', gen_salt('bf')));

insert into platform_service.platforms(id, name, token)
    values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'test_platform_01', 'a28be766-bb36-4821-82ec-768d2634d78b');

insert into platform_service.platform_users(platform_id, user_id) values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', '6d870ed7-65c7-4419-b78b-3946e6f6e695');

insert into platform_service.platform_api_keys(platform_id, token)
    values('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIiA6ICJwbGF0Zm9ybV91c2VyIiwgInBsYXRmb3JtX3Rva2VuIiA6ICJhMjhiZTc2Ni1iYjM2LTQ4MjEtODJlYy03NjhkMjYzNGQ3OGIiLCAiZ2VuX2F0IiA6IDE1MDQxMzM0NDB9.30t56HzhKy8IvYRryWSXRePQlo3ClI5_fN3U-d-dV5A');

insert into community_service.users(platform_id, id, email, password, key, data)
    values ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'd44378a2-3637-447c-9f57-dc20fff574db', 'test_community_user_01@test.com', crypt('123456', gen_salt('bf')), 'b58df795-56a1-4d16-9f83-fb33cfbddd6f', json_build_object('name', 'test community user 01')::jsonb),
    ('8187a11e-6fa5-4561-a5e5-83329236fbd6', 'bb8f4478-df41-411c-8ed7-12c034044c0e', 'test_community_user_02@test.com', crypt('123456', gen_salt('bf')), 'ef6283de-32b7-4d92-91f7-8925d22a3c63', json_build_object('name', 'test community user 02')::jsonb);

insert into project_service.projects(id, platform_id, user_id, name, status, mode, permalink, data) values ('52273d0a-1610-4f48-9239-e96e5861c3d3', '8187a11e-6fa5-4561-a5e5-83329236fbd6', 'bb8f4478-df41-411c-8ed7-12c034044c0e', 'test project 01', 'online', 'sub', 'test_project', json_build_object('name', 'test project 01'));

insert into project_service.rewards(id, project_id, data)
values ('c73f7f8d-df29-45b1-87ee-cecd9dc2cc7d', '52273d0a-1610-4f48-9239-e96e5861c3d3', json_build_object('current_ip', '127.0.0.1',
  'minimum_value', 1200::decimal,
  'maximum_contributions', 0,
  'shipping_options', 'free'::project_service.shipping_options_enum,
  'deliver_at', ('2 months'::interval + now())::timestamp,
  'row_order',  1,
  'title', 'test title reward',
  'description', 'test reward description',
  'metadata', '{}'::json
    )::jsonb);

insert into payment_service.credit_cards(id, platform_id, user_id, gateway, gateway_data) values ('a41e44d9-5834-4371-afdd-b36bffa8ef9b', '8187a11e-6fa5-4561-a5e5-83329236fbd6', 'd44378a2-3637-447c-9f57-dc20fff574db', 'pagarme', json_build_object(
'id', 123));

insert into payment_service.subscriptions(id, platform_id, project_id, user_id, credit_card_id, status, created_at, checkout_data)
    values ('da484d9e-1df2-491f-868b-8aa7ee52680a', '8187a11e-6fa5-4561-a5e5-83329236fbd6', '52273d0a-1610-4f48-9239-e96e5861c3d3', 'd44378a2-3637-447c-9f57-dc20fff574db', 'a41e44d9-5834-4371-afdd-b36bffa8ef9b', 'active', now(), '{"amount": "1500", "customer": {"phone": {"ddd": "21", "ddi": "55", "number": "933448877"}, "address": {"city": "lorem", "state": "MG", "street": "Rua lorem ipsum", "country": "Brasil", "zipcode": "33600000", "neighborhood": "bairro", "complementary": "comple", "street_number": "200"}}, "current_ip": "127.0.0.1", "payment_method": "credit_card", "is_international": false}'::jsonb),
    ('18124332-701d-4d29-9ab6-6471680edfb5', '8187a11e-6fa5-4561-a5e5-83329236fbd6', '52273d0a-1610-4f48-9239-e96e5861c3d3', 'bb8f4478-df41-411c-8ed7-12c034044c0e', 'a41e44d9-5834-4371-afdd-b36bffa8ef9b', 'active', now(), '{"amount": "1500", "customer": {"phone": {"ddd": "21", "ddi": "55", "number": "933448877"}, "address": {"city": "lorem", "state": "MG", "street": "Rua lorem ipsum", "country": "Brasil", "zipcode": "33600000", "neighborhood": "bairro", "complementary": "comple", "street_number": "200"}}, "current_ip": "127.0.0.1", "payment_method": "credit_card", "is_international": false}'::jsonb);
insert into payment_service.catalog_payments(id, subscription_id, project_id, platform_id, user_id, created_at, data, status, gateway)
    values ('cf5dc490-b5bc-4211-8e08-b49219977938', 'da484d9e-1df2-491f-868b-8aa7ee52680a', '52273d0a-1610-4f48-9239-e96e5861c3d3', '8187a11e-6fa5-4561-a5e5-83329236fbd6',  'd44378a2-3637-447c-9f57-dc20fff574db', now(), '{}'::jsonb, 'pending', 'pagarme');
select payment_service.transition_to(cp, 'paid', '{"test": true}'::json)
    from payment_service.catalog_payments cp
        where cp.id = 'cf5dc490-b5bc-4211-8e08-b49219977938'; -- transition payment to paid

insert into notification_service.notification_global_templates
    (label, subject, template) values 
    (
        'paid_subscription_payment', 
        'subject {{project_name}}', 
        '<p>template {{user_name}}</p>'
    );
