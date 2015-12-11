window.c.UserBalance = ((m, h, _, models) => {
    return {
        controller: (args) => {
            const vm = m.postgrest.filtersVM({user_id: 'eq'}),
                  userBalances = m.prop([]),
                  loadBalance = (() => {
                      vm.user_id(args.user_id);
                      return m.postgrest.loaderWithToken(
                          models.balance.getRowOptions(vm.parameters()));
                  })();

            loadBalance.load().then(userBalances);

            return {
                loadBalance: loadBalance,
                userBalances: userBalances
            };
        },
        view: (ctrl) => {
            return m('.w-section.section', _.map(ctrl.userBalances(), (balance) => {
                return m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [
                            m('.fontsize-larger', [
                                'Saldo ',
                                m('span.text-success', `R$ ${balance.amount}`)
                            ])
                        ]),
                        m('.w-col.w-col-4', [
                            m('a.w-button.btn.btn-medium.u-marginbottom-10[href="/banco/saque-conta-1"]', '$ Realizar Saque')
                        ])
                    ])
                ]);
            }));
        }
    };
} (window.m, window.c.h, window._, window.c.models));
