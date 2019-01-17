-- This file should undo anything in `up.sql`
DROP TRIGGER IF EXISTS user_associations_update_search_index;
DROP FUNCTION community_service.trigger_update_search_index_on_user_associations();