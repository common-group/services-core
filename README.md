### under development

# services core [![CircleCI](https://circleci.com/gh/common-group/services-core.svg?style=svg)](https://circleci.com/gh/common-group/services-core)

This repo contains docker files to setup the Catarse environment. All dependendent repos are included as git subtrees mounted on the `services` folder.

## setup

For every service described on `docker-compose.yml` we have multiple env_files `compose_env/.*.env.sample`. Just make a copy of all of them on the same directory removing .sample.
Alternatively, you can run the following line:

```bash
chmod +x ./.commands/copy-env-files.sh && cd compose_env && ../.commands/copy-env-files.sh
```

Start Database:
`$ docker-compose up -d service_core_db`

Run the migrations and seed database with sample data:

```
$ docker-compose up migrations
// database service mapping the 5444 to postgres container
$ psql -h localhost -p 5444 -U postgres service_core < services/service-core-db/sample.seed.sql
```

Start services:
`$ docker-compose up -d`

Run migrations of catarse

```
$ docker-compose exec catarse rake db:migrate # will have an error here after some migrations running.
$ docker-compose exec catarse rake dev_seed:demo_settings # insert host data to configure common_db forward schema
$ docker-compose exec catarse rake common:generate_fdw # generate forward schemas using config from previous command
$ docker-compose exec catarse rake db:migrate # run again and should finish migrations
```

