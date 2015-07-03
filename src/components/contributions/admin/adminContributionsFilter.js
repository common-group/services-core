adminApp.AdminContributionsFilter = {
  controller: function(args){
    var vm = this.vm = adminApp.AdminContributionsFilter.VM;
    this.filter = function(){
      args.onFilter(vm.parameters());
      return false;
    };
    if(args) this.filter();
  },
  view: function(ctrl, args) {
    return m("#admin-contributions-filter.w-section.page-header",[
            m(".w-container",[
              m(".fontsize-larger.u-text-center.u-marginbottom-30", "Apoios"),
              m(".w-form",[
                m("form[data-name='Email Form'][id='email-form'][name='email-form']", {onsubmit: ctrl.filter}, [
                  m(".w-row.u-marginbottom-10", [
                    m(".w-col.w-col-4", [
                      m("label.fontsize-smaller[for='field']", "Procurar por"),
                      m("input.w-input.text-field.positive[id='field'][name='field'][type='text'][placeholder='Procure por e-mail, permalink, nome do projeto...']", { onchange: m.withAttr("value", ctrl.vm.permalink), value: ctrl.vm.permalink()})
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-3']", "Com o estado"),
                      m("select.w-select.text-field.positive[id='field-3'][name='field-3']", { onchange: m.withAttr("value", ctrl.vm.state), value: ctrl.vm.state()},  [
                        m("option[value='pending']", "pending"),
                        m("option[value='refused']", "refused"),
                        m("option[value='paid']", "paid"),
                        m("option[value='pending_refund']", "pending_refund"),
                        m("option[value='refunded']", "refunded"),
                        m("option[value='chargeback']", "chargeback"),
                        m("option[value='deleted']", "deleted")
                      ])
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-8']", "Gateway"),
                      m("select.w-select.text-field.positive[data-name='Field 8'][id='field-8'][name='field-8']", { onchange: m.withAttr("value", ctrl.vm.gateway), value: ctrl.vm.gateway()}, [
                        m("option[value='Pagarme']", "Pagarme"),
                        m("option[value='MoIP']", "MoIP"),
                        m("option[value='PayPal']", "PayPal"),
                        m("option[value='Credits']", "Créditos")
                      ])
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-6']", "Valores entre"),
                      m(".w-row", [
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", { onchange: m.withAttr("value", ctrl.vm.value['gte']), value: ctrl.vm.value['gte']()})
                        ]),
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", { onchange: m.withAttr("value", ctrl.vm.value['lte']), value: ctrl.vm.value['lte']()})
                        ])
                      ])
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-7']", "Período do apoio"),
                      m(".w-row", [
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", { onchange: m.withAttr("value", ctrl.vm.created_at['gte']), value: ctrl.vm.created_at['gte']()})
                        ]),
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", { onchange: m.withAttr("value", ctrl.vm.created_at['lte']), value: ctrl.vm.created_at['lte']()})
                        ])
                      ])
                    ])
                  ]),
                  m(".w-row", [
                    m(".w-col.w-col-4"),
                    m(".w-col.w-col-4", [
                      m("input#filter-btn.btn.btn-small[type='submit']", "Filtrar")
                    ]),
                    m(".w-col.w-col-4")
                  ])
                ])
              ])
            ])
          ]);
  }
};
