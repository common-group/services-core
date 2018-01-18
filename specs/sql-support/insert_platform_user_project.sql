create or replace function __seed_platform_id() returns uuid
language sql immutable as $$ select '8187a11e-6fa5-4561-a5e5-83329236fbd6'::uuid $$;

create or replace function __seed_platform_token() returns uuid
language sql immutable as $$ select 'a28be766-bb36-4821-82ec-768d2634d78b'::uuid $$;

create or replace function __seed_first_user_id() returns uuid
language sql immutable as $$ select 'd44378a2-3637-447c-9f57-dc20fff574db'::uuid $$;

create or replace function __seed_second_user_id() returns uuid
language sql immutable as $$ select 'bb8f4478-df41-411c-8ed7-12c034044c0e'::uuid $$;

create or replace function __seed_project_id() returns uuid
language sql immutable as $$ select '52273d0a-1610-4f48-9239-e96e5861c3d3'::uuid $$;

create or replace function __seed_aon_project_id() returns uuid
language sql immutable as $$ select '23112a89-6179-47cf-9360-09892228e40d'::uuid $$;

create or replace function __seed_reward_id() returns uuid
language sql immutable as $$ select 'c73f7f8d-df29-45b1-87ee-cecd9dc2cc7d'::uuid $$;


-- database seed data
insert into core.core_settings(name, value)
    values ('subscription_interval', '1 month');
-- add platform
insert into platform_service.platforms(id, name, token) values (__seed_platform_id(), 'demo platform', __seed_platform_token());

-- add users to community
insert into community_service.users(platform_id, id, email, password, key, data) values
(__seed_platform_id(), __seed_first_user_id(), 'test_community_user_01@test.com', crypt('123456', gen_salt('bf')), 'b58df795-56a1-4d16-9f83-fb33cfbddd6f', json_build_object('name', 'test community user 01')::jsonb), 
(__seed_platform_id(), __seed_second_user_id(), 'test_community_user_02@test.com', crypt('123456', gen_salt('bf')), 'ef6283de-32b7-4d92-91f7-8925d22a3c63', json_build_object('name', 'test community user 02')::jsonb);

-- add project
insert into project_service.projects(id, platform_id, user_id, name, mode, permalink, data) 
    values (__seed_project_id(), __seed_platform_id(), __seed_second_user_id(), 'test project 01', 'sub', 'test_project', json_build_object('name', 'test project 01')),
    (__seed_aon_project_id(), __seed_platform_id(), __seed_second_user_id(), 'test project 02', 'aon', 'test_project_aon', json_build_object('name', 'test project aon'));

-- add reward to project
insert into project_service.rewards(id, project_id, platform_id, data) 
values (__seed_reward_id(), __seed_project_id(), __seed_platform_id(), json_build_object('current_ip', '127.0.0.1',
        'minimum_value', 1200::decimal,
        'maximum_contributions', 0,
        'shipping_options', 'free'::project_service.shipping_options_enum,
        'deliver_at', ('2 months'::interval + now())::timestamp,
        'row_order',  1,
        'title', 'test title reward',
        'description', 'test reward description',
        'metadata', '{}'::json
)::jsonb);
