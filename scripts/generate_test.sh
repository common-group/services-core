#!/bin/bash

service=$1
endpoint=$2

echo "
---
- config:
  - testset: \""${endpoint}\""
- test:
  - name: \""Basic get\""
  - url: \""/${endpoint}\""
" > specs/api-specs/${service}/test/${endpoint}.yml

echo "Created ${endpoint} test at specs/api-specs/${service}/test/${endpoint}.yml"
