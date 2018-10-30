import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_posts');

const postsPreview = {
    oninit: function(vnode) {
        const togglePreview = () => {
                h.scrollTop();
                vnode.attrs.showPreview(false);
            },
            sendNotification = (e) => {
                e.preventDefault();

                const notificationData = {
                    title: vnode.attrs.title(),
                    comment_html: vnode.attrs.comment_html(),
                    reward_id: vnode.attrs.reward_id >= 1 ? vnode.attrs.reward_id : null,
                    recipients: vnode.attrs.reward_id >= 1 ? 'reward' : vnode.attrs.reward_id == '-1' ? 'public' : 'backers'
                };

                return m.request({
                    method: 'POST',
                    url: `/projects/${vnode.attrs.project_id}/posts.json`,
                    data: {
                        project_post: notificationData,
                        project: vnode.attrs.project_id
                    },
                    config: h.setCsrfToken
                }).then(() => {
                    vnode.attrs.showSuccess(true);
                    vnode.attrs.comment_html('');
                    vnode.attrs.title('');
                    togglePreview();
                    m.redraw();
                }).catch((err) => {
                    vnode.attrs.errors('Erro ao enviar mensagem.'),
                    vnode.attrs.showError(true);
                    m.redraw();
                });
            };
        vnode.state = {
            sendNotification,
            togglePreview
        };
    },
    view: function({state, attrs}) {
        const comment_html = attrs.comment_html(),
            title = attrs.title(),
            recipientsText = attrs.reward_id > 1 ?
            m('.fontsize-small.u-marginbottom-30', [
                'A novidade acima será enviada por email para os ',
                m('span.fontweight-semibold',
                    attrs.rewardText
                ),
                ' e ficará ',
                m('span.fontweight-semibold',
                window.I18n.t(`backers_only_${attrs.mode}`, I18nScope())
                )
            ]) :
            attrs.reward_id === '-1' ?
            m('.fontsize-small.u-marginbottom-30', [
                'A novidade acima será  ',
                m('span.fontweight-semibold',
                    'enviada por email para todos'
                ),
                window.I18n.t(`all_backers_${attrs.mode}`, I18nScope()),
                m('span.fontweight-semibold',
                    'visível publicamente '
                ),
                'na plataforma.'
            ]) :
            m('.fontsize-small.u-marginbottom-30', [
                m('span', ' A novidade acima será  '),
                m('span.fontweight-semibold', window.I18n.t(`email_backers_${attrs.mode}`, I18nScope())),
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
                            onclick: state.sendNotification
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
                            onclick: state.togglePreview
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
