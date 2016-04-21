window.c.root.ProjectsContributionReport = ((m, c, _, h, models) => {
    return {
        controller: (args) => {
            const listVM = m.postgrest.paginationVM(models.projectContribution, 'id.desc', {'Prefer': 'count=exact'}),
                  filterVM = c.root.ProjectsContributionReportVM,
                  filterBuilder = [
                      {
                          component: 'FilterMain',
                          data: {
                              inputWrapperClass: '.w-input.text-field',
                              btnClass: '.btn.btn-medium',
                              vm: filterVM.full_text_index,
                              placeholder: 'Busque por nome ou email do apoiador'
                          }
                      }, {
                          label: 'reward_filter',
                          component: 'FilterDropdown',
                          data: {
                              label: 'Recompensa',
                              name: 'reward_id',
                              vm: filterVM.reward_id,
                              wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                              options: []
                          }
                      }, {
                          label: 'payment_state',
                          component: 'FilterDropdown',
                          data: {
                              label: 'Status do apoio',
                              name: 'state',
                              vm: filterVM.state,
                              wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6._w-sub-col-middle',
                              options: [{
                                  value: '',
                                  option: 'Status do apoio'
                              }, {
                                  value: 'paid',
                                  option: 'Pago'
                              }, {
                                  value: 'refused',
                                  option: 'Cancelado'
                              }, {
                                  value: 'pending',
                                  option: 'Pendente'
                              }, {
                                  value: 'pending_refund',
                                  option: 'Reembolso pendente'
                              }, {
                                  value: 'refunded',
                                  option: 'Reembolsado'
                              }, {
                                  value: 'chargeback',
                                  option: 'Contestado'
                              }]
                          }
                      }
                  ],
                  submit = () => {
                      listVM.firstPage(filterVM.parameters()).then(null);
                      return false;
                  };

            filterVM.project_id(args.root.getAttribute('data-id'));

            if(!listVM.collection().length) {
                listVM.firstPage(filterVM.parameters());
            }

            return {
                listVM: listVM,
                filterVM: filterVM,
                filterBuilder: filterBuilder,
                submit: submit
            };
        },
        view: (ctrl, args) => {
            const list = ctrl.listVM;

            return [
                m.component(c.ProjectContributionReportHeader, {
                    submit: ctrl.submit,
                    filterBuilder: ctrl.filterBuilder,
                    form: ctrl.filterVM.formDescriber
                }),
                m('.divider.u-margintop-30'),
                m.component(c.ProjectContributionReportContent, {
                    list: list
                })
            ];
        }
    };
}(window.m, window.c, window._, window.c.h, window.c.models));
