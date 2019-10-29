CREATE OR REPLACE FUNCTION payment_service.generate_new_catalog_payment(payment_service.subscriptions)
RETURNS payment_service.catalog_payments
LANGUAGE plpgsql
AS $function$
   declare
       _payment payment_service.catalog_payments;
       _user community_service.users;
       _card_id uuid;
       _last_paid_payment payment_service.catalog_payments;
       _last_payment payment_service.catalog_payments;
       _refined jsonb;
   begin
       if payment_service.next_charge_at($1) <= now() then
           
           if $1.status in ('canceling', 'canceled') then
               raise 'subscription_canceled';
           end if;
           
           if exists(
               select true from payment_service.catalog_payments
               where subscription_id = $1.id
                   and status = 'pending'
                   limit 1
           ) then
               raise 'pending_payment_to_process';
           end if;
           
           select * from payment_service.catalog_payments
               where subscription_id = $1.id
                   and status = 'paid'
               order by created_at desc limit 1
               into _last_paid_payment;
           
           select * from community_service.users
               where id = $1.user_id
               into _user;
           
           _refined := $1.checkout_data;
           
           -- set customer name/email/document number from user
           if (_user.data ->> 'name') is not null then
               _refined := jsonb_set(_refined, '{customer,name}', to_jsonb((_user.data->>'name')::text));
           end if;
           
           _refined := jsonb_set(_refined, '{customer,email}', to_jsonb((_user.email)::text));
           if _user.data ->> 'document_number' is not null then
               _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb((_user.data->>'document_number')::text));
           end if;
           
           if (_refined ->> 'payment_method')::text = 'credit_card' then
               select id from payment_service.credit_cards
                   where id = $1.credit_card_id
                   into _card_id;
               _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb(_card_id));
               _refined := _refined - 'card_hash';
           end if;

           if _refined is not null then
               insert into payment_service.catalog_payments(gateway, platform_id, reward_id, project_id, user_id, subscription_id, data, created_at, updated_at)
                   values (coalesce(_last_paid_payment.gateway, 'pagarme'), $1.platform_id, $1.reward_id, $1.project_id, $1.user_id, $1.id, _refined, clock_timestamp(), clock_timestamp())
                   returning * into _payment;
               perform pg_notify('payment_stream',
                   json_build_object('action', 'process_payment', 'id', _payment.id, 'subscription_id', $1.id)::text);
           end if;
       else
           raise 'not_in_time_to_charge';
       end if;
       return _payment;
   end;
$function$