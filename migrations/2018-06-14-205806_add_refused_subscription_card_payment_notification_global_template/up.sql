-- Your SQL goes here
insert into notification_service.notification_global_templates
    (label, subject, template) values 
    ('refused_subscription_card_payment', 'Pagamento recusado: seu apoio de {{subscription.period_month_year}} para o projeto {{project.name}} não foi confirmado.',
    '<p>Seu apoio mensal para o projeto não foi confirmado :(</p>
    <p>Olá, {{user.name}}, de acordo com nossos registros, a cobrança no cartão {{payment.card_brand}} final {{payment.card_last_digits}} no valor de R${{payment.amount}} foi recusada em {{payment.fmt_refused_at}}.</p>
    <p>
    {% if subscription.status == "active" %}
    Não se preocupe que sua assinatura ainda está ativa, e você continua desfrutando de seus benefícios como assinantes! 
    {% endif %} 
    </p>
    <p>
    Se você quiser refazer seu pagamento manualmente antes de nossa retentativa (por exemplo, se quer mudar o cartão utilizado), basta editar sua assinatura no perfil.
    </p>
');