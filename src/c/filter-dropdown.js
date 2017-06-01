import m from 'mithril';
import dropdown from './dropdown';

const filterDropdown = {
    view(ctrl, args) {
        const wrapper_c = args.wrapper_class || '.w-col.w-col-3.w-col-small-6';
        return m(wrapper_c, [
            m(`label.fontsize-smaller[for="${args.index}"]`,
              (args.custom_label ? m.component(args.custom_label[0], args.custom_label[1]) : args.label)),
            m.component(dropdown, {
                id: args.index,
                onchange: _.isFunction(args.onchange) ? args.onchange : Function.prototype,
                classes: '.w-select.text-field.positive',
                valueProp: args.vm,
                options: args.options
            })
        ]);
    }
};

export default filterDropdown;
