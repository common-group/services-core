-- Your SQL goes here
drop function if exists community_service_api.update_user(json);
alter function community_service_api.users(data json) rename to "user";
alter function project_service_api.projects(data json) rename to "project";
alter function project_service_api.rewards(data json) rename to "reward";
