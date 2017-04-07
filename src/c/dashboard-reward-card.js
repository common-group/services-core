import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
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
            m('.w-sub-col.w-col.w-col-5', [
                m('span.fontcolor-secondary.fontsize-smallest',
                    'Link para apoio direto'
                ),
                m('.u-marginbottom-20.w-row',
                    m('.w-col.w-col-12',
                        m('.mithril-copy-link',
                            m('.clipboard.w-row', [
                                m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10',
                                    m('textarea.copy-textarea.text-field.w-input', {
                                        style: {
                                            'margin-bottom': '0'
                                        }
                                    },
                                        `https://www.catarse.me/pt/projects/${args.project_id}/contributions/new?reward_id=${reward.id}`
                                    )
                                ),
                                m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2',
                                    m('button.btn.btn-medium.btn-no-border.btn-terciary.fa.fa-clipboard.w-button')
                                )
                            ])
                        )
                    )
                ),
                m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20',
                    'O link acima leva para a página de contribuição com essa recompensa já selecionada.'
                )
            ]),
            m('.w-col.w-col-7',
                m('.card', [
                    m('.w-row', [
                        m('.w-col.w-col-11.w-col-small-11.w-col-tiny-11',
                            m('.fontsize-base.fontweight-semibold',
                                `Para R$ ${reward.minimum_value} ou mais`
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
                        `${reward.paid_count} apoiadores`
                    ),
                    m.trust(h.simpleFormat(h.strip(reward.description))),
                    (reward.limited() ? (ctrl.availableCount(reward) <= 0) ?
                        m('.u-margintop-10',
                            m('span.badge.badge-gone.fontsize-smaller',
                                'Esgotada'
                            )
                        ) :
                        m('.u-margintop-10',
                            m('span.badge.badge-attention.fontsize-smaller', [
                                m('span.fontweight-bold',
                                    'Limitada '
                                ),
                                ` (${ctrl.availableCount(reward)} de ${reward.maximum_contributions} disponíveis)`
                            ])
                        ) : ''),


                    (reward.deliver_at ? m('.fontsize-smallest', [m('b', 'Estimativa de entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : ''),
                    m('.fontsize-smallest', m('b', 'Envio: '), I18n.t(`shipping_options.${reward.shipping_options}`, I18nScope()))

                ])
            )
        ]);
    }
};

export default dashboardRewardCard;
