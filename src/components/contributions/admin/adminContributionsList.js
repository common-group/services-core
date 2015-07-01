adminApp.AdminContributionsList = {
  view: function(ctrl, args) {
    return m("#admin-contributions-list.w-container",[
            // m(".u-marginbottom-30.fontsize-base",[
            //   m("span.fontweight-semibold", "125")," apoios encontrados, totalizando ",
            //   m("span.fontweight-semibold", [
            //     "R$27.090.655,00     ",
            //     m("a.fa.fa-download.fontcolor-dashboard[href='#']",
            //      ".")
            //   ])
            // ]),
            args.contributions().map(function(contribution){
              return m.component(adminApp.AdminContributionsListDetail, {contribution: contribution, key: contribution});
            })
          ]);
  }
}
