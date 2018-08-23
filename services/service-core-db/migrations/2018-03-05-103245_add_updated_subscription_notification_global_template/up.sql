-- Your SQL goes here
insert into notification_service.notification_global_templates
    (label, subject, template) values
    ('updated_subscription', 'Sua assinatura para {{project.name}} foi atualizada!', '
<p>Olá, {{user.name}}!</p>
<p>
Seu apoio mensal para o projeto {{project.name}} foi atualizado
</p>
<p>
Um abraço
</p>
        ');