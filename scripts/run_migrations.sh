#!/bin/bash
diesel migration --database-url=$DATABASE_URL run 2>&1
