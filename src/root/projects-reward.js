import m from 'mithril';
import faqBox from '../c/faq-box';

const projectsReward = {
    controller(args) {
        return {
            project: m.prop({mode: 'aon'})
        };
    },
    view(ctrl, args) {
        return m('#project-rewards', [
                m(".page-header.u-text-center[data-stats='{&quot;id&quot;:28714,&quot;permalink&quot;:&quot;npostersny&quot;,&quot;total_contributions&quot;:68,&quot;pledged&quot;:5150.0,&quot;project_state&quot;:&quot;online&quot;,&quot;category&quot;:&quot;Artes&quot;,&quot;project_goal&quot;:&quot;13421.0&quot;,&quot;project_online_date&quot;:&quot;2016-04-13T18:56:36.730Z&quot;,&quot;project_expires_at&quot;:&quot;2016-06-13T23:59:59.999-03:00&quot;,&quot;project_address_city&quot;:&quot;BRASÍLIA&quot;,&quot;project_address_state&quot;:&quot;DF&quot;,&quot;account_entity_type&quot;:&quot;Pessoa Física&quot;}'][id='project-header']",
                    m(".w-container",
                        [
                            m("h1.fontsize-larger.fontweight-semibold.project-name[itemprop='name']",
                                "Exposição NPosters em NYC"
                            ),
                            m("h2.fontsize-base.lineheight-looser[itemprop='author']",
                                [
                                    "por",
                                    m.trust("&nbsp;"),
                                    "Natália Calvoso"
                                ]
                            )
                        ]
                    )
                ),
                m(".w-section.header-cont-new",
                    m(".w-container",
                        m(".fontweight-semibold.lineheight-tight.text-success.fontsize-large.u-text-center-small-only",
                            "Escolha a recompensa e em seguida o valor do apoio"
                        )
                    )
                ),
                m(".section[id='new-contribution']",
                    m(".w-container",
                        m(".w-row",
                            [
                                m(".w-col.w-col-8",
                                    m(".w-form.back-reward-form",
                                        m("form.simple_form.new_contribution[accept-charset='UTF-8'][action='/pt/projects/28714/contributions/fallback_create'][id='contribution_form'][method='get'][novalidate='novalidate']",
                                            [
                                                m("div", {style: {"display": "none"}},
                                                    m("input[name='utf8'][type='hidden'][value='✓']")
                                                ),
                                                m(".input.radio_buttons.optional.contribution_reward_id",
                                                    [
                                                        m("label.field-label"),
                                                        m("span.radio.w-radio.w-clearfix.back-reward-radio-reward.selected",
                                                            m("label[for='contribution_reward_id_']",
                                                                [
                                                                    m("input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[checked='checked'][id='contribution_reward_id'][name='contribution[reward_id]'][type='radio']"),
                                                                    m("label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[data-minimum-value='10,00'][for='contribution_reward']",
                                                                        "Não quero recompensa"
                                                                    ),
                                                                    m(".w-row.back-reward-money.w-hidden", {style: {"display": "block"}},
                                                                        [
                                                                            m(".w-col.w-col-8.w-col-small-8.w-col-tiny-8.w-sub-col-middle.w-clearfix",
                                                                                [
                                                                                    m(".w-row",
                                                                                        [
                                                                                            m(".w-col.w-col-3.w-col-small-3.w-col-tiny-3",
                                                                                                m(".back-reward-input-reward.placeholder",
                                                                                                    "R$"
                                                                                                )
                                                                                            ),
                                                                                            m(".w-col.w-col-9.w-col-small-9.w-col-tiny-9",
                                                                                                m("input.user-reward-value.back-reward-input-reward[autocomplete='off'][min='0,00'][placeholder='10,00'][type='tel']")
                                                                                            )
                                                                                        ]
                                                                                    ),
                                                                                    m(".fontsize-smaller.text-error.u-marginbottom-20.w-hidden",
                                                                                        [
                                                                                            m("span.fa.fa-exclamation-triangle"),
                                                                                            " O valor do apoio está incorreto"
                                                                                        ]
                                                                                    )
                                                                                ]
                                                                            ),
                                                                            m(".submit-form.w-col.w-col-4.w-col-small-4.w-col-tiny-4",
                                                                                m("a.btn.btn-large[href='#']",
                                                                                    [
                                                                                        "Continuar",
                                                                                        m.trust("&nbsp;"),
                                                                                        m.trust("&nbsp;"),
                                                                                        m("span.fa.fa-chevron-right")
                                                                                    ]
                                                                                )
                                                                            )
                                                                        ]
                                                                    ),
                                                                    m(".back-reward-reward-description",
                                                                        m(".fontsize-smaller.u-marginbottom-10",
                                                                            "Obrigado. Eu só quero ajudar o projeto."
                                                                        )
                                                                    )
                                                                ]
                                                            )
                                                        ),
                                                        m("span.radio.w-radio.w-clearfix.back-reward-radio-reward",
                                                            m("label[for='contribution_reward_id_70099']",
                                                                [
                                                                    m("input.radio_buttons.optional.w-input.text-field.w-radio-input.back-reward-radio-button[id='contribution_reward_id_70099'][name='contribution[reward_id]'][type='radio'][value='70099']"),
                                                                    m("label.w-form-label.fontsize-base.fontweight-semibold.u-marginbottom-10[data-minimum-value='20,00'][for='contribution_reward_70099']",
                                                                        "R$ 20  ou mais"
                                                                    ),
                                                                    m(".w-row.back-reward-money.w-hidden", {style: {"display": "none"}},
                                                                        [
                                                                            m(".w-col.w-col-8.w-col-small-8.w-col-tiny-8.w-sub-col-middle.w-clearfix",
                                                                                [
                                                                                    m(".w-row",
                                                                                        [
                                                                                            m(".w-col.w-col-3.w-col-small-3.w-col-tiny-3",
                                                                                                m(".back-reward-input-reward.placeholder",
                                                                                                    "R$"
                                                                                                )
                                                                                            ),
                                                                                            m(".w-col.w-col-9.w-col-small-9.w-col-tiny-9",
                                                                                                m("input.user-reward-value.back-reward-input-reward[autocomplete='off'][min='20,00'][placeholder='20,00'][type='tel']")
                                                                                            )
                                                                                        ]
                                                                                    ),
                                                                                    m(".fontsize-smaller.text-error.u-marginbottom-20.w-hidden",
                                                                                        [
                                                                                            m("span.fa.fa-exclamation-triangle"),
                                                                                            " O valor do apoio está incorreto"
                                                                                        ]
                                                                                    )
                                                                                ]
                                                                            ),
                                                                            m(".submit-form.w-col.w-col-4.w-col-small-4.w-col-tiny-4",
                                                                                m("a.btn.btn-large[href='#']",
                                                                                    [
                                                                                        "Continuar",
                                                                                        m.trust("&nbsp;"),
                                                                                        m.trust("&nbsp;"),
                                                                                        m("span.fa.fa-chevron-right")
                                                                                    ]
                                                                                )
                                                                            )
                                                                        ]
                                                                    ),
                                                                    m(".back-reward-reward-description",
                                                                        [
                                                                            m(".fontsize-smaller.u-marginbottom-10", 'Texto da recompensa'),
                                                                            m(".fontsize-smallest.fontcolor-secondary",
                                                                            )
                                                                        ]
                                                                    )
                                                                ]
                                                            )
                                                        )
                                                    ]
                                                )
                                            ]
                                        )
                                    )
                                ),
                                m.component(faqBox, {mode: ctrl.project().mode})
                            ]
                        )
                    )
                )
        ]);
    }
};

export default projectsReward;
