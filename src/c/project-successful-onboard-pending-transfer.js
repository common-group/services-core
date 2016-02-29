/**
 * window.c.ProjectSuccessfulOnboardPendingTransfer component
 * render message about pending transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardPendingTransfer, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

window.c.ProjectSuccessfulOnboardPendingTransfer = ((m, c, h) => {
    return {
        view: (ctrl, args) => {
            const projectTransfer = args.projectTransfer;

            return m('.w-container', [
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6', [
                        m('.u-text-center', [
                            m('img.u-marginbottom-20', {src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c350c5e7d136a016bc34a4_transfer-ok-icon.png', width: 94}),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Transferência bancária em andamento'),
                            m('.fontsize-base.u-marginbottom-30', [
                                'Até o dia 28/02/2015, R$52.000 (taxas já descontadas) estarão em sua conta Banco Itaú, Agência:2810-x, Conta:23232-2. Fique atento no email fulano@gmail.com , pois nossa equipe pode entrar em contato com você se ocorrer algum problema com o banco!'
                            ])
                        ])
                    ]),
                    m('.w-col.w-col-3')
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
