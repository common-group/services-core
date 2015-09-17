window.c.ProjectPosts = (function(m, models, h, _){
  return {
    controller: function(args) {
      var listVM = m.postgrest.paginationVM(models.projectPostDetail.getPageWithToken),
          filterVM = m.postgrest.filtersVM({project_id: 'eq'});

      filterVM.project_id(args.project.id);

      if (!listVM.collection().length) {
        listVM.firstPage(filterVM.parameters()).then(null);
      }

      return {
        listVM: listVM,
        filterVM: filterVM
      };
    },
    view: function(ctrl) {
      var list = ctrl.listVM;

      return m('.project-posts.w-section', [
        m('.w-container.u-margintop-20', [
          (_.map(list.collection(), function(post) {
            return m('.w-row', [
              m('.w-col.w-col-1'),
              m('.w-col.w-col-10', [
                m('.post', [
                  m('.u-marginbottom-60', [
                    m('.fontsize-small.fontcolor-secondary.u-text-center', h.momentify(post.created_at)),
                    m('.fontweight-semibold.fontsize-larger.u-text-center.u-marginbottom-30', post.title),
                    (!_.isEmpty(post.comment_html) ? m('.fontsize-base', m.trust(post.comment_html)) : m('.fontsize-base', 'Post exclusivo para apoiadores.'))
                  ]),
                  m('.divider.u-marginbottom-60')
                ])
              ]),
              m('.w-col.w-col-1')
            ]);
          })),
          m('.w-row',[
            m('.w-col.w-col-2.w-col-push-5',[
              !list.isLoading() ?
                m('button#load-more.btn.btn-medium.btn-terciary', {onclick: list.nextPage}, 'Carregar mais') :
                h.loader(),
            ])
          ])
        ]),
      ]);
    }
  };
}(window.m, window.c.models, window.c.h, window._));
