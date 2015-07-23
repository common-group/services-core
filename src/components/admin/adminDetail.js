adminApp.AdminDetail = {
  controller: function(args) {
    this.displayRequestRefundDropDown = adminApp.ToggleDiv.toggler();
    this.displayRefundDropDown = adminApp.ToggleDiv.toggler();
    this.displayTransferContributionDropDown = adminApp.ToggleDiv.toggler();
    this.displayChangeRewardDropDown = adminApp.ToggleDiv.toggler();
    this.displatAnonDropDown = adminApp.ToggleDiv.toggler();
  },

  view: function(ctrl, args) {
    var contribution = args.contribution;
    return m("#admin-contribution-detail-box", [
      m(".divider.u-margintop-20.u-marginbottom-20"),
      m(".w-row.u-marginbottom-30.w-hidden",[
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
        m.component(adminApp.AdminTransaction, { contribution: contribution }),
        m.component(adminApp.AdminContributionsListPaymentDetailBoxHistory, { contribution: contribution }),
        m(".w-col.w-col-4")
      ])
    ]);
  }
}
