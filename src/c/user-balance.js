/**
 * window.c.UserBalance component
 * Render the current user total balance and request fund action
 *
 * Example:
 * m.component(c.UserBalance, {
 *     user_id: 123,
 * })
 */
window.c.UserBalance = ((m, h, _, models, c) => {
    return {
        controller: (args) => {
            const vm = m.postgrest.filtersVM({user_id: 'eq'}),
                  userBalances = m.prop([]),
                  loadBalance = (() => {
                      vm.user_id(args.user_id);
                      return m.postgrest.loaderWithToken(
                          models.balance.getRowOptions(vm.parameters()));
                  })();

            let displayModal = h.toggleProp(false, true);

            loadBalance.load().then(userBalances);

            return {
                userBalances: userBalances,
                displayModal: displayModal
            };
        },
        view: (ctrl, args) => {
            let balance = _.first(ctrl.userBalances()) || {amount: 0, user_id: args.user_id},
                balanceRequestModalC = [
                    'UserBalanceRequestModalContent',
                    {balance: balance}
                ];

            return m('.w-section.section', [
                (ctrl.displayModal() ? m.component(c.ModalBox, {
                    displayModal: ctrl.displayModal,
                    content: balanceRequestModalC
                }) : ''),
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [
                            m('.fontsize-larger', [
                                'Saldo ',
                                m('span.text-success', `R$ ${h.formatNumber(balance.amount, 2, 3)}`)
                            ])
                        ]),
                        m('.w-col.w-col-4', [
                            m(`a[class="w-button btn btn-medium u-marginbottom-10 ${(balance.amount <= 0 ? "btn-inactive" : "")}"][href="js:void(0);"]`,
                              {onclick: (balance.amount > 0 ? ctrl.displayModal.toggle : 'js:void(0);')},
                              '$ Realizar Saque')
                        ])
                    ])
                ])
            ]);
        }
    };
} (window.m, window.c.h, window._, window.c.models, window.c));
