import m from 'mithril';
import _ from 'underscore';
import {
    commonPayment,
    commonProject
} from '../api';
import h from '../h';
import models from '../models';

const adminSubscriptionDetail = {
    controller(args) {
        let l, rL;
        const loadReward = () => {
            const rewardFilterVM = commonProject.filtersVM({
                id: 'eq'
            });
            rewardFilterVM.id(args.item.reward_id);
            rL = commonProject.loaderWithToken(models.projectReward.getRowOptions(rewardFilterVM.parameters()));
            const reward = m.prop({});
            rL.load().then((data) => {
                reward(_.first(data));
            });

            return reward;
        };

        const loadPayments = () => {
            const model = models.commonPayments,
                filterVM = commonPayment.filtersVM({
                    subscription_id: 'eq'
                });

            filterVM.subscription_id(args.key);
            const opts = model.getRowOptions(filterVM.parameters()),
                payments = m.prop([]);

            l = commonPayment.loaderWithToken(opts);

            l.load().then((data) => {
                payments(data);
            });


            return payments;
        };

        return {
            payments: loadPayments(),
            reward: loadReward(),
            l
        };
    },
    view(ctrl, args) {
        const payments = ctrl.payments(),
              reward = ctrl.reward(),
              currentPayment = m.prop(_.first(payments) || {});

        return m('.card.card-terciary.w-row', payments ? [
            m('.w-col.w-col-4',
                m('div', [
                    m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20',
                        'Histórico da transação'
                    ),
                    _.map(payments, (payment, i) => {
                        const selected = m.prop(i === 0);
                        return m(`.fontsize-smallest.lineheight-looser.w-row${selected() ? '.fontweight-semibold' : ''}`, [
                            m('.w-col.w-col-6',
                                m('div',
                                    h.momentify(payment.created_at, 'DD/MM/YYYY hh:mm')
                                )
                            ),
                            m('.w-col.w-col-6',
                                m(`span.${selected() ? 'link-hidden-dark' : 'alt-link'}`, {
                                        onclick: () => {
                                            selected(true);
                                            currentPayment(payment);
                                        }
                                    },
                                    payment.status
                                ))
                        ]);

                    })
                ])),
            m('.w-col.w-col-4',
                m('div', [
                    m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20',
                        'Detalhes do apoio mensal'
                    ),
                    m('.fontsize-smallest.lineheight-loose', [
                        `Início: ${ h.momentify(currentPayment().created_at, 'DD/MM/YYYY hh:mm') }`,
                        m('br'),
                        `Confirmação: ${ h.momentify(currentPayment().paid_at, 'DD/MM/YYYY hh:mm') }`,
                        m('br'),
                        `Valor: R$${currentPayment().amount/100}`,
                        m('br'),
                        // 'Taxa: R$3,35',
                        // m('br'),
                        !_.isEmpty(reward) ? `Recompensa: R$${reward.data.minimum_value / 100} - ${reward.data.title} - ${reward.data.description.substring(0, 90)}(...)` : 'Sem recompensa',
                        // m('br'),
                        // 'Anônimo: Não',
                        m('br'),
                        `Id pagamento: ${currentPayment().id}`,
                        m('br'),
                        'Apoio:',
                        m.trust('&nbsp;'),
                        currentPayment().subscription_id,
                        // m('br'),
                        // 'Chave:',
                        // m.trust('&nbsp;'),
                        // m('br'),
                        // '7809d09d-6325-442e-876e-b9a0846c526f',
                        // m('br'),
                        // 'Meio: Pagarme',
                        // m('br'),
                        // `Operadora: STONE`,
                        m('br'),
                        currentPayment().payment_method === 'credit_card' ? [
                            'Cartão ',
                            m.trust('&nbsp;'),
                            `${currentPayment().payment_method_details.first_digits}******${currentPayment().payment_method_details.last_digits}`,
                            m.trust('&nbsp;'),
                            m.trust('&nbsp;'),
                            currentPayment().payment_method_details.brand
                        ] : 'Boleto'
                    ])
                ])
            ),
            m('.w-col.w-col-4')
        ] : '');
    }
};

export default adminSubscriptionDetail;
