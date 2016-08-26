import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import paymentStatus from './payment-status';

const userContributionDetail = {
    controller(args) {
        const contribution = args.contribution,
            rewardDetails = args.rewardDetails,
            chosenReward = _.findWhere(rewardDetails(), {id: contribution.reward_id});

        return {
            contribution: contribution,
            chosenReward: chosenReward
        }
    },
    view(ctrl, args) {
        const contribution = args.contribution;

        return m('.user-contribution-detail', [
            m('.w-col.w-col-4',
                [
                    m('.fontsize-smallest.lineheight-tight.fontweight-semibold.u-marginbottom-10',
                      'Valor do apoio:'
                    ),
                    m('.fontsize-large',
                      `R$${contribution.value}`
                    )
                ]
            ),
            m('.w-col.w-col-4',
                m.component(paymentStatus, {item: contribution})
            ),
            m('.w-col.w-col-4',
                [
                    m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                      'Recompensa:'
                    ),
                    m('.fontsize-smallest.lineheight-tight.u-marginbottom-20',
                      ctrl.chosenReward.description
                    ),
                    m('.fontsize-smallest.lineheight-looser',
                      [
                          m('span.fontweight-semibold',
                              'Estimativa de entrega: '
                          ),
                          h.momentify(ctrl.chosenReward.deliver_at, 'MMM/YYYY')
                      ]
                    )
                ]
            )
        ]);
    }
};

export default userContributionDetail;
