-- Your SQL goes here

CREATE TABLE project_service.posts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reward_id uuid,
    external_id text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    title text NOT NULL,
    comment_html text NOT NULL,
    recipients character varying DEFAULT 'backers'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY project_service.posts
    ADD CONSTRAINT posts_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY project_service.posts
    ADD CONSTRAINT posts_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

ALTER TABLE ONLY project_service.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY project_service.posts
    ADD CONSTRAINT posts_reward_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.rewards(id);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.posts TO scoped_user, platform_user;
GRANT SELECT ON TABLE project_service.posts TO anonymous;
