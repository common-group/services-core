-- This file should undo anything in `up.sql`
drop function project_service_api.reward(data json);
drop FUNCTION project_service._serialize_reward_basic_data(json, json);
drop FUNCTION project_service._serialize_reward_basic_data(json);
drop function project_service_api.create_reward(data json);
drop table project_service.reward_versions;
drop table project_service.rewards;
drop type if exists project_service.shipping_options_enum;