-- Your SQL goes here

CREATE TABLE community_service.direct_messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    user_id uuid,
    to_user_id uuid NOT NULL,
    project_id uuid,
    from_email	text,
    from_name	text,
    content	text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY community_service.direct_messages
    ADD CONSTRAINT direct_messages_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY community_service.direct_messages
    ADD CONSTRAINT direct_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY community_service.direct_messages
    ADD CONSTRAINT direct_messages_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY community_service.direct_messages
    ADD CONSTRAINT direct_messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

GRANT SELECT,INSERT,UPDATE ON TABLE community_service.direct_messages TO scoped_user, platform_user;
GRANT SELECT ON TABLE community_service.direct_messages TO anonymous;
