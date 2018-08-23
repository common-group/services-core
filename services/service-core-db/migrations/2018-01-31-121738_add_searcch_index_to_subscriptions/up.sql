-- Your SQL goes here
alter table payment_service.subscriptions
    add column search_index tsvector;

create or replace function payment_service._generate_search_index_for_subscription(payment_service.subscriptions)
returns tsvector language plpgsql
as $$
    declare
        _search_index tsvector;
        _user community_service.users;
        _project project_service.projects;
    begin
        -- get user
        select * from community_service.users where id = $1.user_id
            into _user;

        -- get project
        select * from project_service.projects where id = $1.project_id
            into _project;
            
        _search_index := setweight(to_tsvector('portuguese', unaccent(coalesce(_project.name::text, ''))), 'A') || 
                         setweight(to_tsvector('portuguese', unaccent(coalesce(_user.email::text, ''))), 'B') ||
                         setweight(to_tsvector('portuguese', unaccent(coalesce((_user.data ->> 'name')::text, ''))), 'B') ||
                         setweight(to_tsvector('portuguese', unaccent(coalesce((_user.data ->> 'document_number')::text, ''))), 'C') ||
                         setweight(to_tsvector('portuguese', $1.id::text), 'D') ||
                         setweight(to_tsvector('portuguese', $1.user_id::text), 'D') ||
                         setweight(to_tsvector('portuguese', $1.project_id::text), 'D');


        return _search_index;

    end;
$$;

create or replace function payment_service.trigger_update_search_index_on_subscription()
returns trigger
language plpgsql as $$
    BEGIN
        NEW.search_index := payment_service._generate_search_index_for_subscription(NEW);

        RETURN NEW;
    END;    
$$;

CREATE TRIGGER subscription_update_search_index BEFORE INSERT OR UPDATE ON payment_service.subscriptions FOR EACH ROW EXECUTE PROCEDURE payment_service.trigger_update_search_index_on_subscription();