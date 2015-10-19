window.c.AdminContribution = (function(m, h) {
    return {
        view: function(ctrl, args) {
            var contribution = args.item;
            return m('.w-row.admin-contribution', [
                m('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value),
                m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')),
                m('.fontsize-smallest', [
                    'ID do Gateway: ',
                    m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)
                ])
            ]);
        }
    };
}(window.m, window.c.h));
