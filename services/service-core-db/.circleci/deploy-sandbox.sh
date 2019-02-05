#!/bin/sh
set -e

echo 'heroku container login'
npx heroku container:login 1> /dev/null

echo 'heroku container pushing'
npx heroku container:push service_core --recursive -a $SANDBOX_SERVICE_CORE_DB_APP 1> /dev/null

echo 'heroku container releasing'
npx heroku container:release service_core -a $SANDBOX_SERVICE_CORE_DB_APP 1> /dev/null

sleep 3

echo 'running migrations'
npx heroku run ./scripts/run_migrations.sh -a $SANDBOX_SERVICE_CORE_DB_APP --type=service_core

echo 'restarting apis'
ssh-keyscan -t rsa ${SANDBOX_SSH_DOMAIN} >> "${HOME}/.ssh/known_hosts" > /dev/null
ssh $SANDBOX_SSH_REMOTE ps:restart $SANDBOX_ANALYTICS_API_APP 1> /dev/null
ssh $SANDBOX_SSH_REMOTE ps:restart $SANDBOX_COMMUNITY_API_APP 1> /dev/null
ssh $SANDBOX_SSH_REMOTE ps:restart $SANDBOX_PAYMENT_API_APP 1> /dev/null
ssh $SANDBOX_SSH_REMOTE ps:restart $SANDBOX_PROJECT_API_APP 1> /dev/null
ssh $SANDBOX_SSH_REMOTE ps:restart $SANDBOX_PLATFORM_API_APP 1> /dev/null
ssh $SANDBOX_SSH_REMOTE ps:restart $SANDBOX_NOTIFICATION_API_APP 1> /dev/null

