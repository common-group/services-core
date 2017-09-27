-- Your SQL goes here
create schema analytics_service;
create schema analytics_service_api;
grant usage on schema analytics_service to postgrest, admin, platform_user, scoped_user;
grant usage on schema analytics_service_api to postgrest, admin, platform_user, scoped_user;

CREATE OR REPLACE VIEW analytics_service_api.users_count AS 
 SELECT count(*) AS users
   FROM community_service.users
  WHERE users.platform_id = core.current_platform_id();


--GRANT ALL ON TABLE analytics_service_api.users_count TO postgrest;
GRANT SELECT ON TABLE analytics_service_api.users_count TO platform_user, admin, scoped_user;
COMMENT ON VIEW analytics_service_api.users_count
  IS 'Shows the number of users on actual platform';