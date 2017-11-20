import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectHighlight from './project-highlight';
import projectSidebar from './project-sidebar';
import projectHeaderTitle from './project-header-title';
import userContributionDetail from './user-contribution-detail';
import contributionVM from '../vms/contribution-vm';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';

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
        const hasContribution = !_.isEmpty(ctrl.projectContributions()) ? m('.card.card-terciary.u-radius.u-margintop-20', [
            m('.fontsize-small.u-text-center', [
                m('span.fa.fa-thumbs-up'),
                ' Você é apoiador deste projeto! ',
                m('a.alt-link[href=\'javascript:void(0);\']', {
                    onclick: ctrl.showContributions.toggle
                }, 'Detalhes')
            ]),
            ctrl.showContributions() ? m('.u-margintop-20.w-row',
                    _.map(ctrl.projectContributions(), contribution => m.component(userContributionDetail, {
                        contribution,
                        rewardDetails
                    }))
                ) : ''
        ]) : '';
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
