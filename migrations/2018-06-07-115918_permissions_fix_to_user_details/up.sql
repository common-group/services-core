REVOKE EXECUTE ON FUNCTION community_service_api.user_details(uuid) FROM public, anonymous;
GRANT EXECUTE ON FUNCTION community_service_api.user_details(id uuid) to scoped_user, platform_user;