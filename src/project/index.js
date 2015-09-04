window.c.project.Index = (function(m, c){
  return {

    controller: function() {
      var vm = {collection: m.prop([])},
          online = m.postgrest.filtersVM({state: 'eq'});
          recent = m.postgrest.filtersVM({created_at: 'gte', state: 'eq'});
          recent.created_at('2015-08-10');
          recent.state('online');

      c.models.project.getPage(1, recent.parameters()).then(function(data){
        vm.collection(data);
      });

      return {
        vm: vm
      };
    },

    view: function(ctrl) {
      var collection = ctrl.vm.collection;
      return [
        m(".w-section.hero-full.hero-knowmore", [
          m(".w-container.u-text-center", [
            m(".hero-home-words-content", [
              m(".fontsize-megajumbo.u-marginbottom-60.fontweight-semibold", [
                m(".w-embed.w-hidden-tiny", [
                  m(".cd-headline.letters.type", [
                    m("span", "Tire"),
                    m("span.cd-words-wrapper.waiting", [
                      m("b.is-visible", "atitudes"),
                      m("b", "peças de teatro"),
                      m("b", "pesquisas"),
                      m("b", "produtos"),
                      m("b", "carnavais"),
                      m("b", "fotografias")
                    ]),
                    m("span", "do papel")
                  ])
                ]),
                m(".w-embed.w-hidden-main.w-hidden-medium.w-hidden-small", [
                  m(".cd-headline.letters.type", [
                    m("", "Tire"),
                    m("span.cd-words-wrapper.waiting", [
                      m("b.is-visible", "atitudes"),
                      m("b", "peças de teatro"),
                      m("b", "filmes"),
                      m("b", "documentários"),
                      m("b", "carnavais"),
                      m("b", "fotografias")
                    ]),
                    m("", "do papel")
                  ])
                ])
              ])
            ]),
            m(".w-row", [
              m(".w-col.w-col-4"),
              m(".w-col.w-col-4", [
                m("a.btn.btn-large.u-marginbottom-10[href='hello.html']", "Saiba mais")
              ]),
              m(".w-col.w-col-4")
            ])
          ])
        ]),

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
            m(".w-row", _.map(collection(), function(project){
             return m.component(c.ProjectCard, {project: project} );
            }

           ))]
          )
        ]),


        //m(".w-section.section.u-marginbottom-40", [
          //m(".w-container", [
            //m(".w-row.u-marginbottom-30", [
              //m(".w-col.w-col-10.w-col-small-6.w-col-tiny-6", [
                //m(".fontsize-large.lineheight-looser", "Na reta final")
              //]),
              //m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [
                //m("a.btn.btn-small.btn-terciary[href='#']", "Ver todos")
              //])
            //]),
            //m(".w-row", [
              //m.component(c.ProjectCard),
              //m.component(c.ProjectCard),
              //m.component(c.ProjectCard)
            //])
          //])
        //]),


        //m(".w-section.section.u-marginbottom-40", [
          //m(".w-container", [
            //m(".w-row.u-marginbottom-30", [
              //m(".w-col.w-col-10.w-col-small-6.w-col-tiny-6", [
                //m(".fontsize-large.lineheight-looser", "Recentes")
              //]),
              //m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [
                //m("a.btn.btn-small.btn-terciary[href='#']", "Ver todos")
              //])
            //]),
            //m(".w-row", [
              //m.component(c.ProjectCard),
              //m.component(c.ProjectCard),
              //m.component(c.ProjectCard)
            //])
          //])
        //]),

        m(".w-section.section-large.bg-gray.before-footer", [
          m(".w-container", [
            m(".u-text-center", [
              m("img.u-marginbottom-10[src='images/icon-blog.png'][width='83']"),
              m(".fontsize-large.u-marginbottom-60.text-success", "Blog do Catarse")
            ]),
            m(".w-row", [
              m(".w-col.w-col-4.col-blog-post", [
                m("", [
                  m("", [
                    m(".fontweight-semibold.fontsize-base.u-marginbottom-10", "Como 36 pessoas mudaram o sistema de transporte de uma cidade inteira"),
                    m(".fontsize-smaller.fontcolor-secondary", "O espaço público das cidades está em constante disputa não apenas entre uma infinidade de grupos de interesse, mas também com a própria burocracia e ineficácia do poder público.")
                  ])
                ])
              ]),
              m(".w-col.w-col-4.col-blog-post", [
                m(".fontweight-semibold.fontsize-base.u-marginbottom-10", "Retrospectiva Dois Mil e Catarse: R$ 1 milhão por mês"),
                m(".fontsize-smaller.fontcolor-secondary", "O ano que já veio com trocadilho pronto foi de fato fantástico para nós. Nesses quase quatro anos, já passaram pelo Catarse 2.700 projetos, dos quais 1.480 (55%) alcançaram a meta de financiamento. ")
              ]),
              m(".w-col.w-col-4.col-blog-post", [
                m(".fontweight-semibold.fontsize-base.u-marginbottom-10", "Retrospectiva Dois Mil e Catarse: R$ 1 milhão por mês"),
                m(".fontsize-smaller.fontcolor-secondary", "O ano que já veio com trocadilho pronto foi de fato fantástico para nós. Nesses quase quatro anos, já passaram pelo Catarse 2.700 projetos, dos quais 1.480 (55%) alcançaram a meta de financiamento. ")
              ])
            ])
          ])
        ])
      ];

  }};
}(window.m, window.c));
