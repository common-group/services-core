import { commonPayment } from '../api';
import m from 'mithril';
import _ from 'underscore';
import models from '../models';


const getUserProjectSubscriptions = (projectId, status) => {
    const vm = commonPayment.filtersVM({
        project_id: 'eq',
        status: 'in'
    });

    // vm.user_id(userId);
    vm.project_id(projectId);
    vm.status(status);

    const lSub = commonPayment.loaderWithToken(models.userSubscription.getRowOptions(vm.parameters()));
    return lSub.load();
};

const subscriptionVM = {
    getUserProjectSubscriptions
};

export default subscriptionVM;
