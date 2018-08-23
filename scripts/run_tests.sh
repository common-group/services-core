#!/bin/bash

DB_HOST=${TEST_DB_HOST:-localhost}
DB_NAME=${TEST_DB_NAME:-service_core_test}
DB_USER=${TEST_DB_USER:-postgres}
DB_PORT=${TEST_DB_PORT:-5432}
db=$DB_NAME
user=`whoami`
port=8888
exit_code=0

postgrest_bin='unknown'
unamestr=`uname`
ver='0.4.3.0'
dir='postgrest'
windows_bash=$(uname -r|grep -i Microsoft)

schema_log='specs/logs/schema_load.log'
data_log='specs/logs/data_load.log'

if [[ "$unamestr" == 'Linux' ]]; then
  if [[ -n "$windows_bash" ]]; then
    postgrest_bin="postgrest-$ver-win.exe"
  else
    postgrest_bin="postgrest-$ver-linux"
  fi
elif [[ "$unamestr" == 'Darwin' ]]; then
  postgrest_bin="postgrest-$ver-osx"
fi

if [[ "$postgrest_bin" == "unknown" ]]; then
  echo "Platform $unamestr is not supported by the postgrest binaries."
fi

echo "Initiating database users..."
createuser -h $DB_HOST -p $DB_PORT -U $DB_USER --no-login platform_user > /dev/null 2>&1
createuser -h $DB_HOST -p $DB_PORT -U $DB_USER --no-login scoped_user > /dev/null 2>&1
createuser -h $DB_HOST -p $DB_PORT -U $DB_USER --no-login admin > /dev/null 2>&1
createuser -h $DB_HOST -p $DB_PORT -U $DB_USER --no-login anonymous > /dev/null 2>&1
createuser -h $DB_HOST -p $DB_PORT -U $DB_USER --no-login catarse_fdw > /dev/null 2>&1
createuser -h $DB_HOST -p $DB_PORT -U $DB_USER postgrest -g admin -g platform_user -g scoped_user -g anonymous > /dev/null 2>&1

echo "Initiating database schema..."
dropdb -h $DB_HOST -p $DB_PORT -U  $DB_USER --if-exists $db
createdb -h $DB_HOST -p $DB_PORT -U  $DB_USER $db

psql --set ON_ERROR_STOP=1 -h $DB_HOST -p $DB_PORT -U $DB_USER $db < ./specs/database/schema.sql > $schema_log 2>&1
if [[ $? -ne 0 ]]; then
    echo "Error restoring test schema. Take a look at ${schema_log}:"
    tail -n 5 $schema_log
    exit 1
fi

echo "Populating database..."
psql --set ON_ERROR_STOP=1 -h $DB_HOST -p $DB_PORT -U  $DB_USER -v db=$db $db < ./specs/database/data.sql > $data_log 2>&1
if [[ $? -ne 0 ]]; then
    echo "Error restoring test data. Take a look at ${data_log}:"
    tail -n 5 $data_log
    exit 1
fi

for service_dir in specs/api-specs/*
do
    service_name=$(basename "$service_dir")
    service_api_schema=$(echo $service_name'-api' | sed 's/-/_/g')

    echo "Initiating PostgREST server ./specs/postgrest/$postgrest_bin ... for service $service_name"

    if [[ "$unamestr" == 'Linux' ]]; then
        sed -i "s/db-schema = .*/db-schema = \"$service_api_schema\"/g" ./specs/postgrest/settings.config
    elif [[ "$unamestr" == 'Darwin' ]]; then
        sed -i '' "s/db-schema = .*/db-schema = \"$service_api_schema\"/g" ./specs/postgrest/settings.config
    fi
    ./specs/postgrest/$postgrest_bin ./specs/postgrest/settings.config > specs/logs/postgrest.log 2>&1 &

    echo "Running tests for $service_name"
    sleep 4
    for test_file in $service_dir/test/*.yml
    do
        echo ""
        echo "$test_file..."
        pyresttest http://localhost:$port $test_file
        if [[ $? -ne 0 ]]; then
            exit_code=1
        fi
    done
    echo ""

    echo "Terminating PostgREST server... for $service_name"
    if [[ -n "$windows_bash" ]]; then
        taskkill.exe /IM $postgrest_bin /F
    else
        killall $postgrest_bin
    fi
done
echo "Done."
exit $exit_code
