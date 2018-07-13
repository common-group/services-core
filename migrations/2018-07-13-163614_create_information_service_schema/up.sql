-- Your SQL goes here
CREATE SCHEMA information_service;
CREATE SCHEMA information_service_api;

CREATE TABLE information_service.countries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    translations jsonb DEFAULT '{}'::jsonb NOT NULL,
    external_id text,
    name character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE information_service.states (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    external_id text,
    name character varying NOT NULL,
    acronym character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE information_service.cities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    state_id uuid NOT NULL,
    external_id text,
    name character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY information_service.countries
    ADD CONSTRAINT countries_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY information_service.states
    ADD CONSTRAINT states_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY information_service.cities
    ADD CONSTRAINT cities_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY information_service.cities
    ADD CONSTRAINT cities_state_id_fkey FOREIGN KEY (state_id) REFERENCES information_service.states(id);

GRANT SELECT,INSERT,UPDATE ON TABLE information_service.countries TO scoped_user, platform_user;
GRANT SELECT ON TABLE information_service.countries TO anonymous;

GRANT SELECT,INSERT,UPDATE ON TABLE information_service.states TO scoped_user, platform_user;
GRANT SELECT ON TABLE information_service.states TO anonymous;

GRANT SELECT,INSERT,UPDATE ON TABLE information_service.cities TO scoped_user, platform_user;
GRANT SELECT ON TABLE information_service.cities TO anonymous;
