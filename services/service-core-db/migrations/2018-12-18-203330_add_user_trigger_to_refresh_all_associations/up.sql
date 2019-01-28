-- Your SQL goes here
CREATE OR REPLACE FUNCTION community_service.trigger_update_search_index_on_user_associations()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
        update payment_service.subscriptions as s
            set search_index = payment_service._generate_search_index_for_subscription(s)
        where s.user_id = NEW.id;

        RETURN NEW;
    END;
$function$
;
CREATE TRIGGER user_associations_update_search_index AFTER UPDATE ON community_service.users FOR EACH ROW EXECUTE PROCEDURE community_service.trigger_update_search_index_on_user_associations();