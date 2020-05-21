-- Your SQL goes here
CREATE TABLE payment_service.antifraud_analyses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    catalog_payment_id uuid NOT NULL,
    cost numeric NOT NULL DEFAULT 0.0,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

GRANT SELECT ON payment_service.antifraud_analyses TO catarse_fdw;
