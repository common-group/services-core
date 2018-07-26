import { commonPayment } from '../api';
import _ from 'underscore';
import m from 'mithril';
import models from '../models';
import h from '../h';

const subscriptions = m.prop([]),
    vm = commonPayment.filtersVM({
        project_id: 'eq'
    });

const subscriptionsLoader = (uuID) => {
    vm.project_id(uuID);
    vm.order({
        created_at: 'desc'
    });

    return commonPayment.loaderWithToken(models.userSubscription.getPageOptions(vm.parameters()));
};

const fetchSubscriptions = uuID => subscriptionsLoader(uuID).load().then(subscriptions);

const projectSubscriptionsVM = {
    subscriptions,
    fetchSubscriptions,
    subscriptionsLoader
};

export default projectSubscriptionsVM;
