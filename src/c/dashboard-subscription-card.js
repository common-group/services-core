import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import I18n from 'i18n-js';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.subscription_fields');

const dashboardSubscriptionCard = {
    controller(args) {
        const statusClass = {
            active: 'fa-circle.text-success',
            started: 'fa-circle.text-waiting',
            inactive: 'fa-circle.text-error',
            canceled: 'fa-times-circle.text-error',
            deleted: 'fa-circle.text-error',
            error: 'fa-circle.text-error'
        };
        const paymentClass = {
            boleto: 'fa-barcode',
            credit_card: 'fa-credit-card'
        };
        return {
            statusClass,
            paymentClass
        };
    },
    view(ctrl, args) {
        const subscription = args.subscription,
            statusClass = ctrl.statusClass,
            paymentClass = ctrl.paymentClass;

        return m('.card',
            m('.w-row', [
                m('.table-col.w-col.w-col-3',
                    m('.w-row', [
                        m('.w-col.w-col-3',
                            m("img.u-marginbottom-10.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/5991cfb722e8860001b12d51/5991cfb722e8860001b12e29_humberto-avatar.JPG']")
                        ),
                        m('.w-col.w-col-9', [
                            m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                subscription.checkout_data.customer.name
                            ),
                            m('.fontcolor-secondary.fontsize-smallest',
                                subscription.checkout_data.customer.email
                            )
                        ])
                    ])
                ),
                m('.table-col.w-col.w-col-3',
                    m('.fontsize-smaller',
                        'R$10: Acesso a alguma coisa e...'
                    )
                ),
                m('.table-col.w-col.w-col-1', [
                    m('.fontsize-smaller',
                        `R$${h.formatNumber(subscription.amount / 100, 0, 3)}`
                    ),
                    m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                        m(`span.fa.${paymentClass[subscription.checkout_data.payment_method]}`,
                            ''
                        ),
                        I18n.t(subscription.checkout_data.payment_method, I18nScope())
                    ])
                ]),
                m('.w-col.w-col-1', [
                    m('.fontsize-smaller',
                        `R$${h.formatNumber(subscription.total_paid / 100, 0, 3)}`
                    ),
                    m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                        `${subscription.paid_count} meses`
                    )
                ]),
                m('.w-col.w-col-2',
                    m('.fontsize-smaller',
                        subscription.paid_at ? moment(subscription.paid_at).format('DD/MM/YYYY') : ''
                    )
                ),
                m('.w-col.w-col-2',
                    m('.fontsize-smaller', [
                        m(`span.fa.${statusClass[subscription.status]}`,
                            ' '
                        ),
                        I18n.t(`status.${subscription.status}`, I18nScope())
                    ]),
                    subscription.status === 'started' ? m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                        `em ${moment(subscription.created_at).format('DD/MM/YYYY')}`
                    ) : ''
                )
            ])
        );
    }
};

export default dashboardSubscriptionCard;
