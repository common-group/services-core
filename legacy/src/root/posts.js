import m from 'mithril';
import prop from 'mithril/stream';
import { catarse } from '../api';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import projectDashboardMenu from '../c/project-dashboard-menu';
import postsPreview from '../c/posts-preview';
import rewardVM from '../vms/reward-vm';
import projectVM from '../vms/project-vm';
import popNotification from '../c/pop-notification';

const I18nScope = _.partial(h.i18nScope, 'projects.dashboard_posts');

const posts = {
    oninit: function(vnode) {
        let deleteFormSubmit;
        const showPreview = prop(false),
            isProjectLoaded = prop(false),
            isProjectPostsLoaded = prop(false),
            showSuccess = prop(false),
            showError = prop(false),
            titleHasError = prop(false),
            commentHasError = prop(false),
            projectPosts = prop(),
            loader = catarse.loaderWithToken,
            errors = prop(''),
            fields = {
                title: prop(''),
                comment_html: prop(''),
                reward_id: prop('-1')
            },
            filterVM = catarse.filtersVM({
                project_id: 'eq'
            }),
            validateTitle = () => {
                const title = String(fields.title());
                if (title.length === 0) {
                    titleHasError(true);
                }

                return !titleHasError();
            },
            validateComment = () => {
                const comment = String(fields.comment_html());
                if (comment.length === 0) {
                    commentHasError(true);
                }

                return !commentHasError();
            },
            togglePreview = () => {
                if (!validateTitle()) {
                    errors('Título não pode ficar em branco.');
                    showError(true);
                } else if (!validateComment()) {
                    errors('Mensagem não pode ficar em branco.');
                    showError(true);
                } else {
                    h.scrollTop();
                    showPreview(true);
                }
                return false;
            },
            project_id = vnode.attrs.project_id,
            projectDetails = prop([]),
            rewardText = (rewardId, project) => {
                // @TODO move non-sub rewards to common API
                if (projectVM.isSubscription(project)) {
                    const reward = _.find(rewardVM.rewards(), r => String(r.external_id) === String(rewardId));
                    return `Assinantes da recompensa R$${reward.data.minimum_value / 100} - ${reward.data.title ? reward.data.title : `${reward.data.description.substring(0, 70)}...`}`;
                }
                const reward = _.find(rewardVM.rewards(), r => String(r.id) === String(rewardId));
                return `Apoiadores da recompensa R$${reward.minimum_value} - ${reward.title ? reward.title : `${reward.description.substring(0, 70)}...`}`;
            },
            showRecipientes = (post, project) => {
                if (post.recipients === 'public') {
                    return window.I18n.t(`everyone_${project.mode}`, I18nScope());
                } else if (post.recipients === 'backers') {
                    return window.I18n.t(`backers_${project.mode}`, I18nScope());
                }
                const reward = _.find(rewardVM.rewards(), r => (projectVM.isSubscription(project) ? r.external_id : r.id) == post.reward_id);
                if (reward) {
                    return rewardText(projectVM.isSubscription(project) ? reward.external_id : reward.id, project);
                }
                return '...';
            },
            toDeletePost = prop(-1),
            deletePost = post => () => {
                toDeletePost(post.id);
                m.redraw(true);
                deleteFormSubmit();
                return false;
            },
            setPostDeletionForm = (el, isInit) => {
                if (!isInit) {
                    deleteFormSubmit = () => el.submit();
                }
            },
            openedPercentage = post => (Math.floor((post.open_count / post.delivered_count) * 100) || 0);

        models.projectPostDetail.pageSize(false);
        filterVM.project_id(project_id);
        const listVM = catarse.loaderWithToken(models.projectPostDetail.getPageOptions(_.extend(filterVM.parameters(), { order: 'created_at.desc' }))),
            l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        listVM.load().then((posts) => {
            projectPosts(posts);
            isProjectPostsLoaded(true);
        });


        l.load().then((data) => {
            projectDetails(data);
            if (projectVM.isSubscription(_.first(projectDetails()))) {
                rewardVM.fetchCommonRewards(_.first(projectDetails()).common_id);
            } else {
                rewardVM.fetchRewards(project_id);
            }

            isProjectLoaded(true);
        });

        vnode.state = {
            listVM,
            l,
            projectPosts,
            showRecipientes,
            fields,
            showPreview,
            togglePreview,
            project_id,
            deletePost,
            rewardText,
            errors,
            showSuccess,
            titleHasError,
            commentHasError,
            showError,
            setPostDeletionForm,
            toDeletePost,
            projectDetails,
            openedPercentage,
            isProjectPostsLoaded,
            isProjectLoaded
        };
    },
    view: function({state}) {
        
        const project = _.first(state.projectDetails()),
            paidRewards = _.filter(rewardVM.rewards(), reward => (projectVM.isSubscription(project) ? reward.subscribed_count : reward.paid_count) > 0);

        return (state.isProjectLoaded() && state.isProjectPostsLoaded()) ? m('.project-posts',
            (project.is_owner_or_admin ? m(projectDashboardMenu, {
                project: prop(project)
            }) : ''),
            state.showPreview() ? m(postsPreview, {
                showError: state.showError,
                showSuccess: state.showSuccess,
                errors: state.errors,
                showPreview: state.showPreview,
                project_id: state.project_id,
                mode: project.mode,
                comment_html: state.fields.comment_html,
                title: state.fields.title,
                reward_id: state.fields.reward_id(),
                rewardText: state.fields.reward_id() >= 1 ? state.rewardText(state.fields.reward_id(), project) : null
            }) : [
                m(`.w-section.section-product.${project.mode}`),
                (state.showSuccess() ? m(popNotification, {
                    message: window.I18n.t('successful', I18nScope())
                }) : ''),
                (state.showError() ? m(popNotification, {
                    message: state.errors(),
                    error: true
                }) : ''),
                m('.dashboard-header.u-text-center',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6',
                                m('.fontsize-larger.fontweight-semibold.lineheight-tight',
                                    window.I18n.t(`send_a_message_${project.mode}`, I18nScope())
                                )
                            ),
                            m('.w-col.w-col-3')
                        ])
                    )
                ), m('.section', m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-1'),
                        m('.w-col.w-col-10', [
                            (projectVM.isSubscription(project) ? '' :
                            m('.u-marginbottom-60.u-text-center',
                                m('._w-inline-block.card.fontsize-small.u-radius', [
                                    m('span.fa.fa-lightbulb-o',
                                        ''
                                    ),
                                    ' Veja ótimo motivos para ',
                                    m('a.alt-link[href=\'https://catarse.attach.io/B1AHAGm1x\'][target=\'_blank\']',
                                        'falar com seus apoiadores agora mesmo!'
                                    )
                                ])
                            )),
                            m('.card.card-terciary.medium.u-marginbottom-80.w-form', [
                                m('form', [
                                    m('label.field-label.fontweight-semibold',
                                        'Destinatários'
                                    ),
                                    m('select.positive.text-field.w-select', {
                                        onchange: m.withAttr('value', state.fields.reward_id)
                                    }, [
                                        m('option[value=\'-1\']', {
                                            selected: true
                                        },
                                            window.I18n.t(`everyone_${project.mode}`, I18nScope())
                                        ),
                                        m('option[value=\'0\']',
                                            window.I18n.t(`backers_${project.mode}`, I18nScope())
                                        ),
                                        (_.map(paidRewards, reward => m(`option[value='${projectVM.isSubscription(project) ? reward.external_id : reward.id}']`,
                                              state.rewardText(projectVM.isSubscription(project) ? reward.external_id : reward.id, project)
                                            )))
                                    ]),
                                    m('label.field-label.fontweight-semibold',
                                        'Título'
                                    ),
                                    m('input.positive.text-field.w-input[id=\'post_title\'][maxlength=\'256\'][type=\'text\']', {
                                        name: 'posts[title]',
                                        value: state.fields.title(),
                                        onfocus: () => state.titleHasError(false),
                                        class: state.titleHasError() ? 'error' : '',
                                        onchange: m.withAttr('value', state.fields.title)
                                    }),
                                    m('label.field-label.fontweight-semibold',
                                        'Texto'
                                    ),
                                    m('.preview-container.u-marginbottom-40', {
                                        class: state.commentHasError() ? 'error' : '',
                                        onclick: () => state.commentHasError(false)
                                    }, h.redactor('posts[comment_html]', state.fields.comment_html)),
                                    m('.u-marginbottom-20.w-row', [
                                        m('.w-col.w-col-3'),
                                        m('.w-sub-col.w-col.w-col-6',
                                            m('button.btn.btn-large', {
                                                onclick: state.togglePreview
                                            },
                                                window.I18n.t('preview', I18nScope())
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
                                (state.projectPosts() ? m('.fontsize-small.table-inner', [
                                    (_.map(state.projectPosts(), post => m('.table-row.w-row', [
                                        m('.table-col.w-col.w-col-5', [
                                            m(`a.alt-link.fontsize-base[href='/projects/${project.project_id}/posts/${post.id}#posts'][target='_blank']`,
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
                                                state.showRecipientes(post, project)
                                            ])
                                        ]),
                                        m('.table-col.u-text-center.w-col.w-col-3',
                                                m('.fontsize-base',
                                                    post.delivered_count
                                                )
                                            ),
                                        m('.table-col.u-text-center.w-col.w-col-3',
                                                m('.fontsize-base', [
                                                    post.open_count,
                                                    m('span.fontcolor-secondary', ` (${state.openedPercentage(post)}%)`)
                                                ])
                                            ),
                                        m('.table-col.w-col.w-col-1',
                                                m('button.btn.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash', {
                                                    onclick: state.deletePost(post)
                                                })
                                            )
                                    ]))),
                                    m('form.w-hidden', {
                                        action: `/${window.I18n.locale}/projects/${project.project_id}/posts/${state.toDeletePost()}`,
                                        method: 'POST',
                                        config: state.setPostDeletionForm
                                    }, [
                                        m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
                                        m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'),
                                        m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                                    ])

                                ]) : h.loader())
                            ])
                        ]),
                        m('.w-col.w-col-1')
                    ])
                ))
            ]) : h.loader();
    }
};

export default posts;
