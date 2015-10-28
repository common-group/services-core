window.c.AdminContributionItem = (function(m, c, h) {
    return {
        controller: function() {
            return {
                itemBuilder: [{
                    component: 'AdminContributionUser',
                    wrapperClass: '.w-col.w-col-4'
                }, {
                    component: 'AdminProject',
                    wrapperClass: '.w-col.w-col-4'
                }, {
                    component: 'AdminContribution',
                    wrapperClass: '.w-col.w-col-2'
                }, {
                    component: 'PaymentStatus',
                    wrapperClass: '.w-col.w-col-2'
                }]
            };
        },

        view: function(ctrl, args) {
            return m(
                '.w-row',
                _.map(ctrl.itemBuilder, function(panel) {
                    return m(panel.wrapperClass, [
                        m.component(c[panel.component], {
                            item: args.item,
                            key: args.key
                        })
                    ]);
                })
            );
        }
    };
}(window.m, window.c, window.c.h));
