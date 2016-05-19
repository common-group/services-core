/**
 * window.c.OwnerMessageContent component
 * Render project owner contact form
 *
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import models from '../models';

const ownerMessageContent = {
    controller(args) {
        let l = m.prop(false),
            sendSuccess = m.prop(false),
            user = h.getUser(),
            from_name = m.prop(user.name),
            from_email = m.prop(user.email),
            content = m.prop(''),
            sendMessage = () => {
                let loaderOpts = models.directMessage.postOptions({
                    from_name: from_name(),
                    from_email: from_email(),
                    user_id: h.getUser().user_id,
                    content: content(),
                    project_id: h.getCurrentProject().project_id,
                    to_user_id: h.getCurrentProject().project_user_id
                });
                l = postgrest.loaderWithToken(loaderOpts);

                l.load().then(sendSuccess(true));
                return false;
            };

        return {
            sendMessage: sendMessage,
            sendSuccess: sendSuccess,
            userDetails: args,
            from_name: from_name,
            from_email: from_email,
            content: content
        };
    },
    view(ctrl, args) {
        const successMessage = m('.modal-dialog-content.u-text-center', [
                m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
                m('p.fontsize-large', `Sua mensagem foi enviada com sucesso para ${_.first(ctrl.userDetails()).name}. Você vai receber uma cópia no seu email e pode seguir a conversa por lá!`)
            ]),
            contactForm = [
                m('.modal-dialog-content', [
                    m('.w-form', [
                        m('form', {onsubmit: ctrl.sendMessage}, [
                            m('.w-row', [
                                m('.w-col.w-col-6.w-sub-col', [
                                    m('label.fontsize-smaller', 'Seu nome'),
                                    m(`input.w-input.text-field[value='${ctrl.from_name()}'][type='text'][required=\'required\']`, {onchange: m.withAttr('value', ctrl.from_name)} )
                                ]),
                                m('.w-col.w-col-6', [
                                    m('label.fontsize-smaller', 'Seu email'),
                                    m(`input.w-input.text-field[value='${ctrl.from_email()}'][type='text'][required=\'required\']`, {onchange: m.withAttr('value', ctrl.from_email)})
                                ])
                            ]),
                            m('label', 'Mensagem'),
                            m('textarea.w-input.text-field.height-small[required=\'required\']', {onchange: m.withAttr('value', ctrl.content)}),
                            m('.fontsize-smallest.fontcolor-terciary', 'Você receberá uma cópia desta mensagem em seu email.'),
                            m('.modal-dialog-nav-bottom',
                                m('.w-row',
                                    m('.w-col.w-col-6.w-col-push-3',
                                        m('input.w-button.btn.btn-large[type="submit"][value="Enviar mensagem"]')
                                    )
                                )
                            )
                        ])
                    ]),
                ]),
            ];

        return m('div', [
            m('.modal-dialog-header',
                m('.fontsize-large.u-text-center', 'Enviar mensagem')
            ),
            ctrl.sendSuccess() ? successMessage : contactForm
        ]);
    }
};

export default ownerMessageContent;
