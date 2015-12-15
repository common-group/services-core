/**
 * window.c.UserBalanceRequestModalContent component
 * Render the current user bank account to confirm fund request
 *
 * Example:
 * m.component(c.UserBalanceRequestModelContent, {
 *     balance: {user_id: 123, amount: 123} // userBalance struct
 * })
 */
window.c.UserBalanceRequestModalContent = ((m, h, _, models) => {
    return {
        controller: (args) => {
            const vm = m.postgrest.filtersVM({user_id: 'eq'}),
                  balance = args.balance,
                  bankAccounts = m.prop([]),
                  loadBankA = (() => {
                      vm.user_id(balance.user_id);

                      return m.postgrest.loaderWithToken(
                          models.bankAccount.getRowOptions(vm.parameters()));
                  })();

            loadBankA.load().then(bankAccounts);

            return {
                bankAccounts: bankAccounts
            };
        },
        view: (ctrl, args) => {
            let balance = args.balance;

            return m('div', _.map(ctrl.bankAccounts(), (item) => {
                return [
                    m('.modal-dialog-header', [
                        m('.fontsize-large.u-text-center', 'Sacar dinheiro')
                    ]),
                    m('.modal-dialog-content', [
                        m('.fontsize-base.u-marginbottom-20', [
                            m('span.fontweight-semibold', 'Valor:'),
                            m.trust('&nbsp;'),
                            m('span.text-success', `R$ ${h.formatNumber(balance.amount, 2, 3)}`)
                        ]),
                        m('.fontsize-base.u-marginbottom-10', [
                            m('span', {style: {'font-weight': ' 600'}}, 'Conta:')
                        ]),
                        m('.fontsize-small.u-marginbottom-10', [
                            m('div', [
                                m('span.fontcolor-secondary', 'Nome / Razão Social:'),
                                m.trust('&nbsp;'),
                                item.owner_name
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'CPF / CNPJ:'),
                                m.trust('&nbsp;'),
                                item.owner_document
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Banco:'),
                                m.trust('&nbsp;'),
                                item.bank_name
                            ]),
                            m("div", [
                                m('span.fontcolor-secondary', 'Agência:'),
                                m.trust('&nbsp;'),
                                `${item.agency}-${item.agency_digit}`
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', 'Conta:'),
                                m.trust('&nbsp;'),
                                `${item.account}-${item.account_digit}`
                            ])
                        ]),
                        m('.fontsize-smallest', [
                            'Não é essa conta? ',
                            m('a.alt-link[href="js:void(0);"]', 'Altere aqui')
                        ])
                    ]),
                    m('.modal-dialog-nav-bottom', [
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6', [
                                m('a.btn.btn-large[href="js:void(0);"]', 'Solicitar saque')
                            ]),
                            m('.w-col.w-col-3')
                        ])
                    ])
                ];
            }));
        }
    };

                                          }(window.m, window.c.h, window._, window.c.models));
