-- test_login_user_01
insert into core.core_settings(id, name, value)
    values (1, 'jwt_secret', 'gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr9C');

insert into platform_service.users(id, name, email, password)
    values (9999, 'test login user 01', 'test_login_user_01@test.com', crypt('123456', gen_salt('bf')));

insert into platform_service.platforms(id, name, token)
    values (9999, 'test_platform_01', 'a28be766-bb36-4821-82ec-768d2634d78b');
insert into platform_service.platform_users(platform_id, user_id) values (9999, 9999);

insert into platform_service.platform_api_keys(id, platform_id, token)
    values(9999, 9999, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIiA6ICJwbGF0Zm9ybV91c2VyIiwgInBsYXRmb3JtX3Rva2VuIiA6ICJhMjhiZTc2Ni1iYjM2LTQ4MjEtODJlYy03NjhkMjYzNGQ3OGIiLCAiZ2VuX2F0IiA6IDE1MDQxMzM0NDB9.30t56HzhKy8IvYRryWSXRePQlo3ClI5_fN3U-d-dV5A');

insert into community_service.users(platform_id, id, name, email, password, key)
    values (9999, 999, 'test community user 01', 'test_community_user_01@test.com', crypt('123456', gen_salt('bf')), 'b58df795-56a1-4d16-9f83-fb33cfbddd6f'),
    (9999, 998, 'test community user 02 owner', 'test_community_user_02@test.com', crypt('123456', gen_salt('bf')), 'ef6283de-32b7-4d92-91f7-8925d22a3c63');

insert into project_service.projects(id, platform_id, user_id, name, mode, data) values (9999, 9999, 998, 'test project 01', 'sub', json_build_object('name', 'test project 01'));

insert into payment_service.credit_cards(id, platform_id, user_id, gateway, gateway_data) values (999, 9999, 999, 'pagarme', json_build_object(
'id', 123));
