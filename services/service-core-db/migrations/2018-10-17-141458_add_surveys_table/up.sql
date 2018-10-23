CREATE TABLE project_service.surveys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    reward_id uuid NOT NULL references project_service.rewards(id),
    confirm_address boolean,
    sent_at timestamp without time zone,
    finished_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.surveys TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.surveys TO platform_user;

-----------------------
CREATE TABLE project_service.survey_open_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    survey_id uuid NOT NULL references project_service.surveys(id),
    question text,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_open_questions TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_open_questions TO platform_user;

-----------------------
CREATE TABLE project_service.survey_multiple_choice_questions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    survey_id uuid NOT NULL references project_service.surveys(id),
    question text,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_multiple_choice_questions TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_multiple_choice_questions TO platform_user;

-----------------------

CREATE TABLE project_service.survey_open_question_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    survey_open_question_id uuid NOT NULL references project_service.survey_open_questions(id),
    contribution_id uuid NOT NULL references payment_service.contributions(id),
    answer text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_open_question_answers TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_open_question_answers TO platform_user;
-----------------------

CREATE TABLE project_service.survey_question_choices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    survey_multiple_choice_question_id uuid NOT NULL references project_service.survey_multiple_choice_questions(id),
    option text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_question_choices TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_question_choices TO platform_user;
-----------------------

CREATE TABLE project_service.survey_multiple_choice_question_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    survey_question_choice_id uuid NOT NULL references project_service.survey_question_choices(id),
    contribution_id uuid NOT NULL references payment_service.contributions(id),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_multiple_choice_question_answers TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_multiple_choice_question_answers TO platform_user;
-----------------------

CREATE TABLE project_service.survey_address_answers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    contribution_id uuid NOT NULL references payment_service.contributions(id),
    address_id uuid NOT NULL references community_service.addresses(id),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    external_id text
);

GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_address_answers TO scoped_user;
GRANT SELECT,INSERT,UPDATE ON TABLE project_service.survey_address_answers TO platform_user;
