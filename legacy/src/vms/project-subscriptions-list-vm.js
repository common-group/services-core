import m from 'mithril';
import { commonPayment } from '../api';
import models from '../models';

const projectSubscriptionsListVM = () => {
    // const listVM = catarse.paginationVM(models.projectContribution, 'id.desc', {
    //     Prefer: 'count=exact',
    // });

    const subscriptions = commonPayment.paginationVM(models.userSubscription, 'last_payment_data_created_at.desc', {
        Prefer: 'count=exact'
    })

    return {
        firstPage: parameters => {
            return subscriptions.firstPage(parameters).then(() => m.redraw());
        },
        nextPage: () => {
            return subscriptions.nextPage().then(() => m.redraw());
        },
        isLoading: subscriptions.isLoading,
        collection: subscriptions.collection,
        isLastPage: subscriptions.isLastPage,
        total: subscriptions.total,
    };
};

export default projectSubscriptionsListVM;