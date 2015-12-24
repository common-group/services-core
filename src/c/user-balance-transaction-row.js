window.c.UserBalanceTransactionRow = ((m, h) => {
    return {
        controller: (args) => {
            const expanded = h.toggleProp(false, true);

            if(args.index == 0) {
                expanded.toggle();
            }

            return {
                expanded: expanded
            };
        },
        view: (ctrl, args) => {
            const item = args.item,
                  createdAt = h.momentFromString(item.created_at, 'YYYY-MM-DD');

            return m(`div[class="${(ctrl.expanded() ? 'card-detailed-open' : '')}"]`,
                     m('.w-clearfix.card.card-clickable', [
                         m('.w-row', [
                             m('.w-col.w-col-2.w-col-tiny-2', [
                                 m('.fontsize-small.lineheight-tightest', createdAt.format('D MMM')),
                                 m('.fontsize-smallest.fontcolor-terciary', createdAt.format('YYYY'))
                             ]),
                             m('.w-col.w-col-10.w-col-tiny-10', [
                                 m(".w-row", [
                                     m('.w-col.w-col-4', [
                                         m('div', [
                                             m('span.fontsize-smaller.fontcolor-secondary', 'saída'),
                                             m.trust('&nbsp;'),
                                             m('span.fontsize-base.text-error', `R$ ${h.formatNumber(Math.abs(item.debit), 2, 3)}`)
                                         ])
                                     ]),
                                     m('.w-col.w-col-4', [
                                         m('div', [
                                             m('span.fontsize-smaller.fontcolor-secondary', 'entrada'),
                                             m.trust('&nbsp;'),
                                             m('span.fontsize-base.text-success', `R$ ${h.formatNumber(item.credit, 2, 3)}`)
                                         ])
                                     ]),
                                     m('.w-col.w-col-4', [
                                         m('div', [
                                             m('span.fontsize-smaller.fontcolor-secondary', 'saldo'),
                                             m.trust('&nbsp;'),
                                             m('span.fontsize-base', `R$ ${h.formatNumber(item.total_amount, 2, 3)}`)
                                         ])
                                     ])
                                 ])
                             ])
                         ]),
                         m('a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix="show-detail-box"][href="js:(void(0));"]', {onclick: ctrl.expanded.toggle})
                     ]),
                     (ctrl.expanded() ? m(".card", _.map(item.source, (transaction) => {
                         let pos = transaction.amount >= 0;

                         return m('div',[
                             m(".w-row.fontsize-small.u-marginbottom-10", [
                                 m(".w-col.w-col-2", [
                                     m(`.text-${(pos ? 'success' : 'error')}`, `${pos ? '+' : '-'} R$ ${h.formatNumber(Math.abs(transaction.amount), 2, 3)}`)
                                 ]),
                                 m(".w-col.w-col-10", [
                                     m("div", `${transaction.event_name} ${transaction.origin_object.name}`)
                                 ])
                             ]),
                             m(".divider.u-marginbottom-10")
                         ]);
                     })) : '')
                    );
        }
    };
}(window.m, window.c.h));
