#!/bin/bash
set -e

#ssh-keyscan -t rsa ${SUBTREE_PUSH_DOMAIN} >> "${HOME}/.ssh/known_hosts"

git config --global user.email $GIT_USER_EMAIL
git config --global user.name $GIT_USER_NAME

git remote add catarse.js $CATARSE_JS_SUBTREE_REMOTE
git remote add catarse $CATARSE_SUBTREE_REMOTE
git remote add common-api $COMMON_API_SUBTREE_REMOTE
git remote add service-core-db $SERVICE_CORE_DB_SUBTREE_REMOTE
git remote add proxy $PROXY_SUBTREE_REMOTE

git remote add hook-service-api $HOOK_SERVICE_SUBTREE_REMOTE
git remote add notification-service-api $NOTIFICATION_SERVICE_SUBTREE_REMOTE
git remote add payment-service-api $PAYMENT_SERVICE_SUBTREE_REMOTE


echo 'pushing catarse.js...'
#git subtree pull -q --prefix=services/catarse.js catarse.js $SUBTREE_BRANCH
git subtree push -q --prefix=services/catarse.js catarse.js $SUBTREE_BRANCH

echo 'pushing catarse...'
#git subtree pull -q --prefix=services/catarse catarse $SUBTREE_BRANCH
git subtree push -q --prefix=services/catarse catarse $SUBTREE_BRANCH
tail  ~/push_subtree.log

echo 'pushing service-core-db...'
#git subtree pull -q --prefix=services/service-core-db service-core-db $SUBTREE_BRANCH
git subtree push -q --prefix=services/service-core-db service-core-db $SUBTREE_BRANCH
tail  ~/push_subtree.log

echo 'pushing common-api...'
#git subtree pull -q --prefix=services/common-api common-api $SUBTREE_BRANCH
git subtree push -q --prefix=services/common-api common-api $SUBTREE_BRANCH
tail  ~/push_subtree.log

echo 'pushing proxy...'
#git subtree pull -q --prefix=services/proxy proxy $SUBTREE_BRANCH
git subtree push -q --prefix=services/proxy proxy $SUBTREE_BRANCH
tail  ~/push_subtree.log

echo 'pushing hook-service-api...'
#git subtree pull -q --prefix=services/hook-service-api hook-service-api $SUBTREE_BRANCH
git subtree push -q --prefix=services/hook-service-api hook-service-api $SUBTREE_BRANCH

echo 'pushing notification-service-api...'
#git subtree pull -q --prefix=services/notification-service-api notification-service-api $SUBTREE_BRANCH
git subtree push -q --prefix=services/notification-service-api notification-service-api $SUBTREE_BRANCH

echo 'pushing payment-service-api...'
#git subtree pull -q --prefix=services/payment-service-api payment-service-api $SUBTREE_BRANCH
git subtree push -q --prefix=services/payment-service-api payment-service-api $SUBTREE_BRANCH
