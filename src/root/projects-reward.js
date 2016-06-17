import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import projectVM from '../vms/project-vm';
import rewardVM from '../vms/reward-vm';
import faqBox from '../c/faq-box';

const projectsReward = {
    controller(args) {
        const selectedReward = rewardVM.selectedReward,
            rewards = rewardVM.rewards(),
            mode = projectVM.currentProject().mode,
            faq = I18n.translations[I18n.currentLocale()].projects.faq[mode],
            noReward = {
                id: -1,
                description: 'Obrigado. Eu só quero ajudar o projeto.'
            };

        const selectReward = (reward) => () => selectedReward(reward);

        rewards.unshift(noReward);

        if(_.isEmpty(selectedReward())){
            selectedReward(noReward);
        }

        return {
            rewards: rewards,
            project: projectVM.currentProject,
            selectedReward: selectedReward,
            selectReward: selectReward,
            faq: faq
        };
    },
    view(ctrl, args) {
        const project = ctrl.project;

        return m('#project-rewards', [
            m('.w-section.page-header.u-text-center', [
                m('.w-container', [
                    m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name || project().project_name)),
                    m('h2.fontsize-base.lineheight-looser[itemprop="author"]', [
                        'por ',
                        project().user ? project().user.name : project().owner_name ? project().owner_name : ''
                    ])
                ])
            ]),
                m('.w-section.header-cont-new',
                    m('.w-container',
                        m('.fontweight-semibold.lineheight-tight.text-success.fontsize-large.u-text-center-small-only',
                            'Escolha a recompensa e em seguida o valor do apoio'
                        )
                    )
                ),
                m('.section[id=\'new-contribution\']',
                    m('.w-container',
                        m('.w-row',
                            [
                                m('.w-col.w-col-8',
                                    m('.w-form.back-reward-form',
                                        m('form.simple_form.new_contribution[accept-charset=\'UTF-8\'][action=\'/pt/projects/28714/contributions/fallback_create\'][id=\'contribution_form\'][method=\'get\'][novalidate=\'novalidate\']',
                                            _.map(ctrl.rewards, (reward, index) => m('span.radio.w-radio.w-clearfix.back-reward-radio-reward',{
                                                        class: reward === ctrl.selectedReward() ? 'selected' : '',
                                                        onclick: ctrl.selectReward(reward),
                                                        key: index
                                                    }, m(`label[for='contribution_reward_id_${reward.id}']`,
                                                            [
                                                                m(`input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[id='contribution_reward_id_${reward.id}'][name='contribution[reward_id]'][type='radio'][value='${reward.id}']`, {
                                                                    checked: reward === ctrl.selectedReward() ? true : false,
                                                                }),
                                                                m(`label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[for='contribution_reward_${reward.id}']`,
                                                                    reward.id === -1 ? 'Não quero recompensa' : `R$ ${reward.minimum_value} ou mais`
                                                                ),
                                                                m('.w-row.back-reward-money.w-hidden', {style: {'display': 'none'}},
                                                                    [
                                                                        m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8.w-sub-col-middle.w-clearfix',
                                                                            [
                                                                                m('.w-row',
                                                                                    [
                                                                                        m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3',
                                                                                            m('.back-reward-input-reward.placeholder',
                                                                                                'R$'
                                                                                            )
                                                                                        ),
                                                                                        m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                                                                            m(`input.user-reward-value.back-reward-input-reward[autocomplete='off'][min='${reward.minimum_value}'][placeholder='${reward.minimum_value}'][type='tel']`)
                                                                                        )
                                                                                    ]
                                                                                ),
                                                                                m('.fontsize-smaller.text-error.u-marginbottom-20.w-hidden',
                                                                                    [
                                                                                        m('span.fa.fa-exclamation-triangle'),
                                                                                        ' O valor do apoio está incorreto'
                                                                                    ]
                                                                                )
                                                                            ]
                                                                        ),
                                                                        m('.submit-form.w-col.w-col-4.w-col-small-4.w-col-tiny-4',
                                                                            m('a.btn.btn-large[href=\'#\']',
                                                                                [
                                                                                    'Continuar',
                                                                                    m.trust('&nbsp;'),
                                                                                    m.trust('&nbsp;'),
                                                                                    m('span.fa.fa-chevron-right')
                                                                                ]
                                                                            )
                                                                        )
                                                                    ]
                                                                ),
                                                                m('.back-reward-reward-description',
                                                                    [
                                                                        m('.fontsize-smaller.u-marginbottom-10', reward.description),
                                                                        reward.deliver_at ? m('.fontsize-smallest.fontcolor-secondary', 'estimativa de entrega: ' + reward.deliver_at) : ''
                                                                    ]
                                                                )
                                                            ]
                                                        )
                                                    )
                                                )

                                        )
                                    )
                                ),
                                m('.w-col.w-col-4', m.component(faqBox, {mode: ctrl.project().mode, faq: ctrl.faq}))
                            ]
                        )
                    )
                )
        ]);
    }
};

export default projectsReward;
