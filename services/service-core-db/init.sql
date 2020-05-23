create user postgrest with login password '{{ .POSTGREST_USER_PASSWORD }}';
create user proxy_server with login password '{{ .PROXY_USER_PASSWORD }}';
create user catarse_fdw with login password '{{ .CATARSE_FDW_USER_PASSWORD }}';
create role admin with nologin;
create role scoped_user with nologin;
create role platform_user with nologin;
create role anonymous with nologin;
grant admin to postgrest;
grant scoped_user to postgrest;
grant platform_user to postgrest;
grant anonymous to postgrest;

