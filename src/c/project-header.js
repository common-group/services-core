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
    controller: function(args) {
        const project = args.project,
            currentUser = h.getUser(),
            userProjectSubscriptions = args.userProjectSubscriptions,
            hasSubscription = args.hasSubscription;

        if (h.isProjectPage() && currentUser && !_.isUndefined(project())) {
            if (!projectVM.isSubscription(project)) {
                contributionVM
                    .getUserProjectContributions(currentUser.user_id, project().project_id, ['paid', 'refunded', 'pending_refund'])
                    .then(args.projectContributions);
            }
        }

        return {
            hasSubscription,
            userProjectSubscriptions,
            projectContributions: args.projectContributions,
            showContributions: h.toggleProp(false, true)
        };
    },
    view: function(ctrl, args) {
        const project = args.project,
            rewardDetails = args.rewardDetails,
            activeSubscriptions = _.filter(ctrl.userProjectSubscriptions(), sub => sub.status === 'active'),
            sortedSubscriptions = _.sortBy(ctrl.userProjectSubscriptions(), sub => _.indexOf(['active', 'started', 'canceling', 'inactive', 'canceled'], sub.status));

        const hasContribution = (
            (!_.isEmpty(ctrl.projectContributions()) || ctrl.hasSubscription()) ?
            m(`.card.card-terciary.u-radius.u-marginbottom-40${projectVM.isSubscription(project) ? '.fontcolor-primary' : ''}`, [
                m('.fontsize-small.u-text-center', [
                    m('span.fa.fa-thumbs-up'),
                    m('span.fontweight-semibold', (!projectVM.isSubscription(project) ? ' Você é apoiador deste projeto! ' : ' Você tem uma assinatura neste projeto! ')),
                    m('a.alt-link[href=\'javascript:void(0);\']', {
                        onclick: ctrl.showContributions.toggle
                    }, 'Detalhes')
                ]),
                ctrl.showContributions() ? m('.u-margintop-20.w-row',
                    (!projectVM.isSubscription(project) ?
                        _.map(ctrl.projectContributions(), contribution => m.component(userContributionDetail, {
                            contribution,
                            rewardDetails
                        })) :
                     _.map(activeSubscriptions.length > 0 ? activeSubscriptions : sortedSubscriptions, subscription => m.component(userSubscriptionDetail, {
                         subscription,
                         project: project()
                     }))
                    )
                ) : ''
            ]) :
            '');
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
                                hasSubscription: ctrl.hasSubscription(),
                                subscriptionData: args.subscriptionData,
                                userDetails: args.userDetails,
                                goalDetails: args.goalDetails
                            }))
                        ])
                    ])
                ])
            ])
        ]) : m(''));
    }
};

export default projectHeader;
