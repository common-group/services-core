-- Your SQL goes here
create extension if not exists unaccent;

alter table project_service.projects
    add column if not exists permalink text;

update project_service.projects
    set permalink = unaccent(replace(lower(name),' ','_'));

alter table project_service.projects
    alter column permalink set not null;

alter table project_service.projects 
    add constraint unq_permalink_on_platform unique(platform_id, permalink);

alter table project_service.projects
    add column if not exists status text not null default 'draft';

drop function project_service_api.create_project(project json);

CREATE OR REPLACE FUNCTION project_service_api.create_project(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
    declare
        _platform platform_service.platforms;
        _user community_service.users;
        _result json;
        _permalink text;
        _refined jsonb;
        _project project_service.projects;
        _version project_service.project_versions;
    begin
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user}');
        
        -- select and check if user is on same platform
        select * from community_service.users cu
            where cu.id = ($1 ->> 'user_id')::bigint
                and cu.platform_id = core.current_platform_id()
            into _user;

        if _user.id is null then
            raise exception 'invalid user id';
        end if;
        
        -- check if permalink is provided
        if core_validator.is_empty($1->>'permalink'::text) then
            _permalink := unaccent(replace(replace(lower($1->>'name'),' ','_'), '-', '_'));
        else
            _permalink := unaccent(replace(replace(lower($1->>'permalink'),' ','_'), '-', '_'));
        end if;

        -- put first status on project
        select jsonb_set($1::jsonb, '{status}'::text[], to_jsonb('draft'::text))
            into _refined;
        
        -- put generated permalink into refined json
        select jsonb_set(_refined, '{permalink}'::text[], to_jsonb(_permalink::text))
            into _refined;
        
        -- put current request ip into refined json
        select jsonb_set(_refined, '{current_ip}'::text[], to_jsonb(core.request_ip_adress()))
            into _refined;
        
        -- redefined refined json with project basic serializer
        select project_service._serialize_project_basic_data(_refined::json)::jsonb
            into _refined;
        
        -- insert project 
        insert into project_service.projects (
            platform_id, user_id, permalink, name, mode, data
        ) values (core.current_platform_id(), _user.id, _permalink, ($1 ->> 'name')::text, ($1 ->> 'mode')::project_service.project_mode, _refined)
        returning * into _project;
        
        -- insert first version of project
        insert into project_service.project_versions (
            project_id, data
        ) values (_project.id, _project.data)
        returning * into _version;
        
        select json_build_object(
            'id', _project.id,
            'old_version_id', _version.id,
            'permalink', _project.permalink,
            'mode', _project.mode,
            'status', _project.status,
            'data', _project.data            
        ) into _result;

        return _result;
    end;
$function$;

create or replace function core.request_ip_adress() returns text
    language sql
    as $$
        select current_setting('request.header.x-forwarded-for', true);
    $$;

CREATE OR REPLACE FUNCTION project_service._serialize_project_basic_data(json)
 RETURNS json
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip')::text,
                'name', core_validator.raise_when_empty(($1->>'name')::text, 'name'),
                'status', ($1->>'status'::text),
                'permalink', core_validator.raise_when_empty(($1->>'permalink')::text, 'permalink'),
                'mode', core_validator.raise_when_empty((($1->>'mode')::project_service.project_mode)::text, 'mode'),
                'about_html', ($1->>'about_html')::text,
                'budget_html', ($1->>'budget_html')::text,
                'online_days', ($1->>'online_days')::integer,
                'cover_image_versions', ($1->>'cover_image_versions')::json,
                'card_info', json_build_object(
                    'image_url', ($1->'card_info'->>'image_url')::text,
                    'title', ($1->'card_info'->>'title')::text,
                    'description', ($1->'card_info'->>'description')::text
                ),
                'video_info', json_build_object(
                    'id', ($1->'video'->>'id')::text,
                    'provider', ($1->'video'->>'provider')::text,
                    'embed_url', ($1->'video'->>'embed_url')::text,
                    'thumb_url', ($1->'video'->>'cover_url')::text
                ),
                'address', json_build_object(
                    'state', ($1->'address'->>'state')::text,
                    'city', ($1->'address'->>'city')::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
    $function$;