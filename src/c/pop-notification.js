window.c.PopNotification = ((m, h) => {
    return {
        controller: () => {
            let displayNotification = h.toggleProp(true, false);

            return {
                displayNotification: displayNotification
            };
        },
        view: (ctrl, args) => {
            return (ctrl.displayNotification() ? m('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', [
                m('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
                    onclick: ctrl.displayNotification.toggle
                }),
                m('.fontsize-small', args.message)
            ]) : m('span'));
        }
    };
}(window.m, window.c.h));
