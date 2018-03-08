-- This file should undo anything in `up.sql`
update notification_service.notification_global_templates
    set subject = 'Sua assinatura para {{project.name}} foi atualizada!',
        template = '
<p>Olá, {{user.name}}!</p>
<p>
Seu apoio mensal para o projeto {{project.name}} foi atualizado
</p>
<p>
Um abraço
</p>'
    where label = 'updated_subscription';