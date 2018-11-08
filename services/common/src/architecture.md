# Architecture

Common platform as designed to be a open source crowdfunding platform as service API

  * **Ruby on Rails 5.2**: Used for a write API service
  * **PostgREST 0.4.4**: Used for expose read schemas from database to API
  * **Nginx/Openresty**: Used for reverse proxy and routing for REST API endpoints
  * **PostgreSQL**: Used as database
  * **pg-dispatcher**: Listener from events on database to some code action
  * **Redis** : Used for storage and cache for background processing
