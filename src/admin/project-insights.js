window.c.admin.ProjectInsights = (function(m, c){
  return {
    view: function() {
      return m('.project-insights',[
        m('.w-row', [
          m('.w-col.w-col-2'),
          m('.w-col.w-col-8.dashboard-header.u-text-center', [
            m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'),
            m.component(c.AdminProjectDetailsCard)
          ]),
          m('.w-col.w-col-2')
        ])
      ]);
    }
  };
}(window.m, window.c));
