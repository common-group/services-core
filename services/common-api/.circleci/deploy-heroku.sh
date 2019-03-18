#!/bin/sh
set -e

echo 'pushing to heroku'
npx heroku container:login
npx heroku container:push web --recursive -a $PRODUCTION_COMMON_API_APP
npx heroku container:release web -a $PRODUCTION_COMMON_API_APP

