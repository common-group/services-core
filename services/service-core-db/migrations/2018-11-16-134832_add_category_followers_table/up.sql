CREATE TABLE project_service.category_followers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    category_id uuid NOT NULL references project_service.categories(id),
    user_id uuid NOT NULL references community_service.users(id),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.category_followers TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.category_followers TO platform_user;
