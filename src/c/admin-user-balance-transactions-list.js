import m from 'mithril';
import _ from 'underscore';
import models from '../models';
import userVM from '../vms/user-vm';
import h from '../h';
import postgrest from 'mithril-postgrest';

const adminUserBalanceTransactionsList = {
    controller(args) {
        const userBalance = m.prop({}),
              transactionsListVM = postgrest.paginationVM(
                  models.balanceTransaction,
                  'created_at.desc',
                  { Prefer: 'count=exact'}
              );

        models.balanceTransaction.pageSize(2);
        userVM.getUserBalance(args.user_id).then(_.compose(userBalance, _.first));
        transactionsListVM.firstPage({user_id: `eq.${args.user_id}`});

        return {
            userBalance,
            transactionsListVM
        };
    },
    view(ctrl, args) {
        const collection = ctrl.transactionsListVM.collection(),
              userBalance = ctrl.userBalance() || {amount: 0};

        return m(args.wrapperClass || '.w-col.w-col-8', [
            m('.fontsize-smaller.fontweight-semibold.lineheight-tighter.u-marginbottom-20', `Extrato ( saldo em conta: R$ ${h.formatNumber(userBalance.amount, 2, 3)} )`),
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
        ]);
    }
};

export default adminUserBalanceTransactionsList;
