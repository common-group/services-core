-- Your SQL goes here
insert into notification_service.notification_global_templates
    (label, subject, template) values 
    ('expiring_slip', 'Não se esqueça: amanhã, dia {{payment.boleto_expiration_day_month}}, vence o boleto para {{project.name}}',
      '<p>Olá, {{user.name}}!</p>
    <p>Amanhã, dia {{payment.boleto_expiration_day_month}}, é o dia do vencimento do boleto gerado para o apoio de {{payment.subscription_period_month_year}} ao projeto {{project.name}}.</p>
<p>
{{project_owner.name}} está contando com o seu apoio mensal para o projeto. 
</p>
<p>
Se você não imprimiu seu boleto ainda, você pode clicar no link abaixo e fazer isso agora mesmo:
</p>
<a href="{{payment.boleto_url}}"></a>
<p>
<strong>
PS: Caso já tenha pago o boleto bancário, desconsidere esse email por favor.
</strong>
</p>
<p>
Um abraço,
<br/>
Equipe do Catarse
</p>'
);
