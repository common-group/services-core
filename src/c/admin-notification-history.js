window.c.AdminNotificationHistory = ((m, h, _, models) => {
    return {
        controller: (args) => {
            const notifications = m.prop([]),
                getNotifications = (user) => {
                    let notification = models.notification;
                    notification.getPageWithToken(m.postgrest.filtersVM({user_id: 'eq'}).user_id(user.id).parameters()).then(function(data){
                        notifications(data);
                    });
                    return notifications();
                };

            getNotifications(args.user);

            return {
                notifications: notifications
            };
        },

        view: (ctrl) => {
            return m('.w-col.w-col-4', [
                m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico de notificações'),
                ctrl.notifications().map(function(cEvent) {
                    return m('.w-row.fontsize-smallest.lineheight-looser.date-event', [
                        m('.w-col.w-col-24', [
                            m('.fontcolor-secondary',
                              'notificação: ', cEvent.template_name, ', ',
                              'criada em: ', h.momentify(cEvent.created_at, 'DD/MM/YYYY, HH:mm'), ', ',
                              'enviada em: ', h.momentify(cEvent.sent_at, 'DD/MM/YYYY, HH:mm'))
                        ]),
                    ]);
                })
            ]);
        }
    };
}(window.m, window.c.h, window._, window.c.models));
