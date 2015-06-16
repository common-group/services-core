adminApp.adminContributions = {
    controller: function() {
      var that = this;
      this.filterContributions = function(filter){
        that.contributions = adminApp.models.ContributionDetail.get(filter);
        return;
      };
      this.filterContributions();
    },
    view: function(ctrl) {
      return  [ 
                m.component(adminApp.adminContributionsFilter,{onFilter: ctrl.filterContributions}),
                m(".w-section.section",[
                  m.component(adminApp.adminContributionsList, {contributions: ctrl.contributions}),
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
};