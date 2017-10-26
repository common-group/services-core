-- Your SQL goes here
create or replace function community_service_api.users(data json)
    returns json
    language plpgsql
    as $$
        declare
            _user community_service.users;
            _platform platform_service.platforms;
            _refined jsonb;
            _result json;
            _passwd text;
            _version community_service.user_versions;        
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user,scoped_user}');
            
            -- get user if id is provided or scoped_user
            if current_role = 'platform_user' and ($1->>'id')::bigint is not null then
                select * from community_service.users
                    where id = ($1->>'id')::bigint
                        and platform_id = core.current_platform_id()
                    into _user;
                if _user.id is null then
                    raise 'user not found';
                end if;                    
            elsif current_role = 'scoped_user' then
                select * from community_service.users
                    where id = core.current_user_id()
                        and platform_id = core.current_platform_id()
                    into _user;
                    
                if _user.id is null then
                    raise 'user not found';
                end if;
            end if;

            -- insert current_ip into refined
            _refined := jsonb_set($1::jsonb, '{current_ip}'::text[], to_jsonb(coalesce(($1->>'current_ip')::text, core.force_ip_address())));

            -- generate user basic data structure with received json
            if _user.id is not null then
                _refined := community_service._serialize_user_basic_data($1, _user.data::json);

                -- insert old user data to version
                insert into community_service.user_versions(user_id, data)
                    values (_user.id, row_to_json(_user.*)::jsonb)
                    returning * into _version;

                -- update user data
                update community_service.users
                    set data = _refined,
                        email = _refined->>'email'
                    where id = _user.id
                    returning * into _user;
            else
                -- geenrate user basic data
                _refined := community_service._serialize_user_basic_data($1);
                
                -- check if password already encrypted
                _passwd := (case when ($1->>'password_encrypted'::text) = 'true' then 
                                ($1->>'password')::text  
                            else 
                                crypt(($1->>'password')::text, gen_salt('bf')) 
                            end);

                -- insert user in current platform
                insert into community_service.users (platform_id, email, password, data, created_at, updated_at)
                    values (core.current_platform_id(),
                            ($1)->>'email',
                            _passwd,
                            _refined::jsonb,
                            coalesce(($1->>'created_at')::timestamp, now()),
                            coalesce(($1->>'updated_at')::timestamp, now())
                        )
                        returning * into _user;
                -- insert user version
                insert into community_service.user_versions(user_id, data)
                    values (_user.id, row_to_json(_user.*)::jsonb)
                returning * into _version;
            end if;
            
            select json_build_object(
                'id', _user.id,
                'old_version_id', _version.id,
                'data', _refined
            ) into _result;
            
            return _result;
        end;
    $$;
grant execute on function  community_service_api.users(json) to platform_user, scoped_user;