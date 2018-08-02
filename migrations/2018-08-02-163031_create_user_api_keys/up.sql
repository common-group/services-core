-- Your SQL goes here
CREATE TABLE community_service.user_api_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL REFERENCES platform_service.platforms(id),
    user_id uuid NOT NULL REFERENCES community_service.users(id),
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    disabled_at timestamp without time zone
);

COMMENT ON TABLE community_service.user_api_keys IS 'User generated api keys';
