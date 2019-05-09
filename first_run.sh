#!/bin/sh
set -x

# check if service core db and catarse db are up
docker-compose up -d service_core_db catarse_db

#wait small time
sleep 5

# running service_core_migrations
docker-compose up migrations
# add sample data
docker-compose exec service_core_db sh -c "psql -d service_core -h localhost -U postgres < /sample.seed.sql"
docker-compose exec service_core_db sh -c "psql -d service_core -h localhost -U postgres < /setup_fdw_grants.sql"

# running catarse migrations
docker-compose up catarse_migrations

# up catarse rails
docker-compose up -d catarse
sleep 10

# running dev demo settings
docker-compose exec catarse bundle exec rake dev_seed:demo_settings
sleep 5

# running generate fdw
docker-compose exec catarse bundle exec rake common:generate_fdw
sleep 5

# rerun migrations
docker-compose up catarse_migrations

# up all
docker-compose up -d

# restart catarse to ensure token
docker-compose restart catarse

