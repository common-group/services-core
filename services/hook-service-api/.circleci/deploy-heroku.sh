#!/bin/sh
set -e

echo 'pushing to heroku'
npx heroku container:login
npx heroku container:push web --recursive -a $PRODUCTION_HOOK_SERVICE_API_APP
npx heroku container:release web -a $PRODUCTION_HOOK_SERVICE_API_APP
