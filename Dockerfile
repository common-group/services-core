#FROM library/nginx:alpine
FROM openresty/openresty:alpine-fat

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/proxy.template /etc/nginx/conf.d/proxy.template
