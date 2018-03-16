create or replace function clean_sets() returns void
language plpgsql as $$
    declare
    begin
        set local role postgres;
        set local "request.header.platform-code" to 0;
        set local "request.jwt.claim.user_id" to 0;
        set local "request.jwt.claim.platform_token" to 0;
    end;
$$;
