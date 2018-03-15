-- Your SQL goes here
CREATE OR REPLACE FUNCTION notification_service._generate_template_vars_from_relations(json)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
        declare
            _user community_service.users;
            _payment payment_service.catalog_payments;
            _subscription payment_service.subscriptions;
            _last_subscription_payment payment_service.catalog_payments;
            _first_subscription_paid_payment payment_service.catalog_payments;
            _project project_service.projects;
            _reward project_service.rewards;
            _platform platform_service.platforms;
            _project_owner community_service.users;
            _result jsonb;
        begin
            -- get user
            select * from community_service.users where id = ($1->>'user_id')::uuid into _user;
            if _user is null then
                raise 'missing user_id';
            end if;
            
            _result := jsonb_build_object('user', jsonb_build_object(
                'id', _user.id,
                'name', _user.data ->> 'name',
                'email', _user.email,
                'document_type', _user.data ->> 'document_type',
                'document_number', _user.data ->> 'document_number',
                'created_at', _user.created_at,
                'fmt_created_at', core.fmt_datetime(_user.created_at::timestamp)
            ));
            
            -- get payment 
            select * from payment_service.catalog_payments where id = ($1->>'catalog_payment_id')::uuid into _payment;
            if _payment.id is not null then
                _result := jsonb_set(_result, '{payment}'::text[], jsonb_build_object(
                    'id', _payment.id,
                    'amount', ((_payment.data ->> 'amount')::decimal / 100),
                    'boleto_url', (_payment.gateway_general_data ->> 'boleto_url')::text,
                    'boleto_barcode', (_payment.gateway_general_data ->> 'boleto_barcode')::text,
                    'boleto_expiration_date', (_payment.gateway_general_data ->> 'boleto_expiration_date'),
                    'boleto_expiration_day_month', to_char((_payment.gateway_general_data->>'boleto_expiration_date'::text)::timestamp, 'DD/MM'),
                    'payment_method', (_payment.data->>'payment_method')::text,
                    'confirmed_at', (payment_service.paid_transition_at(_payment)),
                    'fmt_confirmed_at', core.fmt_datetime((payment_service.paid_transition_at(_payment))::timestamp),
                    'refused_at', (payment_service.refused_transition_at(_payment)),
                    'fmt_refused_at', core.fmt_datetime((payment_service.refused_transition_at(_payment))::timestamp),
                    'chargedback_at', (payment_service.chargedback_transition_at(_payment)),
                    'fmt_chargedback_at', core.fmt_datetime((payment_service.chargedback_transition_at(_payment))::timestamp),
                    'refunded_at', (payment_service.refunded_transition_at(_payment)),
                    'fmt_refunded_at', core.fmt_datetime((payment_service.refunded_transition_at(_payment))::timestamp),
                    'next_charge_at', (case when _payment.subscription_id is not null then
                        (payment_service.paid_transition_at(_payment) + '1 month'::interval)
                        else null end),
                    'fmt_next_charge_at', (case when _payment.subscription_id is not null then
                        core.fmt_datetime((payment_service.paid_transition_at(_payment) + '1 month'::interval)::timestamp)
                        else null end),
                    'subscription_period_month_year', (case when _payment.subscription_id is not null then
                            to_char(_payment.created_at, 'MM/YYYY')
                        else null end),
                    'card_last_digits', (_payment.gateway_general_data ->> 'card_last_digits')::text,
                    'card_brand', (_payment.gateway_general_data ->> 'card_brand')::text,
                    'created_at',_payment.created_at,
                    'fmt_created_at', core.fmt_datetime(_payment.created_at::timestamp)
                ));
            end if;
            
            -- get subscription
            select * from payment_service.subscriptions where id = ($1->>'subscription_id')::uuid into _subscription;
            select * from payment_service.catalog_payments where subscription_id = _subscription.id
                order by created_at desc limit 1
                into _last_subscription_payment;
            select * from payment_service.catalog_payments where subscription_id = _subscription.id and status = 'paid'
                order by created_at asc limit 1
                into _first_subscription_paid_payment;
            if _subscription.id is not null then
                _result := jsonb_set(_result, '{subscription}'::text[], jsonb_build_object(
                    'id', _subscription.id,
                    'status', _subscription.status,
                    'reward_id', _subscription.reward_id,
                    'period_month_year', to_char(_last_subscription_payment.created_at, 'MM/YYYY'),
                    'payment_method', (_last_subscription_payment.data ->> 'payment_method')::text,
                    'amount', (_last_subscription_payment.data ->> 'amount')::decimal / 100,
                    'paid_count', (select count(1) from payment_service.catalog_payments
                        where subscription_id = _subscription.id and status = 'paid'),
                    'paid_sum', (select sum((data ->> 'amount')::decimal / 100) from payment_service.catalog_payments
                        where subscription_id = _subscription.id and status = 'paid'),
                    'first_payment_at', payment_service.paid_transition_at(_first_subscription_paid_payment),
                    'fmt_first_payment_at', core.fmt_datetime((payment_service.paid_transition_at(_first_subscription_paid_payment))::timestamp)
                ));
            end if;
            
            -- get project
            select * from project_service.projects where id = ($1->>'project_id')::uuid into _project;
            if _project.id is not null then
                _result := jsonb_set(_result, '{project}'::text[], jsonb_build_object(
                    'id', _project.id,
                    'name', _project.name,
                    'mode', _project.mode,
                    'permalink', _project.permalink,
                    'expires_at', (_project.data ->> 'expires_at'::text)::timestamp,
                    'fmt_expires_at', core.fmt_datetime((_project.data ->> 'expires_at'::text)::timestamp),
                    'video_info', (_project.data ->> 'video_info')::json,
                    'online_days', (_project.data ->> 'online_days'),
                    'card_info', (_project.data ->> 'card_info')::json,
                    'total_paid_in_contributions', (select sum((data ->> 'amount')::decimal / 100) from payment_service.catalog_payments 
                        where project_id = _project.id and status in('paid') and subscription_id is null),
                    'total_paid_in_active_subscriptions', (select sum((checkout_data ->> 'amount')::decimal / 100) from payment_service.subscriptions 
                        where project_id = _project.id and status in('active')),                        
                    'total_contributors', (select count(distinct user_id) from payment_service.catalog_payments 
                        where project_id = _project.id and status in('paid', 'refunded')),
                    'total_contributions', (select count(1) from payment_service.catalog_payments 
                        where project_id = _project.id and status in('paid', 'refunded') and subscription_id is null),
                    'total_subscriptions', (select count(distinct subscription_id) from payment_service.catalog_payments 
                        where project_id = _project.id and status in('paid', 'refunded') and subscription_id is not null)
                ));
            end if;
            -- get reward
            select * from project_service.rewards where id = ($1->>'reward_id')::uuid into _reward;
            if _reward.id is not null then
                _result := jsonb_set(_result, '{reward}'::text[], jsonb_build_object(
                    'id', _reward.id,
                    'title', _reward.data ->> 'title',
                    'minimum_value', (_reward.data ->> 'minimum_value')::decimal / 100,
                    'deliver_at', (_reward.data ->> 'deliver_at')::timestamp,
                    'fmt_deliver_at', core.fmt_datetime((_reward.data ->> 'deliver_at')::timestamp),
                    'deliver_at_period', to_char((_reward.data ->> 'deliver_at')::timestamp, 'MM/YYYY')
                ));
            end if;
            -- get platform
            select * from platform_service.platforms where id = _user.platform_id into _platform;
            if _platform.id is not null then
                _result := jsonb_set(_result, '{platform}'::text[], jsonb_build_object(
                    'id', _platform.id,
                    'name', _platform.name
                ));
            end if;            
            -- get project_owner
            select * from community_service.users where id = _project.user_id into _project_owner;
            if _project_owner.id is not null then
                _result := jsonb_set(_result, '{project_owner}'::text[], jsonb_build_object(
                    'id', _project_owner.id,
                    'name', _project_owner.data ->> 'name',
                    'email', _project_owner.email,
                    'document_type', _project_owner.data ->> 'document_type',
                    'document_number', _project_owner.data ->> 'document_number',
                    'created_at', _project_owner.created_at,
                    'fmt_created_at', core.fmt_datetime(_project_owner.created_at::timestamp)
                ));
            end if;
            
            return _result::json;
        end;
    $function$;