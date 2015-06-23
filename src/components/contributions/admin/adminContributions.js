adminApp.AdminContributions = {
    controller: function() {
      var vm = this.vm = adminApp.AdminContributions.VM;
      this.filterContributions = function(filters){ vm.filter(filters); };
      this.nextPage = function(){ vm.nextPage(); };
    },
    view: function(ctrl) {
      return  [ 
                m.component(adminApp.AdminContributionsFilter,{onFilter: ctrl.filterContributions}),
                m(".w-section.section",[
                  m.component(adminApp.AdminContributionsList, {contributions: ctrl.vm.contributions()}),
                ]),
                m(".w-section.section",[
                  m(".w-container",[
                    m(".w-row",[
                      m(".w-col.w-col-5"),
                      m(".w-col.w-col-2",[
                        m("button.btn.btn-medium.btn-terciary[href='#']", "Carregar mais")
                      ]),
                      m(".w-col.w-col-5")
                    ])
                  ])
                ])
              ];   
    }
};