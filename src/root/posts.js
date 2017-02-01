import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import models from '../models';
import projectDashboardMenu from '../c/project-dashboard-menu';
import postsPreview from '../c/posts-preview';
import rewardVM from '../vms/reward-vm';

const posts = {
    controller(args) {

        let deleteFormSubmit;
        const showPreview = m.prop(false),
            projectPosts = m.prop(),
            fields = {
                title: m.prop(''),
                comment_html: m.prop(''),
                reward_id: m.prop('-1')
            },
            filterVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            togglePreview = () => {
                showPreview(true);
            },
            project_id = args.root.getAttribute('data-id'),
            projectDetails = m.prop([]),
            loader = postgrest.loaderWithToken,
            setProjectId = () => {
                try {
                    const project_id = m.route.param('project_id');

                    filterVM.project_id(project_id);
                } catch (e) {
                    filterVM.project_id(args.root.getAttribute('data-id'));
                }
            },
            showRecipientes = (post) => {
                if (post.recipients == 'public') {
                    return 'Todo mundo (apoiadores e não apoiadores)';
                } else if (post.recipients == 'backers') {
                    return 'Todos os apoiadores';
                } else {
                    let reward = _.find(rewardVM.rewards(), (reward) => {
                        return reward.id == post.reward_id;
                    });
                    if (reward) {
                        return `Apoiadores da recompensa R$${reward.minimum_value} - ${reward.description.substring(0, 50) + '...'}`;
                    } else {
                        return '...';
                    }
                }
            },
            toDeletePost = m.prop(-1),
            deletePost = (post) => () => {
                toDeletePost(post.id);
                m.redraw(true);
                deleteFormSubmit();
                return false;
            },
            setPostDeletionForm = (el, isInit) => {
                if (!isInit) {
                    deleteFormSubmit = () => el.submit();
                }
            };

        filterVM.project_id(project_id);
        const listVM = postgrest.loaderWithToken(models.projectPostDetail.getPageOptions(filterVM.parameters())),
            l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        listVM.load().then(projectPosts);

        setProjectId();

        rewardVM.fetchRewards(project_id);

        l.load().then(projectDetails);

        return {
            l: l,
            projectPosts: projectPosts,
            showRecipientes: showRecipientes,
            fields: fields,
            showPreview: showPreview,
            togglePreview: togglePreview,
            project_id: project_id,
            deletePost: deletePost,
            setPostDeletionForm: setPostDeletionForm,
            toDeletePost: toDeletePost,
            projectDetails: projectDetails,
        };
    },
    view(ctrl) {
        const project = _.first(ctrl.projectDetails());

        return (m('.project-posts',
            (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
                project: m.prop(project)
            }) : ''),
            ctrl.showPreview() ? m.component(postsPreview, {
                showPreview: ctrl.showPreview,
                project_id: ctrl.project_id,
                comment_html: ctrl.fields.comment_html(),
                title: ctrl.fields.title(),
                reward_id: ctrl.fields.reward_id()
            }) : [

                m('.dashboard-header.u-text-center',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6',
                                m('.fontsize-larger.fontweight-semibold.lineheight-tight',
                                    'Envie uma novidade para seus apoiadores'
                                )
                            ),
                            m('.w-col.w-col-3')
                        ])
                    )
                ), m('.section', m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-1'),
                        m('.w-col.w-col-10.w-hidden-small.w-hidden-tiny', [
                            m('.u-marginbottom-60.u-text-center',
                                m('._w-inline-block.card.fontsize-small.u-radius', [
                                    m('span.fa.fa-lightbulb-o',
                                        ''
                                    ),
                                    ' Veja ótimo motivos para ',
                                    m('a.alt-link[href=\'https://catarse.attach.io/BJmQVOiR\'][target=\'_blank\']',
                                        'falar com seus apoiadores agora mesmo!'
                                    )
                                ])
                            ),
                            m('.card.card-terciary.medium.u-marginbottom-80.w-form', [
                                m('form', [
                                    m('label.field-label.fontweight-semibold',
                                        'Destinatários'
                                    ),
                                    m('select.positive.text-field.w-select', {
                                        onchange: m.withAttr('value', ctrl.fields.reward_id)
                                    }, [
                                        m('option[value=\'-1\']', {
                                                selected: true
                                            },
                                            'Todo mundo (apoiadores e não apoiadores)'
                                        ),
                                        m('option[value=\'0\']',
                                            'Todos os apoiadores'
                                        ),
                                        (_.map(rewardVM.rewards(), (reward) => {
                                            return m(`option[value='${reward.id}']`,
                                                `Apoiadores da recompensa R$${reward.minimum_value} - ${reward.description.substring(0, 50) + '...'}`
                                            );
                                        }))
                                    ]),
                                    m('label.field-label.fontweight-semibold',
                                        'Título'
                                    ),
                                    m('input.positive.text-field.w-input[id=\'post_title\'][maxlength=\'256\'][type=\'text\']', {
                                        name: 'posts[title]',
                                        value: ctrl.fields.title(),
                                        onchange: m.withAttr('value', ctrl.fields.title)
                                    }),
                                    m('label.field-label.fontweight-semibold',
                                        'Texto'
                                    ),
                                    m('.preview-container.u-marginbottom-40', h.redactor('posts[comment_html]', ctrl.fields.comment_html)),
                                    m('.u-marginbottom-20.w-row', [
                                        m('.w-col.w-col-3'),
                                        m('._w-sub-col.w-col.w-col-6',
                                            m('button.btn.btn-large', {
                                                    onclick: ctrl.togglePreview
                                                },
                                                'Pré-visualizar'
                                            )
                                        ),
                                        m('.w-col.w-col-3')
                                    ])
                                ])
                            ]),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-40',
                                'Novidades já enviadas'
                            ),
                            m('.table-outer.u-marginbottom-60', [
                                m('.fontsize-smaller.fontweight-semibold.header.table-row.w-row', [
                                    m('.table-col.w-col.w-col-5',
                                        m('div',
                                            'Título'
                                        )
                                    ),
                                    m('.table-col.u-text-center.w-col.w-col-3',
                                        m('div',
                                            'Enviadas'
                                        )
                                    ),
                                    m('.table-col.u-text-center.w-col.w-col-3',
                                        m('div',
                                            'Abertas'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-1')
                                ]),
                                m('.fontsize-small.table-inner', [
                                    (_.map(ctrl.projectPosts(), (post) => {
                                        return m('.table-row.w-row', [
                                            m('.table-col.w-col.w-col-5', [
                                                m('a.alt-link.fontsize-base[href=\'#\']',
                                                    post.title
                                                ),
                                                m('.fontcolor-secondary.fontsize-smallest', [
                                                    m('span.fontweight-semibold',
                                                        'Enviada em: '
                                                    ),
                                                    h.momentify(post.created_at, 'DD/MM/YYYY, h:mm A')
                                                ]),
                                                m('.fontcolor-secondary.fontsize-smallest', [
                                                    m('span.fontweight-semibold',
                                                        'Destinatários: '
                                                    ),
                                                    ctrl.showRecipientes(post)
                                                ])
                                            ]),
                                            m('.table-col.u-text-center.w-col.w-col-3',
                                                m('.fontsize-base',
                                                    post.delivered_count
                                                )
                                            ),
                                            m('.table-col.u-text-center.w-col.w-col-3',
                                                m('.fontsize-base',
                                                    post.open_count
                                                )
                                            ),
                                            m('.table-col.w-col.w-col-1',
                                                m('button.btn.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash', {
                                                    onclick: ctrl.deletePost(post)
                                                })
                                            )
                                        ]);
                                    })),
                                    m('form.w-hidden', {
                                        action: `/pt/projects/${project.project_id}/posts/${ctrl.toDeletePost()}`,
                                        method: 'POST',
                                        config: ctrl.setPostDeletionForm
                                    }, [
                                        m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
                                        m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'),
                                        m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                                    ])

                                ])
                            ])
                        ]),
                        m('.w-col.w-col-1')
                    ])
                ))
            ]));
    }
};

export default posts;