-- Your SQL goes here
CREATE OR REPLACE FUNCTION project_service._serialize_project_basic_data(json, with_default json)
 RETURNS json
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
        declare
            _result json;
        begin
            select json_build_object(
                'current_ip', ($1->>'current_ip'),
                'name', core_validator.raise_when_empty(coalesce(($1->>'name')::text, ($2->>'name')::text), 'name'),
                'status', coalesce(($1->>'status'::text), ($2->>'status'::text)),
                'permalink', core_validator.raise_when_empty(coalesce(($1->>'permalink')::text, ($2->>'permalink')::text), 'permalink'),
                'mode', core_validator.raise_when_empty(coalesce((($1->>'mode')::project_service.project_mode)::text,(($2->>'mode')::project_service.project_mode)::text), 'mode'),
                'about_html', coalesce(($1->>'about_html')::text, ($2->>'about_html')::text),
                'budget_html', coalesce(($1->>'budget_html')::text, ($2->>'budget_html')::text),
                'online_days', coalesce(($1->>'online_days')::integer, ($2->>'online_days')::integer),
                'cover_image_versions', coalesce(($1->>'cover_image_versions'), ($2->>'cover_image_versions'))::json,
                'card_info', json_build_object(
                    'image_url', coalesce(($1->'card_info'->>'image_url'), ($2->'card_info'->>'image_url'))::text,
                    'title', coalesce(($1->'card_info'->>'title'), ($2->'card_info'->>'title'))::text,
                    'description', coalesce(($1->'card_info'->>'description'), ($2->'card_info'->>'description'))::text
                ),
                'video_info', json_build_object(
                    'id', coalesce(($1->'video'->>'id'), ($2->'video'->>'id'))::text,
                    'provider', coalesce(($1->'video'->>'provider'), ($2->'video'->>'provider'))::text,
                    'embed_url', coalesce(($1->'video'->>'embed_url'), ($2->'video'->>'embed_url'))::text,
                    'thumb_url', coalesce(($1->'video'->>'cover_url'), ($2->'video'->>'cover_url'))::text
                ),
                'address', json_build_object(
                    'state', coalesce(($1->'address'->>'state'), ($2->'address'->>'state'))::text,
                    'city', coalesce(($1->'address'->>'city'), ($2->'address'->>'city'))::text
                ),
                'metadata', ($1->>'metadata')::json
            ) into _result;

            return _result;
        end;
    $function$;


drop function if exists project_service_api.update_project(project json);
CREATE OR REPLACE FUNCTION project_service_api.update_project(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
    declare
        _project project_service.projects;
        _version project_service.project_versions;
        _result json;
        _refined jsonb;
        _permalink text;
    begin
        -- ensure that roles come from any permitted
        perform core.force_any_of_roles('{platform_user}');
        
        -- select project inside current platform
        select * from project_service.projects
            where id = ($1->>'id')::bigint and platform_id = core.current_platform_id()
            into _project;
            
        if _project.id is null then
            raise exception undefined_table;
        end if;
        
        -- set default permalink
        _permalink := _project.permalink;
            
        -- enable this when enable this funcion for scoped_user usage
        -- if not core.is_owner_or_admin(_project.user_id) then
        --     raise exception insufficient_privilege;
        -- end if;

        -- insert old version of project on new version
        insert into project_service.project_versions(project_id, data)
            values (_project.id, _project.data)
        returning * into _version;
        
        -- check if permalink is provided
        if not core_validator.is_empty($1->>'permalink'::text) and _project.status = 'draft' then
            _permalink := unaccent(replace(replace(lower($1->>'permalink'),' ','_'), '-', '_'));
        end if;
        
        -- put request json into refined
        _refined := ($1)::jsonb;
        
        -- set default mode of project
        _refined := jsonb_set(_refined, '{mode}'::text[], to_jsonb(_project.mode::text));
        
        -- check if permalink is mode is provided
        if not core_validator.is_empty($1->>'mode'::text) and _project.status = 'draft' then
            _refined := jsonb_set(_refined, '{mode}'::text[], to_jsonb($1->>'mode'::text));
        end if;
        
        -- put permalink inside refined json
        _refined := jsonb_set(_refined, '{permalink}'::text[], to_jsonb(_permalink::text));

        -- put project_status
        _refined := jsonb_set(_refined, '{status}'::text[], to_jsonb(_project.status::text));
            
        -- put current_ip
        _refined := jsonb_set(_refined, '{current_ip}'::text[], to_jsonb(core.request_ip_adress()::text));
        
        -- generate basic struct with given data
        _refined := project_service._serialize_project_basic_data(_refined::json, _project.data::json)::jsonb;
        
        -- update project with new generated data
        update project_service.projects
            set mode = (_refined ->> 'mode')::project_service.project_mode, 
            name = (_refined ->> 'name')::text, 
            permalink = (_refined ->> 'permalink')::text,
            data = _refined
            where id = _project.id
            returning * into _project;

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
comment on function project_service_api.update_project(data json) is 'Update project data';
grant execute on function project_service_api.update_project(data json) to platform_user;
grant insert, select on project_service.project_versions to platform_user;
grant update on project_service.projects to platform_user;
