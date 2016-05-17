/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountError component
 * render error form to collect user answer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountError, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard.confirm_account.refuse');

const projectSuccessfulOnboardConfirmAccountError = {
    controller(args) {
        return {
            errorReasonM: m.prop('')
        }
    },
    view(ctrl, args) {
        return m('.w-row.bank-transfer-answer', [
            m('.w-col.w-col-6.w-col-push-3', [
                m('.w-form.bank-transfer-problem.card.u-radius', [
                    m('form', [
                        m('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', {href: '#confirm_account', onclick: args.changeToAction('start')}),
                        m('label.field-label.fontweight-semibold.u-marginbottom-20', I18n.t('title', I18nScope())),
                        m('textarea.w-input.text-field', {
                            placeholder: I18n.t('placeholder', I18nScope()),
                            onchange: m.withAttr('value', ctrl.errorReasonM)
                        }),
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-push-4', [
                                m('a.w-button.btn.btn-medium', {
                                    href: '#confirm_account_refuse',
                                    onclick: args.addErrorReason(ctrl.errorReasonM)
                                }, I18n.t('cta', I18nScope()))
                            ])
                        ])
                    ])
                ])
            ])
        ]);
    }
}

export default projectSuccessfulOnboardConfirmAccountError;
