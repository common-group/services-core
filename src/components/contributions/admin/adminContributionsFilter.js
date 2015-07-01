adminApp.AdminContributionsFilter = {
  controller: function(args){
    var vm = this.vm = adminApp.AdminContributionsFilter.VM;
    this.filter = function(){
      args.onFilter(vm.parameters());
    };
  },
  view: function(ctrl, args) {
    return m("#admin-contributions-filter.w-section.page-header",[
            m(".w-container",[
              m(".fontsize-larger.u-text-center.u-marginbottom-30", "Apoios"),
              m(".w-form",[
                m("form[data-name='Email Form'][id='email-form'][name='email-form']", [
                  m(".w-row.u-marginbottom-10", [
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field']", "Nome do usuário"),
                      m("input.w-input.text-field.positive[id='field'][name='field'][required='required'][type='text']")
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-2']", "Email do usuário"),
                      m("input.w-input.text-field.positive[data-name='Field 2'][id='field-2'][name='field-2'][required='required'][type='text']")
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-2']", "Id do usuário"),
                      m("input.w-input.text-field.positive[data-name='Field 2'][id='field-2'][name='field-2'][required='required'][type='text']")
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-2']", "Projeto"),
                      m("input.w-input.text-field.positive[data-name='Field 2'][id='field-2'][name='field-2'][required='required'][type='text']")
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-3']", "Com o estado"),
                      m("select.w-select.text-field.positive[id='field-3'][name='field-3']", [
                        m("option[value='']", "Select one..."),
                        m("option[value='First']", "First Choice"),
                        m("option[value='Second']", "Second Choice"),
                        m("option[value='Third']", "Third Choice")
                      ])
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-4']", "Id do apoio"),
                      m("input.w-input.text-field.positive[data-name='Field 4'][id='field-4'][name='field-4'][required='required'][type='text']")
                    ])
                  ]),
                  m(".w-row.u-marginbottom-20", [
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-5']", "Operadora"),
                      m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][required='required'][type='text']")
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-8']", "Gateway"),
                      m("select.w-select.text-field.positive[data-name='Field 8'][id='field-8'][name='field-8']", [
                        m("option[value='']", "Select one..."),
                        m("option[value='First']", "First Choice"),
                        m("option[value='Second']", "Second Choice"),
                        m("option[value='Third']", "Third Choice")
                      ])
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-6']", "Valores entre"),
                      m(".w-row", [
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][required='required'][type='text']")
                        ]),
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][required='required'][type='text']")
                        ])
                      ])
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-7']", "Período do apoio"),
                      m(".w-row", [
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][required='required'][type='text']")
                        ]),
                        m(".w-col.w-col-6", [
                          m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][required='required'][type='text']")
                        ])
                      ])
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-4']", "Email Pagar-me"),
                      m("input.w-input.text-field.positive[data-name='Field 4'][id='field-4'][name='field-4'][required='required'][type='text']")
                    ]),
                    m(".w-col.w-col-2", [
                      m("label.fontsize-smaller[for='field-4']", "Id Pagar-me"),
                      m("input.w-input.text-field.positive[data-name='Field 4'][id='field-4'][name='field-4'][required='required'][type='text']")
                    ])
                  ])
                ])
              ]),
              m(".w-row", [
                m(".w-col.w-col-4"),
                m(".w-col.w-col-4", [
                  m("button#filter-btn.btn.btn-small", {onclick: ctrl.filter},"Filtrar")
                ]),
                m(".w-col.w-col-4")
              ])
            ])
          ]);
  }
};
