-- Your SQL goes here
create extension if not exists pgcrypto;
CREATE SCHEMA core;

-- ADD core_settings 
CREATE TABLE core.core_settings (
    id serial primary key,
    name varchar(100) unique not null,
    value text not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);
select diesel_manage_updated_at('core.core_settings');
COMMENT ON TABLE core.core_settings IS 'hold global settings for another services';

CREATE OR REPLACE FUNCTION core.get_setting(varchar(100)) returns text
    language SQL
    stable
    as $$
        select value from core.core_settings cs where cs.name = $1
    $$;
COMMENT ON FUNCTION core.get_setting(varchar(100)) IS 'Get a value from a core settings on database';

-- ADD JWT handle functions to core


CREATE OR REPLACE FUNCTION core.url_encode(data bytea) RETURNS text LANGUAGE sql AS $$
    SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;


CREATE OR REPLACE FUNCTION core.url_decode(data text) RETURNS bytea LANGUAGE sql AS $$
WITH t AS (SELECT translate(data, '-_', '+/') AS trans),
     rem AS (SELECT length(t.trans) % 4 AS remainder FROM t) -- compute padding size
    SELECT decode(
        t.trans ||
        CASE WHEN rem.remainder > 0
           THEN repeat('=', (4 - rem.remainder))
           ELSE '' END,
    'base64') FROM t, rem;
$$;


CREATE OR REPLACE FUNCTION core.algorithm_sign(signables text, secret text, algorithm text)
RETURNS text LANGUAGE sql AS $$
WITH
  alg AS (
    SELECT CASE
      WHEN algorithm = 'HS256' THEN 'sha256'
      WHEN algorithm = 'HS384' THEN 'sha384'
      WHEN algorithm = 'HS512' THEN 'sha512'
      ELSE '' END AS id)  -- hmac throws error
SELECT core.url_encode(hmac(signables, secret, alg.id)) FROM alg;
$$;


CREATE OR REPLACE FUNCTION core.sign(payload json, secret text, algorithm text DEFAULT 'HS256')
RETURNS text LANGUAGE sql AS $$
WITH
  header AS (
    SELECT core.url_encode(convert_to('{"alg":"' || algorithm || '","typ":"JWT"}', 'utf8')) AS data
    ),
  payload AS (
    SELECT core.url_encode(convert_to(payload::text, 'utf8')) AS data
    ),
  signables AS (
    SELECT header.data || '.' || payload.data AS data FROM header, payload
    )
SELECT
    signables.data || '.' ||
    core.algorithm_sign(signables.data, secret, algorithm) FROM signables;
$$;


CREATE OR REPLACE FUNCTION core.verify(token text, secret text, algorithm text DEFAULT 'HS256')
RETURNS table(header json, payload json, valid boolean) LANGUAGE sql AS $$
  SELECT
    convert_from(core.url_decode(r[1]), 'utf8')::json AS header,
    convert_from(core.url_decode(r[2]), 'utf8')::json AS payload,
    r[3] = core.algorithm_sign(r[1] || '.' || r[2], secret, algorithm) AS valid
  FROM regexp_split_to_array(token, '\.') r;
$$;