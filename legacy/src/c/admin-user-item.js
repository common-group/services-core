import m from 'mithril';
import h from '../h';
import adminUser from './admin-user';

const adminUserItem = {
    view: function(ctrl, args) {
        return m(
            '.w-row', [
                m('.w-col.w-col-4', [
                    m.component(adminUser, args)
                ])
            ]
        );
    }
};

export default adminUserItem;
