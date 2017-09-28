CREATE SERVER comum_metrics_server FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'localhost', dbname 'comum_metrics_service', port '5433');

CREATE USER MAPPING FOR username
SERVER comum_metrics_server OPTIONS (user '', password '');
