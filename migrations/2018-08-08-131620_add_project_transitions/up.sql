-- Your SQL goes here

CREATE TABLE project_service.project_transitions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES project_service.projects(id),
    to_state	character varying (259)	NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    sort_key	integer	NOT NULL,
    most_recent	boolean	NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);
