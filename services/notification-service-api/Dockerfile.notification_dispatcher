FROM comum/notification-service:latest
WORKDIR /usr/app
CMD pg-dispatcher --db-uri=$DISPATCHER_DATABASE_URL --tls-mode=$DISPATCHER_TLS_MODE --redis-uri=$DISPATCHER_REDIS_URL --channel=$DISPATCHER_DB_CHANNEL --workers=$DISPATCHER_WORKERS --exec="./scripts/send_mail.js"
