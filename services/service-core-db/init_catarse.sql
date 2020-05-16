create user postgrest with login password 'yuHaufubashOorr8';
create user catarse_fdw with login password 'yuHaufubashOorr8';
create role admin with nologin;
create role web_user with nologin;
create role anonymous with nologin;
grant admin to postgrest;
grant web_user to postgrest;
grant anonymous to postgrest;
