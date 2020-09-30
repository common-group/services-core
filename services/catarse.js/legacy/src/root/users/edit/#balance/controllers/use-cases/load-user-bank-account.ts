import { Filter, Equal } from '../../../../../../shared/services'
import { BankAccount, UserId } from './entities'

export type LoadUserBankAccount = (user : UserId) => Promise<BankAccount>

type BuildParams = {
    filter: Filter
    api: {
        loaderWithToken(params : {}) : {
            load(): Promise<BankAccount[]>
        }
    }
    bankAccount: Model,
    redraw(): void
}

type Model = {
    getPageOptions(params? : { [field:string] : string }) : {}
}

export function createUserBankAccountLoader(params : BuildParams) : LoadUserBankAccount {
    const {
        api,
        bankAccount,
        filter,
        redraw,
    } = params

    return async function (user : UserId) : Promise<BankAccount> {
        filter.setParam('user_id', Equal(user.id))
        const configOptions = bankAccount.getPageOptions(filter.toParameters())
        
        try {
            const userBankAccountAsArray = await api.loaderWithToken(configOptions).load() as BankAccount[]
            const hasBankAccount = userBankAccountAsArray && userBankAccountAsArray.length >= 1
            if (hasBankAccount) {
                return userBankAccountAsArray[0]
            } else {
                return this.defaultBankAccount
            }
        } catch(e) {
            return this.defaultBankAccount
        } finally {
            redraw()
        }  
    }
}