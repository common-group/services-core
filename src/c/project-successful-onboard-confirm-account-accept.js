/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountAccept component
 * render confirmation message to accept bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountAccept, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard.confirm_account');

const projectSuccessfulOnboardConfirmAccountAccept = {
    view(ctrl, args) {
        return m('.w-row.bank-transfer-answer', [
            m('.w-col.w-col-6.w-col-push-3', [
                m('.w-form.bank-transfer-confirm.card.u-radius', [
                    m('form', [
                        m('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', {href: '#confirm_account', onclick: args.changeToAction('start')}),
                        m('label.field-label.fontweight-semibold.u-marginbottom-20', I18n.t('accept.title', I18nScope())),
                        m('.fontsize-smaller.u-marginbottom-30', I18n.t('accept.info', I18nScope())),
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-push-4', [
                                (!args.acceptAccountLoader() ?
                                 m('a.w-button.btn.btn-medium', {
                                     href: '#accept_account',
                                     onclick: args.acceptAccount
                                 }, I18n.t('accept.cta', I18nScope())) : h.loader())
                            ])
                        ])
                    ])
                ])
            ])
        ]);
    }
}

export default projectSuccessfulOnboardConfirmAccountAccept;
