import m from 'mithril';
import _ from 'underscore';
import bigCard from './big-card';
import h from '../h';
import addressForm from './address-form';

const I18nScope = _.partial(h.i18nScope, 'users.edit.settings_tab');

const userSettingsAddress = {
    oninit: function(vnode)
    {
        return {};
    },
    view: function(ctrl, args)
    {
        const
            fields = args.fields,
            parsedErrors = args.parsedErrors;

        return m(bigCard, {
            label: window.I18n.t('address_title', I18nScope()),
            label_hint: window.I18n.t('address_subtitle', I18nScope()),
            children: [
                m('.divider.u-marginbottom-20'),
                m(addressForm, { fields, parsedErrors })
            ]
        });
    }
};

export default userSettingsAddress;