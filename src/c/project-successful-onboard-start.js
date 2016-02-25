/**
 * window.c.ProjectSuccessfulOnboard component
 * render congratulations message when project is successful and 
 * button to confirm the bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardStart, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

window.c.ProjectSuccessfulOnboardStart = ((m, c, h) => {
    return {
        view: (ctrl, args) => {
            const projectTransfer = args.projectTransfer;

            return m('.w-container', [
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6', [
                        m('.u-text-center', [
                            m('img.u-marginbottom-20', {src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c3508dbfc50aef5095c66a_finish-icon.png', width: 94}),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Parabéns!'),
                            m('.fontsize-base.u-marginbottom-30', [
                                'Seu projeto foi finalizado com sucesso e você tem ',
                                m('span.fontweight-semibold', `R$${h.formatNumber(projectTransfer.total_amount, 2)} `),
                                'para receber (taxas já descontadas)! Para efetuarmos a transferência, precisamos que você nos confirme seus dados bancários.'
                            ]),
                            m('a.btn.btn-large.btn-inline', {href: 'js:void(0);', onclick: args.setStage('confirm_account')}, 'Confirmar dados bancários')
                        ])
                    ]),
                    m('.w-col.w-col-3')
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
