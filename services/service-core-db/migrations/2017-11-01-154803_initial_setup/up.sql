-- Your SQL goes here

CREATE SCHEMA analytics_service;
CREATE SCHEMA analytics_service_api;
CREATE SCHEMA community_service;
CREATE SCHEMA community_service_api;
CREATE SCHEMA core;


CREATE SCHEMA core_validator;
CREATE SCHEMA payment_service;
CREATE SCHEMA payment_service_api;
CREATE SCHEMA platform_service;
CREATE SCHEMA platform_service_api;
CREATE SCHEMA project_service;
CREATE SCHEMA project_service_api;

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

CREATE DOMAIN email AS citext
	CONSTRAINT email_check CHECK ((VALUE ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'::citext));

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


CREATE TYPE core.jwt_token AS (
	token text
);

CREATE TYPE project_service.project_mode AS ENUM (
    'aon',
    'flex',
    'sub'
);

CREATE TYPE project_service.shipping_options_enum AS ENUM (
    'free',
    'national',
    'international',
    'presential'
);


CREATE TYPE payment_service.payment_status AS ENUM (
    'pending',
    'paid',
    'refused',
    'refunded',
    'chargedback',
    'deleted',
    'error'
);

CREATE TYPE payment_service.subscription_status AS ENUM (
    'started',
    'active',
    'inactive',
    'canceled',
    'deleted',
    'error'
);


CREATE TABLE core.core_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    value text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE core.core_settings IS 'hold global settings for another services';

CREATE TABLE platform_service.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
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
COMMENT ON TABLE platform_service.users IS 'Platform admin users';

CREATE TABLE platform_service.platforms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    token uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE platform_service.platforms IS 'hold platforms names/configurations';

CREATE TABLE platform_service.platform_api_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    disabled_at timestamp without time zone
);

CREATE TABLE platform_service.platform_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    platform_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE platform_service.platform_users IS 'Manage platform user with platform';

CREATE TABLE community_service.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    external_id text,
    email public.email NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    key uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    CONSTRAINT users_password_check CHECK ((length(password) < 512))
);
COMMENT ON TABLE community_service.users IS 'Stores community users';

CREATE TABLE community_service.user_versions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE payment_service.catalog_payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    subscription_id uuid,
    reward_id uuid,
    data jsonb NOT NULL,
    gateway text NOT NULL,
    gateway_cached_data jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    common_contract_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    gateway_general_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    status payment_service.payment_status DEFAULT 'pending' NOT NULL,
    external_id text
);

COMMENT ON TABLE payment_service.catalog_payments IS 'Store initial payments data to sent to queue';
CREATE TABLE payment_service.catalog_payment_versions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    catalog_payment_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE payment_service.catalog_payment_versions IS 'store catalog payment versions when need to be updated';

CREATE TABLE payment_service.payment_status_transitions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    catalog_payment_id uuid NOT NULL,
    from_status payment_service.payment_status NOT NULL,
    to_status payment_service.payment_status NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE payment_service.payment_status_transitions IS 'store the payment status changes';

CREATE TABLE payment_service.subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reward_id uuid,
    credit_card_id uuid,
    status payment_service.subscription_status DEFAULT 'started' NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    checkout_data jsonb DEFAULT '{}'::jsonb NOT NULL
);
COMMENT ON TABLE payment_service.subscriptions IS 'Store subscription transitions between charges';

CREATE TABLE payment_service.subscription_status_transitions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    subscription_id uuid NOT NULL,
    from_status payment_service.subscription_status NOT NULL,
    to_status payment_service.subscription_status NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE payment_service.credit_cards (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    user_id uuid NOT NULL,
    gateway text NOT NULL,
    gateway_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE payment_service.credit_cards IS 'Store gateway credit_cards references';


CREATE TABLE project_service.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    mode project_service.project_mode NOT NULL,
    key uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    permalink text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    external_id text,
    CONSTRAINT chk_permalink CHECK ((permalink ~* '\A(\w|-)*\Z'::text))
);
COMMENT ON TABLE project_service.projects IS 'store project data for platforms';

CREATE TABLE project_service.project_versions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    project_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE project_service.project_versions IS 'Store project data versions';

CREATE TABLE project_service.reward_versions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    reward_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE project_service.rewards (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    project_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    platform_id uuid NOT NULL,
    external_id text
);


ALTER TABLE ONLY community_service.users
    ADD CONSTRAINT uidx_platform_email UNIQUE (platform_id, email);

ALTER TABLE ONLY community_service.users
    ADD CONSTRAINT uniq_users_ext_id UNIQUE (platform_id, external_id);

ALTER TABLE ONLY community_service.users
    ADD CONSTRAINT users_key_key UNIQUE (key);

ALTER TABLE ONLY core.core_settings
    ADD CONSTRAINT core_settings_name_key UNIQUE (name);

ALTER TABLE ONLY payment_service.catalog_payments
    ADD CONSTRAINT uniq_payments_ext_id UNIQUE (platform_id, external_id);

ALTER TABLE ONLY platform_service.platform_api_keys
    ADD CONSTRAINT platform_api_keys_token_key UNIQUE (token);

ALTER TABLE ONLY platform_service.platforms
    ADD CONSTRAINT platforms_token_key UNIQUE (token);

ALTER TABLE ONLY platform_service.users
    ADD CONSTRAINT uidx_users_email UNIQUE (email);

ALTER TABLE ONLY platform_service.platform_users
    ADD CONSTRAINT uuidx_user_and_platform UNIQUE (user_id, platform_id);

ALTER TABLE ONLY project_service.projects
    ADD CONSTRAINT projects_key_key UNIQUE (key);

ALTER TABLE ONLY project_service.projects
    ADD CONSTRAINT uniq_projects_ext_id UNIQUE (platform_id, external_id);

ALTER TABLE ONLY project_service.rewards
    ADD CONSTRAINT uniq_rewards_ext_id UNIQUE (platform_id, external_id);

ALTER TABLE ONLY project_service.projects
    ADD CONSTRAINT unq_permalink_on_platform UNIQUE (platform_id, permalink);


ALTER TABLE ONLY community_service.user_versions
    ADD CONSTRAINT user_versions_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY community_service.users
    ADD CONSTRAINT users_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY payment_service.catalog_payment_versions
    ADD CONSTRAINT catalog_payment_versions_catalog_payment_id_fkey FOREIGN KEY (catalog_payment_id) REFERENCES payment_service.catalog_payments(id);

ALTER TABLE ONLY payment_service.catalog_payments
    ADD CONSTRAINT catalog_payments_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY payment_service.catalog_payments
    ADD CONSTRAINT catalog_payments_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

ALTER TABLE ONLY payment_service.catalog_payments
    ADD CONSTRAINT catalog_payments_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES project_service.rewards(id);

ALTER TABLE ONLY payment_service.catalog_payments
    ADD CONSTRAINT catalog_payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES payment_service.subscriptions(id);

ALTER TABLE ONLY payment_service.catalog_payments
    ADD CONSTRAINT catalog_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY payment_service.credit_cards
    ADD CONSTRAINT credit_cards_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY payment_service.credit_cards
    ADD CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY payment_service.payment_status_transitions
    ADD CONSTRAINT payment_status_transitions_catalog_payment_id_fkey FOREIGN KEY (catalog_payment_id) REFERENCES payment_service.catalog_payments(id);

ALTER TABLE ONLY payment_service.subscription_status_transitions
    ADD CONSTRAINT subscription_status_transitions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES payment_service.subscriptions(id);

ALTER TABLE ONLY payment_service.subscriptions
    ADD CONSTRAINT subscriptions_credit_card_id_fkey FOREIGN KEY (credit_card_id) REFERENCES payment_service.credit_cards(id);

ALTER TABLE ONLY payment_service.subscriptions
    ADD CONSTRAINT subscriptions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);


ALTER TABLE ONLY payment_service.subscriptions
    ADD CONSTRAINT subscriptions_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

ALTER TABLE ONLY payment_service.subscriptions
    ADD CONSTRAINT subscriptions_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES project_service.rewards(id);

ALTER TABLE ONLY payment_service.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY platform_service.platform_api_keys
    ADD CONSTRAINT platform_api_keys_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY platform_service.platform_users
    ADD CONSTRAINT platform_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES platform_service.users(id);

ALTER TABLE ONLY project_service.project_versions
    ADD CONSTRAINT project_versions_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

ALTER TABLE ONLY project_service.projects
    ADD CONSTRAINT projects_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY project_service.projects
    ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY project_service.reward_versions
    ADD CONSTRAINT reward_versions_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES project_service.rewards(id);

ALTER TABLE ONLY project_service.rewards
    ADD CONSTRAINT rewards_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY project_service.rewards
    ADD CONSTRAINT rewards_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);


CREATE FUNCTION core.url_encode(data bytea) RETURNS text
    LANGUAGE sql
    AS $$
    SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;

CREATE FUNCTION core.algorithm_sign(signables text, secret text, algorithm text) RETURNS text
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


CREATE FUNCTION core.current_platform_token() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
        BEGIN
          RETURN COALESCE(
            current_setting('request.jwt.claim.platform_token', true)::uuid, 
            current_setting('request.header.platform-code')::uuid);
        EXCEPTION
            WHEN others THEN
            RETURN NULL::integer;
        END
    $$;

COMMENT ON FUNCTION core.current_platform_token() IS 'Get platform uuid token from jwt';


CREATE FUNCTION core.current_platform_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
        select id from platform_service.platforms where token = core.current_platform_token();
    $$;

CREATE FUNCTION core.current_user_id() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN nullif(current_setting('request.jwt.claim.user_id'), '')::uuid;
EXCEPTION
WHEN others THEN
  RETURN NULL::uuid;
END
    $$;

COMMENT ON FUNCTION core.current_user_id() IS 'Returns the user_id decoded on jwt';


CREATE FUNCTION core.force_any_of_roles(roles text[]) RETURNS void
    LANGUAGE plpgsql STABLE
    AS $_$
        declare
        begin
            if not core.has_any_of_roles($1) then
                raise exception insufficient_privilege;
            end if;
        end;
    $_$;

COMMENT ON FUNCTION core.force_any_of_roles(roles text[]) IS 'raise insufficient_privilege when current role not in any of requested roles';


CREATE FUNCTION core.force_ip_address() RETURNS text
    LANGUAGE sql
    AS $$
        select current_setting('request.header.x-forwarded-for');
    $$;

COMMENT ON FUNCTION core.force_ip_address() IS 'Get ip address form request header or raise error';

CREATE FUNCTION core.get_setting(character varying) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
        select value from core.core_settings cs where cs.name = $1
    $_$;

COMMENT ON FUNCTION core.get_setting(character varying) IS 'Get a value from a core settings on database';

CREATE FUNCTION core.has_any_of_roles(roles text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
        select current_role = ANY(roles);
    $$;

COMMENT ON FUNCTION core.has_any_of_roles(roles text[]) IS 'check if current role in any of requested roles';


CREATE FUNCTION core.is_owner_or_admin(uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
        SELECT
            core.current_user_id() = $1
            OR current_user = 'platform_user';
    $_$;

COMMENT ON FUNCTION core.is_owner_or_admin(uuid) IS 'Check if current_role is admin or passed id match with current_user_id';


CREATE FUNCTION core.project_exists_on_platform(project_id uuid, platform_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
    select exists(
        select true
        from project_service.projects p
            where p.id = $1
                and p.platform_id = $2
    )
$_$;

COMMENT ON FUNCTION core.project_exists_on_platform(project_id uuid, platform_id uuid) IS 'check if project id exists on platform';


CREATE FUNCTION core.request_ip_address() RETURNS text
    LANGUAGE sql
    AS $$
        select current_setting('request.header.x-forwarded-for', true);
    $$;


CREATE FUNCTION core.sign(payload json, secret text, algorithm text DEFAULT 'HS256'::text) RETURNS text
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


CREATE FUNCTION core.gen_jwt_token(json) RETURNS core.jwt_token
    LANGUAGE sql STABLE
    AS $_$
        select core.sign($1::json, core.get_setting('jwt_secret'));
    $_$;

COMMENT ON FUNCTION core.gen_jwt_token(json) IS 'Generate a signed jwt';

CREATE FUNCTION core.url_decode(data text) RETURNS bytea
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

CREATE FUNCTION core.user_exists_on_platform(user_id uuid, platform_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
    select exists(
        select true
        from community_service.users u
            where u.id = $1
                and u.platform_id = $2
    )
$_$;

COMMENT ON FUNCTION core.user_exists_on_platform(user_id uuid, platform_id uuid) IS 'Check if user_id exists on platform';


CREATE FUNCTION core.verify(token text, secret text, algorithm text DEFAULT 'HS256'::text) RETURNS TABLE(header json, payload json, valid boolean)
    LANGUAGE sql
    AS $$
  SELECT
    convert_from(core.url_decode(r[1]), 'utf8')::json AS header,
    convert_from(core.url_decode(r[2]), 'utf8')::json AS payload,
    r[3] = core.algorithm_sign(r[1] || '.' || r[2], secret, algorithm) AS valid
  FROM regexp_split_to_array(token, '\.') r;
$$;



CREATE FUNCTION community_service._serialize_user_basic_data(json) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'name', ($1->>'name')::text,
                'email', ($1->>'email')::email,
                'document_number', replace(replace(replace(($1->>'document_number')::text, '.', ''), '/', ''), '-', ''),
                'born_at', ($1->>'born_at')::date,
                'document_type', ($1->>'document_type')::text,
                'legal_account_type', ($1->>'legal_account_type')::text,
                'address', json_build_object(
                    'street', ($1->'address'->>'street')::text,
                    'street_number', ($1->'address'->>'street_number')::text,
                    'neighborhood', ($1->'address'->>'neighborhood')::text,
                    'zipcode', ($1->'address'->>'zipcode')::text,
                    'country', ($1->'address'->>'country')::text,
                    'state', ($1->'address'->>'state')::text,
                    'city', ($1->'address'->>'city')::text,
                    'complementary', ($1->'address'->>'complementary')::text
                ),
                'phone', json_build_object(
                    'ddi', ($1->'phone'->>'ddi')::text,
                    'ddd', ($1->'phone'->>'ddd')::text,
                    'number', ($1->'phone'->>'number')::text
                ),
                'bank_account', json_build_object(
                    'bank_code', ($1->'bank_account'->>'bank_code')::text,
                    'account', ($1->'bank_account'->>'account')::text,
                    'account_digit', ($1->'bank_account'->>'account_digit')::text,
                    'agency', ($1->'bank_account'->>'agency')::text,
                    'agency_digit', ($1->'bank_account'->>'agency_digit')::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
    $_$;


CREATE FUNCTION community_service._serialize_user_basic_data(json, with_default json) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'name', coalesce(($1->>'name')::text, ($2->>'name')::text),
                'email', coalesce(($1->>'email')::email, ($2->>'email')::email),
                'document_number', replace(replace(replace(coalesce(($1->>'document_number')::text, ($2->>'document_number')::text), '.', ''), '/', ''), '-', ''),
                'born_at', coalesce(($1->>'born_at')::date, ($2->>'born_at')::date),
                'document_type', coalesce(($1->>'document_type')::text, ($2->>'document_type')::text),
                'legal_account_type', coalesce(($1->>'legal_account_type')::text, ($2->>'legal_account_type')::text),
                'address', json_build_object(
                    'street', coalesce(($1->'address'->>'street')::text, ($2->'address'->>'street')::text),
                    'street_number', coalesce(($1->'address'->>'street_number')::text, ($2->'address'->>'street_number')::text),
                    'neighborhood', coalesce(($1->'address'->>'neighborhood')::text, ($2->'address'->>'neighborhood')::text),
                    'zipcode', coalesce(($1->'address'->>'zipcode')::text, ($2->'address'->>'zipcode')::text),
                    'country', coalesce(($1->'address'->>'country')::text, ($2->'address'->>'country')::text),
                    'state', coalesce(($1->'address'->>'state')::text, ($2->'address'->>'state')::text),
                    'city', coalesce(($1->'address'->>'city')::text, ($2->'address'->>'city')::text),
                    'complementary', coalesce(($1->'address'->>'complementary')::text, ($2->'address'->>'complementary')::text)
                ),
                'phone', json_build_object(
                    'ddi', coalesce(($1->'phone'->>'ddi')::text, ($2->'phone'->>'ddi')::text),
                    'ddd', coalesce(($1->'phone'->>'ddd')::text, ($2->'phone'->>'ddd')::text),
                    'number', coalesce(($1->'phone'->>'number')::text, ($2->'phone'->>'number')::text)
                ),
                'bank_account', json_build_object(
                    'bank_code', coalesce(($1->'bank_account'->>'bank_code')::text, ($2->'bank_account'->>'bank_code')::text),
                    'account', coalesce(($1->'bank_account'->>'account')::text, ($2->'bank_account'->>'account')::text),
                    'account_digit', coalesce(($1->'bank_account'->>'account_digit')::text, ($2->'bank_account'->>'account_digit')::text),
                    'agency', coalesce(($1->'bank_account'->>'agency')::text, ($2->'bank_account'->>'agency')::text),
                    'agency_digit', coalesce(($1->'bank_account'->>'agency_digit')::text, ($2->'bank_account'->>'agency_digit')::text)
                ),
                'metadata', coalesce(($1->>'metadata')::json, ($2->>'metadata')::json)
            ) into _result;

            return _result;
        end;
    $_$;


CREATE FUNCTION community_service_api.create_scoped_user_session(id uuid) RETURNS json
    LANGUAGE plpgsql STABLE
    AS $_$
        declare
            _platform platform_service.platforms;
            _user community_service.users;
            _jwt core.jwt_token;
            _result json;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user}');


            select * from community_service.users cu
                where cu.platform_id = core.current_platform_id()
                    and cu.id = $1
                into _user;

            if _user is null then
                raise exception 'invalid user id';
            end if;


            select core.gen_jwt_token(json_build_object(
                'role', 'scoped_user',
                'user_id', _user.id,
                'platform_token', core.current_platform_token(),
                'exp', extract(epoch from now())::integer + (60*60)*2
            )) into _jwt;

            select json_build_object(
                'token', _jwt.token
            ) into _result;

            return _result;
        end;
    $_$;
COMMENT ON FUNCTION community_service_api.create_scoped_user_session(id uuid) IS 'Create a token for scoped user in community';


CREATE FUNCTION community_service_api."user"(data json) RETURNS json
    LANGUAGE plpgsql
    AS $_$
        declare
            _user community_service.users;
            _platform platform_service.platforms;
            _refined jsonb;
            _result json;
            _passwd text;
            _version community_service.user_versions;        
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user,scoped_user}');
            
            -- get user if id is provided or scoped_user
            if current_role = 'platform_user' and ($1->>'id')::uuid is not null then
                select * from community_service.users
                    where id = ($1->>'id')::uuid
                        and platform_id = core.current_platform_id()
                    into _user;
                if _user.id is null then
                    raise 'user not found';
                end if;                    
            elsif current_role = 'scoped_user' then
                select * from community_service.users
                    where id = core.current_user_id()
                        and platform_id = core.current_platform_id()
                    into _user;
                    
                if _user.id is null then
                    raise 'user not found';
                end if;
            end if;

            -- insert current_ip into refined
            _refined := jsonb_set($1::jsonb, '{current_ip}'::text[], to_jsonb(coalesce(($1->>'current_ip')::text, core.force_ip_address())));

            -- generate user basic data structure with received json
            if _user.id is not null then
                _refined := community_service._serialize_user_basic_data($1, _user.data::json);

                -- insert old user data to version
                insert into community_service.user_versions(user_id, data)
                    values (_user.id, row_to_json(_user.*)::jsonb)
                    returning * into _version;

                -- update user data
                update community_service.users
                    set data = _refined,
                        email = _refined->>'email'
                    where id = _user.id
                    returning * into _user;
            else
                -- geenrate user basic data
                _refined := community_service._serialize_user_basic_data($1);
                
                -- check if password already encrypted
                _passwd := (case when ($1->>'password_encrypted'::text) = 'true' then 
                                ($1->>'password')::text  
                            else 
                                crypt(($1->>'password')::text, gen_salt('bf')) 
                            end);

                -- insert user in current platform
                insert into community_service.users (external_id, platform_id, email, password, data, created_at, updated_at)
                    values (($1->>'external_id')::text,
                            core.current_platform_id(),
                            ($1)->>'email',
                            _passwd,
                            _refined::jsonb,
                            coalesce(($1->>'created_at')::timestamp, now()),
                            coalesce(($1->>'updated_at')::timestamp, now())
                        )
                        returning * into _user;
                -- insert user version
                insert into community_service.user_versions(user_id, data)
                    values (_user.id, row_to_json(_user.*)::jsonb)
                returning * into _version;
            end if;
            
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;
            
            return _result;
        end;
    $_$;

CREATE FUNCTION core_validator.is_empty(_value text) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$
        select nullif(btrim(_value, ' '), '') is null;
    $$;
COMMENT ON FUNCTION core_validator.is_empty(_value text) IS 'check if a text is empty';


CREATE FUNCTION core_validator.raise_when_empty(_value text, _label text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
        declare
        begin
            if nullif(btrim(_value, ' '), '') is null then
                raise 'missing field %', _label;
            end if;
            
            return btrim(_value, ' ');
        end;
    $$;

COMMENT ON FUNCTION core_validator.raise_when_empty(_value text, _label text) IS 'Raise when value::text is missing';


CREATE FUNCTION payment_service.__extractor_for_pagarme(gateway_data json) RETURNS json
    LANGUAGE plpgsql STABLE
    AS $_$
        declare
            _transaction json;
            _payables json;
            _payable_data record;
        begin
            _transaction := ($1->>'transaction')::json;
            _payables := ($1->>'payables')::json;

            -- build basic payable data to reuse on default strcuture
            select sum((p->>'fee')::decimal) as total_fee, 
                max((p->>'payment_date')) as last_payable_date,
                min((p->>'payment_date')) as first_payable_date,
                array_to_json(array_agg(json_build_object(
                    'id', (p->>'id')::text,
                    'type', (p->>'type')::text,
                    'status', (p->>'status')::text,
                    'installment', (p->>'installment')::integer,
                    'payment_date', (p->>'payment_date')::timestamp,
                    'transaction_id', (p->>'transaction_id')::text,
                    'anticipation_fee', (p->>'anticipation_fee')::text
                ))) as payables
                from json_array_elements(_payables) as p
                into _payable_data;

            -- build payment basic stucture from gateway
            return json_build_object(
                'gateway_ip', _transaction ->> 'ip'::text,
                'gateway_id', _transaction ->> 'id'::text,
                'gateway_cost', (_transaction ->> 'cost')::decimal,
                'gateway_payment_method', (_transaction ->> 'payment_method')::text,
                'gateway_status', (_transaction ->> 'status')::text,
                'gateway_status_reason', (_transaction ->> 'status_reason')::text,
                'gateway_refuse_reason', (_transaction ->> 'refuse_reason')::text,
                'gateway_acquirer_response_code', (_transaction ->> 'acquirer_response_code')::text,
                'boleto_url', (_transaction ->> 'boleto_url')::text,
                'boleto_barcode', (_transaction ->> 'boleto_barcode')::text,
                'boleto_expiration_date', (_transaction ->> 'boleto_expiration_date')::timestamp,
                'installments', (_transaction ->> 'installments')::text,
                'customer_name', (_transaction -> 'customer' ->> 'name')::text,
                'customer_email', (_transaction -> 'customer' ->> 'email')::text,
                'customer_document_number', (_transaction -> 'customer' ->> 'document_number')::text,
                'customer_document_type', (_transaction -> 'customer' ->> 'document_type')::text,
                'card_id', (_transaction -> 'card' ->> 'id')::text,
                'card_holder_name', (_transaction -> 'card' ->> 'holder_name')::text,
                'card_first_digits', (_transaction -> 'card' ->> 'first_digits')::text,
                'card_last_digits', (_transaction -> 'card' ->> 'last_digits')::text,
                'card_fingerprint', (_transaction -> 'card' ->> 'fingerprint')::text,
                'card_country', (_transaction -> 'card' ->> 'country')::text,
                'card_brand', (_transaction -> 'card' ->> 'brand')::text,
                'payable_total_fee', _payable_data.total_fee::decimal,
                'payable_first_compensation_date', _payable_data.first_payable_date::timestamp,
                'payable_last_compensation_date', _payable_data.last_payable_date::timestamp,
                'payables', _payable_data.payables::json
            );
        end;
    $_$;

COMMENT ON FUNCTION payment_service.__extractor_for_pagarme(gateway_data json) IS 'generate basic gateway_data structure for gateways';


CREATE FUNCTION payment_service._extract_from_gateway_to_data(gateway text, gateway_data json) RETURNS json
    LANGUAGE plpgsql STABLE
    AS $_$
        declare
        begin
            return (
                case $1
                when 'pagarme' then 
                    payment_service.__extractor_for_pagarme($2)
                else 
                    null::json
                end
            );
        end;
    $_$;


COMMENT ON FUNCTION payment_service._extract_from_gateway_to_data(gateway text, gateway_data json) IS 'route gateway response data to a extractor to generate default structure over payment';


CREATE FUNCTION payment_service._serialize_payment_basic_data(json) RETURNS json
    LANGUAGE plpgsql STABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', core_validator.raise_when_empty(($1->>'current_ip')::text, 'ip_address')::text,
                'anonymous', core_validator.raise_when_empty(($1->>'anonymous')::text, 'anonymous')::boolean,
                'amount', core_validator.raise_when_empty((($1->>'amount')::decimal)::text, 'amount')::decimal,
                'payment_method', core_validator.raise_when_empty(lower(($1->>'payment_method')::text), 'payment_method'),
                'customer', json_build_object(
                    'name', core_validator.raise_when_empty(($1->'customer'->>'name')::text, 'name'),
                    'email', core_validator.raise_when_empty(($1->'customer'->>'email')::text, 'email'),
                    'document_number', core_validator.raise_when_empty(($1->'customer'->>'document_number')::text, 'document_number'),
                    'address', json_build_object(
                        'street', core_validator.raise_when_empty(($1->'customer'->'address'->>'street')::text, 'street'),
                        'street_number', core_validator.raise_when_empty(($1->'customer'->'address'->>'street_number')::text, 'street_number'),
                        'neighborhood', core_validator.raise_when_empty(($1->'customer'->'address'->>'neighborhood')::text, 'neighborhood'),
                        'zipcode', core_validator.raise_when_empty(($1->'customer'->'address'->>'zipcode')::text, 'zipcode'),
                        'country', core_validator.raise_when_empty(($1->'customer'->'address'->>'country')::text, 'country'),
                        'state', core_validator.raise_when_empty(($1->'customer'->'address'->>'state')::text, 'state'),
                        'city', core_validator.raise_when_empty(($1->'customer'->'address'->>'city')::text, 'city'),
                        'complementary', ($1->'customer'->'address'->>'complementary')::text
                    ),
                    'phone', json_build_object(
                        'ddi', core_validator.raise_when_empty(($1->'customer'->'phone'->>'ddi')::text, 'phone_ddi'),
                        'ddd', core_validator.raise_when_empty(($1->'customer'->'phone'->>'ddd')::text, 'phone_ddd'),
                        'number', core_validator.raise_when_empty(($1->'customer'->'phone'->>'number')::text, 'phone_number')
                    )
                )
            ) into _result;

            return _result;
        end;
    $_$;


CREATE FUNCTION payment_service._serialize_subscription_basic_data(json) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'is_international', coalesce(($1->>'is_international')::boolean, false),
                'amount', core_validator.raise_when_empty((($1->>'amount')::integer)::text, 'amount'),
                'payment_method', core_validator.raise_when_empty(lower(($1->>'payment_method')::text), 'payment_method'),
                'customer', json_build_object(
                    'address', json_build_object(
                        'street', core_validator.raise_when_empty(($1->'customer'->'address'->>'street')::text, 'street'),
                        'street_number', core_validator.raise_when_empty(($1->'customer'->'address'->>'street_number')::text, 'street_number'),
                        'neighborhood', core_validator.raise_when_empty(($1->'customer'->'address'->>'neighborhood')::text, 'neighborhood'),
                        'zipcode', core_validator.raise_when_empty(($1->'customer'->'address'->>'zipcode')::text, 'zipcode'),
                        'country', core_validator.raise_when_empty(($1->'customer'->'address'->>'country')::text, 'country'),
                        'state', core_validator.raise_when_empty(($1->'customer'->'address'->>'state')::text, 'state'),
                        'city', core_validator.raise_when_empty(($1->'customer'->'address'->>'city')::text, 'city'),
                        'complementary', ($1->'customer'->'address'->>'complementary')::text
                    ),
                    'phone', json_build_object(
                        'ddi', core_validator.raise_when_empty(($1->'customer'->'phone'->>'ddi')::text, 'phone_ddi'),
                        'ddd', core_validator.raise_when_empty(($1->'customer'->'phone'->>'ddd')::text, 'phone_ddd'),
                        'number', core_validator.raise_when_empty(($1->'customer'->'phone'->>'number')::text, 'phone_number')
                    )
                )                
            ) into _result;

            return _result;
        end;    
    $_$;


CREATE FUNCTION payment_service.paid_transition_at(payment payment_service.catalog_payments) RETURNS timestamp without time zone
    LANGUAGE sql STABLE
    AS $_$
        select created_at from payment_service.payment_status_transitions
            where catalog_payment_id = $1.id
                and to_status = 'paid'::payment_service.payment_status
            order by id desc limit 1;
    $_$;

CREATE FUNCTION payment_service.subscriptions_charge(time_interval interval DEFAULT '1 mon'::interval) RETURNS json
    LANGUAGE plpgsql
    AS $_$
        declare
            _result json;
            _subscription payment_service.subscriptions;
            _last_paid_payment payment_service.catalog_payments;
            _new_payment payment_service.catalog_payments;
            _refined jsonb;
            _affected_subscriptions_ids uuid[];
            _card_id text;
            _user community_service.users;
            _total_affected integer;
        begin
            _total_affected := 0;
            -- get all subscriptions that not have any pending payment and last paid payment is over interval
            for _subscription IN (select s.*
                from payment_service.subscriptions s
                left join lateral (
                    -- get last paid payment after interval
                    select
                        cp.*
                    from payment_service.catalog_payments cp
                    where cp.subscription_id = s.id
                        and cp.status = 'paid'
                    order by id desc limit 1
                ) as last_paid_payment on true
                left join lateral (
                    -- get last paymnent (sometimes we can have a pending, refused... after a paid)
                    -- and ensure that payment is greater or same that is paid
                    select 
                        cp.*
                    from payment_service.catalog_payments cp
                        where cp.subscription_id = s.id
                            and id > last_paid_payment.id
                    order by id desc  limit 1
                ) as last_payment on true
                where last_paid_payment.id is not null
                    and (payment_service.paid_transition_at(last_paid_payment.*) + $1::interval) <= now()
                    and (last_payment.id is null or last_payment.status in ('refused', 'paid'))
                    -- check only for subscriptions that in paid
                    and s.status in ('active'))
            loop
                select * from payment_service.catalog_payments
                    where subscription_id = _subscription.id
                        and status = 'paid'
                    order by id desc limit 1
                    into _last_paid_payment;
                select * from community_service.users
                    where id = _subscription.user_id
                    into _user;
                
                -- check if last paid payment is boleto or credit card
                _total_affected := _total_affected + 1;
                _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);
                
                _refined := _subscription.checkout_data;
                
                -- set customer name/email/document number from user
                _refined := jsonb_set(_refined, '{customer,name}', to_jsonb((_user.data->>'name')::text));
                _refined := jsonb_set(_refined, '{customer,email}', to_jsonb((_user.data->>'email')::text));
                _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb((_user.data->>'document_number')::text));
    
                -- check if last payment method is credit card
                if (_refined ->> 'payment_method')::text = 'credit_card' then
                    -- replace card_id with last gateway general data card_id
                    select gateway_data->>'id'::text from payment_service.credit_cards
                        where id = _subscription.credit_card_id
                        into _card_id;
                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb(_card_id));
                    _refined := _refined - 'card_hash';
                end if;
                
                insert into payment_service.catalog_payments(gateway, platform_id, project_id, user_id, subscription_id, data)
                    values (_last_paid_payment.gateway, _subscription.platform_id, _subscription.project_id, _subscription.user_id, _subscription.id, _refined)
                    returning * into _new_payment;
                    
                perform pg_notify('process_payments_channel', 
                    json_build_object('id', _new_payment.id, 'subscription_id', _subscription.id)::text);
            end loop;
            
            _result := json_build_object(
                'total_affected', _total_affected,
                'affected_ids', _affected_subscriptions_ids
            );
            
            return _result;
        end;
    $_$;

CREATE FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
        declare
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;
            
            -- generate a new payment status transition
            insert into payment_service.payment_status_transitions (catalog_payment_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the payment status
            update payment_service.catalog_payments
                set status = $2
                where id = $1.id;

            return true;
        end;
    $_$;

COMMENT ON FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json) IS 'payment state machine';


CREATE FUNCTION payment_service.transition_to(subscription payment_service.subscriptions, status payment_service.subscription_status, reason json) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
        declare
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;

            -- generate a new subscription status transition
            insert into payment_service.subscription_status_transitions (subscription_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the subscription status
            update payment_service.subscriptions
                set status = $2
                where id = $1.id;

            return true;
        end;
    $_$;

COMMENT ON FUNCTION payment_service.transition_to(subscription payment_service.subscriptions, status payment_service.subscription_status, reason json) IS 'subscription state machine';


CREATE FUNCTION payment_service_api.pay(data json) RETURNS json
    LANGUAGE plpgsql
    AS $_$
        declare
            _result json;
            _payment payment_service.catalog_payments;
            _user_id uuid;
            _user community_service.users;
            _version payment_service.catalog_payment_versions;
            _credit_card payment_service.credit_cards;
            _subscription payment_service.subscriptions;
            _reward project_service.rewards;
            _refined jsonb;
            _external_id text;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');
            
            -- check roles to define how user_id is set
            if current_role = 'platform_user' then
                _user_id := ($1 ->> 'user_id')::uuid;
                _external_id := ($1 ->> 'external_id')::uuid;
            else
                _user_id := core.current_user_id();
            end if;

            -- check if project exists on platform
            if ($1->>'project_id')::uuid is null 
                OR not core.project_exists_on_platform(($1->>'project_id')::uuid, core.current_platform_id()) then
                raise exception 'project not found on platform';
            end if;

            -- set user into variable
            select * 
            from community_service.users 
            where id = _user_id
                and platform_id = core.current_platform_id()
            into _user;
            -- check if user exists on current platform
            if _user.id is null then
                raise exception 'missing user';
            end if;
            
            -- get and check if reward exists
            if ($1->>'reward_id')::uuid is not null then
                select * from project_service.rewards
                    where project_id = ($1->>'project_id')::uuid
                        and id = ($1->>'project_id')::uuid
                    into _reward;
                    
                if _reward.id is null then
                    raise 'reward not found';
                end if;
                
                if ($1->>'amount'::decimal) < (_reward.data->>'minimum_value')::decimal then
                    raise 'payment amount is bellow of reward minimum %', (_reward.data->>'minimum_value')::decimal;
                end if;
            end if;

            -- fill ip address to received params
            _refined := jsonb_set(($1)::jsonb, '{current_ip}'::text[], to_jsonb(core.force_ip_address()::text));

            -- if user already has filled document_number/name/email should use then
            if not core_validator.is_empty((_user.data->>'name')::text) then
                _refined := jsonb_set(_refined, '{customer,name}', to_jsonb(_user.data->>'name'::text));
            else
                update community_service.users
                    set name = ($1->'customer'->>'name')::text
                    where id = _user.id;
            end if;

            if not core_validator.is_empty((_user.data->>'email')::text) then
                _refined := jsonb_set(_refined, '{customer,email}', to_jsonb(_user.data->>'email'::text));
            end if;

            if not core_validator.is_empty((_user.data->>'document_number')::text) then
                _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb(_user.data->>'document_number'::text));
            else
            select * from community_service.users;
                update community_service.users
                    set data = jsonb_set(data, '{document_number}'::text[], ($1->'customer'->>'document_number'))
                    where id = _user.id;            
            end if;
            
            -- fill with anonymous
            _refined := jsonb_set(_refined, '{anonymous}'::text[], to_jsonb(coalesce(($1->>'anonymous')::boolean, false)));

            -- generate a base structure to payment json
            _refined := (payment_service._serialize_payment_basic_data((_refined)::json))::jsonb;            
 -- if payment_method is credit_card should check for card_hash or card_id
            if _refined->>'payment_method'::text = 'credit_card' then
                -- fill with credit_card_owner_document
                _refined := jsonb_set(_refined, '{credit_card_owner_document}'::text[], to_jsonb(coalesce(($1->>'credit_card_owner_document')::text, '')));
                
                -- fill with is_international
                _refined := jsonb_set(_refined, '{is_international}'::text[], to_jsonb(coalesce(($1->>'is_international')::boolean, false)));

                -- fill with save_card
                _refined := jsonb_set(_refined, '{save_card}'::text[], to_jsonb(coalesce(($1->>'save_card')::boolean, false)));

                -- check if card_hash or card_id is present
                if core_validator.is_empty((($1)->>'card_hash')::text) 
                    and core_validator.is_empty((($1)->>'card_id')::text) then
                    raise 'missing card_hash or card_id';
                end if;

                -- if has card_id check if user is card owner
                if not core_validator.is_empty((($1)->>'card_id')::text) then
                    select cc.* from payment_service.credit_cards cc 
                    where cc.user_id = _user_id and cc.id = (($1)->>'card_id')::uuid
                    into _credit_card;

                    if _credit_card.id is null then
                        raise 'invalid card_id';
                    end if;

                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb(_credit_card.id::text));
                    
                elsif not core_validator.is_empty((($1)->>'card_hash')::text) then
                    _refined := jsonb_set(_refined, '{card_hash}'::text[], to_jsonb($1->>'card_hash'::text));
                end if;

            end if;

            -- insert payment in table
            insert into payment_service.catalog_payments (
                external_i, platform_id, project_id, user_id, reward_id, data, gateway
            ) values (
                _external_id,
                core.current_platform_id(),
                ($1->>'project_id')::uuid,
                _user_id,
                _reward.id,
                _refined,
                coalesce(($1->>'gateway')::text, 'pagarme')
            ) returning * into _payment;
            
            -- insert first payment version
            insert into payment_service.catalog_payment_versions (
                catalog_payment_id, data
            ) values ( _payment.id, _payment.data )
            returning * into _version;

            -- check if payment is a subscription to create one
            if ($1->>'subscription') is not null and ($1->>'subscription')::boolean  then
                insert into payment_service.subscriptions (
                    platform_id, project_id, user_id, checkout_data
                ) values (_payment.platform_id, _payment.project_id, _payment.user_id, payment_service._serialize_subscription_basic_data(_payment.data::json)::jsonb)
                returning * into _subscription;

                update payment_service.catalog_payments
                    set subscription_id = _subscription.id
                    where id = _payment.id;
            end if;

            -- build result json with payment_id and subscription_id
            select json_build_object(
                'id', _payment.id,
                'subscription_id', _subscription.id,
                'old_version_id', _version.id
            ) into _result;

            -- notify to backend processor via listen
            PERFORM pg_notify('process_payments_channel',
                json_build_object(
                    'id', _payment.id,
                    'subscription_id', _subscription.id,
                    'created_at', _payment.created_at::timestamp
                )::text
            );

            return _result;
        end;
    $_$;


CREATE FUNCTION platform_service.user_in_platform(user_id uuid, platform_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
        select exists(select true from platform_service.platform_users pu where pu.user_id = $1 and pu.platform_id = $2);
    $_$;
COMMENT ON FUNCTION platform_service.user_in_platform(user_id uuid, platform_id uuid) IS 'Check if inputed user has access on inputed platform';


CREATE FUNCTION platform_service_api.create_platform(name text) RETURNS platform_service.platforms
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


COMMENT ON FUNCTION platform_service_api.create_platform(name text) IS 'Create a new platform on current logged platform user';


CREATE VIEW platform_service_api.api_keys AS
 SELECT pak.id,
    pak.platform_id,
    pak.token,
    pak.created_at,
    pak.disabled_at
   FROM (platform_service.platform_api_keys pak
     JOIN platform_service.platform_users pu ON ((pu.platform_id = pak.platform_id)))
  WHERE (core.is_owner_or_admin(pu.user_id) AND (pak.disabled_at IS NULL));
COMMENT ON VIEW platform_service_api.api_keys IS 'List all api keys from platform that user have access';


CREATE FUNCTION platform_service_api.generate_api_key(platform_id uuid) RETURNS platform_service_api.api_keys
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
COMMENT ON FUNCTION platform_service_api.generate_api_key(platform_id uuid) IS 'Generate a new API_KEY for given platform';


CREATE FUNCTION platform_service_api.login(email text, password text) RETURNS core.jwt_token
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
COMMENT ON FUNCTION platform_service_api.login(email text, password text) IS 'Handles with platform users authentication';


CREATE FUNCTION platform_service_api.sign_up(name text, email text, password text) RETURNS core.jwt_token
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

COMMENT ON FUNCTION platform_service_api.sign_up(name text, email text, password text) IS 'Handles with creation of new platform users';


CREATE FUNCTION project_service._serialize_project_basic_data(json) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'name', core_validator.raise_when_empty(($1->>'name')::text, 'name'),
                'status', ($1->>'status'::text),
                'permalink', core_validator.raise_when_empty(($1->>'permalink')::text, 'permalink'),
                'mode', core_validator.raise_when_empty((($1->>'mode')::project_service.project_mode)::text, 'mode'),
                'about_html', ($1->>'about_html')::text,
                'budget_html', ($1->>'budget_html')::text,
                'online_days', ($1->>'online_days')::integer,
                'cover_image_versions', ($1->>'cover_image_versions')::json,
                'card_info', json_build_object(
                    'image_url', ($1->'card_info'->>'image_url')::text,
                    'title', ($1->'card_info'->>'title')::text,
                    'description', ($1->'card_info'->>'description')::text
                ),
                'video_info', json_build_object(
                    'id', ($1->'video'->>'id')::text,
                    'provider', ($1->'video'->>'provider')::text,
                    'embed_url', ($1->'video'->>'embed_url')::text,
                    'thumb_url', ($1->'video'->>'cover_url')::text
                ),
                'address', json_build_object(
                    'state', ($1->'address'->>'state')::text,
                    'city', ($1->'address'->>'city')::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
    $_$;

CREATE FUNCTION project_service._serialize_project_basic_data(json, with_default json) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip'),
                'name', core_validator.raise_when_empty(coalesce(($1->>'name')::text, ($2->>'name')::text), 'name'),
                'status', coalesce(($1->>'status'::text), ($2->>'status'::text)),
                'permalink', core_validator.raise_when_empty(coalesce(($1->>'permalink')::text, ($2->>'permalink')::text), 'permalink'),
                'mode', core_validator.raise_when_empty(coalesce((($1->>'mode')::project_service.project_mode)::text,(($2->>'mode')::project_service.project_mode)::text), 'mode'),
                'about_html', coalesce(($1->>'about_html')::text, ($2->>'about_html')::text),
                'budget_html', coalesce(($1->>'budget_html')::text, ($2->>'budget_html')::text),
                'online_days', coalesce(($1->>'online_days')::integer, ($2->>'online_days')::integer),
                'cover_image_versions', coalesce(($1->>'cover_image_versions'), ($2->>'cover_image_versions'))::json,
                'card_info', json_build_object(
                    'image_url', coalesce(($1->'card_info'->>'image_url'), ($2->'card_info'->>'image_url'))::text,
                    'title', coalesce(($1->'card_info'->>'title'), ($2->'card_info'->>'title'))::text,
                    'description', coalesce(($1->'card_info'->>'description'), ($2->'card_info'->>'description'))::text
                ),
                'video_info', json_build_object(
                    'id', coalesce(($1->'video'->>'id'), ($2->'video'->>'id'))::text,
                    'provider', coalesce(($1->'video'->>'provider'), ($2->'video'->>'provider'))::text,
                    'embed_url', coalesce(($1->'video'->>'embed_url'), ($2->'video'->>'embed_url'))::text,
                    'thumb_url', coalesce(($1->'video'->>'cover_url'), ($2->'video'->>'cover_url'))::text
                ),
                'address', json_build_object(
                    'state', coalesce(($1->'address'->>'state'), ($2->'address'->>'state'))::text,
                    'city', coalesce(($1->'address'->>'city'), ($2->'address'->>'city'))::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
    $_$;

CREATE FUNCTION project_service._serialize_reward_basic_data(json) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'minimum_value', core_validator.raise_when_empty((($1->>'minimum_value')::decimal)::text, 'minimum_value')::decimal,
                'maximum_contributions', core_validator.raise_when_empty((($1->>'maximum_contributions')::integer)::text, 'maximum_contributions')::integer,
                'shipping_options', core_validator.raise_when_empty((($1->>'shipping_options')::project_service.shipping_options_enum)::text, 'shipping_options')::project_service.shipping_options_enum,
                'deliver_at', ($1->>'deliver_at')::date,
                'row_order',  ($1->>'row_order')::integer,
                'title', ($1->>'title')::text,
                'description', ($1->>'description')::text,
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;    
    $_$;


CREATE FUNCTION project_service._serialize_reward_basic_data(json, with_default json) RETURNS json
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', coalesce(($1->>'current_ip')::text, ($2->>'current_ip')),
                'minimum_value', core_validator.raise_when_empty(
                    coalesce((($1->>'minimum_value')::decimal)::text, ($2->>'minimum_value')::text), 'minimum_value')::decimal,
                'maximum_contributions', core_validator.raise_when_empty(
                    coalesce((($1->>'maximum_contributions')::integer)::text, ($2->>'maximum_contributions')::text), 'maximum_contributions')::integer,
                'shipping_options', core_validator.raise_when_empty(
                    coalesce((($1->>'shipping_options')::project_service.shipping_options_enum)::text, ($2->>'shipping_options')::text), 'shipping_options')::project_service.shipping_options_enum,
                'deliver_at', coalesce(($1->>'deliver_at')::date, ($2->>'deliver_at')::date),
                'row_order',  coalesce(($1->>'row_order')::integer, ($2->>'row_order')::integer),
                'title',  coalesce(($1->>'title')::text, ($2->>'title')::text),
                'description', coalesce(($1->>'description')::text, ($2->>'description')::text),
                'metadata', coalesce(($1->>'metadata')::json, ($2->>'metadata')::json)
            ) into _result;

            return _result;
        end;    
    $_$;

CREATE FUNCTION project_service_api.project(data json) RETURNS json
    LANGUAGE plpgsql
    AS $_$
    declare
        _platform platform_service.platforms;
        _user community_service.users;
        _result json;
        _permalink text;
        _refined jsonb;
        _project project_service.projects;
        _version project_service.project_versions;
        _is_creating boolean default true;
        _external_id text;
    begin
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user,scoped_user}');
        
        -- get project if id on json
        if ($1->>'id')::uuid is not null then
            select * from project_service.projects
                where id = ($1->>'id')::uuid 
                    and platform_id = core.current_platform_id()
                into _project;
                
            -- check if user has permission to handle on project
            if _project.id is null then
                raise 'project not found';
            end if;
            if not core.is_owner_or_admin(_project.user_id) then
                raise insufficient_privilege;
            end if;
            
            _is_creating := false;
        end if;
        
        -- select and check if user is on same platform
        select * from community_service.users cu
            where cu.id = (case when current_role = 'platform_user' then 
                            coalesce(_project.user_id, ($1->>'user_id')::uuid)
                            else core.current_user_id() end)
                and cu.platform_id = core.current_platform_id()
            into _user;
        
        if _user.id is null or not core.is_owner_or_admin(_user.id) then
            raise exception 'invalid user';
        end if;        
            
        -- check if permalink is provided
        if core_validator.is_empty($1->>'permalink'::text) then
            _permalink := unaccent(replace(lower($1->>'name'),' ','_'));
        else
            _permalink := unaccent(replace(lower($1->>'permalink'),' ','_'));
        end if;

        -- put first status on project
        select jsonb_set($1::jsonb, '{status}'::text[], to_jsonb('draft'::text))
            into _refined;
        
        -- put generated permalink into refined json
        select jsonb_set(_refined, '{permalink}'::text[], to_jsonb(_permalink::text))
            into _refined;
        
        -- put current request ip into refined json
        select jsonb_set(_refined, '{current_ip}'::text[], to_jsonb(core.request_ip_address()))
            into _refined;

        -- check if is mode is provided and update when draft
        if not core_validator.is_empty($1->>'mode'::text) and _project.status = 'draft' then
            _refined := jsonb_set(_refined, '{mode}'::text[], to_jsonb($1->>'mode'::text));
        end if;

        if _is_creating then
            -- redefined refined json with project basic serializer
            select project_service._serialize_project_basic_data(_refined::json)::jsonb
                into _refined;
            
            if current_role = 'platform_user' then
                _external_id := ($1->>'external_id')::text;
            end if;

            -- insert project 
            insert into project_service.projects (
                external_id, platform_id, user_id, permalink, name, mode, data
            ) values (_external_id, core.current_platform_id(), _user.id, _permalink, ($1 ->> 'name')::text, ($1 ->> 'mode')::project_service.project_mode, _refined)
            returning * into _project;
            
            -- insert first version of project
            insert into project_service.project_versions (
                project_id, data
            ) values (_project.id, row_to_json(_project)::jsonb)
            returning * into _version;
        else
            -- generate basic struct with given data
            _refined := project_service._serialize_project_basic_data(_refined::json, _project.data::json)::jsonb;

            -- insert old version of project on new version
            insert into project_service.project_versions(project_id, data)
                values (_project.id, row_to_json(_project)::jsonb)
            returning * into _version;

            -- update project with new generated data
            update project_service.projects
                set mode = (_refined ->> 'mode')::project_service.project_mode, 
                name = (_refined ->> 'name')::text, 
                permalink = (_refined ->> 'permalink')::text,
                data = _refined
                where id = _project.id
                returning * into _project;
        end if;
        
        select json_build_object(
            'id', _project.id,
            'old_version_id', _version.id,
            'permalink', _project.permalink,
            'mode', _project.mode,
            'status', _project.status,
            'data', _project.data
        ) into _result;

        return _result;
    end;
$_$;


CREATE FUNCTION project_service_api.reward(data json) RETURNS json
    LANGUAGE plpgsql
    AS $_$
        declare
            _is_creating boolean default false;
            _result json;
            _reward project_service.rewards;
            _project project_service.projects;
            _version project_service.reward_versions;
            _refined jsonb;
            _created_at timestamp default now();
            _external_id text;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');
            
            -- check if have a id on request
            if ($1->>'id') is not null then
                select * from project_service.rewards
                    where id = ($1->>'id')::uuid
                    into _reward;
                    
                -- get project
                select * from project_service.projects
                    where id = _reward.project_id
                    into _project;
                
                if _reward.id is null or _project.id is null then
                    raise 'resource not found';
                end if;
            else
                _is_creating := true;
                -- get project
                select * from project_service.projects
                    where id = ($1->>'project_id')::uuid
                        and platform_id = core.current_platform_id()
                    into _project;
                -- check if project exists
                if _project.id is null then
                    raise 'project not found';
                end if;                    
            end if;

            -- check if project user is owner
            if not core.is_owner_or_admin(_project.user_id) then
                raise exception insufficient_privilege;
            end if;

            -- add some default data to refined
            _refined := jsonb_set(($1)::jsonb, '{current_ip}'::text[], to_jsonb(core.force_ip_address()::text));
            
            -- check if is creating or updating
            if _is_creating then
                _refined := jsonb_set(_refined, '{shipping_options}'::text[], to_jsonb(
                    coalesce(($1->>'shipping_options')::project_service.shipping_options_enum, 'free')::text
                ));
                _refined := jsonb_set(_refined, '{maximum_contributions}'::text[], to_jsonb(
                    coalesce(($1->>'maximum_contributions')::integer, 0)::text
                ));
                _refined := project_service._serialize_reward_basic_data(_refined::json)::jsonb;
                
                if current_role = 'platform_user' then
                    _external_id := ($1->>'external_id')::text;
                    _created_at := ($1->>'created_at')::timestamp;
                end if;
                
                -- insert new reward and version
                insert into project_service.rewards (platform_id, external_id, project_id, data, created_at)
                    values (_project.platform_id, _external_id, _project.id, _refined, _created_at)
                    returning * into _reward;
                insert into project_service.reward_versions(reward_id, data) 
                    values (_reward.id, row_to_json(_reward.*)::jsonb)
                    returning * into _version;                
            else
                _refined := project_service._serialize_reward_basic_data(_refined::json, _reward.data::json)::jsonb;
                -- insert new version and update reward
                insert into project_service.reward_versions(reward_id, data) 
                    values (_reward.id, row_to_json(_reward.*)::jsonb)
                    returning * into _version;
                update project_service.rewards
                    set data = _refined
                    where id = _reward.id
                    returning * into _reward;                
            end if;
            
            select json_build_object(
                'id', _reward.id,
                'old_version_id', _version.id,
                'data', _reward.data
            ) into _result;
            
            return _result;
        end;
    $_$;


CREATE VIEW analytics_service_api.users_count AS
 SELECT count(*) AS users
   FROM community_service.users
  WHERE (users.platform_id = core.current_platform_id());

COMMENT ON VIEW analytics_service_api.users_count IS 'Shows the number of users on actual platform';

CREATE VIEW community_service_api.users AS
 SELECT u.external_id,
    u.id,
    (u.data ->> 'name'::text) AS name,
    (u.data ->> 'public_name'::text) AS public_name,
    (u.data ->> 'document_number'::text) AS document_number,
    (u.data ->> 'document_type'::text) AS document_type,
    (u.data ->> 'legal_account_type'::text) AS legal_account_type,
    u.email,
    ((u.data ->> 'address'::text))::jsonb AS address,
    ((u.data ->> 'metadata'::text))::jsonb AS metadata,
    ((u.data ->> 'bank_account'::text))::jsonb AS bank_account,
    u.created_at,
    u.updated_at
   FROM community_service.users u
  WHERE (u.platform_id = core.current_platform_id());


CREATE VIEW payment_service_api.payments AS
 SELECT cp.id,
    cp.subscription_id,
    ((cp.data ->> 'amount'::text))::numeric AS amount,
    cp.project_id,
    cp.status,
    payment_service.paid_transition_at(cp.*) AS paid_at,
    cp.created_at,
    p.status AS project_status,
    p.mode AS project_mode,
    (cp.data ->> 'payment_method'::text) AS payment_method,
        CASE
            WHEN core.is_owner_or_admin(cp.user_id) THEN ((cp.data ->> 'customer'::text))::json
            ELSE NULL::json
        END AS billing_data,
        CASE
            WHEN (core.is_owner_or_admin(cp.user_id) AND ((cp.data ->> 'payment_method'::text) = 'credit_card'::text)) THEN json_build_object('first_digits', (cp.gateway_general_data ->> 'card_first_digits'::text), 'last_digits', (cp.gateway_general_data ->> 'card_last_digits'::text), 'brand', (cp.gateway_general_data ->> 'card_brand'::text), 'country', (cp.gateway_general_data ->> 'card_country'::text))
            WHEN (core.is_owner_or_admin(cp.user_id) AND ((cp.data ->> 'payment_method'::text) = 'boleto'::text)) THEN json_build_object('barcode', (cp.gateway_general_data ->> 'boleto_barcode'::text), 'url', (cp.gateway_general_data ->> 'boleto_url'::text), 'expiration_date', ((cp.gateway_general_data ->> 'boleto_expiration_date'::text))::timestamp without time zone)
            ELSE NULL::json
        END AS payment_method_details
   FROM ((payment_service.catalog_payments cp
     JOIN project_service.projects p ON ((p.id = cp.project_id)))
     JOIN community_service.users u ON ((u.id = cp.user_id)))
  WHERE ((cp.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(cp.user_id) OR core.is_owner_or_admin(p.user_id)))
  ORDER BY cp.id DESC;

CREATE VIEW payment_service_api.subscriptions AS
 SELECT s.id,
    s.project_id,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN s.credit_card_id
            ELSE NULL::uuid
        END AS credit_card_id,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN stats.paid_count
            ELSE NULL::bigint
        END AS paid_count,
        CASE
            WHEN core.is_owner_or_admin(s.user_id) THEN stats.total_paid
            ELSE (NULL::bigint)::numeric
        END AS total_paid,
    s.status,
    payment_service.paid_transition_at(last_paid_payment.*) AS paid_at,
    (payment_service.paid_transition_at(last_paid_payment.*) + '1 mon'::interval) AS next_charge_at,
    ((((s.checkout_data - 'card_id'::text) - 'card_hash'::text) - 'current_ip'::text) || jsonb_build_object('customer', (((s.checkout_data ->> 'customer'::text))::jsonb || jsonb_build_object('name', (u.data ->> 'name'::text), 'email', (u.data ->> 'email'::text), 'document_number', (u.data ->> 'document_number'::text))))) AS checkout_data,
    s.created_at
   FROM (((((payment_service.subscriptions s
     JOIN project_service.projects p ON ((p.id = s.project_id)))
     JOIN community_service.users u ON ((u.id = s.user_id)))
     LEFT JOIN LATERAL ( SELECT sum(((cp.data ->> 'amount'::text))::numeric) AS total_paid,
            count(1) FILTER (WHERE (cp.status = 'paid'::payment_service.payment_status)) AS paid_count,
            count(1) FILTER (WHERE (cp.status = 'refused'::payment_service.payment_status)) AS refused_count
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)) stats ON (true))
     LEFT JOIN LATERAL ( SELECT *
           FROM payment_service.catalog_payments cp
          WHERE ((cp.subscription_id = s.id) AND (cp.status = 'paid'::payment_service.payment_status))
          ORDER BY cp.id DESC
         LIMIT 1) last_paid_payment ON (true))
     LEFT JOIN LATERAL ( SELECT *
           FROM payment_service.catalog_payments cp
          WHERE (cp.subscription_id = s.id)
          ORDER BY cp.id DESC
         LIMIT 1) last_payment ON (true))
  WHERE ((s.platform_id = core.current_platform_id()) AND (core.is_owner_or_admin(s.user_id) OR core.is_owner_or_admin(p.user_id)));

CREATE VIEW project_service_api.projects AS
 SELECT p.id,
    p.external_id,
    p.user_id,
    p.permalink,
    p.mode,
    p.name
   FROM project_service.projects p
  WHERE ((p.platform_id = core.current_platform_id()) AND core.has_any_of_roles('{platform_user}'::text[]));


CREATE VIEW project_service_api.rewards AS
 SELECT r.id,
    r.external_id,
    r.project_id,
    r.data,
    ((r.data ->> 'metadata'::text))::jsonb AS metadata,
    r.created_at,
    r.updated_at
   FROM project_service.rewards r
  WHERE ((r.platform_id = core.current_platform_id()) AND core.has_any_of_roles('{platform_user}'::text[]))
  ORDER BY r.id DESC;


CREATE TRIGGER set_updated_at BEFORE UPDATE ON core.core_settings FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON payment_service.credit_cards FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON payment_service.catalog_payments FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_service.platforms FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_service.users FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON platform_service.platform_users FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_service.project_versions FOR EACH ROW EXECUTE PROCEDURE public.diesel_set_updated_at();


GRANT USAGE ON SCHEMA analytics_service TO scoped_user;
GRANT USAGE ON SCHEMA analytics_service TO platform_user;
GRANT USAGE ON SCHEMA analytics_service TO postgrest;
GRANT USAGE ON SCHEMA analytics_service TO admin;

GRANT USAGE ON SCHEMA analytics_service_api TO scoped_user;
GRANT USAGE ON SCHEMA analytics_service_api TO platform_user;
GRANT USAGE ON SCHEMA analytics_service_api TO postgrest;
GRANT USAGE ON SCHEMA analytics_service_api TO admin;

GRANT USAGE ON SCHEMA community_service TO platform_user;
GRANT USAGE ON SCHEMA community_service TO postgrest;
GRANT USAGE ON SCHEMA community_service TO anonymous;
GRANT USAGE ON SCHEMA community_service TO admin;
GRANT USAGE ON SCHEMA community_service TO scoped_user;

GRANT USAGE ON SCHEMA community_service_api TO platform_user;
GRANT USAGE ON SCHEMA community_service_api TO anonymous;
GRANT USAGE ON SCHEMA community_service_api TO postgrest;
GRANT USAGE ON SCHEMA community_service_api TO admin;
GRANT USAGE ON SCHEMA community_service_api TO scoped_user;

GRANT USAGE ON SCHEMA core TO scoped_user;
GRANT USAGE ON SCHEMA core TO platform_user;
GRANT USAGE ON SCHEMA core TO anonymous;

GRANT USAGE ON SCHEMA core_validator TO scoped_user;
GRANT USAGE ON SCHEMA core_validator TO platform_user;
GRANT USAGE ON SCHEMA core_validator TO postgrest;
GRANT USAGE ON SCHEMA core_validator TO admin;

GRANT USAGE ON SCHEMA payment_service TO scoped_user;
GRANT USAGE ON SCHEMA payment_service TO platform_user;
GRANT USAGE ON SCHEMA payment_service TO postgrest;
GRANT USAGE ON SCHEMA payment_service TO admin;

GRANT USAGE ON SCHEMA payment_service_api TO scoped_user;
GRANT USAGE ON SCHEMA payment_service_api TO platform_user;
GRANT USAGE ON SCHEMA payment_service_api TO postgrest;
GRANT USAGE ON SCHEMA payment_service_api TO admin;

GRANT USAGE ON SCHEMA platform_service TO scoped_user;
GRANT USAGE ON SCHEMA platform_service TO platform_user;
GRANT USAGE ON SCHEMA platform_service TO anonymous;
GRANT USAGE ON SCHEMA platform_service TO admin;

GRANT USAGE ON SCHEMA platform_service_api TO admin;
GRANT USAGE ON SCHEMA platform_service_api TO platform_user;
GRANT USAGE ON SCHEMA platform_service_api TO anonymous;

GRANT USAGE ON SCHEMA project_service TO scoped_user;
GRANT USAGE ON SCHEMA project_service TO platform_user;
GRANT USAGE ON SCHEMA project_service TO postgrest;
GRANT USAGE ON SCHEMA project_service TO admin;

GRANT USAGE ON SCHEMA project_service_api TO scoped_user;
GRANT USAGE ON SCHEMA project_service_api TO platform_user;
GRANT USAGE ON SCHEMA project_service_api TO postgrest;
GRANT USAGE ON SCHEMA project_service_api TO admin;

GRANT ALL ON FUNCTION community_service_api.create_scoped_user_session(id uuid) TO platform_user;


GRANT ALL ON FUNCTION community_service_api."user"(data json) TO scoped_user;
GRANT ALL ON FUNCTION community_service_api."user"(data json) TO platform_user;

GRANT SELECT,INSERT,UPDATE ON TABLE payment_service.catalog_payments TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE payment_service.catalog_payments TO platform_user;
GRANT SELECT,INSERT,UPDATE ON TABLE payment_service.catalog_payments TO admin;

GRANT SELECT,INSERT,UPDATE ON TABLE payment_service.subscriptions TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE payment_service.subscriptions TO platform_user;
GRANT SELECT,INSERT,UPDATE ON TABLE payment_service.subscriptions TO admin;

GRANT ALL ON FUNCTION payment_service_api.pay(data json) TO scoped_user;
GRANT ALL ON FUNCTION payment_service_api.pay(data json) TO platform_user;

GRANT SELECT,INSERT ON TABLE platform_service.platforms TO platform_user;
GRANT SELECT,INSERT ON TABLE platform_service.platforms TO admin;
GRANT SELECT ON TABLE platform_service.platforms TO scoped_user;

GRANT ALL ON FUNCTION platform_service_api.create_platform(name text) TO platform_user;


GRANT SELECT,INSERT ON TABLE platform_service.platform_api_keys TO platform_user;
GRANT SELECT,INSERT ON TABLE platform_service.platform_api_keys TO admin;

GRANT SELECT,INSERT ON TABLE platform_service.platform_users TO platform_user;
GRANT SELECT,INSERT ON TABLE platform_service.platform_users TO admin;

GRANT SELECT ON TABLE platform_service_api.api_keys TO platform_user;
GRANT SELECT ON TABLE platform_service_api.api_keys TO admin;

GRANT ALL ON FUNCTION platform_service_api.generate_api_key(platform_id uuid) TO admin;
GRANT ALL ON FUNCTION platform_service_api.generate_api_key(platform_id uuid) TO platform_user;

GRANT ALL ON FUNCTION platform_service_api.login(email text, password text) TO anonymous;

GRANT ALL ON FUNCTION platform_service_api.sign_up(name text, email text, password text) TO anonymous;


GRANT ALL ON FUNCTION project_service_api.project(data json) TO scoped_user;
GRANT ALL ON FUNCTION project_service_api.project(data json) TO platform_user;

GRANT ALL ON FUNCTION project_service_api.reward(data json) TO scoped_user;
GRANT ALL ON FUNCTION project_service_api.reward(data json) TO platform_user;


GRANT SELECT ON TABLE community_service.users TO postgrest;
GRANT SELECT ON TABLE community_service.users TO admin;
GRANT SELECT,UPDATE ON TABLE community_service.users TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE community_service.users TO platform_user;
GRANT SELECT ON TABLE community_service.users TO anonymous;

GRANT SELECT ON TABLE analytics_service_api.users_count TO platform_user;
GRANT SELECT ON TABLE analytics_service_api.users_count TO admin;
GRANT SELECT ON TABLE analytics_service_api.users_count TO scoped_user;

GRANT SELECT,INSERT ON TABLE community_service.user_versions TO scoped_user;
GRANT SELECT,INSERT ON TABLE community_service.user_versions TO platform_user;

GRANT SELECT ON TABLE community_service_api.users TO platform_user;

GRANT SELECT ON TABLE core.core_settings TO platform_user;
GRANT SELECT ON TABLE core.core_settings TO anonymous;
GRANT SELECT ON TABLE core.core_settings TO scoped_user;

GRANT SELECT,INSERT ON TABLE payment_service.catalog_payment_versions TO scoped_user;
GRANT SELECT,INSERT ON TABLE payment_service.catalog_payment_versions TO platform_user;

GRANT SELECT ON TABLE payment_service.payment_status_transitions TO platform_user;
GRANT SELECT ON TABLE payment_service.payment_status_transitions TO scoped_user;

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.projects TO platform_user;
GRANT SELECT ON TABLE project_service.projects TO anonymous;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.projects TO admin;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.projects TO scoped_user;

GRANT SELECT ON TABLE payment_service_api.payments TO platform_user;
GRANT SELECT ON TABLE payment_service_api.payments TO scoped_user;

GRANT SELECT ON TABLE payment_service_api.subscriptions TO platform_user;
GRANT SELECT ON TABLE payment_service_api.subscriptions TO scoped_user;

GRANT SELECT,INSERT ON TABLE platform_service.users TO platform_user;
GRANT SELECT,INSERT ON TABLE platform_service.users TO anonymous;
GRANT SELECT,INSERT ON TABLE platform_service.users TO admin;

GRANT SELECT,INSERT ON TABLE project_service.project_versions TO scoped_user;
GRANT SELECT,INSERT ON TABLE project_service.project_versions TO platform_user;
GRANT SELECT,INSERT ON TABLE project_service.project_versions TO admin;


GRANT SELECT,INSERT,UPDATE ON TABLE project_service.reward_versions TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.reward_versions TO platform_user;

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.rewards TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.rewards TO platform_user;

GRANT SELECT ON TABLE project_service_api.projects TO platform_user;

GRANT SELECT ON TABLE project_service_api.rewards TO platform_user;