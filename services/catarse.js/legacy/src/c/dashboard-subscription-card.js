import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import {
    catarse
} from '../api';
import models from '../models';
import dashboardSubscriptionCardDetail from './dashboard-subscription-card-detail';
import subscriptionStatusIcon from './subscription-status-icon';
import paymentMethodIcon from './payment-method-icon';
import subscriptionLastPaymentStatus from './subscription-last-payment-status';
import h from '../h';
import anonymousBadge from './anonymous-badge';

const subscriptionScope = _.partial(h.i18nScope, 'users.subscription_row');

const dashboardSubscriptionCard = {
    controller: function(args) {
        const subscription = args.subscription,
            reward = m.prop(),
            toggleDetails = h.toggleProp(false, true),
            user = m.prop();

        if (subscription.user_external_id) {
            const filterUserVM = catarse.filtersVM({
                    id: 'eq'
                }).id(subscription.user_external_id),
                lU = catarse.loaderWithToken(models.userDetail.getRowOptions(filterUserVM.parameters()));

            lU.load().then((data) => {
                user(_.first(data));
            });
        }

        if (subscription.current_reward_data && subscription.current_reward_data.external_id) {
            const filterRewVM = catarse.filtersVM({
                    id: 'eq'
                }).id(subscription.current_reward_data.external_id),
                lRew = catarse.loaderWithToken(models.rewardDetail.getRowOptions(filterRewVM.parameters()));

            lRew.load().then((data) => {
                reward(_.first(data));
            });
        }
        return {
            toggleDetails,
            reward,
            user
        };
    },
    view: function(ctrl, args) {
        const subscription = args.subscription,
            user = ctrl.user(),
            cardClass = ctrl.toggleDetails() ? '.card-detailed-open' : '';

        return m(`div${cardClass}`, [m('.card.card-clickable', {
            onclick: ctrl.toggleDetails.toggle
        }, ctrl.user() ?
                m('.w-row', [
                    m('.table-col.w-col.w-col-3',
                        m('.w-row', [
                            m('.w-col.w-col-3',
                                m(`img.u-marginbottom-10.user-avatar[src='${h.useAvatarOrDefault(ctrl.user().profile_img_thumbnail)}']`)
                            ),
                            m('.w-col.w-col-9', [
                                m('.fontsize-smaller.fontweight-semibold.lineheight-tighter',
                                    ctrl.user().name
                                ),
                                m(anonymousBadge, {
                                    isAnonymous: subscription.anonymous,
                                    text: ` ${window.I18n.t('anonymous_sub_title', subscriptionScope())}`
                                }),
                                m('.fontcolor-secondary.fontsize-smallest',
                                    subscription.user_email
                                )
                            ])
                        ])
                    ),
                    m('.table-col.w-col.w-col-2',
                        m('.fontsize-smaller',
                            _.isEmpty(ctrl.reward()) ? '' : `${ctrl.reward().description.substring(0, 20)}...`
                        )
                    ),
                    m('.table-col.w-col.w-col-1.u-text-center', [
                        m('.fontsize-smaller',
                            `R$${h.formatNumber(subscription.amount / 100, 0, 3)}`
                        ),
                        m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest', [
                            m(paymentMethodIcon, {
                                subscription
                            })
                        ])
                    ]),
                    m('.w-col.w-col-2.u-text-center', [
                        m('.fontsize-smaller',
                            `R$${h.formatNumber(subscription.total_paid / 100, 0, 3)}`
                        ),
                        m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                            `${subscription.paid_count} meses`
                        )
                    ]),
                    m('.w-col.w-col-2.u-text-center',
                        m(subscriptionLastPaymentStatus, { subscription })
                    ),
                    m('.w-col.w-col-2.u-text-center',
                        m(subscriptionStatusIcon, {
                            subscription
                        })
                    ),
                    m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary')
                ]) : ''
            ),
            ctrl.toggleDetails() ? m(dashboardSubscriptionCardDetail, {
                subscription,
                reward: ctrl.reward(),
                user
            }) : ''
        ]);
    }
};

export default dashboardSubscriptionCard;
