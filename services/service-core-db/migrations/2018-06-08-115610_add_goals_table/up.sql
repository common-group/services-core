-- Your SQL goes here

CREATE TABLE project_service.goal_versions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    goal_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE project_service.goals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    project_id uuid NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    platform_id uuid NOT NULL,
    external_id text
);


ALTER TABLE ONLY project_service.goal_versions
    ADD CONSTRAINT goal_versions_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES project_service.goals(id);

ALTER TABLE ONLY project_service.goals
    ADD CONSTRAINT goals_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY project_service.goals
    ADD CONSTRAINT goals_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);


GRANT SELECT,INSERT,UPDATE ON TABLE project_service.goal_versions TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.goal_versions TO platform_user;

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.goals TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.goals TO platform_user;
