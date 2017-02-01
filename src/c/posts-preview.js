import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import popNotification from './pop-notification';

const postsPreview = {
    controller(args) {
        const showSuccess = m.prop(false),
            showError = m.prop(false),

            togglePreview = () => {
                args.showPreview(false);
            },
            sendNotification = (e) => {
                e.preventDefault();

                const notificationData = {
                    title: args.title,
                    comment_html: args.comment_html,
                    reward_id: args.reward_id > 1 ? args.reward_id : null,
                    recipients: args.reward_id > 1 ? 'reward' : args.reward_id == '-1' ? 'public' : 'backers'
                };

                return m.request({
                    method: 'POST',
                    url: `/projects/${args.project_id}/posts.json`,
                    data: {
                        project_post: notificationData,
                        project: args.project_id
                    },
                    config: h.setCsrfToken
                }).then(() => {
                    showSuccess(true);
                    m.redraw();
                }).catch((err) => {
                    showError(true);
                    m.redraw();
                });
            };
        return {
            sendNotification: sendNotification,
            showSuccess: showSuccess,
            showError: showError,
            togglePreview
        };
    },
    view(ctrl, args) {
        const comment_html = args.comment_html,
            title = args.title;
        return m('div', [

            (ctrl.showSuccess() ? m.component(popNotification, {
                message: 'Mensagem enviada com sucesso'
            }) : ''),
            (ctrl.showError() ? m.component(popNotification, {
                message: 'Erro ao enviar mensagem',
                error: true
            }) : ''),
            m('.dashboard-header.u-text-center',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6',
                            m('.fontsize-larger.fontweight-semibold.lineheight-tight',
                                'Revise sua novidade antes de enviar!'
                            )
                        ),
                        m('.w-col.w-col-3')
                    ])
                )
            ),
            m('.section', [
                m('.w-container',
                    m('.card.u-marginbottom-60.u-radius.w-row', [
                        m('.w-col.w-col-1'),
                        m('.u-marginbottom-30.u-margintop-30.w-col.w-col-10.w-hidden-small.w-hidden-tiny', [
                            m('.fontcolor-secondary.fontsize-small.u-text-center',
                                '16/01/2017'
                            ),
                            m('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center',
                                title
                            ),
                            m.trust(comment_html)
                        ]),
                        m('.w-col.w-col-1')
                    ])
                ),
                m('.w-row', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6',
                        m('.fontsize-small.u-marginbottom-30', [
                            'A novidade acima será enviada por email para os apoiadores da ',
                            m('span.fontweight-semibold',
                                'Recompensa R$50 - Alguma descrição com caracteres que ajude a identificar...'
                            ),
                            ' e ficará visível na plataforma somente para estes apoiadores.'
                        ])
                    ),
                    m('.w-col.w-col-3')
                ]),
                m('.u-marginbottom-20.w-row', [
                    m('.w-col.w-col-3'),
                    m('._w-sub-col.w-col.w-col-4',
                        m('button.btn.btn-large', {
                            onclick: ctrl.sendNotification
                        }, [
                            m('span.fa.fa-paper-plane',
                                ''
                            ),
                            ' ',
                            m.trust('&nbsp;'),
                            'Enviar'
                        ])
                    ),
                    m('.w-col.w-col-2',
                        m('button.btn.btn-large.btn-terciary', {
                                onclick: ctrl.togglePreview
                            },
                            'Editar'
                        )
                    ),
                    m('.w-col.w-col-3')
                ])
            ])
        ]);
    }
};

export default postsPreview;
