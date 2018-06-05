CREATE OR REPLACE FUNCTION community_service_api.user_details(user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _user_id uuid;
            _exists_user_relation boolean;
            _ret jsonb;
        begin
        
            _user_id := user_id;
            
            select 
                true 
            from 
                project_service.projects project 
            left join 
                payment_service.catalog_payments payment 
            on 
                payment.user_id = _user_id and 
                project.user_id = core.current_user_id()
            limit 1
            INTO
                _exists_user_relation;
                
            select
                u.id,
                u.platform_id,
                u.external_id,
                u.email,
                u.password,
                u.created_at,
                u.updated_at,
                (CASE
                    WHEN (core.is_owner_or_admin(u.id) or _exists_user_relation::boolean) THEN u.data
                    ELSE null::jsonb
                END) as data,
                u.key
            from
                community_service.users as u
            where
                u.id = _user_id
            limit 1
            into _user;
                
            select json_build_object(
                'id', _user.id,
                'address', (_user.data->>'address'::text)::jsonb
            )
            into _ret;
            
            return _ret;
        end;
$function$
---
;

grant execute on function community_service_api.user_details(user_id uuid) to scoped_user, platform_user;
COMMENT ON FUNCTION community_service_api.user_details(user_id uuid) IS 'rpc/user_details - returns id and address of user. Address is related with current user or if user has contributed to some project that the user requesting it';