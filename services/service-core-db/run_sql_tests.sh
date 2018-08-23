#!/bin/bash
docker run -t --rm -v $(pwd)/specs:/specs --link pg_default:localhost comum/pgtap -h localhost -u postgres -w example -d test_tap_services_core -t '/specs/sql-specs/*/*.sql'
