import m from 'mithril';
import _ from 'underscore';
import {
    commonPayment,
    commonProject,
    commonNotification
} from '../api';
import h from '../h';
import models from '../models';

const adminSubscriptionDetail = {
    controller(args) {
        let l,
            rL;
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

        const filterVM = commonPayment.filtersVM({
            subscription_id: 'eq'
        });
        filterVM.subscription_id(args.key);
        const currentPayment = m.prop({});

        const loadNotifications = () => {
            const notifications = m.prop([]);
            const notificationFilterVM = commonNotification.filtersVM({
                user_id: 'eq',
                project_id: 'eq'
            });
            notificationFilterVM.user_id(args.item.user_id);
            notificationFilterVM.project_id(args.item.project_id);

            const lNotifications = commonNotification.loaderWithToken(
                models.userNotification.getPageOptions(notificationFilterVM.parameters()));

            lNotifications.load().then(notifications);

            return notifications;
        };

        const loadTransitions = () => {
            const transitions = m.prop([]);

            const lPaymentTransitions = commonPayment.loaderWithToken(
                models.subscriptionTransition.getPageOptions(filterVM.parameters()));

            lPaymentTransitions.load().then(transitions);

            return transitions;
        };

        const loadPayments = () => {
            const payments = m.prop([]);

            models.commonPayments.pageSize(false);
            const lUserPayments = commonPayment.loaderWithToken(
                models.commonPayments.getPageOptions(filterVM.parameters()));

            lUserPayments.load().then((data) => {
                currentPayment(_.first(data));
                _.map(data, (payment, i) => {
                    _.extend(payment, {
                        selected: m.prop(i === 0)
                    });
                });
                payments(data);
            });

            return payments;
        };

        const clearSelected = (payments) => {
            _.map(payments, (payment) => {
                payment.selected(false);
            });
        };

        return {
            payments: loadPayments(),
            transitions: loadTransitions(),
            notifications: loadNotifications(),
            currentPayment,
            clearSelected,
            reward: loadReward(),
            l
        };
    },
    view(ctrl, args) {
        const payments = ctrl.payments(),
            transitions = ctrl.transitions(),
            notifications = ctrl.notifications(),
            reward = ctrl.reward(),
            currentPayment = ctrl.currentPayment;

        return m('.card.card-terciary.w-row', payments ? [
            m('.w-col.w-col-4',
                m('div', [
                    m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20',
                      'Histórico da transação'
                     ),
                    _.map(transitions, transition => m('.fontsize-smallest.lineheight-looser.w-row', [
                        m('.w-col.w-col-6',
                                m('div',
                                    h.momentify(transition.created_at, 'DD/MM/YYYY hh:mm')
                                )
                            ),
                        m('.w-col.w-col-6',
                                m('span',
                                    `${transition.from_status} -> ${transition.to_status}`
                                ))
                    ])),
                    m('.divider'),
                    _.map(payments, (payment, i) => m(`.fontsize-smallest.lineheight-looser.w-row${payment.selected() ? '.fontweight-semibold' : ''}`, [
                        m('.w-col.w-col-6',
                                m('div',
                                    h.momentify(payment.created_at, 'DD/MM/YYYY hh:mm')
                                )
                            ),
                        m('.w-col.w-col-6',
                                m(`span.${payment.selected() ? 'link-hidden-dark' : 'alt-link'}`, {
                                    onclick: () => {
                                        ctrl.clearSelected(payments);
                                        payment.selected(true);
                                        currentPayment(payment);
                                    }
                                },
                                    payment.status
                                ))
                    ])),
                    m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20.u-margintop-20',
                      'Notificações'
                     ),
                    _.map(notifications, notification => m('.fontsize-smallest.lineheight-looser.w-row', [
                        m('.w-col.w-col-6',
                              m('div',
                                h.momentify(notification.created_at, 'DD/MM/YYYY hh:mm')
                               )
                             ),
                        m('.w-col.w-col-6',
                              m('span',
                                notification.label
                               ))
                    ])),
                ])),
            m('.w-col.w-col-4',
                m('div', [
                    m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20',
                        'Detalhes do apoio mensal'
                    ),
                    m('.fontsize-smallest.lineheight-loose', currentPayment() ? [
                        `Início: ${h.momentify(currentPayment().created_at, 'DD/MM/YYYY hh:mm')}`,
                        m('br'),
                        `Confirmação: ${h.momentify(currentPayment().paid_at, 'DD/MM/YYYY hh:mm')}`,
                        m('br'),
                        `Valor: R$${currentPayment().amount / 100}`,
                        m('br'),
                        // 'Taxa: R$3,35',
                        // m('br'),
                        !_.isEmpty(reward) ? `Recompensa: R$${reward.data.minimum_value / 100} - ${reward.data.title} - ${reward.data.description.substring(0, 90)}(...)` : 'Sem recompensa',
                        // m('br'),
                        // 'Anônimo: Não',
                        m('br'),
                        `Id pagamento: ${currentPayment().id}`,
                        m('br'),
                        `Id gateway: ${currentPayment().gateway_id}`,
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
                    ] : '')
                ])
            ),
            m('.w-col.w-col-4')
        ] : '');
    }
};

export default adminSubscriptionDetail;
