-- Your SQL goes here
CREATE TYPE core.jwt_token AS (
  token text
);
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA platform_service;

CREATE TABLE IF NOT EXISTS platform_service.platforms (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "token" uuid UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);
COMMENT ON TABLE platform_service.platforms IS 'hold platforms names/configurations';

select diesel_manage_updated_at('platform_service.platforms');

CREATE TABLE IF NOT EXISTS platform_service.users (
    id serial not null primary key,
    email text not null check ( email ~* '^.+@.+\..+$' ),
    password text not null check(length(password) < 512),
    name text not null check(length(name) < 255),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    email_confirmed_at timestamp,
    disabled_at timestamp,
    CONSTRAINT uidx_users_email UNIQUE (email)
);
COMMENT ON TABLE platform_service.users IS 'Platform admin users';
select diesel_manage_updated_at('platform_service.users');

CREATE TABLE IF NOT EXISTS platform_service.platform_users (
    id serial not null primary key,
    user_id integer references platform_service.users(id) not null,
    platform_id integer references platform_service.platforms(id) not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    CONSTRAINT uuidx_user_and_platform UNIQUE (user_id, platform_id)
);
COMMENT ON TABLE platform_service.platform_users IS 'Manage platform user with platform';
select diesel_manage_updated_at('platform_service.platform_users');

CREATE TABLE platform_service.platform_api_keys (
    id serial not null primary key,
    platform_id integer references platform_service.platforms(id) not null,
    token text not null unique,
    created_at timestamp not null default now(),
    disabled_at timestamp
);
