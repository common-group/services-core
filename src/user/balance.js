window.c.user.Balance = ((m, c) => {
    return {
        view: (ctrl, args) => {
            return m('#balance-area', [
                m.component(c.UserBalance, args),
                m('.divider'),
                m.component(c.UserBalanceTransactions, args),
            ]);
        }
    };
}(window.m, window.c));
