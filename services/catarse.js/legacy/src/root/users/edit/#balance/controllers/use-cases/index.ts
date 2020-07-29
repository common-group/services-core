import h from '../../../../../../h'
import { catarse } from '../../../../../../api'
import models from '../../../../../../models'
import { httpPutRequest, filterFactory } from '../../../../../../shared/services'

import { LoadUserBankAccount, createUserBankAccountLoader } from './load-user-bank-account'
import { LoadBanks, createBanksLoader } from './load-banks'
import { UpdateUserBankAccount, createUserBankAccountUpdater } from './update-user-bank-account'
import { LoadUserBalance, createUserBalanceLoader } from './load-user-balance'
import { LoadUserBalanceTransactions, createUserBalanceTransactionLoader } from './load-user-balance-transactions'
import { LoadUserWithdrawRequestHistory, createUserWithdrawRequestHistoryLoader } from './load-user-withdraw-request-history'
import { WithdrawFunds, createWithdrawRequest } from './withdraw-funds'

export { WithdrawFunds } from './withdraw-funds'
export { LoadUserBankAccount } from './load-user-bank-account'
export { LoadBanks } from './load-banks'
export { UpdateUserBankAccount } from './update-user-bank-account'
export { LoadUserBalance } from './load-user-balance'
export { LoadUserBalanceTransactions } from './load-user-balance-transactions'
export { LoadUserWithdrawRequestHistory } from './load-user-withdraw-request-history'

export const withdrawFunds : WithdrawFunds = createWithdrawRequest({
    api: catarse,
    balanceTransfer: models.balanceTransfer,
})
export const loadUserBankAccount : LoadUserBankAccount = createUserBankAccountLoader({ 
    api: catarse, 
    bankAccount: models.bankAccount, 
    redraw: h.redraw,
    filter: filterFactory(),
})
export const loadBanks : LoadBanks = createBanksLoader({
    loadBanks: () => catarse.loader(models.bank.getPageOptions()).load(),
    redraw: h.redraw
})
export const updateUserBankAccount : UpdateUserBankAccount = createUserBankAccountUpdater({
    httpPutRequest,
    redraw: h.redraw
})
export const loadUserBalance : LoadUserBalance = createUserBalanceLoader({
    filter: filterFactory(),
    balance: models.balance,
    redraw: h.redraw
})
export const loadUserBalanceTransactions : LoadUserBalanceTransactions = createUserBalanceTransactionLoader({
    api: catarse,
    filter: filterFactory(),
    model: models.balanceTransaction,
    redraw: h.redraw
})
export const loadUserWithdrawHistory : LoadUserWithdrawRequestHistory = createUserWithdrawRequestHistoryLoader({
    api: catarse,
    filter: filterFactory(),
    userBalanceTransfers: models.userBalanceTransfers,
    redraw: h.redraw
})