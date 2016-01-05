/**
 * window.c.root.Balance component
 * A root component to show user balance and transactions
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="UsersBalance" data-parameters="{'user_id': 10}">
 */
window.c.root.UsersBalance = ((m, _, c, models) => {
    return {
        controller: (args) => {
            const userIdVM = m.postgrest.filtersVM({user_id: 'eq'});

            userIdVM.user_id(args.user_id);

            // Handles with user balance request data
            const balanceManager = (() => {
                const collection = m.prop([{amount: 0, user_id: args.user_id}]),
                      load = () => {
                          models.balance.getRowWithToken(userIdVM.parameters()).then(collection);
                      };

                return {
                    collection: collection,
                    load: load
                };
            })(),

                  // Handles with user balance transactions list data
                  balanceTransactionManager = (() => {
                      const listVM = m.postgrest.paginationVM(
                          models.balanceTransaction, 'created_at.desc'),
                            load = () => {
                                listVM.firstPage(userIdVM.parameters());
                            };

                      return {
                          load: load,
                          list: listVM
                      };
                  })(),

                  // Handles with bank account to check
                  bankAccountManager = (() => {
                      const collection = m.prop([]),
                            loader = (() => {
                                return m.postgrest.loaderWithToken(
                                    models.bankAccount.getRowOptions(
                                        userIdVM.parameters()));
                            })(),
                            load = () => {
                                loader.load().then(collection);
                            };

                      return {
                          collection: collection,
                          load: load,
                          loader: loader
                      };
                  })();

            return {
                bankAccountManager: bankAccountManager,
                balanceManager: balanceManager,
                balanceTransactionManager: balanceTransactionManager
            };
        },
        view: (ctrl, args) => {
            let opts = _.extend({}, args, ctrl);
            return m('#balance-area', [
                m.component(c.UserBalance, opts),
                m('.divider'),
                m.component(c.UserBalanceTransactions, opts),
                m('.u-marginbottom-40'),
                m('.w-section.section.card-terciary.before-footer')
            ]);
        }
    };
}(window.m, window._, window.c, window.c.models));
