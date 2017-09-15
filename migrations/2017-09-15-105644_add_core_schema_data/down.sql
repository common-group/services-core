-- This file should undo anything in `up.sql`
DROP FUNCTION core.verify(token text, secret text, algorithm text);
DROP FUNCTION core.sign(payload json, secret text, algorithm text);
DROP FUNCTION core.algorithm_sign(signables text, secret text, algorithm text);
DROP FUNCTION core.url_encode(data bytea);
DROP FUNCTION core.url_decode(data text);
DROP FUNCTION core.get_setting(varchar(100));
DROP TABLE core.core_settings;
DROP SCHEMA core;