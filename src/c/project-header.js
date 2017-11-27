import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectHighlight from './project-highlight';
import projectSidebar from './project-sidebar';
import projectHeaderTitle from './project-header-title';
import userContributionDetail from './user-contribution-detail';
import userSubscriptionDetail from './user-subscription-detail';
import contributionVM from '../vms/contribution-vm';
import subscriptionVM from '../vms/subscription-vm';
import projectVM from '../vms/project-vm';

const projectHeader = {
    controller(args) {
        const project = args.project,
            currentUser = h.getUser(),
            projectSubscriptions = m.prop();

        if (h.isProjectPage() && currentUser && !_.isUndefined(project())) {
            if (!projectVM.isSubscription(project)) {
                contributionVM
                    .getUserProjectContributions(currentUser.user_id, project().project_id, ['paid', 'refunded', 'pending_refund'])
                    .then(args.projectContributions);
            } else {
                subscriptionVM
                    .getUserProjectSubscriptions(args.userDetails().common_id, project().common_id, ['started', 'active'])
                    .then(projectSubscriptions);
            }
        }

        return {
            projectContributions: args.projectContributions,
            projectSubscriptions,
            showContributions: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const project = args.project,
            rewardDetails = args.rewardDetails;
        const hasContribution = (
            (!_.isEmpty(ctrl.projectContributions()) || !_.isEmpty(ctrl.projectSubscriptions()))
                ? m(`.card.card-terciary.u-radius.u-margintop-20${projectVM.isSubscription(project)?'.fontcolor-primary':''}`, [
                    m('.fontsize-small.u-text-center', [
                        m('span.fa.fa-thumbs-up'),
                        (!projectVM.isSubscription(project) ? ' Você é apoiador deste projeto! ' : ' Você é assinante deste projeto! '),
                        m('a.alt-link[href=\'javascript:void(0);\']', {
                            onclick: ctrl.showContributions.toggle
                        }, 'Detalhes')
                    ]),
                    ctrl.showContributions() ? m('.u-margintop-20.w-row',
                            (!projectVM.isSubscription(project)
                                ? _.map(ctrl.projectContributions(), contribution => m.component(userContributionDetail, {
                                    contribution,
                                    rewardDetails
                                }))
                                : _.map(ctrl.projectSubscriptions(), subscription => m.component(userSubscriptionDetail, {
                                    subscription,
                                    project: project()
                                }))
                            )
                        ) : ''
                ])
            : '');
        const hasBackground = Boolean(project().cover_image);

        return (!_.isUndefined(project()) ? m('#project-header', [
            m(`.w-section.section-product.${project().mode}`),
            m(`${projectVM.isSubscription(project) ? '.dark' : ''}.project-main-container`, {
                class: hasBackground ? 'project-with-background' : null,
                style: hasBackground ? `background-image: linear-gradient(180deg, rgba(0, 4, 8, .82), rgba(0, 4, 8, .82)), url("${project().cover_image}");` : null
            }, [
                m(projectHeaderTitle, {
                    project,
                    children: hasContribution
                }),
                m(`.w-section.project-main${projectVM.isSubscription(project) ? '.transparent-background' : ''}`, [
                    m('.w-container', [
                        m('.w-row', [
                            m('.w-col.w-col-8.project-highlight', m.component(projectHighlight, {
                                project
                            })),
                            m('.w-col.w-col-4', m.component(projectSidebar, {
                                project,
                                subscriptionData: args.subscriptionData,
                                userDetails: args.userDetails,
                                goalDetails: args.goalDetails,
                            }))
                        ])
                    ])
                ])
            ])
        ]) : m(''));
    }
};

export default projectHeader;
