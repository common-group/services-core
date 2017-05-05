import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminItem = {
    controller(args) {
        const displayDetailBox =  h.toggleProp(false, true),
              alertClassToggle =  h.toggleProp(false, true);

        return {
            displayDetailBox,
            alertClassToggle
        };
    },
    view(ctrl, args) {
        const item = args.item;

        if(args.listWrapper) {

            if(_.isFunction(args.listWrapper.redrawProp)) {
                args.listWrapper.redrawProp();
            }

            if( _.isFunction(args.listWrapper.isSelected) && args.listWrapper.isSelected(item.id)) {
                ctrl.alertClassToggle(true);
            }
        }

        return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', {
            class: (ctrl.alertClassToggle() ? 'card-alert' : '' )
        },[
            m.component(args.listItem, {
                item,
                listWrapper: args.listWrapper,
                alertClassToggle: ctrl.alertClassToggle,
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
