import m from 'mithril';
import _ from 'underscore';

const dropdown = {
    view (ctrl, args) {
        return m(
            `select${args.classes}[id="${args.id}"]`,
            {
                onchange: m.withAttr('value', args.valueProp),
                value: args.valueProp()
            },
            _.map(args.options, function(data) {
                return m('option[value="' + data.value + '"]', data.option);
            })
        );
    }
};

export default dropdown;
