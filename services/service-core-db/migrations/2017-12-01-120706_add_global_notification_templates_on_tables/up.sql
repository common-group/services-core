-- Your SQL goes here
CREATE OR REPLACE FUNCTION payment_service.chargedback_transition_at(payment payment_service.catalog_payments)
 RETURNS timestamp without time zone
 LANGUAGE sql
 STABLE
AS $function$
        select created_at from payment_service.payment_status_transitions
            where catalog_payment_id = $1.id
                and to_status = 'chargedback'::payment_service.payment_status
            order by created_at desc limit 1;
    $function$
;
CREATE OR REPLACE FUNCTION payment_service.refunded_transition_at(payment payment_service.catalog_payments)
 RETURNS timestamp without time zone
 LANGUAGE sql
 STABLE
AS $function$
        select created_at from payment_service.payment_status_transitions
            where catalog_payment_id = $1.id
                and to_status = 'refunded'::payment_service.payment_status
            order by created_at desc limit 1;
    $function$
;
CREATE OR REPLACE FUNCTION payment_service.refused_transition_at(payment payment_service.catalog_payments)
 RETURNS timestamp without time zone
 LANGUAGE sql
 STABLE
AS $function$
        select created_at from payment_service.payment_status_transitions
            where catalog_payment_id = $1.id
                and to_status = 'refused'::payment_service.payment_status
            order by created_at desc limit 1;
    $function$
;

create or replace function notification_service._generate_template_vars_from_relations(json)
    returns json
    language plpgsql
    stable
    as $$
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
                'created_at', _user.created_at
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
                    'refused_at', (payment_service.refused_transition_at(_payment)),
                    'chargedback_at', (payment_service.chargedback_transition_at(_payment)),
                    'refunded_at', (payment_service.refunded_transition_at(_payment)),
                    'next_charge_at', (case when _payment.subscription_id is not null then
                        (payment_service.paid_transition_at(_payment) + '1 month'::interval)
                        else null end),
                    'subscription_period_month_year', (case when _payment.subscription_id is not null then
                            to_char(_payment.created_at, 'MM/YYYY')
                        else null end),                                 
                    'card_last_digits', (_payment.gateway_general_data ->> 'card_last_digits')::text,
                    'card_brand', (_payment.gateway_general_data ->> 'card_brand')::text
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
                    'reward_id', _subscription.reward_id,
                    'period_month_year', to_char(_last_subscription_payment.created_at, 'MM/YYYY'),
                    'payment_method', (_last_subscription_payment.data ->> 'payment_method')::text,
                    'amount', (_last_subscription_payment.data ->> 'amount')::decimal / 100,
                    'paid_count', (select count(1) from payment_service.catalog_payments
                        where subscription_id = _subscription.id and status = 'paid'),
                    'paid_sum', (select sum((data ->> 'amount')::decimal / 100) from payment_service.catalog_payments
                        where subscription_id = _subscription.id and status = 'paid'),
                    'first_payment_at', payment_service.paid_transition_at(_first_subscription_paid_payment)
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
                    'created_at', _project_owner.created_at
                ));
            end if;
            
            return _result::json;
        end;
    $$;

CREATE OR REPLACE FUNCTION payment_service.transition_to(payment payment_service.catalog_payments, status payment_service.payment_status, reason json)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
        declare
            _project project_service.projects;
            _contributors_count integer;
            _contributor community_service.users;
            _project_owner community_service.users;
        begin
            -- check if to state is same from state
            if $1.status = $2 then
                return false;
            end if;
            
            -- generate a new payment status transition
            insert into payment_service.payment_status_transitions (catalog_payment_id, from_status, to_status, data)
                values ($1.id, $1.status, $2, ($3)::jsonb);

            -- update the payment status
            update payment_service.catalog_payments
                set status = $2,
                    updated_at = now()
                where id = $1.id;
                
            -- deliver notifications after status changes to paid
            if not exists (
                select true from notification_service.user_catalog_notifications n
                    where n.user_id = $1.user_id
                        and (n.data -> 'relations' ->> 'catalog_payment_id')::uuid = $1.id
                        and n.label = 'paid_subscription_payment'
            ) and $2 = 'paid' and $1.subscription_id is not null then 
                perform notification_service.notify('paid_subscription_payment', json_build_object(
                    'relations', json_build_object(
                        'catalog_payment_id', $1.id,
                        'subscription_id', $1.subscription_id,
                        'project_id', $1.project_id,
                        'reward_id', $1.reward_id,
                        'user_id', $1.user_id
                    )
                ));
            end if;


            return true;
        end;
    $function$
;

CREATE OR REPLACE FUNCTION notification_service.notify(label text, data json)
 RETURNS notification_service.notifications
 LANGUAGE plpgsql
AS $function$
        declare
            _user community_service.users;
            _notification_template notification_service.notification_templates;
            _notification_global_template notification_service.notification_global_templates;
            _notification notification_service.notifications;
            _mail_config jsonb;
            _data jsonb;
        begin
            select * from community_service.users
                where id = ($2 -> 'relations' ->>'user_id')::uuid 
                into _user;
            if _user.id is null then
                raise 'user_id not found';
            end if;
            
            select nt.* from notification_service.notification_templates nt  
                where nt.platform_id = _user.platform_id
                    and nt.label = $1
                    into _notification_template;

            if _notification_template is null then
                select ngt.* from notification_service.notification_global_templates ngt
                    where ngt.label = $1
                    into _notification_global_template;

                if _notification_global_template is null then
                    return null;
                end if;
            end if;

            _mail_config := json_build_object(
                'to', _user.email,
                'from', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                'from_name', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                'reply_to', coalesce((($2)->'mail_config'->>'reply_to')::text, core.get_setting('system_email'))
            )::jsonb;
            
            _data := jsonb_set(($2)::jsonb, '{mail_config}'::text[], _mail_config);
            _data := jsonb_set(_data, '{template_vars}'::text[], notification_service._generate_template_vars_from_relations((_data ->> 'relations')::json)::jsonb);

            insert into notification_service.notifications
                (platform_id, user_id, notification_template_id, notification_global_template_id, deliver_at, data)
            values (_user.platform_id, _user.id, _notification_template.id, _notification_global_template.id, coalesce(($2->>'deliver_at')::timestamp, now()), _data)
            returning * into _notification;

            if _notification.deliver_at <= now() and ($2->>'supress_notify') is null then
                perform pg_notify('dispatch_notifications_channel', 
                    json_build_object(
                        'id', _notification.id,
                        'subject_template', coalesce(_notification_template.subject, _notification_global_template.subject),
                        'mail_config', json_build_object(
                            'to', _user.email,
                            'from', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                            'from_name', coalesce((($2)->'mail_config'->>'from')::text, core.get_setting('system_email')),
                            'reply_to', coalesce((($2)->'mail_config'->>'reply_to')::text, core.get_setting('system_email'))
                        ),
                        'content_template', coalesce(_notification_template.template, _notification_global_template.template),
                        'template_vars', (_data->>'template_vars')::json
                    )::text);
            end if;

            return _notification;
        end;
    $function$;

insert into notification_service.notification_global_templates
    (label, subject, template) values 
    ('slip_subscription_payment', 'Estamos contando com o seu apoio mensal! {{payment.boleto_expiration_day_month}} vence o boleto gerado para {{project.name}}', '<p>Olá, {{user.name}}!</p>
<p>
{{payment.boleto_expiration_day_month}} é o dia do vencimento do boleto gerado para o apoio de {{payment.subscription_period_month_year}} ao projeto {{project.name}}.<br/>
{{project_owner.name}} está contando com o seu apoio mensal para o projeto. 
</p>
<p>
Se você não imprimiu seu boleto ainda, você pode clicar no link abaixo e fazer isso agora mesmo:
</p>
<p>
<a href="{{payment.boleto_url}}">{{payment.boleto_url}}</a>
</p>
<p>
PS: Caso já tenha pago o boleto bancário, desconsidere esse email por favor.
</p>
<p>
Um abraço
</p>'),
('paid_subscription_payment', 'Recibo: apoio mensal confirmado para {{project.name}}', '<p>Olá, {{user.name}}!</p>
<p>
Seu apoio mensal de {{payment.subscription_period_month_year}} para o projeto {{project.name}} foi confirmado com sucesso! 
</p>
<p>
A próxima cobrança acontecerá em: {{payment.next_charge_at}}
</p>
<p>
Esse e-mail serve como um recibo definitivo do seu apoio este mês.
</p>

<p>Seguem todos os dados do pagamento:</p>
<p>Nome do apoiador: {{user.name}}
  <br/>CPF/CNPJ do apoiador: {{user.document_number}}
  <br/>Data da confirmação do apoio: {{payment.confirmed_at}}
  <br/>Valor da contribuição: R$ {{payment.amount}}
  <br/>ID do apoio: {{payment.id}}
  <br/>Nome/Razão Social do realizador: {{project_owner.name}}
  <br/>CPF/CNPJ do realizador: {{project_owner.document_number}}</p>
<p>
Um abraço
</p>'),
('inactive_subscription', 'Assinatura Inativa: seu apoio de {{subscription.period_month_year}} para o projeto {{project.name}} não foi confirmado.', '<p>Olá, {{user.name}}!</p>
<p>
Seu apoio mensal de {{subscription.period_month_year}} para o projeto {{project.name}} não foi confirmado :(
</p>
<p>
De acordo com nossos registros, 
{% if payment.payment_method == "boleto" %}
 o boleto bancário no valor de R${{payment.amount}} e vencimento em {{payment.boleto_expiration_day_month}} não foi pago.
{% else %}
a cobrança no cartão {{payment.card_brand}} final {{payment.card_last_digits}} no valor de R${{payment.amount}} foi recusada em {{payment.refused_at}}.
{% endif %}
</p>
<p>
<b>Sua assinatura agora está inativa.</b> Isso quer dizer que <b>você não terá acesso às novidades exclusivas</b> para assinantes do projeto e <b>perderá o direito ao recebimento de recompensas futuras.</b>
</p>
<p>
Um abraço
</p>'),
('pending_subscription', 'O projeto {{project.name}} precisa do seu apoio!', '<p>Olá, {{user.name}}!</p>
<p>
Verificamos que você iniciou sua assinatura para o projeto {{project.name}}, porém não chegou a concluí-la.
</p>
<p>
O seu apoio mensal é essencial e você pode juntar-se a outras {{project.total_contributors}} pessoas para tornar esse projeto uma realidade. Faça agora sua assinatura de onde parou:
</p>
<p>
<a href="">assinar o projeto</a>
</p>
<p>
Um abraço
</p>');