-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION project_service_api.project(data json)
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
        _is_creating boolean default true;
        _external_id text;
    begin
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user,scoped_user}');
        
        -- get project if id on json
        if ($1->>'id')::uuid is not null then
            select * from project_service.projects
                where id = ($1->>'id')::uuid 
                    and platform_id = core.current_platform_id()
                into _project;
                
            -- check if user has permission to handle on project
            if _project.id is null then
                raise 'project not found';
            end if;
            if not core.is_owner_or_admin(_project.user_id) then
                raise insufficient_privilege;
            end if;
            
            _is_creating := false;
        end if;
        
        -- select and check if user is on same platform
        select * from community_service.users cu
            where cu.id = (case when current_role = 'platform_user' then 
                            coalesce(_project.user_id, ($1->>'user_id')::uuid)
                            else core.current_user_id() end)
                and cu.platform_id = core.current_platform_id()
            into _user;
        
        if _user.id is null or not core.is_owner_or_admin(_user.id) then
            raise exception 'invalid user';
        end if;        
            
        -- check if permalink is provided
        if core_validator.is_empty($1->>'permalink'::text) then
            _permalink := unaccent(replace(lower($1->>'name'),' ','_'));
        else
            _permalink := unaccent(replace(lower($1->>'permalink'),' ','_'));
        end if;

        -- put first status on project
        select jsonb_set($1::jsonb, '{status}'::text[], to_jsonb('draft'::text))
            into _refined;
        
        -- put generated permalink into refined json
        select jsonb_set(_refined, '{permalink}'::text[], to_jsonb(_permalink::text))
            into _refined;
        
        -- put current request ip into refined json
        select jsonb_set(_refined, '{current_ip}'::text[], to_jsonb(core.request_ip_address()))
            into _refined;

        -- check if is mode is provided and update when draft
        if not core_validator.is_empty($1->>'mode'::text) and _project.status = 'draft' then
            _refined := jsonb_set(_refined, '{mode}'::text[], to_jsonb($1->>'mode'::text));
		elsif _project.id is not null then
			_refined := jsonb_set(_refined, '{mode}'::text[], to_jsonb(_project.mode));
        end if;

        if _is_creating then
            -- redefined refined json with project basic serializer
            select project_service._serialize_project_basic_data(_refined::json)::jsonb
                into _refined;
            
            if current_role = 'platform_user' then
                _external_id := ($1->>'external_id')::text;
            end if;

            -- insert project 
            insert into project_service.projects (
                external_id, platform_id, user_id, permalink, name, mode, data
            ) values (_external_id, core.current_platform_id(), _user.id, _permalink, ($1 ->> 'name')::text, ($1 ->> 'mode')::project_service.project_mode, _refined)
            returning * into _project;
            
            -- insert first version of project
            insert into project_service.project_versions (
                project_id, data
            ) values (_project.id, row_to_json(_project)::jsonb)
            returning * into _version;
        else

            -- generate basic struct with given data
            _refined := project_service._serialize_project_basic_data(_refined::json, _project.data::json)::jsonb;

            -- insert old version of project on new version
            insert into project_service.project_versions(project_id, data)
                values (_project.id, row_to_json(_project)::jsonb)
            returning * into _version;

            -- update project with new generated data
            update project_service.projects
                set mode = (_refined ->> 'mode')::project_service.project_mode, 
                name = (_refined ->> 'name')::text, 
                permalink = (_refined ->> 'permalink')::text,
                data = _refined
                where id = _project.id
                returning * into _project;
        end if;
        
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