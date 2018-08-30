import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userBalanceWithdrawHistoryItemRequest from './user-balance-withdraw-history-item-request';

const I18nScope = _.partial(h.i18nScope, 'users.balance');
const I18nScopeTransfer = _.partial(h.i18nScope, 'users.balance.transfer_labels');
const I18nScopeBank = _.partial(h.i18nScope, 'users.balance.bank');

const userBalanceWithdrawHistory = {
    controller: function (args) {

    },
    view: function (ctrl, args) {

        const mock_transfers = [
            {
                amount: 2554500,
                bank_name: '001 - Banco do Brasil S.A.',
                agency: '2115',
                agency_dv: '6',
                account: '46734',
                account_dv: '0',
                account_type: 'conta_corrente',
                user_name: 'Karine Silva Oliveira',
                document_type: 'pf',
                document: '094.871.626-66',
                requested_in: '2018-08-28 13:13:00',
                funding_estimated_date: '2018-08-29 13:13:00',
                transferred_at: null,
                status: 'pending'
            },
            {
                amount: 2554500,
                bank_name: '001 - Banco do Brasil S.A.',
                agency: '2115',
                agency_dv: '6',
                account: '46734',
                account_dv: '0',
                account_type: 'conta_corrente',
                user_name: 'Karine Silva Oliveira',
                document_type: 'pf',
                document: '094.871.626-66',
                requested_in: '2018-08-28 13:13:00',
                funding_estimated_date: '2018-08-29 13:13:00',
                transferred_at: null,
                status: 'rejected'
            },
            {
                amount: 2554500,
                bank_name: '001 - Banco do Brasil S.A.',
                agency: '2115',
                agency_dv: '6',
                account: '46734',
                account_dv: '0',
                account_type: 'conta_corrente',
                user_name: 'Karine Silva Oliveira',
                document_type: 'pf',
                document: '094.871.626-66',
                requested_in: '2018-08-28 13:13:00',
                funding_estimated_date: '2018-08-29 13:13:00',
                transferred_at: '2018-08-29 13:13:00',
                status: 'transferred'
            }
        ];

        return m('div',
            m('.w-container', [
                m('.u-marginbottom-20',
                    m('.fontsize-base.fontweight-semibold', I18n.t('withdraw_history_group', I18nScope()))
                ),
                m(".u-marginbottom-30.w-row",
                    _.map(mock_transfers, (transfer, index) => m(userBalanceWithdrawHistoryItemRequest, { transfer, index }))
                )
            ])
        );
    }
}

export default userBalanceWithdrawHistory;