create user postgrest with login password '{{ .POSTGREST_USER_PASSWORD }}';
create user catarse_fdw with login password '{{ .CATARSE_FDW_USER_PASSWORD }}';
create role admin with nologin;
create role web_user with nologin;
create role anonymous with nologin;
grant admin to postgrest;
grant web_user to postgrest;
grant anonymous to postgrest;

create extension if not exists postgres_fdw;
create server catarse_db
    foreign data wrapper postgres_fdw
    options(host 'catarse_db', dbname 'catarse_db', port '5432');

create user mapping for catarse_fdw
    server catarse_db
    options (user 'catarse_fdw', password '{{ .POSTGREST_USER_PASSWORD }}');

create user mapping for postgres
    server catarse_db
    options (user 'catarse_fdw', password '{{ .CATARSE_FDW_USER_PASSWORD }}');
