#!/bin/sh
set -e

echo 'pushing to sandbox'
npx heroku container:login
npx heroku container:push web --recursive -a $SANDBOX_PROXY_APP
npx heroku container:release web -a $SANDBOX_PROXY_APP

