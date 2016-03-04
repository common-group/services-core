/**
 * window.c.ProjectSuccessfulOnboardErrorAccount component
 * render message about error on account
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardErrorAccount, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

window.c.ProjectSuccessfulOnboardErrorAccount = ((m, c, h) => {
    return {
        view: (ctrl, args) => {
            const projectTransfer = args.projectTransfer,
                  projectAccount = args.projectAccount;

            return m('.w-container', [
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6', [
                        m('.u-text-center', [
                            m('img.u-marginbottom-20', {src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c350fabfc50aef5095c67d_transfer-pending-icon.png', width: 94}),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Transferência bancária pendente'),
                            m('.fontsize-base.u-marginbottom-30', [
                                'Seus dados bancários estavam com alguma informação errada e já fomos notificados sobre esse problema! Fique de olho no ',
                                m('span.fontweight-semibold', projectAccount.user_email),
                                ' , pois vamos resolver esse problema via email!'
                            ])
                        ])
                    ]),
                    m('.w-col.w-col-3')
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
