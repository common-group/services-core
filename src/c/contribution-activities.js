window.c.ContributionActivities = ((m, h, models, _) => {
    return {
        controller: (args) => {
            const collection = m.prop([]),
                  collectionL = m.postgrest.loader(
                      models.contributionActivity.getPageOptions());

            collectionL.load().then(collection);

            return {
                collection: collection,
                collectionL: collectionL
            };
        },

        view: (ctrl, args) => {
            const l = ctrl.collectionL,
                  collection = ctrl.collection(),
                  resource = _.first(_.sample(collection, 1));

            return (!l() ? m('.w-section.section.bg-backs-carrosel', [
                m('.w-container.u-text-center.fontcolor-negative', [
                    m('.fontsize-large.u-marginbottom-30', `há ${resource.elapsed_time.total} ${resource.elapsed_time.unit} atrás...`),
                    m('.w-clearfix.w-inline-block.u-marginbottom-10', [
                        m('img.thumb-author.u-round', {src: resource.thumbnail, width: 80}),
                        m('img.thumb-author.u-round', {src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56d646f7710a7126338b46ff_logo-catarse-back-carrosel.png'}),
                        m('img.thumb-author.u-round', {src: resource.project_thumbnail, width: 80, style: 'margin-right: 0;'}),
                    ]),
                    m('.fontsize-large', `${resource.name} apoiou`),
                    m('.fontsize-larger', [
                        m('a.link-hidden-white', {href: 'js:void(0);'}, resource.project_name)
                    ])
                ])
            ]) : h.loader());
        }
    };
}(window.m, window.c.h, window.c.models, window._));
