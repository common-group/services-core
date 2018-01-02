-- Your SQL goes here

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
            if ( not exists (
                select true from notification_service.user_catalog_notifications n
                    where n.user_id = $1.user_id
                        and (n.data -> 'relations' ->> 'catalog_payment_id')::uuid = $1.id
                        and n.label = 'paid_subscription_payment'
            ) and $2 = 'paid' and $1.subscription_id is not null ) then 
                perform notification_service.notify('paid_subscription_payment', json_build_object(
                    'relations', json_build_object(
                        'catalog_payment_id', $1.id,
                        'subscription_id', $1.subscription_id,
                        'project_id', $1.project_id,
                        'reward_id', $1.reward_id,
                        'user_id', $1.user_id
                    )
                ));
            -- deliver notifications after status changes to canceling
            elsif (not exists (
                select true from notification_service.user_catalog_notifications n
                    where n.user_id = $1.user_id
                        and (n.data -> 'relations' ->> 'catalog_payment_id')::uuid = $1.id
                        and n.label = 'canceling_subscription_payment'
            ) and $2 = 'canceling' and $1.subscription_id is not null ) then 
                perform notification_service.notify('canceling_subscription_payment', json_build_object(
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
---

insert into notification_service.notification_global_templates
    (label, subject, template) values 
    ('canceling_subscription_payment', 'Solicitação de cancelamento de assinatura do projeto {{project.name}}',
    '<p>Olá, {{user.name}}!</p>
    <p>A solicitação de cancelamento de sua assinatura de R${{subscription.amount}} para o projeto {{project.name}} foi confirmada. Como sua próxima data de vencimento é no dia {{payment.next_charge_at}}, sua assinatura ainda estará ativa até este dia. Mas não se preocupe, que você não terá mais nenhuma cobrança em seu nome daqui pra frente.</p>
    <p>Assim que sua assinatura estiver efetivamente cancelada, no dia {{payment.next_charge_at}}, você receberá um email com a confirmação final do cancelamento. Isso quer dizer que, a partir deste dia, você <strong>não terá acesso às novidades exclusivas</strong> para assinantes do projeto e <strong>perderá o direito ao recebimento de recompensas futuras</strong>.</p>
<p>Se por algum motivo você quiser um reembolso de seu apoio mensal, entre em contato direto com <a href="">{{project_owner.name}}.</a></p>
<p>Qualquer outra dúvida, basta entrar em contato conosco respondendo a esta mensagem ou através do e-mail <a href="mailto:"></a></p>
<p><br />Um abraço,</p>
<p><strong>Equipe do {{platform.name}}</strong></p>');
