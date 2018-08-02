#!/bin/bash
function __clean_containers() {
    docker stop common_service_db_inline_test
    #docker rm sql_test_files_inline_common 
    docker rm sql_test_files_inline_common
    if [ $? -eq 1 ]
    then
        echo 'removed sql inline container'
    else
        echo 'sql inline container already removed'
    fi;
}
trap __clean_containers EXIT

set -ex

echo 'building dockerfile.test'
docker build -f Dockerfile.test -t inline_services_core_test .

echo 'creating test database...'
docker run -e POSTGRES_DB=test_db --name common_service_db_inline_test --rm -d postgres:9.6

echo 'waiting test_db up...'
until docker run --rm --link common_service_db_inline_test:pg postgres:9.6 pg_isready -U postgres -h pg; do sleep 1; done

echo 'loading basic init.sql'
docker run -i --rm --link common_service_db_inline_test:pg inline_services_core_test psql -h pg -U postgres test_db < init.sql

echo 'migrating test database...'
docker run -i --rm -e="DATABASE_URL=postgres://postgres@pg:5432/test_db"  --link common_service_db_inline_test:pg inline_services_core_test ./scripts/run_migrations.sh

echo 'running tests...'
docker create -v /specs --name sql_test_files_inline_common comum/deps /bin/true
docker cp specs sql_test_files_inline_common:/
docker run -t --rm --volumes-from sql_test_files_inline_common --link common_service_db_inline_test:pg comum/pgtap -h pg -u postgres -d test_db -t '/specs/sql-specs/*/*.sql'

echo 'removing test container...'
