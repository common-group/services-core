import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectHighlight from './project-highlight';
import projectSidebar from './project-sidebar';
import userContributionDetail from './user-contribution-detail';
import contributionVM from '../vms/contribution-vm';

const projectHeader = {
    controller(args) {
        const project = args.project,
            currentUser = h.getUser(),
            projectContributions = m.prop([]),
            isProjectPage = () => {
                const path = window.location.pathname,
                    isOnInsights = path.indexOf('/insights') > -1,
                    isOnEdit = path.indexOf('/edit') > -1,
                    isOnContribution = path.indexOf('/contribution') > -1;

                return !isOnEdit && !isOnInsights && !isOnContribution;
            };

        if(isProjectPage() && currentUser && !_.isUndefined(project())){
            contributionVM
                .getUserProjectContributions(currentUser.user_id, project().project_id)
                .then(projectContributions);
        }

        return {
            projectContributions: projectContributions,
            showContributions: h.toggleProp(false, true)
        }
    },
    view(ctrl, args) {
        let project = args.project,
            rewardDetails = args.rewardDetails;

        if (_.isUndefined(project())){
            project = m.prop({});
        }

        return m('#project-header', [
            m('.w-section.section-product.' + project().mode),
            m('.w-section.page-header.u-text-center', [
                m('.w-container', [
                    m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)),
                    m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
                        'por ',
                        project().user ? project().user.name : project().owner_name ? project().owner_name : ''
                    ]),
                    !_.isEmpty(ctrl.projectContributions()) ? m(".card.card-terciary.u-radius.u-margintop-20",
                        [
                            m(".fontsize-small.u-text-center",
                                [
                                    m("span.fa.fa-thumbs-up"),
                                    " Você é apoiador deste projeto! ",
                                    m("a.alt-link[href='javascript:void(0);']", {onclick: ctrl.showContributions.toggle}, "Detalhes")
                                ]
                            ),
                            ctrl.showContributions() ? m(".card.u-margintop-20",
                                m(".w-row",
                                    _.map(ctrl.projectContributions(), contribution => m.component(userContributionDetail, {contribution: contribution, rewardDetails: rewardDetails}))
                                )
                            ) : ''
                        ]
                    ) : ''
                ])
            ]),
            m('.w-section.project-main', [
                m('.w-container', [
                    m('.w-row.project-main', [
                        m('.w-col.w-col-8.project-highlight', m.component(projectHighlight, {
                            project: project
                        })),
                        m('.w-col.w-col-4', m.component(projectSidebar, {
                            project: project,
                            userDetails: args.userDetails
                        }))
                    ])
                ])
            ])
            ]);
    }
};

export default projectHeader;
