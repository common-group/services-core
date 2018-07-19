-- Your SQL goes here

CREATE TABLE community_service.addresses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    country_id uuid NOT NULL,
    state_id uuid NOT NULL,
    external_id text,
    address_street	text,
    address_number	text,
    address_complement	text,
    address_neighbourhood	text,
    address_city	text,
    address_zip_code	text,
    address_state	text,
    phone_number	text
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY community_service.addresses
    ADD CONSTRAINT addresses_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY community_service.addresses
    ADD CONSTRAINT addresses_country_id_fkey FOREIGN KEY (country_id) REFERENCES information_service.countries(id);

ALTER TABLE ONLY community_service.addresses
    ADD CONSTRAINT addresses_state_id_fkey FOREIGN KEY (state_id) REFERENCES information_service.states(id);

GRANT SELECT,INSERT,UPDATE ON TABLE community_service.addresses TO scoped_user, platform_user;
GRANT SELECT ON TABLE community_service.addresses TO anonymous;

---

CREATE TABLE project_service.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    external_id text,
    name text NOT NULL,
    translations jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY project_service.categories
    ADD CONSTRAINT categories_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.categories TO scoped_user, platform_user;
GRANT SELECT ON TABLE project_service.categories TO anonymous;

---

CREATE TABLE information_service.banks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    external_id text,
    name text NOT NULL,
    code text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY information_service.banks
    ADD CONSTRAINT banks_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

GRANT SELECT,INSERT,UPDATE ON TABLE information_service.banks TO scoped_user, platform_user;
GRANT SELECT ON TABLE information_service.banks TO anonymous;

---

CREATE TABLE community_service.bank_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    user_id uuid NOT NULL,
    bank_id uuid NOT NULL,
    external_id text,
    account	text	NOT NULL,
    agency	text	NOT NULL,
    owner_name	text,
    owner_document text,
    account_digit	text	NOT NULL,
    agency_digit	text,
    account_type	text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY community_service.bank_accounts
    ADD CONSTRAINT bank_accounts_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY community_service.bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY community_service.bank_accounts
    ADD CONSTRAINT bank_accounts_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES information_service.banks(id);

GRANT SELECT,INSERT,UPDATE ON TABLE community_service.bank_accounts TO scoped_user, platform_user;
GRANT SELECT ON TABLE community_service.bank_accounts TO anonymous;
