adminApp.AdminList = {
  controller: function(args){
    if(!args.vm.collection().length){
      args.vm.firstPage();
    }
  },
  view: function(ctrl, args) {
    return m(".w-section.section",[
            m(".w-container",[
              m(".w-row.u-marginbottom-20", [
                m(".w-col.w-col-9", [
                  m(".fontsize-base", [
                    m("span.fontweight-semibold", args.vm.total())," apoios encontrados"]
                   )
                ])
              ]),
              m("#admin-contributions-list.w-container",[
                args.vm.collection().map(function(item){
                  return m.component(adminApp.AdminItem, {contribution: item, key: item});
                }),
                m(".w-section.section",[
                  m(".w-container",[
                    m(".w-row",[
                      m(".w-col.w-col-2.w-col-push-5",[
                        !args.vm.isLoading() ?
                        m("button#load-more.btn.btn-medium.btn-terciary", {onclick: args.vm.nextPage}, "Carregar mais") :
                        m("img[alt='Loader'][src='/assets/catarse_bootstrap/loader-eff2ad1eeb09a19c9afb5b143e1dd62b.gif']"),
                      ])
                    ])
                  ])
                ])
              ])
            ])
          ]);
  }
}
