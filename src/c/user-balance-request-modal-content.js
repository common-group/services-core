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
                  loaderOpts = models.balanceTransfer.postOptions({
                      user_id: balance.user_id}),
                  requestLoader = m.postgrest.loaderWithToken(loaderOpts),
                  displayDone = h.toggleProp(false, true),
                  requestFund = () => {
                      requestLoader.load().then((data) => {
                          args.balanceManager.load();
                          args.balanceTransactionManager.load();
                          displayDone.toggle();
                      });
                  };

            args.bankAccountManager.load();

            return {
                requestLoader: requestLoader,
                requestFund: requestFund,
                bankAccounts: args.bankAccountManager.collection,
                displayDone: displayDone,
                loadBankA: args.bankAccountManager.loader
            };
        },
        view: (ctrl, args) => {
            let balance = args.balance;

            return (ctrl.loadBankA() ? h.loader() : m('div', _.map(ctrl.bankAccounts(), (item) => {
                return [
                    m('.modal-dialog-header', [
                        m('.fontsize-large.u-text-center', 'Sacar dinheiro')
                    ]),
                    (ctrl.displayDone() ? m('.modal-dialog-content.u-text-center', [
                        m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
                        m('p.fontsize-large',
                          'Seu saque foi solicitado com sucesso. Em até 10 dias úteis o seu dinheiro estará em sua conta bancária!')
                    ]) : m('.modal-dialog-content', [
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
                        ])
                     ])),
                    (!ctrl.displayDone() ?
                     m('.modal-dialog-nav-bottom', [
                         m('.w-row', [
                             m('.w-col.w-col-3'),
                             m('.w-col.w-col-6', [
                                 (ctrl.requestLoader() ?
                                  h.loader()
                                  : m('a.btn.btn-large.btn-request-fund[href="js:void(0);"]',
                                      {onclick: ctrl.requestFund},
                                      'Solicitar saque'))
                             ]),
                             m('.w-col.w-col-3')
                         ])
                     ]) : '')
                ];
            })));
        }
    };
}(window.m, window.c.h, window._, window.c.models));
