-- Your SQL goes here

CREATE TABLE project_service.shipping_fees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    reward_id uuid,
    destination	text,
    value	numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE project_service.shipping_fees ADD FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);
ALTER TABLE project_service.shipping_fees ADD FOREIGN KEY (reward_id) REFERENCES project_service.rewards(id);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.shipping_fees TO scoped_user, platform_user;
GRANT SELECT ON TABLE project_service.shipping_fees TO anonymous;

-----

CREATE TABLE analytics_service.origins (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    domain	text	NOT NULL,
    referral	text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE analytics_service.origins ADD FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

GRANT SELECT,INSERT,UPDATE ON TABLE analytics_service.origins TO scoped_user, platform_user;
GRANT SELECT ON TABLE analytics_service.origins TO anonymous;

----

CREATE TABLE payment_service.contributions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reward_id uuid,
    address_id uuid,
    shipping_fee_id	uuid,
    origin_id	uuid,
    external_id text,
    value numeric NOT NULL,
    anonymous boolean DEFAULT FALSE,
    notified_finish boolean DEFAULT FALSE,
    payer_name	text,
    payer_email	text	NOT NULL,
    payer_document	text,
    payment_choice	text,
    payment_service_fee	numeric,
    referral_link	text,
    card_owner_document	text,
    delivery_status	text	DEFAULT 'undelivered'::text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    deleted_at	timestamp without time zone,
    reward_sent_at	timestamp without time zone,
    reward_received_at	timestamp without time zone,
    survey_answered_at	timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY payment_service.contributions
    ADD CONSTRAINT contributions_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY payment_service.contributions
    ADD CONSTRAINT contributions_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

ALTER TABLE ONLY payment_service.contributions
    ADD CONSTRAINT contributions_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY payment_service.contributions
    ADD CONSTRAINT contributions_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES project_service.rewards(id);

ALTER TABLE ONLY payment_service.contributions
    ADD CONSTRAINT contributions_address_id_fkey FOREIGN KEY (address_id) REFERENCES community_service.addresses(id);

ALTER TABLE project_service.contributions ADD FOREIGN KEY (shipping_fee_id) REFERENCES project_service.shipping_fees(id);
ALTER TABLE project_service.contributions ADD FOREIGN KEY (origin_id) REFERENCES analytics_service.origins(id);

GRANT SELECT,INSERT,UPDATE ON TABLE payment_service.contributions TO scoped_user, platform_user;
GRANT SELECT ON TABLE payment_service.contributions TO anonymous;
