import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_posts');

const postsPreview = {
    controller: function(args) {
        const togglePreview = () => {
                h.scrollTop();
                args.showPreview(false);
            },
            sendNotification = (e) => {
                e.preventDefault();

                const notificationData = {
                    title: args.title(),
                    comment_html: args.comment_html(),
                    rewards: args.rewards,
                    recipients: args.recipients
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
                    args.showSuccess(true);
                    args.comment_html('');
                    args.title('');
                    togglePreview();
                    m.redraw();
                }).catch((err) => {
                    args.errors('Erro ao enviar mensagem.'),
                    args.showError(true);
                    m.redraw();
                });
            };
        return {
            sendNotification,
            togglePreview
        };
    },
    view: function(ctrl, args) {
        const comment_html = args.comment_html(),
            title = args.title(),
            recipientsText = args.recipients === 'rewards' ?
            m('.fontsize-small.u-marginbottom-30', [
                `A novidade acima será enviada por email para os ${args.confirmationLabel} de `,
                m('span.fontweight-semibold',
                    args.rewardText
                ),
                ' e ficará ',
                m('span.fontweight-semibold',
                window.I18n.t(`backers_only_${args.mode}`, I18nScope())
                )
            ]) :
            args.recipients === 'backers' ?
            m('.fontsize-small.u-marginbottom-30', [
                'A novidade acima será  ',
                m('span.fontweight-semibold',
                    'enviada por email para todos'
                ),
                window.I18n.t(`all_backers_${args.mode}`, I18nScope()),
                m('span.fontweight-semibold',
                    'visível publicamente '
                ),
                'na plataforma.'
            ]) :
            m('.fontsize-small.u-marginbottom-30', [
                m('span', ' A novidade acima será  '),
                m('span.fontweight-semibold', window.I18n.t(`email_backers_${args.mode}`, I18nScope())),
                m('span', ' e ficará '),
                m('span.fontweight-semibold', 'visível somente para esses na plataforma.')
            ]);

        return m('div', [
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
                                moment().format('DD/MM/YYYY')
                            ),
                            m('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center',
                                title
                            ),
                            m('.fontsize-base', m.trust(comment_html))
                        ]),
                        m('.w-col.w-col-1')
                    ])
                ),
                m('.w-row', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6',
                        recipientsText
                    ),
                    m('.w-col.w-col-3')
                ]),
                m('.u-marginbottom-20.w-row', [
                    m('.w-col.w-col-3'),
                    m('.w-sub-col.w-col.w-col-4',
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
