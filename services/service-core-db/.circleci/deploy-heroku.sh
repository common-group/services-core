#!/bin/sh
set -e

echo 'heroku container login'
npx heroku container:login 1> /dev/null

echo 'heroku container pushing'
npx heroku container:push service_core --recursive -a $PRODUCTION_SERVICE_CORE_DB_APP 1> /dev/null

echo 'heroku container releasing'
npx heroku container:release service_core -a $PRODUCTION_SERVICE_CORE_DB_APP 1> /dev/null

sleep 3

echo 'running migrations'
npx heroku run ./scripts/run_migrations.sh -a $PRODUCTION_SERVICE_CORE_DB_APP --type=service_core

echo 'restarting apis'
npx heroku restart -a $PRODUCTION_ANALYTICS_API_APP 1> /dev/null
npx heroku restart -a $PRODUCTION_COMMUNITY_API_APP 1> /dev/null
npx heroku restart -a $PRODUCTION_PAYMENT_API_APP 1> /dev/null
npx heroku restart -a $PRODUCTION_PROJECT_API_APP 1> /dev/null
npx heroku restart -a $PRODUCTION_PLATFORM_API_APP 1> /dev/null
npx heroku restart -a $PRODUCTION_NOTIFICATION_API_APP 1> /dev/null

