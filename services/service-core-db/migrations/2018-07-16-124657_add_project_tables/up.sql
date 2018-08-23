-- Your SQL goes here
CREATE TABLE project_service.reminders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    external_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE ONLY project_service.reminders
    ADD CONSTRAINT reminders_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY project_service.reminders
    ADD CONSTRAINT reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY project_service.reminders
    ADD CONSTRAINT reminders_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.reminders TO scoped_user, platform_user;
GRANT SELECT ON TABLE project_service.reminders TO anonymous;

CREATE TABLE project_service.reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    user_id uuid,
    project_id uuid NOT NULL,
    external_id text,
    reason text,
    email text,
    details text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE ONLY project_service.reports
    ADD CONSTRAINT reports_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY project_service.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES community_service.users(id);

ALTER TABLE ONLY project_service.reports
    ADD CONSTRAINT reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.reports TO scoped_user, platform_user;
GRANT SELECT ON TABLE project_service.reports TO anonymous;


CREATE TABLE project_service.cancelations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    platform_id uuid NOT NULL,
    project_id uuid NOT NULL,
    external_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE ONLY project_service.cancelations
    ADD CONSTRAINT cancelations_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform_service.platforms(id);

ALTER TABLE ONLY project_service.cancelations
    ADD CONSTRAINT cancelations_project_id_fkey FOREIGN KEY (project_id) REFERENCES project_service.projects(id);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.cancelations TO scoped_user, platform_user;
GRANT SELECT ON TABLE project_service.cancelations TO anonymous;
