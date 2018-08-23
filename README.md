### under development

# services core db [![CircleCI](https://circleci.com/gh/common-group/services-core-db.svg?style=svg)](https://circleci.com/gh/common-group/services-core-db)
This repo handles with migrations and api specs for these micro servies:

platform_service - Handles with new platform and platform api keys
project_service - Handles with new projects
community_service - Handles new users on platform and social interactions between users

token roles:
- platform_user: can manage api at platform level;
- scoped_user: can manage api at platform user context;

## database roles

in psql run:
```
create role postgrest login with password 'changeme';
create role anonymous nologin;
create role admin nologin;
create role platform_user nologin;
create role scoped_user nologin;

grant anonymous to postgrest;
grant platform_user to postgrest;
grant scoped_user to postgrest;
grant admin to postgrest;
```

## running migrations

`cargo install diesel_cli`
`DATABASE_URL='postgres://postgres@localhost:5432/db' ./scripts/run_migrations.sh`
`diesel migration --database-url= run`
## running tests

`TEST_DB_HOST=localhost TEST_DB_PORT=5432 ./scripts/run_tests.sh`
