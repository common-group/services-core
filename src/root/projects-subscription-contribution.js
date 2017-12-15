import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import projectHeaderTitle from '../c/project-header-title';
import rewardSelectCard from '../c/reward-select-card';
import h from '../h';
import faqBox from '../c/faq-box';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const projectsSubscriptionContribution = {
    controller() {
        const rewards = () => _.union(
            [{
                id: null,
                description: '',
                minimum_value: 5,
                shipping_options: null,
                row_order: -9999999
            }],
            projectVM.rewardDetails()
        );

        const submitContribution = (event) => {
            const valueFloat = h.monetaryToFloat(rewardVM.contributionValue);
            const currentRewardId = rewardVM.selectedReward().id;

            if (valueFloat < rewardVM.selectedReward().minimum_value) {
                rewardVM.error(`O valor de apoio para essa recompensa deve ser de no mínimo R$${rewardVM.selectedReward().minimum_value}`);
            } else {
                rewardVM.error('');
                m.route(`/projects/${projectVM.currentProject().project_id}/subscriptions/checkout?contribution_value=${valueFloat}${currentRewardId ? '&reward_id=' + currentRewardId : ''}`);
            }
        };

        projectVM.getCurrentProject();

        return {
            project: projectVM.currentProject,
            paymentVM: paymentVM(),
            submitContribution,
            sortedRewards: () => _.sortBy(rewards(), reward => Number(reward.row_order))
        };
    },
    view(ctrl, args) {
        const project = ctrl.project;

        return m('#contribution-new', !_.isEmpty(project()) ? [
            m(`.w-section.section-product.${project().mode}`),
            m('.dark.project-main-container',
                m(projectHeaderTitle, {
                    project
                })
            ),
            m('.w-section.header-cont-new',
                m('.w-container',
                    m('.fontweight-semibold.lineheight-tight.text-success.fontsize-large.u-text-center-small-only',
                        'Escolha a recompensa e em seguida o valor do apoio mensal'
                    )
                )
            ),
            m('.section', m('.w-container', m('.w-row', [
                m('.w-col.w-col-8',
                    m('.w-form.back-reward-form',
                        m(`form.simple_form.new_contribution[accept-charset="UTF-8"][action="/projects/${project().id}/subscriptions/checkout"][id="contribution_form"][method="get"]`, {
                            onsubmit: ctrl.submitContribution
                        }, [
                            _.map(ctrl.sortedRewards(), reward => m(rewardSelectCard, {
                                reward,
                                isSubscription: projectVM.isSubscription(project)
                            }))
                        ])
                    )
                ),
                m('.w-col.w-col-4', [
                    m('.card.u-marginbottom-20.u-radius.w-hidden-small.w-hidden-tiny', [
                        m('.fontsize-small.fontweight-semibold', I18n.t('contribution_warning.title', I18nScope())),
                        m('.fontsize-smaller.u-marginbottom-10', I18n.t('contribution_warning.subtitle', I18nScope())),
                        m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10', I18n.t('contribution_warning.info', I18nScope())),
                        m(`a.alt-link.fontsize-smallest[target="__blank"][href="${I18n.t('contribution_warning.link', I18nScope())}"]`, I18n.t('contribution_warning.link_label', I18nScope()))
                    ]),
                    m.component(faqBox, {
                        mode: project().mode,
                        vm: ctrl.paymentVM,
                        faq: ctrl.paymentVM.faq(project().mode),
                        projectUserId: args.project_user_id
                    })
                ])
            ])))
        ] : h.loader());
    }
};

export default projectsSubscriptionContribution;
