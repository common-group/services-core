import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import h from '../h';
import rewardVM from '../vms/reward-vm';

const projectEditReward = {
    controller(args) {
        const rewards = m.prop([]);
        rewardVM.fetchRewards(args.project_id).then(() => {
            _.map(rewardVM.rewards(), (reward) => {
                const limited = reward.maximum_contributions !== null;
                _.extend(reward, { edit: h.toggleProp(false, true), limited: h.toggleProp(limited, !limited) });
                rewards().push(reward);
            });
        });
        return {
            rewards
        };
    },

    view(ctrl, args) {
        return m("[id='dashboard-rewards-tab']",
            m('.w-section.section',
                m('.w-container',
                    m('.w-row',
                        m('.w-col.w-col-10.w-col-push-1',
                            m(`form.simple_form.project-form.w-form[action='/pt/projects/${args.project_id}'][method='post'][novalidate='novalidate'][id='edit_project_${args.project_id}']`, [
                                m("input[name='utf8'][type='hidden'][value='✓']"),
                                m("input[name='_method'][type='hidden'][value='patch']"),
                                m(`input[name="authenticity_token"][type="hidden"][value=${h.authenticityToken()}]`),
                                m(`input[id='project_id'][name='project_id'][type='hidden'][value='${args.project_id}']`),
                                m("input[id='anchor'][name='anchor'][type='hidden'][value='reward']"),
                                m("[id='dashboard-rewards']", [

                                    m(".ui-sortable[id='rewards']", [
                                        _.map(ctrl.rewards(), reward => m('div', [m('.nested-fields.ui-sortable-handle',
                                                    m('.reward-card', [
                                                        (!reward.edit() ?
                                                        m(`.w-row.card-persisted.card.card-terciary.u-marginbottom-20.medium.sortable[data-update_url='/pt/projects/${args.project_id}/rewards/${reward.id}/sort']`, [
                                                            m('.w-col.w-col-5.w-sub-col', [
                                                                m('.fontweight-semibold.fontsize-smallest.u-marginbottom-10',
                                                                    m("a.alt-link[href='/projects/49996/contributions/new?reward_id=99865']",
                                                                        m('span.fa.fa-link',
                                                                            m('span',
                                                                                ' Link para apoio direto'
                                                                            )
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
                                                                        m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1',
                                                                            m("a.show_reward_form[href='javascript:void(0);']", { onclick: () => { reward.edit.toggle(); } },
                                                                                m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-edit.btn-no-border')
                                                                            )
                                                                        )
                                                                    ]),
                                                                    m('.fontsize-smaller.u-marginbottom-20.fontweight-semibold',
                                                                        `${reward.paid_count} apoiadores`
                                                                    ),
                                                                    m.trust(reward.description),
                                                                    m('p'),
                                                                    reward.deliver_at ? m('.fontsize-smallest', [m('b', 'Estimativa de entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : ''
                                                                ])
                                                            )
                                                        ]) : ''),
                                                        (reward.edit() ?
                                                        m('.w-row.card.card-terciary.u-marginbottom-20.card-edition.medium', [
                                                            m('.w-col.w-col-5.w-sub-col', [
                                                                m('.fontweight-semibold.fontsize-smallest.u-marginbottom-10', [
                                                                    'Editar recompensa',
                                                                    m.trust('&nbsp;'),
                                                                    m("a.link-edit.fa.fa-question-circle[href='javascript:void(0);']")
                                                                ]),
                                                                m('.fontsize-smallest.fontcolor-secondary.reward-explanation.w-hidden.u-marginbottom-20',
                                                                    'Descreva o valor da recompensa e coloque uma previsão de data de entrega real para os apoiadores. Você também pode limitar uma recompensa e quando o limite é atingido ela aparece como ESGOTADA. Se quiser mudar a ordem que as recompensas aparecem em seu projeto, basta fazer isso arrastando-as para cima ou para baixo.'
                                                                )
                                                            ]),
                                                            m('.w-col.w-col-7',
                                                                m('.card',
                                                                    m('.w-form', [
                                                                        m('.w-row.u-marginbottom-20', [
                                                                            m('.w-col.w-col-5',
                                                                                m('label.fontsize-smaller',
                                                                                    'Valor:'
                                                                                )
                                                                            ),
                                                                            m('.w-col.w-col-7', [
                                                                                m('.w-row', [
                                                                                    m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3.text-field.positive.prefix.no-hover',
                                                                                        m('.fontsize-smallest.fontcolor-secondary.u-text-center',
                                                                                            'R$'
                                                                                        )
                                                                                    ),
                                                                                    m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                                                                        m("input.string.tel.required.w-input.text-field.project-edit-reward.positive.postfix[aria-required='true'][autocomplete='off'][required='required'][type='tel'][id='project_rewards_attributes_0_minimum_value']", { name: 'project[rewards_attributes][0][minimum_value]', value: reward.minimum_value })
                                                                                    )
                                                                                ]),
                                                                                m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_minimum_value']",
                                                                                    'Informe um valor mínimo maior ou igual a 10'
                                                                                )
                                                                            ])
                                                                        ]),
                                                                        m('.w-row', [
                                                                            m('.w-col.w-col-5',
                                                                                m('label.fontsize-smaller',
                                                                                    'Previsão de entrega:'
                                                                                )
                                                                            ),
                                                                            m('.w-col.w-col-7',
                                                                                m('.w-row',
                                                                                    m('.w-col.w-col-12',
                                                                                        m('.w-row', [
                                                                                            m("input[id='project_rewards_attributes_0_deliver_at_3i'][type='hidden'][value='1']", { name: 'project[rewards_attributes][0][deliver_at(3i)]' }),
                                                                                            m("select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_0_deliver_at_2i']", { name: 'project[rewards_attributes][0][deliver_at(2i)]' }, [
                                                                                                _.map(moment.monthsShort(), (month, index) =>
                                                                                                  m(`option[value='${index + 1}']${moment(reward.deliver_at).format('MMM') === month ? "[selected='selected']" : ''}`,
                                                                                                      h.capitalize(month)
                                                                                                  )
                                                                                                )
                                                                                            ]),
                                                                                            m("select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_0_deliver_at_1i']", { name: 'project[rewards_attributes][0][deliver_at(1i)]' }, [
                                                                                                _.map(_.range(moment().year(), moment().year() + 6), year =>
                                                                                                  m(`option[value='${year}']${moment(reward.deliver_at).format('YYYY') === String(year) ? "[selected='selected']" : ''}`,
                                                                                                      year
                                                                                                  )
                                                                                                )
                                                                                            ])
                                                                                        ])
                                                                                    )
                                                                                )
                                                                            )
                                                                        ]),
                                                                        m('.w-row',
                                                                            m('label.fontsize-smaller',
                                                                                'Descrição:'
                                                                            )
                                                                        ),
                                                                        m('.w-row', [
                                                                            m("textarea.text.required.w-input.text-field.positive.height-medium[aria-required='true'][placeholder='Descreva sua recompensa'][required='required'][id='project_rewards_attributes_0_description']", { name: 'project[rewards_attributes][0][description]' },
                                                                                reward.description),
                                                                            m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_description']",
                                                                                'Informe uma descrição para a recompensa'
                                                                            )
                                                                        ]),
                                                                        m('.w-row', [
                                                                            m('.w-col.w-col-5',
                                                                                m('.w-checkbox', [
                                                                                    m('.w-checkbox-input',
                                                                                        m(`input.limit_reward[type='checkbox'][id='limit_reward'][value='${reward.limited()}']`)
                                                                                    ),
                                                                                    m('label.w-form-label',
                                                                                        'Limitar recompensa'
                                                                                    )
                                                                                ])
                                                                            ),
                                                                            (reward.limited() ?
                                                                            m('.w-col.w-col-7.reward_maximum_contributions',
                                                                                m("input.string.tel.optional.w-input.text-field.u-marginbottom-30.positive[placeholder='Quantidade disponível'][type='tel'][id='project_rewards_attributes_0_maximum_contributions']", { name: 'project[rewards_attributes][0][maximum_contributions]' })
                                                                            )
                                                                            : '')
                                                                        ]),
                                                                        m('.w-row.u-margintop-30',
                                                                            m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle',
                                                                                m("input.w-button.btn-terciary.btn.btn-small.reward-close-button[type='submit'][value='Fechar']", { onclick: () => { reward.edit.toggle(); } })
                                                                            )
                                                                        )
                                                                    ])
                                                                )
                                                            )
                                                        ]) : '')
                                                    ])
                                                ),
                                            m("input.ui-sortable-handle[type='hidden'][value='99865']")
                                        ]))
                                    ]),


                                    m("a.btn.btn-large.btn-message.show_reward_form.new_reward_button.add_fields[href='#']",
                                        '+ Adicionar recompensa'
                                    ),
                                    m('.w-section.save-draft-btn-section',
                                        m('.w-container',
                                            m('.w-row',
                                                m('.w-col.w-col-4.w-col-push-4',
                                                    m("input.btn.btn.btn-medium[name='commit'][type='submit'][value='Salvar']")
                                                )
                                            )
                                        )
                                    )
                                ])
                            ])
                        )
                    )
                )
            )
        );
    }
};

export default projectEditReward;
