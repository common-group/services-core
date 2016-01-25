/**
 * window.c.UserBalanceRequestModalContent component
 * Render the current user bank account to confirm fund request
 *
 * Example:
 * m.component(c.UserBalanceRequestModelContent, {
 *     balance: {user_id: 123, amount: 123} // userBalance struct
 * })
 */
window.c.UserBalanceRequestModalContent = ((m, h, _, models, I18n) => {
    const I18nScope = _.partial(h.i18nScope, 'users.balance');

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
                        m('.fontsize-large.u-text-center', I18n.t('withdraw', I18nScope()))
                    ]),
                    (ctrl.displayDone() ? m('.modal-dialog-content.u-text-center', [
                        m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
                        m('p.fontsize-large', I18n.t('sucess_message', I18nScope()))
                    ]) : m('.modal-dialog-content', [
                        m('.fontsize-base.u-marginbottom-20', [
                            m('span.fontweight-semibold', 'Valor:'),
                            m.trust('&nbsp;'),
                            m('span.text-success', `R$ ${h.formatNumber(balance.amount, 2, 3)}`)
                        ]),
                        m('.fontsize-base.u-marginbottom-10', [
                            m('span', {style: {'font-weight': ' 600'}}, I18n.t('bank.account', I18nScope()))
                        ]),
                        m('.fontsize-small.u-marginbottom-10', [
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('bank.name', I18nScope())),
                                m.trust('&nbsp;'),
                                item.owner_name
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('bank.cpf_cnpj', I18nScope())),
                                m.trust('&nbsp;'),
                                item.owner_document
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('bank.bank_name', I18nScope())),
                                m.trust('&nbsp;'),
                                item.bank_name
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('bank.agency', I18nScope())),
                                m.trust('&nbsp;'),
                                `${item.agency}-${item.agency_digit}`
                            ]),
                            m('div', [
                                m('span.fontcolor-secondary', I18n.t('bank.account', I18nScope())),
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
}(window.m, window.c.h, window._, window.c.models, window.I18n));
