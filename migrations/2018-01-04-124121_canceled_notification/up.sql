-- Your SQL goes here

insert into notification_service.notification_global_templates
    (label, subject, template) values 
    ('canceled_subscription', 'Assinatura Cancelada: sua assinatura do projeto {{project.name}} foi cancelada!',
    '<p>Olá, {{user.name}}!</p>
    <p>Sua assinatura do projeto {{project.name}} foi <strong>cancelada</strong>.</p>
    <p>Isso quer dizer que você <strong>não receberá novas cobranças, não terá acesso às novidades exclusivas</strong> para assinantes do projeto e <strong>perderá o direito ao recebimento de recompensas futuras</strong>.</p>
    <p>Se você não está pensando em reativar sua assinatura, fale com {{project_owner.name}} sobre os motivos. O seu feedback é super importante!</p>
    <p>Agora, se você quer reativar sua assinatura, é bem simples: basta <strong>confirmar um novo apoio mensal</strong> abaixo, a qualquer momento:</p>
    <p><br/>
    <center>
    <a href=""><img src="IMAGE_LINK"/></a></p>
    </center>
    <br/></p>
    <p>Qualquer outra dúvida, basta entrar em contato conosco respondendo a esta mensagem ou através do e-mail <a href="mailto:"></a></p>
    <p><br/>Um abraço,</p>
    <p><strong>Equipe do {{platform.name}}</strong></p>');
