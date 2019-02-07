#!/bin/sh
set -e

echo 'pushing to heroku'
npx heroku container:login
npx heroku container:push web --recursive -a $PRODUCTION_PROXY_APP 1> /dev/null
npx heroku container:release web -a $PRODUCTION_PROXY_APP 1> /dev/null

