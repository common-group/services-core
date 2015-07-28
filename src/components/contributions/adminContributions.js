adminApp.AdminContributions = {
  controller: function(args){
    this.error = m.prop();
  },
  view: function(ctrl) {
    return  [
      m.component(adminApp.AdminFilter,{vm: adminApp.ContributionFilterVM}),
      m(".w-section.section",[
        m(".w-container",[
          m(".w-row.u-marginbottom-20", [
            m(".w-col.w-col-9", [
              m(".fontsize-base", [
                m("span.fontweight-semibold", adminApp.ContributionListVM.total())," apoios encontrados"]
               )
            ])
          ]),
          (ctrl.error() ? m(".card.card-error.u-radius.fontweight-bold", adminApp.error()) : m.component(adminApp.AdminList, {vm: adminApp.ContributionListVM})),
        ])
      ])
    ];
  }
};
