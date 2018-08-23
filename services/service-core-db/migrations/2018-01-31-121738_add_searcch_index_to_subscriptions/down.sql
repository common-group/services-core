-- This file should undo anything in `up.sql`

drop trigger subscription_update_search_index on payment_service.subscriptions
drop function payment_service.trigger_update_search_index_on_subscription();
drop function payment_service._generate_search_index_for_subscription(payment_service.subscriptions);
alter table payment_service.subscriptions
    drop column search_index;
