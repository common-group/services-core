window.c.AdminItem = (function(m, _, h, c) {
    return {
        controller: function(args) {
            var displayDetailBox = h.toggleProp(false, true);

            return {
                displayDetailBox: displayDetailBox
            };
        },

        view: function(ctrl, args) {
            var item = args.item;

            return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', [
                m.component(args.listItem, {
                    item: item,
                    key: args.key
                }),
                m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {
                    onclick: ctrl.displayDetailBox.toggle
                }),
                ctrl.displayDetailBox() ? m.component(args.listDetail, {
                    item: item,
                    key: args.key
                }) : ''
            ]);
        }
    };
}(window.m, window._, window.c.h, window.c));
