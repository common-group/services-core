#!/bin/sh
set -x

# check if service core db and catarse db are up
docker-compose up -d service_core_db catarse_db catarse

#wait small time 
sleep 5

# running service_core_migrations
docker-compose up migrations
# add sample data
#docker-compose exec service_core_db psql -d service_core -h localhost -U postgres < /sample.seed.sql
psql -h localhost -p 5444 -U postgres service_core < services/service-core-db/sample.seed.sql

# up catarse rails
docker-compose up -d catarse
sleep 10

# running catarse migrations
docker-compose exec catarse bundle exec rake db:migrate

# running dev demo settings
docker-compose exec catarse bundle exec rake dev_seed:demo_settings

# running generate fdw
docker-compose exec catarse bundle exec rake common:generate_fdw

# rerun migrations
docker-compose exec catarse bundle exec rake db:migrate

# up all
docker-compose up -d

# restart catarse to ensure token
docker-compose restart catarse

