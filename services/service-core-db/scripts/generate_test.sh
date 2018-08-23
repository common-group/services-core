#!/bin/bash

dir=`dirname $0`
service=$1
endpoint=$2

mkdir -p $dir/../specs/api-specs/${service}/test/
echo "
---
- config:
  - testset: \""${endpoint}\""
- test:
  - name: \""Basic get\""
  - url: \""/${endpoint}\""
" > $dir/../specs/api-specs/${service}/test/${endpoint}.yml

echo "Created ${endpoint} test at specs/api-specs/${service}/test/${endpoint}.yml"
