-- This file should undo anything in `up.sql`
alter function community_service_api.user(data json) rename to "users";
alter function project_service_api.project(data json) rename to "projects";
alter function project_service_api.reward(data json) rename to "rewards";