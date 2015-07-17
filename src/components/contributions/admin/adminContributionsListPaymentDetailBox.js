adminApp.AdminContributionsListPaymentDetailBox = {
  controller: function(args) {
    var toggleDropDown = function() {
     return adminApp.ToggleDiv.toggleProp('none', 'block');
    }

    this.displayRequestRefundDropDown = toggleDropDown();
    this.displayRefundDropDown = toggleDropDown();
    this.displayTransferContributionDropDown = toggleDropDown();
    this.displayChangeRewardDropDown = toggleDropDown();
    this.displatAnonDropDown = toggleDropDown();
  },

  view: function(ctrl, args) {
    var contribution = args.contribution;
    return m("#admin-contribution-detail-box", [
      m(".divider.u-margintop-20.u-marginbottom-20"),
      m(".w-row.u-marginbottom-30",[
        m(".w-col.w-col-2",[
          m("button.btn.btn-small.btn-terciary", {onclick: ctrl.displayRequestRefundDropDown.toggle }, "Pedir reembolso"),
          m.component(adminApp.ToggleDiv, { display: ctrl.displayRequestRefundDropDown,  content:
            m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", [
              m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o reembolso?"),
              m("a.btn.btn-small[href='#']", "Solicitar reembolso")
            ])
          })
        ]),
        m(".w-col.w-col-2",[
          m("button.btn.btn-small.btn-terciary", {onclick: ctrl.displayRefundDropDown.toggle }, "Estornar"),
          m.component(adminApp.ToggleDiv, { display: ctrl.displayRefundDropDown,  content:
            m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [
              m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o estorno?"),
              m("a.btn.btn-small[href='#']", "Solicitar estorno")
            ])
          })
        ]),
        m(".w-col.w-col-2",[
          m("button.btn.btn-small.btn-terciary.btn-desactivated[href='#']", "2a via")
        ]),
        m(".w-col.w-col-2",[
          m("button.btn.btn-small.btn-terciary", { onclick: ctrl.displayTransferContributionDropDown.toggle }, "Transferir apoio"),
          m.component(adminApp.ToggleDiv, { display: ctrl.displayTransferContributionDropDown,  content:
            m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10",[
              m(".w-form",[
                m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']",[
                  m("label[for='name-2']", "Id do novo apoiador:"),
                  m("input.w-input.text-field[data-name='Name 2'][id='name-2'][name='name'][placeholder='ex: 129908'][type='text']"),
                  m("input.w-button.btn.btn-small[data-wait='Please wait...'][type='submit'][value='Transferir']")
                ])
              ])
            ])
          })
        ]),
        m(".w-col.w-col-2",[
          m("button.btn.btn-small.btn-terciary", { onclick: ctrl.displayChangeRewardDropDown.toggle }, "Trocar recompensa"),
          m.component(adminApp.ToggleDiv, { display: ctrl.displayChangeRewardDropDown,  content:
            m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {style: {"display": " none"}},[
              m(".w-form",[
                m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']",[
                  m(".w-radio",[
                    m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"),
                    m("label.w-form-label[for='radio']", "R$ 10")
                  ]),
                  m(".w-radio",[
                    m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                    m("label.w-form-label[for='radio']", "R$ 10")]),
                    m(".w-radio",[
                      m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                      m("label.w-form-label[for='radio']", "R$ 10")
                    ]),
                    m(".w-radio",[
                      m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                      m("label.w-form-label[for='radio']", "R$ 10")
                    ]),
                    m(".w-radio",[
                      m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                      m("label.w-form-label[for='radio']", "R$ 10")
                    ])
                ])
              ])
            ])
          })
        ]),
        m(".w-col.w-col-2",[
          m("button.btn.btn-small.btn-terciary", { onclick: ctrl.displatAnonDropDown.toggle }, "Anonimato"),
          m.component(adminApp.ToggleDiv, { display: ctrl.displatAnonDropDown,  content:
            m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10",[
              m(".w-form",[
                m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']",[
                  m(".w-radio",[
                    m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"),
                    m("label.w-form-label[for='radio']", "Anônimo")
                  ]),
                  m(".w-radio",[
                    m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"),
                    m("label.w-form-label[for='radio']", "Público")
                  ])
                ])
              ])
            ])
          })
        ])
      ]),
      m(".w-row.card.card-terciary.u-radius",[
        m(".w-col.w-col-4",[
          m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"),
          m(".fontsize-smallest.lineheight-looser",[
            "Valor: R$80\n",
            m("br"),
            "Taxa: R$3,35\n",
            m("br"),"Recompensa: R$80\n",
            m("br"),
            "Anônimo: Não\n",
            m("br"),
            "Id pagamento: 638912",
            m("br"),
            "Apoio: 54545454",
            m("br"),
            "Chave: \n",
            m("br"),
            "7809d09d-6325-442e-876e-b9a0846c526f\n",
            m("br"),
            "Meio: Pagarme\n",
            m("br"),
            "Operadora: STONE",
            m("br"),
            m("a.link-hidden[href='#']", "Boleto bancário"),
            " ",
            m("span.badge", "2a via")
          ])
        ]),
        m(".w-col.w-col-4",[
          m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"),
          m(".w-row.fontsize-smallest.lineheight-looser",[
            m(".w-col.w-col-6",[
              m(".fontcolor-secondary", "19/05/2015, 01:20 h")
            ]),
            m(".w-col.w-col-6",[
              m("div", "Apoio criado")
            ])
          ]),
          m(".w-row.fontsize-smallest.lineheight-looser",[
            m(".w-col.w-col-6",[
              m(".fontcolor-secondary", "19/05/2015, 01:20 h")
            ]),
            m(".w-col.w-col-6",[
              m("div", "Apoio criado")
            ])
          ]),
          m(".w-row.fontsize-smallest.lineheight-looser",[
            m(".w-col.w-col-6",[
              m(".fontcolor-secondary", "19/05/2015, 01:20 h")
            ]),
            m(".w-col.w-col-6",[
              m("div",[
                m("span.badge.badge-attention.fontsize-smallest", "Estorno realizado")
              ])
            ])
          ]),
          m(".w-row.fontsize-smallest.lineheight-looser",[
            m(".w-col.w-col-6",[
              m(".fontcolor-secondary", "19/05/2015, 01:20 h")
            ]),
            m(".w-col.w-col-6",[
              m("div", "Apoio criado")
            ])
          ]),
          m(".w-row.fontsize-smallest.lineheight-looser",[
            m(".w-col.w-col-6",[
              m(".fontcolor-secondary", "19/05/2015, 01:20 h")
            ]),
            m(".w-col.w-col-6",[
              m("div", "Apoio criado")
            ])
          ]),
          m(".w-row.fontsize-smallest.lineheight-looser",[
            m(".w-col.w-col-6",[
              m(".fontcolor-secondary", "19/05/2015, 01:20 h")
            ]),
            m(".w-col.w-col-6",[
              m("div", "Apoio criado"),
              m(".fontsize-smallest.lineheight-tighter",[
                m("span.badge", "Luis Otavio Ribeiro")
              ])
            ])
          ])
        ]),
        m(".w-col.w-col-4")
      ])
    ]);
  }
}

