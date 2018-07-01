/**
 * window.c.AdminNotificationHistory component
 * Return notifications list from an User object.
 *
 * Example:
 * m.component(c.AdminNotificationHistory, {
 *     user: user
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import { catarse } from '../api';

const adminNotificationHistory = {
    controller(args) {
        const notifications = m.prop([]),
            getNotifications = (user) => {
                const notification = models.notification;
                notification.getPageWithToken(catarse.filtersVM({
                    user_id: 'eq',
                    sent_at: 'is.null'
                })
                .user_id(user.id)
                .sent_at(!null)
                .order({
                    sent_at: 'desc'
                })
                .parameters())
                .then(notifications);
            };

        getNotifications(args.user);

        return {
            notifications
        };
    },
    view(ctrl) {
        return m('.w-col.w-col-4', [
            m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico de notificações'),
            ctrl.notifications().map(cEvent => m('.w-row.fontsize-smallest.lineheight-looser.date-event', [
                m('.w-col.w-col-24', [
                    m('.fontcolor-secondary', h.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'),
                          ' - ', m(`a[target="blank"][href="/notifications/${cEvent.relation}/${cEvent.id}"]`, cEvent.template_name), cEvent.origin ? ` - ${cEvent.origin}` : '')
                ]),
            ]))
        ]);
    }
};

export default adminNotificationHistory;
