-- Your SQL goes here
CREATE TABLE payment_service.subscription_versions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    subscription_id uuid NOT NULL REFERENCES payment_service.subscriptions(id),
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE payment_service.catalog_payment_versions IS 'store catalog payment versions when need to be updated';