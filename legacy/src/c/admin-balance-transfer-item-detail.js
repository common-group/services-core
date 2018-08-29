import m from 'mithril';
import _ from 'underscore';
import { catarse } from '../api';
import h from '../h';
import userVM from '../vms/user-vm';
import models from '../models';
import adminUserBalanceTransactionsList from './admin-user-balance-transactions-list';
import popNotification from './pop-notification';

const I18nScope = _.partial(h.i18nScope, 'admin.balance_transfers');
const I18nBankAccount = _.partial(h.i18nScope, 'users.balance.bank');

const adminBalanceTransferItemDetail = {
    controller: function(args) {
        const userBankAccount = m.prop(null),
            showPopNotification = m.prop(false),
            popNotificationAttributes = m.prop({}),
            metadata = args.item.last_transition_metadata || { transfer_data: {} },
            transferData = metadata.transfer_data || {},
            metaBank = transferData.bank_account,
            userBalance = m.prop({}),
            transitionBankAccount = m.prop({}),
            fields = {
                admin_notes: m.prop(args.item.admin_notes)
            },
            loadingNotes = m.prop(false),
            submitNotes = () => {
                loadingNotes(true);
                m.request({
                    method: 'PUT',
                    url: `/admin/balance_transfers/${args.item.id}`,
                    data: {
                        balance_transfer: {
                            admin_notes: fields.admin_notes()
                        }
                    },
                    config: h.setCsrfToken
                }).then((data) => {
                    showPopNotification(true);
                    popNotificationAttributes({
                        message: window.I18n.t('admin_notes.success_update', I18nScope()),
                        toggleOpt: showPopNotification
                    });
                    loadingNotes(false);
                }, (err) => {
                    showPopNotification(true);
                    popNotificationAttributes({
                        message: window.I18n.t('admin_notes.failed_update', I18nScope()),
                        error: true,
                        toggleOpt: showPopNotification
                    });
                    loadingNotes(false);
                });
            };

        if (!_.isUndefined(metaBank)) {
            if (metaBank.conta) {
                transitionBankAccount({
                    account: metaBank.conta,
                    account_digit: metaBank.conta_dv,
                    account_type: metaBank.type,
                    agency: metaBank.agencia,
                    agency_digit: metaBank.agencia_dv,
                    bank_code: metaBank.bank_code,
                    bank_name: null,
                    owner_document: metaBank.document_number,
                    owner_name: metaBank.legal_name
                });
            } else {
                transitionBankAccount(metaBank);
            }
        }

        userVM.getUserBankAccount(args.item.user_id).then(_.compose(userBankAccount, _.first));

        return {
            metaBank,
            userBankAccount,
            transitionBankAccount,
            userBalance,
            fields,
            submitNotes,
            loadingNotes,
            showPopNotification,
            popNotificationAttributes
        };
    },

    view: function(ctrl, args) {
        const bankAccount = (_.isUndefined(ctrl.metaBank) ? ctrl.userBankAccount() : ctrl.transitionBankAccount());

        return m('#admin-balance-transfer-item-detail-box', [
            m('.divider.u-margintop-20.u-marginbottom-20'),
            m('.w-row.card.card-terciary.u-radius', [
                m('.w-col.w-col-4', [
                    (bankAccount ? [
                        m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20', 'Dados bancários'),
                        m('.fontsize-smallest.lineheight-looser', [
                            m('span.fontweight-semibold', I18n.t('bank_name', I18nBankAccount())),
                                ` ${bankAccount.bank_code} - ${(bankAccount.bank_name ? bankAccount.bank_name : '')}`, m('br'),

                            m('span.fontweight-semibold', I18n.t('agency', I18nBankAccount())),
                                ` ${bankAccount.agency} - ${bankAccount.agency_digit ? bankAccount.agency_digit : ''}`, m('br'),

                            m('span.fontweight-semibold', I18n.t('account', I18nBankAccount())),
                                ` ${bankAccount.account} - ${bankAccount.account_digit ? bankAccount.account_digit : ''}`, m('br'),

                            m('span.fontweight-semibold', I18n.t('account_type_name', I18nBankAccount())),
                                ` ${I18n.t(`account_type.${bankAccount.account_type}`, I18nBankAccount())} `, m('br'),
                            
                            m('span.fontweight-semibold', I18n.t('name', I18nBankAccount())),
                                ` ${bankAccount.owner_name}`, m('br'),
                            
                            m('span.fontweight-semibold', 'CPF:'),
                                ` ${bankAccount.owner_document}`
                        ])
                    ] : h.loader()),
                    (ctrl.loadingNotes() ? h.loader() : m('', [
                        m('textarea.text-field.height-mini.w-input', {
                            value: ctrl.fields.admin_notes(),
                            onkeyup: m.withAttr('value', ctrl.fields.admin_notes)
                        }),
                        m('.u-text-center',
                            m('button.btn.btn-terciary', {
                                onclick: ctrl.submitNotes
                            }, window.I18n.t('shared.save_text'))
                        ),
                        (ctrl.showPopNotification() ? m(popNotification, ctrl.popNotificationAttributes()) : '')

                    ]))
                ]),
                m(adminUserBalanceTransactionsList, { user_id: args.item.user_id })
            ])
        ]);
    }
};

export default adminBalanceTransferItemDetail;
