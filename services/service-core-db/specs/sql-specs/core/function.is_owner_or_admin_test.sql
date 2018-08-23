BEGIN;
    select plan(4);
    
    -- with scoped_user
    set local role scoped_user;
    set local request.jwt.claim.user_id to '578ae848-17b1-43bc-94e6-fcabe981ba47';

    select is(
        core.is_owner_or_admin('578ae848-17b1-43bc-94e6-fcabe981ba47'),
        true,
        'Should be true when is the same user of jwt (scoped_user)'
    );
    select is(
        core.is_owner_or_admin('a198d169-d149-4f8a-9054-2e069c9565cc'),
        false,
        'Should be false when is not the same user of jwt (scoped_user)'
    );
    
    -- with admin scoped user
    set local role scoped_user;
    set local request.jwt.claim.user_id to '578ae848-17b1-43bc-94e6-fcabe981ba47';
    set local request.jwt.claim.scopes to '["admin"]';
    select is(
        core.is_owner_or_admin('a198d169-d149-4f8a-9054-2e069c9565cc'),
        true,
        'Should be true when is scoped_user is admin scope'
    );

    -- with platform_user
    set local role platform_user;
    select is(
        core.is_owner_or_admin('578ae848-17b1-43bc-94e6-fcabe981ba47'),
        true,
        'Should be true when is platform_user'
    );


    select * from finish();
ROLLBACk;
