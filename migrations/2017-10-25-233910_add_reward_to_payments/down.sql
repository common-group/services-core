-- This file should undo anything in `up.sql`
alter table payment_service.catalog_payments
    drop column reward_id;

alter table payment_service.subscriptions
    drop column reward_id;

drop function payment_service_api.pay(json);
drop function payment_service._serialize_payment_basic_data(json);