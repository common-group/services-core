-- Your SQL goes here
CREATE OR REPLACE FUNCTION core.current_user_scopes() RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN nullif(current_setting('request.jwt.claim.scopes'), '{}')::jsonb;
EXCEPTION
WHEN others THEN
  RETURN '{}'::jsonb;
END
    $$;