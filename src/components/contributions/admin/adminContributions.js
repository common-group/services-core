//AdminContribution.js
adminApp.AdminContribution = {
    controller: function() {
      var contributions = this.contributions = adminApp.models.Contribution.get();
      this.filterContributions = function(filter){
        contributions = adminApp.models.Contribution.get(filter);
        return;
      };
    },
    view: function(ctrl) {
      return  [ 
                m.component(adminApp.AdminContributionsFilter,{onFilter: ctrl.filterContributions}),
                m(".w-section.section",[
                  m.component(adminApp.AdminContributionsList, {contributions: ctrl.contributions}),
                ]),
                m(".w-section.section",[
                  m(".w-container",[
                    m(".w-row",[
                      m(".w-col.w-col-5"),
                      m(".w-col.w-col-2",[
                        m("a.btn.btn-medium.btn-terciary[href='#']", "Carregar mais")
                      ]),
                      m(".w-col.w-col-5")
                    ])
                  ])
                ])
              ];   
    }
}