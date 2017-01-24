import m from 'mithril';
import I18n from 'i18n-js';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';

const I18nScope = _.partial(h.i18nScope, 'users.edit.email_confirmation');

const CheckEmail = {
    controller(args) {
        const userID = h.getUserID(),
              user = userVM.fetchUser(userID),
              confirmedEmail = m.prop(false),
              hideAlert = m.prop(false);

        return {
            confirmedEmail: confirmedEmail,
            hideAlert: hideAlert,
            user: user,
            checkEmail: () => {
                return m.request({
                    method: 'PUT',
                    url: `/users/${userID}.json`,
                    data: {
                        user: {
                            confirmed_email_at: true
                        }
                    },
                    config: h.setCsrfToken
                }).then((data) => {
                    confirmedEmail(true);
                    window.setTimeout(() => {
                        hideAlert(true);
                        m.redraw(true);
                        console.log(data);
                    }, 4000);
                });
            }
        };
    },

    view(ctrl, args) {
        let user = ctrl.user();
        return ((user && !user.email_active && !ctrl.hideAlert()) ? m('.card-alert.section.u-text-center', { style: (args.menuTransparency ? {'padding-top': '100px'} : {}) },[
            m('.w-container', (ctrl.confirmedEmail() ? [
                m('.fontsize-large.fontweight-semibold', I18n.t('confirmed_title', I18nScope())),
                m('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n.t('confirmed_sub', I18nScope())),
            ] : [
                m('.fontsize-large.fontweight-semibold', I18n.t('hello', I18nScope({name: user.name}))),
                m('.fontsize-large.fontweight-semibold.u-marginbottom-20', I18n.t('hello_sub', I18nScope())),
                m('.fontsize-base.u-marginbottom-10', I18n.t('hello_email', I18nScope({email: user.email}))),
                m('.w-row', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-3', [
                        m('a.btn.btn-medium.btn-terciary.w-button[href="javacript:void(0);"]', {
                            onclick: ctrl.checkEmail
                        }, 'Sim!')
                    ]),
                    m('.w-col.w-col-3', [
                        m(`a.btn.btn-medium.w-button[href="/users/${user.id}/edit#settings"]`,'Editar o email')
                    ]),
                    m('.w-col.w-col-3')
                ])
            ]))
        ]) : m('div'));
    }
};

export default CheckEmail;
