#!/bin/sh
set -e

#ssh-keyscan -t rsa ${SUBTREE_PUSH_DOMAIN} >> "${HOME}/.ssh/known_hosts"

git remote add catarse.js $CATARSE_JS_SUBTREE_REMOTE
git remote add catarse $CATARSE_SUBTREE_REMOTE
git remote add common-api $COMMON_API_SUBTREE_REMOTE
git remote add service-core-db $SERVICE_CORE_DB_SUBTREE_REMOTE
git remote add proxy $PROXY_SUBTREE_REMOTE

git remote add hook-service-api $HOOK_SERVICE_SUBTREE_REMOTE
git remote add notification-service-api $NOTIFICATION_SERVICE_SUBTREE_REMOTE
git remote add payment-service-api $PAYMENT_SERVICE_SUBTREE_REMOTE

trap tail_log EXIT
tail_log()
{
    tail  ~/push_subtree.log
}

echo 'pushing catarse.js...'
git subtree pull --prefix=services/catarse.js catarse.js $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/catarse.js catarse.js $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log

echo 'pushing catarse...'
git subtree pull --prefix=services/catarse catarse $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/catarse catarse $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log

echo 'pushing service-core-db...'
git subtree pull --prefix=services/service-core-db service-core-db $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/service-core-db service-core-db $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log

echo 'pushing common-api...'
git subtree pull --prefix=services/common-api common-api $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/common-api common-api $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log

echo 'pushing proxy...'
git subtree pull --prefix=services/proxy proxy $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/proxy proxy $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log

echo 'pushing hook-service-api...'
git subtree pull --prefix=services/hook-service-api hook-service-api $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/hook-service-api hook-service-api $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log

echo 'pushing notification-service-api...'
git subtree pull --prefix=services/notification-service-api notification-service-api $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/notification-service-api notification-service-api $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log

echo 'pushing payment-service-api...'
git subtree pull --prefix=services/payment-service-api payment-service-api $SUBTREE_BRANCH &> ~/push_subtree.log
git subtree push --prefix=services/payment-service-api payment-service-api $SUBTREE_BRANCH &> ~/push_subtree.log
tail  ~/push_subtree.log
