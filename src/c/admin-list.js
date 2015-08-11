window.c.AdminList = (function(m, h, c){
  var admin = c.admin;
  return {
    controller: function(args) {
      var list = args.vm.list;
      if (!list.collection().length && list.firstPage) {
        list.firstPage().then(null, function(serverError) {
          args.vm.error(serverError.message);
        });
      }
    },
    view: function(ctrl, args) {
      var list = args.vm.list;
      return m('.w-section.section',[
        m('.w-container',[
          m('.w-row.u-marginbottom-20', [
            m('.w-col.w-col-9', [
              m('.fontsize-base', [
                m('span.fontweight-semibold', list.total()),' apoios encontrados']
               )
            ])
          ]),
          m('#admin-contributions-list.w-container',[
            list.collection().map(function(item) {
              return m.component(c.AdminItem, {describer: args.vm.itemDescriber, item: item, key: item.key});
            }),
            m('.w-section.section',[
              m('.w-container',[
                m('.w-row',[
                  m('.w-col.w-col-2.w-col-push-5',[
                    !list.isLoading() ?
                      m('button#load-more.btn.btn-medium.btn-terciary', {onclick: list.nextPage}, 'Carregar mais') :
                      h.loader(),
                  ])
                ])
              ])
            ])
          ])
        ])
      ]);
    }
  };
}(window.m, window.c.h, window.c));
