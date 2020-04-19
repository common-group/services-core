### under development

# services core [![CircleCI](https://circleci.com/gh/common-group/services-core.svg?style=svg)](https://circleci.com/gh/common-group/services-core)
This repo contains docker files to setup the Catarse environment. All dependendent repos are included as git subtrees mounted on the ```services``` folder.

## setup
For every service described on `docker-compose.yml` we have multiple env_files `compose_env/.*.env.sample`. Just make a copy off all of them on the same directory removing .sample.

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

## Skaffold notes

Using Verdaccio (an open source private NPM registry) to be able to create intermediary builds of catarse.js. See services/private-npm-registry for details on setting up

After generating an ~/.npmrc file, add it to the env for the build:
`export NPM_AUTH=$(cat ~/.npmrc)`

Start with running the base profile:
`skaffold run`

Start the migration job:
`skaffold run -p migrations`

Now seed the DB:
`skaffold run -p prime`

Next load default/demo settings
`skaffold run -p setup`

Wait for migrations job to re-run and be succesful, or force start it. To check the status of the migration run `kubectl logs job/catarse-migrations`

Restart catarse:
`kubectl scale deploy/catarse --replicas=0`
`kubectl scale deploy/catarse --replicas=1`
