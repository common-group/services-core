/**
 * window.c.ContributionActivities component
 * Render a component that pass on confirmed contributions in 24hours interval
 *
 *
 * Example of use:
 * view: () => {
 *     ...
 *     m.component(c.ContributionActivities)
 *     ...
 * }
 */
window.c.ContributionActivities = ((m, h, models, _) => {
    return {
        controller: (args) => {
            let interval;
            const collection = m.prop([]),
                  resource = m.prop(),
                  collectionIndex = m.prop(0),
                  collectionSize = m.prop(),
                  collectionL = m.postgrest.loader(
                      models.contributionActivity.getPageOptions()),
                  nextResource = () => {
                      if((collectionIndex()+1) > collectionSize()) {
                          collectionIndex(0);
                      }

                      collectionIndex(collectionIndex() + 1);
                      resource(collection()[collectionIndex()]);
                      m.redraw();
                  },
                  startConfig = (el, isinitialized, context) => {
                      context.onunload = () => clearInterval(interval);
                  },
                  startTimer = () => {
                      interval = setInterval(nextResource, 15000);
                  };

            collectionL.load().then((data) => {
                collection(data);
                collectionSize(data.length);
                resource(_.first(data));
            });

            startTimer();

            return {
                collection: collection,
                collectionL: collectionL,
                resource: resource,
                collectionSize: collectionSize
            };
        },

        view: (ctrl, args) => {
            if(!ctrl.collectionL() && !_.isUndefined(ctrl.resource()) && (ctrl.collectionSize()||0) > 0) {
                let resource = ctrl.resource(),
                    elapsed = h.translatedTime(resource.elapsed_time),
                    project_link = `https://catarse.me/${resource.permalink}?ref=ctrse_home_activities`;

                return m('.w-section.section.bg-backs-carrosel', {config: ctrl.startConfig}, [
                    m('.w-container.u-text-center.fontcolor-negative', [
                        m('.fontsize-large.u-marginbottom-30', `há ${elapsed.total} ${elapsed.unit} atrás...`),
                        m('.w-clearfix.w-inline-block.u-marginbottom-10', [
                            m('a', {href: project_link}, [
                                m('img.thumb-author.u-round', {src: resource.thumbnail, width: 80}),
                            ]),
                            m('img.thumb-author.u-round', {src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56d646f7710a7126338b46ff_logo-catarse-back-carrosel.png'}),
                            m('a', {href: project_link}, [
                                m('img.thumb-author.u-round', {src: resource.project_thumbnail, width: 80, style: 'margin-right: 0;'}),
                            ])
                        ]),
                        m('.fontsize-large', `${resource.name} apoiou`),
                        m('.fontsize-larger', [
                            m('a.link-hidden-white', {href: project_link}, resource.project_name)
                        ])
                    ])
                ]);
            } else {
                return m('div');
            }
        }
    };
}(window.m, window.c.h, window.c.models, window._));
