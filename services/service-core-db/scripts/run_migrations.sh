#!/bin/bash
echo "run_service_migrations > $DATABASE_URL"
diesel migration --database-url=$DATABASE_URL run 2>&1
