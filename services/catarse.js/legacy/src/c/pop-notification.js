import m from 'mithril';
import h from '../h';

const popNotification = {
    oninit: function(vnode) {
        const displayNotification = vnode.attrs.toggleOpt || h.toggleProp(true, false),
            setPopTimeout = () => {
                setTimeout(() => { displayNotification(false); m.redraw(); }, 3000);
            };
        vnode.state = {
            displayNotification,
            setPopTimeout
        };
    },
    view: function({state, attrs}) {
        return (state.displayNotification() ? m('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', {
            config: state.setPopTimeout,
            class: attrs.error ? 'card-error' : ''
        }, [
            m('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
                onclick: state.displayNotification.toggle
            }),
            m('.fontsize-small', m.trust(attrs.message))
        ]) : m('span'));
    }
};

export default popNotification;
