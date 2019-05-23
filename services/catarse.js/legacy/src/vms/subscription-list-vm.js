import m from 'mithril';
import { commonPayment,  } from '../api';
import models from '../models';

export default commonPayment.paginationVM(models.userSubscription, 'id.desc', { Prefer: 'count=exact' });

export const getUserPrivateSubscriptionsListVM = userCommonId => {
    models.userSubscription.pageSize(9);
    const contextSubVM = commonPayment.filtersVM({
        user_id: 'eq',
        status: 'in'
    });
    contextSubVM.user_id(userCommonId).status(['started', 'active', 'inactive', 'canceled', 'canceling', 'error']).order({
        created_at: 'desc'
    });

    const subscriptions = commonPayment.paginationVM(models.userSubscription, 'created_at.desc', { Prefer: 'count=exact' });
    
    subscriptions
        .firstPage(contextSubVM.parameters())
        .then(() => m.redraw());

    return {
        isLoading: subscriptions.isLoading,
        collection: subscriptions.collection,
        isLastPage: subscriptions.isLastPage,
        nextPage: () => subscriptions.nextPage().then(() => m.redraw())
    }
}