/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountActions component
 * render actions to handle with acceptation or decline current bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountActions, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
window.c.ProjectSuccessfulOnboardConfirmAccountActions = ((m, c, h, _) => {
    return {
        view: (ctrl, args) => {
            return m('.w-row.bank-transfer-answer', [
                m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny'),
                m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                    m('a.btn.btn-large', {href: '#confirm_account', onclick: args.changeToAction('accept')}, 'Sim')
                ]),
                m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [
                    m('a.btn.btn-large.btn-terciary', {href: '#error_account', onclick: args.changeToAction('error')}, 'Não')
                ]),
                m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny')
            ]);
        }
    };
}(window.m, window.c, window.c.h, window._));
