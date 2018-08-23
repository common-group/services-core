FROM comum/payment-service:latest
WORKDIR /usr/app
CMD pg-dispatcher --db-uri=$DATABASE_URL --tls-mode=$TLS_MODE --redis-uri=$REDIS_URL --channel=$DB_CHANNEL --workers=$WORKERS --exec="./scripts/process_payment.js"
