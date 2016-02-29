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
window.c.ProjectSuccessfulOnboardConfirmAccountError = ((m, c, h, _) => {
    return {
        controller: (args) => {
            return {
                errorReasonM: m.prop('')
            };
        },
        view: (ctrl, args) => {
            return m('.w-row.bank-transfer-answer', [
                m('.w-col.w-col-3'),
                m('.w-col.w-col-6', [
                    m('.w-form.bank-transfer-problem.card.u-radius', [
                        m('form', [
                            m('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', {href: 'js:void(0);', onclick: args.changeToAction('start')}),
                            m('label.field-label.fontweight-semibold.u-marginbottom-20', 'O que está errado com seus dados?'),
                            m('textarea.w-input.text-field', {
                                placeholder: 'Nos ajude dizendo o que precisa ser ajustado! Isso vai facilitar o nosso trabalho e poupar seu tempo.',
                                onchange: m.withAttr('value', ctrl.errorReasonM)
                            }),
                            m('.w-row', [
                                m('.w-col.w-col-4'),
                                m('.w-col.w-col-4', [
                                    m('a.w-button.btn.btn-medium', {
                                        href: 'js:void(0);',
                                        onclick: args.addErrorReason(ctrl.errorReasonM)
                                    }, 'Enviar')
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
