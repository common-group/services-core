import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import facebookButton from '../c/facebook-button';
import projectShareBox from '../c/project-share-box';
import projectRow from '../c/project-row';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const ProjectsSubscriptionThankYou = {
    controller(args) {
        const recommendedProjects = userVM.getUserRecommendedProjects();
        const projectId = h.getParams('project_id');

        projectVM.fetchProject(projectId);

        return {
            displayShareBox: h.toggleProp(false, true),
            recommendedProjects
        };
    },
    view(ctrl, args) {
        const project = projectVM.currentProject();
        const user = h.getUser();

        return m('#thank-you', !project ? h.loader() : [
            m('.page-header.u-marginbottom-30',
                m('.w-container',
                    m('.w-row',
                        m('.w-col.w-col-10.w-col-push-1', [
                            m('.u-marginbottom-20.u-text-center',
                                m(`img.big.thumb.u-round[src='${project.user_thumb}']`)
                            ),
                            m('#thank-you.u-text-center', [
                                m('#creditcard-thank-you.fontsize-larger.text-success.u-marginbottom-20',
                                    I18n.t('thank_you.thank_you', I18nScope())
                                ),
                                m('.fontsize-base.u-marginbottom-40',
                                    m.trust(
                                        I18n.t('thank_you.thank_you_text_html',
                                            I18nScope({
                                                total: project.total_contributions,
                                                email: user.email,
                                                link2: `/pt/users/${user.user_id}/edit#contributions`,
                                                link_email: `/pt/users/${user.user_id}/edit#about_me`
                                            })
                                        )
                                    )
                                ),
                                m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                    'Compartilhe com seus amigos e ajude esse projeto a bater a meta!'
                                )
                            ]),
                            m('.w-row', [
                                m('.w-hidden-small.w-hidden-tiny', [
                                    m('.w-sub-col.w-col.w-col-4', m.component(facebookButton, {
                                        url: `https://www.catarse.me/${project.permalink}?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share`,
                                        big: true
                                    })),
                                    m('.w-sub-col.w-col.w-col-4', m.component(facebookButton, {
                                        messenger: true,
                                        big: true,
                                        url: `https://www.catarse.me/${project.permalink}?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=messenger&utm_campaign=thanks_share`
                                    })),
                                    m('.w-col.w-col-4', m(`a.btn.btn-large.btn-tweet.u-marginbottom-20[href="https://twitter.com/intent/tweet?text=Acabei%20de%20apoiar%20o%20projeto%20${encodeURIComponent(project.name)}%20https://www.catarse.me/${project.permalink}%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share"][target="_blank"]`, [
                                        m('span.fa.fa-twitter'), ' Twitter'
                                    ]))
                                ]),
                                m('.w-hidden-main.w-hidden-medium', [
                                    m('.u-marginbottom-30.u-text-center-small-only', m('button.btn.btn-large.btn-terciary.u-marginbottom-40', {
                                        onclick: ctrl.displayShareBox.toggle
                                    }, 'Compartilhe')),
                                    ctrl.displayShareBox() ? m(projectShareBox, {
                                        project: m.prop({
                                            permalink: project.permalink,
                                            name: project.name
                                        }),
                                        displayShareBox: ctrl.displayShareBox
                                    }) : ''
                                ])
                            ]),
                        ])

                    )
                )
            ),
            m('.section.u-marginbottom-40',
                m('.w-container', [
                    m('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center',
                        I18n.t('thank_you.project_recommendations', I18nScope())
                    ),
                    m.component(projectRow, {
                        collection: ctrl.recommendedProjects,
                        ref: 'ctrse_thankyou_r'
                    })
                ])
            )
        ]);
    }
};

export default ProjectsSubscriptionThankYou;
