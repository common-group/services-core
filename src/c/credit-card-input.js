import m from 'mithril';
import creditCardVM from '../vms/credit-card-vm';

const creditCardInput = {
  controller (args) {
      const cardType = args.type || m.prop('unknown');
      const setCreditCardHandlers = (el, isInitialized) => {
          if (!isInitialized) {
              creditCardVM.setEvents(el, cardType);
          }
      };

      const validate = () => {
          return creditCardVM.validateCardNumber(args.value());
      };

      return {
          setCreditCardHandlers: setCreditCardHandlers,
          validate: validate,
          cardType: cardType
      }
  },
  view (ctrl, args) {
      return m(`input.w-input.text-field[name="${args.name}"][required="required"][type="phone"]`, {
          onfocus: args.onfocus,
          class: args.class,
          config: ctrl.setCreditCardHandlers,
          onchange: m.withAttr('value', args.value),
          onblur: ctrl.validate,
          value: args.value()
      })
  }
};

export default creditCardInput;
