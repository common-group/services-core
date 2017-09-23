import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import I18n from 'i18n-js';
import h from '../h';
import rewardVM from '../vms/reward-vm';
import userVM from '../vms/user-vm';
import editRewardCard from '../c/edit-reward-card';
import dashboardRewardCard from '../c/dashboard-reward-card';
import popNotification from '../c/pop-notification';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const projectEditReward = {
    controller(args) {
        const rewards = m.prop([]),
            loading = m.prop(false),
            error = m.prop(false),
            errors = m.prop([]),
            showSuccess = m.prop(false),
            newReward = () => ({
                id: m.prop(null),
                minimum_value: m.prop(null),
                title: m.prop(''),
                shipping_options: m.prop('free'),
                edit: h.toggleProp(true, false),
                deliver_at: m.prop(moment().date(1).format()),
                description: m.prop(''),
                paid_count: m.prop(0),
                limited: h.toggleProp(false, true),
                maximum_contributions: m.prop(null),
                newReward: true,
                row_order: m.prop(999999999 + (rewards().length * 20)) // we need large and spaced apart numbers
            });

        const updateRewardSortPosition = (rewardId, position) => m.request({
            method: 'POST',
            url: `/pt/projects/${args.project_id}/rewards/${rewardId}/sort?reward[row_order_position]=${position}`,
            config: (xhr) => {
                if (h.authenticityToken()) {
                    xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                }
            }
        });

        const setSorting = (el, isInit) => {
            if (!isInit && window.$) {
                window.$(el).sortable({
                    update: (event, ui) => {
                        const rewardId = ui.item[0].id;
                        updateRewardSortPosition(rewardId, ui.item.index());
                    }
                });
            }
        };

        const loadRewards = () => rewardVM.fetchRewards(args.project_id).then(() => {
            rewards([]);
            _.map(rewardVM.rewards(), (reward) => {
                const limited = reward.maximum_contributions !== null;
                const rewardProp = m.prop({
                    id: m.prop(reward.id),
                    deliver_at: m.prop(reward.deliver_at),
                    description: m.prop(reward.description),
                    maximum_contributions: m.prop(reward.maximum_contributions),
                    minimum_value: m.prop(reward.minimum_value),
                    edit: h.toggleProp(false, true),
                    limited: h.toggleProp(limited, !limited),
                    paid_count: m.prop(reward.paid_count),
                    row_order: m.prop(reward.row_order),
                    shipping_options: m.prop(reward.shipping_options),
                    title: m.prop(reward.title),
                    waiting_payment_count: m.prop(reward.waiting_payment_count)
                });
                rewards().push(rewardProp);
            });

            if (rewardVM.rewards().length === 0) {
                rewards().push(m.prop(newReward()));
            }
        });

        const tips = I18n.translations[I18n.currentLocale()].projects.reward_fields.faq;

        loadRewards();

        return {
            loading,
            error,
            errors,
            showSuccess,
            rewards,
            user: userVM.fetchUser(args.user_id),
            newReward,
            setSorting,
            tips
        };
    },

    view(ctrl, args) {
        const error = ctrl.error,
            project = args.project;

        return m("[id='dashboard-rewards-tab']",
            (project() ? [
                m('.w-section.section',
                    m('.w-container', [
                        (ctrl.showSuccess() ? m.component(popNotification, {
                            message: 'Recompensa salva com sucesso'
                        }) : ''),
                        (ctrl.error() ? m.component(popNotification, {
                            message: ctrl.errors(),
                            error: true
                        }) : ''),
                        m('.w-row',
                            m('.w-col.w-col-8.w-col-push-2',
                                m('.u-marginbottom-60.u-text-center',
                                    m('.w-inline-block.card.fontsize-small.u-radius', [
                                        m('span.fa.fa-lightbulb-o'),
                                        m.trust(` ${I18n.t('reward_know_more_cta_html', I18nScope())}`)
                                    ])
                                )
                            )
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-9',
                                m('.w-form', [
                                    ctrl.rewards().length === 0 ? '' : m(".ui-sortable[id='rewards']", {
                                        config: ctrl.setSorting
                                    }, [
                                        _.map(_.sortBy(ctrl.rewards(), reward => Number(reward().row_order())), (reward, index) => m(`div[id=${reward().id()}]`, [m('.nested-fields',
                                                m('.reward-card', [
                                                    (!reward().edit() ?
                                                        m(dashboardRewardCard, {
                                                            reward,
                                                            error,
                                                            errors: ctrl.errors,
                                                            user: ctrl.user(),
                                                            showSuccess: ctrl.showSuccess,
                                                            project_id: args.project_id,
                                                            project_state: project().state
                                                        }) :
                                                        m(editRewardCard, {
                                                            project_id: args.project_id,
                                                            error,
                                                            showSuccess: ctrl.showSuccess,
                                                            errors: ctrl.errors,
                                                            reward
                                                        }))
                                                ])
                                            ),
                                            m('input.ui-sortable-handle[type=\'hidden\']', {
                                                value: reward().id()
                                            })
                                        ]))
                                    ])

                                ]),
                                rewardVM.canAdd(project().state, ctrl.user()) ? [
                                    m('button.btn.btn-large.btn-message.show_reward_form.new_reward_button.add_fields', {
                                        onclick: () => ctrl.rewards().push(m.prop(ctrl.newReward()))
                                    },
                                        I18n.t('add_reward', I18nScope())
                                    )

                                ] : ''
                            ),
                            m('.w-col.w-col-3', [
                                I18n.t('reward_faq_intro', I18nScope()),
                                m('br'),
                                m('br'),
                                I18n.t('reward_faq_sub_intro', I18nScope()),
                                m('br'),
                                m('br'),
                                _.map(ctrl.tips, tip => [
                                    m('.fontweight-semibold', tip.title),
                                    m.trust(tip.description),
                                    m('br'),
                                    m('br')
                                ])
                            ])
                        ])
                    ])
                )
            ] : h.loader())
        );
    }
};

export default projectEditReward;
