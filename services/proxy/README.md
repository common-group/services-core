# proxy

Use openresty/nginx as api gateway to transform api_keys on internal services tokens and proxy requests to correct services and check and generate 

Checkout how running common-group platform on with [docker-compose example](https://comum.readme.io/docs/running-docker-compose)


### How add new locations

**example for projects collection**

mapping new root collection sunch as '/:version/:collection/' (/v1/projects):

add new collection entry to mapped version inside conf.d/proxy.template

```nginx
# conf.d/proxy.template
location ~ "^/v1/" {
  location ~ "^/v1/projects(?:\/)?.*$" {
    # you new code here
  }
}
```

add nested routes for collection

create a new file for collection: ```touch conf.d/locations/projects_location.conf```
and edit the proxy.template to include the file with new locations
```nginx
# conf.d/proxy.template
location ~ "^/v1/" {
  location ~ "^/v1/projects(?:\/)?.*$" {
    include /etc/nginx/conf.d/locations/v1/projects_location.conf;
  }
}
```

mapping new locations on collection inside the new location conf:

```nginx
# conf.d/locations/projects_location.conf
location ~ "^/v1/projects/([\w\d\-]+)/fund_stats$" {
	set $args "${args}${token}id=$1";
	proxy_set_header Host $host_analytics_service_api;

	proxy_pass $env_proto_schema://analytics_service_api_server/rpc/project_subscribers_info$is_args$args;
}
```

### Testing
We provide a simple test.sh that executes a docker build on Dockerfile.test with a syntax check on nginx configuration files

### Heroku cli deploying

Uses the Dockerfile.web has web in heroku dynos

```shell
heroku container:push web --recursive -a APPLICATION_NAME
heroku container:release web -a APPLICATION_NAME
```
