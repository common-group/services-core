import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import copyTextInput from './copy-text-input';
import rewardVM from '../vms/reward-vm';
import inlineError from './inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const dashboardRewardCard = {
    controller(args) {
        const reward = args.reward(),
            availableCount = () => reward.maximum_contributions - reward.paid_count,
            maximumContributions = m.prop(args.reward().maximum_contributions),
            limitError = m.prop(false),
            toggleLimit = () => {
                reward.limited.toggle();
                maximumContributions('');
                m.redraw();
            };

        _.extend(args.reward(), {
            validate: () => {
                limitError(false);
                if (maximumContributions() && reward.paid_count > maximumContributions()) {
                    limitError(true);
                    args.error(true);
                }
            }
        });

        return {
            availableCount,
            toggleLimit,
            limitError,
            maximumContributions
        };
    },
    view(ctrl, args) {
        const reward = args.reward(),
            index = args.index;
        return m('.w-row.cursor-move.card-persisted.card.card-terciary.u-marginbottom-20.medium.sortable', [
            m('.card', [
                m('.w-row', [
                    m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11',
                        m('.fontsize-base.fontweight-semibold',
                            I18n.t('minimum_value_title', I18nScope({
                                minimum_value: reward.minimum_value
                            }))
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
                    I18n.t('paid_contributors', I18nScope({
                        count: reward.paid_count
                    }))
                ),
                m('.fontsize-small.fontweight-semibold',
                    reward.title
                ),
                m('.fontsize-small.fontcolor-secondary',
                    m.trust(h.simpleFormat(h.strip(reward.description))),
                ),
                (reward.limited() ? (ctrl.availableCount() <= 0) ?
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
                            I18n.t('reward_available', I18nScope({
                                available: ctrl.availableCount(),
                                maximum: reward.maximum_contributions
                            }))
                        ])
                    ) : ''),

                (reward.deliver_at ? m('.fontsize-smallest', [m('b', I18n.t('delivery_estimation', I18nScope())), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : ''),
                m('.fontsize-smallest', m('b', `${I18n.t('delivery', I18nScope())}: `), I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope())),
                m('.u-margintop-40.w-row', [
                    m('.w-col.w-col-6', [
                        m('.w-checkbox', [
                            m("input.w-checkbox-input[type='checkbox']", { onclick: ctrl.toggleLimit, checked: reward.limited() }),
                            m('label.fontsize-smaller.fontweight-semibold.w-form-label',
                                        I18n.t('reward_limited_input', I18nScope())
                                    )
                        ]),
                        m(`div${reward.limited() ? '' : '.w-hidden'}`,
                          m(`input.string.tel.optional.w-input.text-field.u-marginbottom-30.positive[placeholder='Quantidade disponível'][type='tel'][id='project_rewards_attributes_${index}_maximum_contributions']`, {
                              name: `project[rewards_attributes][${index}][maximum_contributions]`,
                              class: ctrl.limitError() ? 'error' : false,
                              value: ctrl.maximumContributions(),
                              onchange: m.withAttr('value', ctrl.maximumContributions)
                          }))
                    ]),
                    m('.w-col.w-col-6')
                ]),
                ctrl.limitError() ? m(inlineError, { message: 'Limite deve ser maior que quantidade de apoios.' }) : '', ,
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
