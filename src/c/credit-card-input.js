import m from 'mithril';
import creditCardVM from '../vms/credit-card-vm';

const creditCardInput = {
    controller(args) {
        const cardType = args.type || m.prop('unknown');
      // TODO: move all input logic to vdom paradigm
      // CreditCard Input still handle events on a dom-based model.
        const setCreditCardHandlers = (el, isInitialized) => {
            if (!isInitialized) {
                creditCardVM.setEvents(el, cardType, args.value);
            }
        };

        return {
            setCreditCardHandlers,
            cardType
        };
    },
    view(ctrl, args) {
        return m(`input.w-input.text-field[name="${args.name}"][required="required"][type="tel"]`, {
            onfocus: args.onfocus,
            class: args.class,
            config: ctrl.setCreditCardHandlers,
            onblur: args.onblur
        });
    }
};

export default creditCardInput;
