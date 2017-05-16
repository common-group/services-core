import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import userVM from '../vms/user-vm';
import models from '../models';
import adminUserBalanceTransactionsList from './admin-user-balance-transactions-list';

const adminBalanceTransferItemDetail = {
    controller(args) {
        const userBankAccount = m.prop(undefined),
              metadata = args.item.last_transition_metadata || {transfer_data: {}},
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
                      loadingNotes(false);
                  });
              };

        if(!_.isUndefined(metaBank)) {
            if(metaBank.conta) {
                transitionBankAccount({
                    account: metaBank.conta,
                    account_digit: metaBank.conta_dv,
                    account_type: undefined,
                    agency: metaBank.agencia,
                    agency_digit: metaBank.agencia_dv,
                    bank_code: metaBank.bank_code,
                    bank_name: undefined,
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
            loadingNotes
        };
    },

    view(ctrl, args) {
        let bankAccount = (_.isUndefined(ctrl.metaBank) ? ctrl.userBankAccount() : ctrl.transitionBankAccount());

        return m('#admin-balance-transfer-item-detail-box', [
            m('.divider.u-margintop-20.u-marginbottom-20'),
            m('.w-row.card.card-terciary.u-radius',[
                m('.w-col.w-col-4', [
                    (bankAccount ? [
                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20', 'Dados bancários'),
                    m('.fontsize-smallest.lineheight-looser', [
                        m('span.fontweight-semibold', 'Banco:'),
                        `${bankAccount.bank_code} - ${(bankAccount.bank_name ? bankAccount.bank_name : '' )}`,m('br'),
                        m('span.fontweight-semibold', 'Agencia:'),
                        ` ${bankAccount.agency} - ${bankAccount.agency_digit ? bankAccount.agency_digit : ''}`,m('br'),
                        m('span.fontweight-semibold', "Conta:"),
                        ` ${bankAccount.account} - ${bankAccount.account_digit ? bankAccount.account_digit : ''}`,m('br'),
                        m('span.fontweight-semibold', 'Nome:'),
                        bankAccount.owner_name, m('br'),
                        m('span.fontweight-semibold', 'CPF:'),
                        bankAccount.owner_document
                    ])
                    ] : h.loader()),
                    (ctrl.loadingNotes() ? h.loader() : m('', [
                        m('textarea.text-field.height-mini.w-input', {
                            value: ctrl.fields.admin_notes(),
                            onkeydown: m.withAttr('value', ctrl.fields.admin_notes)
                        }),
                        m('.u-text-center',
                          m('button.btn.btn-terciary', {
                              onclick: ctrl.submitNotes
                          }, I18n.t('shared.save_text'))
                         )
                    ]))
                ]),
                m(adminUserBalanceTransactionsList, {user_id: args.item.user_id})
            ])
        ]);
    }
};

export default adminBalanceTransferItemDetail;
