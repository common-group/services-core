create user postgrest with login password 'yuHaufubashOorr8';
create user catarse_fdw with login password 'yuHaufubashOorr8';
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
    options (user 'catarse_fdw', password 'yuHaufubashOorr8');

create user mapping for postgres
    server catarse_db
    options (user 'catarse_fdw', password 'yuHaufubashOorr8');
