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
window.c.ProjectSuccessfulOnboardConfirmAccountAccept = ((m, c, h, _) => {
    return {
        view: (ctrl, args) => {
            return m('.w-row.bank-transfer-answer', [
                m('.w-col.w-col-3'),
                m('.w-col.w-col-6', [
                    m('.w-form.bank-transfer-confirm.card.u-radius', [
                        m('form', [
                            m('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', {href: 'js:void(0);', onclick: args.changeToAction('start')}),
                            m('label.field-label.fontweight-semibold.u-marginbottom-20', 'Tem certeza?'),
                            m('.fontsize-smaller.u-marginbottom-30', 'Qualquer informação errada nesse momento pode atrasar o repasse dos recursos!'),
                            m('.w-row', [
                                m('.w-col.w-col-4'),
                                m('.w-col.w-col-4', [
                                    m('a.w-button.btn.btn-medium', {
                                        href: 'js:void(0);',
                                        onclick: args.acceptAccount
                                    }, 'Confirmar')
                                ]),
                                m('.w-col.w-col-4')
                            ])
                        ])
                    ])
                ]),
                m('.w-col.w-col-3')
            ]);
        }
    };
}(window.m, window.c, window.c.h, window._));
