-- Your SQL goes here
update notification_service.notification_global_templates
    set subject = 'Sua assinatura para {{project.name}} foi atualizada!',
        template = '
<p>Olá, {{user.name}}!</p>
<p>
Seu apoio mensal para o projeto {{project.name}} foi alterado.
<br/>
Seguem as alterações feitas:
</p>
<p>
Valor do apoio: R$ {{subscription.amount}}
</p>
<p>
Recompensa: {{reward.title}} 
</p>
<p>
Meio de pagamento: {{subscription.payment_method}}
</p>
{% if subscription.payment_method == card %} 
As alterações só entrarão em vigor quando confirmarmos o pagamento no cartão {{payment.card_brand}} final {{payment.card_last_digits}} no valor de R${{payment.amount}}, em sua próxima cobrança, que será no dia {{payment.fmt_next_charge_at}}.
{% else %}
As alterações só entrarão em vigor quando confirmarmos o pagamento do boleto que será enviado por email para você em sua próxima cobrança, que será no dia {{payment.fmt_next_charge_at}}.
{% endif %}

Um abraço
'
    where label = 'updated_subscription';