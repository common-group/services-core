adminApp.AdminContributions = {
    controller: function() {
      var vm = this.vm = adminApp.AdminContributions.VM;
      this.filterContributions = function(filters){ vm.filter(filters); };
      this.nextPage = function(){ vm.nextPage(); };
      vm.fetch();
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
                        ctrl.vm.isLoading ?
                        m("button.btn.btn-medium.btn-terciary[href='#']", {onclick: ctrl.filter}, "Carregar mais") :
                        m("img[alt='Loader'][src='/assets/catarse_bootstrap/loader-eff2ad1eeb09a19c9afb5b143e1dd62b.gif']", {style: {"display": " none"}}),
                      ]),
                      m(".w-col.w-col-5")
                    ])
                  ])
                ])
              ];   
    }
};