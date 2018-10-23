# HTTP API - Route index

## AUTH / Platform-ID tokens

Most routes need auth tokens to proceed.

- Anonymous user:
    - Need to pass Header -> Platform-Code: PLATFORM_CODE, in order to know what platform user are trying to access.

- Authenticated user:
    - Need to pass Header -> Authorization: Bearer API_KEY

## Request filters and paginations:

- Pagination params: ?page=X&per_page=X
    - page: 1..X
    - per_page: 1..20
- Filters:
    - Horizontal column filters: http://postgrest.org/en/v4.4/api.html#horizontal-filtering-rows

## Hosts

- Production: api.comum.io
- Sandbox: api.sandbox.comum.io

## Routes index:

### POST - /v1/users/login
### POST - /v1/users/logout
### POST - /v1/api_keys
### DELETE - /v1/api_keys/:API_KEY_ID

### GET - /v1/projects
### GET - /v1/projects/:PROJECT_ID/fund_stats
### GET - /v1/projects/:PROJECT_ID/subscriptions_per_month
### GET - /v1/projects/:PROJECT_ID/subscriptions_per_day
### GET - /v1/projects/:PROJECT_ID/subscribers
### GET - /v1/projects/:PROJECT_ID/subscriptions
### GET - /v1/projects/:PROJECT_ID/finish

### GET - /v1/projects/:PROJECT_ID/goals
### GET - /v1/projects/:PROJECT_ID/goals/:GOAL_ID
### POST - /v1/projects/:PROJECT_ID/goals
### PUT - /v1/projects/:PROJECT_ID/goals/:GOAL_ID




