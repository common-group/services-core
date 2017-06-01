import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import copyTextInput from './copy-text-input';
import rewardVM from '../vms/reward-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const dashboardRewardCard = {
    controller() {
        const availableCount = reward => reward.maximum_contributions - reward.paid_count;

        return {
            availableCount
        };
    },
    view(ctrl, args) {
        const reward = args.reward;
        return m('.w-row.card-persisted.card.card-terciary.u-marginbottom-20.medium.sortable', [
            m('.card', [
                m('.w-row', [
                    m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11',
                        m('.fontsize-base.fontweight-semibold',
                            I18n.t('minimum_value_title', I18nScope({minimum_value: reward.minimum_value}))
                        )
                    ),
                    (rewardVM.canEdit(reward, args.project_state, args.user) ?
                        m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1',
                            m("a.show_reward_form[href='javascript:void(0);']", {
                                    onclick: () => {
                                        reward.edit.toggle();
                                    }
                                },
                                m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-edit.btn-no-border')
                            )
                        ) : '')
                ]),
                m('.fontsize-smaller.u-marginbottom-20.fontweight-semibold',
                    I18n.t('paid_contributors', I18nScope(reward.paid_count))
                ),
                m('.fontsize-small.fontweight-semibold',
                    reward.title
                ),
                m('.fontsize-small.fontcolor-secondary',
                    m.trust(h.simpleFormat(h.strip(reward.description))),
                ),
                (reward.limited() ? (ctrl.availableCount(reward) <= 0) ?
                    m('.u-margintop-10',
                        m('span.badge.badge-gone.fontsize-smaller',
                            I18n.t('reward_gone', I18nScope())
                        )
                    ) :
                    m('.u-margintop-10',
                        m('span.badge.badge-attention.fontsize-smaller', [
                            m('span.fontweight-bold',
                                I18n.t('reward_limited', I18nScope())
                            ),
                            I18n.t('reward_available', I18nScope({available: ctrl.availableCount(reward), maximum: reward.maximum_contributions}))
                        ])
                    ) : ''),


                (reward.deliver_at ? m('.fontsize-smallest', [m('b', I18n.t('delivery_estimation', I18nScope())), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : ''),
                m('.fontsize-smallest', m('b', 'Envio: '), I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope()))

            ]),
            m('.u-margintop-20', [
                m('.fontcolor-secondary.fontsize-smallest.fontweight-semibold',
                    I18n.t('reward_link_label', I18nScope())
                ),
                m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-10',
                    I18n.t('reward_link_hint', I18nScope())
                ),
                m('.w-form',
                    m('.w-col.w-col-6',
                        m.component(copyTextInput, {
                            value: `https://www.catarse.me/pt/projects/${args.project_id}/contributions/new?reward_id=${reward.id}`
                        }),
                    )
                ),

            ]),
        ]);
    }
};

export default dashboardRewardCard;
