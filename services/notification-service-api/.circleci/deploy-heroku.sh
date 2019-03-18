#!/bin/sh
set -e

echo 'pushing to heroku'
npx heroku container:login
npx heroku container:push notification_dispatcher --recursive -a $PRODUCTION_NOTIFICATION_DISPATCHER_APP
npx heroku container:release notification_dispatcher -a $PRODUCTION_NOTIFICATION_DISPATCHER_APP /dev/null

