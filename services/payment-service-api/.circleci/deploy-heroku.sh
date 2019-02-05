#!/bin/sh
set -e

echo 'pushing to heroku'
npx heroku container:login
npx heroku container:push payment_stream_processor --recursive -a $PRODUCTION_PAYMENT_STREAM_APP 1> /dev/null
npx heroku container:push subscriptions_scheduler --recursive -a $PRODUCTION_SUBSCRIPTION_SCHEDULER_APP 1> /dev/null
npx heroku container:release payment_stream_processor -a $PRODUCTION_PAYMENT_STREAM_APP 1> /dev/null
npx heroku container:release subscriptions_scheduler -a $PRODUCTION_SUBSCRIPTION_SCHEDULER_APP 1> /dev/null

 
