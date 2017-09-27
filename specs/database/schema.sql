--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.5
-- Dumped by pg_dump version 9.6.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: analytics_service; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA analytics_service;


--
-- Name: analytics_service_api; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA analytics_service_api;


--
-- Name: community_service; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA community_service;


--
-- Name: community_service_api; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA community_service_api;


--
-- Name: core; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA core;


--
-- Name: payment_service; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA payment_service;


--
-- Name: payment_service_api; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA payment_service_api;


--
-- Name: platform_service; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA platform_service;


--
-- Name: platform_service_api; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA platform_service_api;


--
-- Name: project_service; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA project_service;


--
-- Name: project_service_api; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA project_service_api;


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = core, pg_catalog;

--
-- Name: jwt_token; Type: TYPE; Schema: core; Owner: -
--

CREATE TYPE jwt_token AS (
	token text
);


SET search_path = project_service, pg_catalog;

--
-- Name: project_mode; Type: TYPE; Schema: project_service; Owner: -
--

CREATE TYPE project_mode AS ENUM (
    'aon',
    'flex',
    'sub'
);


--
-- Name: new_project_record; Type: TYPE; Schema: project_service; Owner: -
--

CREATE TYPE new_project_record AS (
	id bigint,
	name text,
	mode project_mode,
	key uuid
);


SET search_path = community_service_api, pg_catalog;

--
-- Name: generate_scoped_user_key(uuid); Type: FUNCTION; Schema: community_service_api; Owner: -
--

CREATE FUNCTION generate_scoped_user_key(user_key uuid) RETURNS core.jwt_token
    LANGUAGE plpgsql STABLE
    AS $_$
        declare
            _platform platform_service.platforms;
            _user community_service.users;
            _result core.jwt_token;
        begin
            select * from platform_service.platforms p 
                where p.token = core.current_platform_token()
                into _platform;

            if _platform is null then
                raise exception 'invalid platform';
            end if;

            select * from community_service.users cu
                where cu.platform_id = _platform.id
                    and cu.key = $1
                into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;


            select core.gen_jwt_token(json_build_object(
                'role', 'scoped_user',
                'user_id', _user.id,
                'platform_token', core.current_platform_token(),
                'exp', extract(epoch from now())::integer + (60*60)*2
            )) into _result;

            return _result;
        end;
    $_$;


SET search_path = core, pg_catalog;

--
-- Name: algorithm_sign(text, text, text); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION algorithm_sign(signables text, secret text, algorithm text) RETURNS text
    LANGUAGE sql
    AS $$
WITH
  alg AS (
    SELECT CASE
      WHEN algorithm = 'HS256' THEN 'sha256'
      WHEN algorithm = 'HS384' THEN 'sha384'
      WHEN algorithm = 'HS512' THEN 'sha512'
      ELSE '' END AS id)  -- hmac throws error
SELECT core.url_encode(hmac(signables, secret, alg.id)) FROM alg;
$$;


--
-- Name: current_platform_id(); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION current_platform_id() RETURNS integer
    LANGUAGE sql STABLE
    AS $$
        select id from platform_service.platforms where token = core.current_platform_token();
    $$;


--
-- Name: current_platform_token(); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION current_platform_token() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
        BEGIN
          RETURN nullif(current_setting('request.jwt.claim.platform_token'), '')::uuid;
        EXCEPTION
            WHEN others THEN
            RETURN NULL::integer;
        END
    $$;


--
-- Name: FUNCTION current_platform_token(); Type: COMMENT; Schema: core; Owner: -
--

COMMENT ON FUNCTION current_platform_token() IS 'Get platform uuid token from jwt';


--
-- Name: current_user_id(); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION current_user_id() RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN nullif(current_setting('request.jwt.claim.user_id'), '')::integer;
EXCEPTION
WHEN others THEN
  RETURN NULL::integer;
END
    $$;


--
-- Name: FUNCTION current_user_id(); Type: COMMENT; Schema: core; Owner: -
--

COMMENT ON FUNCTION current_user_id() IS 'Returns the user_id decoded on jwt';


--
-- Name: gen_jwt_token(json); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION gen_jwt_token(json) RETURNS jwt_token
    LANGUAGE sql STABLE
    AS $_$
        select core.sign($1, core.get_setting('jwt_secret'));
    $_$;


--
-- Name: FUNCTION gen_jwt_token(json); Type: COMMENT; Schema: core; Owner: -
--

COMMENT ON FUNCTION gen_jwt_token(json) IS 'Generate a signed jwt';


--
-- Name: get_setting(character varying); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION get_setting(character varying) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
        select value from core.core_settings cs where cs.name = $1
    $_$;


--
-- Name: FUNCTION get_setting(character varying); Type: COMMENT; Schema: core; Owner: -
--

COMMENT ON FUNCTION get_setting(character varying) IS 'Get a value from a core settings on database';


--
-- Name: is_owner_or_admin(integer); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION is_owner_or_admin(integer) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
        SELECT
            core.current_user_id() = $1
            OR current_user = 'admin';
    $_$;


--
-- Name: FUNCTION is_owner_or_admin(integer); Type: COMMENT; Schema: core; Owner: -
--

COMMENT ON FUNCTION is_owner_or_admin(integer) IS 'Check if current_role is admin or passed id match with current_user_id';


--
-- Name: sign(json, text, text); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION sign(payload json, secret text, algorithm text DEFAULT 'HS256'::text) RETURNS text
    LANGUAGE sql
    AS $$
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


--
-- Name: url_decode(text); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION url_decode(data text) RETURNS bytea
    LANGUAGE sql
    AS $$
WITH t AS (SELECT translate(data, '-_', '+/') AS trans),
     rem AS (SELECT length(t.trans) % 4 AS remainder FROM t) -- compute padding size
    SELECT decode(
        t.trans ||
        CASE WHEN rem.remainder > 0
           THEN repeat('=', (4 - rem.remainder))
           ELSE '' END,
    'base64') FROM t, rem;
$$;


--
-- Name: url_encode(bytea); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION url_encode(data bytea) RETURNS text
    LANGUAGE sql
    AS $$
    SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;


--
-- Name: verify(text, text, text); Type: FUNCTION; Schema: core; Owner: -
--

CREATE FUNCTION verify(token text, secret text, algorithm text DEFAULT 'HS256'::text) RETURNS TABLE(header json, payload json, valid boolean)
    LANGUAGE sql
    AS $$
  SELECT
    convert_from(core.url_decode(r[1]), 'utf8')::json AS header,
    convert_from(core.url_decode(r[2]), 'utf8')::json AS payload,
    r[3] = core.algorithm_sign(r[1] || '.' || r[2], secret, algorithm) AS valid
  FROM regexp_split_to_array(token, '\.') r;
$$;


SET search_path = payment_service_api, pg_catalog;

--
-- Name: create_payment(json); Type: FUNCTION; Schema: payment_service_api; Owner: -
--

CREATE FUNCTION create_payment(data json) RETURNS json
    LANGUAGE plpgsql
    AS $_$
        declare
            _result json;
            _payment payment_service.catalog_payments;
            _user_id bigint;
            _project project_service.projects;
            _subscription payment_service.subscriptions;
        begin
            if current_role = 'platform_user' or current_role = 'admin' then
                _user_id := ($1 ->> 'user_id')::bigint;
            else
                _user_id := core.current_user_id();
            end if;

            if _user_id is null then
                raise exception 'missing user';
            end if;

            if ($1->>'project_id') is null OR not exists(select * from project_service.projects psp
                where psp.id = ($1->>'project_id')::bigint
                    and psp.platform_id = core.current_platform_id()) then
                raise exception 'project not found on platform';
            end if;

            insert into payment_service.catalog_payments (
                platform_id, project_id, user_id, data, gateway
            ) values (
                core.current_platform_id(),
                ($1->>'project_id')::bigint,
                _user_id,
                $1,
                coalesce(($1->>'gateway')::text, 'pagarme')
            ) returning * into _payment;

            if ($1->>'subscription')::boolean then
                insert into payment_service.subscriptions (
                    platform_id, project_id, user_id
                ) values (_payment.platform_id, _payment.project_id, _payment.user_id)
                returning * into _subscription;

                update payment_service.catalog_payments
                    set subscription_id = _subscription.id
                    where id = _payment.id;
            end if;

            select json_build_object(
                'id', _payment.id,
                'subscription_id', _subscription.id
            ) into _result;

            PERFORM pg_notify('process_payments_channel', _result::text);

            return _result;
        end;
    $_$;


--
-- Name: FUNCTION create_payment(data json); Type: COMMENT; Schema: payment_service_api; Owner: -
--

COMMENT ON FUNCTION create_payment(data json) IS 'Catalog new payment for processing and return id';


SET search_path = platform_service, pg_catalog;

--
-- Name: user_in_platform(integer, integer); Type: FUNCTION; Schema: platform_service; Owner: -
--

CREATE FUNCTION user_in_platform(user_id integer, platform_id integer) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
        select exists(select true from platform_service.platform_users pu where pu.user_id = $1 and pu.platform_id = $2);
    $_$;


--
-- Name: FUNCTION user_in_platform(user_id integer, platform_id integer); Type: COMMENT; Schema: platform_service; Owner: -
--

COMMENT ON FUNCTION user_in_platform(user_id integer, platform_id integer) IS 'Check if inputed user has access on inputed platform';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: platforms; Type: TABLE; Schema: platform_service; Owner: -
--

CREATE TABLE platforms (
    id integer NOT NULL,
    name text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    token uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE platforms; Type: COMMENT; Schema: platform_service; Owner: -
--

COMMENT ON TABLE platforms IS 'hold platforms names/configurations';


SET search_path = platform_service_api, pg_catalog;

--
-- Name: create_platform(text); Type: FUNCTION; Schema: platform_service_api; Owner: -
--

CREATE FUNCTION create_platform(name text) RETURNS platform_service.platforms
    LANGUAGE plpgsql
    AS $_$
        declare
            platform platform_service.platforms;
        begin
            insert into platform_service.platforms(name)
                values($1)
            returning * into platform;

            insert into platform_service.platform_users (user_id, platform_id)
                values (core.current_user_id(), platform.id);

            return platform;
        end;
    $_$;


--
-- Name: FUNCTION create_platform(name text); Type: COMMENT; Schema: platform_service_api; Owner: -
--

COMMENT ON FUNCTION create_platform(name text) IS 'Create a new platform on current logged platform user';


SET search_path = platform_service, pg_catalog;

--
-- Name: platform_api_keys; Type: TABLE; Schema: platform_service; Owner: -
--

CREATE TABLE platform_api_keys (
    id integer NOT NULL,
    platform_id integer NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    disabled_at timestamp without time zone
);


--
-- Name: platform_users; Type: TABLE; Schema: platform_service; Owner: -
--

CREATE TABLE platform_users (
    id integer NOT NULL,
    user_id integer NOT NULL,
    platform_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE platform_users; Type: COMMENT; Schema: platform_service; Owner: -
--

COMMENT ON TABLE platform_users IS 'Manage platform user with platform';


SET search_path = platform_service_api, pg_catalog;

--
-- Name: api_keys; Type: VIEW; Schema: platform_service_api; Owner: -
--

CREATE VIEW api_keys AS
 SELECT pak.id,
    pak.platform_id,
    pak.token,
    pak.created_at,
    pak.disabled_at
   FROM (platform_service.platform_api_keys pak
     JOIN platform_service.platform_users pu ON ((pu.platform_id = pak.platform_id)))
  WHERE (core.is_owner_or_admin(pu.user_id) AND (pak.disabled_at IS NULL));


--
-- Name: VIEW api_keys; Type: COMMENT; Schema: platform_service_api; Owner: -
--

COMMENT ON VIEW api_keys IS 'List all api keys from platform that user have access';


--
-- Name: generate_api_key(integer); Type: FUNCTION; Schema: platform_service_api; Owner: -
--

CREATE FUNCTION generate_api_key(platform_id integer) RETURNS api_keys
    LANGUAGE plpgsql
    AS $_$
        declare
            _platform_token uuid;
            _result platform_service.platform_api_keys;
        begin
            if not platform_service.user_in_platform(core.current_user_id(), $1) then
                raise exception 'insufficient permissions to do this action';
            end if;

            select token from platform_service.platforms p where p.id = $1
                into _platform_token;

            insert into platform_service.platform_api_keys(platform_id, token)
                values ($1, core.gen_jwt_token(json_build_object(
                    'role', 'platform_user',
                    'platform_token', _platform_token,
                    'gen_at', extract(epoch from now())::integer
                )))
            returning * into _result;

            return _result;
        end;
    $_$;


--
-- Name: FUNCTION generate_api_key(platform_id integer); Type: COMMENT; Schema: platform_service_api; Owner: -
--

COMMENT ON FUNCTION generate_api_key(platform_id integer) IS 'Generate a new API_KEY for given platform';


--
-- Name: login(text, text); Type: FUNCTION; Schema: platform_service_api; Owner: -
--

CREATE FUNCTION login(email text, password text) RETURNS core.jwt_token
    LANGUAGE plpgsql
    AS $_$
declare
    _user platform_service.users;
    result core.jwt_token;
begin
    select
        u.*
    from platform_service.users u
        where lower(u.email) = lower($1)
            and u.password = crypt($2, u.password)
        into _user;

    if _user is null then
        raise invalid_password using message = 'invalid user or password';
    end if;

    select core.gen_jwt_token(
        row_to_json(r)
    ) as token
    from (
        select
            'platform_user' as role,
            _user.id as user_id,
            extract(epoch from now())::integer + (60*60)*2 as exp
    ) r
    into result;

    return result;
end;
$_$;


--
-- Name: FUNCTION login(email text, password text); Type: COMMENT; Schema: platform_service_api; Owner: -
--

COMMENT ON FUNCTION login(email text, password text) IS 'Handles with platform users authentication';


--
-- Name: sign_up(text, text, text); Type: FUNCTION; Schema: platform_service_api; Owner: -
--

CREATE FUNCTION sign_up(name text, email text, password text) RETURNS core.jwt_token
    LANGUAGE plpgsql
    AS $$
    declare
        _user platform_service.users;
        result core.jwt_token;
    begin
        insert into platform_service.users(name, email, password)
            values (name, email, crypt(password, gen_salt('bf')))
            returning * into _user;

        select core.gen_jwt_token(
            row_to_json(r)
        ) as token
        from (
            select
                'platform_user' as role,
                _user.id as user_id,
                extract(epoch from now())::integer + (60*60)*2 as exp
        ) r
        into result;

        return result;
    end;
$$;


--
-- Name: FUNCTION sign_up(name text, email text, password text); Type: COMMENT; Schema: platform_service_api; Owner: -
--

COMMENT ON FUNCTION sign_up(name text, email text, password text) IS 'Handles with creation of new platform users';


SET search_path = project_service_api, pg_catalog;

--
-- Name: create_project(json); Type: FUNCTION; Schema: project_service_api; Owner: -
--

CREATE FUNCTION create_project(project json) RETURNS project_service.new_project_record
    LANGUAGE plpgsql
    AS $$
    declare
        _platform platform_service.platforms;
        _user community_service.users;
        _result project_service.new_project_record;
    begin
        select * from community_service.users cu
            where cu.id = (project ->> 'user_id')::bigint
                and cu.platform_id = core.current_platform_id()
            into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;

            insert into project_service.projects (
                platform_id, user_id, name, mode
            ) values (core.current_platform_id(), _user.id, project ->> 'name', (project ->> 'mode')::project_service.project_mode)
            returning id, name, mode, key into _result;

            return _result;
    end;
$$;


--
-- Name: FUNCTION create_project(project json); Type: COMMENT; Schema: project_service_api; Owner: -
--

COMMENT ON FUNCTION create_project(project json) IS 'Create a new project for user and platform, can be used only by platform api key';


SET search_path = public, pg_catalog;

--
-- Name: diesel_manage_updated_at(regclass); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION diesel_manage_updated_at(_tbl regclass) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %s
                    FOR EACH ROW EXECUTE PROCEDURE diesel_set_updated_at()', _tbl);
END;
$$;


--
-- Name: diesel_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION diesel_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (
        NEW IS DISTINCT FROM OLD AND
        NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at
    ) THEN
        NEW.updated_at := current_timestamp;
    END IF;
    RETURN NEW;
END;
$$;


SET search_path = community_service, pg_catalog;

--
-- Name: users; Type: TABLE; Schema: community_service; Owner: -
--

CREATE TABLE users (
    platform_id integer NOT NULL,
    id bigint NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    key uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    CONSTRAINT users_email_check CHECK ((email ~* '^.+@.+\..+$'::text)),
    CONSTRAINT users_name_check CHECK ((length(name) < 255)),
    CONSTRAINT users_password_check CHECK ((length(password) < 512))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: community_service; Owner: -
--

COMMENT ON TABLE users IS 'Stores community users';


SET search_path = analytics_service_api, pg_catalog;

--
-- Name: users_count; Type: VIEW; Schema: analytics_service_api; Owner: -
--

CREATE VIEW analytics_service_api.users_count AS 
 SELECT count(*) AS users
   FROM community_service.users
  WHERE users.platform_id = core.current_platform_id();


--
-- Name: VIEW users_count; Type: COMMENT; Schema: analytics_service_api; Owner: -
--

COMMENT ON VIEW users_count IS 'Shows the number of users on actual platform';


SET search_path = community_service, pg_catalog;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: community_service; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: community_service; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


SET search_path = core, pg_catalog;

--
-- Name: core_settings; Type: TABLE; Schema: core; Owner: -
--

CREATE TABLE core_settings (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    value text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE core_settings; Type: COMMENT; Schema: core; Owner: -
--

COMMENT ON TABLE core_settings IS 'hold global settings for another services';


--
-- Name: core_settings_id_seq; Type: SEQUENCE; Schema: core; Owner: -
--

CREATE SEQUENCE core_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: core_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: core; Owner: -
--

ALTER SEQUENCE core_settings_id_seq OWNED BY core_settings.id;


SET search_path = payment_service, pg_catalog;

--
-- Name: catalog_payments; Type: TABLE; Schema: payment_service; Owner: -
--

CREATE TABLE catalog_payments (
    id bigint NOT NULL,
    platform_id integer NOT NULL,
    project_id bigint NOT NULL,
    user_id bigint NOT NULL,
    subscription_id bigint,
    data jsonb NOT NULL,
    gateway text NOT NULL,
    gateway_cached_data jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE catalog_payments; Type: COMMENT; Schema: payment_service; Owner: -
--

COMMENT ON TABLE catalog_payments IS 'Store initial payments data to sent to queue';


--
-- Name: catalog_payments_id_seq; Type: SEQUENCE; Schema: payment_service; Owner: -
--

CREATE SEQUENCE catalog_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: catalog_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: payment_service; Owner: -
--

ALTER SEQUENCE catalog_payments_id_seq OWNED BY catalog_payments.id;


--
-- Name: credit_cards; Type: TABLE; Schema: payment_service; Owner: -
--

CREATE TABLE credit_cards (
    id bigint NOT NULL,
    platform_id integer NOT NULL,
    user_id bigint NOT NULL,
    gateway text NOT NULL,
    gateway_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE credit_cards; Type: COMMENT; Schema: payment_service; Owner: -
--

COMMENT ON TABLE credit_cards IS 'Store gateway credit_cards references';


--
-- Name: credit_cards_id_seq; Type: SEQUENCE; Schema: payment_service; Owner: -
--

CREATE SEQUENCE credit_cards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: credit_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: payment_service; Owner: -
--

ALTER SEQUENCE credit_cards_id_seq OWNED BY credit_cards.id;


--
-- Name: subscription_transitions; Type: TABLE; Schema: payment_service; Owner: -
--

CREATE TABLE subscription_transitions (
    id bigint NOT NULL,
    subscription_id bigint NOT NULL,
    to_status text NOT NULL,
    most_recent boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: subscription_transitions_id_seq; Type: SEQUENCE; Schema: payment_service; Owner: -
--

CREATE SEQUENCE subscription_transitions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscription_transitions_id_seq; Type: SEQUENCE OWNED BY; Schema: payment_service; Owner: -
--

ALTER SEQUENCE subscription_transitions_id_seq OWNED BY subscription_transitions.id;


--
-- Name: subscription_transitions_subscription_id_seq; Type: SEQUENCE; Schema: payment_service; Owner: -
--

CREATE SEQUENCE subscription_transitions_subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscription_transitions_subscription_id_seq; Type: SEQUENCE OWNED BY; Schema: payment_service; Owner: -
--

ALTER SEQUENCE subscription_transitions_subscription_id_seq OWNED BY subscription_transitions.subscription_id;


--
-- Name: subscriptions; Type: TABLE; Schema: payment_service; Owner: -
--

CREATE TABLE subscriptions (
    id bigint NOT NULL,
    platform_id integer NOT NULL,
    project_id bigint NOT NULL,
    user_id bigint NOT NULL,
    credit_card_id bigint,
    status text DEFAULT 'pending'::text NOT NULL,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE subscriptions; Type: COMMENT; Schema: payment_service; Owner: -
--

COMMENT ON TABLE subscriptions IS 'Store subscription transitions between charges';


--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: payment_service; Owner: -
--

CREATE SEQUENCE subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: payment_service; Owner: -
--

ALTER SEQUENCE subscriptions_id_seq OWNED BY subscriptions.id;


SET search_path = platform_service, pg_catalog;

--
-- Name: platform_api_keys_id_seq; Type: SEQUENCE; Schema: platform_service; Owner: -
--

CREATE SEQUENCE platform_api_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: platform_service; Owner: -
--

ALTER SEQUENCE platform_api_keys_id_seq OWNED BY platform_api_keys.id;


--
-- Name: platform_users_id_seq; Type: SEQUENCE; Schema: platform_service; Owner: -
--

CREATE SEQUENCE platform_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_users_id_seq; Type: SEQUENCE OWNED BY; Schema: platform_service; Owner: -
--

ALTER SEQUENCE platform_users_id_seq OWNED BY platform_users.id;


--
-- Name: platforms_id_seq; Type: SEQUENCE; Schema: platform_service; Owner: -
--

CREATE SEQUENCE platforms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platforms_id_seq; Type: SEQUENCE OWNED BY; Schema: platform_service; Owner: -
--

ALTER SEQUENCE platforms_id_seq OWNED BY platforms.id;


--
-- Name: users; Type: TABLE; Schema: platform_service; Owner: -
--

CREATE TABLE users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email_confirmed_at timestamp without time zone,
    disabled_at timestamp without time zone,
    CONSTRAINT users_email_check CHECK ((email ~* '^.+@.+\..+$'::text)),
    CONSTRAINT users_name_check CHECK ((length(name) < 255)),
    CONSTRAINT users_password_check CHECK ((length(password) < 512))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: platform_service; Owner: -
--

COMMENT ON TABLE users IS 'Platform admin users';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: platform_service; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: platform_service; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


SET search_path = project_service, pg_catalog;

--
-- Name: projects; Type: TABLE; Schema: project_service; Owner: -
--

CREATE TABLE projects (
    platform_id integer NOT NULL,
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name text NOT NULL,
    mode project_mode NOT NULL,
    key uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


--
-- Name: TABLE projects; Type: COMMENT; Schema: project_service; Owner: -
--

COMMENT ON TABLE projects IS 'store project data for platforms';


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: project_service; Owner: -
--

CREATE SEQUENCE projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: project_service; Owner: -
--

ALTER SEQUENCE projects_id_seq OWNED BY projects.id;


SET search_path = public, pg_catalog;

--
-- Name: __diesel_schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE __diesel_schema_migrations (
    version character varying(50) NOT NULL,
    run_on timestamp without time zone DEFAULT now() NOT NULL
);


SET search_path = community_service, pg_catalog;

--
-- Name: users id; Type: DEFAULT; Schema: community_service; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


SET search_path = core, pg_catalog;

--
-- Name: core_settings id; Type: DEFAULT; Schema: core; Owner: -
--

ALTER TABLE ONLY core_settings ALTER COLUMN id SET DEFAULT nextval('core_settings_id_seq'::regclass);


SET search_path = payment_service, pg_catalog;

--
-- Name: catalog_payments id; Type: DEFAULT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY catalog_payments ALTER COLUMN id SET DEFAULT nextval('catalog_payments_id_seq'::regclass);


--
-- Name: credit_cards id; Type: DEFAULT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY credit_cards ALTER COLUMN id SET DEFAULT nextval('credit_cards_id_seq'::regclass);


--
-- Name: subscription_transitions id; Type: DEFAULT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscription_transitions ALTER COLUMN id SET DEFAULT nextval('subscription_transitions_id_seq'::regclass);


--
-- Name: subscription_transitions subscription_id; Type: DEFAULT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscription_transitions ALTER COLUMN subscription_id SET DEFAULT nextval('subscription_transitions_subscription_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscriptions ALTER COLUMN id SET DEFAULT nextval('subscriptions_id_seq'::regclass);


SET search_path = platform_service, pg_catalog;

--
-- Name: platform_api_keys id; Type: DEFAULT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_api_keys ALTER COLUMN id SET DEFAULT nextval('platform_api_keys_id_seq'::regclass);


--
-- Name: platform_users id; Type: DEFAULT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_users ALTER COLUMN id SET DEFAULT nextval('platform_users_id_seq'::regclass);


--
-- Name: platforms id; Type: DEFAULT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platforms ALTER COLUMN id SET DEFAULT nextval('platforms_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


SET search_path = project_service, pg_catalog;

--
-- Name: projects id; Type: DEFAULT; Schema: project_service; Owner: -
--

ALTER TABLE ONLY projects ALTER COLUMN id SET DEFAULT nextval('projects_id_seq'::regclass);


SET search_path = community_service, pg_catalog;

--
-- Name: users uidx_platform_email; Type: CONSTRAINT; Schema: community_service; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT uidx_platform_email UNIQUE (platform_id, email);


--
-- Name: users users_key_key; Type: CONSTRAINT; Schema: community_service; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_key_key UNIQUE (key);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: community_service; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


SET search_path = core, pg_catalog;

--
-- Name: core_settings core_settings_name_key; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core_settings
    ADD CONSTRAINT core_settings_name_key UNIQUE (name);


--
-- Name: core_settings core_settings_pkey; Type: CONSTRAINT; Schema: core; Owner: -
--

ALTER TABLE ONLY core_settings
    ADD CONSTRAINT core_settings_pkey PRIMARY KEY (id);


SET search_path = payment_service, pg_catalog;

--
-- Name: catalog_payments catalog_payments_pkey; Type: CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY catalog_payments
    ADD CONSTRAINT catalog_payments_pkey PRIMARY KEY (id);


--
-- Name: credit_cards credit_cards_pkey; Type: CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY credit_cards
    ADD CONSTRAINT credit_cards_pkey PRIMARY KEY (id);


--
-- Name: subscription_transitions subscription_transitions_pkey; Type: CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscription_transitions
    ADD CONSTRAINT subscription_transitions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


SET search_path = platform_service, pg_catalog;

--
-- Name: platform_api_keys platform_api_keys_pkey; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_api_keys
    ADD CONSTRAINT platform_api_keys_pkey PRIMARY KEY (id);


--
-- Name: platform_api_keys platform_api_keys_token_key; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_api_keys
    ADD CONSTRAINT platform_api_keys_token_key UNIQUE (token);


--
-- Name: platform_users platform_users_pkey; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_users
    ADD CONSTRAINT platform_users_pkey PRIMARY KEY (id);


--
-- Name: platforms platforms_pkey; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platforms
    ADD CONSTRAINT platforms_pkey PRIMARY KEY (id);


--
-- Name: platforms platforms_token_key; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platforms
    ADD CONSTRAINT platforms_token_key UNIQUE (token);


--
-- Name: users uidx_users_email; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT uidx_users_email UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: platform_users uuidx_user_and_platform; Type: CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_users
    ADD CONSTRAINT uuidx_user_and_platform UNIQUE (user_id, platform_id);


SET search_path = project_service, pg_catalog;

--
-- Name: projects projects_key_key; Type: CONSTRAINT; Schema: project_service; Owner: -
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_key_key UNIQUE (key);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: project_service; Owner: -
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


SET search_path = public, pg_catalog;

--
-- Name: __diesel_schema_migrations __diesel_schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY __diesel_schema_migrations
    ADD CONSTRAINT __diesel_schema_migrations_pkey PRIMARY KEY (version);


SET search_path = core, pg_catalog;

--
-- Name: core_settings set_updated_at; Type: TRIGGER; Schema: core; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON core_settings FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


SET search_path = payment_service, pg_catalog;

--
-- Name: credit_cards set_updated_at; Type: TRIGGER; Schema: payment_service; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON credit_cards FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: subscriptions set_updated_at; Type: TRIGGER; Schema: payment_service; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: subscription_transitions set_updated_at; Type: TRIGGER; Schema: payment_service; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscription_transitions FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: catalog_payments set_updated_at; Type: TRIGGER; Schema: payment_service; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON catalog_payments FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


SET search_path = platform_service, pg_catalog;

--
-- Name: platforms set_updated_at; Type: TRIGGER; Schema: platform_service; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platforms FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: users set_updated_at; Type: TRIGGER; Schema: platform_service; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


--
-- Name: platform_users set_updated_at; Type: TRIGGER; Schema: platform_service; Owner: -
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_users FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


SET search_path = community_service, pg_catalog;

--
-- Name: users users_platform_id_fkey; Type: FK CONSTRAINT; Schema: community_service; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);


SET search_path = payment_service, pg_catalog;

--
-- Name: catalog_payments catalog_payments_platform_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY catalog_payments
    ADD CONSTRAINT catalog_payments_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);


--
-- Name: catalog_payments catalog_payments_project_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY catalog_payments
    ADD CONSTRAINT catalog_payments_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);


--
-- Name: catalog_payments catalog_payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY catalog_payments
    ADD CONSTRAINT catalog_payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);


--
-- Name: catalog_payments catalog_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY catalog_payments
    ADD CONSTRAINT catalog_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);


--
-- Name: credit_cards credit_cards_platform_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY credit_cards
    ADD CONSTRAINT credit_cards_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);


--
-- Name: credit_cards credit_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY credit_cards
    ADD CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);


--
-- Name: subscription_transitions subscription_transitions_subscription_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscription_transitions
    ADD CONSTRAINT subscription_transitions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);


--
-- Name: subscriptions subscriptions_credit_card_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscriptions
    ADD CONSTRAINT subscriptions_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id);


--
-- Name: subscriptions subscriptions_platform_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscriptions
    ADD CONSTRAINT subscriptions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);


--
-- Name: subscriptions subscriptions_project_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscriptions
    ADD CONSTRAINT subscriptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: payment_service; Owner: -
--

ALTER TABLE ONLY subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);


SET search_path = platform_service, pg_catalog;

--
-- Name: platform_api_keys platform_api_keys_platform_id_fkey; Type: FK CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_api_keys
    ADD CONSTRAINT platform_api_keys_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platforms(id);


--
-- Name: platform_users platform_users_platform_id_fkey; Type: FK CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_users
    ADD CONSTRAINT platform_users_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platforms(id);


--
-- Name: platform_users platform_users_user_id_fkey; Type: FK CONSTRAINT; Schema: platform_service; Owner: -
--

ALTER TABLE ONLY platform_users
    ADD CONSTRAINT platform_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


SET search_path = project_service, pg_catalog;

--
-- Name: projects projects_platform_id_fkey; Type: FK CONSTRAINT; Schema: project_service; Owner: -
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);


--
-- Name: projects projects_user_id_fkey; Type: FK CONSTRAINT; Schema: project_service; Owner: -
--

ALTER TABLE ONLY projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);


--
-- Name: analytics_service; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA analytics_service TO postgrest;
GRANT USAGE ON SCHEMA analytics_service TO platform_user;
GRANT USAGE ON SCHEMA analytics_service TO scoped_user;
GRANT USAGE ON SCHEMA analytics_service TO admin;


--
-- Name: analytics_service_api; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA analytics_service_api TO postgrest;
GRANT USAGE ON SCHEMA analytics_service_api TO platform_user;
GRANT USAGE ON SCHEMA analytics_service_api TO scoped_user;
GRANT USAGE ON SCHEMA analytics_service_api TO admin;


--
-- Name: community_service; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA community_service TO scoped_user;
GRANT USAGE ON SCHEMA community_service TO admin;
GRANT USAGE ON SCHEMA community_service TO anonymous;
GRANT USAGE ON SCHEMA community_service TO platform_user;


--
-- Name: community_service_api; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA community_service_api TO scoped_user;
GRANT USAGE ON SCHEMA community_service_api TO admin;
GRANT USAGE ON SCHEMA community_service_api TO anonymous;
GRANT USAGE ON SCHEMA community_service_api TO platform_user;


--
-- Name: core; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA core TO platform_user;
GRANT USAGE ON SCHEMA core TO scoped_user;
GRANT USAGE ON SCHEMA core TO anonymous;


--
-- Name: payment_service; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA payment_service TO platform_user;
GRANT USAGE ON SCHEMA payment_service TO scoped_user;
GRANT USAGE ON SCHEMA payment_service TO admin;


--
-- Name: payment_service_api; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA payment_service_api TO platform_user;
GRANT USAGE ON SCHEMA payment_service_api TO scoped_user;
GRANT USAGE ON SCHEMA payment_service_api TO admin;


--
-- Name: platform_service; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA platform_service TO platform_user;
GRANT USAGE ON SCHEMA platform_service TO admin;
GRANT USAGE ON SCHEMA platform_service TO anonymous;


--
-- Name: platform_service_api; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA platform_service_api TO platform_user;
GRANT USAGE ON SCHEMA platform_service_api TO admin;
GRANT USAGE ON SCHEMA platform_service_api TO anonymous;


--
-- Name: project_service; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA project_service TO platform_user;
GRANT USAGE ON SCHEMA project_service TO scoped_user;
GRANT USAGE ON SCHEMA project_service TO admin;


--
-- Name: project_service_api; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA project_service_api TO platform_user;
GRANT USAGE ON SCHEMA project_service_api TO scoped_user;
GRANT USAGE ON SCHEMA project_service_api TO admin;


SET search_path = community_service_api, pg_catalog;

--
-- Name: generate_scoped_user_key(uuid); Type: ACL; Schema: community_service_api; Owner: -
--

GRANT ALL ON FUNCTION generate_scoped_user_key(user_key uuid) TO platform_user;
GRANT ALL ON FUNCTION generate_scoped_user_key(user_key uuid) TO admin;


SET search_path = payment_service_api, pg_catalog;

--
-- Name: create_payment(json); Type: ACL; Schema: payment_service_api; Owner: -
--

GRANT ALL ON FUNCTION create_payment(data json) TO scoped_user;
GRANT ALL ON FUNCTION create_payment(data json) TO admin;
GRANT ALL ON FUNCTION create_payment(data json) TO platform_user;


SET search_path = platform_service, pg_catalog;

--
-- Name: platforms; Type: ACL; Schema: platform_service; Owner: -
--

GRANT SELECT,INSERT ON TABLE platforms TO platform_user;
GRANT SELECT,INSERT ON TABLE platforms TO admin;


SET search_path = platform_service_api, pg_catalog;

--
-- Name: create_platform(text); Type: ACL; Schema: platform_service_api; Owner: -
--

GRANT ALL ON FUNCTION create_platform(name text) TO platform_user;


SET search_path = platform_service, pg_catalog;

--
-- Name: platform_api_keys; Type: ACL; Schema: platform_service; Owner: -
--

GRANT SELECT,INSERT ON TABLE platform_api_keys TO platform_user;
GRANT SELECT,INSERT ON TABLE platform_api_keys TO admin;


--
-- Name: platform_users; Type: ACL; Schema: platform_service; Owner: -
--

GRANT SELECT,INSERT ON TABLE platform_users TO platform_user;
GRANT SELECT,INSERT ON TABLE platform_users TO admin;


SET search_path = platform_service_api, pg_catalog;

--
-- Name: api_keys; Type: ACL; Schema: platform_service_api; Owner: -
--

GRANT SELECT ON TABLE api_keys TO admin;
GRANT SELECT ON TABLE api_keys TO platform_user;


--
-- Name: generate_api_key(integer); Type: ACL; Schema: platform_service_api; Owner: -
--

GRANT ALL ON FUNCTION generate_api_key(platform_id integer) TO platform_user;
GRANT ALL ON FUNCTION generate_api_key(platform_id integer) TO admin;


--
-- Name: login(text, text); Type: ACL; Schema: platform_service_api; Owner: -
--

GRANT ALL ON FUNCTION login(email text, password text) TO anonymous;


--
-- Name: sign_up(text, text, text); Type: ACL; Schema: platform_service_api; Owner: -
--

GRANT ALL ON FUNCTION sign_up(name text, email text, password text) TO anonymous;


SET search_path = project_service_api, pg_catalog;

--
-- Name: create_project(json); Type: ACL; Schema: project_service_api; Owner: -
--

GRANT ALL ON FUNCTION create_project(project json) TO platform_user;
GRANT ALL ON FUNCTION create_project(project json) TO admin;


SET search_path = community_service, pg_catalog;

--
-- Name: users; Type: ACL; Schema: community_service; Owner: -
--

GRANT SELECT ON TABLE users TO admin;
GRANT SELECT ON TABLE users TO anonymous;
GRANT SELECT ON TABLE users TO platform_user;
GRANT SELECT ON TABLE users TO scoped_user;


SET search_path = analytics_service_api, pg_catalog;

--
-- Name: users_count; Type: ACL; Schema: analytics_service_api; Owner: -
--

GRANT SELECT ON TABLE users_count TO platform_user;
GRANT SELECT ON TABLE users_count TO scoped_user;
GRANT SELECT ON TABLE users_count TO admin;


SET search_path = core, pg_catalog;

--
-- Name: core_settings; Type: ACL; Schema: core; Owner: -
--

GRANT SELECT ON TABLE core_settings TO anonymous;
GRANT SELECT ON TABLE core_settings TO platform_user;
GRANT SELECT ON TABLE core_settings TO scoped_user;


SET search_path = payment_service, pg_catalog;

--
-- Name: catalog_payments; Type: ACL; Schema: payment_service; Owner: -
--

GRANT SELECT,INSERT,UPDATE ON TABLE catalog_payments TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE catalog_payments TO admin;
GRANT SELECT,INSERT,UPDATE ON TABLE catalog_payments TO platform_user;


--
-- Name: catalog_payments_id_seq; Type: ACL; Schema: payment_service; Owner: -
--

GRANT USAGE ON SEQUENCE catalog_payments_id_seq TO platform_user;
GRANT USAGE ON SEQUENCE catalog_payments_id_seq TO scoped_user;
GRANT USAGE ON SEQUENCE catalog_payments_id_seq TO admin;


--
-- Name: subscriptions; Type: ACL; Schema: payment_service; Owner: -
--

GRANT SELECT,INSERT,UPDATE ON TABLE subscriptions TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE subscriptions TO admin;
GRANT SELECT,INSERT,UPDATE ON TABLE subscriptions TO platform_user;


--
-- Name: subscriptions_id_seq; Type: ACL; Schema: payment_service; Owner: -
--

GRANT USAGE ON SEQUENCE subscriptions_id_seq TO platform_user;
GRANT USAGE ON SEQUENCE subscriptions_id_seq TO scoped_user;
GRANT USAGE ON SEQUENCE subscriptions_id_seq TO admin;


SET search_path = platform_service, pg_catalog;

--
-- Name: platform_api_keys_id_seq; Type: ACL; Schema: platform_service; Owner: -
--

GRANT SELECT,UPDATE ON SEQUENCE platform_api_keys_id_seq TO admin;
GRANT SELECT,UPDATE ON SEQUENCE platform_api_keys_id_seq TO platform_user;


--
-- Name: platform_users_id_seq; Type: ACL; Schema: platform_service; Owner: -
--

GRANT ALL ON SEQUENCE platform_users_id_seq TO admin;
GRANT ALL ON SEQUENCE platform_users_id_seq TO platform_user;


--
-- Name: platforms_id_seq; Type: ACL; Schema: platform_service; Owner: -
--

GRANT ALL ON SEQUENCE platforms_id_seq TO admin;
GRANT ALL ON SEQUENCE platforms_id_seq TO platform_user;


--
-- Name: users; Type: ACL; Schema: platform_service; Owner: -
--

GRANT SELECT,INSERT ON TABLE users TO admin;
GRANT SELECT,INSERT ON TABLE users TO anonymous;
GRANT SELECT,INSERT ON TABLE users TO platform_user;


--
-- Name: users_id_seq; Type: ACL; Schema: platform_service; Owner: -
--

GRANT ALL ON SEQUENCE users_id_seq TO admin;
GRANT ALL ON SEQUENCE users_id_seq TO anonymous;
GRANT ALL ON SEQUENCE users_id_seq TO platform_user;


SET search_path = project_service, pg_catalog;

--
-- Name: projects; Type: ACL; Schema: project_service; Owner: -
--

GRANT SELECT,INSERT ON TABLE projects TO admin;
GRANT SELECT ON TABLE projects TO anonymous;
GRANT SELECT,INSERT ON TABLE projects TO platform_user;
GRANT SELECT ON TABLE projects TO scoped_user;


--
-- Name: projects_id_seq; Type: ACL; Schema: project_service; Owner: -
--

GRANT USAGE ON SEQUENCE projects_id_seq TO platform_user;
GRANT USAGE ON SEQUENCE projects_id_seq TO admin;


--
-- PostgreSQL database dump complete
--

