import m from 'mithril';
import _ from 'underscore';

const dropdown = {
    view(ctrl, args) {
        let opts = (_.isFunction(args.options) ? args.options() : args.options);

        return m(
            `select${args.classes}[id="${args.id}"]`,
            {
                onchange: (e) => {args.valueProp(e.target.value);args.onchange()},
                value: args.valueProp()
            },
            _.map(opts, function(data) {
                return m('option[value="' + data.value + '"]', data.option);
            })
        );
    }
};

export default dropdown;
