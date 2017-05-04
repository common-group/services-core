import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';

const adminBalanceTransferItem = {
    controller(args) {
        const user = m.prop();

        userVM.fetchUser(args.item.user_id, true, user);

        return {
            user
        };
    },
    view(ctrl, args) {
        let user = ctrl.user(),
            item = args.item;
        return m('.w-row', [
            m('.w-col.w-col-1.w-col-tiny-1', [
                m('.w-checkbox.w-clearfix', [
                    m('input.w-checkbox-input[type=\'checkbox\']', {
                        disabled: (item.state != 'pending'),
                        checked: args.listWrapper.isSelected(item.id),
                        onchange: (event) => {
                            if(event.currentTarget.checked) {
                                args.listWrapper.selectItem(_.extend({}, item, {user: user}));
                            } else {
                                args.listWrapper.unSelectItem(_.extend({}, item, {user: user}));
                            }
                            args.alertClassToggle.toggle();
                        }
                    })
                ]),
            ]),
            m('.w-col.w-col-3', 
              (user ? [
                  m('.fontsize-smaller.fontweight-semibold.lineheight-tighter', [
                      `${user.name}`,
                      m('span.fontcolor-secondary.fontsize-smallest',
                        `(${user.public_name})`),
                  ]),
                  m('.fontcolor-secondary.fontsize-smallest',
                    user.email),
                  m('.fontcolor-secondary.fontsize-smallest',
                   `USER_ID: ${user.id}`)
              ] : h.loader() )
             ),
            m('.w-col.w-col-2', [
                m('span.fontsize-small', `R$ ${h.formatNumber(item.amount, 2, 3)}`)
            ]),
            m('.w-col.w-col-2.w-hidden-small.w-hidden-tiny', [
                m('', [
                    m('span.badge.card-error', item.state)
                ])
            ]),
            m('.w-col.w-col-2', [
                m('.fontsize-smallest', [
                    'Solicitado em: ',
                    m('span.fontsize-small.lineheight-tightest', h.momentify(item.created_at)),
                ])
            ]),
            m('.w-col.w-col-2', [
                m('.fontsize-smallest', [
                    'Confirmado em: ',
                    (item.confirmed_at ? m('span.fontsize-small.lineheight-tightest', h.momentify(item.confirmed_at)) : '' ),
                ])
            ]),
        ]);
    }
};

export default adminBalanceTransferItem;
