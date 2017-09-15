#!/bin/bash
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-services_core_development}
DB_USER=${DB_USER:-postgres}
DB_PORT=${DB_PORT:-5432}
echo "dumping database"
pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT -O -s $DB_NAME > specs/database/schema.sql
