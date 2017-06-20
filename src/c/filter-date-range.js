import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const dateFieldMask = _.partial(h.mask, '99/99/9999');

const filterDateRange = {
    view(ctrl, args) {
        return m('.w-col.w-col-3.w-col-small-6', [
            m(`label.fontsize-smaller[for="${args.index}"]`, args.label),
            m('.w-row', [
                m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                    m(`input.w-input.text-field.positive[id="${args.index}"][type="text"]`, {
                        onkeyup: m.withAttr('value', _.compose(args.first, dateFieldMask)),
                        value: args.first()
                    })
                ]),
                m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
                    m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')
                ]),
                m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                    m('input.w-input.text-field.positive[type="text"]', {
                        onkeyup: m.withAttr('value', _.compose(args.last, dateFieldMask)),
                        value: args.last()
                    })
                ])
            ])
        ]);
    }
};

export default filterDateRange;
