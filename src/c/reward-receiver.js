import m from 'mithril';
import userVM from '../vms/user-vm';

const rewardReceiver = {
    controller() {
        const toggleDelivery = (projectId, contribution) => {
                userVM.toggleDelivery(projectId, contribution).then(() => {
                    const lastStatus = contribution.reward_sent_at ? 'delivered' : 'undelivered';
                    contribution.delivery_status = contribution.delivery_status == 'received' ? lastStatus : 'received'; // so we don't have to reload the page
                });
            },
            canReceiveReward = contribution => (contribution.state === 'paid' && contribution.reward_id && contribution.project_state !== 'failed');

        return {
            toggleDelivery,
            canReceiveReward
        };
    },
    view(ctrl, args) {
        const contribution = args.contribution;

        return ctrl.canReceiveReward(contribution) ?
            m('.u-text-center.w-col.w-col-1', {
                onclick: () => ctrl.toggleDelivery(contribution.project_id, contribution)
            }, [
                m('.fontsize-smallest',
                    m(`a.checkbox-big${contribution.delivery_status === 'received' ? '.checkbox--selected.fa.fa-check.fa-lg' : ''}`,
                        ''
                    )
                ),
                m('.fontcolor-secondary.fontsize-smallest.lineheight-looser',
                    'Recebi!'
                )
            ]) : m('');
    }
};

export default rewardReceiver;
