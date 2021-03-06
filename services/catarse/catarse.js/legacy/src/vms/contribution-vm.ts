import { catarse } from '../api';
import h from '../h';
import m from 'mithril';
import prop from 'mithril/stream';
import moment from 'moment';
import _ from 'underscore';
import models from '../models';
import { RewardDetails } from '../entities';

type ContributionSSRData = {
    id: number
    reward?: RewardDetails
    shipping_fee_id: number
    value: number
}

const currentContribution = prop<ContributionSSRData | null>(null);

const getUserProjectContributions = (userId, projectId, states) => {
    const vm = catarse.filtersVM({
        user_id: 'eq',
        project_id: 'eq',
        state: 'in',
    });

    vm.user_id(userId);
    vm.project_id(projectId);
    vm.state(states);

    const lProjectContributions = catarse.loaderWithToken(models.userContribution.getPageOptions(vm.parameters()));

    return lProjectContributions.load();
};

const getCurrentContribution = (): ContributionSSRData | null => {
    const root = document.getElementById('application'),
        data = root && root.getAttribute('data-contribution');

    if (data) {
        currentContribution(JSON.parse(data));
        h.redraw();
        return currentContribution();
    }
    return null;
};

const wasConfirmed = contribution => _.contains(['paid', 'pending_refund', 'refunded'], contribution.state);

const canShowReceipt = contribution => wasConfirmed(contribution);

const canShowSlip = contribution =>
    contribution.payment_method === 'BoletoBancario' &&
    moment(contribution.gateway_data.boleto_expiration_date)
        .endOf('day')
        .isAfter(moment()) &&
    contribution.state === 'pending';

const canGenerateSlip = contribution =>
    contribution.payment_method === 'BoletoBancario' &&
    (contribution.state === 'pending' || contribution.state === 'refused') &&
    contribution.project_state === 'online' &&
    !contribution.reward_sold_out &&
    !moment(contribution.gateway_data.boleto_expiration_date)
        .endOf('day')
        .isAfter(moment());

const canShowPix = contribution =>
    contribution.payment_method === 'Pix' &&
    moment(contribution.gateway_data.pix_expiration_date)
        .endOf('day')
        .isAfter(moment()) &&
    contribution.state === 'pending';

const canGeneratePix = contribution =>
    contribution.payment_method === 'Pix' &&
    (contribution.state === 'pending' || contribution.state === 'refused') &&
    contribution.project_state === 'online' &&
    !contribution.reward_sold_out &&
    !moment(contribution.gateway_data.pix_expiration_date)
        .endOf('day')
        .isAfter(moment());

const canBeDelivered = contribution => contribution.state === 'paid' && contribution.reward_id && contribution.project_state !== 'failed';

const getUserContributionsListWithFilter = () => {
    const contributions = catarse.paginationVM(models.userContribution, 'created_at.desc', { Prefer: 'count=exact' });

    return {
        firstPage: params => contributions.firstPage(params).then(() => h.redraw()),
        isLoading: contributions.isLoading,
        collection: contributions.collection,
        isLastPage: contributions.isLastPage,
        nextPage: () => contributions.nextPage().then(() => h.redraw()),
    };
};

const getUserContributedProjectsWithFilter = () => {
    const contributions = catarse.paginationVM(models.project, 'created_at.desc', { Prefer: 'count=exact' });

    return {
        firstPage: params => contributions.firstPage(params).then(() => h.redraw()),
        isLoading: contributions.isLoading,
        collection: contributions.collection,
        isLastPage: contributions.isLastPage,
        nextPage: () => contributions.nextPage().then(() => h.redraw()),
    };
};

const contributionVM = {
    getUserContributedProjectsWithFilter,
    getCurrentContribution,
    canShowReceipt,
    canGenerateSlip,
    canShowSlip,
    canGeneratePix,
    canShowPix,
    getUserProjectContributions,
    canBeDelivered,
    getUserContributionsListWithFilter,
};

export default contributionVM;
