create user postgrest with login password 'yuHaufubashOorr8';
create user proxy_server with login password 'yuHaufubashOorr8';
create user catarse_fdw with login password 'yuHaufubashOorr8';
create role admin with nologin;
create role scoped_user with nologin;
create role platform_user with nologin;
create role anonymous with nologin;
grant admin to postgrest;
grant scoped_user to postgrest;
grant platform_user to postgrest;
grant anonymous to postgrest;
grant usage on schema core to proxy_server;
grant usage on schema payment_service to catarse_fdw;
grant usage on schema community_service to catarse_fdw;
grant usage on schema project_service to catarse_fdw;

GRANT SELECT ON ALL TABLES IN SCHEMA payment_service  TO catarse_fdw;
GRANT SELECT ON ALL TABLES IN SCHEMA community_service  TO catarse_fdw;
GRANT SELECT ON ALL TABLES IN SCHEMA project_service  TO catarse_fdw;
