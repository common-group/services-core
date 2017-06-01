import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminItem = {
    controller(args) {
        return {
            displayDetailBox: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const item = args.item,
              listWrapper = args.listWrapper || {},
              selectedItem = (_.isFunction(listWrapper.isSelected) ?
                              listWrapper.isSelected(item.id) : false);


        return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', {
            class: (selectedItem ? 'card-alert' : '')
        },[
            m.component(args.listItem, {
                item,
                listWrapper: args.listWrapper,
                key: args.key
            }),
            m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {
                onclick: ctrl.displayDetailBox.toggle
            }),
            ctrl.displayDetailBox() ? m.component(args.listDetail, {
                item,
                key: args.key
            }) : ''
        ]);
    }
};

export default adminItem;
