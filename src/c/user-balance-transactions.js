window.c.UserBalanceTransactions = ((m, h, models, _) => {
    return {
        controller: (args) => {
            args.balanceTransactionManager.load();

            return {
                list: args.balanceTransactionManager.list
            };
        },
        view: (ctrl, args) => {
            const list = ctrl.list;

            return m('.w-section.section.card-terciary.before-footer.balance-transactions-area', [
                m('.w-container', _.map(list.collection(), (item, index) => {
                    return m.component(
                        c.UserBalanceTransactionRow, {item: item, index: index});
                })),
                m('.container', [
                    m('.w-row', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            !list.isLoading() ? (
                                list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                    onclick: list.nextPage
                                }, 'Carregar mais')
                            ) :
                            h.loader()
                        ])
                    ])
                ])
            ]);
        }
    };
}(window.m, window.c.h, window.c.models, window._));
