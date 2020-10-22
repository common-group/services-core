import { withHooks } from 'mithril-hooks'
import { UserBalanceAmount, UserBalanceAmountProps } from './user-balance-amount/user-balance-amount'
import { UserBalanceTransactionsWithServices } from './user-balance-transactions'
import { UserBalanceWithdrawHistoryWithServices } from './user-balance-withdraw-history'
import { UserDetails } from '../../../../entities'
import { UserBalanceAmountWithServices } from './user-balance-amount'

export type UserBalanceProps = {
    user: UserDetails
}

export const UserBalance = withHooks<UserBalanceProps>(_UserBalance)

function _UserBalance({user} : UserBalanceProps) {
    return (
        <div id='balance-area'>
            <UserBalanceAmountWithServices user={user} />
            <UserBalanceWithdrawHistoryWithServices user={user} />
            <div class='divider'></div>
            <UserBalanceTransactionsWithServices user={user} />
            <div class='u-marginbottom-40'></div>
            <div class='w-section section card-terciary before-footer'></div>
        </div>
    )
}