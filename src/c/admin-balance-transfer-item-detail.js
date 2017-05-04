import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import userVM from '../vms/user-vm';
import models from '../models';

const adminBalanceTransferItemDetail = {
    controller(args) {
        const userBankAccount = m.prop(undefined),
              metadata = args.item.last_transition_metadata || {},
              metaBank = metadata.bank_account,
              userBalance = m.prop({}),
              transitionBankAccount = m.prop({}),
              transactionsListVM = postgrest.paginationVM(
                  models.balanceTransaction,
                  'created_at.desc',
                  { Prefer: 'count=exact'}
              );

        models.balanceTransaction.pageSize(2);
        userVM.getUserBalance(args.item.user_id).then(_.compose(userBalance, _.first));

        if(!_.isUndefined(metaBank)) {
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
        }

        userVM.getUserBankAccount(args.item.user_id).then(_.compose(userBankAccount, _.first));
        transactionsListVM.firstPage({user_id: `eq.${args.item.user_id}`});

        return {
            metaBank,
            userBankAccount,
            transitionBankAccount,
            transactionsListVM,
            userBalance
        };
    },

    view(ctrl, args) {
        let bankAccount = (_.isUndefined(ctrl.metaBank) ? ctrl.userBankAccount() : ctrl.transitionBankAccount()),
            collection = ctrl.transactionsListVM.collection(),
            userBalance = ctrl.userBalance();

        return m('#admin-balance-transfer-item-detail-box', [
            m('.divider.u-margintop-20.u-marginbottom-20'),
            m('.w-row.card.card-terciary.u-radius',[
                m('.w-col.w-col-4', (bankAccount ? [
                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20', 'Dados bancários'),
                    m('.fontsize-smallest.lineheight-looser', [
                        m('span.fontweight-semibold', 'Banco:'),
                        `${bankAccount.bank_code} ${(bankAccount.bank_name ? '- ' + bankAccount.bank_name : '' )}`,m('br'),
                        m('span.fontweight-semibold', 'Agencia:'),
                        ` ${bankAccount.agency} - ${bankAccount.agency_digit}`,m('br'),
                        m('span.fontweight-semibold', "Conta:"),
                        ` ${bankAccount.account} - ${bankAccount.account_digit}`,m('br'),
                        m('span.fontweight-semibold', 'Nome:'),
                        bankAccount.owner_name, m('br'),
                        m('span.fontweight-semibold', 'CPF:'),
                        bankAccount.owner_document
                    ])
                ] : h.loader())),
                m('.w-col.w-col-8', [
                    m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20', `Extrato ( saldo em conta: R$ ${userBalance.amount} )`),
                    _.map(collection, (item, intex) => {
                        return m('.divider.fontsize-smallest.lineheight-looser', [
                            m('.w-row.fontweight-semibold', [
                                m('.w-col.w-col-2', [
                                    m('.fontcolor-secondary', h.momentify(item.created_at))
                                ]),
                                m('.w-col.w-col-6', [
                                    'Saldo do dia ',
                                ]),
                                m('.w-col.w-col-2', m.trust('&nbsp;')),
                                m('.w-col.w-col-2', [
                                    m('span', `R$ ${h.formatNumber(item.total_amount, 2, 3)}`)
                                ]),
                            ]),
                            m('.w-row', [
                                _.map(item.source, (source, index) => {
                                    let negativeV = source.amount < 0;
                                    return m('.divider.fontsize-smallest.lineheight-looser.w-row', [
                                        m('.w-col.w-col-2', [
                                        ]),
                                        m('.w-col.w-col-6', [
                                            m('', source.event_name)
                                        ]),
                                        m('.w-col.w-col-2', [
                                            m((negativeV ? '.text-error' : '.text-success'), `${negativeV ? '-' : '+'} R$ ${h.formatNumber(Math.abs(source.amount), 2, 3)}`)
                                        ]),
                                    ]);
                                })
                            ])
                        ]);
                    }),
                    m('.w-row', [
                        m('.w-col.w-col-3.w-col-push-4', [
                            ctrl.transactionsListVM.isLoading() ?
                                h.loader() :
                                m('button#load-more.btn.btn-medium.btn-terciary.fontsize-smallest', {
                                    onclick: ctrl.transactionsListVM.nextPage
                                }, 'Carregar mais')
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default adminBalanceTransferItemDetail;
