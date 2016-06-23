import m from 'mithril';

const paymentForm = {
    view() {
      return m("[id='step2']",
            [
              m(".u-text-center-small-only.u-marginbottom-30",
                [
                  m(".fontsize-large.fontweight-semibold",
                    "Escolha o meio de pagamento"
                  ),
                  m(".fontsize-smallest.fontcolor-secondary.fontweight-semibold",
                    [
                      m("span.fa.fa-lock",
                        "."
                      ),
                      " PAGAMENTO SEGURO"
                    ]
                  )
                ]
              ),
              m(".flex-row.u-marginbottom-40",
                [
                  m("a.w-inline-block.btn-select.flex-column.u-text-center.selected[href='#']",
                    [
                      m(".fontsize-base.fontweight-semibold.u-marginbottom-20",
                        "Cartão de crédito"
                      ),
                      m("img[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png']")
                    ]
                  ),
                  m("a.w-inline-block.btn-select.flex-column.u-text-center[href='#']",
                    [
                      m(".fontsize-base.fontweight-semibold.u-marginbottom-20",
                        "Boleto bancário"
                      ),
                      m("img[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png'][width='48']")
                    ]
                  )
                ]
              ),
              m(".w-form.u-marginbottom-40",
                [
                  m("form[data-name='Email Form'][id='email-form'][name='email-form']",
                    [
                      m("div",
                        [
                          m("label.field-label.fontweight-semibold[for='email-61']",
                            "Nome no cartão de crédito *"
                          ),
                          m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
                            "Nome impresso na frente do seu cartão de crédito"
                          ),
                          m("input.w-input.text-field[data-name='Email 61'][id='email-61'][name='email-61'][required='required'][type='email']")
                        ]
                      ),
                      m("div",
                        [
                          m("label.field-label.fontweight-semibold[for='email-66']",
                            "Número do cartão de crédito *"
                          ),
                          m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
                            "O número normalmente com 16 dígitos na frente do seu cartão de crédito"
                          ),
                          m("input.w-input.text-field[data-name='Email 66'][id='email-66'][name='email-66'][required='required'][type='email']")
                        ]
                      ),
                      m("div",
                        [
                          m("label.field-label.fontweight-semibold[for='email-70']",
                            "Expiração (mm/aaaa) *"
                          ),
                          m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
                            "A data de validade, geralmente na frente do cartão"
                          ),
                          m(".w-row",
                            [
                              m(".w-col.w-col-6.w-col-tiny-6.w-sub-col",
                                m("select.w-select.text-field[id='field-2'][name='field-2']",
                                  [
                                    m("option[value='']",
                                      "01 - Janeiro"
                                    ),
                                    m("option[value='First']",
                                      "02 - Fevereiro"
                                    ),
                                    m("option[value='Second']",
                                      "03 - Março"
                                    ),
                                    m("option[value='Third']",
                                      "04 - Abril"
                                    ),
                                    m("option[value='']",
                                      "05 - Maio"
                                    ),
                                    m("option[value='']",
                                      "06 - Junho"
                                    )
                                  ]
                                )
                              ),
                              m(".w-col.w-col-6.w-col-tiny-6",
                                m("select.w-select.text-field[id='field-2'][name='field-2']",
                                  [
                                    m("option[value='']",
                                      "2016"
                                    ),
                                    m("option[value='First']",
                                      "2017"
                                    ),
                                    m("option[value='Second']",
                                      "2018"
                                    ),
                                    m("option[value='Third']",
                                      "2019"
                                    )
                                  ]
                                )
                              )
                            ]
                          )
                        ]
                      ),
                      m("div",
                        [
                          m("label.field-label.fontweight-semibold[for='email-67']",
                            "Código de Segurança (CVV / CVV2) *"
                          ),
                          m(".fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip",
                            "Os 3 dígitos (quando na frente) ou 4 dígitos (quando atrás) do seu cartão"
                          ),
                          m(".w-row",
                            [
                              m(".w-col.w-col-8.w-col-tiny-6",
                                m("input.w-input.text-field[data-name='Email 67'][id='email-67'][name='email-67'][required='required'][type='email']")
                              ),
                              m(".w-col.w-col-4.w-col-tiny-6.u-text-center",
                                m("img[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg'][width='176']")
                              )
                            ]
                          )
                        ]
                      ),
                      m(".w-row",
                        [
                          m(".w-col.w-col-6",
                            [
                              m("label.field-label.fontweight-semibold[for='field']",
                                "Parcelas"
                              ),
                              m("select.w-select.text-field[id='field'][name='field']",
                                [
                                  m("option[value='']",
                                    "1 X R$75"
                                  ),
                                  m("option[value='First']",
                                    "First Choice"
                                  ),
                                  m("option[value='Second']",
                                    "Second Choice"
                                  ),
                                  m("option[value='Third']",
                                    "Third Choice"
                                  )
                                ]
                              )
                            ]
                          ),
                          m(".w-col.w-col-6")
                        ]
                      )
                    ]
                  ),
                  m(".w-form-done",
                    m("p",
                      "Thank you! Your submission has been received!"
                    )
                  ),
                  m(".w-form-fail",
                    m("p",
                      "Oops! Something went wrong while submitting the form :("
                    )
                  )
                ]
              ),
              m(".w-row",
                [
                  m(".w-col.w-col-2"),
                  m(".w-col.w-col-8",
                    [
                      m("a.btn.btn-large.u-marginbottom-20[href='#']",
                        "Finalizar pagamento"
                      ),
                      m(".fontsize-smallest.u-text-center",
                        [
                          "Ao apoiar, você concorda com os ",
                          m("a.alt-link[href='#']",
                            "Termos de Uso"
                          ),
                          m.trust("&nbsp;"),
                          "e ",
                          m("a.alt-link[href='#']",
                            "Política de Privacidade"
                          )
                        ]
                      )
                    ]
                  ),
                  m(".w-col.w-col-2")
                ]
              )
            ]
          );
    }
};

export default paymentForm;
