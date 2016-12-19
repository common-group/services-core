import postgrest from 'mithril-postgrest';
import models from '../models';
import _ from 'underscore';

const currentContribution = m.prop({});

const getUserProjectContributions = (user_id, project_id, states) => {
    const vm = postgrest.filtersVM({
        user_id: 'eq',
        project_id: 'eq',
        state: 'in'
    });

    vm.user_id(user_id);
    vm.project_id(project_id);
    vm.state(states);

    const lProjectContributions = postgrest.loaderWithToken(models.userContribution.getPageOptions(vm.parameters()));

    return lProjectContributions.load();
};

const getCurrentContribution = () => {
    const root = document.getElementById('application'),
          data = root && root.getAttribute('data-contribution');

    if (data) {
        currentContribution(JSON.parse(data));

        m.redraw(true);

        return currentContribution;
    } else {
        return false;
    }
};

const wasConfirmed = (contribution) => {
    return _.contains(['paid', 'pending_refund', 'refunded'], contribution.state);
};

const canShowReceipt = (contribution) => {
    return wasConfirmed(contribution);
};

const canShowSlip = (contribution) => {
    return contribution.payment_method == 'BoletoBancario' && contribution.waiting_payment;
};

const canGenerateSlip = (contribution) => {
  return contribution.payment_method == 'BoletoBancario' &&
    contribution.state == 'pending' &&
    contribution.project_state == 'online' &&
    !contribution.reward_sold_out &&
    !contribution.waiting_payment;
};

const contributionVM =  {
    getCurrentContribution: getCurrentContribution,
    canShowReceipt: canShowReceipt,
    canGenerateSlip: canGenerateSlip,
    canShowSlip: canShowSlip,
    getUserProjectContributions: getUserProjectContributions
};

export default contributionVM;
