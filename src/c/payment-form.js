import m from 'mithril';
import h from '../h';
import tooltip from './tooltip';

const paymentForm = {
    controller() {
        const buildTooltip = (tooltipText) => {
            return m.component(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            });
        };

        return {
            buildTooltip: buildTooltip,
            toggleBoleto: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        return m('[id=\'step2\']', [
            m('.u-text-center-small-only.u-marginbottom-30', [
                m('.fontsize-large.fontweight-semibold',
                    'Escolha o meio de pagamento'
                ),
                m('.fontsize-smallest.fontcolor-secondary.fontweight-semibold', [
                    m('span.fa.fa-lock',
                        '.'
                    ),
                    ' PAGAMENTO SEGURO'
                ])
            ]),
            m('.flex-row.u-marginbottom-40', [
                m('a.w-inline-block.btn-select.flex-column.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: ctrl.toggleBoleto.toggle,
                    class: !ctrl.toggleBoleto() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                        'Cartão de crédito'
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')
                ]),
                m('a.w-inline-block.btn-select.flex-column.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: ctrl.toggleBoleto.toggle,
                    class: ctrl.toggleBoleto() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                        'Boleto bancário'
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')
                ])
            ]), !ctrl.toggleBoleto() ? m('#credit-card-section', [m('.w-form.u-marginbottom-40', [
                    m('form[data-name=\'Email Form\'][id=\'email-form\'][name=\'email-form\']', [
                        m('div', [
                            m('label.field-label.fontweight-semibold[for=\'email-61\']',
                                'Nome no cartão de crédito *'
                            ),
                            m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                                'Nome impresso na frente do seu cartão de crédito'
                            ),
                            m('input.w-input.text-field[data-name=\'Email 61\'][id=\'email-61\'][name=\'email-61\'][required=\'required\'][type=\'email\']')
                        ]),
                        m('div', [
                            m('label.field-label.fontweight-semibold[for=\'email-66\']',
                                'Número do cartão de crédito *'
                            ),
                            m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                                'O número normalmente com 16 dígitos na frente do seu cartão de crédito'
                            ),
                            m('input.w-input.text-field[data-name=\'Email 66\'][id=\'email-66\'][name=\'email-66\'][required=\'required\'][type=\'email\']')
                        ]),
                        m('div', [
                            m('label.field-label.fontweight-semibold[for=\'email-70\']',[
                                'Expiração (mm/aaaa)* ',
                                ctrl.buildTooltip('Copy tooltip de validade')
                            ]),
                            m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                                'A data de validade, geralmente na frente do cartão'
                            ),
                            m('.w-row', [
                                m('.w-col.w-col-6.w-col-tiny-6.w-sub-col',
                                    m('select.w-select.text-field[id=\'field-2\'][name=\'field-2\']', [
                                        m('option[value=\'\']',
                                            '01 - Janeiro'
                                        ),
                                        m('option[value=\'First\']',
                                            '02 - Fevereiro'
                                        ),
                                        m('option[value=\'Second\']',
                                            '03 - Março'
                                        ),
                                        m('option[value=\'Third\']',
                                            '04 - Abril'
                                        ),
                                        m('option[value=\'\']',
                                            '05 - Maio'
                                        ),
                                        m('option[value=\'\']',
                                            '06 - Junho'
                                        )
                                    ])
                                ),
                                m('.w-col.w-col-6.w-col-tiny-6',
                                    m('select.w-select.text-field[id=\'field-2\'][name=\'field-2\']', [
                                        m('option[value=\'\']',
                                            '2016'
                                        ),
                                        m('option[value=\'First\']',
                                            '2017'
                                        ),
                                        m('option[value=\'Second\']',
                                            '2018'
                                        ),
                                        m('option[value=\'Third\']',
                                            '2019'
                                        )
                                    ])
                                )
                            ])
                        ]),
                        m('div', [
                            m('label.field-label.fontweight-semibold[for=\'email-67\']',[
                                'Código de Segurança (CVV / CVV2)* ',
                                ctrl.buildTooltip('Copy tooltip código de segurança')
                            ]),
                            m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip',
                                'Os 3 dígitos (quando na frente) ou 4 dígitos (quando atrás) do seu cartão'
                            ),
                            m('.w-row', [
                                m('.w-col.w-col-8.w-col-tiny-6',
                                    m('input.w-input.text-field[data-name=\'Email 67\'][id=\'email-67\'][name=\'email-67\'][required=\'required\'][type=\'email\']')
                                ),
                                m('.w-col.w-col-4.w-col-tiny-6.u-text-center',
                                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg\'][width=\'176\']')
                                )
                            ])
                        ]),
                        m('.w-row', [
                            m('.w-col.w-col-6', [
                                m('label.field-label.fontweight-semibold[for=\'field\']',
                                    'Parcelas'
                                ),
                                m('select.w-select.text-field[id=\'field\'][name=\'field\']', [
                                    m('option[value=\'\']',
                                        '1 X R$75'
                                    ),
                                    m('option[value=\'First\']',
                                        'First Choice'
                                    ),
                                    m('option[value=\'Second\']',
                                        'Second Choice'
                                    ),
                                    m('option[value=\'Third\']',
                                        'Third Choice'
                                    )
                                ])
                            ]),
                            m('.w-col.w-col-6')
                        ])
                    ]),
                ]),

                m('.w-row', [
                    m('.w-col.w-col-2'),
                    m('.w-col.w-col-8', [
                        m('a.btn.btn-large.u-marginbottom-20[href=\'#\']',
                            'Finalizar pagamento'
                        ),
                        m('.fontsize-smallest.u-text-center', [
                            'Ao apoiar, você concorda com os ',
                            m('a.alt-link[href=\'#\']',
                                'Termos de Uso'
                            ),
                            m.trust('&nbsp;'),
                            'e ',
                            m('a.alt-link[href=\'#\']',
                                'Política de Privacidade'
                            )
                        ])
                    ]),
                    m('.w-col.w-col-2')
                ])
            ]) : m('#boleto-section', [m('form.simple_form.edit_user[accept-charset=\'UTF-8\'][action=\'javascript:void(0)\'][id=\'edit_user_387622\'][method=\'post\'][novalidate=\'novalidate\']', [
                m('div', {
                    style: {
                        'display': 'none'
                    }
                }, [
                    m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
                    m('input[name=\'_method\'][type=\'hidden\'][value=\'patch\']'),
                    m('input[name=\'authenticity_token\'][type=\'hidden\'][value=\'rU9SQFhzUkv8WLbRfq9TYRHP3EZKOuUkOlzmcEUv9VA=\']')
                ]),
                m('.w-row',
                    m('.w-col.w-col-12',
                        m('.payment-error-message.card.card-error.u-radius.zindex-10.u-marginbottom-30.w-hidden', [
                            m('.fontsize-smaller.fontweight-bold.u-marginbottom-10',
                                'Verifique os dados informados'
                            ),
                            m('.message-text.fontsize-smaller',
                                m('span.translation_missing[title=\'translation missing: pt.catarse_pagarme.pagarme.review.review_errors\']',
                                    'Review Errors'
                                )
                            )
                        ])
                    )
                ),
                m('.w-row',
                    m('.w-col.w-col-12',
                        m('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [
                            m('.fontsize-small.u-marginbottom-20',
                                'Esse boleto bancário vence no dia 29/06/2016.'
                            ),
                            m('.fontsize-small.u-marginbottom-40',
                                'Ao gerar o boleto, o realizador já está contando com o seu apoio. Pague até a data de vencimento pela internet, casas lotéricas, caixas eletrônicos ou agência bancária.'
                            ),
                            m('.w-row', [
                                m('.w-col.w-col-2'),
                                m('.w-col.w-col-8', [
                                    m('.loader.u-text-center.w-col.w-col-12.u-marginbottom-30[id=\'card-loading\']',
                                        m('img[alt=\'Loader\'][src=\'/assets/catarse_bootstrap/loader-b642f2f0212454026a5c7c40620427c1.gif\']')
                                    ),
                                    m('input.btn.btn-large.u-marginbottom-20[id=\'build_boleto\'][name=\'commit\'][type=\'submit\'][value=\'Imprimir boleto\']'),
                                    m('.fontsize-smallest.u-text-center.u-marginbottom-30', [
                                        'Ao apoiar, você concorda com os ',
                                        m('a.alt-link[href=\'/pt/terms-of-use\']',
                                            'Termos de Uso '
                                        ),
                                        'e ',
                                        m('a.alt-link[href=\'/pt/privacy-policy\']',
                                            'Política de Privacidade'
                                        )
                                    ])
                                ]),
                                m('.w-col.w-col-2')
                            ])
                        ])
                    )
                )
            ])])

        ]);
    }
};

export default paymentForm;
