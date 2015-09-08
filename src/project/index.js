window.c.project.Index = (function(m, c){
  return {

    controller: function() {
      var vm = {recommendedCollection: m.prop([]), recentCollection: m.prop([]), expiringCollection: m.prop([])},
          expiring = m.postgrest.filtersVM({origin: 'eq'});
          expiring.origin('expiring');
          recommended = m.postgrest.filtersVM({origin: 'eq'});
          recommended.origin('recommended');
          recents = m.postgrest.filtersVM({origin: 'eq'});
          recents.origin('recents');

      c.models.projectsForHome.getPage(1, recommended.parameters()).then(function(data){
        vm.recommendedCollection(data);
      });

      c.models.projectsForHome.getPage(1, recents.parameters()).then(function(data){
        vm.recentCollection(data);
      });

      c.models.projectsForHome.getPage(1, expiring.parameters()).then(function(data){
        vm.expiringCollection(data);
      });

      return {
        vm: vm
      };
    },

    view: function(ctrl) {
      var recentCollection = ctrl.vm.recentCollection,
          recommendedCollection = ctrl.vm.recommendedCollection,
          expiringCollection = ctrl.vm.expiringCollection;
      return [
        m(".w-section.section.u-marginbottom-40", [
          m(".w-container", [
            m(".w-row.u-marginbottom-30", [
              m(".w-col.w-col-10.w-col-small-6.w-col-tiny-6", [
                m(".fontsize-large.lineheight-looser", "Recomendados")
              ]),
              m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [
                m("a.btn.btn-small.btn-terciary[href='#']", "Ver todos")
              ])
            ]),
            m(".w-row", _.map(recommendedCollection(), function(project){
             return m.component(c.ProjectCard, {project: project} );
            }

           ))]
          )
        ]),

        m(".w-section.section.u-marginbottom-40", [
          m(".w-container", [
            m(".w-row.u-marginbottom-30", [
              m(".w-col.w-col-10.w-col-small-6.w-col-tiny-6", [
                m(".fontsize-large.lineheight-looser", "Recentes")
              ]),
              m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [
                m("a.btn.btn-small.btn-terciary[href='#']", "Ver todos")
              ])
            ]),
            m(".w-row", _.map(recentCollection(), function(project){
             return m.component(c.ProjectCard, {project: project} );
            }

           ))]
          )
        ]),

        m(".w-section.section.u-marginbottom-40", [
          m(".w-container", [
            m(".w-row.u-marginbottom-30", [
              m(".w-col.w-col-10.w-col-small-6.w-col-tiny-6", [
                m(".fontsize-large.lineheight-looser", "Na reta final")
              ]),
              m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [
                m("a.btn.btn-small.btn-terciary[href='#']", "Ver todos")
              ])
            ]),
            m(".w-row", _.map(expiringCollection(), function(project){
             return m.component(c.ProjectCard, {project: project} );
            }

           ))]
          )
        ])

      ];

  }};
}(window.m, window.c));
