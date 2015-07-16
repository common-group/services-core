adminApp.AdminContributions = {
  controller: function() {
    var vm = this.vm = adminApp.AdminContributions.VM
        error = this.error = m.prop();

    this.filterContributions = function(filters){ 
      vm.filter(filters).then(null, function(serverError){
        error(serverError.message);
      }); 
    };
  },

  view: function(ctrl) {
    return  [ 
      m.component(adminApp.AdminContributionsFilter,{onFilter: ctrl.filterContributions}),
      m(".w-section.section",[
        m(".w-container",[
          m(".w-row.u-marginbottom-20", [
            m(".w-col.w-col-9", [
              m(".fontsize-base", [
                m("span.fontweight-semibold", ctrl.vm.total())," apoios encontrados"]
               )
            ])
          ]),
          (ctrl.error() ? m(".card.card-error.u-radius.fontweight-bold", ctrl.error()) : m.component(adminApp.AdminContributionsList, {contributions: ctrl.vm.collection})),
        ])
      ]),
      m(".w-section.section",[
        m(".w-container",[
          m(".w-row",[
            m(".w-col.w-col-5"),
            m(".w-col.w-col-2",[
              !ctrl.vm.isLoading() ?
                m("button#load-more.btn.btn-medium.btn-terciary", {onclick: ctrl.vm.nextPage}, "Carregar mais") :
                m("img[alt='Loader'][src='/assets/catarse_bootstrap/loader-eff2ad1eeb09a19c9afb5b143e1dd62b.gif']"),
            ]),
            m(".w-col.w-col-5")
          ])
        ])
      ])
    ];   
  }
};
