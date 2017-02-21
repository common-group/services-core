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
            currentUser = h.getUser();

        if (h.isProjectPage() && currentUser && !_.isUndefined(project())) {
            contributionVM
                .getUserProjectContributions(currentUser.user_id, project().project_id, ['paid', 'refunded', 'pending_refund'])
                .then(args.projectContributions);
        }

        return {
            projectContributions: args.projectContributions,
            showContributions: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const project = args.project,
            rewardDetails = args.rewardDetails;

        return (!_.isUndefined(project()) ? m('#project-header', [
            m(`.w-section.section-product.${project().mode}`),
            m('.w-section.page-header.u-text-center', [
                m('.w-container', [
                    m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)),
                    m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
                        'por ',
                        (project().user ? project().user.public_name : (project().owner_public_name ? project().owner_name : ''))
                    ]),
                    !_.isEmpty(ctrl.projectContributions()) ? m('.card.card-terciary.u-radius.u-margintop-20',
                        [
                            m('.fontsize-small.u-text-center',
                                [
                                    m('span.fa.fa-thumbs-up'),
                                    ' Você é apoiador deste projeto! ',
                                    m('a.alt-link[href=\'javascript:void(0);\']', { onclick: ctrl.showContributions.toggle }, 'Detalhes')
                                ]
                            ),
                            ctrl.showContributions() ? m('.card.u-margintop-20',
                                m('.w-row',
                                    _.map(ctrl.projectContributions(), contribution => m.component(userContributionDetail, { contribution, rewardDetails }))
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
                            project
                        })),
                        m('.w-col.w-col-4', m.component(projectSidebar, {
                            project,
                            userDetails: args.userDetails
                        }))
                    ])
                ])
            ])
        ]) : m(''));
    }
};

export default projectHeader;
