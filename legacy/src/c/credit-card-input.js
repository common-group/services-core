import m from 'mithril';
import prop from 'mithril/stream';
import creditCardVM from '../vms/credit-card-vm';

const creditCardInput = {
    oninit: function(vnode) {
        const cardType = vnode.attrs.type || prop('unknown');
      // TODO: move all input logic to vdom paradigm
      // CreditCard Input still handle events on a dom-based model.
        const setCreditCardHandlers = (el, isInitialized) => {
            if (!isInitialized) {
                creditCardVM.setEvents(el, cardType, vnode.attrs.value);
            }
        };

        vnode.state = {
            setCreditCardHandlers,
            cardType
        };
    },
    view: function({state, attrs}) {
        return m(`input.w-input.text-field[name="${attrs.name}"][required="required"][type="tel"]`, {
            onfocus: attrs.onfocus,
            class: attrs.class,
            config: state.setCreditCardHandlers,
            onblur: attrs.onblur
        });
    }
};

export default creditCardInput;
