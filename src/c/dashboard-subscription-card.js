import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import I18n from 'i18n-js';
import {
    catarse
} from '../api';
import models from '../models';
import h from '../h';

const I18nScope = _.partial(h.i18nScope, 'projects.subscription_fields');

const dashboardSubscriptionCard = {
    controller(args) {
        const subscription = args.subscription,
            reward = m.prop(),
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

        if (subscription.reward_external_id) {
            const filterRewVM = catarse.filtersVM({
                    id: 'eq'
                }).id(subscription.reward_external_id),
                lRew = catarse.loaderWithToken(models.rewardDetail.getRowOptions(filterRewVM.parameters()));

            lRew.load().then((data) => {
                reward(_.first(data));
            });
        }
        const statusClass = {
            active: 'fa-circle.text-success',
            started: 'fa-circle.text-waiting',
            inactive: 'fa-circle.text-error',
            canceled: 'fa-times-circle.text-error',
            canceling: 'fa-times-circle-o.text-error',
            deleted: 'fa-circle.text-error',
            error: 'fa-circle.text-error'
        };
        const paymentClass = {
            boleto: 'fa-barcode',
            credit_card: 'fa-credit-card'
        };
        return {
            statusClass,
            reward,
            user,
            paymentClass
        };
    },
    view(ctrl, args) {
        const subscription = args.subscription,
            statusClass = ctrl.statusClass,
            paymentClass = ctrl.paymentClass;

        return m('.card', ctrl.user() ?
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
                        m(`span.fa.${paymentClass[subscription.payment_method]}`,
                            ''
                        ),
                        I18n.t(subscription.payment_method, I18nScope())
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
                    m('.fontsize-smaller',
                        subscription.paid_at ? moment(subscription.paid_at).format('DD/MM/YYYY') : ''
                    )
                ),
                m('.w-col.w-col-2.u-text-center',
                    m('.fontsize-smaller', [
                        m(`span.fa.${statusClass[subscription.status]}`,
                            ' '
                        ),
                        I18n.t(`status.${subscription.status}`, I18nScope())
                    ]),
                    subscription.status === 'started' ? m('.fontcolor-secondary.fontsize-mini.fontweight-semibold.lineheight-tightest',
                        `em ${moment(subscription.created_at).format('DD/MM/YYYY')}`
                    ) : ''
                )
            ]) : ''
        );
    }
};

export default dashboardSubscriptionCard;