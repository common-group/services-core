import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const filterDateField = {
    oninit: function(vnode) {
        return {
            dateFieldMask: _.partial(h.mask, '99/99/9999')
        };
    },
    view: function({state, attrs}) {
        return m('.w-col.w-col-3.w-col-small-6', [
            m(`label.fontsize-smaller[for="${args.index}"]`, args.label),
            m(`input.w-input.text-field.positive[id="${args.index}"][type="text"]`, {
                onkeydown: m.withAttr('value', _.compose(args.vm, ctrl.dateFieldMask)),
                value: args.vm()
            })
        ]);
    }
};

export default filterDateField;
