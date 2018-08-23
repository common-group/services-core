-- This file should undo anything in `up.sql`
DROP FUNCTION project_service_api.finish_project(id uuid);
CREATE OR REPLACE FUNCTION project_service_api.cancel_project(id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
    declare
        _project project_service.projects;
        _total_subscriptions_canceled integer;
    begin
        -- ensure that is executed by permited roles
        perform core.force_any_of_roles('{platform_user}');

        -- find project by id
        select * from project_service.projects p where p.id = $1
            into _project;

        -- check if project is of the same platform
        if _project.id is null or _project.platform_id <> core.current_platform_id() then
            raise 'project not found';
        end if;

        -- check if project is already rejected
        if _project.status in('rejected', 'successful', 'failed') then
            raise 'project already finished';
        end if;

        -- update project status to rejected
        update project_service.projects as p
            set status = (case _project.mode when 'sub' then 'successful' else 'rejected' end)
            where p.id = _project.id
                and platform_id = core.current_platform_id();

        -- get total of subscriptions that should be canceled
        select count(1) from payment_service.subscriptions s
            where s.project_id = _project.id
                and s.status in ('started', 'active', 'inactive', 'canceling')
                and s.platform_id = core.current_platform_id()
        into _total_subscriptions_canceled;

        -- move all subscriptions to canceled
        perform payment_service.transition_to(s, 'canceled', row_to_json(s))
            from payment_service.subscriptions s
                where s.project_id = _project.id
                    and s.status in ('started', 'active', 'inactive', 'canceling')
                    and s.platform_id = core.current_platform_id();

        -- return project id and total of suscriptions canceled
        return json_build_object('id', _project.id, 'total_canceled_subscriptions', _total_subscriptions_canceled);
    end;
$function$;
grant execute on function project_service_api.cancel_project(uuid) to platform_user;