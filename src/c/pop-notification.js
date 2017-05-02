import m from 'mithril';
import h from '../h';

const popNotification = {
    controller(args) {
        const displayNotification = args.toggleOpt || h.toggleProp(true, false),
            setPopTimeout = () => {
                setTimeout(() => { displayNotification(false); m.redraw(); }, 3000);
            };
        return {
            displayNotification,
            setPopTimeout
        };
    },
    view(ctrl, args) {
        return (ctrl.displayNotification() ? m('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', {
            config: ctrl.setPopTimeout,
            class: args.error ? 'card-error' : ''
        }, [
            m('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
                onclick: ctrl.displayNotification.toggle
            }),
            m('.fontsize-small', m.trust(args.message))
        ]) : m('span'));
    }
};

export default popNotification;
