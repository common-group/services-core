import m from 'mithril';
import _ from 'underscore';
import models from '../models';
import { commonPayment } from '../api';
import loadMoreBtn from './load-more-btn';
import dashboardSubscriptionCardDetailPaymentHistoryEntry from './dashboard-subscription-card-detail-payment-history-entry';

const dashboardSubscriptionCardDetailPaymentHistory = {
    controller: function(args)
    {
        const loadingFirstPage = m.prop(true);
        const errorOcurred = m.prop(false);

        const payments = commonPayment.paginationVM(models.commonPayments, 'created_at.desc', {
            Prefer: 'count=exact'
        });

        const paymentsFilterVM = commonPayment.filtersVM({
            subscription_id: 'eq'
        });

        paymentsFilterVM.subscription_id(args.subscription.id);

        payments.firstPage(paymentsFilterVM.parameters()).then(() => {
            loadingFirstPage(false);
        })
        .catch(() => errorOcurred(true));

        return { payments, loadingFirstPage };
    },
    view: function(ctrl, args)
    {
        const paymentsColletion = ctrl.payments.collection();

        return m("div",
            [
                m(".fontsize-small.fontweight-semibold.u-marginbottom-10", 
                    "Histórico de pagamentos"
                ),
                _.map(paymentsColletion, 
                    payment => m(dashboardSubscriptionCardDetailPaymentHistoryEntry, { payment })
                ),
                m('.u-marginbottom-30.u-margintop-30.w-row', [
                    m(loadMoreBtn, {
                        collection: ctrl.payments,
                        cssClass: '.w-col-push-4'
                    })
                ])
            ]
        );
    }
}

export default dashboardSubscriptionCardDetailPaymentHistory;