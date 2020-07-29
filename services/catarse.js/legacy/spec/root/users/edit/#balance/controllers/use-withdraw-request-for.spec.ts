import { useWithdrawRequestFor, UseWithdrawRequestForDependencies, UseWithdrawRequestForReturn } from '../../../../../../src/root/users/edit/#balance/controllers/use-withdraw-request-for'
import { BankAccount, UserBalanceTransfer } from '../../../../../../src/root/users/edit/#balance/controllers/use-cases/entities'
import { setupCustomHook } from '../../../../../lib/setup-custom-hook'

describe('useWithdrawRequestFor', () => {
    it('should retrieve empty bank account on first load', () => {
        const deps : UseWithdrawRequestForDependencies = {
            loadBanks: async () => [],
            loadUserBankAccount: async () => ({} as BankAccount),
            updateSubject: {
                next: () => {}
            },
            updateUserBankAccount: async () => {},
            withdrawFunds: async () => ({} as UserBalanceTransfer),
        }

        const { bankAccount } = setupCustomHook(useWithdrawRequestFor, { id: 11 }, deps) as UseWithdrawRequestForReturn

        expect(bankAccount).toEqual(jasmine.objectContaining({
            account: '',
            account_digit: '',
            account_type: 'conta_corrente',
            agency: '',
            agency_digit: '',
            bank_code: '',
            bank_id: null,
            bank_account_id: null,
            bank_name: '',
            created_at: null,
            owner_document: '',
            owner_name: '',
            updated_at: null,
            user_id: null,
        } as BankAccount))
    })
})