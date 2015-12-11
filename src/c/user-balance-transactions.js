window.c.UserBalanceTransactions = ((m, h, models, _) => {
    return {
        controller: (args) => {
            const vm = m.postgrest.filtersVM({user_id: 'eq'}),
                  listVM = m.postgrest.paginationVM(
                      models.balanceTransaction, 'created_at.desc');

            vm.user_id(args.user_id);

            if(!listVM.collection().lengt) {
                listVM.firstPage(vm.parameters());
            }

            return {
                listVM: listVM
            };
        },
        view: (ctrl) => {
            const list = ctrl.listVM;

            return m('.w-section.section.card-terciary.before-footer', [
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
