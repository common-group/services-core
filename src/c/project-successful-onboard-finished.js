/**
 * window.c.ProjectSuccessfulOnboardFinished component
 * render finished message
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardFinished, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

window.c.ProjectSuccessfulOnboardFinished = ((m, c, h) => {
    return {
        view: (ctrl, args) => {
            const projectTransfer = args.projectTransfer;

            return m('.w-container', [
                m('.w-row.u-marginbottom-40', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6', [
                        m('.u-text-center', [
                            m('img.u-marginbottom-20', {src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c3511ee7d136a016bc34fa_succesful-icon.png', width: 94}),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Boa sorte no seu projeto!'),
                            m('.fontsize-base.u-marginbottom-30', [
                                'Trabalhe sempre o relacionamento com seus apoiadores! Mantenha eles informados do andamento do seu projeto. Não deixe de olhar a seção de pós-projeto do Guia dos Realizadores!',
                            ])
                        ])
                    ]),
                    m('.w-col.w-col-3')
                ])
            ]);
        }
    };
}(window.m, window.c, window.c.h));
